-- Branch 27: separate the shared venue catalog from event-private planning data.
-- Additive migration: all legacy locations and references are preserved.

alter table public.locations
  add column if not exists normalized_name text,
  add column if not exists normalized_address text,
  add column if not exists venue_type text,
  add column if not exists subtype text,
  add column if not exists address_line text,
  add column if not exists postal_code text,
  add column if not exists country_code text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists accommodation_available boolean,
  add column if not exists catering_internal boolean,
  add column if not exists catering_external_allowed boolean,
  add column if not exists parking boolean,
  add column if not exists accessibility boolean,
  add column if not exists outdoor_space boolean,
  add column if not exists indoor_space boolean,
  add column if not exists price_range_min numeric(12,2),
  add column if not exists price_range_max numeric(12,2),
  add column if not exists currency text,
  add column if not exists price_verified_at timestamptz,
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists external_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists last_verified_at timestamptz,
  add column if not exists confidence_score smallint,
  add column if not exists verification_status text,
  add column if not exists created_at timestamptz;

update public.locations
set
  normalized_name = public.normalize_catalog_text(name),
  normalized_address = public.normalize_catalog_text(address),
  venue_type = coalesce(nullif(lower(trim(venue_type)), ''), nullif(lower(trim(location_type)), ''), 'other'),
  address_line = coalesce(address_line, address),
  country_code = lower(coalesce(nullif(country_code, ''), nullif(country, ''), 'it')),
  source = coalesce(nullif(source, ''), case when google_place_id is not null then 'google_places' else 'legacy' end),
  external_id = coalesce(nullif(external_id, ''), google_place_id),
  confidence_score = coalesce(confidence_score, case when verified then 90 else 20 end),
  verification_status = coalesce(verification_status, case when verified then 'VERIFIED' else 'TO_CHECK' end),
  last_verified_at = case when verified then coalesce(last_verified_at, updated_at, inserted_at) else last_verified_at end,
  created_at = coalesce(created_at, inserted_at, now());

alter table public.locations
  alter column normalized_name set not null,
  alter column venue_type set not null,
  alter column country_code set not null,
  alter column source set not null,
  alter column confidence_score set default 0,
  alter column confidence_score set not null,
  alter column verification_status set default 'TO_CHECK',
  alter column verification_status set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.locations
  add constraint locations_name_not_blank_check check (length(trim(name)) > 0) not valid,
  add constraint locations_country_code_format_check check (country_code ~ '^[a-z]{2}$') not valid,
  add constraint locations_latitude_range_check check (latitude is null or latitude between -90 and 90) not valid,
  add constraint locations_longitude_range_check check (longitude is null or longitude between -180 and 180) not valid,
  add constraint locations_coordinates_pair_check check ((latitude is null) = (longitude is null)) not valid,
  add constraint locations_capacity_range_check check (capacity_min is null or capacity_max is null or capacity_min <= capacity_max) not valid,
  add constraint locations_price_range_check check (price_range_min is null or price_range_max is null or price_range_min <= price_range_max) not valid,
  add constraint locations_confidence_score_check check (confidence_score between 0 and 100) not valid,
  add constraint locations_verification_status_check check (verification_status in ('VERIFIED', 'PROBABLE', 'TO_CHECK')) not valid,
  add constraint locations_currency_format_check check (currency is null or currency ~ '^[A-Z]{3}$') not valid;

alter table public.locations validate constraint locations_name_not_blank_check;
alter table public.locations validate constraint locations_country_code_format_check;
alter table public.locations validate constraint locations_latitude_range_check;
alter table public.locations validate constraint locations_longitude_range_check;
alter table public.locations validate constraint locations_coordinates_pair_check;
alter table public.locations validate constraint locations_capacity_range_check;
alter table public.locations validate constraint locations_price_range_check;
alter table public.locations validate constraint locations_confidence_score_check;
alter table public.locations validate constraint locations_verification_status_check;
alter table public.locations validate constraint locations_currency_format_check;

create unique index if not exists locations_source_external_id_uidx
  on public.locations(source, external_id) where external_id is not null;
create index if not exists idx_locations_normalized_name on public.locations(normalized_name);
create index if not exists idx_locations_catalog_location on public.locations(country_code, region, city);
create index if not exists idx_locations_venue_type on public.locations(venue_type);
create index if not exists idx_locations_verification_status on public.locations(verification_status);

