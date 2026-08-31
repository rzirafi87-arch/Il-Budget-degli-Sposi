\set ON_ERROR_STOP on
do $$
begin
  if to_regclass('public.catalog_provenance') is null then raise exception 'Missing catalog_provenance'; end if;
  if not (select relrowsecurity from pg_class where oid='public.catalog_provenance'::regclass) then raise exception 'catalog_provenance RLS must be enabled'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.catalog_provenance'::regclass and conname='catalog_provenance_source_identity_key') then raise exception 'Missing provenance idempotency constraint'; end if;
  if exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='catalog_provenance' and grantee in ('anon','authenticated')) then raise exception 'Technical provenance exposed to clients'; end if;
end $$;

do $$
declare missing_rls integer;
begin
  select count(*) into missing_rls from (values ('churches'),('saved_churches'),('locations'),('saved_locations'),('suppliers'),('saved_suppliers')) required(name)
  where not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=required.name and c.relrowsecurity);
  if missing_rls <> 0 then raise exception 'Catalog/private RLS regression'; end if;
end $$;
