create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(35);

select has_table('public', 'gift_list_items', 'persistent gift list table exists');
select is(
  (select count(*)::int from information_schema.columns where table_schema = 'public' and table_name = 'gift_list_items'
   and column_name in ('id','event_id','created_by','type','name','description','url','target_amount','priority','status','note','created_at','updated_at')),
  13,
  'gift list has the expected informational columns'
);
select is((select count(*)::int from pg_constraint where conrelid = 'public.gift_list_items'::regclass and contype = 'f'), 2, 'gift list has event and creator foreign keys');
select ok((select relrowsecurity from pg_class where oid = 'public.gift_list_items'::regclass), 'gift list has RLS enabled');
select is((select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'gift_list_items'), 4, 'gift list has CRUD event policies');
select ok(not has_table_privilege('anon','public.gift_list_items','select'), 'anonymous has no select grant');
select ok(not has_table_privilege('anon','public.gift_list_items','insert'), 'anonymous has no insert grant');
select ok(not has_table_privilege('anon','public.gift_list_items','update'), 'anonymous has no update grant');
select ok(not has_table_privilege('anon','public.gift_list_items','delete'), 'anonymous has no delete grant');
select ok(
  has_table_privilege('authenticated','public.gift_list_items','select')
  and has_table_privilege('authenticated','public.gift_list_items','insert')
  and has_table_privilege('authenticated','public.gift_list_items','update')
  and has_table_privilege('authenticated','public.gift_list_items','delete'),
  'authenticated role has only the CRUD grants governed by RLS'
);
select is(
  (select count(*)::int from information_schema.columns where table_schema = 'public' and table_name = 'gift_list_items'
   and column_name in ('iban','bank_account','checkout_id','payment_id','purchased_by','purchased_at','contribution_amount')),
  0,
  'gift list contains no payment or external purchase tracking fields'
);
select is((select count(*)::int from pg_trigger where tgrelid = 'public.gift_list_items'::regclass and tgname = 'update_gift_list_items_updated_at' and not tgisinternal), 1, 'gift list maintains updated_at');
select is((select count(*)::int from pg_indexes where schemaname = 'public' and tablename = 'gift_list_items'), 3, 'gift list has primary and event indexes');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('53200000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner53gifts@example.invalid','',now(),now(),now()),
('53200000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner53gifts@example.invalid','',now(),now(),now()),
('53200000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked53gifts@example.invalid','',now(),now(),now()),
('53200000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger53gifts@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name,event_type) values
('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','Gift event A','wedding'),
('53200000-0000-4000-8000-000000000011','53200000-0000-4000-8000-000000000004','Gift event B','wedding');
insert into public.event_members(event_id,user_id,role,status) values
('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000002','partner','active'),
('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000003','partner','revoked')
on conflict(event_id,user_id) do update set role = excluded.role, status = excluded.status;

set local role anon;
select throws_ok($q$select * from public.gift_list_items$q$, '42501', null, 'anonymous cannot read gift items');
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','Denied')$q$,
  '42501', null, 'anonymous cannot create gift items'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53200000-0000-4000-8000-000000000001","email":"owner53gifts@example.invalid","role":"authenticated"}',true);
select lives_ok(
  $q$insert into public.gift_list_items(id,event_id,created_by,type,name,url,target_amount,priority,status) values('53200000-0000-4000-8000-000000000020','53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','honeymoon','Viaggio','https://example.com/viaggio',1200.50,'high','wanted')$q$,
  'owner creates an informational gift item'
);
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000010'), 1, 'owner reads own event gift items');
select lives_ok($q$update public.gift_list_items set status = 'received', name = 'Viaggio aggiornato' where id = '53200000-0000-4000-8000-000000000020'$q$, 'owner updates own event gift item');
select is((select status from public.gift_list_items where id = '53200000-0000-4000-8000-000000000020'), 'received', 'owner update is persisted');
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name,url) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','Bad URL','javascript:alert(1)')$q$,
  '23514', null, 'non-http URL is rejected'
);
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name,target_amount) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','Bad amount',-1)$q$,
  '23514', null, 'negative informational amount is rejected'
);
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name,priority) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','Bad priority','urgent')$q$,
  '23514', null, 'invalid priority is rejected'
);
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name,status) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','Bad status','paid')$q$,
  '23514', null, 'payment-like status is rejected'
);
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000001','other','   ')$q$,
  '23514', null, 'blank gift name is rejected'
);

select set_config('request.jwt.claims','{"sub":"53200000-0000-4000-8000-000000000002","email":"partner53gifts@example.invalid","role":"authenticated"}',true);
select lives_ok(
  $q$insert into public.gift_list_items(id,event_id,created_by,type,name) values('53200000-0000-4000-8000-000000000021','53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000002','appliances','Robot')$q$,
  'active partner creates a gift item'
);
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000010'), 2, 'active partner reads shared list');
select lives_ok($q$update public.gift_list_items set priority = 'low' where id = '53200000-0000-4000-8000-000000000020'$q$, 'active partner updates shared item');
select lives_ok($q$delete from public.gift_list_items where id = '53200000-0000-4000-8000-000000000021'$q$, 'active partner deletes shared item');

set local role postgres;
insert into public.gift_list_items(id,event_id,created_by,type,name) values
('53200000-0000-4000-8000-000000000022','53200000-0000-4000-8000-000000000011','53200000-0000-4000-8000-000000000004','other','Other event');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53200000-0000-4000-8000-000000000003","email":"revoked53gifts@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000010'), 0, 'revoked partner cannot read gift items');
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000003','other','Denied')$q$,
  '42501', null, 'revoked partner cannot create gift items'
);

select set_config('request.jwt.claims','{"sub":"53200000-0000-4000-8000-000000000004","email":"stranger53gifts@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000010'), 0, 'stranger cannot read another event list');
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000011'), 1, 'stranger can read own event list');
select throws_ok(
  $q$insert into public.gift_list_items(event_id,created_by,type,name) values('53200000-0000-4000-8000-000000000010','53200000-0000-4000-8000-000000000004','other','Cross event')$q$,
  '42501', null, 'cross-event gift creation is denied'
);

set local role postgres;
delete from public.events where id = '53200000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000010'), 0, 'event deletion cascades gift items');
select is((select count(*)::int from public.gift_list_items where event_id = '53200000-0000-4000-8000-000000000011'), 1, 'cross-event gift item remains intact');

select * from finish();
rollback;
