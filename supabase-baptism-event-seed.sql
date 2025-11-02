-- =========================================
-- BATTESIMO (BAPTISM) EVENT TYPE + CATEGORIES
-- =========================================
-- Questo file aggiunge il tipo evento "Battesimo" al nuovo schema multi-evento
-- con tutte le categorie e sottocategorie complete.
-- 
-- PREREQUISITI:
-- - supabase-core-events-schema.sql (schema base)
-- 
-- ESECUZIONE:
-- Esegui questo file in Supabase SQL Editor o tramite:
-- node scripts/run-sql.mjs supabase-baptism-event-seed.sql

-- =========================================
-- 1. TIPO EVENTO
-- =========================================
INSERT INTO event_types (slug, name) VALUES
  ('baptism', 'Battesimo')
ON CONFLICT (slug) DO NOTHING;

-- =========================================
-- 2. CATEGORIE BATTESIMO
-- =========================================
INSERT INTO categories (type_id, name, sort)
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Cerimonia', 1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Abbigliamento', 2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Fiori & Decor', 3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Inviti & Stationery', 4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Ricevimento/Location', 5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Foto & Video', 6 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Bomboniere & Cadeau', 7 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Intrattenimento', 8 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='baptism'), 'Logistica & Servizi', 9
ON CONFLICT DO NOTHING;

-- =========================================
-- 3. SOTTOCATEGORIE - CERIMONIA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Offerta parrocchia', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Registro/Certificati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Candele battesimali', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Vestina/Stola battesimale', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Allestimento fonte (tulle/nastrini)', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Libretto cerimonia', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 4. SOTTOCATEGORIE - ABBIGLIAMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Abbigliamento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Outfit bimbo/a', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Scarpine/Cuffietta', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Cambio/Body', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Genitori/Padrini – outfit', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 5. SOTTOCATEGORIE - FIORI & DECOR
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Fiori chiesa', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Allestimento tavolo torta', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Centrotavola', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Palloncini/Backdrop (kids)', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 6. SOTTOCATEGORIE - INVITI & STATIONERY
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Inviti', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Biglietti ringraziamento', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Cartellini bomboniere', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Segnaposto/Menu', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 7. SOTTOCATEGORIE - RICEVIMENTO/LOCATION
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Ricevimento/Location' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Location/Pranzo', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento/Location' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Aperitivo/Welcome', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento/Location' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Torta battesimale', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento/Location' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Pasticceria/Dolci', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento/Location' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Confettata', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 8. SOTTOCATEGORIE - FOTO & VIDEO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Servizio fotografico cerimonia', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Servizio ricevimento', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Album/Stampate', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Video montaggio', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 9. SOTTOCATEGORIE - BOMBONIERE & CADEAU
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Cadeau' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Bomboniere', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Cadeau' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Confetti', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Cadeau' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Sacchettini/Tulle', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Cadeau' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Regali padrino/madrina', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Cadeau' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Packaging/Nastri/Sigilli', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 10. SOTTOCATEGORIE - INTRATTENIMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Animazione bambini', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Giochi/Gonfiabili', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Musica/SIAE', 3
ON CONFLICT DO NOTHING;

-- =========================================
-- 11. SOTTOCATEGORIE - LOGISTICA & SERVIZI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Logistica & Servizi' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Trasporti/Parcheggio', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Logistica & Servizi' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Baby-sitter', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Logistica & Servizi' AND type_id=(SELECT id FROM event_types WHERE slug='baptism')), 'Pulizie post-evento', 3
ON CONFLICT DO NOTHING;

-- =========================================
-- FINE SEED BATTESIMO
-- =========================================

-- Query per verificare l'inserimento:
-- SELECT et.name as event_type, c.name as category, COUNT(sc.id) as num_subcategories
-- FROM event_types et
-- JOIN categories c ON c.type_id = et.id
-- LEFT JOIN subcategories sc ON sc.category_id = c.id
-- WHERE et.slug = 'baptism'
-- GROUP BY et.name, c.name
-- ORDER BY c.sort;

-- Query per contare totale sottocategorie:
-- SELECT COUNT(*) FROM subcategories sc
-- JOIN categories c ON c.id = sc.category_id
-- JOIN event_types et ON et.id = c.type_id
-- WHERE et.slug = 'baptism';
-- Dovrebbe restituire: 40 sottocategorie
