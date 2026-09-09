-- Branch 42: align church and location country codes with geo_countries ISO keys.
-- The existing churches FK points at uppercase geo_countries while the older
-- format check required lowercase values, making new church inserts impossible.

alter table public.churches drop constraint if exists churches_country_code_format_check;
alter table public.locations drop constraint if exists locations_country_code_format_check;

update public.churches set country_code = upper(country_code) where country_code <> upper(country_code);
update public.locations set country_code = upper(country_code) where country_code <> upper(country_code);

alter table public.churches add constraint churches_country_code_format_check check (country_code ~ '^[A-Z]{2}$');
alter table public.locations add constraint locations_country_code_format_check check (country_code ~ '^[A-Z]{2}$');

alter table public.churches validate constraint churches_country_code_geo_countries_fkey;
