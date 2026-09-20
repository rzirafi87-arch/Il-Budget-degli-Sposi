create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(64);

select has_column('public','timeline_items','client_key','Timeline has idempotency key');
select has_column('public','timeline_items','saved_supplier_id','Timeline keeps saved supplier endpoint');
select has_column('public','timeline_items','private_supplier_id','Timeline has private supplier endpoint');
select has_column('public','appointments','client_key','appointments have idempotency key');
select has_column('public','appointments','saved_supplier_id','appointments have saved supplier endpoint');
select has_column('public','appointments','private_supplier_id','appointments have private supplier endpoint');
select has_check('public','timeline_items','timeline_items_supplier_xor_check','Timeline has nullable XOR constraint');
select has_check('public','appointments','appointments_supplier_xor_check','appointments have nullable XOR constraint');
select has_fk('public','timeline_items','timeline_items_saved_supplier_event_fkey','Timeline saved supplier proves same event');
select has_fk('public','timeline_items','timeline_items_private_supplier_event_fkey','Timeline private supplier proves same event');
select has_fk('public','appointments','appointments_saved_supplier_event_fkey','appointment saved supplier proves same event');
select has_fk('public','appointments','appointments_private_supplier_event_fkey','appointment private supplier proves same event');
select ok((select relrowsecurity from pg_class where oid='public.timeline_items'::regclass),'Timeline RLS remains enabled');
select ok((select relrowsecurity from pg_class where oid='public.appointments'::regclass),'appointment RLS remains enabled');
select ok(not has_table_privilege('anon','public.timeline_items','select'),'anonymous cannot read Timeline');
select ok(not has_table_privilege('anon','public.appointments','select'),'anonymous cannot read appointments');
select ok(has_table_privilege('authenticated','public.timeline_items','update'),'authenticated Timeline writes remain RLS-governed');
select ok(has_table_privilege('authenticated','public.appointments','update'),'authenticated appointment writes remain RLS-governed');
select ok((select indisunique from pg_index where indexrelid='public.timeline_items_event_client_key_uidx'::regclass),'Timeline client key is unique per event');
select ok((select indisunique from pg_index where indexrelid='public.appointments_event_client_key_uidx'::regclass),'appointment client key is unique per event');
select has_trigger('public','timeline_items','timeline_items_supplier_work_identity_immutable','Timeline identity has an immutable trigger');
select has_trigger('public','appointments','appointments_supplier_work_identity_immutable','appointment identity has an immutable trigger');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('52400000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner52m4@example.invalid','',now(),now(),now()),
('52400000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner52m4@example.invalid','',now(),now(),now()),
('52400000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked52m4@example.invalid','',now(),now(),now()),
('52400000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger52m4@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type) values
('52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000001','M4 event A','wedding'),
('52400000-0000-4000-8000-000000000011','52400000-0000-4000-8000-000000000004','M4 event B','wedding');
insert into public.event_members(event_id,user_id,role,status) values
('52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000002','partner','active'),
('52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000003','partner','revoked')
on conflict(event_id,user_id) do update set role=excluded.role,status=excluded.status;

insert into public.suppliers(id,name,region,province,city,country_code,category,source,external_id,verification_status,confidence_score) values
('52400000-0000-4000-8000-000000000020','M4 Supplier A','Sicilia','AG','Licata','it','catering','admin_import','m4-supplier-a','VERIFIED',95),
('52400000-0000-4000-8000-000000000021','M4 Supplier B','Sicilia','PA','Palermo','it','music','admin_import','m4-supplier-b','VERIFIED',95);
insert into public.saved_suppliers(id,event_id,supplier_id) values
('52400000-0000-4000-8000-000000000030','52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000020'),
('52400000-0000-4000-8000-000000000031','52400000-0000-4000-8000-000000000011','52400000-0000-4000-8000-000000000021');
insert into public.event_private_catalog_records(id,event_id,entity_type,client_key,snapshot_data,snapshot_fingerprint,created_by) values
('52400000-0000-4000-8000-000000000040','52400000-0000-4000-8000-000000000010','supplier','52400000-0000-4000-8000-000000000050','{"name":"M4 private supplier A"}','0000000000000000000000000000000000000000000000000000000000000000','52400000-0000-4000-8000-000000000001'),
('52400000-0000-4000-8000-000000000041','52400000-0000-4000-8000-000000000011','supplier','52400000-0000-4000-8000-000000000051','{"name":"M4 private supplier B"}','0000000000000000000000000000000000000000000000000000000000000000','52400000-0000-4000-8000-000000000004'),
('52400000-0000-4000-8000-000000000042','52400000-0000-4000-8000-000000000010','location','52400000-0000-4000-8000-000000000052','{"name":"Wrong private type"}','0000000000000000000000000000000000000000000000000000000000000000','52400000-0000-4000-8000-000000000001');

select is((select catalog_snapshot->>'name' from public.saved_suppliers where id='52400000-0000-4000-8000-000000000030'),'M4 Supplier A','M2 saved snapshot exists before M4 writes');
select is((select snapshot_data->>'name' from public.event_private_catalog_records where id='52400000-0000-4000-8000-000000000040'),'M4 private supplier A','M2 private snapshot exists before M4 writes');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"52400000-0000-4000-8000-000000000001","email":"owner52m4@example.invalid","role":"authenticated"}',true);
select lives_ok($q$insert into public.timeline_items(id,event_id,title) values('52400000-0000-4000-8000-000000000060','52400000-0000-4000-8000-000000000010','Timeline without supplier')$q$,'owner creates Timeline item without supplier');
select lives_ok($q$insert into public.timeline_items(id,event_id,client_key,title,saved_supplier_id) values('52400000-0000-4000-8000-000000000061','52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000080','Timeline saved supplier','52400000-0000-4000-8000-000000000030')$q$,'owner creates Timeline item with saved supplier');
select lives_ok($q$insert into public.timeline_items(id,event_id,title,private_supplier_id) values('52400000-0000-4000-8000-000000000062','52400000-0000-4000-8000-000000000010','Timeline private supplier','52400000-0000-4000-8000-000000000040')$q$,'owner creates Timeline item with private supplier');
select lives_ok($q$insert into public.appointments(id,event_id,title,appointment_date) values('52400000-0000-4000-8000-000000000070','52400000-0000-4000-8000-000000000010','Appointment without supplier','2030-01-01')$q$,'owner creates appointment without supplier');
select lives_ok($q$insert into public.appointments(id,event_id,client_key,title,appointment_date,saved_supplier_id) values('52400000-0000-4000-8000-000000000071','52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000081','Appointment saved supplier','2030-01-02','52400000-0000-4000-8000-000000000030')$q$,'owner creates appointment with saved supplier');
select lives_ok($q$insert into public.appointments(id,event_id,title,appointment_date,private_supplier_id) values('52400000-0000-4000-8000-000000000072','52400000-0000-4000-8000-000000000010','Appointment private supplier','2030-01-03','52400000-0000-4000-8000-000000000040')$q$,'owner creates appointment with private supplier');
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),3,'owner sees three M4 Timeline variants');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),3,'owner sees three M4 appointment variants');
select throws_ok($q$insert into public.timeline_items(event_id,client_key,title) values('52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000080','Repeated Timeline create')$q$,'23505',null,'Timeline database rejects a repeated event client key');
select throws_ok($q$insert into public.appointments(event_id,client_key,title,appointment_date) values('52400000-0000-4000-8000-000000000010','52400000-0000-4000-8000-000000000081','Repeated appointment create','2030-01-04')$q$,'23505',null,'appointment database rejects a repeated event client key');

