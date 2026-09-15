drop index if exists public.subcategories_unique_cat_lowername;

create unique index if not exists subcategories_unique_category_canonical_key
  on public.subcategories(category_id, canonical_key)
  where canonical_key is not null;

create unique index if not exists subcategories_unique_category_noncanonical_lowername
  on public.subcategories(category_id, lower(btrim(name)), is_custom)
  where canonical_key is null;

comment on index public.subcategories_unique_category_canonical_key is
  'Canonical subcategories are identified by parent category and canonical key; labels may coincide.';

comment on index public.subcategories_unique_category_noncanonical_lowername is
  'Custom and preserved non-canonical subcategories reject true case-insensitive duplicates within their own identity class.';

create or replace function public.save_budget_idea_snapshot(p_event_id uuid,p_user_id uuid,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare item jsonb; category_name text; subcategory_name text; item_key text; v_category_id uuid; v_subcategory_id uuid;
  item_amount numeric; item_custom boolean; inserted_count integer:=0;
begin
  if not exists(select 1 from public.events e left join auth.users u on u.id=p_user_id where e.id=p_event_id and
    (e.owner_id=p_user_id or lower(coalesce(e.bride_email,''))=lower(coalesce(u.email,'')) or lower(coalesce(e.groom_email,''))=lower(coalesce(u.email,''))))
    then raise exception 'EVENT_ACCESS_DENIED' using errcode='42501'; end if;
  if jsonb_typeof(coalesce(p_rows,'[]'::jsonb))<>'array' then raise exception 'INVALID_BUDGET_SNAPSHOT' using errcode='22023'; end if;
  delete from public.expenses where event_id=p_event_id and status='planned' and from_dashboard=true and taxonomy_status='active';
  for item in select value from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    category_name:=left(btrim(coalesce(item->>'category','')),160); subcategory_name:=left(btrim(coalesce(item->>'subcategory','')),160);
    item_custom:=coalesce((item->>'custom')::boolean,false); item_key:=case when item_custom then null else nullif(left(btrim(item->>'canonicalKey'),240),'') end;
    if category_name='' or subcategory_name='' then continue; end if;
    if item_key is not null and exists(select 1 from public.expenses where event_id=p_event_id and canonical_key=item_key and taxonomy_status='active') then continue; end if;
    select id into v_category_id from public.categories where event_id=p_event_id and lower(btrim(name))=lower(btrim(category_name)) order by id limit 1;
    if v_category_id is null then insert into public.categories(event_id,name) values(p_event_id,category_name) returning id into v_category_id; end if;
    select id into v_subcategory_id from public.subcategories where category_id=v_category_id and
      ((item_key is not null and canonical_key=item_key) or
       (item_key is null and canonical_key is null and is_custom=item_custom and lower(btrim(name))=lower(btrim(subcategory_name))))
      order by id limit 1;
    if v_subcategory_id is null then insert into public.subcategories(category_id,name,is_custom,canonical_key) values(v_category_id,subcategory_name,item_custom,item_key) returning id into v_subcategory_id;
    else update public.subcategories set name=subcategory_name where id=v_subcategory_id; end if;
    item_amount:=greatest(coalesce(nullif(item->>'idea_amount','')::numeric,nullif(item->>'amount','')::numeric,0),0);
    insert into public.expenses(event_id,category,subcategory,subcategory_id,canonical_key,supplier,amount,committed_amount,paid_amount,spend_type,notes,status,from_dashboard,is_enabled)
    values(p_event_id,category_name,subcategory_name,v_subcategory_id,item_key,nullif(left(item->>'supplier',240),''),item_amount,item_amount,0,
      coalesce(nullif(left(item->>'spendType',80),''),'common'),nullif(left(item->>'notes',2000),''),'planned',true,coalesce((item->>'enabled')::boolean,true));
    inserted_count:=inserted_count+1;
  end loop;
  delete from public.subcategories s using public.categories c where s.category_id=c.id and c.event_id=p_event_id and s.is_custom and not exists(select 1 from public.expenses e where e.subcategory_id=s.id);
  return jsonb_build_object('success',true,'inserted',inserted_count);
end $$;
revoke all on function public.save_budget_idea_snapshot(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.save_budget_idea_snapshot(uuid,uuid,jsonb) to service_role;
