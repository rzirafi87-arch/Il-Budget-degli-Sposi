import os,json,urllib.parse,subprocess,tempfile
u=os.environ.get('SOURCE_URL','');p=urllib.parse.urlparse(u)
if p.scheme not in ('postgres','postgresql') or not p.hostname or not p.password or 'YOUR-PASSWORD' in u:
 print('BACKUP_ACCESS=STOP_INVALID_CONNECTION_STRING');raise SystemExit(1)
ref='vsguhivizuneylqhygfk'
if ref not in p.hostname and ref not in (p.username or ''):
 print('BACKUP_ACCESS=STOP_PROJECT_IDENTITY_NOT_PROVEN');raise SystemExit(1)
env=dict(os.environ,PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=30000',PGCONNECT_TIMEOUT='15',PGDATABASE=u)
try:
 r=subprocess.run(['psql','-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"begin transaction read only;select current_setting('transaction_read_only');select to_regclass('public.events') is not null;rollback;"],env=env,capture_output=True,text=True,timeout=40)
 if r.returncode or '\non\n' not in '\n'+r.stdout or '\nt\n' not in '\n'+r.stdout:
  e=r.stderr.lower();kind='AUTHENTICATION' if 'password authentication failed' in e else 'NETWORK_OR_PERMISSION'
  print('BACKUP_ACCESS=STOP_'+kind);raise SystemExit(1)
 print('BACKUP_ACCESS=PASS_READ_ONLY_CONNECTION;PROJECT=CONFIRMED;NO_DATA_EXPORTED')
except subprocess.TimeoutExpired:
 print('BACKUP_ACCESS=STOP_CONNECTION_TIMEOUT');raise SystemExit(1)
