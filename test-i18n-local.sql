-- Query di test per verificare traduzioni i18n dopo la migrazione locale
-- Esegui con: npm run sql:exec test-i18n-local.sql
-- oppure: docker exec -i il-budget-degli-sposi-db-1 psql -U postgres -d ibds < test-i18n-local.sql

\echo '==================================================================='
\echo '1. VERIFICA LOCALES'
\echo '==================================================================='
SELECT code, name, direction FROM i18n_locales ORDER BY code;

\echo ''
\echo '==================================================================='
\echo '2. VERIFICA GEO_COUNTRIES'
\echo '==================================================================='
SELECT code, default_locale FROM geo_countries ORDER BY code;

\echo ''
\echo '==================================================================='
\echo '3. VERIFICA EVENT_TYPES CON TRADUZIONI IT/EN'
\echo '==================================================================='
SELECT
  et.code,
  ett_it.name AS nome_it,
  ett_en.name AS nome_en,
  et.active
FROM event_types et
LEFT JOIN event_type_translations ett_it ON ett_it.event_type_id = et.id AND ett_it.locale = 'it-IT'
LEFT JOIN event_type_translations ett_en ON ett_en.event_type_id = et.id AND ett_en.locale = 'en-GB'
ORDER BY et.code;

\echo ''
\echo '==================================================================='
\echo '4. VERIFICA CATEGORIE WEDDING CON FALLBACK IT→EN'
\echo '==================================================================='
WITH et AS (SELECT id FROM event_types WHERE code = 'WEDDING')
SELECT
  c.id,
  c.sort,
  COALESCE(ct_it.name, ct_en.name, '(no translation)') AS nome,
  CASE
    WHEN ct_it.name IS NOT NULL THEN 'it-IT'
    WHEN ct_en.name IS NOT NULL THEN 'en-GB (fallback)'
    ELSE 'missing'
  END AS lingua_usata
FROM categories c
LEFT JOIN category_translations ct_it ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN category_translations ct_en ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM et)
ORDER BY c.sort;

\echo ''
\echo '==================================================================='
\echo '5. CONTA SOTTOCATEGORIE PER CATEGORIA (WEDDING)'
\echo '==================================================================='
WITH et AS (SELECT id FROM event_types WHERE code = 'WEDDING')
SELECT
  COALESCE(ct_it.name, ct_en.name) AS categoria,
  COUNT(sc.id) AS num_sottocategorie
FROM categories c
LEFT JOIN category_translations ct_it ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN category_translations ct_en ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE c.event_type_id = (SELECT id FROM et)
GROUP BY c.id, c.sort, ct_it.name, ct_en.name
ORDER BY c.sort;

\echo ''
\echo '==================================================================='
\echo '6. SAMPLE SOTTOCATEGORIE (Prime 10 con traduzioni)'
\echo '==================================================================='
SELECT
  COALESCE(ct_it.name, ct_en.name) AS categoria,
  COALESCE(sct_it.name, sct_en.name) AS sottocategoria,
  sc.sort
FROM subcategories sc
JOIN categories c ON c.id = sc.category_id
LEFT JOIN category_translations ct_it ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN category_translations ct_en ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
LEFT JOIN subcategory_translations sct_it ON sct_it.subcategory_id = sc.id AND sct_it.locale = 'it-IT'
LEFT JOIN subcategory_translations sct_en ON sct_en.subcategory_id = sc.id AND sct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING')
ORDER BY c.sort, sc.sort
LIMIT 10;

\echo ''
\echo '==================================================================='
\echo '7. VERIFICA TIMELINE WEDDING (Prime 5 milestone)'
\echo '==================================================================='
SELECT
  tl.key,
  tl.offset_days AS giorni_da_evento,
  COALESCE(tlt_it.title, tlt_en.title) AS titolo,
  LEFT(COALESCE(tlt_it.description, tlt_en.description), 50) AS descrizione_breve
FROM event_timelines tl
LEFT JOIN event_timeline_translations tlt_it ON tlt_it.timeline_id = tl.id AND tlt_it.locale = 'it-IT'
LEFT JOIN event_timeline_translations tlt_en ON tlt_en.timeline_id = tl.id AND tlt_en.locale = 'en-GB'
WHERE tl.event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING')
ORDER BY tl.offset_days
LIMIT 5;

\echo ''
\echo '==================================================================='
\echo '8. STATISTICHE TRADUZIONI'
\echo '==================================================================='
SELECT
  'category_translations' AS tabella,
  locale,
  COUNT(*) AS totale
FROM category_translations
GROUP BY locale
UNION ALL
SELECT
  'subcategory_translations',
  locale,
  COUNT(*)
FROM subcategory_translations
GROUP BY locale
UNION ALL
SELECT
  'event_timeline_translations',
  locale,
  COUNT(*)
FROM event_timeline_translations
GROUP BY locale
ORDER BY tabella, locale;

\echo ''
\echo '==================================================================='
\echo 'VERIFICA COMPLETATA'
\echo '==================================================================='
