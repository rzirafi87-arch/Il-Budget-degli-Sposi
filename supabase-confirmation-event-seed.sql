-- =========================================
-- CRESIMA (CONFIRMATION) EVENT TYPE + CATEGORIES
-- =========================================
-- Questo file aggiunge il tipo evento "Cresima" al nuovo schema multi-evento
-- con tutte le categorie e sottocategorie complete per un evento religioso.
-- 
-- PREREQUISITI:
-- - supabase-core-events-schema.sql (schema base)
-- 
-- ESECUZIONE:
-- Esegui questo file in Supabase SQL Editor o tramite:
-- node scripts/run-sql.mjs supabase-confirmation-event-seed.sql

-- =========================================
-- 1. TIPO EVENTO
-- =========================================
INSERT INTO event_types (slug, name) VALUES
  ('confirmation', 'Cresima')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- =========================================
-- 2. RIMUOVI VECCHIE CATEGORIE (se esistono)
-- =========================================
DELETE FROM subcategories WHERE category_id IN (
  SELECT c.id FROM categories c
  JOIN event_types et ON c.type_id = et.id
  WHERE et.slug = 'confirmation'
);
DELETE FROM categories WHERE type_id = (SELECT id FROM event_types WHERE slug = 'confirmation');

-- =========================================
-- 3. CATEGORIE CRESIMA (10 TOTALI)
-- =========================================
INSERT INTO categories (type_id, name, sort)
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Cerimonia Religiosa', 1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Location e Ricevimento', 2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Catering e Ristorazione', 3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Abbigliamento e Beauty', 4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Foto e Video', 5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Inviti e Grafica', 6 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Regali e Ringraziamenti', 7 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Trasporti e Logistica', 8 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Servizi Extra', 9 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='confirmation'), 'Imprevisti e Contingenze', 10
ON CONFLICT DO NOTHING;

-- =========================================
-- 4. SOTTOCATEGORIE - CERIMONIA RELIGIOSA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Prenotazione chiesa / oratorio', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Scelta padrino / madrina', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Offerta per la parrocchia', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Documentazione e pratiche religiose', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Coroncina, Bibbia, rosario o simboli sacri', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Fotografo in chiesa (permessi + servizio)', 6 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia Religiosa' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Decorazioni floreali per altare e panche', 7
ON CONFLICT DO NOTHING;

-- =========================================
-- 5. SOTTOCATEGORIE - LOCATION E RICEVIMENTO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Scelta location (ristorante, agriturismo, casa, sala)', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Allestimento tavoli e mise en place', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Decorazioni a tema (colori tenui, simboli religiosi)', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Tableau / segnaposti / menù personalizzati', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Bomboniere o ricordi per invitati', 5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Angolo foto o backdrop', 6
ON CONFLICT DO NOTHING;

-- =========================================
-- 6. SOTTOCATEGORIE - CATERING E RISTORAZIONE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Catering e Ristorazione' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Menù adulti', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering e Ristorazione' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Menù bambini', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering e Ristorazione' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Torta e pasticceria personalizzata', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering e Ristorazione' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Bevande e brindisi', 4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Catering e Ristorazione' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Servizio catering o ristorante', 5
ON CONFLICT DO NOTHING;

-- =========================================
-- 7. SOTTOCATEGORIE - ABBIGLIAMENTO E BEAUTY
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Abito del cresimando/a', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Scarpe e accessori', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Parrucchiere / trucco leggero', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Outfit genitori e padrino/madrina', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 8. SOTTOCATEGORIE - FOTO E VIDEO
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Servizio fotografico in chiesa', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Shooting post-cerimonia (giardino o location)', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Album fotografico / cornice digitale', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Video breve ricordo', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 9. SOTTOCATEGORIE - INVITI E GRAFICA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Partecipazioni cartacee o digitali', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Biglietti di ringraziamento', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Segnaposto e menù stampati', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Coordinato grafico (font, simbolo, colore tema)', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 10. SOTTOCATEGORIE - REGALI E RINGRAZIAMENTI
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Lista regali o busta', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Biglietti di ringraziamento personalizzati', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Confezioni bomboniere', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Ringraziamenti' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Angolo dediche o guestbook', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 11. SOTTOCATEGORIE - TRASPORTI E LOGISTICA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Auto per il cresimando', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Spostamenti familiari / ospiti', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Parcheggi o permessi', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Trasporti e Logistica' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Eventuale pernottamento ospiti lontani', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 12. SOTTOCATEGORIE - SERVIZI EXTRA
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Musica di sottofondo o piccolo intrattenimento', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Animazione bambini (se presenti)', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Pulizia post-evento', 3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Servizi Extra' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Sicurezza o assistenza evento', 4
ON CONFLICT DO NOTHING;

-- =========================================
-- 13. SOTTOCATEGORIE - IMPREVISTI E CONTINGENZE
-- =========================================
INSERT INTO subcategories (category_id, name, sort)
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Fondo emergenze', 1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Spese extra impreviste', 2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Imprevisti e Contingenze' AND type_id=(SELECT id FROM event_types WHERE slug='confirmation')), 'Budget cuscinetto (10%)', 3
ON CONFLICT DO NOTHING;

-- =========================================
-- FINE SEED CRESIMA
-- =========================================

-- Verifica risultato
SELECT 
  et.name as event_type,
  c.name as category,
  COUNT(sc.id) as num_subcategories
FROM event_types et
JOIN categories c ON c.type_id = et.id
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE et.slug = 'confirmation'
GROUP BY et.name, c.name, c.sort
ORDER BY c.sort;
