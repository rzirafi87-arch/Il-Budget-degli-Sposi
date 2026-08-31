\set ON_ERROR_STOP on
do $$
begin
  if to_regclass('public.catalog_review_queue') is null then raise exception 'Missing catalog_review_queue'; end if;
  if not (select relrowsecurity from pg_class where oid='public.catalog_review_queue'::regclass) then raise exception 'catalog_review_queue RLS must be enabled'; end if;
  if exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name='catalog_review_queue' and grantee in ('anon','authenticated')) then raise exception 'Review queue exposed to clients'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='catalog_provenance' and column_name='freshness_status') then raise exception 'Missing provenance freshness'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='catalog_review_queue_pending_uidx') then raise exception 'Missing review idempotency index'; end if;
end $$;
