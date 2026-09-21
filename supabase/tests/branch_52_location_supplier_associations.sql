create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(48);

select has_table('public', 'event_location_supplier_links', 'private association table exists');
select ok((select relrowsecurity from pg_class where oid='public.event_location_supplier_links'::regclass),'private association table has RLS');
select is((select count(*)::int from pg_policies where schemaname='public' and tablename='event_location_supplier_links'),4,'private association table has four event policies');
select ok(not has_table_privilege('anon','public.event_location_supplier_links','select'),'anonymous cannot read private associations');
select ok(has_table_privilege('authenticated','public.event_location_supplier_links','select'),'authenticated role can read rows allowed by RLS');
select ok(not has_column_privilege('authenticated','public.event_location_supplier_links','event_id','update'),'authenticated cannot rewrite association event');
select ok(not has_column_privilege('authenticated','public.event_location_supplier_links','created_by','update'),'authenticated cannot rewrite association creator');
select ok(has_column_privilege('authenticated','public.event_location_supplier_links','private_notes','update'),'authenticated may update private notes through RLS');
select ok(has_table_privilege('anon','public.supplier_locations','select'),'global associations remain publicly readable');
select ok(not has_table_privilege('anon','public.supplier_locations','insert'),'anonymous cannot create global associations');
select ok(not has_table_privilege('authenticated','public.supplier_locations','insert'),'authenticated cannot create global associations');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('52300000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner52m3@example.invalid','',now(),now(),now()),
('52300000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner52m3@example.invalid','',now(),now(),now()),
('52300000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked52m3@example.invalid','',now(),now(),now()),
('52300000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','left52m3@example.invalid','',now(),now(),now()),
('52300000-0000-4000-8000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger52m3@example.invalid','',now(),now(),now()),
('52300000-0000-4000-8000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','legacy52m3@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type) values
('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000001','M3 event A','wedding'),
('52300000-0000-4000-8000-000000000011','52300000-0000-4000-8000-000000000005','M3 event B','wedding');
update public.events set bride_email='legacy52m3@example.invalid'
where id='52300000-0000-4000-8000-000000000010';
insert into public.event_members(event_id,user_id,role,status) values
('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000002','partner','active'),
('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000003','partner','revoked'),
('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000004','partner','left')
on conflict(event_id,user_id) do update set role=excluded.role,status=excluded.status;

insert into public.locations(id,name,region,province,city,country_code,location_type,source,external_id,verification_status,confidence_score) values
('52300000-0000-4000-8000-000000000020','M3 Location A','Sicilia','AG','Licata','it','villa','admin_import','m3-location-a','VERIFIED',95),
('52300000-0000-4000-8000-000000000021','M3 Location B','Sicilia','PA','Palermo','it','hotel','admin_import','m3-location-b','VERIFIED',95);
insert into public.suppliers(id,name,region,province,city,country_code,category,source,external_id,verification_status,confidence_score) values
('52300000-0000-4000-8000-000000000030','M3 Supplier A','Sicilia','AG','Licata','it','catering','admin_import','m3-supplier-a','VERIFIED',95),
('52300000-0000-4000-8000-000000000031','M3 Supplier B','Sicilia','PA','Palermo','it','music','admin_import','m3-supplier-b','VERIFIED',95);
insert into public.supplier_locations(supplier_id,location_id,relationship_type,source)
values('52300000-0000-4000-8000-000000000030','52300000-0000-4000-8000-000000000020','works_at','branch52-test');

insert into public.saved_locations(id,event_id,location_id,location_role) values
('52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000020','reception'),
('52300000-0000-4000-8000-000000000041','52300000-0000-4000-8000-000000000011','52300000-0000-4000-8000-000000000021','reception');
insert into public.saved_suppliers(id,event_id,supplier_id) values
('52300000-0000-4000-8000-000000000050','52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000030'),
('52300000-0000-4000-8000-000000000051','52300000-0000-4000-8000-000000000011','52300000-0000-4000-8000-000000000031');
insert into public.event_private_catalog_records(id,event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values
('52300000-0000-4000-8000-000000000060','52300000-0000-4000-8000-000000000010','location','52300000-0000-4000-8000-000000000070','{"name":"Private Location A"}','0000000000000000000000000000000000000000000000000000000000000000','52300000-0000-4000-8000-000000000001'),
('52300000-0000-4000-8000-000000000061','52300000-0000-4000-8000-000000000010','supplier','52300000-0000-4000-8000-000000000071','{"name":"Private Supplier A"}','0000000000000000000000000000000000000000000000000000000000000000','52300000-0000-4000-8000-000000000001'),
('52300000-0000-4000-8000-000000000062','52300000-0000-4000-8000-000000000011','location','52300000-0000-4000-8000-000000000072','{"name":"Private Location B"}','0000000000000000000000000000000000000000000000000000000000000000','52300000-0000-4000-8000-000000000005'),
('52300000-0000-4000-8000-000000000063','52300000-0000-4000-8000-000000000011','supplier','52300000-0000-4000-8000-000000000073','{"name":"Private Supplier B"}','0000000000000000000000000000000000000000000000000000000000000000','52300000-0000-4000-8000-000000000005');

select is((select count(*)::int from public.supplier_locations where supplier_id='52300000-0000-4000-8000-000000000030'),1,'global curated association is preserved');
select is((select catalog_snapshot->>'name' from public.saved_locations where id='52300000-0000-4000-8000-000000000040'),'M3 Location A','M2 location snapshot is present before links');
select is((select catalog_snapshot->>'name' from public.saved_suppliers where id='52300000-0000-4000-8000-000000000050'),'M3 Supplier A','M2 supplier snapshot is present before links');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000001","email":"owner52m3@example.invalid","role":"authenticated"}',true);
select lives_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'owner creates saved-location to saved-supplier link');
select lives_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,private_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000061','preferred_supplier','52300000-0000-4000-8000-000000000001')$q$,'owner creates saved-location to private-supplier link');
select lives_ok($q$insert into public.event_location_supplier_links(event_id,private_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000060','52300000-0000-4000-8000-000000000050','external_allowed','52300000-0000-4000-8000-000000000001')$q$,'owner creates private-location to saved-supplier link');
select lives_ok($q$insert into public.event_location_supplier_links(event_id,private_location_id,private_supplier_id,relationship_type,private_notes,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000060','52300000-0000-4000-8000-000000000061','historic_relationship','private note','52300000-0000-4000-8000-000000000001')$q$,'owner creates private-location to private-supplier link');
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),4,'all four legal endpoint combinations exist');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23505',null,'exact retry cannot create a duplicate');
select lives_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','works_at','52300000-0000-4000-8000-000000000001')$q$,'same pair may have another allowed relationship type');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23514',null,'location endpoint XOR requires one endpoint');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,private_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000060','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23514',null,'location endpoint XOR rejects two endpoints');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000041','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23503',null,'saved endpoint from another event is rejected');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,private_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000062','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23503',null,'private endpoint from another event is rejected');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,private_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000060','recommended','52300000-0000-4000-8000-000000000001')$q$,'23503',null,'private supplier endpoint must have supplier entity type');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,private_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000061','52300000-0000-4000-8000-000000000050','recommended','52300000-0000-4000-8000-000000000001')$q$,'23503',null,'private location endpoint must have location entity type');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,private_notes,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','internal_supplier',repeat('x',4001),'52300000-0000-4000-8000-000000000001')$q$,'23514',null,'private notes are limited at the database boundary');

