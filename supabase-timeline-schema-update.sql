-- =====================================================
-- AGGIORNAMENTO SCHEMA TIMELINE_ITEMS
-- =====================================================
-- Migrazione da schema con due_date a schema con phase + days_before
-- Sicuro da eseguire: usa IF NOT EXISTS
-- =====================================================

BEGIN;

-- 1. Aggiungi nuove colonne se non esistono
ALTER TABLE timeline_items 
  ADD COLUMN IF NOT EXISTS phase TEXT,
  ADD COLUMN IF NOT EXISTS days_before INT;

-- 2. Rimuovi colonna obsoleta due_date (se esiste)
-- ATTENZIONE: Commenta questa riga se hai dati utente da preservare
-- ALTER TABLE timeline_items DROP COLUMN IF EXISTS due_date;

-- 3. Commenta per preservare dati esistenti
COMMENT ON COLUMN timeline_items.phase IS 'Descrizione fase temporale (es: "2 mesi prima", "1 settimana prima", "Giorno dell''evento")';
COMMENT ON COLUMN timeline_items.days_before IS 'Giorni prima dell''evento (positivo) o dopo (negativo). Es: 90 = 3 mesi prima, 0 = giorno evento, -7 = 1 settimana dopo';

-- 4. Indici per performance
CREATE INDEX IF NOT EXISTS idx_timeline_items_event_id ON timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_days_before ON timeline_items(days_before);
CREATE INDEX IF NOT EXISTS idx_timeline_items_phase ON timeline_items(phase);

COMMIT;

-- Verifica struttura aggiornata
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'timeline_items'
ORDER BY ordinal_position;
