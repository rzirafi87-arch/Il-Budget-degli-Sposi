-- =====================================================================
-- VERIFICA: Controlla quali colonne sono ancora NOT NULL
-- =====================================================================

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  CASE WHEN is_nullable = 'NO' THEN '❌ NOT NULL' ELSE '✅ Nullable' END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'subcategories')
  AND column_name IN ('event_id', 'event_type_id', 'name')
ORDER BY table_name, column_name;
