\set ON_ERROR_STOP on

begin;

-- Branch 29 adds configuration columns only. Existing global/private RLS
-- boundaries must remain enabled.
do $$
declare
  missing_rls integer;
begin
  select count(*) into missing_rls
  from (values
    ('event_types'),
    ('event_type_categories'),
    ('event_type_subcategories'),
    ('event_timelines'),
    ('events'),
    ('categories'),
    ('expenses'),
    ('user_event_timeline'),
    ('saved_churches'),
    ('saved_locations'),
    ('saved_suppliers')
  ) as required(table_name)
  where not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = required.table_name
      and c.relrowsecurity
  );

  if missing_rls <> 0 then
    raise exception 'Branch 29 RLS regression: % required tables do not have RLS enabled', missing_rls;
  end if;
end $$;

-- Owner-private relation policies must still exist after the migration.
do $$
declare
  private_policy_tables integer;
begin
  select count(distinct tablename) into private_policy_tables
  from pg_policies
  where schemaname = 'public'
    and tablename in ('events', 'saved_churches', 'saved_locations', 'saved_suppliers', 'user_event_timeline');

  if private_policy_tables <> 5 then
    raise exception 'Branch 29 RLS regression: owner-private tables lost policies';
  end if;
end $$;

rollback;