create or replace function public.normalize_location_catalog_row()
returns trigger language plpgsql security invoker
set search_path = public, extensions, pg_temp
as $$
begin
  new.name := trim(new.name);
  new.normalized_name := public.normalize_catalog_text(new.name);
  new.address_line := nullif(trim(coalesce(new.address_line, new.address)), '');
  new.address := new.address_line;
  new.normalized_address := public.normalize_catalog_text(new.address_line);
  new.venue_type := lower(trim(coalesce(nullif(new.venue_type, ''), nullif(new.location_type, ''), 'other')));
  new.location_type := new.venue_type;
  new.country_code := lower(trim(coalesce(nullif(new.country_code, ''), nullif(new.country, ''), 'it')));
  new.country := new.country_code;
  new.phone := nullif(regexp_replace(trim(coalesce(new.phone, '')), '\s+', ' ', 'g'), '');
  new.website := nullif(trim(new.website), '');
  new.source := lower(trim(new.source));
  new.external_id := nullif(trim(new.external_id), '');
  new.currency := nullif(upper(trim(new.currency)), '');
  new.verified := new.verification_status = 'VERIFIED';
  return new;
end
$$;

drop trigger if exists normalize_location_catalog_before_write on public.locations;
create trigger normalize_location_catalog_before_write
before insert or update of name, address, address_line, location_type, venue_type, country,
  country_code, phone, website, source, external_id, currency, verification_status
on public.locations for each row execute function public.normalize_location_catalog_row();

create table public.saved_locations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  location_id uuid not null,
  location_role text not null default 'reception',
  status text not null default 'considering',
  favorite boolean not null default false,
  contacted boolean not null default false,
  visited boolean not null default false,
  shortlisted boolean not null default false,
  selected boolean not null default false,
  personal_notes text,
  contact_notes text,
  quote_amount numeric(12,2),
  quote_currency text,
  quote_received_at timestamptz,
  agreed_cost numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_locations_event_location_role_key unique(event_id, location_id, location_role),
  constraint saved_locations_role_check check (location_role in ('reception','ceremony','accommodation','party','other')),
  constraint saved_locations_status_check check (status in ('considering','contacted','visited','shortlisted','selected','discarded')),
  constraint saved_locations_quote_check check (quote_amount is null or quote_amount >= 0),
  constraint saved_locations_agreed_cost_check check (agreed_cost is null or agreed_cost >= 0),
  constraint saved_locations_quote_currency_check check (quote_currency is null or quote_currency ~ '^[A-Z]{3}$'),
  constraint saved_locations_event_id_fkey foreign key(event_id) references public.events(id) on delete cascade,
  constraint saved_locations_location_id_fkey foreign key(location_id) references public.locations(id) on delete restrict
);

create index idx_saved_locations_event_id on public.saved_locations(event_id);
create index idx_saved_locations_location_id on public.saved_locations(location_id);
create unique index saved_locations_one_selected_per_event_role_uidx
  on public.saved_locations(event_id, location_role) where selected;
create trigger update_saved_locations_updated_at before update on public.saved_locations
for each row execute function public.update_updated_at_column();

alter table public.saved_locations enable row level security;
create policy saved_locations_select_own on public.saved_locations for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy saved_locations_insert_own on public.saved_locations for insert to authenticated
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy saved_locations_update_own on public.saved_locations for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy saved_locations_delete_own on public.saved_locations for delete to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));

drop policy if exists locations_insert_auth on public.locations;
drop policy if exists locations_update_own on public.locations;
drop policy if exists locations_select_all on public.locations;
create policy locations_public_read on public.locations for select to anon, authenticated using (true);
revoke all on table public.locations from anon, authenticated;
grant select on table public.locations to anon, authenticated;
grant all on table public.locations to service_role;
revoke all on table public.saved_locations from anon;
grant select, insert, update, delete on table public.saved_locations to authenticated;
grant all on table public.saved_locations to service_role;

alter table public.sync_jobs drop constraint if exists sync_jobs_source_check;
alter table public.sync_jobs add constraint sync_jobs_source_check
  check (source in ('google', 'osm', 'wikidata', 'official_site'));

comment on table public.locations is 'Shared catalog of wedding venues. Event-private planning data belongs in saved_locations.';
comment on table public.saved_locations is 'Owner-only relationship between an event and a global venue, including its event-specific role.';
