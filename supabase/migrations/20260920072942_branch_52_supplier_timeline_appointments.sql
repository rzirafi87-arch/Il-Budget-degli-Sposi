-- Branch 52 / Milestone 4: optional event-scoped supplier references for
-- Timeline items and appointments.
--
-- Schema-only and additive: existing rows remain unlinked. No catalog,
-- snapshot, provenance, reminder or application-data row is modified.

begin;

alter table public.timeline_items
  add column if not exists client_key uuid,
  add column if not exists private_supplier_id uuid;

alter table public.appointments
  add column if not exists client_key uuid,
  add column if not exists saved_supplier_id uuid,
  add column if not exists private_supplier_id uuid;

create unique index if not exists event_private_catalog_records_id_event_uidx
  on public.event_private_catalog_records(id, event_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.timeline_items'::regclass
      and conname = 'timeline_items_supplier_xor_check'
  ) then
    alter table public.timeline_items
      add constraint timeline_items_supplier_xor_check
      check (num_nonnulls(saved_supplier_id, private_supplier_id) <= 1)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.timeline_items'::regclass
      and conname = 'timeline_items_saved_supplier_event_fkey'
  ) then
    alter table public.timeline_items
      add constraint timeline_items_saved_supplier_event_fkey
      foreign key (saved_supplier_id, event_id)
      references public.saved_suppliers(id, event_id)
      on delete set null (saved_supplier_id)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.timeline_items'::regclass
      and conname = 'timeline_items_private_supplier_event_fkey'
  ) then
    alter table public.timeline_items
      add constraint timeline_items_private_supplier_event_fkey
      foreign key (private_supplier_id, event_id)
      references public.event_private_catalog_records(id, event_id)
      on delete set null (private_supplier_id)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_supplier_xor_check'
  ) then
    alter table public.appointments
      add constraint appointments_supplier_xor_check
      check (num_nonnulls(saved_supplier_id, private_supplier_id) <= 1)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_saved_supplier_event_fkey'
  ) then
    alter table public.appointments
      add constraint appointments_saved_supplier_event_fkey
      foreign key (saved_supplier_id, event_id)
      references public.saved_suppliers(id, event_id)
      on delete set null (saved_supplier_id)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_private_supplier_event_fkey'
  ) then
    alter table public.appointments
      add constraint appointments_private_supplier_event_fkey
      foreign key (private_supplier_id, event_id)
      references public.event_private_catalog_records(id, event_id)
      on delete set null (private_supplier_id)
      not valid;
  end if;
end
$$;

alter table public.timeline_items
  validate constraint timeline_items_supplier_xor_check;
alter table public.timeline_items
  validate constraint timeline_items_saved_supplier_event_fkey;
alter table public.timeline_items
  validate constraint timeline_items_private_supplier_event_fkey;
alter table public.appointments
  validate constraint appointments_supplier_xor_check;
alter table public.appointments
  validate constraint appointments_saved_supplier_event_fkey;
alter table public.appointments
  validate constraint appointments_private_supplier_event_fkey;

create index if not exists timeline_items_event_saved_supplier_idx
  on public.timeline_items(event_id, saved_supplier_id)
  where saved_supplier_id is not null;
create index if not exists timeline_items_event_private_supplier_idx
  on public.timeline_items(event_id, private_supplier_id)
  where private_supplier_id is not null;
create index if not exists appointments_event_saved_supplier_idx
  on public.appointments(event_id, saved_supplier_id)
  where saved_supplier_id is not null;
create index if not exists appointments_event_private_supplier_idx
  on public.appointments(event_id, private_supplier_id)
  where private_supplier_id is not null;
create unique index if not exists timeline_items_event_client_key_uidx
  on public.timeline_items(event_id, client_key);
create unique index if not exists appointments_event_client_key_uidx
  on public.appointments(event_id, client_key);

create or replace function public.enforce_supplier_work_private_supplier_type()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.private_supplier_id is not null and not exists (
    select 1
    from public.event_private_catalog_records record
    where record.id = new.private_supplier_id
      and record.event_id = new.event_id
      and record.entity_type = 'supplier'
  ) then
    raise exception using
      errcode = '23503',
      message = 'SUPPLIER_LINK_NOT_FOUND';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_supplier_work_private_supplier_type() from public;
revoke all on function public.enforce_supplier_work_private_supplier_type() from anon;
revoke all on function public.enforce_supplier_work_private_supplier_type() from authenticated;

drop trigger if exists timeline_items_private_supplier_type on public.timeline_items;
create trigger timeline_items_private_supplier_type
before insert or update of private_supplier_id, event_id on public.timeline_items
for each row execute function public.enforce_supplier_work_private_supplier_type();

drop trigger if exists appointments_private_supplier_type on public.appointments;
create trigger appointments_private_supplier_type
before insert or update of private_supplier_id, event_id on public.appointments
for each row execute function public.enforce_supplier_work_private_supplier_type();

create or replace function public.enforce_supplier_work_identity_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.event_id is distinct from old.event_id
     or new.client_key is distinct from old.client_key then
    raise exception using
      errcode = '22023',
      message = 'SUPPLIER_WORK_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_supplier_work_identity_immutable() from public;
revoke all on function public.enforce_supplier_work_identity_immutable() from anon;
revoke all on function public.enforce_supplier_work_identity_immutable() from authenticated;

drop trigger if exists timeline_items_supplier_work_identity_immutable on public.timeline_items;
create trigger timeline_items_supplier_work_identity_immutable
before update on public.timeline_items
for each row execute function public.enforce_supplier_work_identity_immutable();

drop trigger if exists appointments_supplier_work_identity_immutable on public.appointments;
create trigger appointments_supplier_work_identity_immutable
before update on public.appointments
for each row execute function public.enforce_supplier_work_identity_immutable();

comment on column public.timeline_items.client_key is
  'Optional client-generated UUID used to make event-scoped creates idempotent.';
comment on column public.timeline_items.private_supplier_id is
  'Optional event-private supplier link; mutually exclusive with saved_supplier_id.';
comment on column public.appointments.saved_supplier_id is
  'Optional saved global supplier link from the same event.';
comment on column public.appointments.private_supplier_id is
  'Optional event-private supplier link; mutually exclusive with saved_supplier_id.';
comment on column public.appointments.client_key is
  'Optional client-generated UUID used to make event-scoped creates idempotent.';

commit;
