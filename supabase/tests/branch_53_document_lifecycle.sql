create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(9);
select col_is_null('private','event_document_deletions','actor_id','cleanup actor can be anonymized');
select is((select confdeltype::text from pg_constraint where conrelid='private.event_document_deletions'::regclass and conname='event_document_deletions_actor_id_fkey'),'n','actor foreign key uses SET NULL');
insert into auth.users(id,email) values
 ('53480000-0000-4000-8000-000000000001','lifecycle-owner@example.invalid'),
 ('53480000-0000-4000-8000-000000000002','lifecycle-partner@example.invalid');
insert into public.events(id,owner_id,name,event_type) values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000001','Lifecycle','wedding');
insert into public.event_members(event_id,user_id,role,status) values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000002','partner','active');
insert into public.event_documents(event_id,created_by,original_name,object_path,mime_type,file_size)
values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000001','doc.pdf','53480000-0000-4000-8000-000000000010/doc.pdf','application/pdf',1);
insert into storage.objects(bucket_id,name) values ('event-documents','53480000-0000-4000-8000-000000000010/doc.pdf');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53480000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from storage.objects where name='53480000-0000-4000-8000-000000000010/doc.pdf'),1::bigint,'active document remains readable');
set local role postgres;
update public.event_documents set deletion_state='pending_storage' where event_id='53480000-0000-4000-8000-000000000010';
set local role authenticated;
select is((select count(*) from storage.objects where name='53480000-0000-4000-8000-000000000010/doc.pdf'),0::bigint,'owner cannot read tombstoned object');
select set_config('request.jwt.claims','{"sub":"53480000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from storage.objects where name='53480000-0000-4000-8000-000000000010/doc.pdf'),0::bigint,'partner cannot read tombstoned object');
set local role postgres;
insert into private.event_document_deletions(event_id,document_id,actor_id,object_path,status) values ('53480000-0000-4000-8000-000000000010','53480000-0000-4000-8000-000000000020','53480000-0000-4000-8000-000000000002','53480000-0000-4000-8000-000000000010/completed.pdf','completed');
select lives_ok($q$delete from auth.users where id='53480000-0000-4000-8000-000000000002'$q$,'completed deletion does not block actor account removal');
select is((select count(*) from auth.users where id='53480000-0000-4000-8000-000000000002'),0::bigint,'partner account is removed');
select is((select count(*) from private.event_document_deletions where document_id='53480000-0000-4000-8000-000000000020'),1::bigint,'idempotency ledger is retained');
select ok((select actor_id is null from private.event_document_deletions where document_id='53480000-0000-4000-8000-000000000020'),'removed actor is anonymized');
select * from finish();
rollback;
