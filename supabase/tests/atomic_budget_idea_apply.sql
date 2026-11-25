create extension if not exists pgtap with schema extensions;
begin;
set local search_path=extensions,public,pg_catalog;
select plan(15);
insert into auth.users(id,email) values
('58110000-0000-4000-8000-000000000001','atomic-owner@example.invalid'),
('58110000-0000-4000-8000-000000000002','atomic-partner@example.invalid'),
('58110000-0000-4000-8000-000000000003','atomic-stranger@example.invalid');
insert into public.events(id,owner_id,event_type) values
('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000001','wedding');
insert into public.event_members(event_id,user_id,role,status) values
('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000002','partner','active');
insert into public.budget_items(event_id,country_code,name,amount,source,spend_type) values
('58110000-0000-4000-8000-000000000010','it','old',100,'budget_idea','common'),
('58110000-0000-4000-8000-000000000010','it','manual',200,'manual','common'),
('58110000-0000-4000-8000-000000000010','en','other-country',300,'budget_idea','common');
select ok(not has_function_privilege('anon','public.apply_budget_idea_atomic(uuid,uuid,text,jsonb)','execute'),'anon denied');
select ok(not has_function_privilege('authenticated','public.apply_budget_idea_atomic(uuid,uuid,text,jsonb)','execute'),'browser cannot forge actor');
select ok(has_function_privilege('service_role','public.apply_budget_idea_atomic(uuid,uuid,text,jsonb)','execute'),'server may execute');
-- Fault occurs AFTER DELETE, while INSERT executes. throws_ok's subtransaction
-- demonstrates that the entire call, including the DELETE, is rolled back.
create function pg_temp.reject_atomic_test_insert() returns trigger language plpgsql as $$
begin if new.name='fault-injection' then raise exception 'TEST_INSERT_FAILURE' using errcode='23514'; end if; return new; end $$;
create trigger atomic_test_failure before insert on public.budget_items for each row execute function pg_temp.reject_atomic_test_insert();
select throws_ok($q$select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000001','it','[{"name":"fault-injection","amount":10,"spend_type":"common"}]')$q$,'23514','TEST_INSERT_FAILURE','insert failure aborts replacement');
select is((select count(*)::int from public.budget_items where event_id='58110000-0000-4000-8000-000000000010' and name='old'),1,'old item survives failed replacement');
select throws_ok($q$select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000003','it','[]')$q$,'42501','EVENT_ACCESS_DENIED','stranger cannot clear budget');
select throws_ok($q$select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000001','it','[{"name":"bad","amount":-1,"spend_type":"common"}]')$q$,'22023','INVALID_BUDGET_IDEA','negative amount rejected');
select is((select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000002','it','[{"name":"new","amount":50,"spend_type":"common"}]')->>'inserted'),'1','active partner replaces budget');
select is((select count(*)::int from public.budget_items where event_id='58110000-0000-4000-8000-000000000010' and name='old'),0,'old generated item replaced');
select is((select count(*)::int from public.budget_items where event_id='58110000-0000-4000-8000-000000000010' and name in ('manual','other-country')),2,'manual and other country preserved');
select is((select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000001','it','[{"name":"new","amount":50,"spend_type":"common"}]')->>'inserted'),'1','repeat request succeeds');
select is((select count(*)::int from public.budget_items where event_id='58110000-0000-4000-8000-000000000010' and country_code='it' and source='budget_idea'),1,'repeat does not duplicate entries');
update public.event_members set status='revoked' where event_id='58110000-0000-4000-8000-000000000010' and user_id='58110000-0000-4000-8000-000000000002';
select throws_ok($q$select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000002','it','[]')$q$,'42501','EVENT_ACCESS_DENIED','revoked partner denied');
select is((select public.apply_budget_idea_atomic('58110000-0000-4000-8000-000000000010','58110000-0000-4000-8000-000000000001','it','[]')->>'inserted'),'0','empty replacement supported');
select is((select count(*)::int from public.budget_items where event_id='58110000-0000-4000-8000-000000000010'),2,'empty replacement preserves unrelated entries');
select * from finish();
rollback;
