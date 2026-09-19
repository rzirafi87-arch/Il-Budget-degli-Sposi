create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(36);

select has_table('public', 'event_private_catalog_records', 'private-only event catalog table exists');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='saved_churches' and column_name in ('catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at','catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides')),6,'saved churches has six additive snapshot columns');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='saved_locations' and column_name in ('catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at','catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides')),6,'saved locations has six additive snapshot columns');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='saved_suppliers' and column_name in ('catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at','catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides')),6,'saved suppliers has six additive snapshot columns');
select ok((select relrowsecurity from pg_class where oid='public.event_private_catalog_records'::regclass),'private-only records have RLS');
select is((select count(*)::int from pg_policies where schemaname='public' and tablename='event_private_catalog_records'),4,'private-only table has four event policies');
select ok(not has_table_privilege('anon','public.event_private_catalog_records','select'),'anonymous has no private catalog access');
select is((select count(*)::int from information_schema.columns where table_schema='public' and table_name='user_favorites' and column_name='event_id'),0,'user favorites remain user-global');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('52200000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner52m2@example.invalid','',now(),now(),now()),
('52200000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner52m2@example.invalid','',now(),now(),now()),
('52200000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked52m2@example.invalid','',now(),now(),now()),
('52200000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger52m2@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type) values
('52200000-0000-4000-8000-000000000010','52200000-0000-4000-8000-000000000001','M2 event A','wedding'),
('52200000-0000-4000-8000-000000000011','52200000-0000-4000-8000-000000000004','M2 event B','wedding');
insert into public.event_members(event_id,user_id,role,status) values
('52200000-0000-4000-8000-000000000010','52200000-0000-4000-8000-000000000002','partner','active'),
('52200000-0000-4000-8000-000000000010','52200000-0000-4000-8000-000000000003','partner','revoked')
on conflict(event_id,user_id) do update set role=excluded.role,status=excluded.status;

insert into public.suppliers(id,name,region,province,city,country_code,category,source,external_id,verification_status,confidence_score)
values('52200000-0000-4000-8000-000000000020','Snapshot Supplier','Sicilia','AG','Licata','it','catering','admin_import','m2-supplier','VERIFIED',95);
insert into public.catalog_provenance(entity_type,entity_id,source_type,source_name,external_id,raw_fingerprint)
values('supplier','52200000-0000-4000-8000-000000000020','admin_import','branch52-test','m2-supplier',repeat('a',64));
insert into public.saved_suppliers(id,event_id,supplier_id)
values('52200000-0000-4000-8000-000000000030','52200000-0000-4000-8000-000000000010','52200000-0000-4000-8000-000000000020');

select ok((select catalog_snapshot is not null from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),'global save captures a snapshot');
select is((select catalog_snapshot->>'name' from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),'Snapshot Supplier','snapshot contains original name');
select matches((select catalog_snapshot_fingerprint from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),'^[a-f0-9]{64}$','snapshot has deterministic fingerprint');
select is((select jsonb_array_length(catalog_provenance_snapshot->'pipeline') from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),1,'snapshot captures safe pipeline provenance');

update public.suppliers set name='Changed Global Supplier' where id='52200000-0000-4000-8000-000000000020';
select is((select catalog_snapshot->>'name' from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),'Snapshot Supplier','global updates do not rewrite event snapshot');
select is((select name from public.suppliers where id='52200000-0000-4000-8000-000000000020'),'Changed Global Supplier','simulated global update is isolated from snapshot');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"52200000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select lives_ok($q$update public.saved_suppliers set private_overrides='{"name":"Private Name"}'::jsonb where id='52200000-0000-4000-8000-000000000030'$q$,'owner may apply an allowlisted override');
select is((select private_overrides->>'name' from public.saved_suppliers where id='52200000-0000-4000-8000-000000000030'),'Private Name','override is stored only on saved row');
select throws_ok($q$update public.saved_suppliers set private_overrides='{"source":"forged"}'::jsonb where id='52200000-0000-4000-8000-000000000030'$q$,'23514',null,'provenance field is forbidden in private override');
select throws_ok($q$update public.saved_suppliers set catalog_snapshot='{"name":"forged"}'::jsonb where id='52200000-0000-4000-8000-000000000030'$q$,'23514',null,'snapshot is immutable');
select throws_ok($q$insert into public.saved_suppliers(event_id,supplier_id) values('52200000-0000-4000-8000-000000000010','52200000-0000-4000-8000-000000000020')$q$,'23505',null,'repeated global save is constrained idempotently');

select lives_ok($q$insert into public.event_private_catalog_records(event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values('52200000-0000-4000-8000-000000000010','supplier','52200000-0000-4000-8000-000000000040','{"name":"Same Private Name","city":"Licata"}','0000000000000000000000000000000000000000000000000000000000000000','52200000-0000-4000-8000-000000000001')$q$,'owner creates private-only record');
select lives_ok($q$insert into public.event_private_catalog_records(event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values('52200000-0000-4000-8000-000000000010','supplier','52200000-0000-4000-8000-000000000041','{"name":"Same Private Name","city":"Licata"}','0000000000000000000000000000000000000000000000000000000000000000','52200000-0000-4000-8000-000000000001')$q$,'same-name distinct entity remains distinct with another client key');
select is((select count(*)::int from public.event_private_catalog_records where event_id='52200000-0000-4000-8000-000000000010'),2,'distinct private identities are not merged');
select throws_ok($q$insert into public.event_private_catalog_records(event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values('52200000-0000-4000-8000-000000000010','supplier','52200000-0000-4000-8000-000000000040','{"name":"Retry"}','0000000000000000000000000000000000000000000000000000000000000000','52200000-0000-4000-8000-000000000001')$q$,'23505',null,'same idempotency key cannot create a duplicate');
select matches((select snapshot_fingerprint from public.event_private_catalog_records where client_key='52200000-0000-4000-8000-000000000040'),'^[a-f0-9]{64}$','private-only snapshot receives server fingerprint');
select throws_ok($q$update public.event_private_catalog_records set snapshot_data='{"name":"forged"}' where client_key='52200000-0000-4000-8000-000000000040'$q$,'23514',null,'private-only base snapshot is immutable');

select set_config('request.jwt.claims','{"sub":"52200000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*)::int from public.event_private_catalog_records where event_id='52200000-0000-4000-8000-000000000010'),2,'active partner reads event private records');
select lives_ok($q$update public.event_private_catalog_records set override_data='{"phone":"+39 123"}' where client_key='52200000-0000-4000-8000-000000000040'$q$,'active partner updates allowlisted override');
select is((select snapshot_data->>'name' from public.event_private_catalog_records where client_key='52200000-0000-4000-8000-000000000040'),'Same Private Name','partner override leaves snapshot unchanged');

select set_config('request.jwt.claims','{"sub":"52200000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*)::int from public.event_private_catalog_records where event_id='52200000-0000-4000-8000-000000000010'),0,'revoked partner cannot read event private records');
select throws_ok($q$insert into public.event_private_catalog_records(event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values('52200000-0000-4000-8000-000000000010','church','52200000-0000-4000-8000-000000000042','{"name":"Denied"}','0000000000000000000000000000000000000000000000000000000000000000','52200000-0000-4000-8000-000000000003')$q$,'42501',null,'revoked partner cannot create private records');

select set_config('request.jwt.claims','{"sub":"52200000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select is((select count(*)::int from public.event_private_catalog_records where event_id='52200000-0000-4000-8000-000000000010'),0,'stranger cannot enumerate private records');

set local role postgres;
select is((select name from public.suppliers where id='52200000-0000-4000-8000-000000000020'),'Changed Global Supplier','private override never mutates global catalog');
select is((select count(*)::int from public.suppliers where id='52200000-0000-4000-8000-000000000020'),1,'global UUID is preserved');
select is((select count(*)::int from public.catalog_provenance where entity_id='52200000-0000-4000-8000-000000000020'),1,'catalog provenance row is preserved');
delete from public.events where id='52200000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.event_private_catalog_records where event_id='52200000-0000-4000-8000-000000000010'),0,'event deletion cascades private-only records');
select is((select count(*)::int from public.saved_suppliers where event_id='52200000-0000-4000-8000-000000000010'),0,'event deletion retains saved-row cascade contract');

select * from finish();
rollback;
