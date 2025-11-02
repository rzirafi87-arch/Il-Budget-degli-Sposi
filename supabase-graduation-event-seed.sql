-- Graduation (Laurea) event seed
-- Idempotent inserts for categories and subcategories under event_types.slug = 'graduation'
-- Run in Supabase SQL editor or via scripts/run-sql.mjs

-- 1) Ensure event type exists
INSERT INTO event_types (slug, name)
VALUES ('graduation', 'Laurea')
ON CONFLICT (slug) DO NOTHING;

-- 2) Resolve type_id
WITH et AS (
  SELECT id FROM event_types WHERE slug = 'graduation'
)
-- 3) Insert categories
INSERT INTO categories (type_id, name, sort_order)
SELECT et.id, c.name, c.sort_order
FROM et,
  (VALUES
    ('Cerimonia Accademica', 1),
    ('Location e Ricevimento', 2),
    ('Catering / Ristorazione', 3),
    ('Abbigliamento e Beauty', 4),
    ('Foto, Video e Contenuti Social', 5),
    ('Inviti e Grafica', 6),
    ('Regali e Ringraziamenti', 7),
    ('Musica e Intrattenimento', 8),
    ('Trasporti e Logistica', 9),
    ('Gestione Budget (in-app)', 10)
  ) AS c(name, sort_order)
ON CONFLICT (type_id, name) DO NOTHING;

-- 4) Insert subcategories for each category
-- Helper CTE to get category ids
WITH et AS (
  SELECT id FROM event_types WHERE slug = 'graduation'
), cats AS (
  SELECT c.id, c.name
  FROM categories c
  JOIN et ON c.type_id = et.id
)
-- Cerimonia Accademica (7)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Cerimonia Accademica'), s.name, s.sort_order
FROM (VALUES
  ('Data e orario della proclamazione', 1),
  ('Prenotazione aula magna o sala (se privata)', 2),
  ('Relatore e correlatori (omaggi o regali simbolici)', 3),
  ('Tesi: stampa, rilegatura, copertine', 4),
  ('Corone d’alloro e bouquet', 5),
  ('Fotografo durante la proclamazione', 6),
  ('Permessi per accesso ospiti o fotografi', 7)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Location e Ricevimento (7)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Location e Ricevimento'), s.name, s.sort_order
FROM (VALUES
  ('Scelta location (ristorante, rooftop, casa, giardino, locale, bar)', 1),
  ('Affitto sala privata o terrazza', 2),
  ('Allestimento tavoli e mise en place', 3),
  ('Decorazioni tematiche (colori università, fiori, palloncini, backdrop)', 4),
  ('Tableau, segnaposti, menù personalizzati', 5),
  ('Bomboniere o gift bag “Laurea”', 6),
  ('Allestimento angolo foto / photobooth / parete verde', 7)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Catering / Ristorazione (6)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Catering / Ristorazione'), s.name, s.sort_order
FROM (VALUES
  ('Pranzo o cena', 1),
  ('Apericena / buffet / finger food', 2),
  ('Bevande e cocktail bar', 3),
  ('Torta di laurea e dolci personalizzati', 4),
  ('Brindisi finale', 5),
  ('Servizio catering o locale scelto', 6)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Abbigliamento e Beauty (5)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Abbigliamento e Beauty'), s.name, s.sort_order
FROM (VALUES
  ('Outfit laureato/a (cerimonia + festa)', 1),
  ('Cambio abito (post-evento)', 2),
  ('Trucco e parrucco', 3),
  ('Accessori, scarpe, gioielli, camicia personalizzata', 4),
  ('Ghirlanda d’alloro (se non già in cerimonia)', 5)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Foto, Video e Contenuti Social (5)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Foto, Video e Contenuti Social'), s.name, s.sort_order
FROM (VALUES
  ('Fotografo / videomaker', 1),
  ('Shooting pre- e post-cerimonia', 2),
  ('Reel o mini-video per social', 3),
  ('Polaroid o photobooth', 4),
  ('Album digitale o fisico', 5)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Inviti e Grafica (4)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Inviti e Grafica'), s.name, s.sort_order
FROM (VALUES
  ('Inviti digitali / cartacei', 1),
  ('Coordinato grafico (tema, colori, font)', 2),
  ('Menù, segnaposti, tableau, ringraziamenti', 3),
  ('Hashtag o QR code per raccolta foto/video', 4)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Regali e Ringraziamenti (4)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Regali e Ringraziamenti'), s.name, s.sort_order
FROM (VALUES
  ('Lista regali o “Gift Wallet”', 1),
  ('Ringraziamenti personalizzati', 2),
  ('Omaggio a relatore / correlatore / genitori', 3),
  ('Bomboniere e sacchetti confetti', 4)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Musica e Intrattenimento (4)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Musica e Intrattenimento'), s.name, s.sort_order
FROM (VALUES
  ('DJ o playlist personalizzata', 1),
  ('Band live o sax performer', 2),
  ('Audio e luci per la festa', 3),
  ('Animazione o karaoke', 4)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Trasporti e Logistica (4)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Trasporti e Logistica'), s.name, s.sort_order
FROM (VALUES
  ('Auto per spostamenti università ↔ location', 1),
  ('Navetta ospiti (se location lontana)', 2),
  ('Parcheggi e permessi', 3),
  ('Pernottamenti ospiti (se da fuori città)', 4)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Gestione Budget (in-app) (6)
INSERT INTO subcategories (category_id, name, sort_order)
SELECT (SELECT id FROM cats WHERE name = 'Gestione Budget (in-app)'), s.name, s.sort_order
FROM (VALUES
  ('Budget stimato', 1),
  ('Acconti versati', 2),
  ('Saldi', 3),
  ('Spese extra', 4),
  ('Totale finale', 5),
  ('Differenza (stimato vs speso)', 6)
) AS s(name, sort_order)
ON CONFLICT (category_id, name) DO NOTHING;

-- Verification
-- SELECT c.name, COUNT(sc.id) sub_count
-- FROM categories c
-- JOIN event_types et ON c.type_id = et.id
-- LEFT JOIN subcategories sc ON sc.category_id = c.id
-- WHERE et.slug = 'graduation'
-- GROUP BY c.name
-- ORDER BY MIN(c.sort_order);
