-- =====================================================================
-- PATCH: Aggiunge colonne mancanti a event_timelines esistente
-- =====================================================================
-- Esegui questo script se event_timelines esiste già ma mancano le colonne

DO $$
BEGIN
  -- Aggiungi colonna key se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = 'key'
  ) THEN
    ALTER TABLE public.event_timelines ADD COLUMN key TEXT;
    RAISE NOTICE 'Colonna key aggiunta a event_timelines';
  END IF;

  -- Aggiungi colonna offset_days se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = 'offset_days'
  ) THEN
    ALTER TABLE public.event_timelines ADD COLUMN offset_days INT;
    RAISE NOTICE 'Colonna offset_days aggiunta a event_timelines';
  END IF;

  -- Aggiungi colonna sort_order se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.event_timelines ADD COLUMN sort_order INT DEFAULT 0;
    RAISE NOTICE 'Colonna sort_order aggiunta a event_timelines';
  END IF;

  -- Aggiungi colonna category se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.event_timelines ADD COLUMN category TEXT;
    RAISE NOTICE 'Colonna category aggiunta a event_timelines';
  END IF;

  -- Aggiungi colonna is_critical se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = 'is_critical'
  ) THEN
    ALTER TABLE public.event_timelines ADD COLUMN is_critical BOOLEAN DEFAULT false;
    RAISE NOTICE 'Colonna is_critical aggiunta a event_timelines';
  END IF;

  -- Rendi key e offset_days NOT NULL se esistono dati
  IF EXISTS (SELECT 1 FROM public.event_timelines LIMIT 1) THEN
    -- Se ci sono dati, popola key con un valore di default prima di renderlo NOT NULL
    UPDATE public.event_timelines SET key = 'milestone-' || id::text WHERE key IS NULL;
    UPDATE public.event_timelines SET offset_days = 0 WHERE offset_days IS NULL;
  END IF;

  -- Aggiungi NOT NULL constraint
  ALTER TABLE public.event_timelines ALTER COLUMN key SET NOT NULL;
  ALTER TABLE public.event_timelines ALTER COLUMN offset_days SET NOT NULL;

  RAISE NOTICE 'Constraints NOT NULL applicati a key e offset_days';

END$$;

-- Aggiungi UNIQUE constraint se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'event_timelines_event_type_id_key_key'
      AND conrelid = 'public.event_timelines'::regclass
  ) THEN
    ALTER TABLE public.event_timelines
    ADD CONSTRAINT event_timelines_event_type_id_key_key UNIQUE (event_type_id, key);
    RAISE NOTICE 'Constraint UNIQUE (event_type_id, key) aggiunto';
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    RAISE NOTICE 'Constraint UNIQUE già esistente';
END$$;

-- Crea indici se non esistono
CREATE INDEX IF NOT EXISTS idx_event_timelines_type_key ON public.event_timelines(event_type_id, key);
CREATE INDEX IF NOT EXISTS idx_event_timelines_offset ON public.event_timelines(event_type_id, offset_days);

-- Verifica finale
DO $$
DECLARE
  missing_cols TEXT[];
BEGIN
  SELECT ARRAY_AGG(col)
  INTO missing_cols
  FROM (
    SELECT unnest(ARRAY['key', 'offset_days', 'sort_order', 'category', 'is_critical']) AS col
  ) expected
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_timelines'
      AND column_name = expected.col
  );

  IF missing_cols IS NOT NULL THEN
    RAISE WARNING 'Colonne ancora mancanti: %', missing_cols;
  ELSE
    RAISE NOTICE '✅ Tutte le colonne necessarie sono presenti in event_timelines';
  END IF;
END$$;
