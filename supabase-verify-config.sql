-- ============================================================================
-- VERIFICA CONFIGURAZIONE DATABASE
-- ============================================================================
-- Questo script può essere eseguito direttamente nel SQL Editor di Supabase
-- per verificare che tutto sia configurato correttamente
-- ============================================================================

DO $$
DECLARE
  v_result TEXT := '';
  v_count INT;
  v_ok BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '=== VERIFICA CONFIGURAZIONE DATABASE ===';
  RAISE NOTICE '';
  
  -- 1. Verifica esistenza tabelle principali
  RAISE NOTICE '1. VERIFICA TABELLE PRINCIPALI:';
  
  FOR v_count IN 
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('events', 'categories', 'subcategories', 'expenses', 'incomes', 
                       'suppliers', 'locations', 'churches', 'wedding_cards', 
                       'subscription_packages', 'user_subscriptions')
  LOOP
    RAISE NOTICE '   ✓ Trovate % tabelle principali', v_count;
    IF v_count < 11 THEN
      RAISE WARNING '   ⚠ Mancano % tabelle!', 11 - v_count;
      v_ok := FALSE;
    END IF;
  END LOOP;
  
  -- 2. Verifica RLS abilitato
  RAISE NOTICE '';
  RAISE NOTICE '2. VERIFICA ROW LEVEL SECURITY (RLS):';
  
  FOR v_count IN
    SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = TRUE
  LOOP
    RAISE NOTICE '   ✓ RLS abilitato su % tabelle', v_count;
  END LOOP;
  
  -- 3. Verifica policies esistenti
  RAISE NOTICE '';
  RAISE NOTICE '3. VERIFICA POLICIES:';
  
  SELECT COUNT(*) INTO v_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '   ✓ Trovate % policies', v_count;
  IF v_count < 10 THEN
    RAISE WARNING '   ⚠ Potrebbero mancare policies importanti!';
    v_ok := FALSE;
  END IF;
  
  -- 4. Verifica funzioni stored procedures
  RAISE NOTICE '';
  RAISE NOTICE '4. VERIFICA STORED PROCEDURES:';
  
  SELECT COUNT(*) INTO v_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND p.proname IN ('seed_full_event', 'get_budget_summary', 'calculate_balance');
  
  RAISE NOTICE '   ✓ Trovate % funzioni principali', v_count;
  IF v_count < 2 THEN
    RAISE WARNING '   ⚠ Mancano funzioni di seed!';
    v_ok := FALSE;
  END IF;
  
  -- 5. Verifica dati di seed (suppliers, locations, churches)
  RAISE NOTICE '';
  RAISE NOTICE '5. VERIFICA DATI DI SEED:';
  
  SELECT COUNT(*) INTO v_count FROM suppliers;
  RAISE NOTICE '   • Fornitori: %', v_count;
  IF v_count = 0 THEN
    RAISE WARNING '   ⚠ Nessun fornitore trovato! Eseguire seed degli suppliers.';
    v_ok := FALSE;
  END IF;
  
  SELECT COUNT(*) INTO v_count FROM locations;
  RAISE NOTICE '   • Location: %', v_count;
  IF v_count = 0 THEN
    RAISE WARNING '   ⚠ Nessuna location trovata! Eseguire seed delle locations.';
    v_ok := FALSE;
  END IF;
  
  SELECT COUNT(*) INTO v_count FROM churches;
  RAISE NOTICE '   • Chiese: %', v_count;
  IF v_count = 0 THEN
    RAISE WARNING '   ⚠ Nessuna chiesa trovata! Eseguire seed delle chiese.';
    v_ok := FALSE;
  END IF;
  
  -- 6. Verifica subscription packages
  RAISE NOTICE '';
  RAISE NOTICE '6. VERIFICA SUBSCRIPTION PACKAGES:';
  
  SELECT COUNT(*) INTO v_count FROM subscription_packages;
  RAISE NOTICE '   • Pacchetti: %', v_count;
  IF v_count = 0 THEN
    RAISE WARNING '   ⚠ Nessun pacchetto subscription trovato!';
    v_ok := FALSE;
  END IF;
  
  -- 7. Verifica colonne importanti
  RAISE NOTICE '';
  RAISE NOTICE '7. VERIFICA COLONNE CHIAVE:';
  
  -- Verifica colonne events
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'events'
  AND column_name IN ('total_budget', 'bride_initial_budget', 'groom_initial_budget', 'event_type');
  
  IF v_count = 4 THEN
    RAISE NOTICE '   ✓ Tabella events completa';
  ELSE
    RAISE WARNING '   ⚠ Mancano colonne in tabella events!';
    v_ok := FALSE;
  END IF;
  
  -- Verifica colonne expenses
  SELECT COUNT(*) INTO v_count
  FROM information_schema.columns
  WHERE table_name = 'expenses'
  AND column_name IN ('spend_type', 'amount', 'supplier_name');
  
  IF v_count = 3 THEN
    RAISE NOTICE '   ✓ Tabella expenses completa';
  ELSE
    RAISE WARNING '   ⚠ Mancano colonne in tabella expenses!';
    v_ok := FALSE;
  END IF;
  
  -- RISULTATO FINALE
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  IF v_ok THEN
    RAISE NOTICE '✅ VERIFICA COMPLETATA: Database configurato correttamente!';
  ELSE
    RAISE WARNING '⚠️ VERIFICA FALLITA: Alcuni elementi mancanti o non configurati correttamente.';
    RAISE NOTICE 'Eseguire gli script di setup e seed necessari.';
  END IF;
  RAISE NOTICE '===========================================';
  
END $$;

-- Lista dettagliata delle tabelle esistenti
SELECT 
  'Tabelle esistenti:' as info,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as num_columns
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
