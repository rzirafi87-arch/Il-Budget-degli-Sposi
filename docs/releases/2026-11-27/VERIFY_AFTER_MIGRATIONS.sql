begin transaction read only;
select
 to_regclass('public.eighteenth_party_plans') is not null as party_table,
 to_regprocedure('public.save_eighteenth_party_plan(uuid,integer,jsonb)') is not null as party_metadata_rpc,
 to_regprocedure('public.record_eighteenth_payment(uuid,uuid,uuid,numeric,date,text)') is not null as party_payment_rpc,
 position('if found then' in lower(pg_get_functiondef('public.bump_baptism_revision()'::regprocedure)))>0 as baptism_cascade_guard;
select relname,relrowsecurity from pg_class where oid=to_regclass('public.eighteenth_party_plans');
select proname,prosecdef,proconfig,proacl from pg_proc where oid in
(to_regprocedure('public.save_eighteenth_party_plan(uuid,integer,jsonb)'),to_regprocedure('public.record_eighteenth_payment(uuid,uuid,uuid,numeric,date,text)'));
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public' and tablename='eighteenth_party_plans';
rollback;
