// Real HTTP regression; isolated identities and objects, always cleaned up.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const marker = `qa-b53-download-${randomUUID()}`;
const eventId = randomUUID();
const path = `${eventId}/${marker}.png`;
let userId;
let failure;
const results = {};
try {
  const bucket = await admin.storage.getBucket('event-documents');
  assert.ifError(bucket.error);
  assert.equal(bucket.data.public, false);
  const email = `${marker}@example.invalid`;
  const password = `Qa!${randomUUID()}9`;
  const user = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(user.error);
  userId = user.data.user.id;
  const browser = createClient(url, key, { auth: { persistSession: false } });
  const auth = await browser.auth.signInWithPassword({ email, password });
  assert.ifError(auth.error);
  assert.ifError((await admin.from('events').insert({ id: eventId, owner_id: userId, name: marker, event_type: 'wedding' })).error);
  const bytes = new Uint8Array([137,80,78,71,13,10,26,10]);
  assert.ifError((await admin.storage.from('event-documents').upload(path, bytes, { contentType: 'image/png', cacheControl: '0' })).error);
  assert.ifError((await admin.from('event_documents').insert({ event_id: eventId, created_by: userId, object_path: path, original_name: 'qa.png', mime_type: 'image/png', file_size: bytes.length })).error);
  const direct = `${url}/storage/v1/object/authenticated/event-documents/${path}`;
  const headers = { apikey: key, Authorization: `Bearer ${auth.data.session.access_token}` };
  for (const state of ['active', 'pending_storage']) {
    assert.ifError((await admin.from('event_documents').update({ deletion_state: state }).eq('object_path', path)).error);
    // Repeat the exact URL to exercise a warmed CDN path as well as no-cache.
    for (const mode of ['default', 'no-store']) {
      const response = await fetch(direct, { headers, cache: mode });
      results[`${state}/${mode}`] = { status: response.status, cacheControl: response.headers.get('cache-control'), cache: response.headers.get('cf-cache-status') };
      await response.arrayBuffer();
    }
  }
  console.log(JSON.stringify({ marker, results }));
  for (const [probe, result] of Object.entries(results)) assert.ok([400,401,403,404].includes(result.status), `${probe}: direct Storage must deny; got ${result.status}`);
} catch (error) {
  failure = error;
} finally {
  assert.ifError((await admin.storage.from('event-documents').remove([path])).error);
  assert.ifError((await admin.from('event_documents').delete().eq('event_id', eventId)).error);
  assert.ifError((await admin.from('events').delete().eq('id', eventId)).error);
  if (userId) assert.ifError((await admin.auth.admin.deleteUser(userId)).error);
  const db = await admin.from('events').select('id', { count: 'exact', head: true }).eq('id', eventId);
  const objects = await admin.storage.from('event-documents').list(eventId);
  assert.ifError(db.error); assert.ifError(objects.error);
  assert.equal(db.count, 0); assert.equal(objects.data.length, 0);
  if (userId) assert.ok((await admin.auth.admin.getUserById(userId)).error);
  console.log('QA_RESIDUE DB=0 Storage=0 Auth=0');
}
if (failure) throw failure;
