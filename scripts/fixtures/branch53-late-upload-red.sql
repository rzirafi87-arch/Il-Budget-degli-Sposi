create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path=extensions,public,pg_catalog;
select plan(2);
insert into auth.users(id,email) values ('53430000-0000-4000-8000-000000000001','late-upload@example.invalid');
insert into public.events(id,owner_id,event_type) values ('53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001','wedding');
insert into private.event_document_upload_reservations(id,event_id,actor_id,idempotency_key,object_path,original_name,mime_type,file_size,category,status,expires_at) values
('53430000-0000-4000-8000-000000000020','53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001',gen_random_uuid(),'53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000020/expired.pdf','expired.pdf','application/pdf',1,'generic','expired',now()-interval '1 second'),
('53430000-0000-4000-8000-000000000021','53430000-0000-4000-8000-000000000010','53430000-0000-4000-8000-000000000001',gen_random_uuid(),'53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000021/released.pdf','released.pdf','application/pdf',1,'generic','released',now());
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000020/expired.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','late expired upload denied');
select throws_ok($q$insert into storage.objects(bucket_id,name) values('event-documents','53430000-0000-4000-8000-000000000010/53430000-0000-4000-8000-000000000021/released.pdf')$q$,'55000','DOCUMENT_UPLOAD_RESERVATION_NOT_ACTIVE','late released upload denied');
select * from finish();
rollback;
