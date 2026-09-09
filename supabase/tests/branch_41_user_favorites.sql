create extension if not exists pgtap with schema extensions;

begin;
set local role postgres;
set local search_path = extensions, public, pg_catalog;
select plan(7);

select has_table('public', 'user_favorites', 'favorites persistence table exists');
select has_column('public', 'user_favorites', 'user_id', 'favorites are user-scoped');
select has_column('public', 'user_favorites', 'item_type', 'favorite catalog type exists');
select has_column('public', 'user_favorites', 'item_id', 'favorite catalog id exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.user_favorites'::regclass),
  'RLS is enabled'
);
select is(
  (select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'user_favorites'),
  4,
  'CRUD has four owner-only policies'
);
select is(
  (select count(*)::int from information_schema.columns
   where table_schema = 'public' and table_name = 'user_favorites' and column_name = 'event_id'),
  0,
  'favorites remain user-global rather than event-scoped'
);

select * from finish();
rollback;
