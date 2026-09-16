-- Branch 51 / Milestone 4: deterministic ACL and Data API least privilege.
-- Schema/ACL only: this migration performs no application-table DML.

begin;

-- The Data API roles need name resolution, never object creation.
revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
revoke all on schema private from public, anon, authenticated;

do $$
declare
  relation_name text;
  public_catalogs constant text[] := array[
    'atelier', 'category_translations', 'checklist_modules', 'churches',
    'event_timeline_translations', 'event_timelines', 'event_type_categories',
    'event_type_subcategories', 'event_type_translations', 'event_type_variants',
    'event_types', 'geo_countries', 'i18n_locales', 'locations',
    'musica_cerimonia', 'musica_ricevimento', 'places',
    'subcategory_translations', 'subscription_packages', 'supplier_locations',
    'suppliers', 'traditions',
    'vendor_places', 'vendors', 'wedding_planners'
  ];
  event_scoped constant text[] := array[
    'appointments', 'budget_ideas', 'budget_items', 'categories', 'events',
    'expenses', 'family_groups', 'guests', 'incomes', 'non_invited_recipients',
    'payment_reminders', 'saved_churches', 'saved_locations', 'saved_suppliers',
    'subcategories', 'table_assignments', 'tables', 'timeline_items',
    'user_event_timeline', 'wedding_cards'
  ];
  user_global constant text[] := array['user_favorites'];
  server_only constant text[] := array[
    'analytics_events', 'catalog_provenance', 'rate_limit_buckets', 'sync_jobs'
  ];
begin
  -- Catalogs are intentionally read-only through the Data API. Submission and
  -- ingestion writes use the reviewed server route / service-role boundary.
  foreach relation_name in array public_catalogs loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', relation_name);
    execute format('grant select on table public.%I to anon, authenticated', relation_name);
  end loop;

  -- RLS remains the row-level authority for authenticated planning data.
  foreach relation_name in array event_scoped || user_global loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', relation_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', relation_name);
  end loop;

  -- Profiles cannot be deleted through the Data API.
  revoke all privileges on table public.profiles from public, anon, authenticated;
  grant select, insert, update on table public.profiles to authenticated;

  -- Partner membership lifecycle is RLS-governed; invitations can only be
  -- created/read by an owner and are mutated atomically by server-only RPCs.
  revoke all privileges on table public.event_members from public, anon, authenticated;
  grant select, insert, update, delete on table public.event_members to authenticated;
  revoke all privileges on table public.event_invitations from public, anon, authenticated;
  grant select, insert on table public.event_invitations to authenticated;

  -- Self-service surfaces with deliberately narrower verbs.
  revoke all privileges on table public.catalog_review_queue from public, anon, authenticated;
  grant select, insert on table public.catalog_review_queue to authenticated;
  revoke all privileges on table public.account_deletion_requests from public, anon, authenticated;
  grant select on table public.account_deletion_requests to authenticated;
  revoke all privileges on table public.subscription_transactions from public, anon, authenticated;
  grant select on table public.subscription_transactions to authenticated;

  -- These relations are reached only from authenticated server/cron code.
  foreach relation_name in array server_only loop
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', relation_name);
  end loop;
end
$$;

-- Public aggregate/detail views inherit RLS from their catalog bases.
do $$
declare
  view_name text;
begin
  foreach view_name in array array[
    'high_rated_locations', 'location_stats_by_region',
    'top_vendors_by_region', 'vendors_with_places'
  ] loop
    execute format('alter view public.%I set (security_invoker = true)', view_name);
    execute format('revoke all privileges on table public.%I from public, anon, authenticated', view_name);
    execute format('grant select on table public.%I to anon, authenticated', view_name);
  end loop;

  -- Operational aggregates must not expose sync metadata through the Data API.
  alter view public.sync_stats set (security_invoker = true);
  revoke all privileges on table public.sync_stats from public, anon, authenticated;
end
$$;

-- No client receives an implicit sequence capability. budget_items is the only
-- authenticated Data API write surface backed by a sequence.
revoke all privileges on all sequences in schema public from public, anon, authenticated;
grant usage, select on sequence public.budget_items_id_seq to authenticated;
grant all privileges on all sequences in schema public to service_role;

-- Start from deny-by-default for RPC exposure, then restore the reviewed list.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.can_access_event(uuid) to authenticated;
grant execute on function public.is_event_owner(uuid) to authenticated;
grant execute on function public.is_catalog_admin() to authenticated;

-- Read-only catalog RPC. All mutating and maintenance RPCs remain service-only.
grant execute on function public.get_visible_suppliers(text,text,text,boolean) to anon, authenticated;

-- Ensure every SECURITY DEFINER resolves names only through fixed trusted
-- schemas. The private auth trigger intentionally retains its empty search_path.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where p.prosecdef
       and n.nspname = 'public'
  loop
    execute format(
      'alter function %s set search_path = pg_catalog, public, auth, extensions, pg_temp',
      fn.signature
    );
  end loop;
end
$$;

grant all privileges on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Future objects are private until a migration grants a reviewed capability.
alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

commit;
