-- Branch 29: register the event type catalog and extend location roles.
-- Product availability/capabilities live in the typed application matrix
-- (src/lib/eventTypeCapabilities.ts), avoiding two independently mutable
-- sources of truth. This migration does not rewrite, delete or reassign events.

insert into public.event_types (code, name, locale, description)
values
  ('WEDDING', 'Matrimonio', 'it-IT', 'Flusso completo Matrimonio'),
  ('BAPTISM', 'Battesimo', 'it-IT', 'In preparazione'),
  ('EIGHTEENTH', 'Diciottesimo', 'it-IT', 'In preparazione'),
  ('GRADUATION', 'Laurea', 'it-IT', 'In preparazione'),
  ('CONFIRMATION', 'Cresima', 'it-IT', 'In preparazione'),
  ('COMMUNION', 'Comunione', 'it-IT', 'In preparazione'),
  ('ANNIVERSARY', 'Anniversario', 'it-IT', 'In preparazione'),
  ('BIRTHDAY', 'Compleanno', 'it-IT', 'In preparazione'),
  ('FIFTY', 'Cinquantesimo', 'it-IT', 'In preparazione'),
  ('GENDER_REVEAL', 'Gender Reveal', 'it-IT', 'In preparazione'),
  ('RETIREMENT', 'Pensionamento', 'it-IT', 'In preparazione'),
  ('BABY_SHOWER', 'Baby Shower', 'it-IT', 'In preparazione'),
  ('ENGAGEMENT_PARTY', 'Festa di fidanzamento', 'it-IT', 'In preparazione'),
  ('PROPOSAL', 'Proposta', 'it-IT', 'In preparazione'),
  ('CORPORATE', 'Evento aziendale', 'it-IT', 'In preparazione'),
  ('BAR_MITZVAH', 'Bar Mitzvah', 'it-IT', 'In preparazione'),
  ('QUINCEANERA', 'Quinceañera', 'it-IT', 'In preparazione'),
  ('CHARITY_GALA', 'Gala di beneficenza', 'it-IT', 'In preparazione')
on conflict (code) do nothing;

-- Extend the event-specific venue role vocabulary without modifying any
-- existing saved_locations row. `party` remains accepted for compatibility.
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
