import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
const target = new URL(process.env.LOCAL_DATABASE_URL || '');
if (!['localhost', '127.0.0.1'].includes(target.hostname)) throw new Error('Disposable loopback database required');
const args = ['--dbname', target.href, '--no-psqlrc', '-v', 'ON_ERROR_STOP=1', '-Atc'];
const query = sql => execFileSync('psql', [...args, sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const concurrentQuery = sql => promisify(execFile)('psql', [...args, sql]);
const owner = randomUUID(), event = randomUUID();
try {
  query(`insert into auth.users(id,email) values('${owner}','branch54-${owner}@example.invalid')`);
  query(`insert into public.events(id,owner_id,name,event_type) values('${event}','${owner}','QA B54 concurrency','wedding')`);
  // All interpolated values are generated UUIDs, never request input.
  await Promise.all([0, 1].map(index => concurrentQuery(`insert into public.budget_items(event_id,name,country_code,amount) values('${event}','Concurrent ${index}','it',25)`)));
  if (query(`select count(*) from private.event_activations where event_id='${event}'`) !== '1') throw new Error('Activation duplicated');
  if (query(`select count(*) from public.budget_items where event_id='${event}'`) !== '2') throw new Error('Concurrent item missing');
  console.log('B54 concurrent first actions: PASS (one activation, two persisted items)');
} finally {
  query(`delete from public.budget_items where event_id='${event}'; delete from public.events where id='${event}' and owner_id='${owner}'; delete from auth.users where id='${owner}'`);
}
