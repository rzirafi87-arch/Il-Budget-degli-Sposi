-- =========================================
-- DICIOTTESIMO (18TH BIRTHDAY) EVENT TYPE + CATEGORIES
-- =========================================
-- Questo file aggiunge il tipo evento "Diciottesimo" al nuovo schema multi-evento
-- con tutte le categorie e sottocategorie complete moderne.
-- 
-- PREREQUISITI:
-- - supabase-core-events-schema.sql (schema base)
-- 
-- ESECUZIONE:
-- Esegui questo file in Supabase SQL Editor o tramite:
-- node scripts/run-sql.mjs supabase-eighteenth-event-seed.sql

-- =========================================
-- 1. TIPO EVENTO
-- =========================================
INSERT INTO event_types (slug, name) VALUES
  ('eighteenth', 'Diciottesimo')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- =========================================
-- 2. RIMUOVI VECCHIE CATEGORIE (se esistono)
-- =========================================
DELETE FROM subcategories WHERE category_id IN (
  SELECT c.id FROM categories c
  JOIN event_types et ON c.type_id = et.id
  WHERE et.slug = 'eighteenth'
);
DELETE FROM categories WHERE type_id = (SELECT id FROM event_types WHERE slug = 'eighteenth');

-- =========================================
-- 3. CATEGORIE DICIOTTESIMO (11 TOTALI)
-- =========================================
INSERT INTO categories (type_id, name, sort)
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Location e Allestimento', 1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Catering / Cibo e Bevande', 2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Abbigliamento e Beauty', 3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Foto e Video', 4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Musica e Intrattenimento', 5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Inviti e Grafica', 6 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Regali e Ringraziamenti', 7 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Trasporti e Logistica', 8 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Servizi Extra', 9 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Comunicazione e Social', 10 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='eighteenth'), 'Imprevisti e Contingenze', 11
ON CONFLICT DO NOTHING;

-- =========================================
-- 4. SOTTOCATEGORIE - LOCATION E ALLESTIMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Affitto sala / locale / villa / terrazza', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Permessi o affitto spazi pubblici', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Allestimento tematico (balloon, backdrop, luci LED)', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Arredi e noleggi (tavoli, sedie, divanetti)', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Addobbi floreali o naturali', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Allestimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Allestimento tavoli e mise en place', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 5. SOTTOCATEGORIE - CATERING / CIBO E BEVANDE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Catering completo o buffet', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Aperitivo / Welcome drink', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Torta di compleanno', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Pasticceria e dolci personalizzati', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Bevande analcoliche / cocktail bar', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering / Cibo e Bevande' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Sommelier o barman', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 6. SOTTOCATEGORIE - ABBIGLIAMENTO E BEAUTY
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Abito / outfit principale', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Cambio abito (per ballo o party)', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Trucco e parrucco', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Accessori (scarpe, gioielli, giacca, borsa)', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Servizio estetico o parrucchiere a domicilio', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 7. SOTTOCATEGORIE - FOTO E VIDEO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Fotografo professionista', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Videomaker / Reelmaker', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Polaroid corner / Photo booth / Specchio magico', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Album o video ricordo', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 8. SOTTOCATEGORIE - MUSICA E INTRATTENIMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'DJ o band live', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Service audio e luci', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Animatore / Presentatore', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Artisti speciali (sax, violinista, performer LED)', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Fuochi freddi o effetti speciali', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Musica e Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Karaoke o open mic', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 9. SOTTOCATEGORIE - INVITI E GRAFICA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Partecipazioni digitali o cartacee', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Biglietti d\'invito con QR code', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Grafica personalizzata / logo evento', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Tableau, segnaposti, menù, cartellonistica', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 10. SOTTOCATEGORIE - REGALI E RINGRAZIAMENTI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Lista regali o "Money box" digitale', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Bomboniere o gift bag per gli invitati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Biglietti di ringraziamento / messaggi personalizzati', 3
ON CONFLICT DO NOTHING;

-- =========================================
-- 11. SOTTOCATEGORIE - TRASPORTI E LOGISTICA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Servizio navetta per ospiti', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Auto per l\'arrivo del festeggiato', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Parcheggi o permessi comunali', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Pernottamento ospiti (se fuori sede)', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 12. SOTTOCATEGORIE - SERVIZI EXTRA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Bodyguard o sicurezza', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Baby-sitter (se ospiti piccoli)', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Assicurazione evento', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Pulizia post-party', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Gestione permessi SIAE / musica live', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 13. SOTTOCATEGORIE - COMUNICAZIONE E SOCIAL
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Comunicazione e Social' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Hashtag e pagina evento', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione e Social' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Gestione stories / reels live', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione e Social' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Reel post-evento', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Comunicazione e Social' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Area social sharing (QR code o link)', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 14. SOTTOCATEGORIE - IMPREVISTI E CONTINGENZE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Fondo emergenze', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Spese impreviste', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='eighteenth')), 'Budget cuscinetto (10-15%)', 3
ON CONFLICT DO NOTHING;

-- =========================================
-- FINE SEED DICIOTTESIMO
-- =========================================

-- Verifica risultato
SELECT 
  et.name as event_type,
  c.name as category,
  COUNT(sc.id) as num_subcategories
FROM event_types et
JOIN categories c ON c.type_id = et.id
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE et.slug = 'eighteenth'
GROUP BY et.name, c.name, c.sort
ORDER BY c.sort;
