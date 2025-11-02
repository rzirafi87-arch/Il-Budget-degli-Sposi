#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

// Load env from .env.local (priority), then fallback to .env
const candidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: false });
    break;
  }
}

function decodePayload(jwt) {
  try {
    const parts = String(jwt).split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRefFromUrl(url) {
  try {
    const u = new URL(url);
    // hosted supabase: <ref>.supabase.co
    const sub = u.hostname.split('.')[0];
    return sub || null;
  } catch {
    return null;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE;

let ok = true;
if (!url || !anon || !service) {
  console.error('Missing envs. Run scripts/verify-env.mjs first.');
  process.exit(1);
}

const expectedRef = getRefFromUrl(url);
const anonPayload = decodePayload(anon);
const svcPayload = decodePayload(service);

function report(name, payload) {
  const ref = payload?.ref ?? payload?.project_id ?? payload?.projectRef ?? null;
  const role = payload?.role ?? payload?.app_metadata?.role ?? null;
  console.log(`${name}: ref=${ref || 'n/a'} role=${role || 'n/a'}`);
  return ref;
}

console.log(`URL: ${url}`);
console.log(`Expected ref: ${expectedRef || 'n/a'}`);
const anonRef = report('Anon key', anonPayload);
const svcRef = report('Service key', svcPayload);

if (!expectedRef || !anonRef || !svcRef) {
  ok = false;
  console.error('Unable to extract refs from URL/keys.');
}

if (expectedRef && anonRef && expectedRef !== anonRef) {
  ok = false;
  console.error(`Mismatch: URL ref (${expectedRef}) != anon ref (${anonRef})`);
}
if (expectedRef && svcRef && expectedRef !== svcRef) {
  ok = false;
  console.error(`Mismatch: URL ref (${expectedRef}) != service ref (${svcRef})`);
}

if (!ok) {
  console.error('\nFix: copia ANON e SERVICE dal progetto Supabase con ref ' + expectedRef + ' oppure aggiorna l\'URL.');
  process.exit(2);
} else {
  console.log('Supabase URL and keys belong to the same project.');
}

