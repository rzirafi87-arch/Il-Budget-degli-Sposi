create extension if not exists pgtap with schema extensions;
begin;
set local search_path = extensions, public, pg_catalog;
select plan(1);
select definitely_missing_pgtap_function();
rollback;
