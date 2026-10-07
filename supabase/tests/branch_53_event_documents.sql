create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(39);

select has_table('public', 'event_documents', 'event documents table exists');
select is(
  (select count(*)::int from information_schema.columns
   where table_schema = 'public' and table_name = 'event_documents'
     and column_name in ('id','event_id','created_by','original_name','object_path','category','mime_type','file_size','notes','created_at')),
  10,
  'event documents exposes the expected columns'
);
select is(
  (select count(*)::int from pg_constraint where conrelid = 'public.event_documents'::regclass and contype = 'p'),
  1,
  'event documents has one primary key'
);
select is(
  (select count(*)::int from pg_constraint where conrelid = 'public.event_documents'::regclass and contype = 'f'),
  2,
  'event documents has event and creator foreign keys'
);
select is(
  (select count(*)::int from pg_constraint where conrelid = 'public.event_documents'::regclass and contype = 'u'),
  1,
  'object path is unique'
);
select ok(
  (select count(*) >= 5 from pg_constraint where conrelid = 'public.event_documents'::regclass and contype = 'c'),
  'document metadata has validation constraints'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.event_documents'::regclass),
  'event documents has RLS enabled'
);
select is(
  (select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'event_documents'),
  1,
  'event documents exposes only its event-scoped select policy'
);
select ok(not has_table_privilege('anon', 'public.event_documents', 'select'), 'anonymous has no document read grant');
select ok(not has_table_privilege('anon', 'public.event_documents', 'insert'), 'anonymous has no document insert grant');
select ok(not has_table_privilege('anon', 'public.event_documents', 'delete'), 'anonymous has no document delete grant');
select ok(not has_table_privilege('authenticated', 'public.event_documents', 'insert,update,delete'), 'authenticated users cannot mutate server-controlled metadata directly');
select is((select public from storage.buckets where id = 'event-documents'), false, 'document bucket is private');
select is((select file_size_limit from storage.buckets where id = 'event-documents'), 10485760::bigint, 'document bucket enforces 10 MB');
select is(
  (select allowed_mime_types from storage.buckets where id = 'event-documents'),
  array['application/pdf','image/jpeg','image/png']::text[],
  'document bucket restricts MIME types'
);
select is(
  (select count(*)::int from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'event_documents_storage_%'),
  1,
  'storage exposes only its event-scoped select policy'
);
select is(
  (select count(*)::int from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname like 'event_documents_storage_%'
     and coalesce(qual, with_check, '') like '%can_access_event%'
     and coalesce(qual, with_check, '') like '%foldername%'),
  1,
  'the document storage read policy derives access from the event path prefix'
);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('53100000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner53docs@example.invalid','',now(),now(),now()),
('53100000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','partner53docs@example.invalid','',now(),now(),now()),
('53100000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','revoked53docs@example.invalid','',now(),now(),now()),
('53100000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','stranger53docs@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type) values
('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','Documents A','wedding'),
('53100000-0000-4000-8000-000000000011','53100000-0000-4000-8000-000000000004','Documents B','wedding');

insert into public.event_members(event_id,user_id,role,status) values
('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000002','partner','active'),
('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000003','partner','revoked')
on conflict(event_id,user_id) do update set role = excluded.role, status = excluded.status;

set local role anon;
select throws_ok(
  $q$select * from public.event_documents$q$,
  '42501', null, 'anonymous cannot read document metadata'
);
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','anon.pdf','53100000-0000-4000-8000-000000000010/anon/anon.pdf','generic','application/pdf',1)$q$,
  '42501', null, 'anonymous cannot write document metadata'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53100000-0000-4000-8000-000000000001","email":"owner53docs@example.invalid","role":"authenticated"}',true);
select throws_ok(
  $q$insert into public.event_documents(id,event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000020','53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','owner.pdf','53100000-0000-4000-8000-000000000010/53100000-0000-4000-8000-000000000020/owner.pdf','contract','application/pdf',1024)$q$,
  '42501', null, 'owner cannot insert server-controlled metadata directly'
);
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000010'), 0, 'denied owner insert creates no metadata');

set local role postgres;
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','bad.exe','53100000-0000-4000-8000-000000000010/bad/bad.exe','generic','application/octet-stream',1)$q$,
  '23514', null, 'invalid MIME is rejected by the database'
);
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','large.pdf','53100000-0000-4000-8000-000000000010/large/large.pdf','generic','application/pdf',10485761)$q$,
  '23514', null, 'files larger than 10 MB are rejected by the database'
);
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','wrong.pdf','53100000-0000-4000-8000-000000000011/wrong/wrong.pdf','generic','application/pdf',1)$q$,
  '23514', null, 'object path must start with its event id'
);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53100000-0000-4000-8000-000000000001","email":"owner53docs@example.invalid","role":"authenticated"}',true);
select throws_ok(
  $q$delete from public.event_documents where id = '53100000-0000-4000-8000-000000000020'$q$,
  '42501', null, 'owner cannot delete server-controlled metadata directly'
);
select is((select count(*)::int from public.event_documents where id = '53100000-0000-4000-8000-000000000020'), 0, 'denied owner mutation leaves no metadata');

