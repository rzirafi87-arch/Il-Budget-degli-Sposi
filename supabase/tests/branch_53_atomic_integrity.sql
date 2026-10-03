create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(52);

select has_table('private', 'event_document_upload_reservations', 'server-controlled reservation ledger exists');
select ok(not has_table_privilege('authenticated', 'private.event_document_upload_reservations', 'select,insert,update,delete'), 'browser roles cannot access the reservation ledger');
select has_index('public', 'table_assignments', 'table_assignments_table_seat_unique_idx', 'assigned seat uniqueness is indexed');
select matches(pg_get_functiondef('public.validate_table_assignment_event_capacity()'::regprocedure), '(?i)for[[:space:]]+update', 'capacity trigger locks its parent table row');
select ok((select prosecdef from pg_proc where oid = 'private.event_access_role_for_actor(uuid,uuid)'::regprocedure), 'shared authorization helper is security definer');
select is((select proconfig[1] from pg_proc where oid = 'private.event_access_role_for_actor(uuid,uuid)'::regprocedure), 'search_path=""', 'authorization helper fixes an empty search path');
select ok((select prosecdef from pg_proc where oid = 'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure), 'reserve RPC is security definer');
select is((select proconfig[1] from pg_proc where oid = 'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure), 'search_path=""', 'reserve RPC fixes an empty search path');
select ok(not exists (
  select 1 from unnest(array[
    'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure,
    'public.finalize_event_document_upload(uuid,uuid,uuid,text,bigint)'::regprocedure,
    'public.release_event_document_upload(uuid,uuid,uuid,text)'::regprocedure,
    'public.claim_expired_event_document_uploads(uuid,uuid,integer)'::regprocedure,
    'public.complete_event_document_upload_cleanup(uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where has_function_privilege('authenticated', function_oid, 'execute')
), 'authenticated cannot execute privileged document RPCs');
select ok(not exists (
  select 1 from unnest(array[
    'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure,
    'public.finalize_event_document_upload(uuid,uuid,uuid,text,bigint)'::regprocedure,
    'public.release_event_document_upload(uuid,uuid,uuid,text)'::regprocedure,
    'public.claim_expired_event_document_uploads(uuid,uuid,integer)'::regprocedure,
    'public.complete_event_document_upload_cleanup(uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where has_function_privilege('anon', function_oid, 'execute')
), 'anonymous cannot execute privileged document RPCs');
select ok(not exists (
  select 1
  from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
  where p.oid = any(array[
    'public.save_event_table_plan(uuid,uuid,jsonb,boolean)'::regprocedure,
    'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure,
    'public.finalize_event_document_upload(uuid,uuid,uuid,text,bigint)'::regprocedure,
    'public.release_event_document_upload(uuid,uuid,uuid,text)'::regprocedure,
    'public.claim_expired_event_document_uploads(uuid,uuid,integer)'::regprocedure,
    'public.complete_event_document_upload_cleanup(uuid,uuid,uuid,text)'::regprocedure
  ])
    and privilege.grantee = 0
    and privilege.privilege_type = 'EXECUTE'
), 'PUBLIC has no execute grant on privileged mutation RPCs');
select ok(not exists (
  select 1 from unnest(array[
    'public.reserve_event_document_upload(uuid,uuid,uuid,bigint,text,text,text,text,integer)'::regprocedure,
    'public.finalize_event_document_upload(uuid,uuid,uuid,text,bigint)'::regprocedure,
    'public.release_event_document_upload(uuid,uuid,uuid,text)'::regprocedure,
    'public.claim_expired_event_document_uploads(uuid,uuid,integer)'::regprocedure,
    'public.complete_event_document_upload_cleanup(uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where not has_function_privilege('service_role', function_oid, 'execute')
), 'service role has only the explicit privileged document RPC entrypoints');
select ok(not has_table_privilege('authenticated', 'public.event_documents', 'insert,delete'), 'metadata writes are server-only');
select is((select count(*)::int from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'event_documents_storage_%'), 1, 'browser Storage access is read-only');

insert into auth.users(id,email) values
  ('53700000-0000-4000-8000-000000000001','atomic-owner@example.invalid'),
  ('53700000-0000-4000-8000-000000000002','atomic-partner@example.invalid'),
  ('53700000-0000-4000-8000-000000000003','atomic-legacy@example.invalid'),
  ('53700000-0000-4000-8000-000000000004','atomic-left@example.invalid'),
  ('53700000-0000-4000-8000-000000000005','atomic-revoked@example.invalid'),
  ('53700000-0000-4000-8000-000000000006','atomic-stranger@example.invalid');
insert into public.events(id,owner_id,name,event_type,groom_email) values
  ('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','Atomic A','wedding','atomic-legacy@example.invalid'),
  ('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006','Atomic B','wedding','atomic-legacy@example.invalid');
insert into public.event_members(event_id,user_id,role,status) values
  ('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000002','partner','active'),
  ('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000004','partner','left'),
  ('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000005','partner','revoked');
delete from public.event_members
where event_id='53700000-0000-4000-8000-000000000010'
  and user_id='53700000-0000-4000-8000-000000000001';

select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001'), 'owner', 'events owner fallback works without canonical membership');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000002'), 'partner', 'active canonical partner is authorized');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000003'), 'legacy', 'legitimate legacy collaborator is authorized');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000004'), null::text, 'left membership suppresses legacy fallback');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000005'), null::text, 'revoked membership is denied');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000006'), null::text, 'non-member is denied');
select is(private.event_access_role_for_actor('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006'), 'owner', 'authorization remains event-scoped');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53700000-0000-4000-8000-000000000003","email":"atomic-legacy@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.events where id='53700000-0000-4000-8000-000000000010'), 1, 'legacy collaborator receives the same RLS event access');
set local role postgres;

insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size)
select '53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001',
  'baseline-' || n || '.pdf','53700000-0000-4000-8000-000000000010/baseline-' || n || '/file.pdf',
  'generic','application/pdf',10485760
from generate_series(1,9) n;

select lives_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','53700000-0000-4000-8001-000000000001',10485760,'exact.pdf','application/pdf','generic',null,900)$q$,
  'quota can be reserved exactly to 100 MiB'
);
select is(
  (select sum(file_size)::bigint from public.event_documents where event_id='53700000-0000-4000-8000-000000000010') +
  (select sum(file_size)::bigint from private.event_document_upload_reservations where event_id='53700000-0000-4000-8000-000000000010' and status='active'),
  104857600::bigint,
  'persistent and active reserved bytes sum to the exact quota'
);
select throws_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','53700000-0000-4000-8001-000000000002',1,'overflow.pdf','application/pdf','generic',null,900)$q$,
  '23514', 'EVENT_DOCUMENT_QUOTA_EXCEEDED', 'one byte over quota is denied'
);
select is(
  (public.reserve_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','53700000-0000-4000-8001-000000000001',10485760,'exact.pdf','application/pdf','generic',null,900)->>'reservationId')::uuid,
  (select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),
  'same idempotency key and payload replays one reservation'
);
select throws_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','53700000-0000-4000-8001-000000000001',10485759,'exact.pdf','application/pdf','generic',null,900)$q$,
  '22023', 'DOCUMENT_IDEMPOTENCY_CONFLICT', 'mutated idempotent payload is rejected'
);
select alike(
  (select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),
  '53700000-0000-4000-8000-000000000010/%/%.pdf',
  'object key is event-scoped and opaque'
);
select throws_ok(
  $q$select public.finalize_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),'53700000-0000-4000-8000-000000000010/manipulated/file.pdf',10485760)$q$,
  '42501', 'DOCUMENT_RESERVATION_MISMATCH', 'manipulated object key is denied'
);
insert into storage.objects(bucket_id,name,metadata)
select 'event-documents', object_path, jsonb_build_object('size', file_size)
from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001';
select lives_ok(
  $q$select public.finalize_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),(select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),10485760)$q$,
  'matching Storage object finalizes atomically'
);
select is((select count(*)::int from public.event_documents where event_id='53700000-0000-4000-8000-000000000010'), 10, 'finalize inserts exactly one metadata row');
select lives_ok(
  $q$select public.finalize_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),(select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000001'),10485760)$q$,
  'finalize retry is idempotent'
);
delete from public.event_documents
where event_id='53700000-0000-4000-8000-000000000010' and original_name='baseline-1.pdf';
select lives_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000002','53700000-0000-4000-8001-000000000007',10485760,'recovered.pdf','application/pdf','generic',null,900)$q$,
  'document deletion recovers quota for an active partner'
);

