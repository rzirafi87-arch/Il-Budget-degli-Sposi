// Run with PGLITE_MODULE pointing to an installed @electric-sql/pglite entry.
// This isolated PostgreSQL check complements, and does not replace, Supabase QA.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create schema auth;
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create table public.events(id uuid primary key,owner_id uuid,event_type text,public_id text,name text,event_date date,total_budget numeric,language text,country text);
create table public.baptism_family_plans(event_id uuid primary key references public.events(id),revision integer default 1,plan jsonb);
create table public.guests(id uuid primary key,event_id uuid,name text,guest_type text,rsvp_received boolean,attending boolean,menu_preferences text[],allergies_intolerances text,created_at timestamptz default now());
create table public.expenses(id uuid primary key,event_id uuid,description text,amount numeric,paid_amount numeric,payment_installments jsonb,is_enabled boolean,spend_type text,status text,inserted_at timestamptz default now());`);
await db.exec(await readFile('supabase/migrations/20261119090102_baptism_family_validation.sql','utf8'));
const owner=randomUUID(),other=randomUUID(),id=randomUUID();
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
const p={version:2,name:'Vittoria',budget:'1500',ceremony:'2027-04-18T10:30',scenario:'lunch',time:'2027-04-18T13:00',adults:22,companions:2,children:5,noMeal:1,guests:[{id:randomUUID(),name:'Elena',kind:'adult',ceremony:'yes',reception:'pending',menu:'adult',food:'private',companionOf:''}],costs:[{id:randomUUID(),name:'Pranzo',scope:'reception',enabled:true,quantity:22,unitCost:38,payments:[{id:randomUUID(),amount:150,date:'2027-01-01'}]}]};
const save=async(rev,plan=p)=>(await db.query('select public.save_family_baptism($1,$2,$3::jsonb) as rev',[id,rev,JSON.stringify(plan)])).rows[0].rev;
// Invalid optional-looking enums must not become SQL NULL and bypass checks.
for(const key of ['scenario']) { const bad={...p};delete bad[key];await assert.rejects(()=>save(0,bad),/INVALID_BAPTISM/); }
for(const key of ['ceremony','reception','menu','kind']) { const g={...p.guests[0]};delete g[key];await assert.rejects(()=>save(0,{...p,guests:[g]}),/INVALID_BAPTISM_GUEST/); }
const badCost={...p.costs[0]};delete badCost.scope;await assert.rejects(()=>save(0,{...p,costs:[badCost]}),/INVALID_BAPTISM_COST/);
assert.equal((await db.query('select count(*)::int as n from events')).rows[0].n,0,'invalid snapshots roll back event creation');
const rev=await save(0);assert.equal(await save(0),rev,'creation replay is idempotent');
let row=(await db.query('select public.read_family_baptism($1) as r',[id])).rows[0].r;
assert.equal(row.plan.costs[0].payments[0].amount,150);assert.equal(row.plan.guests[0].ceremony,'yes');
assert.equal((await db.query('select amount::float as amount from expenses')).rows[0].amount,836);
assert.equal((await db.query("select plan ? 'costs' as duplicated from baptism_family_plans")).rows[0].duplicated,false);
const solo={...p,scenario:'solo'};const next=await save(rev,solo);assert.ok(next>rev);
assert.equal((await db.query('select amount::float as amount,paid_amount::float as paid from expenses')).rows[0].amount,0);
assert.equal((await db.query('select paid_amount::float as paid from expenses')).rows[0].paid,150);
await assert.rejects(()=>save(rev,{...p,name:'Changed'}),/BAPTISM_CONFLICT/);
await assert.rejects(()=>save(next,{...solo,costs:[]}),/BAPTISM_PAID_COST_REMOVAL/);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[other]);
await assert.rejects(()=>save(next,solo),/EVENT_UNAVAILABLE/);
await assert.rejects(()=>db.query('select public.read_family_baptism($1)',[id]),/EVENT_UNAVAILABLE/);
console.log('PASS: SQL syntax, canonical ledgers, replay, revision conflicts, paid-cost retention and owner checks');
await db.close();
