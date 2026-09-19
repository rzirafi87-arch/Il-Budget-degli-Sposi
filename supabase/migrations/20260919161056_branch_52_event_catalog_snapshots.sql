-- Branch 52 / Milestone 2: immutable event snapshots, allowlisted private
-- overrides and event-private catalog records.
--
-- This migration is schema-only. It deliberately contains no cleanup,
-- backfill, deduplication or other DML against application data. Existing
-- saved rows remain valid with a NULL snapshot and use the global catalog as
-- their read fallback until they are replaced by a newly-created save.

create or replace function public.catalog_payload_has_only_allowed_keys(
  entity_type_value text,
  payload jsonb,
  payload_kind text
)
returns boolean
language sql
immutable
parallel safe
set search_path = public, extensions, pg_temp
as $$
  select
    payload is not null
    and jsonb_typeof(payload) = 'object'
    and entity_type_value in ('church', 'location', 'supplier')
    and payload_kind in ('snapshot', 'override')
    and not exists (
      select 1
      from jsonb_object_keys(payload) as supplied(key)
      where not (
        supplied.key = any (
          case entity_type_value
            when 'church' then
              case payload_kind
                when 'snapshot' then array[
                  'id','name','place_type','denomination','religion','subtype',
                  'address_line','city','province','region','postal_code','country_code',
                  'phone','email','website','description','capacity',
                  'wedding_ceremony_available','accessibility','parking','latitude','longitude',
                  'source','source_url','external_id','source_updated_at','last_verified_at',
                  'verification_status','google_place_id'
                ]::text[]
                else array[
                  'name','place_type','denomination','religion','subtype','address_line',
                  'city','province','region','postal_code','country_code','phone','email',
                  'website','description','capacity','wedding_ceremony_available',
                  'accessibility','parking','latitude','longitude'
                ]::text[]
              end
            when 'location' then
              case payload_kind
                when 'snapshot' then array[
                  'id','name','venue_type','subtype','address_line','city','province','region',
                  'postal_code','country_code','phone','email','website','instagram_url',
                  'facebook_url','description','capacity_min','capacity_max',
                  'accommodation_available','catering_internal','catering_external_allowed',
                  'parking','accessibility','outdoor_space','indoor_space','price_range_min',
                  'price_range_max','currency','latitude','longitude','source','source_url',
                  'external_id','source_updated_at','last_verified_at','verification_status',
                  'google_place_id'
                ]::text[]
                else array[
                  'name','venue_type','subtype','address_line','city','province','region',
                  'postal_code','country_code','phone','email','website','instagram_url',
                  'facebook_url','description','capacity_min','capacity_max',
                  'accommodation_available','catering_internal','catering_external_allowed',
                  'parking','accessibility','outdoor_space','indoor_space','price_range_min',
                  'price_range_max','currency','latitude','longitude'
                ]::text[]
              end
            when 'supplier' then
              case payload_kind
                when 'snapshot' then array[
                  'id','name','category','subcategory','address_line','city','province','region',
                  'postal_code','state','country_code','phone','email','website','instagram_url',
                  'facebook_url','tiktok_url','description','service_area','regions_served',
                  'travel_available','starting_price','price_range_min','price_range_max',
                  'currency','latitude','longitude','source','source_url','external_id',
                  'source_updated_at','last_verified_at','verification_status','google_place_id'
                ]::text[]
                else array[
                  'name','category','subcategory','address_line','city','province','region',
                  'postal_code','state','country_code','phone','email','website','instagram_url',
                  'facebook_url','tiktok_url','description','service_area','regions_served',
                  'travel_available','starting_price','price_range_min','price_range_max',
                  'currency','latitude','longitude'
                ]::text[]
              end
          end
        )
      )
    )
$$;

revoke all on function public.catalog_payload_has_only_allowed_keys(text, jsonb, text) from public, anon;
grant execute on function public.catalog_payload_has_only_allowed_keys(text, jsonb, text) to authenticated, service_role;

