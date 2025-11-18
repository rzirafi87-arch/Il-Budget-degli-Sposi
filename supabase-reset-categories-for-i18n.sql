-- ============================================================================
-- RESET CATEGORIE I18N (SCENARIO B)
-- ============================================================================
-- Scopo:
--   * Eliminare categorie, sottocategorie e relative traduzioni del template
--     globale (utile se i dati correnti sono solo di test)
--   * Lascia intatte eventuali tabelle legacy per-evento
--
-- Utilizzo:
--   * Esegui nel SQL Editor Supabase oppure con scripts/run-sql.mjs
--   * Dopo il reset lancia nuovamente il seed (es. npm run seed:i18n)
-- ============================================================================

DO $$
DECLARE
  v_categories_table text;
  v_subcategories_table text;
  v_category_translations_table text;
  v_subcategory_translations_table text;
  v_selection_table text;
  v_categories_deleted integer := 0;
  v_subcategories_deleted integer := 0;
  v_cat_trans_deleted integer := 0;
  v_sub_trans_deleted integer := 0;
  v_selection_deleted integer := 0;
  v_remaining_categories integer := 0;
  v_remaining_subcategories integer := 0;
BEGIN
  -- 1) Rileva tabella categorie template
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'categories'
               AND column_name IN ('event_type_id', 'type_id')
           ) THEN 'public.categories'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_categories'
               AND column_name = 'event_type_id'
           ) THEN 'public.event_type_categories'
         END
    INTO v_categories_table;

  IF v_categories_table IS NULL THEN
    RAISE NOTICE 'Nessuna tabella categorie template trovata: nulla da resettare.';
    RETURN;
  END IF;

  -- 2) Tabelle collegate
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'subcategories'
               AND column_name = 'category_id'
           ) THEN 'public.subcategories'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_subcategories'
               AND column_name = 'category_id'
           ) THEN 'public.event_type_subcategories'
         END
    INTO v_subcategories_table;

  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'category_translations'
               AND column_name = 'category_id'
           ) THEN 'public.category_translations'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_category_translations'
               AND column_name = 'category_id'
           ) THEN 'public.event_type_category_translations'
         END
    INTO v_category_translations_table;

  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'subcategory_translations'
               AND column_name = 'subcategory_id'
           ) THEN 'public.subcategory_translations'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_subcategory_translations'
               AND column_name = 'subcategory_id'
           ) THEN 'public.event_type_subcategory_translations'
         END
    INTO v_subcategory_translations_table;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'event_category_selection'
  ) THEN
    v_selection_table := 'public.event_category_selection';
  END IF;

  -- 3) Cancellazioni rispettando dipendenze
  IF v_selection_table IS NOT NULL THEN
    EXECUTE format('WITH del AS (DELETE FROM %s RETURNING 1) SELECT count(*) FROM del', v_selection_table)
      INTO v_selection_deleted;
  END IF;

  IF v_subcategory_translations_table IS NOT NULL THEN
    EXECUTE format('WITH del AS (DELETE FROM %s RETURNING 1) SELECT count(*) FROM del', v_subcategory_translations_table)
      INTO v_sub_trans_deleted;
  END IF;

  IF v_subcategories_table IS NOT NULL THEN
    EXECUTE format('WITH del AS (DELETE FROM %s RETURNING 1) SELECT count(*) FROM del', v_subcategories_table)
      INTO v_subcategories_deleted;
  END IF;

  IF v_category_translations_table IS NOT NULL THEN
    EXECUTE format('WITH del AS (DELETE FROM %s RETURNING 1) SELECT count(*) FROM del', v_category_translations_table)
      INTO v_cat_trans_deleted;
  END IF;

  EXECUTE format('WITH del AS (DELETE FROM %s RETURNING 1) SELECT count(*) FROM del', v_categories_table)
    INTO v_categories_deleted;

  -- 4) Riepilogo post-reset
  EXECUTE format('SELECT COUNT(*) FROM %s', v_categories_table)
    INTO v_remaining_categories;

  IF v_subcategories_table IS NOT NULL THEN
    EXECUTE format('SELECT COUNT(*) FROM %s', v_subcategories_table)
      INTO v_remaining_subcategories;
  END IF;

  RAISE NOTICE 'Elementi eliminati -> selections: %, subcat_trans: %, subcategories: %, cat_trans: %, categories: %',
    v_selection_deleted, v_sub_trans_deleted, v_subcategories_deleted, v_cat_trans_deleted, v_categories_deleted;
  RAISE NOTICE 'Residuo categorie: %, residuo sottocategorie: %',
    v_remaining_categories, COALESCE(v_remaining_subcategories, 0);
END $$;
