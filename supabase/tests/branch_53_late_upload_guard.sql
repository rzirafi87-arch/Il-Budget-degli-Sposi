create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path=extensions,public,pg_catalog;
select plan(8);
insert into auth.users(id,email) values ('53430000-0000-4000-8000-000000000001','late-upload@example.invalid');
insert into public.events(id,owner_id,event_type) values ('53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001','wedding');
insert into private.event_document_upload_reservations(id,event_id,actor_id,idempotency_key,object_path,original_name,mime_type,file_size,category,status,expires_at) values
('53430000-0000-4000-8000-000000000020','53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001',gen_random_uuid(),'53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000020/expired.pdf','expired.pdf','application/pdf',1,'generic','expired',now()-interval '1 second'),
('53430000-0000-4000-8000-000000000021','53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001',gen_random_uuid(),'53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000021/released.pdf','released.pdf','application/pdf',1,'generic','released',now());
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000020/expired.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','late expired upload denied');
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000021/released.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','late released upload denied');
insert into private.event_document_upload_reservations(id,event_id,actor_id,idempotency_key,object_path,original_name,mime_type,file_size,category,expires_at) values('53430000-0000-4000-8000-000000000022','53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001',gen_random_uuid(),'53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000022/live.pdf','live.pdf','application/pdf',1,'generic',now()+interval '15 minutes');
select lives_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000022/live.pdf')$q$,'live reservation write accepted');
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000023/unreserved.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','protocol path without reservation denied');
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000022/old-path.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','rotated immutable path denied');
select lives_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/legacy.pdf')$q$,'legacy service flat path compatible');
insert into public.event_documents(event_id,created_by,original_name,object_path,mime_type,file_size) values('53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001','live.pdf','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000022/live.pdf','application/pdf',1);
update private.event_document_upload_reservations set status='finalized' where id='53430000-0000-4000-8000-000000000022';
select lives_ok($q$update storage.objects set name=name where bucket_id='event-documents' and name='53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000022/live.pdf'$q$,'active finalized metadata remains compatible');
select is((select count(*) from storage.objects where bucket_id='event-documents' and name like '53430000-0000-4000-8000-000000000010/%'),2::bigint,'only legitimate live and legacy objects exist');
select * from finish();
rollback;

