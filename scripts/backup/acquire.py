import os,sys,json,subprocess,tempfile,pathlib,hashlib,urllib.parse,urllib.request,tarfile,datetime,secrets,base64,shutil
import psycopg
from psycopg import sql
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
os.umask(0o077)
root=pathlib.Path(tempfile.mkdtemp(prefix='production-backup-')); out=pathlib.Path(os.environ['RUNNER_TEMP'])/'encrypted-backup';out.mkdir(mode=0o700,exist_ok=True)
report={'date_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'production_mutations':False,'db_dump':'STOP','restore':'STOP','storage':'STOP','config':'PARTIAL','limits':['External provider secrets and non-exportable Vercel sensitive values are not included.','Role password hashes excluded; privileged credentials must be re-established securely.']}
def mark_stage(name):
 print('BACKUP_STAGE='+name,flush=True);return name
stage=mark_stage('INIT')
local_db_password=None
PERMISSION_QUERIES={
 'database_properties':"select datdba::regrole::text,pg_encoding_to_char(encoding),datcollate,datctype,datconnlimit from pg_database where datname=current_database()",
 'database_grants':"select case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end as grantee,a.grantor::regrole::text as grantor,a.privilege_type,a.is_grantable from pg_database d cross join lateral aclexplode(coalesce(d.datacl,acldefault('d',d.datdba))) a where d.datname=current_database() order by 1,2,3,4",
 'database_settings':"select case when setrole=0 then null else setrole::regrole::text end as role_name,array(select unnest(setconfig) order by 1)::text as settings from pg_db_role_setting where setdatabase=(select oid from pg_database where datname=current_database()) order by 1 nulls first",
 'role_attributes':"select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,array(select unnest(rolconfig) order by 1)::text as role_settings from pg_roles where rolname !~ '^pg_' order by 1",
 'role_memberships':"select roleid::regrole::text,member::regrole::text,grantor::regrole::text,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3",
 'schema_permissions':"select nspname,nspowner::regrole::text,(select json_agg(json_build_array(a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) order by a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) from aclexplode(coalesce(nspacl,acldefault('n',nspowner))) a)::text from pg_namespace where nspname !~ '^pg_' and nspname <> 'information_schema' order by 1",
 'function_permissions':"select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,p.proowner::regrole::text,(select json_agg(json_build_array(a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) order by a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a)::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname !~ '^pg_' and n.nspname <> 'information_schema' order by 1,2,3",
 'default_permissions':"select defaclrole::regrole::text,defaclnamespace::regnamespace::text,defaclobjtype,(select json_agg(json_build_array(a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) order by a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) from aclexplode(coalesce(defaclacl,'{}'::aclitem[])) a)::text from pg_default_acl order by 1,2,3"
}
def run(args,**kw):
 if args[:2]==['docker','exec'] and '--env-file' not in args and any(x in args for x in ['psql','pg_restore','createdb']):
  extra=['--env','PGOPTIONS=-c search_path=pg_catalog']
  if local_db_password is not None and not any(x.startswith('PGPASSWORD=') for x in args):extra+=['--env','PGPASSWORD='+local_db_password]
  args=args[:2]+extra+args[2:]
 r=subprocess.run(args,capture_output=True,timeout=300,**kw)
 if r.returncode:
  (root/'command-stderr-private.txt').write_bytes(r.stderr or b'')
  msg=(r.stderr or b'').decode(errors='replace').lower()
  print('RESTORE_ERROR_CATEGORIES='+','.join(x for x in ['permission denied','does not exist','already exists','must be owner','extension','role','schema','event trigger','superuser','unrecognized configuration parameter','transaction'] if x in msg))
  raise RuntimeError('COMMAND_FAILED')
 return r.stdout

def manifest(c):
 result={}
 tables=c.execute("select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2").fetchall()
 for n,t in tables:
  q=sql.SQL("select count(*),md5(coalesce(string_agg(h,'' order by h),'')) from (select md5(row_to_json(t)::text) h from {}.{} t) x").format(sql.Identifier(n),sql.Identifier(t))
  result[n+'.'+t]=list(c.execute(q).fetchone())
 policies=c.execute("select schemaname,tablename,policyname,permissive,array(select unnest(roles) order by 1)::text as roles,cmd,qual,with_check from pg_policies order by 1,2,3").fetchall()
 grants=c.execute("select n.nspname,c.relname,c.relowner::regrole::text,(select json_agg(json_build_array(a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) order by a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) from aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 'S'::\"char\" else 'r'::\"char\" end,c.relowner))) a)::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2").fetchall()
 return {'tables':result,'policies':policies,'grants':grants,**{k:c.execute(q).fetchall() for k,q in PERMISSION_QUERIES.items()}}
try:
 stage=mark_stage('SOURCE_IDENTITY');u=urllib.parse.urlparse(os.environ['SOURCE_URL']);ref='vsguhivizuneylqhygfk'
 if ref not in (u.hostname or '') and ref not in (u.username or ''):raise RuntimeError('PROJECT_IDENTITY')
 env={'PGHOST':u.hostname,'PGPORT':str(u.port or 5432),'PGUSER':urllib.parse.unquote(u.username or ''),'PGPASSWORD':urllib.parse.unquote(u.password or ''),'PGDATABASE':urllib.parse.unquote(u.path.lstrip('/') or 'postgres'),'PGSSLMODE':'require','PGOPTIONS':'-c default_transaction_read_only=on','PGCONNECT_TIMEOUT':'15'}
 envfile=root/'connection.env';envfile.write_text(''.join(k+'='+v+'\n' for k,v in env.items()))
 container=run(['docker','ps','--format','{{.Names}}']).decode().splitlines();container=next(x for x in container if x.startswith('supabase_db_'))
 local_info=json.loads(run(['docker','inspect',container]))[0]
 clone_env=dict(x.split('=',1) for x in local_info['Config']['Env'] if '=' in x)
 local_db_password=clone_env.get('POSTGRES_PASSWORD') or clone_env.get('PGPASSWORD')
 if not local_db_password:raise RuntimeError('LOCAL_RESTORE_PASSWORD_UNAVAILABLE')
 stage=mark_stage('CONSISTENT_SNAPSHOT')
 with psycopg.connect(os.environ['SOURCE_URL'],options='-c default_transaction_read_only=on',sslmode='require',connect_timeout=15) as c:
  c.execute('begin isolation level repeatable read read only');c.execute('set local search_path=pg_catalog');snapshot=c.execute('select pg_export_snapshot()').fetchone()[0]
  db_meta=c.execute("select datdba::regrole::text,pg_encoding_to_char(encoding),datcollate,datctype,datconnlimit from pg_database where datname=current_database()").fetchone();db_grants=c.execute("select case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.grantor::regrole::text,a.privilege_type,a.is_grantable from pg_database d cross join lateral aclexplode(coalesce(d.datacl,acldefault('d',d.datdba))) a where d.datname=current_database()").fetchall();db_settings=c.execute("select case when setrole=0 then null else setrole::regrole::text end,setconfig from pg_db_role_setting where setdatabase=(select oid from pg_database where datname=current_database())").fetchall();(root/'database-properties.json').write_text(json.dumps({'metadata':db_meta,'grants':db_grants,'settings':db_settings},default=str));
  extension_versions=c.execute('select e.extname,n.nspname,e.extversion,e.extowner::regrole::text from pg_extension e join pg_namespace n on n.oid=e.extnamespace order by e.extname').fetchall();(root/'extension-versions.json').write_text(json.dumps(extension_versions));wrappers=c.execute("select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid),pg_get_functiondef(p.oid),p.proowner::regrole::text,e.extname,p.oid::regprocedure::text,obj_description(p.oid,'pg_proc') from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_depend d on d.objid=p.oid and d.classid='pg_proc'::regclass and d.deptype='e' join pg_extension e on e.oid=d.refobjid where n.nspname='graphql_public' and p.prokind='f' order by 1,2,3").fetchall();(root/'extension-owned-wrappers.json').write_text(json.dumps(wrappers));before=manifest(c);(root/'database-manifest.json').write_text(json.dumps(before,default=str))
  buckets=c.execute('select row_to_json(b) from storage.buckets b order by id').fetchall();objects=c.execute('select row_to_json(o) from storage.objects o order by bucket_id,name').fetchall()
  (root/'storage-inventory.json').write_text(json.dumps({'buckets':[x[0] for x in buckets],'objects':[x[0] for x in objects]},default=str))
  stage=mark_stage('DATABASE_DUMP')
  with (root/'database.dump').open('wb') as f:
   r=subprocess.run(['docker','exec','--env-file',str(envfile),container,'pg_dump','-Fc','--snapshot='+snapshot],stdout=f,stderr=subprocess.PIPE)
   if r.returncode:
    (root/'dump-stderr-private.txt').write_bytes(r.stderr or b'')
    raise RuntimeError('DUMP_FAILED')
  report['db_dump']='PASS';report['table_count']=len(before['tables']);report['dump_sha256']=hashlib.sha256((root/'database.dump').read_bytes()).hexdigest()
  stage=mark_stage('ROLES_DUMP');roles=run(['docker','exec','--env-file',str(envfile),container,'pg_dumpall','--roles-only','--no-role-passwords']);(root/'roles.sql').write_bytes(roles)
 envfile.unlink()
 stage=mark_stage('STORAGE_DOWNLOAD');key=os.environ.get('STORAGE_KEY','');url='https://'+ref+'.supabase.co/storage/v1/object/'
 report['storage_buckets']=len(buckets)
 req=urllib.request.Request('https://'+ref+'.supabase.co/storage/v1/bucket',headers={'Authorization':'Bearer '+key,'apikey':key})
 with urllib.request.urlopen(req,timeout=30) as resp:bucket_api=json.load(resp)
 if sorted(b['id'] for b in bucket_api)!=sorted(x[0]['id'] for x in buckets):raise RuntimeError('STORAGE_BUCKET_INVENTORY_MISMATCH')
 (root/'storage-bucket-api.json').write_text(json.dumps(bucket_api))
 req=urllib.request.Request('https://'+ref+'.supabase.co/auth/v1/settings',headers={'apikey':key})
 with urllib.request.urlopen(req,timeout=30) as resp:auth_settings=json.load(resp)
 (root/'auth-public-settings.json').write_text(json.dumps(auth_settings))
 (root/'available-recovery-config.json').write_text(json.dumps({'source_database_url':os.environ['SOURCE_URL'],'source_service_role_key':key,'repository_email_keys':{k:os.environ.get(k) or None for k in ['BREVO_API_KEY','RESEND_API_KEY']}}))
 storage_dir=root/'storage';storage_dir.mkdir();files=[]
 for index,(obj,) in enumerate(objects):
  name=urllib.parse.quote(obj['bucket_id']+'/'+obj['name'],safe='/');req=urllib.request.Request(url+name,headers={'Authorization':'Bearer '+key,'apikey':key})
  target=storage_dir/(str(index)+'.bin')
  with urllib.request.urlopen(req,timeout=60) as resp,target.open('wb') as f:shutil.copyfileobj(resp,f)
  files.append({'bucket':obj['bucket_id'],'name':obj['name'],'size':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'archive_path':'storage/'+target.name})
 (root/'storage-files.json').write_text(json.dumps(files));report['storage']='PASS_ACQUIRED';report['storage_files']=len(files)
 stage=mark_stage('STORAGE_CONSISTENCY')
 with psycopg.connect(os.environ['SOURCE_URL'],options='-c default_transaction_read_only=on',sslmode='require',connect_timeout=15) as c:
  after=[x[0] for x in c.execute('select row_to_json(o) from storage.objects o order by bucket_id,name').fetchall()]
  if after!=[x[0] for x in objects]:raise RuntimeError('STORAGE_CHANGED_DURING_BACKUP')
 stage=mark_stage('ISOLATE_RESTORE');networks=json.loads(run(['docker','inspect',container]))[0]['NetworkSettings']['Networks']
 offline_network='production-restore-offline-'+os.environ['GITHUB_RUN_ID']
 run(['docker','network','create','--internal',offline_network])
 run(['docker','network','connect',offline_network,container])
 stage=mark_stage('DETACH_EXTERNAL_NETWORKS')
 for network in networks:run(['docker','network','disconnect',network,container])
 stage=mark_stage('CREATE_OFFLINE_DATABASE')
 # Restore only into a fresh database inside the ephemeral offline container.
 run(['docker','exec',container,'createdb','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-T','template0','--owner='+db_meta[0],'--encoding='+db_meta[1],'--lc-collate='+db_meta[2],'--lc-ctype='+db_meta[3],'production_restore_drill'])
 # Managed extensions are prerequisites, and must match source versions.
 # A default pg_graphql version can omit the source four-argument wrapper.
 stage=mark_stage('RESTORE_EXTENSION_PREREQUISITES')
 def local_sql(query):
  return run(['docker','exec','--env','PGPASSWORD='+local_db_password,'--env','PGOPTIONS=-c search_path=pg_catalog',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-At','-v','ON_ERROR_STOP=1','-c',query]).decode().strip()
 def ident(x):return '\"'+x.replace('\"','\"\"')+'\"'
 def literal(x):return "'"+x.replace("'","''")+"'"
 stage=mark_stage('RESTORE_CLUSTER_ROLES')
 local_roles=set(json.loads(local_sql("select coalesce(json_agg(rolname),'[]') from pg_roles")))
 import re
 role_lines=[]
 for line in roles.decode().splitlines():
  m=re.fullmatch(r'CREATE ROLE (\"(?:[^\"]|\"\")*\"|[^;\s]+);',line)
  if m:
   token=m.group(1);role_name=token[1:-1].replace('\"\"','\"') if token.startswith('\"') else token
   if role_name in local_roles:continue
  role_lines.append(line)
 (root/'roles-restore.sql').write_text('\n'.join(role_lines)+'\n')
 run(['docker','cp',str(root/'roles-restore.sql'),container+':/tmp/roles-restore.sql'])
 run(['docker','exec','--env','PGPASSWORD='+local_db_password,'--env','PGOPTIONS=-c search_path=pg_catalog',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-v','ON_ERROR_STOP=1','-f','/tmp/roles-restore.sql'])
 stage=mark_stage('RESTORE_DATABASE_PROPERTIES')
 local_sql('alter database production_restore_drill connection limit '+str(db_meta[4]))
 local_sql('revoke all on database production_restore_drill from public')
 for grantee,grantor,privilege,grantable in db_grants:
  target='PUBLIC' if grantee=='PUBLIC' else ident(grantee)
  local_sql('set role '+ident(grantor)+';grant '+privilege+' on database production_restore_drill to '+target+(' with grant option' if grantable else '')+';reset role')
 for role,settings in db_settings:
  for setting in settings:
   key,value=setting.split('=',1)
   command=('alter database production_restore_drill' if role is None else 'alter role '+ident(role)+' in database production_restore_drill')
   local_sql(command+' set '+ident(key)+' to '+literal(value))
 stage=mark_stage('RESTORE_EXTENSION_PREREQUISITES')
 report['source_extension_versions']={e:v for e,n,v,owner in extension_versions}
 for extension,schema,version,owner in extension_versions:
  if extension=='plpgsql':continue
  local_sql('create schema if not exists '+ident(schema))
  # Extension-owned functions retain the extension installer's ownership.
  # Grant temporary superuser only to the isolated installer role, restoring it immediately.
  was_superuser=local_sql('select rolsuper from pg_roles where rolname='+literal(owner))=='t'
  if not was_superuser:local_sql('alter role '+ident(owner)+' superuser')
  try:local_sql('set role '+ident(owner)+';create extension if not exists '+ident(extension)+' with schema '+ident(schema)+' version '+literal(version)+';reset role')
  finally:
   if not was_superuser:local_sql('alter role '+ident(owner)+' nosuperuser')
 # Supabase adds wrappers to extension membership outside the extension install SQL.
 # pg_dump omits those definitions; restore them explicitly from the source snapshot.
 stage=mark_stage('RESTORE_PLATFORM_WRAPPERS')
 for schema,name,arguments,definition,owner,extension,canonical_signature,comment in wrappers:
  local_sql('create schema if not exists '+ident(schema))
  local_sql(definition)
  signature=canonical_signature
  local_sql('alter function '+signature+' owner to '+ident(owner))
  local_sql('comment on function '+signature+' is '+(literal(comment) if comment is not None else 'null'))
  member=local_sql("select exists(select 1 from pg_depend where classid='pg_proc'::regclass and objid="+literal(signature)+"::regprocedure and deptype='e')")
  if member!='t':local_sql('alter extension '+ident(extension)+' add function '+signature)
 report['platform_wrappers']=len(wrappers)
 existing=json.loads(local_sql("select coalesce(json_agg(nspname),'[]') from pg_namespace where nspname !~ '^pg_' and nspname <> 'information_schema'"))
 for schema,owner,acl in before['schema_permissions']:
  if schema in existing:local_sql('alter schema '+ident(schema)+' owner to '+ident(owner))
 # Exclude only schema CREATE records already supplied by extension prerequisites.
 # Their ACL records remain in the restore list and are compared after restore.
 run(['docker','cp',str(root/'database.dump'),container+':/tmp/source-production.dump'])
 listing=run(['docker','exec',container,'pg_restore','--list','/tmp/source-production.dump']).decode()
 import re
 filtered=[]
 for line in listing.splitlines():
  m=re.search(r' SCHEMA - (\S+) ',line)
  if m and m.group(1) in existing:line='; prerequisite schema '+line
  filtered.append(line)
 (root/'restore.list').write_text('\n'.join(filtered)+'\n')
 run(['docker','cp',str(root/'restore.list'),container+':/tmp/production-restore.list'])
 stage=mark_stage('RESTORE_DATABASE')
 run(['docker','exec',container,'pg_restore','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','--use-list=/tmp/production-restore.list','--exit-on-error','/tmp/source-production.dump'])
 stage=mark_stage('RESTORE_VERIFY')
 # Use psql in the disconnected container; compare the same table content, policies and ACL inventory.
 def local_query(query):
  return json.loads(run(['docker','exec','--env','PGPASSWORD='+local_db_password,'--env','PGOPTIONS=-c search_path=pg_catalog',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-At','-v','ON_ERROR_STOP=1','-c',query]))
 # Extension install scripts and platform bootstrap can supply different initial ACLs.
 # Replay the complete source permission inventory, then compare it independently.
 stage=mark_stage('RESTORE_SOURCE_OWNERSHIP_AND_ACL')
 def json_rows(query):
  return [list(x.values()) for x in local_query("select coalesce(json_agg(row_to_json(x)),'[]') from ("+query+") x")]
 relation_rows=json_rows("select n.nspname,c.relname,c.relkind::text from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2")
 relation_kinds={(n,name):kind for n,name,kind in relation_rows}
 current_relations=json_rows("select n.nspname,c.relname,coalesce(json_agg(case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end) filter(where a.grantee is not null),'[]')::text from pg_class c join pg_namespace n on n.oid=c.relnamespace left join lateral aclexplode(c.relacl) a on true where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') group by 1,2 order by 1,2")
 current_relation_grantees={(n,name):set(json.loads(acl)) for n,name,acl in current_relations}
 current_functions={(r[0],r[1],r[2]):r for r in json_rows(PERMISSION_QUERIES['function_permissions'])}
 current_schemas={r[0]:r for r in json_rows(PERMISSION_QUERIES['schema_permissions'])}
 commands=['BEGIN;']
 def restore_acl(object_type,target,owner,source_acl,existing_grantees):
  entries=json.loads(source_acl or '[]');grantees=set(existing_grantees)|{x[1] for x in entries}|{'PUBLIC',owner}
  for grantee in sorted(grantees):
   commands.append('REVOKE ALL PRIVILEGES ON '+object_type+' '+target+' FROM '+('PUBLIC' if grantee=='PUBLIC' else ident(grantee))+' CASCADE;')
  for grantor,grantee,privilege,grantable in sorted(entries,key=lambda x:(x[0]!=owner,x[0],x[1],x[2])):
   if grantor!=owner:commands.append('SET ROLE '+ident(grantor)+';')
   commands.append('GRANT '+privilege+' ON '+object_type+' '+target+' TO '+('PUBLIC' if grantee=='PUBLIC' else ident(grantee))+(' WITH GRANT OPTION' if grantable else '')+';')
   if grantor!=owner:commands.append('RESET ROLE;')
 for namespace,name,owner,acl,rls,force in before['grants']:
  kind=relation_kinds[(namespace,name)];target=ident(namespace)+'.'+ident(name)
  commands.append('ALTER '+('SEQUENCE' if kind=='S' else 'VIEW' if kind=='v' else 'TABLE')+' '+target+' OWNER TO '+ident(owner)+';')
  if kind in ('r','p'):
   commands.append('ALTER TABLE '+target+(' ENABLE' if rls else ' DISABLE')+' ROW LEVEL SECURITY;')
   commands.append('ALTER TABLE '+target+(' FORCE' if force else ' NO FORCE')+' ROW LEVEL SECURITY;')
  restore_acl('SEQUENCE' if kind=='S' else 'TABLE',target,owner,acl,current_relation_grantees[(namespace,name)])
 for namespace,name,args,owner,acl in before['function_permissions']:
  target=ident(namespace)+'.'+ident(name)+'('+args+')'
  commands.append('ALTER FUNCTION '+target+' OWNER TO '+ident(owner)+';')
  current=current_functions[(namespace,name,args)]
  restore_acl('FUNCTION',target,owner,acl,{x[1] for x in json.loads(current[4] or '[]')})
 for namespace,owner,acl in before['schema_permissions']:
  target=ident(namespace);commands.append('ALTER SCHEMA '+target+' OWNER TO '+ident(owner)+';')
  restore_acl('SCHEMA',target,owner,acl,{x[1] for x in json.loads(current_schemas[namespace][2] or '[]')})
 commands.append('COMMIT;');(root/'restore-source-permissions.sql').write_text('\n'.join(commands)+'\n')
 run(['docker','cp',str(root/'restore-source-permissions.sql'),container+':/tmp/restore-source-permissions.sql'])
 run(['docker','exec',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-v','ON_ERROR_STOP=1','-f','/tmp/restore-source-permissions.sql'])
 stage=mark_stage('REMOVE_CLONE_ONLY_ROLES')
 expected_roles={row[0] for row in before['role_attributes']}
 actual_roles=set(local_query("select coalesce(json_agg(rolname),'[]') from pg_roles where rolname !~ '^pg_'"))
 extra_roles=actual_roles-expected_roles
 if 'supabase_admin' in extra_roles:raise RuntimeError('SOURCE_ADMIN_ROLE_MISSING')
 databases=local_query("select json_agg(datname) from pg_database where datallowconn")
 for extra_role in sorted(extra_roles):
  for database in databases:
   run(['docker','exec',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d',database,'-v','ON_ERROR_STOP=1','-c','DROP OWNED BY '+ident(extra_role)+' CASCADE'])
  local_sql('DROP ROLE '+ident(extra_role))
 report['clone_only_roles_removed']=len(extra_roles)
 stage=mark_stage('RESTORE_EXACT_ROLE_SETTINGS')
 role_config_commands=['BEGIN;']
 for row in before['role_attributes']:
  role_name=row[0];role_config_commands.append('ALTER ROLE '+ident(role_name)+' RESET ALL;')
  settings=local_query('select to_json('+literal(row[-1])+'::text[])')
  for setting in settings:
   key,value=setting.split('=',1)
   role_config_commands.append('SELECT pg_catalog.set_config('+literal(key)+','+literal(value)+',false);')
   role_config_commands.append('ALTER ROLE '+ident(role_name)+' SET '+ident(key)+(' FROM CURRENT;' if key=='search_path' else ' TO '+literal(value)+';'))
 role_config_commands.append('COMMIT;');(root/'restore-exact-role-settings.sql').write_text('\n'.join(role_config_commands)+'\n')
 run(['docker','cp',str(root/'restore-exact-role-settings.sql'),container+':/tmp/restore-exact-role-settings.sql'])
 run(['docker','exec',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-v','ON_ERROR_STOP=1','-f','/tmp/restore-exact-role-settings.sql'])
 stage=mark_stage('RESTORE_VERIFY')
 for table,expected in before['tables'].items():
  n,t=table.split('.',1);table_ident='"'+n.replace('"','""')+'"."'+t.replace('"','""')+'"'
  actual=local_query("select json_build_array(count(*),md5(coalesce(string_agg(h,'' order by h),''))) from (select md5(row_to_json(t)::text) h from "+table_ident+" t) x")
  if actual!=expected:raise RuntimeError('RESTORED_TABLE_MISMATCH')
 for key,q in [('policies',"select schemaname,tablename,policyname,permissive,array(select unnest(roles) order by 1)::text as roles,cmd,qual,with_check from pg_policies order by 1,2,3"),('grants',"select n.nspname,c.relname,c.relowner::regrole::text,(select json_agg(json_build_array(a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) order by a.grantor::regrole::text,case when a.grantee=0 then 'PUBLIC' else a.grantee::regrole::text end,a.privilege_type,a.is_grantable) from aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 'S'::\"char\" else 'r'::\"char\" end,c.relowner))) a)::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2")]:
  a=local_query('select coalesce(json_agg(row_to_json(x)),\'[]\') from ('+q+') x');a=[list(x.values()) for x in a]
  if json.loads(json.dumps(before[key],default=str))!=a:
   (root/'permissions-diff-private.json').write_text(json.dumps({'kind':key,'source':before[key],'restored':a},default=str));raise RuntimeError('RESTORED_PERMISSIONS_MISMATCH')
 for permission_name,query in PERMISSION_QUERIES.items():
  actual=local_query('select coalesce(json_agg(row_to_json(x)),\'[]\') from ('+query+') x')
  if json.loads(json.dumps(before[permission_name],default=str))!=[list(x.values()) for x in actual]:
   (root/'permissions-diff-private.json').write_text(json.dumps({'kind':permission_name,'source':before[permission_name],'restored':[list(x.values()) for x in actual]},default=str));raise RuntimeError('RESTORED_EXTENDED_PERMISSIONS_MISMATCH')
 # Prove anonymous/no-claim roles cannot read event data in the restored clone.
 for role in ['anon','authenticated']:
  q='begin;set local role '+ident(role)+";select set_config('request.jwt.claims','{}',true);select count(*) from public.events;rollback;"
  check=subprocess.run(['docker','exec','--env','PGPASSWORD='+local_db_password,'--env','PGOPTIONS=-c search_path=pg_catalog',container,'psql','--no-password','-h','/var/run/postgresql','-U','supabase_admin','-d','production_restore_drill','-At','-v','ON_ERROR_STOP=1','-c',q],capture_output=True,text=True)
  if check.returncode and 'permission denied' not in check.stderr.lower():raise RuntimeError('RESTORED_ACCESS_CHECK_ERROR')
  if not check.returncode and '0' not in check.stdout.splitlines():raise RuntimeError('RESTORED_ANONYMOUS_ACCESS_LEAK')
 report['restore_negative_access']='PASS_ANON_AND_AUTHENTICATED_WITHOUT_CLAIMS'
 owner_count=local_query('select count(*) from public.events e join auth.users u on u.id=e.owner_id')
 if owner_count:
  claims="select json_build_object('sub',u.id,'role','authenticated','email',u.email,'email_verified',u.email_confirmed_at is not null)::text from auth.users u where exists(select 1 from public.events e where e.owner_id=u.id) order by u.id limit 1"
  query="begin;select set_config('request.jwt.claims',("+claims+"),true);set local role authenticated;select 'RESTORED_OWNER_ACCESS='||count(*)::text from public.events where owner_id=auth.uid();rollback;"
  output=local_sql(query);line=next((x for x in output.splitlines() if x.startswith('RESTORED_OWNER_ACCESS=')),None)
  if not line or int(line.split('=')[1])<1:raise RuntimeError('RESTORED_OWNER_ACCESS_DENIED')
  report['restore_owner_access']='PASS_EXISTING_OWNER_AUTHORIZED'
 else:report['restore_owner_access']='NOT_VERIFIABLE_NO_AUTH_OWNER_EVENTS'
 report['restore']='PASS_DATABASE_COUNTS_CONTENT_RLS_ACL'
 report['storage']='PASS_EMPTY_INVENTORY_AND_METADATA_RESTORED' if not files else 'PASS_BYTES_ARCHIVED_NOT_SERVICE_RESTORED'
except Exception as e:
 report['failed_stage']=stage;report['failure_class']=type(e).__name__;print('BACKUP_STAGE_STOP='+stage+';DETAILS_PRIVATE_ENCRYPTED')
 # Do not put exception text in logs: it may contain credentials or data.
 (root/'private-error.txt').write_text(str(e))
finally:
 for p in root.glob('connection.env'):p.unlink()
 report['status']='STOP' # Full storage service restore and sensitive config coverage remain mandatory.
 (root/'report.json').write_text(json.dumps(report,indent=2))
 stage=mark_stage('ENCRYPT')
 archive=root.parent/(root.name+'.tar.gz')
 with tarfile.open(archive,'w:gz') as tar:tar.add(root,arcname='production-backup')
 data=archive.read_bytes();key=secrets.token_bytes(32);nonce=secrets.token_bytes(12);pub=serialization.load_pem_public_key(pathlib.Path('scripts/backup/recipient.pem').read_bytes());wrapped=pub.encrypt(key,padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None));cipher=AESGCM(key).encrypt(nonce,data,b'production-backup-v1')
 package={'format':'production-backup-v1','key':base64.b64encode(wrapped).decode(),'nonce':base64.b64encode(nonce).decode(),'ciphertext':base64.b64encode(cipher).decode()};target=out/'Production_20261127.enc';target.write_text(json.dumps(package));archive.unlink();shutil.rmtree(root)
 print('ENCRYPTED_BACKUP_CREATED=YES;SHA256='+hashlib.sha256(target.read_bytes()).hexdigest())
 print('DATABASE='+report['db_dump']+';RESTORE='+report['restore']+';STORAGE='+report['storage']+';CONFIG=PARTIAL;FINAL=STOP')
