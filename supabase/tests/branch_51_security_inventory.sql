begin;

-- Milestone 1 is audit-only: verify that every event-scoped table currently used
-- by server routes has RLS enabled. Grant reductions are intentionally deferred.
do $$
declare
  table_name text;
  rls_enabled boolean;
begin
  foreach table_name in array array[
    'events',
    'event_members',
    'event_invitations',
    'appointments',
    'expenses',
    'budget_items',
    'saved_churches',
    'saved_locations',
    'saved_suppliers',
    'user_favorites'
  ] loop
    select c.relrowsecurity
      into rls_enabled
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = table_name
       and c.relkind = 'r';

    if rls_enabled is distinct from true then
      raise exception 'Branch 51 security inventory: RLS is not enabled on public.%', table_name;
    end if;
  end loop;
end
$$;

-- Record the broad grants that Milestone 4 must reassess without changing them.
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
  from information_schema.role_table_grants
 where table_schema = 'public'
   and grantee in ('anon', 'authenticated')
 group by table_name, grantee
 order by table_name, grantee;

rollback;
