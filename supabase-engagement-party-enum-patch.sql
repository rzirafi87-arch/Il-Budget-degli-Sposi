-- =====================================================
-- PATCH: Aggiungi 'engagement-party' a enum event_type
-- =====================================================
-- Eseguire PRIMA di supabase-engagement-party-seed.sql
-- se l'enum event_type non include già 'engagement-party'
-- =====================================================

-- Verifica se il valore esiste già
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'engagement-party' 
    AND enumtypid = 'event_type'::regtype
  ) THEN
    -- Aggiungi il nuovo valore all'enum
    ALTER TYPE event_type ADD VALUE 'engagement-party';
    RAISE NOTICE 'Added engagement-party to event_type enum';
  ELSE
    RAISE NOTICE 'engagement-party already exists in event_type enum';
  END IF;
END $$;

-- Verifica l'aggiunta
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'event_type'::regtype
ORDER BY enumsortorder;
