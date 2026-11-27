import os,sys,json,subprocess,tempfile,pathlib,hashlib,urllib.parse,urllib.request,tarfile,datetime,secrets,base64,shutil
import psycopg
from psycopg import sql
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
os.umask(0o077)
root=pathlib.Path(tempfile.mkdtemp(prefix='production-backup-')); out=pathlib.Path(os.environ['RUNNER_TEMP'])/'encrypted-backup';out.mkdir(mode=0o700,exist_ok=True)
report={'date_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'production_mutations':False,'db_dump':'STOP','restore':'STOP','storage':'STOP','config':'PARTIAL','limits':['External provider secrets and non-exportable Vercel sensitive values are not included.','Role password hashes excluded; privileged credentials must be re-established securely.']}
stage='INIT'
PERMISSION_QUERIES={
 'schema_permissions':"select nspname,nspowner::regrole::text,nspacl::text from pg_namespace where nspname !~ '^pg_' and nspname <> 'information_schema' order by 1",
 'function_permissions':"select n.nspname,p.proname,pg_get_function_identity_arguments(p.oid) as arguments,p.proowner::regrole::text,p.proacl::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname !~ '^pg_' and n.nspname <> 'information_schema' order by 1,2,3",
 'default_permissions':"select defaclrole::regrole::text,defaclnamespace::regnamespace::text,defaclobjtype,defaclacl::text from pg_default_acl order by 1,2,3"
}
def run(args,**kw):
 r=subprocess.run(args,capture_output=True,**kw)
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
 policies=c.execute("select schemaname,tablename,policyname,permissive,roles::text,cmd,qual,with_check from pg_policies order by 1,2,3").fetchall()
 grants=c.execute("select n.nspname,c.relname,c.relowner::regrole::text,c.relacl::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2").fetchall()
 return {'tables':result,'policies':policies,'grants':grants,**{k:c.execute(q).fetchall() for k,q in PERMISSION_QUERIES.items()}}
try:
 stage='SOURCE_IDENTITY';u=urllib.parse.urlparse(os.environ['SOURCE_URL']);ref='vsguhivizuneylqhygfk'
 if ref not in (u.hostname or '') and ref not in (u.username or ''):raise RuntimeError('PROJECT_IDENTITY')
 env={'PGHOST':u.hostname,'PGPORT':str(u.port or 5432),'PGUSER':urllib.parse.unquote(u.username or ''),'PGPASSWORD':urllib.parse.unquote(u.password or ''),'PGDATABASE':urllib.parse.unquote(u.path.lstrip('/') or 'postgres'),'PGSSLMODE':'require','PGOPTIONS':'-c default_transaction_read_only=on','PGCONNECT_TIMEOUT':'15'}
 envfile=root/'connection.env';envfile.write_text(''.join(k+'='+v+'\n' for k,v in env.items()))
 container=run(['docker','ps','--format','{{.Names}}']).decode().splitlines();container=next(x for x in container if x.startswith('supabase_db_'))
 stage='CONSISTENT_SNAPSHOT'
 with psycopg.connect(os.environ['SOURCE_URL'],options='-c default_transaction_read_only=on',sslmode='require',connect_timeout=15) as c:
  c.execute('begin isolation level repeatable read read only');snapshot=c.execute('select pg_export_snapshot()').fetchone()[0]
  extension_versions=c.execute('select e.extname,n.nspname,e.extversion from pg_extension e join pg_namespace n on n.oid=e.extnamespace order by e.extname').fetchall();(root/'extension-versions.json').write_text(json.dumps(extension_versions));before=manifest(c);(root/'database-manifest.json').write_text(json.dumps(before,default=str))
  buckets=c.execute('select row_to_json(b) from storage.buckets b order by id').fetchall();objects=c.execute('select row_to_json(o) from storage.objects o order by bucket_id,name').fetchall()
  (root/'storage-inventory.json').write_text(json.dumps({'buckets':[x[0] for x in buckets],'objects':[x[0] for x in objects]},default=str))
  stage='DATABASE_DUMP'
  with (root/'database.dump').open('wb') as f:
   r=subprocess.run(['docker','exec','--env-file',str(envfile),container,'pg_dump','-Fc','--snapshot='+snapshot],stdout=f,stderr=subprocess.PIPE)
   if r.returncode:
    (root/'dump-stderr-private.txt').write_bytes(r.stderr or b'')
    raise RuntimeError('DUMP_FAILED')
  report['db_dump']='PASS';report['table_count']=len(before['tables']);report['dump_sha256']=hashlib.sha256((root/'database.dump').read_bytes()).hexdigest()
  stage='ROLES_DUMP';roles=run(['docker','exec','--env-file',str(envfile),container,'pg_dumpall','--roles-only','--no-role-passwords']);(root/'roles.sql').write_bytes(roles)
 envfile.unlink()
 stage='STORAGE_DOWNLOAD';key=os.environ.get('STORAGE_KEY','');url='https://'+ref+'.supabase.co/storage/v1/object/'
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
 stage='STORAGE_CONSISTENCY'
 with psycopg.connect(os.environ['SOURCE_URL'],options='-c default_transaction_read_only=on',sslmode='require',connect_timeout=15) as c:
  after=[x[0] for x in c.execute('select row_to_json(o) from storage.objects o order by bucket_id,name').fetchall()]
  if after!=[x[0] for x in objects]:raise RuntimeError('STORAGE_CHANGED_DURING_BACKUP')
 stage='ISOLATE_RESTORE';networks=json.loads(run(['docker','inspect',container]))[0]['NetworkSettings']['Networks']
 for network in networks:run(['docker','network','disconnect',network,container])
 # Restore only into a fresh database inside the ephemeral offline container.
 run(['docker','exec',container,'createdb','-U','supabase_admin','-T','template0','production_restore_drill'])
 # Managed extensions are prerequisites, and must match source versions.
 # A default pg_graphql version can omit the source four-argument wrapper.
 stage='RESTORE_EXTENSION_PREREQUISITES'
 def local_sql(query):
  return run(['docker','exec',container,'psql','-U','supabase_admin','-d','production_restore_drill','-At','-v','ON_ERROR_STOP=1','-c',query]).decode().strip()
 def ident(x):return '\"'+x.replace('\"','\"\"')+'\"'
 def literal(x):return "'"+x.replace("'","''")+"'"
 report['source_extension_versions']={e:v for e,n,v in extension_versions}
 for extension,schema,version in extension_versions:
  if extension=='plpgsql':continue
  local_sql('create schema if not exists '+ident(schema))
  local_sql('create extension if not exists '+ident(extension)+' with schema '+ident(schema)+' version '+literal(version))
 existing=json.loads(local_sql("select coalesce(json_agg(nspname),'[]') from pg_namespace where nspname !~ '^pg_' and nspname <> 'information_schema'"))
 for schema,owner,acl in before['schema_permissions']:
  if schema in existing:local_sql('alter schema '+ident(schema)+' owner to '+ident(owner))
 # Exclude only schema CREATE records already supplied by extension prerequisites.
 # Their ACL records remain in the restore list and are compared after restore.
 listing=run(['docker','exec','-i',container,'pg_restore','--list'],input=(root/'database.dump').read_bytes()).decode()
 import re
 filtered=[]
 for line in listing.splitlines():
  m=re.search(r' SCHEMA - (\S+) ',line)
  if m and m.group(1) in existing:line='; prerequisite schema '+line
  filtered.append(line)
 (root/'restore.list').write_text('\n'.join(filtered)+'\n')
 run(['docker','cp',str(root/'restore.list'),container+':/tmp/production-restore.list'])
 stage='RESTORE_DATABASE'
 with (root/'database.dump').open('rb') as f:run(['docker','exec','-i',container,'pg_restore','-U','supabase_admin','-d','production_restore_drill','--use-list=/tmp/production-restore.list','--exit-on-error'],stdin=f)
 stage='RESTORE_VERIFY'
 # Use psql in the disconnected container; compare the same table content, policies and ACL inventory.
 def local_query(query):
  return json.loads(run(['docker','exec',container,'psql','-U','supabase_admin','-d','production_restore_drill','-At','-v','ON_ERROR_STOP=1','-c',query]))
 for table,expected in before['tables'].items():
  n,t=table.split('.',1);ident='"'+n.replace('"','""')+'"."'+t.replace('"','""')+'"'
  actual=local_query("select json_build_array(count(*),md5(coalesce(string_agg(h,'' order by h),''))) from (select md5(row_to_json(t)::text) h from "+ident+" t) x")
  if actual!=expected:raise RuntimeError('RESTORED_TABLE_MISMATCH')
 for key,q in [('policies',"select schemaname,tablename,policyname,permissive,roles::text,cmd,qual,with_check from pg_policies order by 1,2,3"),('grants',"select n.nspname,c.relname,c.relowner::regrole::text,c.relacl::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2")]:
  a=local_query('select coalesce(json_agg(row_to_json(x)),\'[]\') from ('+q+') x');a=[list(x.values()) for x in a]
  if json.loads(json.dumps(before[key],default=str))!=a:raise RuntimeError('RESTORED_PERMISSIONS_MISMATCH')
 for permission_name,query in PERMISSION_QUERIES.items():
  actual=local_query('select coalesce(json_agg(row_to_json(x)),\'[]\') from ('+query+') x')
  if json.loads(json.dumps(before[permission_name],default=str))!=[list(x.values()) for x in actual]:raise RuntimeError('RESTORED_EXTENDED_PERMISSIONS_MISMATCH')
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
 stage='ENCRYPT'
 archive=root.parent/(root.name+'.tar.gz')
 with tarfile.open(archive,'w:gz') as tar:tar.add(root,arcname='production-backup')
 data=archive.read_bytes();key=secrets.token_bytes(32);nonce=secrets.token_bytes(12);pub=serialization.load_pem_public_key(pathlib.Path('scripts/backup/recipient.pem').read_bytes());wrapped=pub.encrypt(key,padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None));cipher=AESGCM(key).encrypt(nonce,data,b'production-backup-v1')
 package={'format':'production-backup-v1','key':base64.b64encode(wrapped).decode(),'nonce':base64.b64encode(nonce).decode(),'ciphertext':base64.b64encode(cipher).decode()};target=out/'Production_20261127.enc';target.write_text(json.dumps(package));archive.unlink();shutil.rmtree(root)
 print('ENCRYPTED_BACKUP_CREATED=YES;SHA256='+hashlib.sha256(target.read_bytes()).hexdigest())
 print('DATABASE='+report['db_dump']+';RESTORE='+report['restore']+';STORAGE='+report['storage']+';CONFIG=PARTIAL;FINAL=STOP')
