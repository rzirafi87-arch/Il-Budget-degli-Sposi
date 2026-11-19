do $$ begin if exists(select 1 from public.baptism_family_plans where coalesce(plan->>'version','')<>'2') then raise exception 'MIGRATE_LEGACY_BAPTISM_PLANS_FIRST';end if;end $$;
-- QA revision: shared guests/expenses are authoritative. The JSON contains only
-- baptism-specific setup and relative checklist state, not duplicate ledgers.
alter table public.guests add column if not exists baptism_details jsonb;
alter table public.expenses add column if not exists baptism_details jsonb;
alter table public.baptism_family_plans add column if not exists request_hash text;
alter table public.baptism_family_plans add column if not exists base_revision integer;

create or replace function public.read_family_baptism(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not exists(select 1 from public.events where id=p_id and owner_id=auth.uid() and event_type='baptism') then raise exception 'EVENT_UNAVAILABLE'; end if;
 select jsonb_build_object('event_id',p_id,'revision',revision,'plan',plan || jsonb_build_object(
 'guests',coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,'ceremony',case when not coalesce(g.rsvp_received,false) then 'pending' when g.attending then 'yes' else 'no' end,'menu',coalesce(g.menu_preferences[1],'pending'),'food',g.allergies_intolerances) || g.baptism_details order by g.created_at,g.id) from public.guests g where g.event_id=p_id and g.baptism_details is not null),'[]'::jsonb),
 'costs',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'name',e.description,'enabled',e.is_enabled,'payments',coalesce(e.payment_installments,'[]'::jsonb)) || e.baptism_details order by e.inserted_at,e.id) from public.expenses e where e.event_id=p_id and e.baptism_details is not null),'[]'::jsonb))) into result from public.baptism_family_plans where event_id=p_id;
 return result;
end $$;
revoke all on function public.read_family_baptism(uuid) from public,anon;
grant execute on function public.read_family_baptism(uuid) to authenticated;

-- Shared edits invalidate the planner's optimistic revision. The event row lock
-- serializes them with the complete snapshot transaction.
create or replace function public.bump_baptism_revision()
returns trigger language plpgsql security definer set search_path='' as $$
declare eid uuid;
begin
 if TG_OP='UPDATE' and OLD.baptism_details is not null and (NEW.event_id<>OLD.event_id or NEW.baptism_details is null) then raise exception 'BAPTISM_ROW_IDENTITY_IMMUTABLE';end if;
 eid=case when TG_OP='DELETE' then OLD.event_id else NEW.event_id end;
 if (case when TG_OP='DELETE' then OLD.baptism_details else NEW.baptism_details end) is not null then
  perform 1 from public.events where id=eid for update;
  update public.baptism_family_plans set revision=revision+1,request_hash=null where event_id=eid;
 end if;
 return case when TG_OP='DELETE' then OLD else NEW end;
end $$;
revoke all on function public.bump_baptism_revision() from public,anon,authenticated;
create trigger baptism_guest_revision before insert or update or delete on public.guests for each row execute function public.bump_baptism_revision();
create trigger baptism_expense_revision before insert or update or delete on public.expenses for each row execute function public.bump_baptism_revision();

