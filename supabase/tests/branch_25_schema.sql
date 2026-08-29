-- Branch 25 post-migration structural assertions.
-- Run only against an isolated database after applying the canonical baseline
-- and 20260829110059_consolidate_security_and_indexes.sql.

do $$
declare
  actual integer;
begin
  select count(*) into actual
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r';
  if actual <> 44 then
    raise exception 'Schema mismatch: expected 44 public tables, found %', actual;
  end if;

  select count(*) into actual
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'v';
  if actual <> 5 then
    raise exception 'Schema mismatch: expected 5 public views, found %', actual;
  end if;

  select count(*) into actual
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public';
  if actual <> 21 then
    raise exception 'Schema mismatch: expected 21 public functions, found %', actual;
  end if;

  select count(*) into actual
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if actual <> 0 then
    raise exception 'Security mismatch: % public tables have RLS disabled', actual;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.events'::regclass
      and conname = 'events_owner_id_auth_users_fkey'
  ) then
    raise exception 'Legacy quarantine failure: events owner Auth FK must remain deferred';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_id_auth_users_fkey'
      and convalidated
  ) then
    raise exception 'Missing validated profiles to Auth foreign key';
  end if;

  select count(*) into actual
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and coalesce(array_to_string(p.proconfig, ','), '') !~ 'search_path=public, pg_temp';
  if actual <> 0 then
    raise exception 'Function hardening mismatch: % public functions lack pinned search_path', actual;
  end if;

  if has_function_privilege('anon', 'public.regenerate_event_data(uuid)', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.regenerate_event_data(uuid)', 'EXECUTE')
     or not has_function_privilege('service_role', 'public.regenerate_event_data(uuid)', 'EXECUTE') then
    raise exception 'RPC privilege mismatch for regenerate_event_data(uuid)';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_events_owner_id'
  ) then
    raise exception 'Missing current-query index idx_events_owner_id';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and tgname = 'on_auth_user_created_create_profile'
      and not tgisinternal
  ) then
    raise exception 'Missing canonical Auth profile provisioning trigger';
  end if;
end
$$;