select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000002","email":"partner52m3@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),5,'active partner reads all event links');
select lives_ok($q$update public.event_location_supplier_links set private_notes='partner update' where saved_location_id='52300000-0000-4000-8000-000000000040' and saved_supplier_id='52300000-0000-4000-8000-000000000050' and relationship_type='recommended'$q$,'active partner updates private notes');
select lives_ok($q$delete from public.event_location_supplier_links where saved_location_id='52300000-0000-4000-8000-000000000040' and saved_supplier_id='52300000-0000-4000-8000-000000000050' and relationship_type='works_at'$q$,'active partner deletes a private link');

select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000003","email":"revoked52m3@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),0,'revoked partner cannot enumerate private links');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','works_at','52300000-0000-4000-8000-000000000003')$q$,'42501',null,'revoked partner cannot create a private link');

select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000004","email":"left52m3@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),0,'left partner cannot enumerate private links');

select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000005","email":"stranger52m3@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),0,'stranger cannot enumerate another event links');

select set_config('request.jwt.claims','{"sub":"52300000-0000-4000-8000-000000000006","email":"legacy52m3@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),0,'legacy email match cannot enumerate private links');
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type,created_by) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','works_at','52300000-0000-4000-8000-000000000006')$q$,'42501',null,'legacy email match cannot create a private link');

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
select throws_ok($q$insert into public.event_location_supplier_links(event_id,saved_location_id,saved_supplier_id,relationship_type) values('52300000-0000-4000-8000-000000000010','52300000-0000-4000-8000-000000000040','52300000-0000-4000-8000-000000000050','works_at')$q$,'42501',null,'anonymous cannot write private links');
select is((select count(*)::int from public.supplier_locations where supplier_id='52300000-0000-4000-8000-000000000030'),1,'anonymous can read the curated global association');

set local role postgres;
select throws_ok($q$update public.event_location_supplier_links set saved_supplier_id=null,private_supplier_id='52300000-0000-4000-8000-000000000061' where saved_location_id='52300000-0000-4000-8000-000000000040' and saved_supplier_id='52300000-0000-4000-8000-000000000050' and relationship_type='recommended'$q$,'23514',null,'identity trigger blocks endpoint replacement even for service writes');
select is((select private_notes from public.event_location_supplier_links where saved_location_id='52300000-0000-4000-8000-000000000040' and saved_supplier_id='52300000-0000-4000-8000-000000000050' and relationship_type='recommended'),'partner update','allowed partner update is persisted');
select is((select catalog_snapshot->>'name' from public.saved_locations where id='52300000-0000-4000-8000-000000000040'),'M3 Location A','location snapshot remains immutable after link CRUD');
select is((select catalog_snapshot->>'name' from public.saved_suppliers where id='52300000-0000-4000-8000-000000000050'),'M3 Supplier A','supplier snapshot remains immutable after link CRUD');
select is((select count(*)::int from public.locations where id in ('52300000-0000-4000-8000-000000000020','52300000-0000-4000-8000-000000000021')),2,'global location UUIDs remain unchanged');
select is((select count(*)::int from public.suppliers where id in ('52300000-0000-4000-8000-000000000030','52300000-0000-4000-8000-000000000031')),2,'global supplier UUIDs remain unchanged');

insert into public.event_location_supplier_links(id,event_id,saved_location_id,saved_supplier_id,relationship_type,created_by)
values('52300000-0000-4000-8000-000000000085','52300000-0000-4000-8000-000000000011','52300000-0000-4000-8000-000000000041','52300000-0000-4000-8000-000000000051','recommended','52300000-0000-4000-8000-000000000005');
delete from public.events where id='52300000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000010'),0,'event deletion cascades only its private links');
select is((select count(*)::int from public.event_location_supplier_links where event_id='52300000-0000-4000-8000-000000000011'),1,'another event private link is preserved');
select is((select count(*)::int from public.supplier_locations where supplier_id='52300000-0000-4000-8000-000000000030'),1,'event deletion never removes global curated associations');

select * from finish();
rollback;
