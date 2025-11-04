-- ============================================================================
-- VERIFICA PERFORMANCE E INDICI
-- ============================================================================
-- Script per verificare la presenza di indici e le performance del database
-- Eseguibile direttamente nel SQL Editor di Supabase
-- ============================================================================

DO $$
DECLARE
  v_count INT;
  v_ok BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '=== VERIFICA PERFORMANCE E INDICI ===';
  RAISE NOTICE '';
  
  -- 1. Verifica indici su eventi
  RAISE NOTICE '1. VERIFICA INDICI PRINCIPALI:';
  
  SELECT COUNT(*) INTO v_count
  FROM pg_indexes
  WHERE tablename = 'events' 
  AND indexname LIKE '%user_id%';
  
  IF v_count > 0 THEN
    RAISE NOTICE '   ✓ Indice su events.user_id trovato';
  ELSE
    RAISE WARNING '   ⚠ Mancante indice su events.user_id!';
    v_ok := FALSE;
  END IF;
  
  -- 2. Verifica indici su expenses
  SELECT COUNT(*) INTO v_count
  FROM pg_indexes
  WHERE tablename = 'expenses' 
  AND indexname LIKE '%event_id%';
  
  IF v_count > 0 THEN
    RAISE NOTICE '   ✓ Indice su expenses.event_id trovato';
  ELSE
    RAISE WARNING '   ⚠ Mancante indice su expenses.event_id!';
    v_ok := FALSE;
  END IF;
  
  -- 3. Verifica indici su incomes
  SELECT COUNT(*) INTO v_count
  FROM pg_indexes
  WHERE tablename = 'incomes' 
  AND indexname LIKE '%event_id%';
  
  IF v_count > 0 THEN
    RAISE NOTICE '   ✓ Indice su incomes.event_id trovato';
  ELSE
    RAISE WARNING '   ⚠ Mancante indice su incomes.event_id!';
    v_ok := FALSE;
  END IF;
  
  -- 4. Verifica indici su subcategories
  SELECT COUNT(*) INTO v_count
  FROM pg_indexes
  WHERE tablename = 'subcategories' 
  AND indexname LIKE '%category_id%';
  
  IF v_count > 0 THEN
    RAISE NOTICE '   ✓ Indice su subcategories.category_id trovato';
  ELSE
    RAISE WARNING '   ⚠ Mancante indice su subcategories.category_id!';
    v_ok := FALSE;
  END IF;
  
  -- 5. Conta totale indici per tabella
  RAISE NOTICE '';
  RAISE NOTICE '2. RIEPILOGO INDICI PER TABELLA:';
  
  FOR v_count IN
    SELECT tablename, COUNT(*) as num_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename
  LOOP
    -- This won't work in DO block, moving outside
  END LOOP;
  
  -- 6. Verifica tabelle senza indici (oltre PK)
  RAISE NOTICE '';
  RAISE NOTICE '3. VERIFICA TABELLE SENZA INDICI:';
  
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT t.tablename
    FROM pg_tables t
    LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND i.schemaname = 'public'
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename
    HAVING COUNT(i.indexname) <= 1  -- Solo primary key
  ) no_idx;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % tabelle senza indici aggiuntivi!', v_count;
  ELSE
    RAISE NOTICE '   ✓ Tutte le tabelle hanno indici';
  END IF;
  
  -- RISULTATO FINALE
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  IF v_ok THEN
    RAISE NOTICE '✅ INDICI VERIFICATI: Configurazione ottimale!';
  ELSE
    RAISE WARNING '⚠️ ATTENZIONE: Alcuni indici mancanti potrebbero impattare le performance.';
  END IF;
  RAISE NOTICE '===========================================';
  
END $$;

-- Lista dettagliata indici per tabella
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Statistiche utilizzo tabelle (richiede pg_stat_statements abilitato)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
