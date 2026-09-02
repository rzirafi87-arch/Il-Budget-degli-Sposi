-- Branch 36 has no migration. This audit proves that authoritative event
-- selection can rely on the existing event-scoped schema and RLS boundary.
do $$
declare
  scoped_table text;
  event_scoped_tables constant text[] := array[
    'budget_items', 'budget_ideas', 'expenses', 'incomes', 'guests',
    'family_groups', 'non_invited_recipients', 'tables', 'timeline_items',
    'appointments', 'wedding_cards', 'saved_churches', 'saved_locations',
    'saved_suppliers'
  ];
begin
  foreach scoped_table in array event_scoped_tables loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and information_schema.columns.table_name = scoped_table and column_name = 'event_id'
    ) then
      raise exception 'Branch 36 event isolation requires %.event_id', scoped_table;
    end if;

    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = scoped_table and c.relrowsecurity
    ) then
      raise exception 'Branch 36 event isolation requires RLS on %', scoped_table;
    end if;
  end loop;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'events'
      and indexdef like '%(owner_id, inserted_at, id)%'
  ) then
    raise exception 'Authoritative event listing requires the owner ordering index';
  end if;
end $$;