alter table public.saved_churches
  add column if not exists catalog_snapshot jsonb,
  add column if not exists catalog_snapshot_version smallint,
  add column if not exists catalog_snapshot_captured_at timestamptz,
  add column if not exists catalog_snapshot_fingerprint text,
  add column if not exists catalog_provenance_snapshot jsonb,
  add column if not exists private_overrides jsonb not null default '{}'::jsonb;

alter table public.saved_locations
  add column if not exists catalog_snapshot jsonb,
  add column if not exists catalog_snapshot_version smallint,
  add column if not exists catalog_snapshot_captured_at timestamptz,
  add column if not exists catalog_snapshot_fingerprint text,
  add column if not exists catalog_provenance_snapshot jsonb,
  add column if not exists private_overrides jsonb not null default '{}'::jsonb;

alter table public.saved_suppliers
  add column if not exists catalog_snapshot jsonb,
  add column if not exists catalog_snapshot_version smallint,
  add column if not exists catalog_snapshot_captured_at timestamptz,
  add column if not exists catalog_snapshot_fingerprint text,
  add column if not exists catalog_provenance_snapshot jsonb,
  add column if not exists private_overrides jsonb not null default '{}'::jsonb;

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('saved_churches', 'church'),
      ('saved_locations', 'location'),
      ('saved_suppliers', 'supplier')
    ) as values_to_apply(table_name, entity_type)
  loop
    if not exists (
      select 1 from pg_constraint
      where conrelid = ('public.' || item.table_name)::regclass
        and conname = item.table_name || '_snapshot_shape_check'
    ) then
      execute format(
        'alter table public.%I add constraint %I check (
          (catalog_snapshot is null and catalog_snapshot_version is null
            and catalog_snapshot_captured_at is null and catalog_snapshot_fingerprint is null
            and catalog_provenance_snapshot is null)
          or
          (catalog_snapshot is not null and catalog_snapshot_version = 1
            and catalog_snapshot_captured_at is not null
            and catalog_snapshot_fingerprint ~ ''^[a-f0-9]{64}$''
            and jsonb_typeof(catalog_provenance_snapshot) = ''object''
            and public.catalog_payload_has_only_allowed_keys(%L, catalog_snapshot, ''snapshot''))
        ) not valid',
        item.table_name,
        item.table_name || '_snapshot_shape_check',
        item.entity_type
      );
    end if;
    if not exists (
      select 1 from pg_constraint
      where conrelid = ('public.' || item.table_name)::regclass
        and conname = item.table_name || '_private_overrides_check'
    ) then
      execute format(
        'alter table public.%I add constraint %I check (
          public.catalog_payload_has_only_allowed_keys(%L, private_overrides, ''override'')
        ) not valid',
        item.table_name,
        item.table_name || '_private_overrides_check',
        item.entity_type
      );
    end if;
    execute format('alter table public.%I validate constraint %I', item.table_name, item.table_name || '_snapshot_shape_check');
    execute format('alter table public.%I validate constraint %I', item.table_name, item.table_name || '_private_overrides_check');
  end loop;
end
$$;

create or replace function private.capture_saved_catalog_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  entity_type_value text;
  global_id uuid;
  snapshot_value jsonb;
  provenance_value jsonb;
