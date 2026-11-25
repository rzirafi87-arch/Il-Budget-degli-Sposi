begin;
create table public.eighteenth_party_plans (
 event_id uuid primary key references public.events(id) on delete cascade,
 revision integer not null default 1 check(revision>0),
 plan jsonb not null check(jsonb_typeof(plan)='object'),
 request_hash text, base_revision integer
);
alter table public.eighteenth_party_plans enable row level security;
revoke all on public.eighteenth_party_plans from public,anon,authenticated;
grant select on public.eighteenth_party_plans to authenticated;
create policy party_plan_authorized_read on public.eighteenth_party_plans for select to authenticated using (
 exists(select 1 from public.events e where e.id=event_id and e.event_type='eighteenth' and public.can_access_event(e.id))
);
create function public.save_eighteenth_party_plan(p_id uuid,p_revision integer,p_plan jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); day date; current_rev integer; prior_hash text; prior_base integer; item jsonb; label text; hash text:=md5(p_plan::text);
begin
 if actor is null then raise exception 'AUTHENTICATION_REQUIRED' using errcode='42501';end if;
 if p_id is null or p_revision is null or p_revision<0 or jsonb_typeof(p_plan) is distinct from 'object' or octet_length(p_plan::text)>50000
 or p_plan->>'version' is distinct from '1' or coalesce(p_plan->>'role','') not in ('celebrant','organizer')
 or jsonb_typeof(p_plan->'programme') is distinct from 'array' or jsonb_typeof(p_plan->'completed') is distinct from 'object' then raise exception 'INVALID_PARTY_PLAN';end if;
 if jsonb_array_length(p_plan->'programme')>20 then raise exception 'INVALID_PARTY_PLAN';end if;
 foreach label in array array['celebrant','venue','address','startTime','replyBy','replyContact','theme','notes'] loop
  if jsonb_typeof(p_plan->label) is distinct from 'string' or length(p_plan->>label)>(case when label='notes' then 2000 else 240 end) then raise exception 'INVALID_PARTY_PLAN';end if;
 end loop;
 if coalesce(p_plan->>'startTime','')<>'' and p_plan->>'startTime'!~'^([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'INVALID_PARTY_TIME';end if;
 if exists(select 1 from jsonb_each(p_plan->'completed') x where x.key not in ('budget','venue','suppliers','invites','replies','counts','payments','programme','thanks') or jsonb_typeof(x.value)<>'boolean') then raise exception 'INVALID_PARTY_TASK';end if;
 select event_date into day from public.events where id=p_id and event_type='eighteenth' for update;
 if not found or private.event_access_role_for_actor(p_id,actor) is null then raise exception 'EVENT_UNAVAILABLE' using errcode='42501';end if;
 if p_plan->>'replyBy'<>'' and ((p_plan->>'replyBy')::date>day or p_plan->>'replyBy'!~'^\d{4}-\d{2}-\d{2}$') then raise exception 'INVALID_REPLY_DATE';end if;
 if (select count(*) from jsonb_array_elements(p_plan->'programme'))<>(select count(distinct x->>'id') from jsonb_array_elements(p_plan->'programme') x) then raise exception 'INVALID_PROGRAMME_IDS';end if;
 for item in select value from jsonb_array_elements(p_plan->'programme') loop
  if coalesce(item->>'id','')!~'^[0-9a-fA-F-]{36}$' or coalesce(btrim(item->>'title'),'')='' or length(item->>'title')>120 or coalesce(item->>'at','')!~'^\d{4}-\d{2}-\d{2}T([01][0-9]|2[0-3]):[0-5][0-9]$' then raise exception 'INVALID_PARTY_PROGRAMME';end if;
  if (item->>'at')::timestamp<day+coalesce(nullif(p_plan->>'startTime',''),'00:00')::time then raise exception 'INVALID_PARTY_PROGRAMME';end if;
 end loop;
 select revision,request_hash,base_revision into current_rev,prior_hash,prior_base from public.eighteenth_party_plans where event_id=p_id for update;
 if found then
  if prior_hash=hash and prior_base=p_revision then return current_rev;end if;
  if current_rev<>p_revision then raise exception 'PARTY_PLAN_CONFLICT';end if;
  update public.eighteenth_party_plans set plan=p_plan,revision=revision+1,request_hash=hash,base_revision=p_revision where event_id=p_id returning revision into current_rev;
 else
  if p_revision<>0 then raise exception 'PARTY_PLAN_CONFLICT';end if;
  insert into public.eighteenth_party_plans(event_id,plan,request_hash,base_revision) values(p_id,p_plan,hash,p_revision) returning revision into current_rev;
 end if;
 return current_rev;
end $$;
revoke all on function public.save_eighteenth_party_plan(uuid,integer,jsonb) from public,anon;
grant execute on function public.save_eighteenth_party_plan(uuid,integer,jsonb) to authenticated;
commit;