select set_config('request.jwt.claims','{"sub":"53100000-0000-4000-8000-000000000002","email":"partner53docs@example.invalid","role":"authenticated"}',true);
select throws_ok(
  $q$insert into public.event_documents(id,event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000021','53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000002','partner.png','53100000-0000-4000-8000-000000000010/53100000-0000-4000-8000-000000000021/partner.png','receipt','image/png',2048)$q$,
  '42501', null, 'active partner cannot insert server-controlled metadata directly'
);
select is((select count(*)::int from public.event_documents where id = '53100000-0000-4000-8000-000000000021'), 0, 'denied partner insert creates no metadata');
select throws_ok(
  $q$delete from public.event_documents where id = '53100000-0000-4000-8000-000000000021'$q$,
  '42501', null, 'active partner cannot delete server-controlled metadata directly'
);
select is((select count(*)::int from public.event_documents where id = '53100000-0000-4000-8000-000000000021'), 0, 'denied partner deletion leaves metadata unchanged');

set local role postgres;
insert into public.event_documents(id,event_id,created_by,original_name,object_path,category,mime_type,file_size) values
('53100000-0000-4000-8000-000000000022','53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000001','protected.jpg','53100000-0000-4000-8000-000000000010/53100000-0000-4000-8000-000000000022/protected.jpg','generic','image/jpeg',3000),
('53100000-0000-4000-8000-000000000023','53100000-0000-4000-8000-000000000011','53100000-0000-4000-8000-000000000004','other.pdf','53100000-0000-4000-8000-000000000011/53100000-0000-4000-8000-000000000023/other.pdf','generic','application/pdf',3000);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"53100000-0000-4000-8000-000000000003","email":"revoked53docs@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000010'), 0, 'revoked partner cannot read metadata');
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000003','revoked.pdf','53100000-0000-4000-8000-000000000010/revoked/revoked.pdf','generic','application/pdf',1)$q$,
  '42501', null, 'revoked partner cannot insert metadata'
);
select throws_ok(
  $q$delete from public.event_documents where id = '53100000-0000-4000-8000-000000000022'$q$,
  '42501', null, 'revoked partner cannot delete metadata'
);

select set_config('request.jwt.claims','{"sub":"53100000-0000-4000-8000-000000000004","email":"stranger53docs@example.invalid","role":"authenticated"}',true);
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000010'), 0, 'stranger cannot read another event metadata');
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000011'), 1, 'owner can read own second event metadata');
select throws_ok(
  $q$insert into public.event_documents(event_id,created_by,original_name,object_path,category,mime_type,file_size) values('53100000-0000-4000-8000-000000000010','53100000-0000-4000-8000-000000000004','cross.pdf','53100000-0000-4000-8000-000000000010/cross/cross.pdf','generic','application/pdf',1)$q$,
  '42501', null, 'cross-event insert is denied'
);

set local role postgres;
select throws_ok(
  $q$delete from public.events where id = '53100000-0000-4000-8000-000000000010'$q$,
  '55000', 'EVENT_DOCUMENT_CLEANUP_REQUIRED', 'event cascade waits for document cleanup'
);
-- These fixtures contain metadata only, no physical Storage objects.
delete from public.event_documents where event_id = '53100000-0000-4000-8000-000000000010';
delete from public.events where id = '53100000-0000-4000-8000-000000000010';
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000010'), 0, 'cleaned event deletion leaves no document metadata');
select is((select count(*)::int from public.event_documents where event_id = '53100000-0000-4000-8000-000000000011'), 1, 'cross-event metadata remains intact');

select * from finish();
rollback;
