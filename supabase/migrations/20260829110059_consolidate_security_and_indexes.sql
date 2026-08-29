-- Branch 25: non-destructive Supabase consolidation.
--
-- Rollback strategy:
--   * drop the indexes and foreign keys added below;
--   * restore the policies from the preceding migration/schema snapshot;
--   * reset function search_path / grants to their previous values.
-- No table, column, or user row is dropped or rewritten by this migration.

-- ---------------------------------------------------------------------------
-- Safe ownership foreign keys (preflight showed no incompatible rows).
-- events.owner_id is intentionally excluded: production contains orphan owners
-- that must be investigated without deleting or silently reassigning events.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists preferred_locale text default 'it',
  add column if not exists country_code text,
  add column if not exists last_event_type text,
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- One provisioning strategy only: Auth trigger. The backfill inserts missing
-- profile extensions without changing or deleting existing profiles.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();

insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_id_auth_users_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users(id) on delete cascade not valid;
    alter table public.profiles validate constraint profiles_id_auth_users_fkey;
  end if;
end
$$;

do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('analytics_events', 'user_id', 'analytics_events_user_id_auth_users_fkey'),
      ('suppliers', 'user_id', 'suppliers_user_id_auth_users_fkey'),
      ('locations', 'user_id', 'locations_user_id_auth_users_fkey'),
      ('churches', 'user_id', 'churches_user_id_auth_users_fkey')
    ) as v(table_name, column_name, constraint_name)
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = item.constraint_name
        and conrelid = format('public.%I', item.table_name)::regclass
    ) then
      execute format(
        'alter table public.%I add constraint %I foreign key (%I) references auth.users(id) on delete set null not valid',
        item.table_name, item.constraint_name, item.column_name
      );
      execute format(
        'alter table public.%I validate constraint %I',
        item.table_name, item.constraint_name
      );
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Indexes for current application lookups and existing foreign keys.
-- Deliberately no speculative geospatial or full-text indexes in Branch 25.
-- ---------------------------------------------------------------------------

create index if not exists idx_events_owner_id
  on public.events (owner_id);
create index if not exists idx_budget_items_event_id
  on public.budget_items (event_id);
create index if not exists idx_budget_items_tradition_id
  on public.budget_items (tradition_id);
create index if not exists idx_budget_items_vendor_id
  on public.budget_items (vendor_id);
create index if not exists idx_checklist_modules_tradition_id
  on public.checklist_modules (tradition_id);
create index if not exists idx_event_type_translations_locale
  on public.event_type_translations (locale);
create index if not exists idx_event_type_variants_country_code
  on public.event_type_variants (country_code);
create index if not exists idx_geo_countries_default_locale
  on public.geo_countries (default_locale);
create index if not exists idx_musica_cerimonia_submitted_by
  on public.musica_cerimonia (submitted_by);
create index if not exists idx_musica_ricevimento_submitted_by
  on public.musica_ricevimento (submitted_by);
create index if not exists idx_user_event_timeline_timeline_id
  on public.user_event_timeline (timeline_id);
create index if not exists idx_wedding_cards_church_id
  on public.wedding_cards (church_id);
create index if not exists idx_wedding_cards_location_id
  on public.wedding_cards (location_id);
create index if not exists idx_wedding_planners_submitted_by
  on public.wedding_planners (submitted_by);

-- ---------------------------------------------------------------------------
-- Private wedding data: explicit authenticated role and immutable ownership.
-- UPDATE policies include WITH CHECK to prevent moving a row to another owner.
-- ---------------------------------------------------------------------------

drop policy if exists events_select_own on public.events;
drop policy if exists events_insert_self on public.events;
drop policy if exists events_update_own on public.events;
drop policy if exists events_delete_own on public.events;
create policy events_select_own on public.events for select to authenticated
  using (owner_id = (select auth.uid()));
create policy events_insert_self on public.events for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy events_update_own on public.events for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy events_delete_own on public.events for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists categories_select_own on public.categories;
drop policy if exists categories_insert_self on public.categories;
drop policy if exists categories_update_own on public.categories;
drop policy if exists categories_delete_own on public.categories;
create policy categories_select_own on public.categories for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy categories_insert_self on public.categories for insert to authenticated
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy categories_update_own on public.categories for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));
create policy categories_delete_own on public.categories for delete to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));

drop policy if exists subcategories_select_own on public.subcategories;
drop policy if exists subcategories_insert_self on public.subcategories;
drop policy if exists subcategories_update_own on public.subcategories;
drop policy if exists subcategories_delete_own on public.subcategories;
create policy subcategories_select_own on public.subcategories for select to authenticated
  using (exists (select 1 from public.categories c join public.events e on e.id = c.event_id where c.id = category_id and e.owner_id = (select auth.uid())));
create policy subcategories_insert_self on public.subcategories for insert to authenticated
  with check (exists (select 1 from public.categories c join public.events e on e.id = c.event_id where c.id = category_id and e.owner_id = (select auth.uid())));
