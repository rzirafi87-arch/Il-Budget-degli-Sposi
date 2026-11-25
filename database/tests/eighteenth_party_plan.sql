begin;
insert into auth.users(id,email) values ('95250000-0000-4000-8000-000000000201','party-plan-owner@example.invalid'),('95250000-0000-4000-8000-000000000202','party-plan-other@example.invalid');
insert into public.events(id,owner_id,event_type,name,event_date,total_budget) values
 ('95250000-0000-4000-8000-000000000203','95250000-0000-4000-8000-000000000201','eighteenth','QA-M8-PARTY-PLAN','2030-05-18',500),
 ('95250000-0000-4000-8000-000000000204','95250000-0000-4000-8000-000000000201','wedding','QA-M8-PARTY-WRONG-TYPE','2030-05-18',600);
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000201',true);
select set_config('qa.party.plan','{"version":1,"role":"organizer","celebrant":"Sofia","venue":"Sala QA","address":"Via QA","startTime":"19:00","replyBy":"2030-05-10","replyContact":"Referente QA","theme":"","notes":"Privato QA","programme":[],"completed":{}}',true);
set local role authenticated;
do $$ declare revision integer; begin
 revision:=public.save_eighteenth_party_plan('95250000-0000-4000-8000-000000000203',0,current_setting('qa.party.plan')::jsonb);
 if revision<>1 then raise exception 'PARTY_CREATION_FAILED';end if;
 if public.save_eighteenth_party_plan('95250000-0000-4000-8000-000000000203',0,current_setting('qa.party.plan')::jsonb)<>1 then raise exception 'PARTY_REPLAY_FAILED';end if;
 begin
  perform public.save_eighteenth_party_plan('95250000-0000-4000-8000-000000000203',0,current_setting('qa.party.plan')::jsonb||'{"venue":"Changed"}'::jsonb);
  raise exception 'STALE_PLAN_ACCEPTED';
 exception when raise_exception then if sqlerrm<>'PARTY_PLAN_CONFLICT' then raise;end if;end;
 begin
  perform public.save_eighteenth_party_plan('95250000-0000-4000-8000-000000000204',0,current_setting('qa.party.plan')::jsonb);
  raise exception 'WEDDING_ACCEPTED';
 exception when insufficient_privilege then null;end;
 if (select count(*) from public.eighteenth_party_plans where event_id='95250000-0000-4000-8000-000000000203')<>1 then raise exception 'OWNER_PLAN_READ_FAILED';end if;
end $$;
select set_config('request.jwt.claim.sub','95250000-0000-4000-8000-000000000202',true);
do $$ begin
 if exists(select 1 from public.eighteenth_party_plans where event_id='95250000-0000-4000-8000-000000000203') then raise exception 'OTHER_PLAN_EXPOSED';end if;
 begin
  perform public.save_eighteenth_party_plan('95250000-0000-4000-8000-000000000203',1,current_setting('qa.party.plan')::jsonb);
  raise exception 'OTHER_PLAN_WRITE_ACCEPTED';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ begin
 if (select total_budget from public.events where id='95250000-0000-4000-8000-000000000203')<>500 then raise exception 'PLAN_CHANGED_CANONICAL_BUDGET';end if;
 if has_function_privilege('anon','public.save_eighteenth_party_plan(uuid,integer,jsonb)','execute') then raise exception 'ANONYMOUS_PARTY_RPC';end if;
end $$;
rollback;
