create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(34);

select has_column('public', 'event_documents', 'deletion_state', 'document metadata has an explicit deletion state');
select has_table('private', 'event_document_deletions', 'private document deletion ledger exists');
select ok(not has_table_privilege('authenticated', 'private.event_document_deletions', 'select,insert,update,delete'), 'browser roles cannot access deletion ledger');
select ok((select prosecdef from pg_proc where oid='public.delete_event_table(uuid,uuid,uuid)'::regprocedure), 'table delete RPC is security definer');
select is((select proconfig[1] from pg_proc where oid='public.delete_event_table(uuid,uuid,uuid)'::regprocedure), 'search_path=""', 'table delete RPC fixes empty search path');
select matches(
  regexp_replace(pg_get_functiondef('public.delete_event_table(uuid,uuid,uuid)'::regprocedure), '[[:space:]]+', ' ', 'g'),
  '(?i)from public.events .+ for update',
  'table delete locks the event row'
);
select ok((select prosecdef from pg_proc where oid='public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure), 'document begin RPC is security definer');
select ok((select prosecdef from pg_proc where oid='public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure), 'document complete RPC is security definer');
select is((select proconfig[1] from pg_proc where oid='public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure), 'search_path=""', 'document begin fixes empty search path');
select is((select proconfig[1] from pg_proc where oid='public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure), 'search_path=""', 'document complete fixes empty search path');
select ok(not exists (
  select 1 from unnest(array[
    'public.delete_event_table(uuid,uuid,uuid)'::regprocedure,
    'public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure,
    'public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where has_function_privilege('authenticated', function_oid, 'execute')
), 'authenticated cannot execute privileged delete RPCs');
select ok(not exists (
  select 1 from unnest(array[
    'public.delete_event_table(uuid,uuid,uuid)'::regprocedure,
    'public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure,
    'public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where has_function_privilege('anon', function_oid, 'execute')
), 'anonymous cannot execute privileged delete RPCs');
select ok(not exists (
  select 1 from pg_proc p
  cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) privilege
  where p.oid = any(array[
    'public.delete_event_table(uuid,uuid,uuid)'::regprocedure,
    'public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure,
    'public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure
  ]) and privilege.grantee=0 and privilege.privilege_type='EXECUTE'
), 'PUBLIC has no execute grant on delete RPCs');
select ok(not exists (
  select 1 from unnest(array[
    'public.delete_event_table(uuid,uuid,uuid)'::regprocedure,
    'public.begin_event_document_delete(uuid,uuid,uuid)'::regprocedure,
    'public.complete_event_document_delete(uuid,uuid,uuid,uuid,text)'::regprocedure
  ]) function_oid where not has_function_privilege('service_role', function_oid, 'execute')
), 'service role has the explicit delete RPC grants');

insert into auth.users(id,email) values
  ('53900000-0000-4000-8000-000000000001','delete-test-owner@example.invalid'),
  ('53900000-0000-4000-8000-000000000002','delete-test-partner@example.invalid'),
  ('53900000-0000-4000-8000-000000000003','delete-test-legacy@example.invalid'),
  ('53900000-0000-4000-8000-000000000004','delete-test-left@example.invalid'),
  ('53900000-0000-4000-8000-000000000005','delete-test-other@example.invalid');
insert into public.events(id,owner_id,name,event_type,groom_email) values
  ('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','Delete test A','wedding','delete-test-legacy@example.invalid'),
  ('53900000-0000-4000-8000-000000000011','53900000-0000-4000-8000-000000000005','Delete test B','wedding',null);
insert into public.event_members(event_id,user_id,role,status) values
  ('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000002','partner','active'),
  ('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000004','partner','left');
insert into public.tables(id,event_id,table_number,table_name,total_seats) values
  ('53900000-0000-4000-8000-000000000020','53900000-0000-4000-8000-000000000010',1,'Owner delete',1),
  ('53900000-0000-4000-8000-000000000021','53900000-0000-4000-8000-000000000010',2,'Partner delete',1),
  ('53900000-0000-4000-8000-000000000022','53900000-0000-4000-8000-000000000010',3,'Legacy delete',1),
  ('53900000-0000-4000-8000-000000000023','53900000-0000-4000-8000-000000000010',4,'Denied delete',1),
  ('53900000-0000-4000-8000-000000000024','53900000-0000-4000-8000-000000000011',1,'Other event',1);

select is((public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','53900000-0000-4000-8000-000000000020')->>'status'), 'deleted', 'owner table delete succeeds');
select is((public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000002','53900000-0000-4000-8000-000000000021')->>'status'), 'deleted', 'partner table delete succeeds');
select is((public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000003','53900000-0000-4000-8000-000000000022')->>'status'), 'deleted', 'legacy table delete succeeds');
select is((public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','53900000-0000-4000-8000-000000000020')->>'status'), 'already_deleted', 'table delete retry is idempotent');
select throws_ok(
  $q$select public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000004','53900000-0000-4000-8000-000000000023')$q$,
  '42501','EVENT_ACCESS_DENIED','left actor cannot delete a table'
);
select throws_ok(
  $q$select public.delete_event_table('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','53900000-0000-4000-8000-000000000024')$q$,
  '42501','TABLE_EVENT_MISMATCH','cross-event table ID is denied'
);

insert into public.event_documents(id,event_id,created_by,original_name,object_path,category,mime_type,file_size) values
  ('53900000-0000-4000-8000-000000000030','53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','delete.pdf','53900000-0000-4000-8000-000000000010/delete/delete.pdf','generic','application/pdf',1024),
  ('53900000-0000-4000-8000-000000000031','53900000-0000-4000-8000-000000000011','53900000-0000-4000-8000-000000000005','other.pdf','53900000-0000-4000-8000-000000000011/delete/other.pdf','generic','application/pdf',1024);
insert into storage.objects(bucket_id,name,metadata) values
  ('event-documents','53900000-0000-4000-8000-000000000010/delete/delete.pdf','{"size":1024}'::jsonb),
  ('event-documents','53900000-0000-4000-8000-000000000011/delete/other.pdf','{"size":1024}'::jsonb);

create temporary table delete_result as
select public.begin_event_document_delete(
  '53900000-0000-4000-8000-000000000010',
  '53900000-0000-4000-8000-000000000001',
  '53900000-0000-4000-8000-000000000030'
) result;

select is((select result->>'status' from delete_result), 'pending_storage', 'delete begin returns explicit pending state');
select is((select deletion_state from public.event_documents where id='53900000-0000-4000-8000-000000000030'), 'pending_storage', 'delete begin tombstones metadata before Storage');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53900000-0000-4000-8000-000000000001","email":"delete-test-owner@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_documents where id='53900000-0000-4000-8000-000000000030'), 0, 'RLS no longer exposes tombstoned metadata as active');
set local role postgres;
select is((select count(*)::int from private.event_document_deletions where document_id='53900000-0000-4000-8000-000000000030'), 1, 'delete begin creates one ledger operation');
select is(
  (public.begin_event_document_delete('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000002','53900000-0000-4000-8000-000000000030')->>'operationId'),
  (select result->>'operationId' from delete_result),
  'duplicate partner intent reuses the operation'
);
select throws_ok(
  format(
    'select public.complete_event_document_delete(%L,%L,%L,%L,%L)',
    '53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001',
    (select result->>'operationId' from delete_result),'53900000-0000-4000-8000-000000000030',
    '53900000-0000-4000-8000-000000000010/delete/delete.pdf'
  ),
  '55000','DOCUMENT_OBJECT_STILL_PRESENT','completion waits until Storage is absent'
);
select throws_ok(
  $q$select public.begin_event_document_delete('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','53900000-0000-4000-8000-000000000031')$q$,
  '42501','DOCUMENT_EVENT_MISMATCH','cross-event document ID is denied'
);
select throws_ok(
  $q$select public.begin_event_document_delete('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000004','53900000-0000-4000-8000-000000000030')$q$,
  '42501','EVENT_ACCESS_DENIED','left actor cannot begin document deletion'
);
select throws_ok(
  format(
    'select public.complete_event_document_delete(%L,%L,%L,%L,%L)',
    '53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001',
    (select result->>'operationId' from delete_result),'53900000-0000-4000-8000-000000000030',
    '53900000-0000-4000-8000-000000000010/manipulated.pdf'
  ),
  '42501','DOCUMENT_DELETE_MISMATCH','manipulated object key is denied'
);

set local session_replication_role=replica;
delete from storage.objects where bucket_id='event-documents' and name='53900000-0000-4000-8000-000000000010/delete/delete.pdf';
set local session_replication_role=origin;

select is(
  (public.complete_event_document_delete(
    '53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000003',
    (select (result->>'operationId')::uuid from delete_result),
    '53900000-0000-4000-8000-000000000030','53900000-0000-4000-8000-000000000010/delete/delete.pdf'
  )->>'status'),
  'completed','legacy collaborator can complete a secured deletion'
);
select is((select count(*)::int from public.event_documents where id='53900000-0000-4000-8000-000000000030'), 0, 'completed delete removes tombstoned metadata');
select is((select status from private.event_document_deletions where document_id='53900000-0000-4000-8000-000000000030'), 'completed', 'ledger records final completion');
select is(
  (public.complete_event_document_delete(
    '53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001',
    (select (result->>'operationId')::uuid from delete_result),
    '53900000-0000-4000-8000-000000000030','53900000-0000-4000-8000-000000000010/delete/delete.pdf'
  )->>'status'),
  'completed','completion retry is idempotent'
);
select is(
  (public.begin_event_document_delete('53900000-0000-4000-8000-000000000010','53900000-0000-4000-8000-000000000001','53900000-0000-4000-8000-000000000030')->>'status'),
  'completed','begin retry after finalization reports completed'
);

select * from finish();
rollback;
