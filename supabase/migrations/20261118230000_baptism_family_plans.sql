create table public.baptism_family_plans (
  event_id uuid primary key references public.events(id) on delete cascade,
  revision integer not null default 1,
  plan jsonb not null check (jsonb_typeof(plan) = 'object')
);
alter table public.baptism_family_plans enable row level security;
revoke all on public.baptism_family_plans from public, anon, authenticated;
grant select on public.baptism_family_plans to authenticated;
create policy baptism_owner_reads on public.baptism_family_plans for select to authenticated
using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid()) and e.event_type = 'baptism'));

-- One transaction covers the shared event header and the owner's planner.
create function public.save_family_baptism(p_id uuid, p_revision integer, p_plan jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  owner uuid := auth.uid();
  title text := coalesce(nullif(btrim(p_plan->>'name'), ''), 'Battesimo');
  budget numeric := coalesce(nullif(p_plan->>'budget', '')::numeric, 0);
  day date := nullif(left(p_plan->>'ceremony', 10), '')::date;
  next_revision integer;
begin
  if owner is null or p_id is null or p_revision is null or p_revision < 0 or
     jsonb_typeof(p_plan) is distinct from 'object' or octet_length(p_plan::text) > 1000000 or
     length(title) > 120 or budget < 0 or budget > 999999999 then
    raise exception 'INVALID_BAPTISM';
  end if;
  if p_revision = 0 then
    insert into public.events(id,owner_id,event_type,public_id,name,event_date,total_budget,language,country)
    values(p_id,owner,'baptism',replace(gen_random_uuid()::text,'-',''),title,day,budget,'it','it');
    insert into public.baptism_family_plans(event_id,plan) values(p_id,p_plan);
    return 1;
  end if;
  perform 1 from public.events where id=p_id and owner_id=owner and event_type='baptism' for update;
  if not found then raise exception 'EVENT_UNAVAILABLE'; end if;
  update public.baptism_family_plans set plan=p_plan, revision=revision+1
    where event_id=p_id and revision=p_revision returning revision into next_revision;
  if not found then raise exception 'BAPTISM_CONFLICT'; end if;
  update public.events set name=title,event_date=day,total_budget=budget where id=p_id;
  return next_revision;
end $$;
revoke all on function public.save_family_baptism(uuid,integer,jsonb) from public, anon;
grant execute on function public.save_family_baptism(uuid,integer,jsonb) to authenticated;
