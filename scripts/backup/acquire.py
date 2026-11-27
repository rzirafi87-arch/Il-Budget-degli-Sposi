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
def run(args,**kw):
 r=subprocess.run(args,capture_output=True,**kw)
 if r.returncode: raise RuntimeError('COMMAND_FAILED')
 return r.stdout

def manifest(c):
 result={}
 tables=c.execute("select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2").fetchall()
 for n,t in tables:
  q=sql.SQL("select count(*),md5(coalesce(string_agg(h,'' order by h),'')) from (select md5(row_to_json(t)::text) h from {}.{} t) x").format(sql.Identifier(n),sql.Identifier(t))
  result[n+'.'+t]=list(c.execute(q).fetchone())
 policies=c.execute("select schemaname,tablename,policyname,permissive,roles::text,cmd,qual,with_check from pg_policies order by 1,2,3").fetchall()
 grants=c.execute("select n.nspname,c.relname,c.relowner::regrole::text,c.relacl::text,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p','S','v') and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','cron','net') order by 1,2").fetchall()
 return {'tables':result,'policies':policies,'grants':grants}
try:
 stage='SOURCE_IDENTITY';u=urllib.parse.urlparse(os.environ['SOURCE_URL']);ref='vsguhivizuneylqhygfk'
 if ref not in (u.hostname or '') and ref not in (u.username or ''):raise RuntimeError('PROJECT_IDENTITY')
 env={'PGHOST':u.hostname,'PGPORT':str(u.port or 5432),'PGUSER':urllib.parse.unquote(u.username or ''),'PGPASSWORD':urllib.parse.unquote(u.password or ''),'PGDATABASE':urllib.parse.unquote(u.path.lstrip('/') or 'postgres'),'PGSSLMODE':'require','PGOPTIONS':'-c default_transaction_read_only=on','PGCONNECT_TIMEOUT':'15'}
 envfile=root/'connection.env';envfile.write_text(''.join(k+'='+v+'\n' for k,v in env.items()))
 container=run(['docker','ps','--format','{{.Names}}']).decode().splitlines();container=next(x for x in container if x.startswith('supabase_db_'))
 stage='CONSISTENT_SNAPSHOT'
 with psycopg.connect(os.environ['SOURCE_URL'],options='-c default_transaction_read_only=on',sslmode='require',connect_timeout=15) as c:
  c.execute('begin isolation level repeatable read read only');snapshot=c.execute('select pg_export_snapshot()').fetchone()[0]
  before=manifest(c);(root/'database-manifest.json').write_text(json.dumps(before,default=str))
  buckets=c.execute('select row_to_json(b) from storage.buckets b order by id').fetchall();objects=c.execute('select row_to_json(o) from storage.objects o order by bucket_id,name').fetchall()
  (root/'storage-inventory.json').write_text(json.dumps({'buckets':[x[0] for x in buckets],'objects':[x[0] for x in objects]},default=str))
  stage='DATABASE_DUMP'
  with (root/'database.dump').open('wb') as f:
   r=subprocess.run(['docker','exec','--env-file',str(envfile),container,'pg_dump','-Fc','--snapshot='+snapshot],stdout=f,stderr=subprocess.PIPE)
   if r.returncode:raise RuntimeError('DUMP_FAILED')
  report['db_dump']='PASS';report['table_count']=len(before['tables']);report['dump_sha256']=hashlib.sha256((root/'database.dump').read_bytes()).hexdigest()
  stage='ROLES_DUMP';roles=run(['docker','exec','--env-file',str(envfile),container,'pg_dumpall','--roles-only','--no-role-passwords']);(root/'roles.sql').write_bytes(roles)
 envfile.unlink()
 stage='STORAGE_DOWNLOAD';key=os.environ.get('STORAGE_KEY','');url='https://'+ref+'.supabase.co/storage/v1/object/'
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
 stage='RESTORE_DATABASE'
 with (root/'database.dump').open('rb') as f:run(['docker','exec','-i',container,'pg_restore','-U','supabase_admin','-d','production_restore_drill','--exit-on-error'],stdin=f)
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
 report['restore']='PASS_DATABASE_COUNTS_CONTENT_RLS_ACL';report['storage']='PASS_BYTES_ARCHIVED_NOT_SERVICE_RESTORED'
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
