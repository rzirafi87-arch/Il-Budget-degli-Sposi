-- Regression: child revision triggers must not resurrect a parent being deleted.
-- All fixture identities, rows and session settings roll back.
begin;
insert into auth.users(id,email) values ('95250000-0000-4000-8000-000000000101','baptism-delete@example.invalid');
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000101',true);
set local role authenticated;
select public.save_family_baptism('95250000-0000-4000-8000-000000000102',0,jsonb_build_object(
 'version',2,'name','QA-M8-DELETE-ROLLBACK','budget','500','ceremony','2030-05-18T10:30','scenario','lunch','time','2030-05-18T13:00',
 'adults',1,'companions',0,'children',0,'noMeal',0,
 'guests',jsonb_build_array(jsonb_build_object('id','95250000-0000-4000-8000-000000000103','name','Invitato QA','kind','adult','ceremony','yes','reception','yes','menu','adult','companionOf','','food','')),
 'costs',jsonb_build_array(jsonb_build_object('id','95250000-0000-4000-8000-000000000104','name','Torta QA','scope','reception','enabled',true,'quantity',1,'unitCost',120,
   'payments',jsonb_build_array(jsonb_build_object('id','95250000-0000-4000-8000-000000000105','amount',20,'date','2030-01-10','note','Acconto QA'))))));
reset role;
do $$ declare before_revision integer; after_revision integer; begin
 select revision into before_revision from public.baptism_family_plans where event_id='95250000-0000-4000-8000-000000000102';
 update public.guests set name='Invitato QA aggiornato' where id='95250000-0000-4000-8000-000000000103';
 select revision into after_revision from public.baptism_family_plans where event_id='95250000-0000-4000-8000-000000000102';
 if after_revision<>before_revision+1 then raise exception 'ORDINARY_GUEST_REVISION_NOT_BUMPED';end if;
end $$;
set local role service_role;
delete from public.events where id='95250000-0000-4000-8000-000000000102';
reset role;
do $$ begin
 if exists(select 1 from public.events where id='95250000-0000-4000-8000-000000000102')
 or exists(select 1 from public.baptism_family_plans where event_id='95250000-0000-4000-8000-000000000102')
 or exists(select 1 from public.guests where event_id='95250000-0000-4000-8000-000000000102')
 or exists(select 1 from public.expenses where event_id='95250000-0000-4000-8000-000000000102') then raise exception 'BAPTISM_DELETE_LEFT_ORPHANS';end if;
end $$;
rollback;
