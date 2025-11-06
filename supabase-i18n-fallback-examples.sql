-- =====================================================================
-- QUERY DI ESEMPIO: Categorie con fallback IT → EN
-- =====================================================================
-- Questa query mostra come ottenere nomi tradotti con fallback automatico.
-- Se la traduzione italiana non esiste, usa quella inglese.

-- ESEMPIO 1: Tutte le categorie WEDDING con traduzione IT (fallback EN)
WITH et AS (
  SELECT id FROM public.event_types WHERE code = 'WEDDING'
)
SELECT
  c.id,
  COALESCE(ct_it.name, ct_en.name) AS name,
  c.sort,
  c.icon,
  CASE
    WHEN ct_it.name IS NOT NULL THEN 'it-IT'
    WHEN ct_en.name IS NOT NULL THEN 'en-GB'
    ELSE 'missing'
  END AS locale_used
FROM public.categories c
LEFT JOIN public.category_translations ct_it
  ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN public.category_translations ct_en
  ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM et)
ORDER BY c.sort;

-- =====================================================================
-- ESEMPIO 2: Sottocategorie con fallback IT → EN
-- =====================================================================
WITH et AS (
  SELECT id FROM public.event_types WHERE code = 'WEDDING'
)
SELECT
  COALESCE(ct_it.name, ct_en.name) AS categoria,
  COALESCE(sct_it.name, sct_en.name) AS sottocategoria,
  sc.sort,
  sc.default_budget
FROM public.subcategories sc
JOIN public.categories c ON c.id = sc.category_id
LEFT JOIN public.category_translations ct_it
  ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN public.category_translations ct_en
  ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
LEFT JOIN public.subcategory_translations sct_it
  ON sct_it.subcategory_id = sc.id AND sct_it.locale = 'it-IT'
LEFT JOIN public.subcategory_translations sct_en
  ON sct_en.subcategory_id = sc.id AND sct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM et)
ORDER BY c.sort, sc.sort
LIMIT 20;

-- =====================================================================
-- ESEMPIO 3: Timeline con fallback IT → EN
-- =====================================================================
SELECT
  tl.key,
  tl.offset_days,
  COALESCE(tlt_it.title, tlt_en.title) AS titolo,
  COALESCE(tlt_it.description, tlt_en.description) AS descrizione,
  tl.is_critical
FROM public.event_timelines tl
LEFT JOIN public.event_timeline_translations tlt_it
  ON tlt_it.timeline_id = tl.id AND tlt_it.locale = 'it-IT'
LEFT JOIN public.event_timeline_translations tlt_en
  ON tlt_en.timeline_id = tl.id AND tlt_en.locale = 'en-GB'
WHERE tl.event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING')
ORDER BY tl.offset_days;

-- =====================================================================
-- ESEMPIO 4: Funzione helper per query parametriche (da usare in app)
-- =====================================================================
-- Crea una funzione che accetta locale e event_code come parametri:

CREATE OR REPLACE FUNCTION get_categories_translated(
  p_locale TEXT DEFAULT 'it-IT',
  p_event_code TEXT DEFAULT 'WEDDING'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sort INT,
  icon TEXT,
  locale_used TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH et AS (
    SELECT et.id FROM public.event_types et WHERE et.code = p_event_code
  )
  SELECT
    c.id,
    COALESCE(ct_user.name, ct_en.name, '(no translation)') AS name,
    c.sort,
    c.icon,
    CASE
      WHEN ct_user.name IS NOT NULL THEN p_locale
      WHEN ct_en.name IS NOT NULL THEN 'en-GB'
      ELSE 'missing'
    END AS locale_used
  FROM public.categories c
  LEFT JOIN public.category_translations ct_user
    ON ct_user.category_id = c.id AND ct_user.locale = p_locale
  LEFT JOIN public.category_translations ct_en
    ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
  WHERE c.event_type_id = (SELECT et.id FROM et)
  ORDER BY c.sort;
END;
$$ LANGUAGE plpgsql STABLE;

-- Uso:
-- SELECT * FROM get_categories_translated('it-IT', 'WEDDING');
-- SELECT * FROM get_categories_translated('en-GB', 'BIRTHDAY');
