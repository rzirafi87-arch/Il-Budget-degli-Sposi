create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(39);

select has_table('public', 'guests', 'existing guests table is reused');
select has_table('public', 'tables', 'existing tables table is reused');
select has_table('public', 'table_assignments', 'existing table assignments table is reused');
select is((select count(*)::int from information_schema.tables where table_schema = 'public' and table_name = 'tables'), 1, 'no duplicate tables relation is introduced');
select is((select count(*)::int from pg_constraint where conrelid = 'public.tables'::regclass and conname = 'tables_event_id_table_number_key'), 1, 'table numbers remain unique per event');
select is((select count(*)::int from pg_constraint where conrelid = 'public.table_assignments'::regclass and conname = 'table_assignments_guest_id_key'), 1, 'a guest can be assigned only once');
select is((select count(*)::int from pg_constraint where conname in ('tables_positive_number_check','tables_capacity_check','table_assignments_positive_seat_check')), 3, 'Branch 53 adds table and seat validation constraints');
select is((select count(*)::int from pg_trigger where tgname = 'table_assignments_validate_event_capacity' and not tgisinternal), 1, 'assignment event and capacity trigger exists');
select is((select count(*)::int from pg_trigger where tgname = 'tables_prevent_capacity_underflow' and not tgisinternal), 1, 'capacity underflow trigger exists');
select has_function('public', 'save_event_table_plan', array['uuid','uuid','jsonb','boolean'], 'atomic table-plan function exists');
select ok(not has_function_privilege('authenticated','public.save_event_table_plan(uuid,uuid,jsonb,boolean)','execute'), 'authenticated clients cannot call the privileged table-plan function');
select ok(has_function_privilege('service_role','public.save_event_table_plan(uuid,uuid,jsonb,boolean)','execute'), 'only the server service role can execute the atomic table-plan function');

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('53300000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner53tables@example.invalid','',now(),now(),now()),
('53300000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner53tables@example.invalid','',now(),now(),now()),
('53300000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked53tables@example.invalid','',now(),now(),now()),
('53300000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger53tables@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name,event_type) values
('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','Tables event A','wedding'),
('53300000-0000-4000-8000-000000000011','53300000-0000-4000-8000-000000000004','Tables event B','wedding');
insert into public.event_members(event_id,user_id,role,status) values
('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000002','partner','active'),
('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000003','partner','revoked')
on conflict(event_id,user_id) do update set role = excluded.role, status = excluded.status;
insert into public.guests(id,event_id,name,guest_type,attending) values
('53300000-0000-4000-8000-000000000020','53300000-0000-4000-8000-000000000010','Guest A1','common',true),
('53300000-0000-4000-8000-000000000021','53300000-0000-4000-8000-000000000010','Guest A2','common',true),
('53300000-0000-4000-8000-000000000022','53300000-0000-4000-8000-000000000010','Guest A3','common',true),
('53300000-0000-4000-8000-000000000023','53300000-0000-4000-8000-000000000011','Guest B1','common',true);

select lives_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','[{"id":"53300000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"Owner table","tableType":"round","totalSeats":2,"assignedGuests":[{"guestId":"53300000-0000-4000-8000-000000000020","seatNumber":1}]}]'::jsonb,true)$q$,
  'owner atomically creates a table plan'
);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 1, 'owner plan creates one table');
select is((select count(*)::int from public.table_assignments where table_id = '53300000-0000-4000-8000-000000000030'), 1, 'owner plan persists its assignment');
select lives_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000002','[{"id":"53300000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"Partner update","tableType":"round","totalSeats":2,"assignedGuests":[{"guestId":"53300000-0000-4000-8000-000000000020","seatNumber":1}]}]'::jsonb,true)$q$,
  'active partner atomically updates the shared plan'
);
select is((select table_name::text from public.tables where id = '53300000-0000-4000-8000-000000000030'), 'Partner update', 'partner update is persisted');
select throws_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000003','[]'::jsonb,true)$q$,
  '42501', 'EVENT_ACCESS_DENIED', 'revoked partner cannot save a table plan'
);
select throws_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000004','[]'::jsonb,true)$q$,
  '42501', 'EVENT_ACCESS_DENIED', 'stranger cannot save another event table plan'
);

