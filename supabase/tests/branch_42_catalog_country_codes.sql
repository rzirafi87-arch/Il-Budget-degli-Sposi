begin;
do $$
declare fk_valid boolean;
begin
  if exists (select 1 from public.churches where country_code <> upper(country_code)) then raise exception 'church country codes are not canonical'; end if;
  if exists (select 1 from public.locations where country_code <> upper(country_code)) then raise exception 'location country codes are not canonical'; end if;
  select convalidated into fk_valid from pg_constraint where conrelid='public.churches'::regclass and conname='churches_country_code_geo_countries_fkey';
  if fk_valid is distinct from true then raise exception 'church geo country FK is not validated'; end if;
  if has_table_privilege('anon','public.catalog_provenance','insert') or has_table_privilege('authenticated','public.catalog_review_queue','select') then raise exception 'catalog backend-only tables exposed'; end if;
end $$;
rollback;
