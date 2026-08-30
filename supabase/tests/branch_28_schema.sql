do $$ begin
  if (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r') <> 48 then raise exception 'Expected 48 public tables'; end if;
  if not (select relrowsecurity from pg_class where oid='public.saved_suppliers'::regclass) then raise exception 'saved_suppliers RLS disabled'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.saved_suppliers'::regclass and conname='saved_suppliers_event_supplier_key') then raise exception 'Missing event/supplier unique'; end if;
  if has_table_privilege('anon','public.suppliers','INSERT') or has_table_privilege('authenticated','public.suppliers','UPDATE') then raise exception 'Global supplier writes exposed'; end if;
  if not has_table_privilege('anon','public.suppliers','SELECT') then raise exception 'Global suppliers unreadable'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='budget_items' and column_name='saved_supplier_id') then raise exception 'Budget link missing'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='timeline_items' and column_name='saved_supplier_id') then raise exception 'Timeline link missing'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='expenses' and column_name='saved_supplier_id') then raise exception 'Payment path missing'; end if;
end $$;
