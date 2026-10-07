create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(16);
select ok(not has_table_privilege('authenticated', 'public.tables', 'DELETE'), 'authenticated cannot bypass table delete RPC');
select ok(not has_table_privilege('anon', 'public.tables', 'DELETE'), 'anonymous cannot delete tables');
select ok(has_table_privilege('service_role', 'public.tables', 'DELETE'), 'old and new server APIs retain table DELETE');
select has_trigger('public', 'events', 'event_document_cascade_guard', 'event cascade is guarded');
select has_trigger('storage', 'objects', 'event_document_storage_parent_guard', 'late Storage writes lock parent');
select matches(regexp_replace(pg_get_functiondef('private.guard_event_document_storage_parent()'::regprocedure), '[[:space:]]+', ' ', 'g'), '(?i)from public.events .+ for update', 'Storage insert serializes with event cascade');
select ok(not has_function_privilege('authenticated', 'private.guard_event_document_cascade()', 'EXECUTE'), 'browser cannot call cascade guard');
select ok(not has_function_privilege('authenticated', 'private.guard_event_document_storage_parent()', 'EXECUTE'), 'browser cannot call Storage guard');
insert into auth.users(id,email) values ('53490000-0000-4000-8000-000000000001','followup@example.invalid');
insert into public.events(id,owner_id,name,event_type) values
 ('53490000-0000-4000-8000-000000000010','53490000-0000-4000-8000-000000000001','Followup','wedding'),
 ('53490000-0000-4000-8000-000000000011','53490000-0000-4000-8000-000000000001','Clean','wedding');
insert into public.event_documents(id,event_id,created_by,original_name,object_path,mime_type,file_size)
values ('53490000-0000-4000-8000-000000000020','53490000-0000-4000-8000-000000000010','53490000-0000-4000-8000-000000000001','test.pdf','53490000-0000-4000-8000-000000000010/test.pdf','application/pdf',1);
select throws_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000010'$q$, '55000', 'EVENT_DOCUMENT_CLEANUP_REQUIRED', 'event delete cannot discard document metadata');
select is((select count(*) from public.event_documents where event_id='53490000-0000-4000-8000-000000000010'), 1::bigint, 'metadata remains retryable');
delete from public.event_documents where event_id='53490000-0000-4000-8000-000000000010';
insert into private.event_document_upload_reservations(event_id,actor_id,idempotency_key,object_path,original_name,mime_type,file_size,category,expires_at)
values ('53490000-0000-4000-8000-000000000010','53490000-0000-4000-8000-000000000001',gen_random_uuid(),'53490000-0000-4000-8000-000000000010/upload.pdf','upload.pdf','application/pdf',1,'generic',now()+interval '15 minutes');
select throws_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000010'$q$, '55000', 'EVENT_DOCUMENT_CLEANUP_REQUIRED', 'in-flight upload blocks cascade');
update private.event_document_upload_reservations set status='released' where event_id='53490000-0000-4000-8000-000000000010';
insert into storage.objects(bucket_id,name) values ('event-documents','53490000-0000-4000-8000-000000000010/orphan.pdf');
select throws_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000010'$q$, '55000', 'EVENT_DOCUMENT_CLEANUP_REQUIRED', 'Storage object without metadata blocks cascade');
select lives_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000011'$q$, 'foreign event objects do not block clean event deletion');
-- SQL fixture represents no physical blob; cleanup stays inside rolled-back test.
set local session_replication_role=replica;
delete from storage.objects where bucket_id='event-documents' and name='53490000-0000-4000-8000-000000000010/orphan.pdf';
set local session_replication_role=origin;
select lives_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000010'$q$, 'cleaned event can cascade');
select throws_ok($q$insert into storage.objects(bucket_id,name) values ('event-documents','53490000-0000-4000-8000-000000000010/late.pdf')$q$, '23503', 'DOCUMENT_EVENT_NOT_FOUND', 'delayed upload cannot orphan Storage after deletion');
select is((select count(*) from private.event_document_upload_reservations where event_id='53490000-0000-4000-8000-000000000010'), 0::bigint, 'terminal ledger cascades only after cleanup');
select * from finish();
rollback;
