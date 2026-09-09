-- Branch 41: restore the user-global favorites store used by /api/my/favorites.
-- Favorites are deliberately not event-scoped and never grant access to catalog rows.
create table if not exists public.user_favorites (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('supplier', 'location', 'church')),
  item_id uuid not null,
  notes text,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, item_type, item_id)
);

create index if not exists user_favorites_user_created_idx
  on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists user_favorites_select_own on public.user_favorites;
create policy user_favorites_select_own on public.user_favorites
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists user_favorites_insert_own on public.user_favorites;
create policy user_favorites_insert_own on public.user_favorites
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists user_favorites_update_own on public.user_favorites;
create policy user_favorites_update_own on public.user_favorites
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists user_favorites_delete_own on public.user_favorites;
create policy user_favorites_delete_own on public.user_favorites
  for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.user_favorites from public, anon;
grant select, insert, update, delete on table public.user_favorites to authenticated;
grant all on table public.user_favorites to service_role;

