-- Branch 28: canonical global supplier catalog and event-private supplier planning.
-- Additive only: the 326 legacy suppliers, vendors and vendor_places are preserved.

alter table public.suppliers
  add column if not exists normalized_name text,
  add column if not exists legal_name text,
  add column if not exists subcategory text,
  add column if not exists address_line text,
  add column if not exists postal_code text,
  add column if not exists state text,
  add column if not exists country_code text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists tiktok_url text,
  add column if not exists service_area text,
  add column if not exists regions_served text[],
  add column if not exists travel_available boolean,
  add column if not exists starting_price numeric(12,2),
  add column if not exists price_range_min numeric(12,2),
  add column if not exists price_range_max numeric(12,2),
  add column if not exists currency text,
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists external_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists last_verified_at timestamptz,
  add column if not exists confidence_score smallint,
  add column if not exists verification_status text,
  add column if not exists created_at timestamptz;

update public.suppliers set
  normalized_name = public.normalize_catalog_text(name),
  address_line = coalesce(address_line, address),
  state = coalesce(state, province),
  country_code = lower(coalesce(nullif(country_code, ''), nullif(country, ''), 'it')),
  source = coalesce(nullif(source, ''), case when google_place_id is not null then 'google_places' else 'legacy' end),
  external_id = coalesce(nullif(external_id, ''), google_place_id),
  confidence_score = coalesce(confidence_score, case when verified then 90 else 20 end),
  verification_status = coalesce(verification_status, case when verified then 'VERIFIED' else 'TO_CHECK' end),
  last_verified_at = case when verified then coalesce(last_verified_at, updated_at, inserted_at) else last_verified_at end,
  created_at = coalesce(created_at, inserted_at, now());

alter table public.suppliers
  alter column normalized_name set not null,
  alter column country_code set not null,
  alter column source set not null,
  alter column confidence_score set default 0,
  alter column confidence_score set not null,
  alter column verification_status set default 'TO_CHECK',
  alter column verification_status set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.suppliers
  add constraint suppliers_name_not_blank_check check (length(trim(name)) > 0) not valid,
  add constraint suppliers_country_code_format_check check (country_code ~ '^[a-z]{2}$') not valid,
  add constraint suppliers_coordinates_pair_check check ((latitude is null) = (longitude is null)) not valid,
  add constraint suppliers_latitude_range_check check (latitude is null or latitude between -90 and 90) not valid,
  add constraint suppliers_longitude_range_check check (longitude is null or longitude between -180 and 180) not valid,
  add constraint suppliers_price_range_check check (price_range_min is null or price_range_max is null or price_range_min <= price_range_max) not valid,
  add constraint suppliers_prices_nonnegative_check check (coalesce(starting_price,0) >= 0 and coalesce(price_range_min,0) >= 0 and coalesce(price_range_max,0) >= 0) not valid,
  add constraint suppliers_currency_format_check check (currency is null or currency ~ '^[A-Z]{3}$') not valid,
  add constraint suppliers_confidence_score_check check (confidence_score between 0 and 100) not valid,
  add constraint suppliers_verification_status_check check (verification_status in ('VERIFIED','PROBABLE','TO_CHECK')) not valid;

alter table public.suppliers validate constraint suppliers_name_not_blank_check;
alter table public.suppliers validate constraint suppliers_country_code_format_check;
alter table public.suppliers validate constraint suppliers_coordinates_pair_check;
alter table public.suppliers validate constraint suppliers_latitude_range_check;
alter table public.suppliers validate constraint suppliers_longitude_range_check;
alter table public.suppliers validate constraint suppliers_price_range_check;
alter table public.suppliers validate constraint suppliers_prices_nonnegative_check;
alter table public.suppliers validate constraint suppliers_currency_format_check;
alter table public.suppliers validate constraint suppliers_confidence_score_check;
alter table public.suppliers validate constraint suppliers_verification_status_check;

create unique index if not exists suppliers_source_external_id_uidx on public.suppliers(source, external_id) where external_id is not null;
create index if not exists idx_suppliers_normalized_name on public.suppliers(normalized_name);
create index if not exists idx_suppliers_catalog_filters on public.suppliers(country_code, region, province, city);
create index if not exists idx_suppliers_category on public.suppliers(category);
create index if not exists idx_suppliers_verification_status on public.suppliers(verification_status);

create or replace function public.normalize_supplier_catalog_row()
returns trigger language plpgsql security invoker set search_path = public, extensions, pg_temp as $$
begin
  new.name := trim(new.name);
  new.normalized_name := public.normalize_catalog_text(new.name);
  new.address_line := nullif(trim(coalesce(new.address_line, new.address)), '');
  new.address := new.address_line;
  new.category := lower(nullif(trim(new.category), ''));
  new.subcategory := lower(nullif(trim(new.subcategory), ''));
  new.country_code := lower(trim(coalesce(nullif(new.country_code, ''), nullif(new.country, ''), 'it')));
  new.country := new.country_code;
  new.source := lower(trim(new.source));
  new.external_id := nullif(trim(new.external_id), '');
  new.currency := nullif(upper(trim(new.currency)), '');
  new.verified := new.verification_status = 'VERIFIED';
  return new;