create or replace function public.save_family_baptism(p_id uuid,p_revision integer,p_plan jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare
 owner uuid:=auth.uid(); title text; budget numeric; day date; current_rev integer; prior_hash text; prior_base integer;
 g jsonb; c jsonb; p jsonb; total numeric; paid numeric; active boolean; eid uuid; hash text:=md5(p_plan::text);
begin
 if owner is null or p_id is null or p_revision is null or p_revision<0 or jsonb_typeof(p_plan) is distinct from 'object' or octet_length(p_plan::text)>1000000 or p_plan->>'version' is distinct from '2' or jsonb_typeof(p_plan->'guests') is distinct from 'array' or jsonb_typeof(p_plan->'costs') is distinct from 'array' then raise exception 'INVALID_BAPTISM'; end if;
 title:=coalesce(nullif(btrim(p_plan->>'name'),''),'Battesimo');budget:=coalesce(nullif(p_plan->>'budget','')::numeric,0);day:=nullif(left(p_plan->>'ceremony',10),'')::date;
 if length(title)>120 or budget<0 or budget>999999999 or budget='NaN'::numeric or jsonb_array_length(p_plan->'guests')>2000 or jsonb_array_length(p_plan->'costs')>1000 or p_plan->>'scenario' not in ('solo','later','home','lunch','hall') then raise exception 'INVALID_BAPTISM';end if;
 foreach title in array array['adults','companions','children','noMeal'] loop
  if not coalesce(p_plan->>title,'') ~ '^\d+$' then raise exception 'INVALID_BAPTISM_COUNTS';end if;
 end loop;
 title:=coalesce(nullif(btrim(p_plan->>'name'),''),'Battesimo');
 if (p_plan->>'companions')::numeric>(p_plan->>'adults')::numeric then raise exception 'INVALID_BAPTISM_COUNTS';end if;
 if p_plan->>'scenario' in ('home','lunch','hall') and nullif(p_plan->>'time','') is not null and nullif(p_plan->>'ceremony','') is not null and (p_plan->>'time')::timestamp<=(p_plan->>'ceremony')::timestamp then raise exception 'INVALID_BAPTISM_TIME';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select revision,request_hash,base_revision into current_rev,prior_hash,prior_base from public.baptism_family_plans b join public.events e on e.id=b.event_id where e.id=p_id and e.owner_id=owner and e.event_type='baptism' for update of e,b;
 if current_rev is not null then
  if prior_hash=hash and prior_base=p_revision then return current_rev;end if;
  if current_rev<>p_revision then raise exception 'BAPTISM_CONFLICT';end if;
 elsif p_revision<>0 then raise exception 'EVENT_UNAVAILABLE';
 else
  if exists(select 1 from public.events where id=p_id) then raise exception 'EVENT_UNAVAILABLE';end if;
  insert into public.events(id,owner_id,event_type,public_id,name,event_date,total_budget,language,country) values(p_id,owner,'baptism',replace(gen_random_uuid()::text,'-',''),title,day,budget,coalesce(p_plan->>'locale','it'),'it');
  insert into public.baptism_family_plans(event_id,revision,plan) values(p_id,0,'{}');
 end if;
 if (select count(*) from jsonb_array_elements(p_plan->'guests'))<>(select count(distinct value->>'id') from jsonb_array_elements(p_plan->'guests')) or (select count(*) from jsonb_array_elements(p_plan->'costs'))<>(select count(distinct value->>'id') from jsonb_array_elements(p_plan->'costs')) then raise exception 'DUPLICATE_BAPTISM_ITEM';end if;
 for g in select value from jsonb_array_elements(p_plan->'guests') loop
  eid:=(g->>'id')::uuid;
  if coalesce(btrim(g->>'name'),'')='' or g->>'ceremony' not in ('pending','yes','no') or g->>'reception' not in ('pending','yes','no') or g->>'menu' not in ('adult','child','none','pending') or g->>'kind' not in ('adult','child') then raise exception 'INVALID_BAPTISM_GUEST';end if;
  if exists(select 1 from public.guests where id=eid and (event_id<>p_id or baptism_details is null)) then raise exception 'EVENT_UNAVAILABLE';end if;
  if coalesce(g->>'companionOf','')<>'' and (g->>'companionOf'=g->>'id' or not exists(select 1 from jsonb_array_elements(p_plan->'guests') x where x->>'id'=g->>'companionOf' and coalesce(x->>'companionOf','')='')) then raise exception 'INVALID_BAPTISM_COMPANION';end if;
  insert into public.guests(id,event_id,name,guest_type,rsvp_received,attending,menu_preferences,allergies_intolerances,baptism_details)
  values(eid,p_id,g->>'name','common',g->>'ceremony'<>'pending',g->>'ceremony'='yes',array[g->>'menu'],coalesce(g->>'food',''),g- 'id'-'name'-'ceremony'-'menu'-'food')
  on conflict(id) do update set name=excluded.name,rsvp_received=excluded.rsvp_received,attending=excluded.attending,menu_preferences=excluded.menu_preferences,allergies_intolerances=excluded.allergies_intolerances,baptism_details=excluded.baptism_details;
 end loop;
 delete from public.guests where event_id=p_id and baptism_details is not null and id::text not in (select value->>'id' from jsonb_array_elements(p_plan->'guests'));
 for c in select value from jsonb_array_elements(p_plan->'costs') loop
  eid:=(c->>'id')::uuid;
  if coalesce(btrim(c->>'name'),'')='' or c->>'scope' not in ('ceremony','reception') or not coalesce(c->>'quantity','')~'^\d+$' or coalesce(c->>'unitCost','') !~ '^\d+(\.\d+)?$' or jsonb_typeof(c->'payments') is distinct from 'array' then raise exception 'INVALID_BAPTISM_COST';end if;
  if exists(select 1 from public.expenses where id=eid and (event_id<>p_id or baptism_details is null)) then raise exception 'EVENT_UNAVAILABLE';end if;
  paid:=0;
  for p in select value from jsonb_array_elements(c->'payments') loop
   if coalesce(p->>'amount','')!~'^\d+(\.\d+)?$' then raise exception 'INVALID_BAPTISM_PAYMENT';end if;
   paid:=paid+(p->>'amount')::numeric;
  end loop;
  active:=coalesce((c->>'enabled')::boolean,false) and (c->>'scope'<>'reception' or p_plan->>'scenario' in ('home','lunch','hall'));
  total:=case when active then round((c->>'quantity')::numeric*(c->>'unitCost')::numeric,2) else 0 end;
  insert into public.expenses(id,event_id,description,amount,paid_amount,payment_installments,is_enabled,spend_type,status,baptism_details)
  values(eid,p_id,c->>'name',total,paid,c->'payments',true,'common','pending',c-'id'-'name'-'payments'-'enabled'||jsonb_build_object('enabled',coalesce((c->>'enabled')::boolean,false)))
  on conflict(id) do update set description=excluded.description,amount=excluded.amount,paid_amount=excluded.paid_amount,payment_installments=excluded.payment_installments,baptism_details=excluded.baptism_details;
 end loop;
 -- Paid rows may only be disabled, never erased through a replacement snapshot.
 if exists(select 1 from public.expenses e where event_id=p_id and baptism_details is not null and coalesce(paid_amount,0)>0 and id::text not in(select value->>'id' from jsonb_array_elements(p_plan->'costs'))) then raise exception 'BAPTISM_PAID_COST_REMOVAL';end if;
 delete from public.expenses where event_id=p_id and baptism_details is not null and id::text not in(select value->>'id' from jsonb_array_elements(p_plan->'costs'));
 update public.events set name=title,event_date=day,total_budget=budget where id=p_id;
 update public.baptism_family_plans set plan=p_plan-'guests'-'costs',revision=revision+1,request_hash=hash,base_revision=p_revision where event_id=p_id returning revision into current_rev;
 return current_rev;
end $$;
revoke all on function public.save_family_baptism(uuid,integer,jsonb) from public,anon;
grant execute on function public.save_family_baptism(uuid,integer,jsonb) to authenticated;
