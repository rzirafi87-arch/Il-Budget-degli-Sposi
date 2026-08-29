-- Branch 26: separate the shared church catalog from event-private planning data.
-- This migration is additive and preserves every legacy church row and reference.

create or replace function public.normalize_catalog_text(value text)
returns text
language sql
immutable
parallel safe
set search_path = public, extensions, pg_temp
as $$
  select nullif(
    trim(
      regexp_replace(
        translate(
          lower(coalesce(value, '')),
          'àáâãäåèéêëìíîïòóôõöùúûüýÿñç',
          'aaaaaaeeeeiiiiooooouuuuyync'
        ),
        '[^a-z0-9]+',
        ' ',
        'g'
      )
    ),
    ''
  )
$$;

alter table public.churches
  add column if not exists normalized_name text,
  add column if not exists normalized_address text,
  add column if not exists place_type text,
  add column if not exists denomination text,
  add column if not exists religion text,
  add column if not exists subtype text,
  add column if not exists address_line text,
  add column if not exists postal_code text,
  add column if not exists country_code text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists wedding_ceremony_available boolean,
  add column if not exists accessibility text,
  add column if not exists parking text,
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists external_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists last_verified_at timestamptz,
  add column if not exists confidence_score smallint,
  add column if not exists verification_status text,
  add column if not exists created_at timestamptz;

update public.churches
set
  normalized_name = public.normalize_catalog_text(name),
  normalized_address = public.normalize_catalog_text(address),
  place_type = coalesce(
    place_type,
    case lower(coalesce(church_type, ''))
      when 'sinagoga' then 'synagogue'
      when 'moschea' then 'mosque'
      else 'church'
    end
  ),
  denomination = coalesce(denomination, nullif(church_type, '')),
  religion = coalesce(
    religion,
    case lower(coalesce(church_type, ''))
      when 'sinagoga' then 'judaism'
      when 'moschea' then 'islam'
      else 'christianity'
    end
  ),
  address_line = coalesce(address_line, address),
  country_code = lower(coalesce(nullif(country_code, ''), nullif(country, ''), 'it')),
  source = coalesce(
    nullif(source, ''),
    case when google_place_id is not null then 'google_places' else 'legacy' end
  ),
  external_id = coalesce(nullif(external_id, ''), google_place_id),
  confidence_score = coalesce(confidence_score, case when verified then 90 else 20 end),
  verification_status = coalesce(
    verification_status,
    case when verified then 'VERIFIED' else 'TO_CHECK' end
  ),
  last_verified_at = case
    when verified then coalesce(last_verified_at, updated_at, inserted_at)
    else last_verified_at
  end,
  created_at = coalesce(created_at, inserted_at, now());

alter table public.churches
  alter column normalized_name set not null,
  alter column place_type set not null,
  alter column country_code set not null,
  alter column source set not null,
  alter column confidence_score set default 0,
  alter column confidence_score set not null,
  alter column verification_status set default 'TO_CHECK',
  alter column verification_status set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.churches
  add constraint churches_name_not_blank_check
    check (length(trim(name)) > 0) not valid,
  add constraint churches_normalized_name_not_blank_check
    check (length(trim(normalized_name)) > 0) not valid,
  add constraint churches_country_code_format_check
    check (country_code ~ '^[a-z]{2}$') not valid,
  add constraint churches_latitude_range_check
    check (latitude is null or latitude between -90 and 90) not valid,
  add constraint churches_longitude_range_check
    check (longitude is null or longitude between -180 and 180) not valid,
  add constraint churches_coordinates_pair_check
    check ((latitude is null) = (longitude is null)) not valid,
  add constraint churches_confidence_score_check
    check (confidence_score between 0 and 100) not valid,
  add constraint churches_verification_status_check
    check (verification_status in ('VERIFIED', 'PROBABLE', 'TO_CHECK')) not valid,
  add constraint churches_source_not_blank_check
    check (length(trim(source)) > 0) not valid,
  add constraint churches_external_id_not_blank_check
    check (external_id is null or length(trim(external_id)) > 0) not valid;

alter table public.churches validate constraint churches_name_not_blank_check;
alter table public.churches validate constraint churches_normalized_name_not_blank_check;
alter table public.churches validate constraint churches_country_code_format_check;
alter table public.churches validate constraint churches_latitude_range_check;
alter table public.churches validate constraint churches_longitude_range_check;
alter table public.churches validate constraint churches_coordinates_pair_check;
alter table public.churches validate constraint churches_confidence_score_check;
alter table public.churches validate constraint churches_verification_status_check;
alter table public.churches validate constraint churches_source_not_blank_check;
alter table public.churches validate constraint churches_external_id_not_blank_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.churches'::regclass
      and conname = 'churches_country_code_geo_countries_fkey'
  ) then
    alter table public.churches
      add constraint churches_country_code_geo_countries_fkey
      foreign key (country_code) references public.geo_countries(code)
      on update cascade on delete restrict not valid;
  end if;
