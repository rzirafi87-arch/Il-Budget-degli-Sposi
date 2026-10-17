create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(2);
insert into auth.users(id,email) values
 ('53480000-0000-4000-8000-000000000001','lifecycle-red-owner@example.invalid'),
 ('53480000-0000-4000-8000-000000000002','lifecycle-red-partner@example.invalid');
insert into public.events(id,owner_id,name,event_type) values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000001','Lifecycle RED','wedding');
insert into public.event_documents(event_id,created_by,original_name,object_path,mime_type,file_size,deletion_state)
values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000001','pending.pdf','53480000-0000-4000-8000-000000000010/pending.pdf','application/pdf',1,'pending_storage');
insert into storage.objects(bucket_id,name) values ('event-documents','53480000-0000-4000-8000-000000000010/pending.pdf');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53480000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from storage.objects where bucket_id='event-documents' and name='53480000-0000-4000-8000-000000000010/pending.pdf'),0::bigint,'tombstoned Storage read denied');
set local role postgres;
insert into private.event_document_deletions(event_id,document_id,actor_id,object_path,status) values ('53480000-0000-4000-8000-000000000010',gen_random_uuid(),'53480000-0000-4000-8000-000000000002','53480000-0000-4000-8000-000000000010/completed.pdf','completed');
select lives_ok($q$delete from auth.users where id='53480000-0000-4000-8000-000000000002'$q$,'completed document actor can delete account');
select * from finish();
rollback;