begin
  if tg_table_name = 'saved_churches' then
    entity_type_value := 'church';
    global_id := new.church_id;
    select jsonb_strip_nulls(jsonb_build_object(
      'id', c.id, 'name', c.name, 'place_type', c.place_type,
      'denomination', c.denomination, 'religion', c.religion, 'subtype', c.subtype,
      'address_line', c.address_line, 'city', c.city, 'province', c.province,
      'region', c.region, 'postal_code', c.postal_code, 'country_code', c.country_code,
      'phone', c.phone, 'email', c.email, 'website', c.website,
      'description', c.description, 'capacity', c.capacity,
      'wedding_ceremony_available', c.wedding_ceremony_available,
      'accessibility', c.accessibility, 'parking', c.parking,
      'latitude', c.latitude, 'longitude', c.longitude,
      'source', c.source, 'source_url', c.source_url, 'external_id', c.external_id,
      'source_updated_at', c.source_updated_at, 'last_verified_at', c.last_verified_at,
      'verification_status', c.verification_status, 'google_place_id', c.google_place_id
    )) into snapshot_value from public.churches c where c.id = global_id;
  elsif tg_table_name = 'saved_locations' then
    entity_type_value := 'location';
    global_id := new.location_id;
    select jsonb_strip_nulls(jsonb_build_object(
      'id', l.id, 'name', l.name, 'venue_type', l.venue_type, 'subtype', l.subtype,
      'address_line', l.address_line, 'city', l.city, 'province', l.province,
      'region', l.region, 'postal_code', l.postal_code, 'country_code', l.country_code,
      'phone', l.phone, 'email', l.email, 'website', l.website,
      'instagram_url', l.instagram_url, 'facebook_url', l.facebook_url,
      'description', l.description, 'capacity_min', l.capacity_min, 'capacity_max', l.capacity_max,
      'accommodation_available', l.accommodation_available, 'catering_internal', l.catering_internal,
      'catering_external_allowed', l.catering_external_allowed, 'parking', l.parking,
      'accessibility', l.accessibility, 'outdoor_space', l.outdoor_space,
      'indoor_space', l.indoor_space, 'price_range_min', l.price_range_min,
      'price_range_max', l.price_range_max, 'currency', l.currency,
      'latitude', l.latitude, 'longitude', l.longitude,
      'source', l.source, 'source_url', l.source_url, 'external_id', l.external_id,
      'source_updated_at', l.source_updated_at, 'last_verified_at', l.last_verified_at,
      'verification_status', l.verification_status, 'google_place_id', l.google_place_id
    )) into snapshot_value from public.locations l where l.id = global_id;
  elsif tg_table_name = 'saved_suppliers' then
    entity_type_value := 'supplier';
    global_id := new.supplier_id;
    select jsonb_strip_nulls(jsonb_build_object(
      'id', s.id, 'name', s.name, 'category', s.category, 'subcategory', s.subcategory,
      'address_line', s.address_line, 'city', s.city, 'province', s.province,
      'region', s.region, 'postal_code', s.postal_code, 'state', s.state,
      'country_code', s.country_code, 'phone', s.phone, 'email', s.email,
      'website', s.website, 'instagram_url', s.instagram_url,
      'facebook_url', s.facebook_url, 'tiktok_url', s.tiktok_url,
      'description', s.description, 'service_area', s.service_area,
      'regions_served', s.regions_served, 'travel_available', s.travel_available,
      'starting_price', s.starting_price, 'price_range_min', s.price_range_min,
      'price_range_max', s.price_range_max, 'currency', s.currency,
      'latitude', s.latitude, 'longitude', s.longitude,
      'source', s.source, 'source_url', s.source_url, 'external_id', s.external_id,
      'source_updated_at', s.source_updated_at, 'last_verified_at', s.last_verified_at,
      'verification_status', s.verification_status, 'google_place_id', s.google_place_id
    )) into snapshot_value from public.suppliers s where s.id = global_id;
  else
    raise exception 'unsupported saved catalog table' using errcode = '23514';
  end if;

  if snapshot_value is null then
    raise exception 'catalog record not found while capturing snapshot' using errcode = '23503';
  end if;

  select jsonb_build_object(
    'catalog', jsonb_strip_nulls(jsonb_build_object(
      'source', snapshot_value -> 'source',
      'source_url', snapshot_value -> 'source_url',
      'external_id', snapshot_value -> 'external_id',
      'source_updated_at', snapshot_value -> 'source_updated_at',
      'last_verified_at', snapshot_value -> 'last_verified_at',
      'verification_status', snapshot_value -> 'verification_status'
    )),
    'pipeline', coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
      'source_type', p.source_type,
      'source_name', p.source_name,
      'source_url', p.source_url,
      'external_id', p.external_id,
      'source_updated_at', p.source_updated_at,
      'last_seen_at', p.last_seen_at,
      'freshness_status', p.freshness_status
    )) order by p.source_type, p.source_name, p.external_id) filter (where p.id is not null), '[]'::jsonb)
  )
  into provenance_value
  from public.catalog_provenance p
  where p.entity_type = entity_type_value and p.entity_id = global_id;

  new.catalog_snapshot := snapshot_value;
  new.catalog_snapshot_version := 1;
  new.catalog_snapshot_captured_at := transaction_timestamp();
  new.catalog_snapshot_fingerprint := encode(digest(snapshot_value::text, 'sha256'), 'hex');
  new.catalog_provenance_snapshot := coalesce(provenance_value, jsonb_build_object('catalog', '{}'::jsonb, 'pipeline', '[]'::jsonb));
  new.private_overrides := coalesce(new.private_overrides, '{}'::jsonb);
  return new;
