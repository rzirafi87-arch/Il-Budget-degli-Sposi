import test from 'node:test';
import assert from 'node:assert/strict';
import { constants, createDecipheriv, createHash, generateKeyPairSync, privateDecrypt } from 'node:crypto';
import { mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CONFIG_SEAL_FORMAT, sealBackupConfig, writeSealedBackupConfig } from '../backup-config-seal.mjs';
import { REQUIRED_AUTH_SECTIONS, REQUIRED_VERCEL_KEYS } from '../backup-config-coverage.mjs';

const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
const public_key_pem = pair.publicKey.export({ format: 'pem', type: 'spki' });
const secret = 'SYNTHETIC_PRIVATE_CONFIG_NEVER_LOG';
const script = fileURLToPath(new URL('../backup-config-seal.mjs', import.meta.url));
const provenance = { source: 'production_export', observed_at: '2026-11-28T10:38:51Z' };
function request(complete = true) {
  return { public_key_pem, bundle: complete ? {
    schema_version: 1, vercel_inventory: [...REQUIRED_VERCEL_KEYS],
    vercel_production: Object.fromEntries(REQUIRED_VERCEL_KEYS.map(key => [key, { state: 'captured', value: secret, provenance }])),
    supabase_auth_export: Object.fromEntries(REQUIRED_AUTH_SECTIONS.map(key => [key, { state: 'captured', value: { setting: secret }, provenance }])),
  } : { schema_version: 1, vercel_inventory: [], private_partial_value: secret } };
}
function decrypt(bytes) {
  const envelope = JSON.parse(bytes);
  assert.equal(envelope.format, CONFIG_SEAL_FORMAT);
  const key = privateDecrypt({ key: pair.privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(envelope.key, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.nonce, 'base64'));
  decipher.setAAD(Buffer.from(envelope.format));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]));
}
async function directory(t) {
  const dir = await mkdtemp(join(tmpdir(), 'config-seal-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
test('roundtrip preserves complete bundle and coverage only inside encrypted envelope', () => {
  const input = request(); const sealed = sealBackupConfig(input);
  assert.deepEqual(decrypt(sealed.bytes).bundle, input.bundle);
  assert.equal(decrypt(sealed.bytes).coverage_report.coverage, 'complete_for_declared_inventory');
  assert.equal(sealed.summary.sha256, createHash('sha256').update(sealed.bytes).digest('hex'));
  assert.equal(sealed.summary.bytes, sealed.bytes.length);
  assert.ok(!sealed.bytes.toString().includes(secret));
  assert.ok(!JSON.stringify(sealed.summary).includes(secret));
  assert.notDeepEqual(sealed.bytes, sealBackupConfig(input).bytes);
});
test('GCM detects tampered ciphertext, tag, nonce and format', () => {
  const sealed = sealBackupConfig(request());
  for (const field of ['ciphertext', 'tag', 'nonce']) {
    const envelope = JSON.parse(sealed.bytes);
    const bytes = Buffer.from(envelope[field], 'base64'); bytes[0] ^= 1;
    envelope[field] = bytes.toString('base64');
    assert.throws(() => decrypt(JSON.stringify(envelope)));
  }
  const envelope = JSON.parse(sealed.bytes); envelope.format = 'different-format';
  assert.throws(() => decrypt(JSON.stringify(envelope)));
});
test('incomplete configuration is encrypted intact without asserting restore PASS', () => {
  const input = request(false); const sealed = sealBackupConfig(input);
  assert.equal(sealed.summary.coverage, 'incomplete');
  assert.equal(sealed.summary.missing_count, 14);
  assert.deepEqual(decrypt(sealed.bytes).bundle, input.bundle);
  assert.ok(decrypt(sealed.bytes).coverage_report.limits.includes('service_restore_unverified'));
});
test('exclusive ciphertext write uses mode 0600 and refuses file or symlink overwrite', async t => {
  const dir = await directory(t); const path = join(dir, 'config.enc');
  await writeSealedBackupConfig(request(), path);
  assert.equal((await stat(path)).mode & 0o777, 0o600);
  const original = await readFile(path);
  await assert.rejects(writeSealedBackupConfig(request(false), path), /^Error: CONFIG_SEAL_FAILED$/);
  assert.deepEqual(await readFile(path), original);
  const link = join(dir, 'linked.enc'); await symlink(path, link);
  await assert.rejects(writeSealedBackupConfig(request(), link), /^Error: CONFIG_SEAL_FAILED$/);
  assert.deepEqual(await readFile(path), original);
});
test('invalid RSA/private keys and malformed input expose only generic failure', () => {
  const privatePem = pair.privateKey.export({ format: 'pem', type: 'pkcs8' });
  const weak = generateKeyPairSync('rsa', { modulusLength: 1024 }).publicKey.export({ format: 'pem', type: 'spki' });
  for (const input of [null, { public_key_pem: secret, bundle: {} }, { public_key_pem: privatePem, bundle: {} }, { public_key_pem: weak, bundle: {} }]) {
    assert.throws(() => sealBackupConfig(input), /^Error: CONFIG_SEAL_FAILED$/);
  }
});
test('encryption failure happens before output creation', async t => {
  const dir = await directory(t); const output = join(dir, 'must-not-exist.enc');
  await assert.rejects(writeSealedBackupConfig({ public_key_pem: secret, bundle: {} }, output), /^Error: CONFIG_SEAL_FAILED$/);
  await assert.rejects(stat(output), { code: 'ENOENT' });
});
test('CLI reads stdin and prints only digest/counts/coverage', async t => {
  const dir = await directory(t); const output = join(dir, 'cli.enc');
  const result = spawnSync(process.execPath, [script, output], { input: JSON.stringify(request()), encoding: 'utf8' });
  assert.equal(result.status, 0); assert.equal(result.stderr, '');
  const summary = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(summary).sort(), ['sha256', 'bytes', 'coverage', 'vercel_count', 'auth_section_count', 'missing_count', 'validation_error_count'].sort());
  assert.ok(!result.stdout.includes(secret)); assert.ok(!result.stdout.includes(output));
  assert.deepEqual(decrypt(await readFile(output)).bundle, request().bundle);
});
test('CLI parse, crypto and filesystem errors never echo input or paths', async t => {
  const dir = await directory(t); const existing = join(dir, secret); await writeFile(existing, 'preserve');
  for (const [input, output] of [[`{ "${secret}"`, join(dir, 'invalid.enc')], [JSON.stringify({ public_key_pem: secret, bundle: {} }), join(dir, 'bad-key.enc')], [JSON.stringify(request()), existing]]) {
    const result = spawnSync(process.execPath, [script, output], { input, encoding: 'utf8' });
    assert.equal(result.status, 1); assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'CONFIG_SEAL_FAILED\n');
    assert.ok(!result.stderr.includes(secret));
  }
  assert.equal(await readFile(existing, 'utf8'), 'preserve');
});