select throws_ok($q$insert into public.timeline_items(event_id,title,saved_supplier_id) values('52400000-0000-4000-8000-000000000010','Cross event saved','52400000-0000-4000-8000-000000000031')$q$,'23503',null,'Timeline rejects saved supplier from another event');
select throws_ok($q$insert into public.timeline_items(event_id,title,private_supplier_id) values('52400000-0000-4000-8000-000000000010','Cross event private','52400000-0000-4000-8000-000000000041')$q$,'23503',null,'Timeline rejects private supplier from another event');
select throws_ok($q$insert into public.appointments(event_id,title,appointment_date,saved_supplier_id) values('52400000-0000-4000-8000-000000000010','Cross event saved','2030-02-01','52400000-0000-4000-8000-000000000031')$q$,'23503',null,'appointment rejects saved supplier from another event');
select throws_ok($q$insert into public.appointments(event_id,title,appointment_date,private_supplier_id) values('52400000-0000-4000-8000-000000000010','Cross event private','2030-02-01','52400000-0000-4000-8000-000000000041')$q$,'23503',null,'appointment rejects private supplier from another event');
select throws_ok($q$insert into public.timeline_items(event_id,title,private_supplier_id) values('52400000-0000-4000-8000-000000000010','Wrong type','52400000-0000-4000-8000-000000000042')$q$,'23503',null,'Timeline private endpoint requires supplier type');
select throws_ok($q$insert into public.appointments(event_id,title,appointment_date,private_supplier_id) values('52400000-0000-4000-8000-000000000010','Wrong type','2030-02-01','52400000-0000-4000-8000-000000000042')$q$,'23503',null,'appointment private endpoint requires supplier type');
select throws_ok($q$update public.timeline_items set saved_supplier_id='52400000-0000-4000-8000-000000000030',private_supplier_id='52400000-0000-4000-8000-000000000040' where id='52400000-0000-4000-8000-000000000060'$q$,'23514',null,'Timeline XOR rejects two supplier endpoints');
select throws_ok($q$update public.appointments set saved_supplier_id='52400000-0000-4000-8000-000000000030',private_supplier_id='52400000-0000-4000-8000-000000000040' where id='52400000-0000-4000-8000-000000000070'$q$,'23514',null,'appointment XOR rejects two supplier endpoints');
select throws_ok($q$update public.timeline_items set event_id='52400000-0000-4000-8000-000000000011' where id='52400000-0000-4000-8000-000000000061'$q$,'22023','SUPPLIER_WORK_IDENTITY_IMMUTABLE','Timeline event cannot be altered through Data API');
select throws_ok($q$update public.appointments set client_key='52400000-0000-4000-8000-000000000099' where id='52400000-0000-4000-8000-000000000071'$q$,'22023','SUPPLIER_WORK_IDENTITY_IMMUTABLE','appointment idempotency key cannot be altered through Data API');

