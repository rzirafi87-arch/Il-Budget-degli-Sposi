do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'suppliers'
      and policyname = 'suppliers_select_all'
  ) then
    raise exception 'Legacy duplicate suppliers policy still exists';
  end if;

  if not exists (
    select 1 from pg_indexes where schemaname = 'public'
      and indexname = 'idx_events_owner_inserted_id'
      and indexdef like '%(owner_id, inserted_at, id)%'
  ) then
    raise exception 'Missing owner event resolution index';
  end if;

  if not exists (
    select 1 from pg_indexes where schemaname = 'public'
      and indexname = 'idx_timeline_event_due_date'
      and indexdef like '%(event_id, due_date)%'
  ) then
    raise exception 'Missing event timeline due-date index';
  end if;

  if exists (
    select indexdef from pg_indexes
    where schemaname = 'public' and tablename = 'timeline_items'
    group by indexdef having count(*) > 1
  ) then
    raise exception 'Duplicate timeline index definition remains';
  end if;
end $$;

