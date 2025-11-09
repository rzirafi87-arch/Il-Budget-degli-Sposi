
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_types' AND table_schema = 'public') THEN
    DROP TABLE public.event_types;
  END IF;
END $$;

CREATE TABLE event_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

INSERT INTO event_types (code, name, description) VALUES
  ('wedding', 'Matrimonio', 'Evento di nozze'),
  ('birthday', 'Compleanno', 'Festa di compleanno'),
  ('baptism', 'Battesimo', 'Cerimonia di battesimo'),
  ('communion', 'Comunione', 'Cerimonia di comunione'),
  ('confirmation', 'Cresima', 'Cerimonia di cresima'),
  ('engagement', 'Fidanzamento', 'Festa di fidanzamento'),
  ('anniversary', 'Anniversario', 'Anniversario di matrimonio'),
  ('babyshower', 'Baby Shower', 'Festa Baby Shower'),
  ('genderreveal', 'Gender Reveal', 'Festa Gender Reveal'),
  ('fifty', 'Festa 50 anni', 'Compleanno 50 anni');
