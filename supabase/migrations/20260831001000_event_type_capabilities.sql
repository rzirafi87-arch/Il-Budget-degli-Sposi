-- Branch 29: event types become explicit product capabilities.
-- This migration does not rewrite, delete or reassign any existing event.

alter table public.event_types
  add column if not exists availability_status text not null default 'COMING_SOON',
  add column if not exists enabled_modules text[] not null default '{}'::text[],
  add column if not exists ceremony_mode text not null default 'not_configured',
  add column if not exists budget_template text,
  add column if not exists timeline_template text,
  add column if not exists supplier_categories text[] not null default '{}'::text[],
  add column if not exists location_roles text[] not null default '{}'::text[],
  add column if not exists guest_module boolean not null default false,
  add column if not exists document_module boolean not null default false,
  add column if not exists church_module boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.event_types'::regclass
      and conname = 'event_types_availability_status_check'
  ) then
    alter table public.event_types
      add constraint event_types_availability_status_check
      check (availability_status in ('READY', 'COMING_SOON', 'BETA'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.event_types'::regclass
      and conname = 'event_types_ceremony_mode_check'
  ) then
    alter table public.event_types
      add constraint event_types_ceremony_mode_check
      check (ceremony_mode in ('religious_or_civil', 'religious', 'civil', 'none', 'not_configured'));
  end if;
end $$;

-- Register the product catalog without inventing taxonomies. All non-wedding
-- types remain COMING_SOON until their categories, timeline and workflows are
-- genuinely complete. No existing events are changed.
insert into public.event_types (code, name, locale, description, availability_status)
values
  ('WEDDING', 'Matrimonio', 'it-IT', 'Flusso completo Matrimonio', 'READY'),
  ('BAPTISM', 'Battesimo', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('EIGHTEENTH', 'Diciottesimo', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('GRADUATION', 'Laurea', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('CONFIRMATION', 'Cresima', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('COMMUNION', 'Comunione', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('ANNIVERSARY', 'Anniversario', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('BIRTHDAY', 'Compleanno', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('FIFTY', 'Cinquantesimo', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('GENDER_REVEAL', 'Gender Reveal', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('RETIREMENT', 'Pensionamento', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('BABY_SHOWER', 'Baby Shower', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('ENGAGEMENT_PARTY', 'Festa di fidanzamento', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('PROPOSAL', 'Proposta', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('CORPORATE', 'Evento aziendale', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('BAR_MITZVAH', 'Bar Mitzvah', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('QUINCEANERA', 'Quinceañera', 'it-IT', 'In preparazione', 'COMING_SOON'),
  ('CHARITY_GALA', 'Gala di beneficenza', 'it-IT', 'In preparazione', 'COMING_SOON')
on conflict (code) do update
set
  availability_status = excluded.availability_status,
  updated_at = now();

update public.event_types
set
  availability_status = 'READY',
  enabled_modules = array[
    'dashboard','budget','budget-ideas','guests','suppliers',
    'location-reception','location-ceremony','churches','timeline',
    'documents','accounting','save-the-date','favorites'
  ]::text[],
  ceremony_mode = 'religious_or_civil',
  budget_template = 'wedding',
  timeline_template = 'wedding',
  supplier_categories = array[
    'atelier','beauty','bomboniere','catering','decorazioni','fiori',
    'fotografia-video','musica-intrattenimento','noleggi','partecipazioni','wedding-planner'
  ]::text[],
  location_roles = array['ceremony','reception','accommodation','after_party','other']::text[],
  guest_module = true,
  document_module = true,
  church_module = true,
  updated_at = now()
where code = 'WEDDING';

update public.event_types
set
  enabled_modules = '{}'::text[],
  ceremony_mode = 'not_configured',
  budget_template = null,
  timeline_template = null,
  supplier_categories = '{}'::text[],
  location_roles = '{}'::text[],
  guest_module = false,
  document_module = false,
  church_module = false,
  updated_at = now()
where code <> 'WEDDING';

-- Extend the existing event-specific venue role vocabulary without changing
-- any existing saved_locations row. `party` remains accepted for compatibility.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.saved_locations'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%location_role%'
  loop
    execute format('alter table public.saved_locations drop constraint %I', constraint_record.conname);
  end loop;

  alter table public.saved_locations
    add constraint saved_locations_location_role_check
    check (location_role in (
      'reception', 'ceremony', 'main_event', 'accommodation',
      'after_party', 'party', 'other'
    ));
end $$;

comment on column public.event_types.availability_status is
  'Product availability: READY, COMING_SOON or BETA. Non-READY types must not create new full events.';
comment on column public.event_types.enabled_modules is
  'Canonical module capability list mirrored by the typed application configuration.';
comment on column public.event_types.ceremony_mode is
  'Ceremony capability, independent from translated labels.';
comment on column public.event_types.location_roles is
  'Event-specific venue roles supported by this event type.';
