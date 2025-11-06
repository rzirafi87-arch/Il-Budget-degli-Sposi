-- =====================================================================
-- PATCH SEMPLIFICATO: Forza nullable su event_id e name
-- =====================================================================
-- Versione diretta senza controlli condizionali

-- Categories
ALTER TABLE public.categories ALTER COLUMN event_id DROP NOT NULL;
ALTER TABLE public.categories ALTER COLUMN name DROP NOT NULL;

-- Subcategories
ALTER TABLE public.subcategories ALTER COLUMN name DROP NOT NULL;

-- Aggiungi event_type_id se non esiste (con gestione errore)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'event_type_id'
  ) THEN
    ALTER TABLE public.categories
    ADD COLUMN event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Verifica
SELECT
  table_name,
  column_name,
  is_nullable,
  CASE WHEN is_nullable = 'NO' THEN '❌ NOT NULL' ELSE '✅ OK' END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'subcategories')
  AND column_name IN ('event_id', 'event_type_id', 'name')
ORDER BY table_name, column_name;