select set_config('request.jwt.claims','{"sub":"52400000-0000-4000-8000-000000000002","email":"partner52m4@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),3,'active partner reads event Timeline');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),3,'active partner reads event appointments');
select lives_ok($q$update public.timeline_items set saved_supplier_id=null where id='52400000-0000-4000-8000-000000000061'$q$,'active partner manually unlinks Timeline supplier');
select lives_ok($q$update public.appointments set saved_supplier_id=null where id='52400000-0000-4000-8000-000000000071'$q$,'active partner manually unlinks appointment supplier');
select is((select count(*)::int from public.timeline_items where id='52400000-0000-4000-8000-000000000061' and saved_supplier_id is null),1,'Timeline unlink preserves the activity');
select is((select count(*)::int from public.appointments where id='52400000-0000-4000-8000-000000000071' and saved_supplier_id is null),1,'appointment unlink preserves the appointment');

select set_config('request.jwt.claims','{"sub":"52400000-0000-4000-8000-000000000003","email":"revoked52m4@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),0,'revoked partner cannot enumerate Timeline');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),0,'revoked partner cannot enumerate appointments');

select set_config('request.jwt.claims','{"sub":"52400000-0000-4000-8000-000000000004","email":"stranger52m4@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),0,'stranger cannot enumerate another event Timeline');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),0,'stranger cannot enumerate another event appointments');

set local role postgres;
delete from public.saved_suppliers where id='52400000-0000-4000-8000-000000000030';
select is((select saved_supplier_id from public.timeline_items where id='52400000-0000-4000-8000-000000000061'),null,'deleting saved supplier leaves Timeline unlinked');
select is((select saved_supplier_id from public.appointments where id='52400000-0000-4000-8000-000000000071'),null,'deleting saved supplier leaves appointment unlinked');
delete from public.event_private_catalog_records where id='52400000-0000-4000-8000-000000000040';
select is((select private_supplier_id from public.timeline_items where id='52400000-0000-4000-8000-000000000062'),null,'deleting private supplier leaves Timeline unlinked');
select is((select private_supplier_id from public.appointments where id='52400000-0000-4000-8000-000000000072'),null,'deleting private supplier leaves appointment unlinked');
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),3,'supplier deletion never deletes Timeline resources');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),3,'supplier deletion never deletes appointments');
select is((select count(*)::int from public.payment_reminders),0,'M4 creates no payment reminder or notification');
delete from public.events where id='52400000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.timeline_items where event_id='52400000-0000-4000-8000-000000000010'),0,'event deletion cascades Timeline resources');
select is((select count(*)::int from public.appointments where event_id='52400000-0000-4000-8000-000000000010'),0,'event deletion cascades appointments');
select is((select count(*)::int from public.suppliers where id in ('52400000-0000-4000-8000-000000000020','52400000-0000-4000-8000-000000000021')),2,'event deletion preserves global supplier UUIDs');

select * from finish();
rollback;
