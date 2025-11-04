-- ============================================================================
-- VERIFICA INTEGRITÀ DATI
-- ============================================================================
-- Script per verificare l'integrità dei dati e le relazioni tra tabelle
-- Eseguibile direttamente nel SQL Editor di Supabase
-- ============================================================================

DO $$
DECLARE
  v_count INT;
  v_ok BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '=== VERIFICA INTEGRITÀ DATI ===';
  RAISE NOTICE '';
  
  -- 1. Verifica orphan records (expenses senza evento)
  RAISE NOTICE '1. VERIFICA ORPHAN RECORDS:';
  
  SELECT COUNT(*) INTO v_count
  FROM expenses e
  LEFT JOIN events ev ON e.event_id = ev.id
  WHERE ev.id IS NULL;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % spese senza evento associato!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessuna spesa orfana';
  END IF;
  
  -- 2. Verifica orphan incomes
  SELECT COUNT(*) INTO v_count
  FROM incomes i
  LEFT JOIN events ev ON i.event_id = ev.id
  WHERE ev.id IS NULL;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % entrate senza evento associato!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessuna entrata orfana';
  END IF;
  
  -- 3. Verifica subcategories senza category
  SELECT COUNT(*) INTO v_count
  FROM subcategories s
  LEFT JOIN categories c ON s.category_id = c.id
  WHERE c.id IS NULL;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % sottocategorie senza categoria!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessuna sottocategoria orfana';
  END IF;
  
  -- 4. Verifica spend_type validi
  RAISE NOTICE '';
  RAISE NOTICE '2. VERIFICA VALORI SPEND_TYPE:';
  
  SELECT COUNT(*) INTO v_count
  FROM expenses
  WHERE spend_type NOT IN ('common', 'bride', 'groom');
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % spese con spend_type non valido!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Tutti gli spend_type sono validi';
  END IF;
  
  -- 5. Verifica event_type validi
  RAISE NOTICE '';
  RAISE NOTICE '3. VERIFICA EVENT_TYPE:';
  
  SELECT COUNT(*) INTO v_count
  FROM events
  WHERE event_type NOT IN (
    'matrimonio', 'compleanno', 'anniversario', 'battesimo', 
    'comunione', 'cresima', 'laurea', 'pensione', 'diciottesimo',
    'cinquantesimo', 'engagement-party', 'baby-shower', 'gender-reveal'
  );
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovati % eventi con event_type non valido!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Tutti gli event_type sono validi';
  END IF;
  
  -- 6. Verifica budget negativi
  RAISE NOTICE '';
  RAISE NOTICE '4. VERIFICA BUDGET NEGATIVI:';
  
  SELECT COUNT(*) INTO v_count
  FROM events
  WHERE total_budget < 0 OR bride_initial_budget < 0 OR groom_initial_budget < 0;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovati % eventi con budget negativi!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessun budget negativo';
  END IF;
  
  -- 7. Verifica amount negativi
  SELECT COUNT(*) INTO v_count
  FROM expenses
  WHERE amount < 0;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % spese con importo negativo!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessuna spesa negativa';
  END IF;
  
  -- 8. Verifica user_subscriptions scadute attive
  RAISE NOTICE '';
  RAISE NOTICE '5. VERIFICA SUBSCRIPTIONS:';
  
  SELECT COUNT(*) INTO v_count
  FROM user_subscriptions
  WHERE status = 'active' AND end_date < CURRENT_DATE;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovate % subscriptions scadute ma ancora attive!', v_count;
    v_ok := FALSE;
  ELSE
    RAISE NOTICE '   ✓ Nessuna subscription scaduta attiva';
  END IF;
  
  -- 9. Verifica duplicati suppliers (stesso nome e città)
  RAISE NOTICE '';
  RAISE NOTICE '6. VERIFICA DUPLICATI:';
  
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT name, city, COUNT(*) 
    FROM suppliers 
    WHERE name IS NOT NULL AND city IS NOT NULL
    GROUP BY name, city 
    HAVING COUNT(*) > 1
  ) dups;
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovati % fornitori duplicati!', v_count;
  ELSE
    RAISE NOTICE '   ✓ Nessun fornitore duplicato';
  END IF;
  
  -- 10. Verifica provider_type validi
  RAISE NOTICE '';
  RAISE NOTICE '7. VERIFICA PROVIDER TYPES:';
  
  SELECT COUNT(*) INTO v_count
  FROM suppliers
  WHERE provider_type IS NOT NULL 
  AND provider_type NOT IN (
    'fotografo', 'fiorista', 'catering', 'location', 
    'musica', 'video', 'makeup', 'abiti', 'altro'
  );
  
  IF v_count > 0 THEN
    RAISE WARNING '   ⚠ Trovati % fornitori con provider_type non valido!', v_count;
  ELSE
    RAISE NOTICE '   ✓ Tutti i provider_type sono validi';
  END IF;
  
  -- RISULTATO FINALE
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  IF v_ok THEN
    RAISE NOTICE '✅ INTEGRITÀ VERIFICATA: Dati coerenti e validi!';
  ELSE
    RAISE WARNING '⚠️ PROBLEMI RILEVATI: Correggere le anomalie evidenziate.';
  END IF;
  RAISE NOTICE '===========================================';
  
END $$;

-- Query di dettaglio per problemi comuni
RAISE NOTICE '';
RAISE NOTICE 'QUERY DI SUPPORTO (decommentare per eseguire):';
RAISE NOTICE '';

-- -- Elenco expenses orfane
-- SELECT e.id, e.event_id, e.amount, e.description
-- FROM expenses e
-- LEFT JOIN events ev ON e.event_id = ev.id
-- WHERE ev.id IS NULL;

-- -- Elenco eventi con budget inconsistenti
-- SELECT id, event_type, total_budget, bride_initial_budget, groom_initial_budget
-- FROM events
-- WHERE total_budget < 0 OR bride_initial_budget < 0 OR groom_initial_budget < 0;

-- -- Fornitori duplicati
-- SELECT name, city, COUNT(*) as duplicates
-- FROM suppliers
-- GROUP BY name, city
-- HAVING COUNT(*) > 1;