end
$$;

revoke all on function private.capture_saved_catalog_snapshot() from public, anon, authenticated;
grant execute on function private.capture_saved_catalog_snapshot() to service_role;

create or replace function public.protect_saved_catalog_snapshot()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
begin
  if new.event_id is distinct from old.event_id
    or new.catalog_snapshot is distinct from old.catalog_snapshot
    or new.catalog_snapshot_version is distinct from old.catalog_snapshot_version
    or new.catalog_snapshot_captured_at is distinct from old.catalog_snapshot_captured_at
    or new.catalog_snapshot_fingerprint is distinct from old.catalog_snapshot_fingerprint
    or new.catalog_provenance_snapshot is distinct from old.catalog_provenance_snapshot
    or (case tg_table_name
      when 'saved_churches' then to_jsonb(new) -> 'church_id'
      when 'saved_locations' then to_jsonb(new) -> 'location_id'
      when 'saved_suppliers' then to_jsonb(new) -> 'supplier_id'
      else null
    end) is distinct from (case tg_table_name
      when 'saved_churches' then to_jsonb(old) -> 'church_id'
      when 'saved_locations' then to_jsonb(old) -> 'location_id'
      when 'saved_suppliers' then to_jsonb(old) -> 'supplier_id'
      else null
    end)
  then
    raise exception 'saved catalog identity and snapshot are immutable' using errcode = '23514';
  end if;
  return new;
end
$$;

revoke all on function public.protect_saved_catalog_snapshot() from public, anon;
grant execute on function public.protect_saved_catalog_snapshot() to authenticated, service_role;

drop trigger if exists capture_saved_church_snapshot on public.saved_churches;
create trigger capture_saved_church_snapshot
before insert on public.saved_churches
for each row execute function private.capture_saved_catalog_snapshot();
drop trigger if exists protect_saved_church_snapshot on public.saved_churches;
create trigger protect_saved_church_snapshot
before update on public.saved_churches
for each row execute function public.protect_saved_catalog_snapshot();

drop trigger if exists capture_saved_location_snapshot on public.saved_locations;
create trigger capture_saved_location_snapshot
before insert on public.saved_locations
for each row execute function private.capture_saved_catalog_snapshot();
drop trigger if exists protect_saved_location_snapshot on public.saved_locations;
create trigger protect_saved_location_snapshot
before update on public.saved_locations
for each row execute function public.protect_saved_catalog_snapshot();

drop trigger if exists capture_saved_supplier_snapshot on public.saved_suppliers;
create trigger capture_saved_supplier_snapshot
before insert on public.saved_suppliers
for each row execute function private.capture_saved_catalog_snapshot();
drop trigger if exists protect_saved_supplier_snapshot on public.saved_suppliers;
create trigger protect_saved_supplier_snapshot
before update on public.saved_suppliers
for each row execute function public.protect_saved_catalog_snapshot();

