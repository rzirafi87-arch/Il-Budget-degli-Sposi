-- Server-only replacement: either all generated items commit, or none change.
begin;
create or replace function public.apply_budget_idea_atomic(
  p_event_id uuid, p_actor_id uuid, p_country text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_count integer;
begin
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception 'EVENT_ACCESS_DENIED' using errcode = '42501';
  end if;
  -- Serialize replacements for the event, including an initially empty budget.
  perform 1 from public.events where id = p_event_id for update;
  perform 1 from public.event_members
    where event_id = p_event_id and user_id = p_actor_id for share;
  if private.event_access_role_for_actor(p_event_id, p_actor_id) is null then
    raise exception 'EVENT_ACCESS_DENIED' using errcode = '42501';
  end if;
  if p_country is null or p_country !~ '^[a-z]{2}$'
    or p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_BUDGET_IDEA' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 1000 then
    raise exception 'INVALID_BUDGET_IDEA' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_items) i where
    jsonb_typeof(i) <> 'object' or coalesce(btrim(i->>'name'),'') = ''
    or jsonb_typeof(i->'amount') is distinct from 'number'
    or coalesce(i->>'spend_type','') not in ('common','bride','groom')) then
    raise exception 'INVALID_BUDGET_IDEA' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_items) i where (i->>'amount')::numeric <= 0) then
    raise exception 'INVALID_BUDGET_IDEA' using errcode = '22023';
  end if;
  delete from public.budget_items where event_id=p_event_id
    and country_code=p_country and source='budget_idea';
  insert into public.budget_items(event_id,country_code,name,amount,spend_type,source,canonical_key)
    select p_event_id,p_country,i->>'name',(i->>'amount')::numeric,
      i->>'spend_type','budget_idea',i->>'canonical_key'
    from jsonb_array_elements(p_items) i;
  get diagnostics v_count = row_count;
  return jsonb_build_object('success',true,'inserted',v_count);
end;
$$;
revoke all on function public.apply_budget_idea_atomic(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_budget_idea_atomic(uuid,uuid,text,jsonb) to service_role;
commit;
