-- Seed Messico: Eventi, categorie, subcategorie, fornitori, location, chiese, tradizioni

-- Eventi tipici
INSERT INTO events (name, country, total_budget, bride_initial_budget, groom_initial_budget) VALUES
  ('Boda en la playa', 'mx', 30000, 15000, 15000),
  ('Boda colonial', 'mx', 40000, 20000, 20000);

-- Categorie principali
INSERT INTO categories (name, country) VALUES
  ('Novia', 'mx'),
  ('Novio', 'mx'),
  ('Recepción y Banquete', 'mx'),
  ('Música y Animación', 'mx'),
  ('Tradiciones', 'mx'),
  ('Decoración', 'mx'),
  ('Fotografía y Video', 'mx'),
  ('Transporte', 'mx');

-- Subcategorie con tradizioni
INSERT INTO subcategories (name, category_id, country) VALUES
  ('Vestido de novia', (SELECT id FROM categories WHERE name='Novia' AND country='mx'), 'mx'),
  ('Traje de novio', (SELECT id FROM categories WHERE name='Novio' AND country='mx'), 'mx'),
  ('Mariachi', (SELECT id FROM categories WHERE name='Música y Animación' AND country='mx'), 'mx'),
  ('La Callejoneada', (SELECT id FROM categories WHERE name='Tradiciones' AND country='mx'), 'mx'),
  ('Lazo', (SELECT id FROM categories WHERE name='Tradiciones' AND country='mx'), 'mx'),
  ('Tarta nupcial', (SELECT id FROM categories WHERE name='Recepción y Banquete' AND country='mx'), 'mx'),
  ('Decoración floral', (SELECT id FROM categories WHERE name='Decoración' AND country='mx'), 'mx'),
  ('Fotógrafo', (SELECT id FROM categories WHERE name='Fotografía y Video' AND country='mx'), 'mx'),
  ('Transporte invitados', (SELECT id FROM categories WHERE name='Transporte' AND country='mx'), 'mx');

-- Fornitori tipici
INSERT INTO suppliers (name, type, country) VALUES
  ('Mariachi Los Reyes', 'musica', 'mx'),
  ('Floristería Azteca', 'decorazione', 'mx'),
  ('Fotografía Rivera', 'foto_video', 'mx'),
  ('Banquetes Playa Azul', 'banqueting', 'mx'),
  ('Transporte Cancun', 'trasporto', 'mx');

-- Location famose
INSERT INTO locations (name, region, country) VALUES
  ('Playa del Carmen', 'Quintana Roo', 'mx'),
  ('San Miguel de Allende', 'Guanajuato', 'mx'),
  ('Puerto Vallarta', 'Jalisco', 'mx'),
  ('Ciudad de México', 'CDMX', 'mx');

-- Chiese tipiche
INSERT INTO churches (name, city, country) VALUES
  ('Parroquia de San Miguel Arcángel', 'San Miguel de Allende', 'mx'),
  ('Catedral Metropolitana', 'Ciudad de México', 'mx'),
  ('Iglesia de Nuestra Señora de Guadalupe', 'Puerto Vallarta', 'mx');

-- Tradizioni
INSERT INTO traditions (name, description, country) VALUES
  ('La Callejoneada', 'Processione festosa con musica e balli nelle strade, tipica dei matrimoni coloniali.', 'mx'),
  ('Lazo', 'Simbolo di unione degli sposi, una corda decorata posta sulle spalle durante la cerimonia.', 'mx'),
  ('Mariachi', 'Musica tradizionale dal vivo durante la cerimonia e il ricevimento.', 'mx');