select lives_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006','53700000-0000-4000-8001-000000000003',1,'release.pdf','application/pdf','generic',null,900)$q$,
  'second event reserves independently'
);
select lives_ok(
  $q$select public.release_event_document_upload('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000003'),(select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000003'))$q$,
  'failed upload releases its reservation'
);
select lives_ok(
  $q$select public.release_event_document_upload('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000003'),(select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000003'))$q$,
  'release retry is idempotent'
);
insert into private.event_document_upload_reservations(event_id,actor_id,idempotency_key,object_path,original_name,category,mime_type,file_size,expires_at)
values('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006','53700000-0000-4000-8001-000000000004','53700000-0000-4000-8000-000000000011/expired/file.pdf','expired.pdf','generic','application/pdf',1,now()-interval '1 minute');
select is(jsonb_array_length(public.claim_expired_event_document_uploads('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006',20)), 1, 'expired reservation is claimed for cleanup');
select lives_ok(
  $q$select public.complete_event_document_upload_cleanup('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000006',(select id from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000004'),(select object_path from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000004'))$q$,
  'cleanup completion closes an expired reservation'
);
select is((select status from private.event_document_upload_reservations where idempotency_key='53700000-0000-4000-8001-000000000004'), 'expired', 'expired cleanup leaves no active quota hold');
select lives_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000003','53700000-0000-4000-8001-000000000005',1,'legacy.pdf','application/pdf','generic',null,900)$q$,
  'legacy collaborator uses the same document protocol'
);
select throws_ok(
  $q$select public.reserve_event_document_upload('53700000-0000-4000-8000-000000000011','53700000-0000-4000-8000-000000000001','53700000-0000-4000-8001-000000000006',1,'cross.pdf','application/pdf','generic',null,900)$q$,
  '42501', 'EVENT_ACCESS_DENIED', 'cross-event actor is denied'
);

insert into public.guests(id,event_id,name,guest_type,attending) values
  ('53700000-0000-4000-8000-000000000020','53700000-0000-4000-8000-000000000010','Guest 1','common',true),
  ('53700000-0000-4000-8000-000000000021','53700000-0000-4000-8000-000000000010','Guest 2','common',true),
  ('53700000-0000-4000-8000-000000000022','53700000-0000-4000-8000-000000000010','Guest 3','common',true),
  ('53700000-0000-4000-8000-000000000023','53700000-0000-4000-8000-000000000011','Other guest','common',true);
select lives_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"id":"53700000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"One","totalSeats":2,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000020","seatNumber":1}]},{"id":"53700000-0000-4000-8000-000000000031","tableNumber":2,"tableName":"Two","totalSeats":2,"assignedGuests":[]}]'::jsonb,true)$q$,
  'initial complete table plan saves'
);
select lives_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"id":"53700000-0000-4000-8000-000000000030","tableNumber":2,"tableName":"One","totalSeats":2,"assignedGuests":[]},{"id":"53700000-0000-4000-8000-000000000031","tableNumber":1,"tableName":"Two","totalSeats":2,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000021","seatNumber":1}]}]'::jsonb,true)$q$,
  'table numbers can be swapped without transient uniqueness conflicts'
);
select is((select string_agg(id::text || ':' || table_number::text, ',' order by id) from public.tables where event_id='53700000-0000-4000-8000-000000000010'), '53700000-0000-4000-8000-000000000030:2,53700000-0000-4000-8000-000000000031:1', 'swapped table plan is deterministic');
select throws_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"tableNumber":1,"totalSeats":1,"assignedGuests":[]},{"tableNumber":1,"totalSeats":1,"assignedGuests":[]}]'::jsonb,true)$q$,
  '22023', 'DUPLICATE_TABLE_NUMBER', 'duplicate table numbers are rejected before mutation'
);
select throws_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"tableNumber":1,"totalSeats":2,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000020"},{"guestId":"53700000-0000-4000-8000-000000000020"}]}]'::jsonb,true)$q$,
  '22023', 'GUEST_ALREADY_ASSIGNED', 'duplicate guests are rejected before mutation'
);
select throws_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"tableNumber":1,"totalSeats":1,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000023"}]}]'::jsonb,true)$q$,
  '23514', 'TABLE_GUEST_EVENT_MISMATCH', 'cross-event guest is rejected before mutation'
);
select throws_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"tableNumber":1,"totalSeats":1,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000020"},{"guestId":"53700000-0000-4000-8000-000000000021"}]}]'::jsonb,true)$q$,
  '23514', 'TABLE_CAPACITY_EXCEEDED', 'capacity plus one is rejected before mutation'
);
select is((select count(*)::int from public.tables where event_id='53700000-0000-4000-8000-000000000010'), 2, 'failed plans roll back and preserve the prior complete plan');
select lives_ok(
  $q$select public.save_event_table_plan('53700000-0000-4000-8000-000000000010','53700000-0000-4000-8000-000000000001','[{"id":"53700000-0000-4000-8000-000000000030","tableNumber":1,"tableName":"Final","totalSeats":2,"assignedGuests":[{"guestId":"53700000-0000-4000-8000-000000000020","seatNumber":1},{"guestId":"53700000-0000-4000-8000-000000000021","seatNumber":2}]}]'::jsonb,true)$q$,
  'exact-capacity replacement succeeds'
);
select is((select count(*)::int from public.tables where event_id='53700000-0000-4000-8000-000000000010'), 1, 'replacement deletes obsolete tables');
select is((select count(*)::int from public.table_assignments a join public.tables t on t.id=a.table_id where t.event_id='53700000-0000-4000-8000-000000000010'), 2, 'exact-capacity assignments persist once each');

select * from finish();
rollback;
