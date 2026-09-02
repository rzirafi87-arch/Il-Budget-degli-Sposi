-- Branch 36: canonical event-scoped storage for Documenti/Appuntamenti.
-- Existing ambiguous rows are preserved. event_id is never backfilled from an
-- arbitrary owner event; authenticated access requires a valid owned event.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  appointment_date date not null,
  location text,
  notes text,
  reminder_7d_sent boolean not null default false,
  reminder_48h_sent boolean not null default false,
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.appointments add column if not exists event_id uuid;
alter table public.appointments add column if not exists reminder_7d_sent boolean not null default false;
alter table public.appointments add column if not exists reminder_48h_sent boolean not null default false;
alter table public.appointments add column if not exists inserted_at timestamptz not null default timezone('utc', now());
alter table public.appointments add column if not exists updated_at timestamptz not null default timezone('utc', now());

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.appointments'::regclass
      and conname = 'appointments_event_id_fkey'
  ) then
    alter table public.appointments
      add constraint appointments_event_id_fkey
      foreign key (event_id) references public.events(id) on delete cascade not valid;
  end if;
end $$;

create index if not exists idx_appointments_event_id on public.appointments(event_id);
create index if not exists idx_appointments_event_date on public.appointments(event_id, appointment_date);
create index if not exists idx_appointments_reminder_7d on public.appointments(appointment_date) where not reminder_7d_sent;
create index if not exists idx_appointments_reminder_48h on public.appointments(appointment_date) where not reminder_48h_sent;

alter table public.appointments enable row level security;

drop policy if exists appointments_owner_all on public.appointments;
drop policy if exists appointments_select_own on public.appointments;
drop policy if exists appointments_insert_own on public.appointments;
drop policy if exists appointments_update_own on public.appointments;
drop policy if exists appointments_delete_own on public.appointments;

create policy appointments_select_own on public.appointments
  for select to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = appointments.event_id and e.owner_id = (select auth.uid())
  ));

create policy appointments_insert_own on public.appointments
  for insert to authenticated
  with check (exists (
    select 1 from public.events e
    where e.id = appointments.event_id and e.owner_id = (select auth.uid())
  ));

create policy appointments_update_own on public.appointments
  for update to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = appointments.event_id and e.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.events e
    where e.id = appointments.event_id and e.owner_id = (select auth.uid())
  ));

create policy appointments_delete_own on public.appointments
  for delete to authenticated
  using (exists (
    select 1 from public.events e
    where e.id = appointments.event_id and e.owner_id = (select auth.uid())
  ));

revoke all on public.appointments from anon;
grant select, insert, update, delete on public.appointments to authenticated;
