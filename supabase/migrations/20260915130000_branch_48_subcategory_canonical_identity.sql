-- Legacy-tolerant, forward-only identity enforcement.  Production contains
-- pre-existing duplicate groups, so a conventional UNIQUE index cannot be
-- installed without forbidden cleanup.  The private reservation table is
-- intentionally not backfilled: its unique primary key arbitrates concurrent
-- future writes, while the trigger checks all preserved legacy rows.
drop index if exists public.subcategories_unique_cat_lowername;

create index if not exists subcategories_category_canonical_lookup_idx
  on public.subcategories(category_id, lower(btrim(canonical_key)))
  where canonical_key is not null;

create index if not exists subcategories_category_noncanonical_lookup_idx
  on public.subcategories(category_id, lower(btrim(name)), is_custom)
  where canonical_key is null;

create table if not exists private.subcategory_identity_reservations (
  category_id uuid not null,
  identity_kind text not null check (identity_kind in ('canonical','noncanonical_custom','noncanonical_standard')),
  identity_value text not null,
  primary key (category_id,identity_kind,identity_value)
);
revoke all on table private.subcategory_identity_reservations from public,anon,authenticated;

create or replace function private.subcategory_identity_parts(
  p_category_id uuid,p_name text,p_is_custom boolean,p_canonical_key text
) returns table(identity_kind text,identity_value text)
language sql immutable security invoker set search_path=pg_catalog as $$
  select
    case when nullif(lower(btrim(p_canonical_key)),'') is not null then 'canonical'
         when coalesce(p_is_custom,false) then 'noncanonical_custom'
         else 'noncanonical_standard' end,
    coalesce(nullif(lower(btrim(p_canonical_key)),''),lower(btrim(coalesce(p_name,''))))
$$;
revoke all on function private.subcategory_identity_parts(uuid,text,boolean,text) from public,anon,authenticated;

create or replace function private.enforce_subcategory_identity()
returns trigger language plpgsql security definer set search_path=pg_catalog,private,public as $$
declare v_kind text; v_value text; v_reserved boolean;
begin
  if tg_op='UPDATE' and
     (new.category_id,lower(btrim(coalesce(new.canonical_key,''))),lower(btrim(coalesce(new.name,''))),coalesce(new.is_custom,false))
       is not distinct from
     (old.category_id,lower(btrim(coalesce(old.canonical_key,''))),lower(btrim(coalesce(old.name,''))),coalesce(old.is_custom,false))
  then return new; end if;

  new.canonical_key:=nullif(lower(btrim(new.canonical_key)),'');
  select identity_kind,identity_value into v_kind,v_value
    from private.subcategory_identity_parts(new.category_id,new.name,new.is_custom,new.canonical_key);
  if v_value='' then raise exception 'SUBCATEGORY_IDENTITY_INVALID' using errcode='22023'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    pg_catalog.jsonb_build_array(new.category_id,v_kind,v_value)::text,0));
  insert into private.subcategory_identity_reservations(category_id,identity_kind,identity_value)
    values(new.category_id,v_kind,v_value) on conflict do nothing returning true into v_reserved;
  if not coalesce(v_reserved,false) then
    raise exception 'SUBCATEGORY_IDENTITY_CONFLICT' using errcode='P0001',detail=v_kind||':'||v_value;
  end if;

  if exists (
    select 1 from public.subcategories s where s.category_id=new.category_id and s.id<>new.id and
      ((new.canonical_key is not null and lower(btrim(s.canonical_key))=new.canonical_key) or
       (new.canonical_key is null and s.canonical_key is null and coalesce(s.is_custom,false)=coalesce(new.is_custom,false)
        and lower(btrim(coalesce(s.name,'')))=v_value))
  ) then
    raise exception 'SUBCATEGORY_IDENTITY_CONFLICT' using errcode='P0001',detail=v_kind||':'||v_value;
  end if;
  return new;
end $$;
revoke all on function private.enforce_subcategory_identity() from public,anon,authenticated;

