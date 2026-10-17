-- Branch 53 / Milestone 2: persistent event-scoped gift planning.
-- This stores informational wishes only. It intentionally contains no payment,
-- IBAN, checkout, contribution, purchaser, or external purchase tracking data.

create table if not exists public.gift_list_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  type text not null check (length(btrim(type)) between 1 and 80),
  name text not null check (length(btrim(name)) between 1 and 160),
  description text check (description is null or length(description) <= 2000),
  url text check (
    url is null
    or (length(url) <= 2048 and url ~* '^https?://[^[:space:]]+$')
  ),
  target_amount numeric(12,2) check (target_amount is null or target_amount >= 0),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  status text not null default 'wanted' check (status in ('wanted','received','archived')),
  note text check (note is null or length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_list_items_event_created_idx
  on public.gift_list_items(event_id, created_at desc, id);
create index if not exists gift_list_items_event_status_idx
  on public.gift_list_items(event_id, status);

drop trigger if exists update_gift_list_items_updated_at on public.gift_list_items;
create trigger update_gift_list_items_updated_at
before update on public.gift_list_items
for each row execute function public.update_updated_at_column();

alter table public.gift_list_items enable row level security;

drop policy if exists gift_list_items_select_event on public.gift_list_items;
create policy gift_list_items_select_event
  on public.gift_list_items for select to authenticated
  using (public.can_access_event(event_id));

drop policy if exists gift_list_items_insert_event on public.gift_list_items;
create policy gift_list_items_insert_event
  on public.gift_list_items for insert to authenticated
  with check (
    public.can_access_event(event_id)
    and created_by = (select auth.uid())
  );

drop policy if exists gift_list_items_update_event on public.gift_list_items;
create policy gift_list_items_update_event
  on public.gift_list_items for update to authenticated
  using (public.can_access_event(event_id))
  with check (public.can_access_event(event_id));

drop policy if exists gift_list_items_delete_event on public.gift_list_items;
create policy gift_list_items_delete_event
  on public.gift_list_items for delete to authenticated
  using (public.can_access_event(event_id));

revoke all on table public.gift_list_items from public, anon;
grant select, insert, update, delete on table public.gift_list_items to authenticated;
grant all on table public.gift_list_items to service_role;

comment on table public.gift_list_items is
  'Event-scoped informational gift wishes. No money movement or purchase tracking.';
comment on column public.gift_list_items.target_amount is
  'Optional informational estimate only; never a collected or paid amount.';
