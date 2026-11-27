import os,urllib.parse,subprocess
for label,variable in [('CURRENT','SOURCE_URL'),('EXISTING','EXISTING_SOURCE_URL')]:
 u=os.environ.get(variable,'')
 try:p=urllib.parse.urlparse(u);valid=p.scheme in ('postgres','postgresql') and p.hostname and p.password and 'YOUR-PASSWORD' not in u
 except ValueError:valid=False
 if not valid:print('BACKUP_ACCESS_'+label+'=STOP_INVALID_CONNECTION_STRING');continue
 ref='vsguhivizuneylqhygfk'
 if ref not in p.hostname and ref not in (p.username or ''):print('BACKUP_ACCESS_'+label+'=STOP_PROJECT_IDENTITY_NOT_PROVEN');continue
 env=dict(os.environ,PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=30000',PGCONNECT_TIMEOUT='10',PGHOST=p.hostname,PGPORT=str(p.port or 5432),PGUSER=urllib.parse.unquote(p.username or ''),PGPASSWORD=urllib.parse.unquote(p.password or ''),PGDATABASE=urllib.parse.unquote(p.path.lstrip('/') or 'postgres'),PGSSLMODE='require')
 try:
  r=subprocess.run(['psql','-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"begin transaction read only;select current_setting('transaction_read_only');select to_regclass('public.events') is not null;rollback;"],env=env,capture_output=True,text=True,timeout=35)
  if not r.returncode and '\non\n' in '\n'+r.stdout and '\nt\n' in '\n'+r.stdout:print('BACKUP_ACCESS_'+label+'=PASS_READ_ONLY_CONNECTION;NO_DATA_EXPORTED');raise SystemExit(0)
  e=r.stderr.lower();kind='OTHER_PERMISSION_OR_OUTPUT';print('DIAGNOSTIC_'+label+'='+','.join(word for word in ['client','install','cluster','invalid','parameter','options','unsupported','authentication','ssl','connection','error','fatal','password','certificate','timeout','unreachable','resolve'] if word in e)+';EXIT='+str(r.returncode))
  for needle,result in [('password authentication failed','AUTHENTICATION'),('network is unreachable','NETWORK_UNREACHABLE'),('could not translate host name','DNS'),('tenant or user not found','POOLER_TENANT_OR_USER'),('timeout','TIMEOUT'),('certificate','TLS'),('permission denied','PERMISSION'),('no password supplied','PASSWORD_MISSING'),('too many clients','CONNECTION_LIMIT'),('connection refused','CONNECTION_REFUSED')]:
   if needle in e:kind=result;break
  print('BACKUP_ACCESS_'+label+'=STOP_'+kind)
 except subprocess.TimeoutExpired:print('BACKUP_ACCESS_'+label+'=STOP_TIMEOUT')
raise SystemExit(1)
