-- Read-only prerequisites for the wedding application. No DDL, DML or credentials.
with required_tables(name) as (values
  ('event_private_catalog_records'), ('event_location_supplier_links'),
  ('event_documents'), ('gift_list_items'), ('tables'), ('table_assignments')
), required_columns(table_name, column_name) as (values
  ('timeline_items','client_key'), ('timeline_items','private_supplier_id'),
  ('appointments','client_key'), ('appointments','private_supplier_id'),
  ('saved_suppliers','catalog_snapshot'), ('saved_suppliers','private_overrides')
), required_functions(name) as (values
  ('save_event_guest_snapshot'), ('save_event_table_plan'), ('delete_event_table')
), missing as (
  select 'table' as kind, 'public.' || name as object from required_tables
  where to_regclass('public.' || name) is null
  union all
  select 'column', 'public.' || table_name || '.' || column_name from required_columns r
  where not exists (select 1 from information_schema.columns c
    where c.table_schema='public' and c.table_name=r.table_name and c.column_name=r.column_name)
  union all
  select 'function', 'public.' || name from required_functions r
  where not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname=r.name)
)
select kind, object from missing order by kind, object;
