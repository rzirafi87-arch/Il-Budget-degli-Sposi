begin;
create or replace function public.patch_event_details(p_event_id uuid, p_actor_id uuid, p_event jsonb, p_card jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.events where id = p_event_id for update;
  if not found then return false; end if;
  perform 1 from public.event_members where event_id = p_event_id and user_id = p_actor_id for share;
  if private.event_access_role_for_actor(p_event_id,p_actor_id) is null then
    raise exception 'EVENT_ACCESS_DENIED' using errcode='42501';
  end if;
  if p_event <> '{}'::jsonb then
    update public.events e set
      name = case when p_event ? 'name' then p_event->>'name' else e.name end,
      currency = case when p_event ? 'currency' then p_event->>'currency' else e.currency end,
      total_budget = case when p_event ? 'total_budget' then (p_event->>'total_budget')::numeric else e.total_budget end
    where e.id = p_event_id;
  end if;
  if jsonb_typeof(p_card) = 'object' then
    update public.wedding_cards c set
      bride_name = case when p_card ? 'bride_name' then p_card->>'bride_name' else c.bride_name end,
      groom_name = case when p_card ? 'groom_name' then p_card->>'groom_name' else c.groom_name end,
      wedding_date = case when p_card ? 'wedding_date' then (p_card->>'wedding_date')::date else c.wedding_date end
    where c.event_id = p_event_id;
    if not found then
      insert into public.wedding_cards(event_id,bride_name,groom_name,wedding_date)
      values(p_event_id,p_card->>'bride_name',p_card->>'groom_name',(p_card->>'wedding_date')::date);
    end if;
  end if;
  return true;
end;
$$;
revoke all on function public.patch_event_details(uuid,uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.patch_event_details(uuid,uuid,jsonb,jsonb) to service_role;
commit;
