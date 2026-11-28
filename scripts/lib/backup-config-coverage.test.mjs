import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBackupConfigCoverage, REQUIRED_VERCEL_KEYS, REQUIRED_AUTH_SECTIONS } from '../backup-config-coverage.mjs';
const provenance = { source: 'production_export', observed_at: '2026-11-28T10:38:51Z' };
const captured = value => ({ state: 'captured', value, provenance });
function fixture() {
  return {
    schema_version: 1, vercel_inventory: [...REQUIRED_VERCEL_KEYS, 'POSTGRES_URL'],
    vercel_production: Object.fromEntries([...REQUIRED_VERCEL_KEYS, 'POSTGRES_URL'].map(key => [key, captured('synthetic-private-value')])),
    supabase_auth_export: Object.fromEntries(REQUIRED_AUTH_SECTIONS.map(key => [key, captured({ enabled: false })])),
  };
}
test('complete declared coverage retains independent verification limits and leaks no values', () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const report = validateBackupConfigCoverage(input);
  assert.equal(report.coverage, 'complete_for_declared_inventory');
  assert.deepEqual(report.missing, []);
  assert.ok(report.limits.includes('service_restore_unverified'));
  assert.ok(!JSON.stringify(report).includes('synthetic-private-value'));
  assert.equal(JSON.stringify(input), before);
});
test('missing additional inventory variables and Auth sections remain exact', () => {
  const input = fixture();
  delete input.vercel_production.POSTGRES_URL;
  delete input.supabase_auth_export.signing_recovery;
  const report = validateBackupConfigCoverage(input);
  assert.equal(report.coverage, 'incomplete');
  assert.deepEqual(report.missing, ['vercel.POSTGRES_URL', 'auth.signing_recovery']);
});
test('empty or malformed bundles cannot imply coverage', () => {
  for (const input of [null, [], {}, { schema_version: 1, vercel_inventory: [] }]) {
    const report = validateBackupConfigCoverage(input);
    assert.equal(report.coverage, 'incomplete');
    assert.equal(report.missing.length, 14);
  }
});
test('absence requires explicit provenance and attestation; empty is not absent', () => {
  const input = fixture();
  input.vercel_production.BREVO_API_KEY = { state: 'not_configured', attestation: 'Disabled in original Production configuration', provenance };
  input.supabase_auth_export.hooks = { state: 'not_configured', attestation: 'No hooks configured', provenance };
  assert.equal(validateBackupConfigCoverage(input).coverage, 'complete_for_declared_inventory');
  input.vercel_production.BREVO_API_KEY.value = '';
  input.supabase_auth_export.hooks.attestation = '';
  const report = validateBackupConfigCoverage(input);
  assert.equal(report.vercel.find(row => row.key === 'BREVO_API_KEY').status, 'conflicting_value');
  assert.equal(report.auth.find(row => row.section === 'hooks').status, 'missing_attestation');
});
test('redaction and placeholders cannot become recovered secrets', () => {
  for (const value of ['', ' ', '***', 'REDACTED', 'masked', '<secret>', '${SECRET}', 'TODO', 'undefined']) {
    const input = fixture();
    input.vercel_production.RESEND_API_KEY.value = value;
    assert.ok(validateBackupConfigCoverage(input).missing.includes('vercel.RESEND_API_KEY'));
  }
});
test('candidate QA secrets and invalid provenance do not attest Production originals', () => {
  for (const invalid of [{ source: 'repository_qa', observed_at: provenance.observed_at }, { source: 'production_export', observed_at: 'yesterday' }]) {
    const input = fixture();
    input.vercel_production.EMAIL_FROM.provenance = invalid;
    assert.equal(validateBackupConfigCoverage(input).vercel.find(row => row.key === 'EMAIL_FROM').status, 'invalid_provenance');
  }
});
test('invalid inventory cannot inject arbitrary content into safe reports', () => {
  const input = fixture();
  input.vercel_inventory.push('accidental secret = never echo');
  const report = validateBackupConfigCoverage(input);
  assert.equal(report.coverage, 'incomplete');
  assert.ok(report.errors.includes('invalid_vercel_inventory'));
  assert.ok(!JSON.stringify(report).includes('never echo'));
});
test('duplicate and incomplete authoritative inventory are rejected', () => {
  const input = fixture();
  input.vercel_inventory.push('POSTGRES_URL');
  assert.ok(validateBackupConfigCoverage(input).errors.includes('invalid_vercel_inventory'));
  input.vercel_inventory = ['POSTGRES_URL'];
  assert.deepEqual(validateBackupConfigCoverage(input).required_keys_absent_from_inventory, REQUIRED_VERCEL_KEYS);
});
test('empty, cyclic and non-JSON Auth section values are rejected without printing them', () => {
  const cycle = {}; cycle.self = cycle;
  for (const value of [{}, cycle, { secret: undefined }, { value: Infinity }]) {
    const input = fixture(); input.supabase_auth_export.settings.value = value;
    const report = validateBackupConfigCoverage(input);
    assert.ok(report.missing.includes('auth.settings'));
  }
});
