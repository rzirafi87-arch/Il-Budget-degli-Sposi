-- Seed location ricevimento, chiesa e fornitori per Messico, Italia, Indonesia, Giappone, USA, Emirati Arabi, Russia, Francia, Spagna, Germania
-- Struttura basata su quella usata per l'Italia

-- LOCATION RICEVIMENTO
INSERT INTO locations (name, type, country, region, city, address) VALUES
  ('Villa del Sol', 'ricevimento', 'Messico', 'Jalisco', 'Guadalajara', 'Av. Vallarta 123'),
  ('Castello di Roma', 'ricevimento', 'Italia', 'Lazio', 'Roma', 'Via Appia 45'),
  ('Bali Dream Resort', 'ricevimento', 'Indonesia', 'Bali', 'Ubud', 'Jl. Monkey Forest 88'),
  ('Tokyo Sky Hall', 'ricevimento', 'Giappone', 'Tokyo', 'Tokyo', 'Shibuya 1-2-3'),
  ('Sunset Ranch', 'ricevimento', 'USA', 'California', 'Los Angeles', 'Sunset Blvd 100'),
  ('Emirates Palace', 'ricevimento', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Corniche Rd'),
  ('Palazzo Nevskij', 'ricevimento', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Nevskij Prospekt 55'),
  ('Château Lumière', 'ricevimento', 'Francia', 'Île-de-France', 'Parigi', 'Rue de Rivoli 10'),
  ('Finca La Alegría', 'ricevimento', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Real 22'),
  ('Schloss Grünwald', 'ricevimento', 'Germania', 'Baviera', 'Monaco', 'Grünwaldstr. 7');

-- LOCATION CHIESA
INSERT INTO churches (name, country, region, city, address) VALUES
  ('Iglesia de Guadalupe', 'Messico', 'Jalisco', 'Guadalajara', 'Calle Independencia 50'),
  ('Chiesa di Santa Maria', 'Italia', 'Lazio', 'Roma', 'Via del Corso 12'),
  ('Gereja Katolik Santo Yosef', 'Indonesia', 'Bali', 'Denpasar', 'Jl. Diponegoro 5'),
  ('St. Mary Cathedral', 'Giappone', 'Tokyo', 'Tokyo', 'Bunkyo-ku 1-1-1'),
  ('St. Patrick Church', 'USA', 'New York', 'New York', '5th Ave 460'),
  ('St. Joseph Cathedral', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Airport Rd'),
  ('Cattedrale di Kazan', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Nevskij Prospekt 25'),
  ('Église Saint-Germain', 'Francia', 'Île-de-France', 'Parigi', 'Bd Saint-Germain 3'),
  ('Iglesia de la Macarena', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Bécquer 1'),
  ('Frauenkirche', 'Germania', 'Baviera', 'Monaco', 'Frauenplatz 12');

-- FORNITORI
INSERT INTO suppliers (name, type, country, region, city, address) VALUES
  ('Flores y Bodas', 'fiori', 'Messico', 'Jalisco', 'Guadalajara', 'Calle Flores 8'),
  ('Catering Roma', 'catering', 'Italia', 'Lazio', 'Roma', 'Via Veneto 20'),
  ('Bali Wedding Planners', 'wedding planner', 'Indonesia', 'Bali', 'Ubud', 'Jl. Raya 10'),
  ('Tokyo Bridal', 'abiti', 'Giappone', 'Tokyo', 'Tokyo', 'Harajuku 2-2-2'),
  ('NYC Music Events', 'musica', 'USA', 'New York', 'New York', 'Broadway 200'),
  ('Abu Dhabi Events', 'catering', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Al Reem St 5'),
  ('Matrimoni Nevskij', 'foto', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Liteyniy 15'),
  ('Paris Wedding Flowers', 'fiori', 'Francia', 'Île-de-France', 'Parigi', 'Rue des Fleurs 4'),
  ('Sevilla Catering', 'catering', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Feria 9'),
  ('München Musik', 'musica', 'Germania', 'Baviera', 'Monaco', 'Beethovenstr. 3');

-- Traduzioni Baby Shower (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('BABY_SHOWER','it','Baby Shower'),
('BABY_SHOWER','en','Baby Shower')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('MAMMA','it','Mamma'),
('MAMMA','en','Mom'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('DECORAZIONI','it','Decorazioni'),
('DECORAZIONI','en','Decorations')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('FESTA','it','Giorno della festa'),
('FESTA','en','Party day')
on conflict do nothing;
