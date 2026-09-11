-- Branch 45: stable identities for standard wedding budget items.
alter table public.subcategories add column if not exists canonical_key text;
alter table public.expenses add column if not exists canonical_key text;
alter table public.expenses add column if not exists taxonomy_status text not null default 'active';
alter table public.budget_items add column if not exists canonical_key text;

alter table public.expenses drop constraint if exists expenses_taxonomy_status_check;
alter table public.expenses add constraint expenses_taxonomy_status_check
  check (taxonomy_status in ('active','legacy_preserved'));

create or replace function public.wedding_budget_slug(value text)
returns text language sql immutable set search_path='' as $$
  select trim(both '.' from regexp_replace(
    translate(lower(coalesce(value,'')), 'àáâäèéêëìíîïòóôöùúûü''’', 'aaaaeeeeiiiioooouuuu'),
    '[^a-z0-9]+', '.', 'g'))
$$;
revoke all on function public.wedding_budget_slug(text) from public, anon, authenticated;
grant execute on function public.wedding_budget_slug(text) to service_role;

-- Backfill standard event snapshots. Custom entries stay outside global deduplication.
update public.subcategories s set canonical_key = case
  when public.wedding_budget_slug(s.name) in ('ventaglio','ventagli') then 'wedding.guest-comfort.fan'
  when public.wedding_budget_slug(s.name) in ('libretto.messa','libretti.messa','libretto.della.messa','libretto.della.messa.o.del.rito','libretto.cerimonia','libretti.cerimonia') then 'wedding.ceremony.booklet'
  when public.wedding_budget_slug(s.name) in ('segnaposto','segnaposti','tableau.segnaposto') then 'wedding.stationery.place-card'
  when public.wedding_budget_slug(s.name) = 'musiche' then null
  else 'wedding.' || public.wedding_budget_slug(c.name) || '.' || public.wedding_budget_slug(s.name)
end
from public.categories c join public.events ev on ev.id=c.event_id
where s.category_id=c.id and coalesce(ev.event_type,'wedding')='wedding' and not s.is_custom;

update public.expenses e set canonical_key=s.canonical_key
from public.subcategories s where e.subcategory_id=s.id and not s.is_custom and s.canonical_key is not null;

-- Keep redundant historical rows, but exclude empty copies from active accounting.
with ranked as (
  select id, row_number() over(partition by event_id,canonical_key order by
    case when coalesce(amount,0)<>0 or coalesce(committed_amount,0)<>0 or coalesce(paid_amount,0)<>0
      or nullif(btrim(coalesce(notes,'')),'') is not null or nullif(btrim(coalesce(supplier,'')),'') is not null then 0 else 1 end,
    inserted_at,id) rn
  from public.expenses where canonical_key is not null and taxonomy_status='active'
)
update public.expenses e set canonical_key=null,taxonomy_status='legacy_preserved'
from ranked r where e.id=r.id and r.rn>1;

create unique index if not exists expenses_unique_event_canonical_active
  on public.expenses(event_id,canonical_key) where canonical_key is not null and taxonomy_status='active';
create unique index if not exists budget_items_unique_idea_canonical
  on public.budget_items(event_id,country_code,source,canonical_key)
  where source='budget_idea' and canonical_key is not null;
create index if not exists subcategories_canonical_key_idx on public.subcategories(canonical_key) where canonical_key is not null;

comment on column public.subcategories.canonical_key is 'Stable standard taxonomy identity. Null for custom and preserved legacy entries.';
comment on column public.expenses.taxonomy_status is 'legacy_preserved retains historical rows but excludes redundant empty standard copies from accounting.';

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
    select id into v_category_id from public.categories where event_id=p_event_id and name=category_name order by id limit 1;
    if v_category_id is null then insert into public.categories(event_id,name) values(p_event_id,category_name) returning id into v_category_id; end if;
    select id into v_subcategory_id from public.subcategories where category_id=v_category_id and (canonical_key=item_key or (item_key is null and name=subcategory_name)) order by id limit 1;
    if v_subcategory_id is null then insert into public.subcategories(category_id,name,is_custom,canonical_key) values(v_category_id,subcategory_name,item_custom,item_key) returning id into v_subcategory_id;
    else update public.subcategories set name=subcategory_name,canonical_key=item_key,is_custom=item_custom where id=v_subcategory_id; end if;
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
