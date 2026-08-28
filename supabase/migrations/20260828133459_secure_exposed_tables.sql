-- Security audit 2026-08-28: protect every table exposed through the Data API.
-- Catalog data remains publicly readable. Mutations are reserved for the
-- service role, which bypasses RLS and is used only by authenticated server routes.

alter table public.vendors enable row level security;
alter table public.places enable row level security;
alter table public.vendor_places enable row level security;
alter table public.sync_jobs enable row level security;
alter table public.timeline_items enable row level security;
alter table public.i18n_locales enable row level security;
alter table public.geo_countries enable row level security;
alter table public.event_type_translations enable row level security;
alter table public.event_type_variants enable row level security;
alter table public.category_translations enable row level security;
alter table public.subcategory_translations enable row level security;
alter table public.event_timeline_translations enable row level security;

create policy "Public can read vendors"
on public.vendors for select to anon, authenticated using (true);

create policy "Public can read places"
on public.places for select to anon, authenticated using (true);

create policy "Public can read vendor places"
on public.vendor_places for select to anon, authenticated using (true);

create policy "Public can read locales"
on public.i18n_locales for select to anon, authenticated using (true);

create policy "Public can read countries"
on public.geo_countries for select to anon, authenticated using (true);

create policy "Public can read event type translations"
on public.event_type_translations for select to anon, authenticated using (true);

create policy "Public can read event type variants"
on public.event_type_variants for select to anon, authenticated using (true);

create policy "Public can read category translations"
on public.category_translations for select to anon, authenticated using (true);

create policy "Public can read subcategory translations"
on public.subcategory_translations for select to anon, authenticated using (true);

create policy "Public can read event timeline translations"
on public.event_timeline_translations for select to anon, authenticated using (true);

-- sync_jobs intentionally has no client policy: only the service role may use it.

create policy "Owners can manage timeline items"
on public.timeline_items for all to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = timeline_items.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = timeline_items.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Owners can manage family groups"
on public.family_groups for all to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = family_groups.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = family_groups.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Owners can manage non invited recipients"
on public.non_invited_recipients for all to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = non_invited_recipients.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = non_invited_recipients.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Owners can manage tables"
on public.tables for all to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = tables.event_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.events
    where events.id = tables.event_id
      and events.owner_id = (select auth.uid())
  )
);

create policy "Owners can manage table assignments"
on public.table_assignments for all to authenticated
using (
  exists (
    select 1
    from public.tables
    join public.events on events.id = tables.event_id
    where tables.id = table_assignments.table_id
      and events.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.tables
    join public.events on events.id = tables.event_id
    where tables.id = table_assignments.table_id
      and events.owner_id = (select auth.uid())
  )
);

-- PostgreSQL 15+: make views honor the caller's privileges and RLS policies.
alter view public.high_rated_locations set (security_invoker = true);
alter view public.location_stats_by_region set (security_invoker = true);
alter view public.vendors_with_places set (security_invoker = true);
alter view public.top_vendors_by_region set (security_invoker = true);
alter view public.sync_stats set (security_invoker = true);
