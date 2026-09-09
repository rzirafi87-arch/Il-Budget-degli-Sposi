-- Branch 41: save the complete Idea di Budget snapshot atomically.
create or replace function public.save_budget_idea_snapshot(
  p_event_id uuid,
  p_user_id uuid,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  item jsonb;
  category_name text;
  subcategory_name text;
  v_category_id uuid;
  v_subcategory_id uuid;
  item_amount numeric;
  inserted_count integer := 0;
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

  if jsonb_typeof(coalesce(p_rows, '[]'::jsonb)) <> 'array' then
    raise exception 'INVALID_BUDGET_SNAPSHOT' using errcode = '22023';
  end if;

  delete from public.expenses
  where event_id = p_event_id
    and status = 'planned'
    and from_dashboard = true;

  for item in select value from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb))
  loop
    category_name := btrim(coalesce(item->>'category', ''));
    subcategory_name := btrim(coalesce(item->>'subcategory', ''));
    if category_name = '' or subcategory_name = '' then
      continue;
    end if;

    select c.id into v_category_id
    from public.categories c
    where c.event_id = p_event_id and c.name = category_name
    order by c.id
    limit 1;
    if v_category_id is null then
      insert into public.categories(event_id, name)
      values (p_event_id, category_name)
      returning id into v_category_id;
    end if;

    select s.id into v_subcategory_id
    from public.subcategories s
    where s.category_id = v_category_id and s.name = subcategory_name
    order by s.id
    limit 1;
    if v_subcategory_id is null then
      insert into public.subcategories(category_id, name)
      values (v_category_id, subcategory_name)
      returning id into v_subcategory_id;
    end if;

    item_amount := coalesce(
      nullif(item->>'idea_amount', '')::numeric,
      nullif(item->>'amount', '')::numeric,
      0
    );

    insert into public.expenses(
      event_id, category, subcategory, subcategory_id, supplier,
      amount, committed_amount, paid_amount, spend_type, notes,
      status, from_dashboard, is_enabled
    ) values (
      p_event_id, category_name, subcategory_name, v_subcategory_id,
      nullif(item->>'supplier', ''), item_amount, item_amount, 0,
      coalesce(nullif(item->>'spendType', ''), 'common'),
      nullif(item->>'notes', ''), 'planned', true,
      coalesce((item->>'enabled')::boolean, true)
    );
    inserted_count := inserted_count + 1;
  end loop;

  return jsonb_build_object('success', true, 'inserted', inserted_count);
end;
$$;

revoke all on function public.save_budget_idea_snapshot(uuid,uuid,jsonb)
  from public, anon, authenticated;
grant execute on function public.save_budget_idea_snapshot(uuid,uuid,jsonb)
  to service_role;
