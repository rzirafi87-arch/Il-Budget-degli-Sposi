-- Branch 27 structural and cross-module assertions.
do $$
declare actual integer;
begin
  select count(*) into actual from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';
  if actual <> 46 then raise exception 'Schema mismatch: expected 46 public tables, found %', actual; end if;
  if not (select relrowsecurity from pg_class where oid='public.saved_locations'::regclass) then raise exception 'saved_locations RLS disabled'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.saved_locations'::regclass and conname='saved_locations_event_location_role_key') then raise exception 'Missing event/location/role unique'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.saved_locations'::regclass and conname='saved_locations_event_id_fkey' and confdeltype='c') then raise exception 'Event FK must cascade'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.saved_locations'::regclass and conname='saved_locations_location_id_fkey' and confdeltype='r') then raise exception 'Location FK must restrict'; end if;
  if has_table_privilege('anon','public.locations','INSERT') or has_table_privilege('authenticated','public.locations','INSERT') or has_table_privilege('authenticated','public.locations','UPDATE') or has_table_privilege('authenticated','public.locations','DELETE') then raise exception 'Global locations expose client writes'; end if;
  if not has_table_privilege('anon','public.locations','SELECT') or not has_table_privilege('authenticated','public.locations','SELECT') then raise exception 'Global locations must be readable'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='wedding_cards' and column_name='church_id')
     or not exists(select 1 from information_schema.columns where table_schema='public' and table_name='wedding_cards' and column_name='location_id') then raise exception 'Church/location coexistence regression'; end if;
end $$;
