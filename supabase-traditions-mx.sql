-- Tradizioni e checklist Messico: struttura SQL

-- Tabella tradizioni
CREATE TABLE IF NOT EXISTS traditions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  country_code TEXT NOT NULL
);

-- Tabella checklist tradizioni
CREATE TABLE IF NOT EXISTS checklist_modules (
  id SERIAL PRIMARY KEY,
  tradition_id INTEGER REFERENCES traditions(id),
  module_name TEXT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  country_code TEXT NOT NULL
);

-- Tabella budget_items con flag tradizione
CREATE TABLE IF NOT EXISTS budget_items (
  id SERIAL PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  amount NUMERIC,
  vendor_id UUID REFERENCES vendors(id),
  tradition_id INTEGER REFERENCES traditions(id),
  country_code TEXT NOT NULL
);


-- Esempio insert tradizioni Messico
INSERT INTO traditions (name, description, country_code) VALUES
  ('El Lazo', 'Cordone/laccio simbolo di unione eterna', 'mx'),
  ('Las Arras Matrimoniales', '13 monete simbolo di prosperità', 'mx'),
  ('Padrinos y Madrinas', 'Sponsor/testimoni con ruoli attivi', 'mx'),
  ('Papel Picado', 'Decorazioni tradizionali messicane', 'mx'),
  ('Mariachi', 'Musica tradizionale messicana', 'mx');
