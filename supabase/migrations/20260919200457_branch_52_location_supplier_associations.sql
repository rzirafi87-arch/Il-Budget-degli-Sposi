-- Branch 52 / Milestone 3: curated global Location-Supplier reads and
-- event-scoped private Location-Supplier associations.
--
-- Schema-only: no cleanup, backfill, deduplication, inferred association or
-- application-data DML. The existing supplier_locations catalog is preserved
-- byte-for-byte and remains client read-only.

-- Composite candidate keys let foreign keys prove same-event ownership
-- without relying on triggers or client-supplied assertions.
create unique index if not exists saved_locations_id_event_uidx
  on public.saved_locations(id, event_id);
create unique index if not exists saved_suppliers_id_event_uidx
  on public.saved_suppliers(id, event_id);
create unique index if not exists event_private_catalog_records_id_event_type_uidx
  on public.event_private_catalog_records(id, event_id, entity_type);

create table if not exists public.event_location_supplier_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  saved_location_id uuid,
  private_location_id uuid,
  private_location_entity_type text generated always as ('location'::text) stored,
  saved_supplier_id uuid,
  private_supplier_id uuid,
  private_supplier_entity_type text generated always as ('supplier'::text) stored,
  relationship_type text not null,
  private_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_location_supplier_links_event_fkey
    foreign key(event_id) references public.events(id) on delete cascade,
  constraint event_location_supplier_links_saved_location_event_fkey
    foreign key(saved_location_id, event_id)
    references public.saved_locations(id, event_id) on delete cascade,
  constraint event_location_supplier_links_saved_supplier_event_fkey
    foreign key(saved_supplier_id, event_id)
    references public.saved_suppliers(id, event_id) on delete cascade,
  constraint event_location_supplier_links_private_location_event_type_fkey
    foreign key(private_location_id, event_id, private_location_entity_type)
    references public.event_private_catalog_records(id, event_id, entity_type)
    on delete cascade,
  constraint event_location_supplier_links_private_supplier_event_type_fkey
    foreign key(private_supplier_id, event_id, private_supplier_entity_type)
    references public.event_private_catalog_records(id, event_id, entity_type)
    on delete cascade,
  constraint event_location_supplier_links_location_xor_check
    check (num_nonnulls(saved_location_id, private_location_id) = 1),
  constraint event_location_supplier_links_supplier_xor_check
    check (num_nonnulls(saved_supplier_id, private_supplier_id) = 1),
  constraint event_location_supplier_links_relationship_type_check
    check (relationship_type in (
      'works_at', 'preferred_supplier', 'internal_supplier',
      'external_allowed', 'recommended', 'historic_relationship'
    )),
  constraint event_location_supplier_links_private_notes_check
    check (private_notes is null or char_length(private_notes) <= 4000)
);

create index if not exists event_location_supplier_links_event_created_idx
  on public.event_location_supplier_links(event_id, created_at, id);
create index if not exists event_location_supplier_links_saved_location_idx
  on public.event_location_supplier_links(saved_location_id)
  where saved_location_id is not null;
create index if not exists event_location_supplier_links_private_location_idx
  on public.event_location_supplier_links(private_location_id)
  where private_location_id is not null;
create index if not exists event_location_supplier_links_saved_supplier_idx
  on public.event_location_supplier_links(saved_supplier_id)
  where saved_supplier_id is not null;
create index if not exists event_location_supplier_links_private_supplier_idx
  on public.event_location_supplier_links(private_supplier_id)
  where private_supplier_id is not null;

-- NULL-aware uniqueness is expressed as one index for each legal endpoint
-- combination. This preserves the global catalog rule that the same pair may
-- carry different relationship types while making exact retries concurrent-safe.
create unique index if not exists event_location_supplier_links_saved_saved_uidx
  on public.event_location_supplier_links(
    event_id, saved_location_id, saved_supplier_id, relationship_type
  )
  where saved_location_id is not null and saved_supplier_id is not null;
create unique index if not exists event_location_supplier_links_saved_private_uidx
  on public.event_location_supplier_links(
    event_id, saved_location_id, private_supplier_id, relationship_type
  )
  where saved_location_id is not null and private_supplier_id is not null;
create unique index if not exists event_location_supplier_links_private_saved_uidx
  on public.event_location_supplier_links(
    event_id, private_location_id, saved_supplier_id, relationship_type
  )
  where private_location_id is not null and saved_supplier_id is not null;
