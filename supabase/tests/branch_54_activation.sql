-- Disposable database only. Every fixture is rolled back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, pg_catalog;
select plan(31);
select has_table('private', 'event_activations', 'durable event activation exists');
select ok(not has_table_privilege('anon', 'private.event_activations', 'select'), 'no anonymous read');
select ok(not has_table_privilege('authenticated', 'private.event_activations', 'insert'), 'no client activation writes');
select ok(not has_function_privilege('authenticated', 'private.record_first_value()', 'execute'), 'trigger is private');
insert into auth.users(id,email) values ('54000000-0000-4000-8000-000000000001','branch54@example.invalid');
insert into public.events(id,owner_id,name,event_type,language,country) values
('54000000-0000-4000-8000-000000000010','54000000-0000-4000-8000-000000000001','B54 A','wedding','it','IT'),
('54000000-0000-4000-8000-000000000011','54000000-0000-4000-8000-000000000001','B54 B','wedding','it','IT');
select is((select count(*)::int from private.event_activations where event_id::text like '54000000%'),0,'event creation is not activation');
insert into public.budget_items(event_id,name,country_code,amount) values ('54000000-0000-4000-8000-000000000010','First item','it',25);
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000010'),1,'first budget item activates');
select is((select first_action from private.event_activations where event_id='54000000-0000-4000-8000-000000000010'),'budget_item','source retained');
insert into public.budget_items(event_id,name,country_code,amount) values ('54000000-0000-4000-8000-000000000010','Second item','it',35);
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000010'),1,'repeated action counted once');
delete from public.budget_items where event_id='54000000-0000-4000-8000-000000000010';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000010'),1,'removing source retains activation');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000011'),0,'other event unaffected');
savepoint first_action;
insert into public.budget_items(event_id,name,country_code,amount) values ('54000000-0000-4000-8000-000000000011','Rolled back','it',25);
rollback to first_action;
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000011'),0,'failed transaction cannot activate');
insert into public.suppliers(id,name,category,country_code,source,verification_status,region,province,city) values
('54000000-0000-4000-8000-000000000020','B54 supplier','catering','it','admin_import','VERIFIED','Lazio','RM','Roma');
insert into public.saved_suppliers(id,event_id,supplier_id,status) values
('54000000-0000-4000-8000-000000000030','54000000-0000-4000-8000-000000000011','54000000-0000-4000-8000-000000000020','DISCOVERED');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000011'),0,'discovery alone is not activation');
update public.saved_suppliers set status='SAVED' where id='54000000-0000-4000-8000-000000000030';
select is((select first_action from private.event_activations where event_id='54000000-0000-4000-8000-000000000011'),'supplier','saving supplier activates before selection');
update public.saved_suppliers set status='SELECTED' where id='54000000-0000-4000-8000-000000000030';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000011'),1,'selecting saved supplier does not recount');
insert into public.events(id,owner_id,name,event_type) values ('54000000-0000-4000-8000-000000000012','54000000-0000-4000-8000-000000000001','B54 C','wedding');
insert into public.expenses(id,event_id,amount,status) values ('54000000-0000-4000-8000-000000000040','54000000-0000-4000-8000-000000000012',25,'rejected');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000012'),0,'rejected expense is not activation');
update public.expenses set status='pending' where id='54000000-0000-4000-8000-000000000040';
select is((select first_action from private.event_activations where event_id='54000000-0000-4000-8000-000000000012'),'expense','first valid expense activates');
update public.expenses set status='approved' where id='54000000-0000-4000-8000-000000000040';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000012'),1,'approval does not recount');
insert into public.budget_items(event_id,name,country_code,amount) values (null,'Public template','it',25);
select is((select count(*)::int from private.event_activations where event_id::text like '54000000%'),3,'public template is not activation');
-- Simulate records created before this migration, without backfilling metrics.
insert into public.events(id,owner_id,name,event_type) values
('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000001','Historical expense','wedding'),
('54000000-0000-4000-8000-000000000014','54000000-0000-4000-8000-000000000001','Historical supplier','wedding');
alter table public.expenses disable trigger record_expense_first_value;
alter table public.saved_suppliers disable trigger record_supplier_first_value;
insert into public.expenses(id,event_id,amount,status) values ('54000000-0000-4000-8000-000000000041','54000000-0000-4000-8000-000000000013',25,'pending');
insert into public.saved_suppliers(id,event_id,supplier_id,status) values ('54000000-0000-4000-8000-000000000031','54000000-0000-4000-8000-000000000014','54000000-0000-4000-8000-000000000020','SAVED');
alter table public.expenses enable trigger record_expense_first_value;
alter table public.saved_suppliers enable trigger record_supplier_first_value;
select is((select count(*)::int from private.event_activations where event_id in ('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000014')),0,'historical rows have no fabricated activation');
update public.expenses set status='approved' where id='54000000-0000-4000-8000-000000000041';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000013'),0,'legacy expense approval is not new activation');
update public.saved_suppliers set status='SELECTED' where id='54000000-0000-4000-8000-000000000031';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000014'),0,'legacy supplier selection is not new activation');
-- Persisted exclusion also covers a NEW row of a DIFFERENT kind, and survives
-- removal of old value rows. Cohort capture itself is checked before this suite.
insert into private.activation_legacy_events(event_id) values
('54000000-0000-4000-8000-000000000013'),('54000000-0000-4000-8000-000000000014');
select ok(not has_table_privilege('authenticated','private.activation_legacy_events','insert'),'browser cannot edit legacy cohort');
insert into public.budget_items(event_id,name,country_code,amount) values
('54000000-0000-4000-8000-000000000013','New value after historical expense','it',25),
('54000000-0000-4000-8000-000000000014','New value after historical supplier','it',25);
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000013'),0,'legacy event new budget item is not activation');
insert into public.expenses(event_id,amount,status) values ('54000000-0000-4000-8000-000000000014',25,'pending');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000014'),0,'legacy event new expense is not activation');
insert into public.saved_suppliers(event_id,supplier_id,status) values ('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000020','SAVED');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000013'),0,'legacy event new supplier is not activation');
delete from public.budget_items where event_id in ('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000014');
delete from public.expenses where event_id in ('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000014');
delete from public.saved_suppliers where event_id in ('54000000-0000-4000-8000-000000000013','54000000-0000-4000-8000-000000000014');
insert into public.budget_items(event_id,name,country_code,amount) values ('54000000-0000-4000-8000-000000000013','Recreated value','it',25);
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000013'),0,'legacy exclusion survives deletion and recreation');
-- Applying Idea di Budget persists templates, not a first manual action.
insert into public.events(id,owner_id,name,event_type) values
('54000000-0000-4000-8000-000000000015','54000000-0000-4000-8000-000000000001','B54 applied idea','wedding');
insert into public.budget_items(event_id,name,country_code,amount,source) values
('54000000-0000-4000-8000-000000000015','Applied idea item','it',100,'budget_idea');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000015'),0,'budget_idea application is not activation');
select is((select count(*)::int from public.budget_items where event_id='54000000-0000-4000-8000-000000000015' and source='manual'),0,'budget_idea does not complete manual firstValue');
insert into public.budget_items(event_id,name,country_code,amount,source) values
('54000000-0000-4000-8000-000000000015','First manual item after idea','it',25,'manual');
select is((select first_action from private.event_activations where event_id='54000000-0000-4000-8000-000000000015'),'budget_item','manual item after budget_idea activates');
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000015'),1,'manual action after idea is counted exactly once');

delete from public.events where id='54000000-0000-4000-8000-000000000010';
select is((select count(*)::int from private.event_activations where event_id='54000000-0000-4000-8000-000000000010'),0,'event deletion removes private metric');
select * from finish();
rollback;
