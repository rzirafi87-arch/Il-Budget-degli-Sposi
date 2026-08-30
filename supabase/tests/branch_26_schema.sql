-- Branch 26 structural assertions. Run after baseline, Branch 25 and Branch 26.

do $$
declare
  actual integer;
begin
  select count(*) into actual
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r';
  if actual <> 45 then
    raise exception 'Schema mismatch: expected 45 public tables, found %', actual;
  end if;

  if not exists (
    select 1 from pg_class
    where oid = 'public.saved_churches'::regclass and relrowsecurity
  ) then
    raise exception 'saved_churches must have RLS enabled';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_churches'::regclass
      and conname = 'saved_churches_event_church_key'
  ) then
    raise exception 'Missing unique event/church constraint';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_churches'::regclass
      and conname = 'saved_churches_event_id_fkey'
      and confdeltype = 'c'
  ) then
    raise exception 'saved_churches.event_id must cascade on event deletion';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.saved_churches'::regclass
      and conname = 'saved_churches_church_id_fkey'
      and confdeltype = 'r'
  ) then
    raise exception 'saved_churches.church_id must restrict catalog deletion';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'churches_source_external_id_uidx'
  ) then
    raise exception 'Missing idempotent source/external_id index';
  end if;

  if has_table_privilege('anon', 'public.churches', 'INSERT')
     or has_table_privilege('authenticated', 'public.churches', 'INSERT')
     or has_table_privilege('authenticated', 'public.churches', 'UPDATE')
     or has_table_privilege('authenticated', 'public.churches', 'DELETE') then
    raise exception 'Global church catalog exposes client write privileges';
  end if;

  if not has_table_privilege('anon', 'public.churches', 'SELECT')
     or not has_table_privilege('authenticated', 'public.churches', 'SELECT') then
    raise exception 'Global church catalog must remain publicly readable';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'churches'
      and cmd <> 'SELECT'
  ) then
    raise exception 'Global church catalog has a client write policy';
  end if;

  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.events'::regclass
      and conname = 'events_owner_id_auth_users_fkey'
  ) then
    raise exception 'Branch 26 altered the intentional legacy event quarantine';
  end if;
end
$$;

