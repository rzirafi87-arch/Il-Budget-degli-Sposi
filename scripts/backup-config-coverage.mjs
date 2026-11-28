/**
 * Pure, offline structural coverage check; no network, filesystem or logging.
 * Input contract (schema_version: 1):
 * - vercel_inventory: authoritative Production variable names (all seven
 *   REQUIRED_VERCEL_KEYS must appear; additional inventory keys are checked).
 * - vercel_production: entries keyed by inventory name. Each entry has state
 *   "captured", a nonempty string value and provenance; or "not_configured"
 *   with a nonempty attestation and provenance. Provenance requires source
 *   "production_export" or "original_configuration" and ISO observed_at.
 * - supabase_auth_export: normalized entries for every REQUIRED_AUTH_SECTION,
 *   using the same states/provenance. Captured values are nonempty JSON objects
 *   (the original exported settings for that section). Disabled sections need
 *   explicit not_configured attestations, never empty objects/placeholders.
 * This checks declared coverage, NOT authenticity, completeness of provider
 * exports, secret validity, encryption, persistence or recoverability. A caller
 * must separately verify the original inventory and isolated service recovery.
 * Returned data contains only fixed labels and validated variable names. Never
 * return/stringify input values, attestations, provenance or parser exceptions.
 */
export const REQUIRED_VERCEL_KEYS = Object.freeze([
  'EMAIL_PROVIDER', 'EMAIL_FROM', 'EMAIL_FROM_NAME', 'BREVO_API_KEY',
  'RESEND_API_KEY', 'SUPABASE_SECRET_KEY', 'SUPABASE_JWT_SECRET',
]);
export const REQUIRED_AUTH_SECTIONS = Object.freeze([
  'settings', 'email_templates', 'sessions', 'rate_limits', 'mfa', 'hooks',
  'signing_recovery',
]);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const placeholder = value => /^(?:\*+|redacted|masked|undefined|null|todo|placeholder|<[^>]*>|\$\{[^}]*\})$/i.test(value.trim());
const validName = value => typeof value === 'string' && /^[A-Z][A-Z0-9_]{0,79}$/.test(value);
function provenance(entry) {
  return object(entry.provenance)
    && ['production_export', 'original_configuration'].includes(entry.provenance.source)
    && typeof entry.provenance.observed_at === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(entry.provenance.observed_at)
    && Number.isFinite(Date.parse(entry.provenance.observed_at));
}
function entryStatus(entry, kind) {
  if (!object(entry)) return 'missing';
  if (!provenance(entry)) return 'invalid_provenance';
  if (entry.state === 'not_configured') {
    if (own(entry, 'value')) return 'conflicting_value';
    return text(entry.attestation) && !placeholder(entry.attestation)
      ? 'attested_not_configured' : 'missing_attestation';
  }
  if (entry.state !== 'captured') return 'invalid_state';
  if (own(entry, 'attestation')) return 'conflicting_attestation';
  if (kind === 'vercel') return text(entry.value) && !placeholder(entry.value) ? 'captured' : 'invalid_value';
  if (!object(entry.value) || Object.keys(entry.value).length === 0) return 'invalid_value';
  // Require JSON data, rejecting cycles, undefined, functions and nonfinite numbers.
  const ancestors = new Set();
  function json(value) {
    if (value === null || typeof value === 'boolean' || typeof value === 'string') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (!object(value) && !Array.isArray(value)) return false;
    if (ancestors.has(value)) return false;
    ancestors.add(value);
    const valid = Object.values(value).every(json);
    ancestors.delete(value);
    return valid;
  }
  return json(entry.value) ? 'captured' : 'invalid_value';
}
export function validateBackupConfigCoverage(bundle) {
  const errors = [];
  const input = object(bundle) ? bundle : {};
  if (input.schema_version !== 1) errors.push('unsupported_schema_version');
  const inventoryValid = Array.isArray(input.vercel_inventory)
    && input.vercel_inventory.every(validName)
    && new Set(input.vercel_inventory).size === input.vercel_inventory.length;
  if (!inventoryValid) errors.push('invalid_vercel_inventory');
  const inventory = inventoryValid ? input.vercel_inventory : [];
  const absentInventory = REQUIRED_VERCEL_KEYS.filter(key => !inventory.includes(key));
  if (absentInventory.length) errors.push('required_keys_absent_from_inventory');
  const vercel = object(input.vercel_production) ? input.vercel_production : {};
  const auth = object(input.supabase_auth_export) ? input.supabase_auth_export : {};
  const keys = [...new Set([...REQUIRED_VERCEL_KEYS, ...inventory])].sort();
  const vercelCoverage = keys.map(key => ({ key, status: entryStatus(own(vercel, key) ? vercel[key] : undefined, 'vercel') }));
  const authCoverage = REQUIRED_AUTH_SECTIONS.map(section => ({ section, status: entryStatus(own(auth, section) ? auth[section] : undefined, 'auth') }));
  const covered = status => status === 'captured' || status === 'attested_not_configured';
  const missing = [
    ...vercelCoverage.filter(row => !covered(row.status)).map(row => `vercel.${row.key}`),
    ...authCoverage.filter(row => !covered(row.status)).map(row => `auth.${row.section}`),
  ];
  return {
    schema_version: 1,
    coverage: errors.length || missing.length ? 'incomplete' : 'complete_for_declared_inventory',
    errors, required_keys_absent_from_inventory: absentInventory,
    vercel: vercelCoverage, auth: authCoverage, missing,
    limits: ['inventory_authenticity_unverified', 'provider_export_completeness_unverified',
      'secret_validity_unverified', 'encryption_and_persistence_unverified', 'service_restore_unverified'],
  };
}