end
$$;

create unique index if not exists churches_source_external_id_uidx
  on public.churches (source, external_id)
  where external_id is not null;
create index if not exists idx_churches_normalized_name
  on public.churches (normalized_name);
create index if not exists idx_churches_catalog_location
  on public.churches (country_code, region, city);
create index if not exists idx_churches_verification_status
  on public.churches (verification_status);

alter table public.sync_jobs
  add column if not exists records_read integer not null default 0,
  add column if not exists records_inserted integer not null default 0,
  add column if not exists records_updated integer not null default 0,
  add column if not exists records_skipped integer not null default 0,
  add column if not exists duplicate_candidates integer not null default 0,
  add column if not exists errors_count integer not null default 0;

create or replace function public.normalize_church_catalog_row()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
begin
  new.name := trim(new.name);
  new.normalized_name := public.normalize_catalog_text(new.name);
  new.address_line := nullif(trim(coalesce(new.address_line, new.address)), '');
  new.address := new.address_line;
  new.normalized_address := public.normalize_catalog_text(new.address_line);
  new.country_code := lower(trim(coalesce(nullif(new.country_code, ''), nullif(new.country, ''), 'it')));
  new.country := new.country_code;
  new.phone := nullif(regexp_replace(trim(coalesce(new.phone, '')), '\s+', ' ', 'g'), '');
  new.website := nullif(trim(new.website), '');
  new.source := lower(trim(new.source));
  new.external_id := nullif(trim(new.external_id), '');
  new.verified := new.verification_status = 'VERIFIED';
  return new;
end
$$;

drop trigger if exists normalize_church_catalog_before_write on public.churches;
create trigger normalize_church_catalog_before_write
before insert or update of name, address, address_line, country, country_code,
  phone, website, source, external_id, verification_status
on public.churches
for each row execute function public.normalize_church_catalog_row();

create table public.saved_churches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  church_id uuid not null,
  status text not null default 'considering',
  favorite boolean not null default false,
  contacted boolean not null default false,
  selected boolean not null default false,
  personal_notes text,
  personal_contact_notes text,
  quoted_price numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_churches_event_church_key unique (event_id, church_id),
  constraint saved_churches_status_check
    check (status in ('considering', 'contacted', 'shortlisted', 'selected', 'discarded')),
  constraint saved_churches_quoted_price_check
    check (quoted_price is null or quoted_price >= 0),
  constraint saved_churches_event_id_fkey
    foreign key (event_id) references public.events(id) on delete cascade,
  constraint saved_churches_church_id_fkey
    foreign key (church_id) references public.churches(id) on delete restrict
);

create index idx_saved_churches_event_id on public.saved_churches(event_id);
create index idx_saved_churches_church_id on public.saved_churches(church_id);
create unique index saved_churches_one_selected_per_event_uidx
  on public.saved_churches(event_id) where selected;

create trigger update_saved_churches_updated_at
before update on public.saved_churches
for each row execute function public.update_updated_at_column();

alter table public.saved_churches enable row level security;

create policy saved_churches_select_own
  on public.saved_churches for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = (select auth.uid())
  ));

create policy saved_churches_insert_own
  on public.saved_churches for insert to authenticated
  with check (exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = (select auth.uid())
  ));

create policy saved_churches_update_own
  on public.saved_churches for update to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = (select auth.uid())
  ));

create policy saved_churches_delete_own
  on public.saved_churches for delete to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = event_id and e.owner_id = (select auth.uid())
  ));

drop policy if exists churches_insert_auth on public.churches;
drop policy if exists churches_update_own on public.churches;
drop policy if exists churches_select_all on public.churches;
create policy churches_public_read
  on public.churches for select to anon, authenticated
  using (true);

revoke all on table public.churches from anon, authenticated;
grant select on table public.churches to anon, authenticated;
grant all on table public.churches to service_role;

revoke all on table public.saved_churches from anon;
grant select, insert, update, delete on table public.saved_churches to authenticated;
grant all on table public.saved_churches to service_role;

comment on table public.churches is
  'Shared catalog of churches and places of worship. Event-private planning data belongs in saved_churches.';
comment on table public.saved_churches is
  'Owner-only relationship between an event and a global church catalog record.';
comment on constraint saved_churches_church_id_fkey on public.saved_churches is
  'RESTRICT prevents deletion of a shared catalog entity while an event still references it.';
