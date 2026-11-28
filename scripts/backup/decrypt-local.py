"""Offline recovery of the encrypted Production archive. Never run on Production."""
import argparse,base64,io,json,os,pathlib,tarfile
from cryptography.hazmat.primitives import serialization,hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
p=argparse.ArgumentParser();p.add_argument('archive');p.add_argument('private_key');p.add_argument('destination');a=p.parse_args();os.umask(0o077)
dest=pathlib.Path(a.destination)
if dest.exists():raise SystemExit('Destination must not already exist')
j=json.loads(pathlib.Path(a.archive).read_text())
if j.get('format')!='production-backup-v1':raise SystemExit('Unsupported archive format')
private=serialization.load_pem_private_key(pathlib.Path(a.private_key).read_bytes(),password=None)
key=private.decrypt(base64.b64decode(j['key']),padding.OAEP(mgf=padding.MGF1(hashes.SHA256()),algorithm=hashes.SHA256(),label=None))
data=AESGCM(key).decrypt(base64.b64decode(j['nonce']),base64.b64decode(j['ciphertext']),b'production-backup-v1')
dest.mkdir(mode=0o700)
with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tar:tar.extractall(dest,filter='data')
for path in dest.rglob('*'):path.chmod(0o700 if path.is_dir() else 0o600)
print('Archive authenticated and decrypted locally. Protect and remove plaintext after recovery.')
