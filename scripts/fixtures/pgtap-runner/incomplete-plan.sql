create extension if not exists pgtap with schema extensions;
begin;
set local search_path = extensions, public, pg_catalog;
select plan(2);
select ok(true, 'only one of two assertions');
select * from finish();
rollback;
