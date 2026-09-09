create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(6);

insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
values ('41000000-0000-4000-8000-00000000000d','00000000-0000-0000-0000-000000000000','authenticated','authenticated','branch41-budget@example.invalid','',now(),now(),now());
insert into public.events(id,owner_id,name,event_type,bride_email)
values ('41000000-0000-4000-8000-000000000003','41000000-0000-4000-8000-00000000000d','Budget Test','wedding','branch41-budget@example.invalid');

select has_function('public','save_budget_idea_snapshot',array['uuid','uuid','jsonb'],'atomic budget snapshot RPC exists');
select lives_ok($q$select public.save_budget_idea_snapshot(
  '41000000-0000-4000-8000-000000000003','41000000-0000-4000-8000-00000000000d',
  '[{"category":"Wedding Bag","subcategory":"Fazzoletti","idea_amount":10,"spendType":"bride","enabled":true}]'
)$q$,'budget snapshot saves');
select is((select count(*)::int from public.expenses where event_id='41000000-0000-4000-8000-000000000003'),1,'one budget row exists');
select is((select committed_amount from public.expenses where event_id='41000000-0000-4000-8000-000000000003'),10::numeric,'amount persists');
select throws_ok($q$select public.save_budget_idea_snapshot(
  '41000000-0000-4000-8000-000000000003','41000000-0000-4000-8000-00000000000d',
  '[{"category":"Wedding Bag","subcategory":"Fazzoletti","idea_amount":"bad"}]'
)$q$,'22P02',null,'invalid snapshot fails');
select is((select committed_amount from public.expenses where event_id='41000000-0000-4000-8000-000000000003'),10::numeric,'failed replacement rolls back deletion');

select * from finish();
rollback;