create policy subcategories_update_own on public.subcategories for update to authenticated
  using (exists (select 1 from public.categories c join public.events e on e.id = c.event_id where c.id = category_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.categories c join public.events e on e.id = c.event_id where c.id = category_id and e.owner_id = (select auth.uid())));
create policy subcategories_delete_own on public.subcategories for delete to authenticated
  using (exists (select 1 from public.categories c join public.events e on e.id = c.event_id where c.id = category_id and e.owner_id = (select auth.uid())));

do $$
declare
  item record;
begin
  for item in select * from (values
    ('expenses'), ('incomes'), ('wedding_cards')
  ) as v(table_name)
  loop
    execute format('drop policy if exists %I on public.%I', item.table_name || '_select_own', item.table_name);
    execute format('drop policy if exists %I on public.%I', item.table_name || '_insert_self', item.table_name);
    execute format('drop policy if exists %I on public.%I', item.table_name || '_update_own', item.table_name);
    execute format('drop policy if exists %I on public.%I', item.table_name || '_delete_own', item.table_name);
    execute format('create policy %I on public.%I for select to authenticated using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))', item.table_name || '_select_own', item.table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))', item.table_name || '_insert_self', item.table_name);
    execute format('create policy %I on public.%I for update to authenticated using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid()))) with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))', item.table_name || '_update_own', item.table_name);
    execute format('create policy %I on public.%I for delete to authenticated using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))', item.table_name || '_delete_own', item.table_name);
  end loop;
end
$$;

drop policy if exists budget_ideas_read_all on public.budget_ideas;
create policy budget_ideas_owner_access on public.budget_ideas for all to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));

drop policy if exists "public read budget_items" on public.budget_items;
create policy budget_items_owner_access on public.budget_items for all to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.events e where e.id = event_id and e.owner_id = (select auth.uid())));

-- Remove redundant SELECT policies already covered by an ALL policy.
drop policy if exists "Users can view their own guests" on public.guests;
drop policy if exists "Users can view their own payment reminders" on public.payment_reminders;
drop policy if exists "Users can view their own timeline" on public.user_event_timeline;

-- ---------------------------------------------------------------------------
-- Public catalog submissions: authenticated self-attribution only.
-- Service-role ingestion remains available and bypasses RLS.
-- ---------------------------------------------------------------------------

do $$
declare
  item record;
begin
  for item in select * from (values
    ('suppliers'), ('locations'), ('churches')
  ) as v(table_name)
  loop
    execute format('drop policy if exists %I on public.%I', item.table_name || '_insert_auth', item.table_name);
    execute format('drop policy if exists %I on public.%I', item.table_name || '_update_own', item.table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and coalesce(verified, false) = false)', item.table_name || '_insert_auth', item.table_name);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid()) and coalesce(verified, false) = false) with check (user_id = (select auth.uid()) and coalesce(verified, false) = false)', item.table_name || '_update_own', item.table_name);
  end loop;
end
$$;

-- Atelier rows have no ownership column, so client-side global mutations cannot
-- be authorized safely. Keep the existing public read policy; writes are server-only.
drop policy if exists "Allow authenticated users to insert atelier" on public.atelier;
drop policy if exists "Allow authenticated users to update atelier" on public.atelier;

drop policy if exists "Users can submit wedding planners" on public.wedding_planners;
create policy "Authenticated users can submit wedding planners"
  on public.wedding_planners for insert to authenticated
  with check (submitted_by = (select auth.uid()) and coalesce(status, 'pending') = 'pending' and coalesce(verified, false) = false);

drop policy if exists "Users can submit ceremony musicians" on public.musica_cerimonia;
create policy "Authenticated users can submit ceremony musicians"
  on public.musica_cerimonia for insert to authenticated
  with check (submitted_by = (select auth.uid()) and coalesce(status, 'pending') = 'pending' and coalesce(verified, false) = false);

drop policy if exists "Users can submit reception musicians" on public.musica_ricevimento;
create policy "Authenticated users can submit reception musicians"
  on public.musica_ricevimento for insert to authenticated
  with check (submitted_by = (select auth.uid()) and coalesce(status, 'pending') = 'pending' and coalesce(verified, false) = false);

-- ---------------------------------------------------------------------------
-- Function hardening.
-- Pin every public function to trusted schemas. Restrict write/maintenance RPCs
-- to the service role; trigger functions remain trigger-only.
-- ---------------------------------------------------------------------------

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
  loop
    execute format('alter function %s set search_path = public, pg_temp', fn.signature);
  end loop;
end
$$;

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname = any (array[
        'ensure_subcategory', 'find_or_create_place', 'get_or_create_category',
        'increment_analytics_counter', 'populate_event_categories',
        'populate_user_timeline', 'regenerate_event_data',
        'regenerate_event_timeline', 'seed_categories', 'seed_full_event',
        'seed_subcategories', 'set_owner_id', 'upsert_vendor'
      ])
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn.signature);
    execute format('grant execute on function %s to service_role', fn.signature);
  end loop;
end
$$;
