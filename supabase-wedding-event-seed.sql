-- =========================================
-- MATRIMONIO (WEDDING) EVENT TYPE + CATEGORIES
-- =========================================
-- Questo file aggiunge il tipo evento "Matrimonio" al nuovo schema multi-evento
-- con tutte le categorie e sottocategorie complete.
-- 
-- PREREQUISITI:
-- - supabase-core-events-schema.sql (schema base)
-- 
-- ESECUZIONE:
-- Esegui questo file in Supabase SQL Editor o tramite:
-- node scripts/run-sql.mjs supabase-wedding-event-seed.sql

-- =========================================
-- 1. TIPO EVENTO
-- =========================================
INSERT INTO event_types (slug, name) VALUES
  ('wedding', 'Matrimonio')
ON CONFLICT (slug) DO NOTHING;

-- =========================================
-- 2. CATEGORIE MATRIMONIO
-- =========================================
INSERT INTO categories (type_id, name, sort)
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Sposa', 1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Sposo', 2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Abiti & Accessori (altri)', 3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Cerimonia', 4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Location & Catering', 5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Fiori & Decor', 6 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Foto & Video', 7 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Inviti & Stationery', 8 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Musica & Intrattenimento', 9 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Beauty & Benessere', 10 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Bomboniere & Regali', 11 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Trasporti', 12 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Ospitalità & Logistica', 13 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Viaggio di nozze', 14 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Staff & Coordinamento', 15 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Burocrazia & Documenti', 16 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Comunicazione & Media', 17 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='wedding'), 'Extra & Contingenze', 18
ON CONFLICT DO NOTHING;

-- =========================================
-- 3. SOTTOCATEGORIE - SPOSA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Abito sposa', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Scarpe sposa', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Accessori (velo, gioielli, ecc.)', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Intimo / sottogonna', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Parrucchiera', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Make-up', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Prove', 7 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposa' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro sposa', 8
ON CONFLICT DO NOTHING;

-- =========================================
-- 4. SOTTOCATEGORIE - SPOSO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Abito sposo', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Scarpe sposo', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Accessori (cravatta, gemelli, ecc.)', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Barbiere / Grooming', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Prove', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Sposo' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro sposo', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 5. SOTTOCATEGORIE - ABITI & ACCESSORI (ALTRI)
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Abiti & Accessori (altri)' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Damigelle / testimoni', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abiti & Accessori (altri)' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Paggetti / bambini', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abiti & Accessori (altri)' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Genitori', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abiti & Accessori (altri)' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Fedi nuziali', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abiti & Accessori (altri)' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro abbigliamento', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 6. SOTTOCATEGORIE - CERIMONIA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Chiesa / luogo cerimonia', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Celebrante / sacerdote', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Musicisti cerimonia', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Addobbi floreali chiesa', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Libretto messa', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Confetti e riso', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro cerimonia', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 7. SOTTOCATEGORIE - LOCATION & CATERING
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Location ricevimento', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Menù / Catering', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Torta nuziale', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Open bar / bevande', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Confettata / sweet table', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Servizio camerieri', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location & Catering' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro catering', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 8. SOTTOCATEGORIE - FIORI & DECOR
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Bouquet sposa', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Boutonnière sposo', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Centrotavola', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Allestimento location', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Illuminazione / luci', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Noleggio arredi', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Fiori & Decor' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro decor', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 9. SOTTOCATEGORIE - FOTO & VIDEO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Fotografo', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Videomaker', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Album fotografico', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Drone', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Photobooth', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Stampe e cornici', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto & Video' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro foto/video', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 10. SOTTOCATEGORIE - INVITI & STATIONERY
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Partecipazioni', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Save the date', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Tableau / segnaposto', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Menù tavoli', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Ringraziamenti', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Stampa e design', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti & Stationery' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro stationery', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 11. SOTTOCATEGORIE - MUSICA & INTRATTENIMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'DJ', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Band / gruppo musicale', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Animazione', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Noleggio audio/luci', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Spettacoli / artisti', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica & Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro intrattenimento', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 12. SOTTOCATEGORIE - BEAUTY & BENESSERE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Beauty & Benessere' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Trattamenti pre-matrimonio', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Beauty & Benessere' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Spa / massaggi', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Beauty & Benessere' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Nail art / manicure', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Beauty & Benessere' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Depilazione / estetica', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Beauty & Benessere' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro beauty', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 13. SOTTOCATEGORIE - BOMBONIERE & REGALI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Bomboniere', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Confetti', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Sacchetti / packaging', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Regali testimoni', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Lista nozze', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere & Regali' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro bomboniere', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 14. SOTTOCATEGORIE - TRASPORTI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Trasporti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Auto sposi', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Navetta invitati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Parcheggio', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro trasporti', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 15. SOTTOCATEGORIE - OSPITALITÀ & LOGISTICA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Ospitalità & Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Hotel sposi', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ospitalità & Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Hotel invitati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ospitalità & Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Welcome bag', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ospitalità & Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro ospitalità', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 16. SOTTOCATEGORIE - VIAGGIO DI NOZZE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Viaggio di nozze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Voli', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Viaggio di nozze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Hotel / resort', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Viaggio di nozze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Escursioni / attività', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Viaggio di nozze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro viaggio', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 17. SOTTOCATEGORIE - STAFF & COORDINAMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Staff & Coordinamento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Wedding planner', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Staff & Coordinamento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Coordinatore giorno', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Staff & Coordinamento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Hostess / steward', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Staff & Coordinamento' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro staff', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 18. SOTTOCATEGORIE - BUROCRAZIA & DOCUMENTI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Burocrazia & Documenti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Pubblicazioni matrimonio', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Burocrazia & Documenti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Certificati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Burocrazia & Documenti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Permessi / autorizzazioni', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Burocrazia & Documenti' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro burocrazia', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 19. SOTTOCATEGORIE - COMUNICAZIONE & MEDIA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Comunicazione & Media' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Sito web matrimonio', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione & Media' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Social media', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione & Media' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Video inviti digitali', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione & Media' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro comunicazione', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 20. SOTTOCATEGORIE - EXTRA & CONTINGENZE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Extra & Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Fondo emergenze', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra & Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Assicurazione matrimonio', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra & Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Regali last minute', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra & Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Spese impreviste', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra & Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='wedding')), 'Altro', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- VERIFICA COMPLETAMENTO
-- =========================================
-- Query per verificare l'inserimento:
-- SELECT et.name as event_type, c.name as category, COUNT(sc.id) as num_subcategories
-- FROM event_types et
-- JOIN categories c ON c.type_id = et.id
-- LEFT JOIN subcategories sc ON sc.category_id = c.id
-- WHERE et.slug = 'wedding'
-- GROUP BY et.name, c.name
-- ORDER BY c.sort;

-- Query per contare totale sottocategorie:
-- SELECT COUNT(*) FROM subcategories sc
-- JOIN categories c ON c.id = sc.category_id
-- JOIN event_types et ON et.id = c.type_id
-- WHERE et.slug = 'wedding';
