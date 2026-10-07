create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(3);
select ok(not has_table_privilege('authenticated', 'public.tables', 'DELETE'), 'browser direct table DELETE denied');
insert into auth.users(id,email) values ('53490000-0000-4000-8000-000000000001','followup-red@example.invalid');
insert into public.events(id,owner_id,name,event_type) values ('53490000-0000-4000-8000-000000000010','53490000-0000-4000-8000-000000000001','RED','wedding');
insert into public.event_documents(event_id,created_by,original_name,object_path,mime_type,file_size)
values ('53490000-0000-4000-8000-000000000010','53490000-0000-4000-8000-000000000001','test.pdf','53490000-0000-4000-8000-000000000010/test.pdf','application/pdf',1);
select throws_ok($q$delete from public.events where id='53490000-0000-4000-8000-000000000010'$q$, '55000', 'EVENT_DOCUMENT_CLEANUP_REQUIRED', 'metadata survives an unsafe event cascade');
select throws_ok($q$insert into storage.objects(bucket_id,name) values ('event-documents','53490000-0000-4000-8000-000000000099/late.pdf')$q$, '23503', 'DOCUMENT_EVENT_NOT_FOUND', 'late Storage write requires an existing event');
select * from finish();
rollback;
