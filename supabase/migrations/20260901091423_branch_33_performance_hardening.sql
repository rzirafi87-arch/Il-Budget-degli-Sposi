-- Branch 33: query-backed performance hardening without functional changes.
-- The two suppliers SELECT policies are both unconditional; keep the explicit
-- catalog policy and remove the legacy duplicate evaluated for every read.
drop policy if exists suppliers_select_all on public.suppliers;

-- Advisor and pg_indexes confirm these definitions are identical. Keep the
-- older canonical name used by the application migrations.
drop index if exists public.idx_timeline_items_event_id;

-- Every private API resolves the oldest event for an owner with this ordering.
create index if not exists idx_events_owner_inserted_id
  on public.events(owner_id, inserted_at, id);

-- Upcoming timeline queries always scope by event before ordering by due date.
create index if not exists idx_timeline_event_due_date
  on public.timeline_items(event_id, due_date);
