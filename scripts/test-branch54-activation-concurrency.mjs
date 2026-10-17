import pg from 'pg';
import { randomUUID } from 'node:crypto';
const target = new URL(process.env.LOCAL_DATABASE_URL || '');
if (!['localhost', '127.0.0.1'].includes(target.hostname)) throw new Error('Disposable loopback database required');
const clients = [new pg.Client({ connectionString: target.href }), new pg.Client({ connectionString: target.href })];
const owner = randomUUID(), event = randomUUID();
try {
  await Promise.all(clients.map(client => client.connect()));
  await clients[0].query('insert into auth.users(id,email) values($1,$2)', [owner, `branch54-${owner}@example.invalid`]);
  await clients[0].query("insert into public.events(id,owner_id,name,event_type) values($1,$2,'QA B54 concurrency','wedding')", [event, owner]);
  await Promise.all(clients.map((client, index) => client.query("insert into public.budget_items(event_id,name,country_code,amount) values($1,$2,'it',25)", [event, `Concurrent ${index}`])));
  const result = await clients[0].query('select count(*)::int as count from private.event_activations where event_id=$1', [event]);
  if (result.rows[0].count !== 1) throw new Error('Activation duplicated');
  console.log('B54 concurrent first actions: PASS (one activation, two persisted items)');
} finally {
  try {
    await clients[0].query('delete from public.budget_items where event_id=$1', [event]);
    await clients[0].query('delete from public.events where id=$1 and owner_id=$2', [event, owner]);
    await clients[0].query('delete from auth.users where id=$1', [owner]);
  } finally { await Promise.all(clients.map(client => client.end())); }
}
