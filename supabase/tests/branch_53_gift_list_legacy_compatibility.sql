create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(57);

select has_view('public', 'gift_list', 'legacy gift-list compatibility view exists');
select is(
  (select count(*)::int from information_schema.columns where table_schema = 'public' and table_name = 'gift_list'),
  16,
  'legacy view exposes the complete old API column contract'
);
select ok(
  pg_get_viewdef('public.gift_list'::regclass, true) like '%gift_list_items%',
  'legacy view reads the canonical gift_list_items relation'
);
select ok(
  pg_get_viewdef('public.gift_list'::regclass, true) like '%archived%',
  'legacy view explicitly filters archived canonical rows'
);
select ok(
  coalesce((select reloptions @> array['security_invoker=true'] from pg_class where oid = 'public.gift_list'::regclass), false),
  'legacy view is a security-invoker view'
);
select has_function('public', 'gift_list_legacy_write', array[]::text[], 'legacy write trigger function exists');
select ok(
  not (select prosecdef from pg_proc where oid = 'public.gift_list_legacy_write()'::regprocedure),
  'legacy write trigger function is security invoker'
);
select ok(
  coalesce((select proconfig @> array['search_path=""'] from pg_proc where oid = 'public.gift_list_legacy_write()'::regprocedure), false),
  'legacy write trigger function has an empty search_path'
);
select is(
  (select count(*)::int from pg_trigger where tgrelid = 'public.gift_list'::regclass and tgname = 'gift_list_legacy_write' and not tgisinternal),
  1,
  'one INSTEAD OF write trigger backs the legacy view'
);

