-- Branch 42: align church and location country codes with geo_countries ISO keys.
-- The existing churches FK points at uppercase geo_countries while the older
-- format check required lowercase values, making new church inserts impossible.

alter table public.churches drop constraint if exists churches_country_code_format_check;
alter table public.locations drop constraint if exists locations_country_code_format_check;

create or replace function public.normalize_church_catalog_row()
returns trigger language plpgsql set search_path = public, extensions, pg_temp as $$
begin
  new.name := trim(new.name); new.normalized_name := public.normalize_catalog_text(new.name);
  new.address_line := nullif(trim(coalesce(new.address_line, new.address)), ''); new.address := new.address_line;
  new.normalized_address := public.normalize_catalog_text(new.address_line);
  new.country_code := upper(trim(coalesce(nullif(new.country_code, ''), nullif(new.country, ''), 'IT'))); new.country := new.country_code;
  new.phone := nullif(regexp_replace(trim(coalesce(new.phone, '')), '\s+', ' ', 'g'), ''); new.website := nullif(trim(new.website), '');
  new.source := lower(trim(new.source)); new.external_id := nullif(trim(new.external_id), ''); new.verified := new.verification_status = 'VERIFIED';
  return new;
end $$;

create or replace function public.normalize_location_catalog_row()
returns trigger language plpgsql set search_path = public, extensions, pg_temp as $$
begin
  new.name := trim(new.name); new.normalized_name := public.normalize_catalog_text(new.name);
  new.address_line := nullif(trim(coalesce(new.address_line, new.address)), ''); new.address := new.address_line;
  new.normalized_address := public.normalize_catalog_text(new.address_line);
  new.venue_type := lower(trim(coalesce(nullif(new.venue_type, ''), nullif(new.location_type, ''), 'other'))); new.location_type := new.venue_type;
  new.country_code := upper(trim(coalesce(nullif(new.country_code, ''), nullif(new.country, ''), 'IT'))); new.country := new.country_code;
  new.phone := nullif(regexp_replace(trim(coalesce(new.phone, '')), '\s+', ' ', 'g'), ''); new.website := nullif(trim(new.website), '');
  new.source := lower(trim(new.source)); new.external_id := nullif(trim(new.external_id), ''); new.currency := nullif(upper(trim(new.currency)), '');
  new.verified := new.verification_status = 'VERIFIED'; return new;
end $$;

update public.churches set country_code = upper(country_code) where country_code <> upper(country_code);
update public.locations set country_code = upper(country_code) where country_code <> upper(country_code);

alter table public.churches add constraint churches_country_code_format_check check (country_code ~ '^[A-Z]{2}$');
alter table public.locations add constraint locations_country_code_format_check check (country_code ~ '^[A-Z]{2}$');

alter table public.churches validate constraint churches_country_code_geo_countries_fkey;
