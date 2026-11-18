create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(3);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('41000000-0000-4000-8000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-a@example.invalid','',now(),now(),now()),
('41000000-0000-4000-8000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-b@example.invalid','',now(),now(),now()),
('41000000-0000-4000-8000-00000000000c','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-c@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type,bride_email,groom_email) values
('41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a','Matrimonio A/B','wedding','branch41-a@example.invalid','branch41-b@example.invalid'),
('41000000-0000-4000-8000-000000000002','41000000-0000-4000-8000-00000000000c','Evento C','wedding','branch41-c@example.invalid',null);

select throws_ok($q$select public.patch_event_details(
  '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a',
  '{"name":"Changed"}','{"wedding_date":"invalid"}')$q$, '22007', null, 'card date rejects the combined save');
select is((select name from public.events where id='41000000-0000-4000-8000-000000000001'),
  'Matrimonio A/B','event name rolls back');
select is((select count(*) from public.wedding_cards where event_id='41000000-0000-4000-8000-000000000001'),
  0::bigint,'failed card creation leaves no row');
select * from finish();
rollback;