create or replace function private.release_subcategory_identity()
returns trigger language plpgsql security definer set search_path=pg_catalog,private,public as $$
declare v_kind text; v_value text;
begin
  select identity_kind,identity_value into v_kind,v_value
    from private.subcategory_identity_parts(old.category_id,old.name,old.is_custom,old.canonical_key);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    pg_catalog.jsonb_build_array(old.category_id,v_kind,v_value)::text,0));
  if not exists (
    select 1 from public.subcategories s where s.category_id=old.category_id and
      ((old.canonical_key is not null and lower(btrim(s.canonical_key))=v_value) or
       (old.canonical_key is null and s.canonical_key is null and coalesce(s.is_custom,false)=coalesce(old.is_custom,false)
        and lower(btrim(coalesce(s.name,'')))=v_value))
  ) then
    delete from private.subcategory_identity_reservations
      where category_id=old.category_id and identity_kind=v_kind and identity_value=v_value;
  end if;
  return null;
end $$;
revoke all on function private.release_subcategory_identity() from public,anon,authenticated;

drop trigger if exists subcategories_enforce_identity on public.subcategories;
create trigger subcategories_enforce_identity before insert or update of category_id,name,is_custom,canonical_key
on public.subcategories for each row execute function private.enforce_subcategory_identity();
drop trigger if exists subcategories_release_identity on public.subcategories;
create trigger subcategories_release_identity after delete or update of category_id,name,is_custom,canonical_key
on public.subcategories for each row execute function private.release_subcategory_identity();

create or replace function public.save_budget_idea_snapshot(p_event_id uuid,p_user_id uuid,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare item jsonb; category_name text; subcategory_name text; item_key text; v_category_id uuid; v_subcategory_id uuid;
  item_amount numeric; item_custom boolean; inserted_count integer:=0; preferred_subcategory_ids uuid[];
begin
  if not exists(select 1 from public.events e left join auth.users u on u.id=p_user_id where e.id=p_event_id and
    (e.owner_id=p_user_id or lower(coalesce(e.bride_email,''))=lower(coalesce(u.email,'')) or lower(coalesce(e.groom_email,''))=lower(coalesce(u.email,''))))
    then raise exception 'EVENT_ACCESS_DENIED' using errcode='42501'; end if;
  if jsonb_typeof(coalesce(p_rows,'[]'::jsonb))<>'array' then raise exception 'INVALID_BUDGET_SNAPSHOT' using errcode='22023'; end if;
  select coalesce(array_agg(distinct subcategory_id) filter(where subcategory_id is not null),'{}'::uuid[])
    into preferred_subcategory_ids from public.expenses where event_id=p_event_id;
  delete from public.expenses where event_id=p_event_id and status='planned' and from_dashboard=true and taxonomy_status='active';
  for item in select value from jsonb_array_elements(coalesce(p_rows,'[]'::jsonb)) loop
    category_name:=left(btrim(coalesce(item->>'category','')),160); subcategory_name:=left(btrim(coalesce(item->>'subcategory','')),160);
    item_custom:=coalesce((item->>'custom')::boolean,false); item_key:=case when item_custom then null else nullif(lower(left(btrim(item->>'canonicalKey'),240)),'') end;
    if category_name='' or subcategory_name='' then continue; end if;
    if item_key is not null and exists(select 1 from public.expenses where event_id=p_event_id and canonical_key=item_key and taxonomy_status='active') then continue; end if;
    select id into v_category_id from public.categories where event_id=p_event_id and lower(btrim(name))=lower(btrim(category_name)) order by id limit 1;
    if v_category_id is null then insert into public.categories(event_id,name) values(p_event_id,category_name) returning id into v_category_id; end if;
    select id into v_subcategory_id from public.subcategories where category_id=v_category_id and
      ((item_key is not null and lower(btrim(canonical_key))=item_key) or
       (item_key is null and canonical_key is null and is_custom=item_custom and lower(btrim(name))=lower(btrim(subcategory_name))))
      order by (id=any(preferred_subcategory_ids)) desc,inserted_at asc nulls last,id asc limit 1;
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
