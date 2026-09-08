-- Branch 41: atomic guest/family snapshots and structured allergy data.
-- Additive and backward-compatible: existing IDs and rows are preserved.
alter table public.guests
  add column if not exists allergies_intolerances text not null default '';

create or replace function public.save_event_guest_snapshot(
  p_event_id uuid,
  p_user_id uuid,
  p_default_rsvp_deadline date,
  p_family_groups jsonb,
  p_guests jsonb,
  p_non_invited jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  item jsonb;
  client_id text;
  actual_id uuid;
  family_id uuid;
  main_guest_id uuid;
  family_map jsonb := '{}'::jsonb;
  guest_map jsonb := '{}'::jsonb;
  kept_families uuid[] := '{}'::uuid[];
  kept_guests uuid[] := '{}'::uuid[];
  kept_recipients uuid[] := '{}'::uuid[];
begin
  if not exists (
    select 1
    from public.events e
    left join auth.users u on u.id = p_user_id
    where e.id = p_event_id
      and (
        e.owner_id = p_user_id
        or lower(coalesce(e.bride_email, '')) = lower(coalesce(u.email, ''))
        or lower(coalesce(e.groom_email, '')) = lower(coalesce(u.email, ''))
      )
  ) then
    raise exception 'EVENT_ACCESS_DENIED' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_family_groups, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_guests, '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_non_invited, '[]'::jsonb)) <> 'array' then
    raise exception 'INVALID_GUEST_SNAPSHOT' using errcode = '22023';
  end if;

  update public.events
  set default_rsvp_deadline = p_default_rsvp_deadline,
      updated_at = timezone('utc', now())
  where id = p_event_id;

  -- Families first, without the circular main-contact reference.
  for item in select value from jsonb_array_elements(coalesce(p_family_groups, '[]'::jsonb))
  loop
    if btrim(coalesce(item->>'familyName', '')) = '' then
      continue;
    end if;
    client_id := coalesce(item->>'id', '');
    actual_id := case
      when client_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       and exists(select 1 from public.family_groups where id=client_id::uuid and event_id=p_event_id)
      then client_id::uuid else extensions.uuid_generate_v4() end;

    insert into public.family_groups(id,event_id,family_name,main_contact_guest_id,notes,updated_at)
    values(actual_id,p_event_id,btrim(item->>'familyName'),null,coalesce(item->>'notes',''),now())
    on conflict(id) do update set
      family_name=excluded.family_name, notes=excluded.notes,
      main_contact_guest_id=null, updated_at=now()
    where family_groups.event_id=p_event_id;

    family_map := family_map || jsonb_build_object(client_id, actual_id::text);
    kept_families := array_append(kept_families, actual_id);
  end loop;

  -- Guests second, resolving both temporary and existing family IDs.
  for item in select value from jsonb_array_elements(coalesce(p_guests, '[]'::jsonb))
  loop
    if btrim(coalesce(item->>'name', '')) = '' then
      continue;
    end if;
    client_id := coalesce(item->>'id', '');
    actual_id := case
      when client_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       and exists(select 1 from public.guests where id=client_id::uuid and event_id=p_event_id)
      then client_id::uuid else extensions.uuid_generate_v4() end;
    family_id := nullif(family_map->>coalesce(item->>'familyGroupId',''),'')::uuid;

    insert into public.guests(
      id,event_id,name,guest_type,is_main_contact,family_group_id,
      exclude_from_family_table,invitation_date,rsvp_deadline,rsvp_received,
      attending,menu_preferences,receives_bomboniera,allergies_intolerances,notes,updated_at
    ) values (
      actual_id,p_event_id,btrim(item->>'name'),
      case when item->>'guestType' in ('bride','groom','common') then item->>'guestType' else 'common' end,
      coalesce((item->>'isMainContact')::boolean,false),family_id,
      coalesce((item->>'excludeFromFamilyTable')::boolean,false),
      nullif(item->>'invitationDate','')::date,nullif(item->>'rsvpDeadline','')::date,
      coalesce((item->>'rsvpReceived')::boolean,false),
      coalesce((item->>'attending')::boolean,false),
      coalesce(array(select jsonb_array_elements_text(coalesce(item->'menuPreferences','[]'::jsonb))),'{}'::text[]),
      coalesce((item->>'receivesBomboniera')::boolean,false),
      coalesce(item->>'allergiesIntolerances',''),coalesce(item->>'notes',''),now()
    )
    on conflict(id) do update set
      name=excluded.name,guest_type=excluded.guest_type,is_main_contact=excluded.is_main_contact,
      family_group_id=excluded.family_group_id,exclude_from_family_table=excluded.exclude_from_family_table,
      invitation_date=excluded.invitation_date,rsvp_deadline=excluded.rsvp_deadline,
      rsvp_received=excluded.rsvp_received,attending=excluded.attending,
      menu_preferences=excluded.menu_preferences,receives_bomboniera=excluded.receives_bomboniera,
      allergies_intolerances=excluded.allergies_intolerances,notes=excluded.notes,updated_at=now()
    where guests.event_id=p_event_id;

    guest_map := guest_map || jsonb_build_object(client_id, actual_id::text);
    kept_guests := array_append(kept_guests, actual_id);
  end loop;

  -- Complete the circular reference only after every guest exists.
  for item in select value from jsonb_array_elements(coalesce(p_family_groups, '[]'::jsonb))
  loop
    actual_id := nullif(family_map->>coalesce(item->>'id',''),'')::uuid;
    if actual_id is null then continue; end if;
    main_guest_id := nullif(guest_map->>coalesce(item->>'mainContactGuestId',''),'')::uuid;
    if main_guest_id is null then
      select g.id into main_guest_id from public.guests g
      where g.event_id=p_event_id and g.family_group_id=actual_id and g.is_main_contact
      order by g.created_at limit 1;
    end if;
    update public.family_groups set main_contact_guest_id=main_guest_id,updated_at=now()
    where id=actual_id and event_id=p_event_id;
  end loop;

  -- Delete only rows omitted from this authoritative snapshot, after replacements exist.
  delete from public.guests where event_id=p_event_id and not (id=any(kept_guests));
  delete from public.family_groups where event_id=p_event_id and not (id=any(kept_families));

  for item in select value from jsonb_array_elements(coalesce(p_non_invited, '[]'::jsonb))
  loop
    if btrim(coalesce(item->>'name',''))='' then continue; end if;
    client_id := coalesce(item->>'id','');
    actual_id := case
      when client_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       and exists(select 1 from public.non_invited_recipients where id=client_id::uuid and event_id=p_event_id)
      then client_id::uuid else extensions.uuid_generate_v4() end;
    insert into public.non_invited_recipients(id,event_id,name,receives_bomboniera,receives_confetti,notes,updated_at)
    values(actual_id,p_event_id,btrim(item->>'name'),
      coalesce((item->>'receivesBomboniera')::boolean,false),
      coalesce((item->>'receivesConfetti')::boolean,false),coalesce(item->>'notes',''),now())
    on conflict(id) do update set name=excluded.name,receives_bomboniera=excluded.receives_bomboniera,
      receives_confetti=excluded.receives_confetti,notes=excluded.notes,updated_at=now()
    where non_invited_recipients.event_id=p_event_id;
    kept_recipients := array_append(kept_recipients,actual_id);
  end loop;
  delete from public.non_invited_recipients where event_id=p_event_id and not(id=any(kept_recipients));

  return jsonb_build_object('success',true,'familyIdMap',family_map,'guestIdMap',guest_map);
end;
$$;

revoke all on function public.save_event_guest_snapshot(uuid,uuid,date,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.save_event_guest_snapshot(uuid,uuid,date,jsonb,jsonb,jsonb) to service_role;

alter table public.expenses
  add column if not exists is_enabled boolean not null default true;
comment on column public.expenses.is_enabled is
  'Whether an Idea di Budget row is included in totals and Apply to Budget.';

do $migration$
begin
  if to_regclass('app.v_country_event_wedding') is not null then
    execute $function$
      create or replace function public.get_wedding_budget_focus(p_country text, p_event text)
      returns jsonb
      language sql
      stable
      security invoker
      set search_path = app, public, pg_temp
      as $body$
        select budget_focus_pct
        from app.v_country_event_wedding
        where iso2 = upper(p_country) and event_slug = p_event
        limit 1
      $body$
    $function$;
  else
    execute $function$
      create or replace function public.get_wedding_budget_focus(p_country text, p_event text)
      returns jsonb
      language sql
      stable
      security invoker
      set search_path = public, pg_temp
      as $body$ select null::jsonb $body$
    $function$;
  end if;
end
$migration$;
revoke all on function public.get_wedding_budget_focus(text,text) from public,anon,authenticated;
grant execute on function public.get_wedding_budget_focus(text,text) to service_role;;