select ok(not has_table_privilege('anon', 'public.gift_list', 'select'), 'anon cannot select the legacy surface');
select ok(not has_table_privilege('anon', 'public.gift_list', 'insert,update,delete'), 'anon cannot mutate the legacy surface');
select ok(not has_table_privilege('authenticated', 'public.gift_list', 'select'), 'authenticated cannot select the service-only legacy surface');
select ok(not has_table_privilege('authenticated', 'public.gift_list', 'insert,update,delete'), 'authenticated cannot mutate the service-only legacy surface');
select ok(has_table_privilege('service_role', 'public.gift_list', 'select'), 'service_role can select the legacy surface');
select ok(has_table_privilege('service_role', 'public.gift_list', 'insert,update,delete'), 'service_role can mutate the legacy surface');
select ok(not exists (
  select 1
  from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
  where p.oid = 'public.gift_list_legacy_write()'::regprocedure
    and privilege.grantee = 0
    and privilege.privilege_type = 'EXECUTE'
), 'PUBLIC cannot execute the trigger function');
select ok(not has_function_privilege('anon', 'public.gift_list_legacy_write()', 'execute'), 'anon cannot execute the trigger function');
select ok(not has_function_privilege('authenticated', 'public.gift_list_legacy_write()', 'execute'), 'authenticated cannot execute the trigger function');
select ok(has_function_privilege('service_role', 'public.gift_list_legacy_write()', 'execute'), 'service_role can execute the trigger function through the trigger');
select is(
  (select count(*)::int from information_schema.columns where table_schema = 'public' and table_name = 'gift_list_items'
   and column_name in ('image_url','purchased_by','purchased_at','iban','checkout_id','payment_id','contribution_amount')),
  0,
  'canonical model still contains no unsupported purchase-tracking columns'
);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('53300000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner53compat@example.invalid','',now(),now(),now()),
('53300000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','other53compat@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name,event_type) values
('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Compatibility event A','wedding'),
('53300000-0000-4000-8000-000000000011','53300000-0000-4000-8000-000000000002','Compatibility event B','wedding');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53300000-0000-4000-8000-000000000001","email":"owner53compat@example.invalid","role":"authenticated"}',true);
select throws_ok($q$select * from public.gift_list$q$, '42501', null, 'browser-authenticated users cannot bypass the guarded old API');

set local role service_role;
select lives_ok(
  $q$insert into public.gift_list(id,event_id,user_id,type,name,description,price,url,priority,status,notes,image_url,purchased_by,purchased_at)
     values('53300000-0000-4000-8000-000000000020','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Cassa comune','Fondo viaggio','Test',125.50,'https://example.com/gift','media','desiderato','Nota',null,null,null)$q$,
  'legacy INSERT accepts the real old UI contract'
);
select is((select status from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), 'wanted', 'desiderato maps to wanted');
select is((select priority from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), 'medium', 'media maps to medium');
select is((select target_amount from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), 125.50::numeric, 'price maps to target_amount');
select is((select note from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), 'Nota', 'notes maps to note');
select is((select created_by from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), '53300000-0000-4000-8000-000000000001'::uuid, 'user_id maps to created_by');
select is((select status from public.gift_list where id='53300000-0000-4000-8000-000000000020'), 'desiderato', 'wanted maps back to desiderato');
select is((select priority from public.gift_list where id='53300000-0000-4000-8000-000000000020'), 'media', 'medium maps back to media');
select is((select price from public.gift_list where id='53300000-0000-4000-8000-000000000020'), 125.50::numeric, 'target_amount maps back to price');
select is((select notes from public.gift_list where id='53300000-0000-4000-8000-000000000020'), 'Nota', 'note maps back to notes');
select is((select type from public.gift_list where id='53300000-0000-4000-8000-000000000020'), 'Cassa comune', 'descriptive old UI type remains unchanged');
select ok(
  (select image_url is null and purchased_by is null and purchased_at is null from public.gift_list where id='53300000-0000-4000-8000-000000000020'),
  'unsupported legacy fields are explicitly returned as null'
);

select lives_ok(
  $q$insert into public.gift_list(id,event_id,user_id,type,name,priority,status)
     values('53300000-0000-4000-8000-000000000021','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Esperienze','Cena','alta','acquistato')$q$,
  'legacy acquistato INSERT succeeds without purchase tracking'
);
select is((select status from public.gift_list_items where id='53300000-0000-4000-8000-000000000021'), 'received', 'acquistato maps to received');
select is((select status from public.gift_list where id='53300000-0000-4000-8000-000000000021'), 'acquistato', 'received maps back to acquistato');
select lives_ok(
  $q$insert into public.gift_list(id,event_id,user_id,type,name,status)
     values('53300000-0000-4000-8000-000000000022','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Beneficenza','Donazione','ricevuto')$q$,
  'legacy API ricevuto alias remains accepted'
);
select is((select status from public.gift_list_items where id='53300000-0000-4000-8000-000000000022'), 'received', 'ricevuto alias maps deterministically to received');
select is((select status from public.gift_list where id='53300000-0000-4000-8000-000000000022'), 'acquistato', 'received has one stable legacy representation');

set local role postgres;
insert into public.gift_list_items(id,event_id,created_by,type,name,status,priority) values
('53300000-0000-4000-8000-000000000030','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Arredamento','Divano','wanted','high'),
('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Elettrodomestici','Robot','received','low'),
('53300000-0000-4000-8000-000000000032','53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Altro','Archiviato','archived','medium');

set local role service_role;
select is((select count(*)::int from public.gift_list where id in ('53300000-0000-4000-8000-000000000030','53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000032')), 2, 'new wanted and received rows are visible while archived is hidden');
select is((select status from public.gift_list where id='53300000-0000-4000-8000-000000000030'), 'desiderato', 'NEW wanted is visible to OLD as desiderato');
select is((select status from public.gift_list where id='53300000-0000-4000-8000-000000000031'), 'acquistato', 'NEW received is visible to OLD as acquistato');
select is((select count(*)::int from public.gift_list where id='53300000-0000-4000-8000-000000000032'), 0, 'NEW archived is not exposed as an active old wish');

select lives_ok(
  $q$update public.gift_list set name='Fondo viaggio aggiornato', priority='bassa', status='acquistato', price=200, notes='Aggiornata' where id='53300000-0000-4000-8000-000000000020'$q$,
  'OLD UPDATE writes the same canonical row'
);
select ok(
  (select name='Fondo viaggio aggiornato' and priority='low' and status='received' and target_amount=200 and note='Aggiornata' from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'),
  'OLD UPDATE is visible in NEW canonical data'
);
set local role postgres;
update public.gift_list_items set name='Robot aggiornato', priority='medium', note='Dal nuovo client' where id='53300000-0000-4000-8000-000000000031';
set local role service_role;
select ok(
  (select name='Robot aggiornato' and priority='media' and notes='Dal nuovo client' from public.gift_list where id='53300000-0000-4000-8000-000000000031'),
  'NEW UPDATE is visible through OLD READ'
);
set local role postgres;
update public.gift_list_items set status='archived' where id='53300000-0000-4000-8000-000000000030';
set local role service_role;
select is((select count(*)::int from public.gift_list where id='53300000-0000-4000-8000-000000000030'), 0, 'NEW ARCHIVE removes the item from OLD visibility');
select lives_ok($q$delete from public.gift_list where id='53300000-0000-4000-8000-000000000021'$q$, 'OLD DELETE succeeds');
select is((select count(*)::int from public.gift_list_items where id='53300000-0000-4000-8000-000000000021'), 0, 'OLD DELETE removes the canonical row');

select throws_ok(
  $q$insert into public.gift_list(event_id,user_id,type,name,image_url) values('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Altro','Bad image','https://example.com/image.png')$q$,
  '22023', 'GIFT_LIST_LEGACY_IMAGE_URL_UNSUPPORTED', 'non-null image_url fails deterministically'
);
select throws_ok(
  $q$insert into public.gift_list(event_id,user_id,type,name,purchased_by) values('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Altro','Bad buyer','Persona')$q$,
  '22023', 'GIFT_LIST_LEGACY_PURCHASED_BY_UNSUPPORTED', 'non-null purchased_by fails deterministically'
);
select throws_ok(
  $q$insert into public.gift_list(event_id,user_id,type,name,purchased_at) values('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Altro','Bad date',now())$q$,
  '22023', 'GIFT_LIST_LEGACY_PURCHASED_AT_UNSUPPORTED', 'non-null purchased_at fails deterministically'
);
select throws_ok(
  $q$update public.gift_list set purchased_by='Persona' where id='53300000-0000-4000-8000-000000000020'$q$,
  '22023', 'GIFT_LIST_LEGACY_PURCHASED_BY_UNSUPPORTED', 'unsupported update cannot report a false success'
);
select throws_ok(
  $q$update public.gift_list set event_id='53300000-0000-4000-8000-000000000011' where id='53300000-0000-4000-8000-000000000020'$q$,
  '22023', 'GIFT_LIST_LEGACY_IDENTITY_IMMUTABLE', 'legacy writes cannot move an item across events'
);
select is((select event_id from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), '53300000-0000-4000-8000-000000000010'::uuid, 'cross-event mutation leaves canonical ownership unchanged');
select is((select count(*)::int from public.gift_list_items where id='53300000-0000-4000-8000-000000000020'), 1, 'legacy operations never duplicate the canonical row');
select is((select count(*)::int from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('gift_list','gift_list_items') and c.relkind='r'), 1, 'only gift_list_items is a persisted table/source of truth');

select * from finish();
rollback;
