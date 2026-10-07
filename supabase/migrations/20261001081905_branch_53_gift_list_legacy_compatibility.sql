-- Branch 53: additive rollback/rollout compatibility for the legacy gift-list API.
-- public.gift_list_items remains the only persisted source of truth.

do $guard$
declare
  existing_kind "char";
begin
  select c.relkind
    into existing_kind
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'gift_list';

  if existing_kind is not null and existing_kind <> 'v' then
    raise exception using
      errcode = '55000',
      message = 'public.gift_list exists but is not the Branch 53 compatibility view';
  end if;
end
$guard$;

create or replace view public.gift_list
with (security_invoker = true)
as
select
  item.id,
  item.event_id,
  item.created_by as user_id,
  item.type,
  item.name,
  item.description,
  item.target_amount as price,
  item.url,
  case item.priority
    when 'high' then 'alta'
    when 'medium' then 'media'
    when 'low' then 'bassa'
  end as priority,
  case item.status
    when 'wanted' then 'desiderato'
    when 'received' then 'acquistato'
  end as status,
  item.note as notes,
  null::text as image_url,
  null::text as purchased_by,
  null::timestamptz as purchased_at,
  item.created_at,
  item.updated_at
from public.gift_list_items item
where item.status <> 'archived';

create or replace function public.gift_list_legacy_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  canonical_priority text;
  canonical_status text;
  stored public.gift_list_items%rowtype;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    if new.image_url is not null then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_IMAGE_URL_UNSUPPORTED';
    end if;
    if new.purchased_by is not null then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_PURCHASED_BY_UNSUPPORTED';
    end if;
    if new.purchased_at is not null then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_PURCHASED_AT_UNSUPPORTED';
    end if;

    canonical_priority := case coalesce(new.priority, 'media')
      when 'alta' then 'high'
      when 'media' then 'medium'
      when 'bassa' then 'low'
      else null
    end;
    if canonical_priority is null then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_PRIORITY_INVALID';
    end if;

    canonical_status := case coalesce(new.status, 'desiderato')
      when 'desiderato' then 'wanted'
      when 'acquistato' then 'received'
      when 'ricevuto' then 'received'
      else null
    end;
    if canonical_status is null then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_STATUS_INVALID';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.event_id is null or new.user_id is null then
      raise exception using errcode = '23502', message = 'GIFT_LIST_LEGACY_EVENT_AND_USER_REQUIRED';
    end if;

    if new.id is null then
      insert into public.gift_list_items (
        event_id, created_by, type, name, description, target_amount, url,
        priority, status, note
      ) values (
        new.event_id, new.user_id, new.type, new.name, new.description, new.price,
        new.url, canonical_priority, canonical_status, new.notes
      )
      returning * into stored;
    else
      insert into public.gift_list_items (
        id, event_id, created_by, type, name, description, target_amount, url,
        priority, status, note
      ) values (
        new.id, new.event_id, new.user_id, new.type, new.name, new.description,
        new.price, new.url, canonical_priority, canonical_status, new.notes
      )
      returning * into stored;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.event_id is distinct from old.event_id
      or new.user_id is distinct from old.user_id then
      raise exception using errcode = '22023', message = 'GIFT_LIST_LEGACY_IDENTITY_IMMUTABLE';
    end if;

    update public.gift_list_items item
       set type = new.type,
           name = new.name,
           description = new.description,
           target_amount = new.price,
           url = new.url,
           priority = canonical_priority,
           status = canonical_status,
           note = new.notes
     where item.id = old.id
       and item.event_id = old.event_id
       and item.status <> 'archived'
     returning item.* into stored;

    if not found then
      return null;
    end if;
  elsif tg_op = 'DELETE' then
    delete from public.gift_list_items item
     where item.id = old.id
       and item.event_id = old.event_id
       and item.status <> 'archived'
     returning item.* into stored;

    if not found then
      return null;
    end if;
    return old;
  end if;

  new.id := stored.id;
  new.event_id := stored.event_id;
  new.user_id := stored.created_by;
  new.type := stored.type;
  new.name := stored.name;
  new.description := stored.description;
  new.price := stored.target_amount;
  new.url := stored.url;
  new.priority := case stored.priority
    when 'high' then 'alta'
    when 'medium' then 'media'
    when 'low' then 'bassa'
  end;
  new.status := case stored.status
    when 'wanted' then 'desiderato'
    when 'received' then 'acquistato'
  end;
  new.notes := stored.note;
  new.image_url := null;
  new.purchased_by := null;
  new.purchased_at := null;
  new.created_at := stored.created_at;
  new.updated_at := stored.updated_at;
  return new;
end
$function$;

drop trigger if exists gift_list_legacy_write on public.gift_list;
create trigger gift_list_legacy_write
instead of insert or update or delete on public.gift_list
for each row execute function public.gift_list_legacy_write();

revoke all on table public.gift_list from public, anon, authenticated;
grant select, insert, update, delete on table public.gift_list to service_role;

revoke all on function public.gift_list_legacy_write() from public, anon, authenticated;
grant execute on function public.gift_list_legacy_write() to service_role;

comment on view public.gift_list is
  'Writable legacy compatibility contract backed only by gift_list_items. Archived rows are intentionally hidden.';
comment on function public.gift_list_legacy_write() is
  'Maps the legacy gift-list write contract to gift_list_items and rejects unsupported purchase-tracking fields.';

notify pgrst, 'reload schema';
