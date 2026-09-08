begin;
set local role postgres;
select plan(17);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at) values
('41000000-0000-4000-8000-00000000000a','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-a@example.invalid','',now(),now(),now()),
('41000000-0000-4000-8000-00000000000b','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-b@example.invalid','',now(),now(),now()),
('41000000-0000-4000-8000-00000000000c','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-c@example.invalid','',now(),now(),now());

insert into public.events(id,owner_id,name,event_type,bride_email,groom_email) values
('41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a','Matrimonio A/B','wedding','branch41-a@example.invalid','branch41-b@example.invalid'),
('41000000-0000-4000-8000-000000000002','41000000-0000-4000-8000-00000000000c','Evento C','wedding','branch41-c@example.invalid',null);

select has_column('public','guests','allergies_intolerances','structured allergy field exists');
select has_column('public','expenses','is_enabled','optional budget flag exists');
select has_function('public','save_event_guest_snapshot',array['uuid','uuid','date','jsonb','jsonb','jsonb'],'atomic snapshot RPC exists');

select lives_ok($q$select public.save_event_guest_snapshot(
 '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a','2027-05-01',
 '[{"id":"temp-family-a","familyName":"Famiglia Test","mainContactGuestId":"temp-guest-a","notes":""}]',
 '[{"id":"temp-guest-a","name":"Contatto Test","guestType":"common","isMainContact":true,"familyGroupId":"temp-family-a","excludeFromFamilyTable":false,"invitationDate":"","rsvpDeadline":"","rsvpReceived":true,"attending":true,"menuPreferences":["vegetariano"],"receivesBomboniera":true,"allergiesIntolerances":"Glutine","notes":""}]',
 '[]'
)$q$,'A creates family and linked guest atomically');

select is((select count(*)::int from public.family_groups where event_id='41000000-0000-4000-8000-000000000001'),1,'family created');
select is((select count(*)::int from public.guests where event_id='41000000-0000-4000-8000-000000000001'),1,'guest created');
select ok((select f.main_contact_guest_id=g.id and g.family_group_id=f.id from public.family_groups f join public.guests g on g.event_id=f.event_id where f.event_id='41000000-0000-4000-8000-000000000001'),'circular links are consistent');
select is((select allergies_intolerances from public.guests where event_id='41000000-0000-4000-8000-000000000001'),'Glutine','allergy persists');

do $$
declare f uuid; g uuid;
begin
 select id into f from public.family_groups where event_id='41000000-0000-4000-8000-000000000001';
 select id into g from public.guests where event_id='41000000-0000-4000-8000-000000000001';
 perform public.save_event_guest_snapshot(
  '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000b','2027-05-02',
  jsonb_build_array(jsonb_build_object('id',f,'familyName','Famiglia Modificata','mainContactGuestId',g,'notes','partner')),
  jsonb_build_array(jsonb_build_object('id',g,'name','Contatto Modificato','guestType','common','isMainContact',true,'familyGroupId',f,'attending',true,'menuPreferences',jsonb_build_array('vegetariano'),'allergiesIntolerances','Glutine, lattosio')),
  '[]'
 );
end $$;

select is((select count(*)::int from public.guests where event_id='41000000-0000-4000-8000-000000000001'),1,'partner resave creates no duplicate');
select is((select family_name from public.family_groups where event_id='41000000-0000-4000-8000-000000000001'),'Famiglia Modificata','partner may modify same wedding');
select is((select allergies_intolerances from public.guests where event_id='41000000-0000-4000-8000-000000000001'),'Glutine, lattosio','partner modifies allergy');

select throws_ok($q$select public.save_event_guest_snapshot(
 '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000c',null,'[]','[]','[]'
)$q$,'42501','EVENT_ACCESS_DENIED','C cannot modify A/B event');
select is((select count(*)::int from public.guests where event_id='41000000-0000-4000-8000-000000000002'),0,'C event remains isolated');

select throws_ok($q$select public.save_event_guest_snapshot(
 '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a','2028-01-01',
 '[]','[{"id":"bad","name":"Bad date","invitationDate":"not-a-date"}]','[]'
)$q$,'22007',null,'database error aborts snapshot');
select is((select default_rsvp_deadline::text from public.events where id='41000000-0000-4000-8000-000000000001'),'2027-05-02','failed snapshot rolls back earlier event update');
select is((select count(*)::int from public.guests where event_id='41000000-0000-4000-8000-000000000001'),1,'failed snapshot leaves guest data intact');

do $$
declare f uuid; g uuid;
begin
 select id into f from public.family_groups where event_id='41000000-0000-4000-8000-000000000001';
 select id into g from public.guests where event_id='41000000-0000-4000-8000-000000000001';
 perform public.save_event_guest_snapshot(
  '41000000-0000-4000-8000-000000000001','41000000-0000-4000-8000-00000000000a',null,
  jsonb_build_array(jsonb_build_object('id',f,'familyName','Famiglia Modificata')),
  '[]','[]'
 );
end $$;
select is((select count(*)::int from public.guests where event_id='41000000-0000-4000-8000-000000000001'),0,'explicit guest deletion works');
select is((select count(*)::int from public.family_groups where event_id='41000000-0000-4000-8000-000000000001'),1,'family can remain after guest deletion');

select * from finish();
rollback;