create unique index if not exists event_location_supplier_links_private_private_uidx
  on public.event_location_supplier_links(
    event_id, private_location_id, private_supplier_id, relationship_type
  )
  where private_location_id is not null and private_supplier_id is not null;

create or replace function public.protect_event_location_supplier_link_identity()
returns trigger
language plpgsql
security invoker
set search_path = public, extensions, pg_temp
as $$
begin
  if new.event_id is distinct from old.event_id
    or new.saved_location_id is distinct from old.saved_location_id
    or new.private_location_id is distinct from old.private_location_id
    or new.saved_supplier_id is distinct from old.saved_supplier_id
    or new.private_supplier_id is distinct from old.private_supplier_id
    -- Preserve provenance for every ordinary update while allowing the
    -- declared auth.users FK action to clear a deleted creator safely.
    or (new.created_by is distinct from old.created_by and new.created_by is not null)
    or new.created_at is distinct from old.created_at
  then
    raise exception 'private association identity is immutable' using errcode = '23514';
  end if;
  return new;
end
$$;

revoke all on function public.protect_event_location_supplier_link_identity()
  from public, anon;
grant execute on function public.protect_event_location_supplier_link_identity()
  to authenticated, service_role;

-- M3 intentionally excludes legacy email matching: private associations are
-- available only to the event owner and an explicitly active owner/partner.
create or replace function public.can_manage_event_location_supplier_links(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.events e
    where e.id = p_event_id
      and e.owner_id = (select auth.uid())
  ) or exists (
    select 1
    from public.event_members m
    where m.event_id = p_event_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'partner')
      and m.status = 'active'
  );
$$;

revoke all on function public.can_manage_event_location_supplier_links(uuid)
  from public, anon;
grant execute on function public.can_manage_event_location_supplier_links(uuid)
  to authenticated, service_role;

drop trigger if exists protect_event_location_supplier_link_identity
  on public.event_location_supplier_links;
create trigger protect_event_location_supplier_link_identity
before update on public.event_location_supplier_links
for each row execute function public.protect_event_location_supplier_link_identity();

drop trigger if exists update_event_location_supplier_links_updated_at
  on public.event_location_supplier_links;
create trigger update_event_location_supplier_links_updated_at
before update on public.event_location_supplier_links
for each row execute function public.update_updated_at_column();

alter table public.event_location_supplier_links enable row level security;

drop policy if exists event_location_supplier_links_select_event
  on public.event_location_supplier_links;
create policy event_location_supplier_links_select_event
  on public.event_location_supplier_links for select to authenticated
  using (public.can_manage_event_location_supplier_links(event_id));

drop policy if exists event_location_supplier_links_insert_event
  on public.event_location_supplier_links;
create policy event_location_supplier_links_insert_event
  on public.event_location_supplier_links for insert to authenticated
  with check (
    public.can_manage_event_location_supplier_links(event_id)
    and created_by = (select auth.uid())
  );

drop policy if exists event_location_supplier_links_update_event
  on public.event_location_supplier_links;
create policy event_location_supplier_links_update_event
  on public.event_location_supplier_links for update to authenticated
  using (public.can_manage_event_location_supplier_links(event_id))
  with check (public.can_manage_event_location_supplier_links(event_id));

drop policy if exists event_location_supplier_links_delete_event
  on public.event_location_supplier_links;
create policy event_location_supplier_links_delete_event
  on public.event_location_supplier_links for delete to authenticated
  using (public.can_manage_event_location_supplier_links(event_id));

revoke all on table public.event_location_supplier_links
  from public, anon, authenticated;
grant select, delete on table public.event_location_supplier_links
  to authenticated;
grant insert (
  event_id, saved_location_id, private_location_id,
  saved_supplier_id, private_supplier_id,
  relationship_type, private_notes, created_by
) on table public.event_location_supplier_links to authenticated;
grant update (relationship_type, private_notes)
  on table public.event_location_supplier_links to authenticated;
grant all on table public.event_location_supplier_links to service_role;

comment on table public.event_location_supplier_links is
  'Event-scoped Location-Supplier associations. Each endpoint is exactly one saved global snapshot or one private-only catalog record from the same event.';
comment on column public.event_location_supplier_links.created_by is
  'Authenticated creator of the private association; provenance only, not ownership.';
comment on column public.event_location_supplier_links.private_notes is
  'Event-private notes shared by the owner and active partner.';