create table if not exists public.event_private_catalog_records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  entity_type text not null,
  client_key uuid not null,
  snapshot_data jsonb not null,
  snapshot_version smallint not null default 1,
  snapshot_captured_at timestamptz not null default now(),
  snapshot_fingerprint text not null,
  override_data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_private_catalog_records_entity_type_check
    check (entity_type in ('church', 'location', 'supplier')),
  constraint event_private_catalog_records_snapshot_version_check
    check (snapshot_version = 1),
  constraint event_private_catalog_records_snapshot_fingerprint_check
    check (snapshot_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint event_private_catalog_records_payload_check
    check (
      public.catalog_payload_has_only_allowed_keys(entity_type, snapshot_data, 'override')
      and nullif(btrim(snapshot_data ->> 'name'), '') is not null
      and public.catalog_payload_has_only_allowed_keys(entity_type, override_data, 'override')
    ),
  constraint event_private_catalog_records_event_client_key
    unique (event_id, entity_type, client_key)
);

create index if not exists event_private_catalog_records_event_type_created_idx
  on public.event_private_catalog_records(event_id, entity_type, created_at, id);

create or replace function public.prepare_event_private_catalog_record()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.snapshot_version := 1;
    new.snapshot_captured_at := transaction_timestamp();
    new.snapshot_fingerprint := encode(digest(new.snapshot_data::text, 'sha256'), 'hex');
    new.override_data := coalesce(new.override_data, '{}'::jsonb);
    new.created_at := coalesce(new.created_at, transaction_timestamp());
    new.updated_at := coalesce(new.updated_at, transaction_timestamp());
  else
    if new.event_id is distinct from old.event_id
      or new.entity_type is distinct from old.entity_type
      or new.client_key is distinct from old.client_key
      or new.snapshot_data is distinct from old.snapshot_data
      or new.snapshot_version is distinct from old.snapshot_version
      or new.snapshot_captured_at is distinct from old.snapshot_captured_at
      or new.snapshot_fingerprint is distinct from old.snapshot_fingerprint
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception 'private catalog identity and snapshot are immutable' using errcode = '23514';
    end if;
    new.updated_at := transaction_timestamp();
  end if;
  return new;
end
$$;

revoke all on function public.prepare_event_private_catalog_record() from public, anon;
grant execute on function public.prepare_event_private_catalog_record() to authenticated, service_role;

drop trigger if exists prepare_event_private_catalog_record on public.event_private_catalog_records;
create trigger prepare_event_private_catalog_record
before insert or update on public.event_private_catalog_records
for each row execute function public.prepare_event_private_catalog_record();

alter table public.event_private_catalog_records enable row level security;

drop policy if exists event_private_catalog_records_select_event on public.event_private_catalog_records;
create policy event_private_catalog_records_select_event
  on public.event_private_catalog_records for select to authenticated
  using (public.can_access_event(event_id));

drop policy if exists event_private_catalog_records_insert_event on public.event_private_catalog_records;
create policy event_private_catalog_records_insert_event
  on public.event_private_catalog_records for insert to authenticated
  with check (public.can_access_event(event_id) and created_by = (select auth.uid()));

drop policy if exists event_private_catalog_records_update_event on public.event_private_catalog_records;
create policy event_private_catalog_records_update_event
  on public.event_private_catalog_records for update to authenticated
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));

drop policy if exists event_private_catalog_records_delete_event on public.event_private_catalog_records;
create policy event_private_catalog_records_delete_event
  on public.event_private_catalog_records for delete to authenticated
  using (public.can_access_event(event_id));

revoke all on table public.event_private_catalog_records from public, anon;
grant select, insert, update, delete on table public.event_private_catalog_records to authenticated;
grant all on table public.event_private_catalog_records to service_role;

comment on column public.saved_churches.catalog_snapshot is
  'Immutable versioned copy of the global church fields captured on save; NULL only for legacy rows.';
comment on column public.saved_locations.catalog_snapshot is
  'Immutable versioned copy of the global location fields captured on save; NULL only for legacy rows.';
comment on column public.saved_suppliers.catalog_snapshot is
  'Immutable versioned copy of the global supplier fields captured on save; NULL only for legacy rows.';
comment on table public.event_private_catalog_records is
  'Event-scoped private-only catalog records. client_key provides retry/concurrency idempotency without merging same-name entities.';
