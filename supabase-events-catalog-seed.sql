-- SEED: Catalogo eventi disponibili
CREATE TABLE IF NOT EXISTS public.event_types (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

INSERT INTO public.event_types (code, name, description) VALUES
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
-- ... (aggiungere tutti gli eventi supportati)