end $$;
drop trigger if exists normalize_supplier_catalog_before_write on public.suppliers;
create trigger normalize_supplier_catalog_before_write before insert or update of name,address,address_line,category,subcategory,country,country_code,source,external_id,currency,verification_status on public.suppliers for each row execute function public.normalize_supplier_catalog_row();

create table public.saved_suppliers (
  id uuid primary key default gen_random_uuid(), event_id uuid not null, supplier_id uuid not null,
  status text not null default 'SAVED', favorite boolean not null default false,
  personal_notes text, contact_notes text, quote_amount numeric(12,2), agreed_amount numeric(12,2),
  currency text, deposit_amount numeric(12,2), deposit_paid boolean not null default false,
  balance_amount numeric(12,2), contract_signed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint saved_suppliers_event_supplier_key unique(event_id,supplier_id),
  constraint saved_suppliers_status_check check (status in ('DISCOVERED','SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED','REJECTED')),
  constraint saved_suppliers_amounts_check check (coalesce(quote_amount,0)>=0 and coalesce(agreed_amount,0)>=0 and coalesce(deposit_amount,0)>=0 and coalesce(balance_amount,0)>=0),
  constraint saved_suppliers_currency_check check (currency is null or currency ~ '^[A-Z]{3}$'),
  constraint saved_suppliers_event_id_fkey foreign key(event_id) references public.events(id) on delete cascade,
  constraint saved_suppliers_supplier_id_fkey foreign key(supplier_id) references public.suppliers(id) on delete restrict
);
create index idx_saved_suppliers_event_id on public.saved_suppliers(event_id);
create index idx_saved_suppliers_supplier_id on public.saved_suppliers(supplier_id);
create index idx_saved_suppliers_event_status on public.saved_suppliers(event_id,status);
create trigger update_saved_suppliers_updated_at before update on public.saved_suppliers for each row execute function public.update_updated_at_column();

create table public.supplier_locations (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  relationship_type text not null, source text not null, source_url text, verified_at timestamptz, created_at timestamptz not null default now(),
  primary key(supplier_id,location_id,relationship_type),
  constraint supplier_locations_relationship_check check (relationship_type in ('works_at','preferred_supplier','internal_supplier','external_allowed','recommended','historic_relationship')),
  constraint supplier_locations_evidence_check check (source <> '' and (relationship_type not in ('preferred_supplier','recommended') or source_url is not null))
);
create index idx_supplier_locations_location_id on public.supplier_locations(location_id);

alter table public.budget_items add column if not exists saved_supplier_id uuid references public.saved_suppliers(id) on delete set null;
create index if not exists idx_budget_items_saved_supplier_id on public.budget_items(saved_supplier_id);
alter table public.timeline_items add column if not exists saved_supplier_id uuid references public.saved_suppliers(id) on delete set null;
create index if not exists idx_timeline_items_saved_supplier_id on public.timeline_items(saved_supplier_id);
alter table public.expenses add column if not exists saved_supplier_id uuid references public.saved_suppliers(id) on delete set null;
create index if not exists idx_expenses_saved_supplier_id on public.expenses(saved_supplier_id);

alter table public.saved_suppliers enable row level security;
create policy saved_suppliers_select_own on public.saved_suppliers for select to authenticated using (exists(select 1 from public.events e where e.id=event_id and e.owner_id=(select auth.uid())));
create policy saved_suppliers_insert_own on public.saved_suppliers for insert to authenticated with check (exists(select 1 from public.events e where e.id=event_id and e.owner_id=(select auth.uid())));
create policy saved_suppliers_update_own on public.saved_suppliers for update to authenticated using (exists(select 1 from public.events e where e.id=event_id and e.owner_id=(select auth.uid()))) with check (exists(select 1 from public.events e where e.id=event_id and e.owner_id=(select auth.uid())));
create policy saved_suppliers_delete_own on public.saved_suppliers for delete to authenticated using (exists(select 1 from public.events e where e.id=event_id and e.owner_id=(select auth.uid())));

drop policy if exists suppliers_public_read on public.suppliers;
create policy suppliers_public_read on public.suppliers for select to anon,authenticated using(true);
revoke all on table public.suppliers from anon,authenticated;
grant select on table public.suppliers to anon,authenticated;
grant all on table public.suppliers to service_role;
revoke all on table public.saved_suppliers from anon;
grant select,insert,update,delete on table public.saved_suppliers to authenticated;
grant all on table public.saved_suppliers to service_role;
alter table public.supplier_locations enable row level security;
create policy supplier_locations_public_read on public.supplier_locations for select to anon,authenticated using(true);
revoke all on table public.supplier_locations from anon,authenticated;
grant select on table public.supplier_locations to anon,authenticated;
grant all on table public.supplier_locations to service_role;

comment on table public.suppliers is 'Canonical shared supplier catalog. Event-private relationship data belongs in saved_suppliers.';
comment on table public.saved_suppliers is 'Owner-only event-to-supplier relationship, commercial state and private notes.';
comment on table public.vendors is 'Legacy multi-entity catalog preserved for compatibility; do not use for new supplier planning.';
comment on table public.vendor_places is 'Legacy vendors-to-places relation preserved; not equivalent to supplier_locations.';
