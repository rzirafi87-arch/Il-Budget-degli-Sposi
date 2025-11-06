-- =====================================================================
-- FRESH START: Elimina categorie vecchie e riparti da zero con i18n
-- =====================================================================
-- ⚠️ ATTENZIONE: Questo eliminerà tutte le categorie esistenti!
-- Esegui SOLO se i dati attuali non sono importanti.

-- Backup preventivo (facoltativo)
-- CREATE TABLE categories_backup AS SELECT * FROM public.categories;
-- CREATE TABLE category_translations_backup AS SELECT * FROM public.category_translations;

DO $$
BEGIN
  -- Elimina tutte le categorie user-specific (event_id NOT NULL, event_type_id NULL)
  DELETE FROM public.categories
  WHERE event_id IS NOT NULL
    AND event_type_id IS NULL;

  RAISE NOTICE '✅ Categorie vecchie eliminate. Pronto per nuovo seed.';
END$$;

-- Verifica
SELECT COUNT(*) AS remaining_categories FROM public.categories;
