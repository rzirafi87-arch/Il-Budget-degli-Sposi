-- =====================================================================
-- PATCH: Rende event_id nullable in categories e subcategories
-- =====================================================================
-- Questo permette di usare event_type_id al posto di event_id
-- per il nuovo sistema i18n event-type-centric

DO $$
BEGIN
  -- Rendi event_id nullable in categories
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'event_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.categories ALTER COLUMN event_id DROP NOT NULL;
    RAISE NOTICE '✅ categories.event_id ora è nullable';
  ELSE
    RAISE NOTICE 'ℹ️  categories.event_id già nullable o non esiste';
  END IF;

  -- Rendi name nullable in categories (per supportare solo translations)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'name'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.categories ALTER COLUMN name DROP NOT NULL;
    RAISE NOTICE '✅ categories.name ora è nullable';
  ELSE
    RAISE NOTICE 'ℹ️  categories.name già nullable o non esiste';
  END IF;

  -- Rendi name nullable in subcategories
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcategories'
      AND column_name = 'name'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.subcategories ALTER COLUMN name DROP NOT NULL;
    RAISE NOTICE '✅ subcategories.name ora è nullable';
  ELSE
    RAISE NOTICE 'ℹ️  subcategories.name già nullable o non esiste';
  END IF;

  -- Aggiungi event_type_id a categories se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'event_type_id'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Colonna event_type_id aggiunta a categories';
  ELSE
    RAISE NOTICE 'ℹ️  categories.event_type_id già esistente';
  END IF;

END$$;

-- Verifica finale
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'subcategories')
  AND column_name IN ('event_id', 'event_type_id', 'name')
ORDER BY table_name, column_name;
