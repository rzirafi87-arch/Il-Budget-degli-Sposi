create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(2);

select has_column('public', 'budget_items', 'spend_type', 'applied budget contributor exists');
select col_default_is(
  'public', 'budget_items', 'spend_type', '''common''::text',
  'legacy applied rows receive the common contributor'
);

select * from finish();
rollback;

