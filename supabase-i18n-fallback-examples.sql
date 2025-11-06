-- Example: categories_with_names(locale, event_code)
-- Usage: set $1 = desired locale (e.g., 'it-IT'), $2 = event code (e.g., 'WEDDING')
WITH et AS (
  SELECT id FROM public.event_types WHERE code = $2
)
SELECT
  c.id,
  COALESCE(ct_it.name, ct_en.name) AS name,
  c.sort
FROM public.categories c
LEFT JOIN public.category_translations ct_it
  ON ct_it.category_id = c.id AND ct_it.locale = $1
LEFT JOIN public.category_translations ct_en
  ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM et)
ORDER BY c.sort;

-- Similar pattern applies to subcategory_translations and event_timeline_translations