insert into public.tables(id,event_id,table_number,table_name,total_seats) values
('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000010',2,'Second table',2),
('53300000-0000-4000-8000-000000000032','53300000-0000-4000-8000-000000000011',1,'Other event table',2);
select throws_ok(
  $q$insert into public.table_assignments(table_id,guest_id,seat_number) values('53300000-0000-4000-8000-000000000030','53300000-0000-4000-8000-000000000023',2)$q$,
  '23514', 'TABLE_GUEST_EVENT_MISMATCH', 'guest and table from different events are rejected'
);
insert into public.table_assignments(table_id,guest_id,seat_number) values
('53300000-0000-4000-8000-000000000030','53300000-0000-4000-8000-000000000021',2);
select throws_ok(
  $q$insert into public.table_assignments(table_id,guest_id,seat_number) values('53300000-0000-4000-8000-000000000030','53300000-0000-4000-8000-000000000022',1)$q$,
  '23514', 'TABLE_CAPACITY_EXCEEDED', 'table capacity cannot be exceeded'
);
select throws_ok(
  $q$insert into public.table_assignments(table_id,guest_id,seat_number) values('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000022',3)$q$,
  '23514', 'TABLE_SEAT_OUT_OF_RANGE', 'seat number must fit the table capacity'
);
insert into public.table_assignments(table_id,guest_id,seat_number) values
('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000022',1);
select throws_ok(
  $q$insert into public.table_assignments(table_id,guest_id,seat_number) values('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000020',1)$q$,
  '23514', 'TABLE_SEAT_DUPLICATE', 'one table seat cannot be assigned twice'
);
select throws_ok(
  $q$insert into public.table_assignments(table_id,guest_id,seat_number) values('53300000-0000-4000-8000-000000000031','53300000-0000-4000-8000-000000000020',2)$q$,
  '23505', null, 'the same guest cannot be assigned twice'
);
select throws_ok(
  $q$update public.tables set total_seats = 1 where id = '53300000-0000-4000-8000-000000000030'$q$,
  '23514', 'TABLE_CAPACITY_BELOW_ASSIGNMENTS', 'capacity cannot be reduced below current assignments'
);
select throws_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','[{"id":"53300000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"Broken partial update","tableType":"round","totalSeats":2,"assignedGuests":[{"guestId":"53300000-0000-4000-8000-000000000023","seatNumber":1}]}]'::jsonb,true)$q$,
  '23514', 'TABLE_GUEST_EVENT_MISMATCH', 'an invalid plan rolls back the whole save'
);
select is((select table_name::text from public.tables where id = '53300000-0000-4000-8000-000000000030'), 'Partner update', 'failed save restores the prior table values');
select is((select count(*)::int from public.table_assignments where table_id = '53300000-0000-4000-8000-000000000030'), 2, 'failed save restores all prior assignments');
select lives_ok(
  $q$select public.save_event_table_plan('53300000-0000-4000-8000-000000000010','53300000-0000-4000-8000-000000000001','[{"id":"53300000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"Final table","tableType":"round","totalSeats":2,"assignedGuests":[{"guestId":"53300000-0000-4000-8000-000000000020","seatNumber":1}]}]'::jsonb,true)$q$,
  'explicit replacement succeeds atomically'
);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 1, 'explicit replacement deletes only omitted same-event tables');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53300000-0000-4000-8000-000000000001","email":"owner53tables@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 1, 'owner reads same-event tables through RLS');
select set_config('request.jwt.claims','{"sub":"53300000-0000-4000-8000-000000000002","email":"partner53tables@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 1, 'active partner reads shared tables through RLS');
select set_config('request.jwt.claims','{"sub":"53300000-0000-4000-8000-000000000003","email":"revoked53tables@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 0, 'revoked partner cannot read tables');
select set_config('request.jwt.claims','{"sub":"53300000-0000-4000-8000-000000000004","email":"stranger53tables@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 0, 'stranger cannot read cross-event tables');
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000011'), 1, 'stranger can read the table in their own event');
with deleted as (
  delete from public.tables where id = '53300000-0000-4000-8000-000000000030' returning 1
)
select is((select count(*)::int from deleted), 0, 'cross-event table deletion is denied');

set local role postgres;
delete from public.events where id = '53300000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000010'), 0, 'event deletion cascades its tables');
select is((select count(*)::int from public.table_assignments where table_id = '53300000-0000-4000-8000-000000000030'), 0, 'table deletion cascades its assignments');
select is((select count(*)::int from public.tables where event_id = '53300000-0000-4000-8000-000000000011'), 1, 'cross-event table remains intact');

select * from finish();
rollback;
