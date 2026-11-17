import assert from 'node:assert/strict';
import { Client } from 'pg';
const url = process.env.LOCAL_DATABASE_URL;
if (!url || !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname)) throw new Error('Disposable loopback database required');
const first = new Client({ connectionString: url });
const second = new Client({ connectionString: url });
const owner = '58120000-0000-4000-8000-000000000001';
const event = '58120000-0000-4000-8000-000000000002';
const partner = '58120000-0000-4000-8000-000000000003';
const query = 'select public.apply_budget_idea_atomic($1,$2,$3,$4::jsonb)';
const items = prefix => JSON.stringify([1,2].map(n => ({ name: `${prefix}-${n}`, amount: n*100, spend_type: 'common' })));
try {
  await first.connect(); await second.connect();
  await first.query("insert into auth.users(id,email) values($1,'atomic-concurrency-owner@example.invalid'),($2,'atomic-concurrency-partner@example.invalid')", [owner,partner]);
  await first.query("insert into public.events(id,owner_id,event_type) values($1,$2,'wedding')", [event,owner]);
  await first.query("insert into public.event_members(event_id,user_id,role,status) values($1,$2,'partner','active')", [event,partner]);
  await first.query('begin');
  await first.query(query,[event,owner,'it',items('first')]);
  const waiting = second.query(query,[event,partner,'it',items('second')]);
  await first.query('commit');
  await waiting;
  const rows = await first.query('select name from public.budget_items where event_id=$1 order by name',[event]);
  assert.deepEqual(rows.rows.map(r=>r.name),['second-1','second-2']);
  await second.query(query,[event,partner,'it',items('second')]);
  assert.equal((await first.query('select count(*)::int n from public.budget_items where event_id=$1',[event])).rows[0].n,2);
  console.log('PASS: concurrent owner/partner replacements commit complete sets; retry has no duplicates');
} finally {
  await first.query('rollback').catch(()=>{});
  await first.query('delete from public.events where id=$1',[event]).catch(()=>{});
  await first.query('delete from auth.users where id=any($1::uuid[])',[[owner,partner]]).catch(()=>{});
  await Promise.all([first.end(),second.end()]);
}
