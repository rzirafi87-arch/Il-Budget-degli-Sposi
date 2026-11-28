/**
 * Offline encrypted configuration collector. CLI:
 *   node scripts/backup-config-seal.mjs /absolute/new-file.enc < protected-input
 * stdin JSON: { bundle: <coverage-v1 bundle>, public_key_pem: <RSA public PEM> }.
 * Never pass bundle/key material as arguments. No network or plaintext files.
 * The complete bundle and structural coverage report are encrypted in memory
 * with a fresh AES-256-GCM key/96-bit nonce; RSA-OAEP/SHA256 wraps that key.
 * Envelope v1 uses the format string as GCM associated data. Fields key, nonce,
 * ciphertext and tag are base64. Recipient must verify GCM before parsing JSON.
 * Only ciphertext is written, using exclusive creation and mode 0600; existing
 * paths/symlinks are not overwritten. stdout contains digest/counts/coverage only.
 * Incomplete bundles are preserved as incomplete, never labelled restore PASS.
 * Errors are deliberately generic, including parser, crypto and filesystem errors.
 * Limits: no source acquisition/authentication, provider-completeness guarantee,
 * private-key custody, durable upload, or Auth service restore test. JS strings
 * cannot be reliably erased from memory. Run in a trusted ephemeral executor.
 */
import { constants, createCipheriv, createHash, createPublicKey, publicEncrypt, randomBytes } from 'node:crypto';
import { open, unlink } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateBackupConfigCoverage } from './backup-config-coverage.mjs';

export const CONFIG_SEAL_FORMAT = 'production-config-backup-v1';
const FAILURE = 'CONFIG_SEAL_FAILED';
const MAX_INPUT_BYTES = 16 * 1024 * 1024;

export function sealBackupConfig(request) {
  let key;
  let plaintext;
  try {
    if (!request || typeof request !== 'object' || !Object.hasOwn(request, 'bundle')
      || typeof request.public_key_pem !== 'string'
      || !/^-----BEGIN (?:RSA )?PUBLIC KEY-----/.test(request.public_key_pem.trim())) throw new Error();
    const recipient = createPublicKey(request.public_key_pem);
    if (recipient.asymmetricKeyType !== 'rsa' || recipient.asymmetricKeyDetails.modulusLength < 2048) throw new Error();
    const report = validateBackupConfigCoverage(request.bundle);
    plaintext = Buffer.from(JSON.stringify({ format: CONFIG_SEAL_FORMAT, bundle: request.bundle, coverage_report: report }));
    if (plaintext.length > MAX_INPUT_BYTES) throw new Error();
    key = randomBytes(32);
    const nonce = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, nonce);
    cipher.setAAD(Buffer.from(CONFIG_SEAL_FORMAT));
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const wrapped = publicEncrypt({ key: recipient, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, key);
    const envelope = {
      format: CONFIG_SEAL_FORMAT, key: wrapped.toString('base64'), nonce: nonce.toString('base64'),
      ciphertext: ciphertext.toString('base64'), tag: cipher.getAuthTag().toString('base64'),
    };
    const bytes = Buffer.from(JSON.stringify(envelope));
    return { bytes, summary: {
      sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length,
      coverage: report.coverage, vercel_count: report.vercel.length,
      auth_section_count: report.auth.length, missing_count: report.missing.length,
      validation_error_count: report.errors.length,
    } };
  } catch {
    throw new Error(FAILURE);
  } finally {
    key?.fill(0);
    plaintext?.fill(0);
  }
}

export async function writeSealedBackupConfig(request, outputPath) {
  let file;
  let created = false;
  try {
    if (typeof outputPath !== 'string' || !isAbsolute(outputPath)) throw new Error();
    // Complete encryption before opening any output file.
    const sealed = sealBackupConfig(request);
    file = await open(outputPath, 'wx', 0o600);
    created = true;
    await file.writeFile(sealed.bytes);
    await file.sync();
    await file.close();
    file = undefined;
    return sealed.summary;
  } catch {
    try { await file?.close(); } catch { /* Do not expose filesystem details. */ }
    if (created) {
      try { await unlink(outputPath); } catch { /* Contains ciphertext only. */ }
    }
    throw new Error(FAILURE);
  }
}

async function main() {
  try {
    if (process.argv.length !== 3) throw new Error();
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > MAX_INPUT_BYTES) throw new Error();
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks);
    let request;
    try { request = JSON.parse(input.toString('utf8')); } finally { input.fill(0); }
    const summary = await writeSealedBackupConfig(request, process.argv[2]);
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } catch {
    process.stderr.write(`${FAILURE}\n`);
    process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
