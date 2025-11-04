-- ============================================================================
-- QUICK HEALTH CHECK
-- ============================================================================
-- Verifica rapida dello stato del database (esecuzione < 3 secondi)
-- Perfetto per check giornalieri o prima di deploy
-- Eseguibile direttamente nel SQL Editor di Supabase
-- ============================================================================

\timing on

-- ===========================================================================
-- SEZIONE 1: CONTEGGI RAPIDI
-- ===========================================================================

SELECT '🏥 QUICK HEALTH CHECK' as title, NOW()::timestamp as check_time;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Conteggi principali in una query
SELECT 
  (SELECT COUNT(*) FROM events) as eventi,
  (SELECT COUNT(*) FROM expenses) as spese,
  (SELECT COUNT(*) FROM incomes) as entrate,
  (SELECT COUNT(*) FROM suppliers) as fornitori,
  (SELECT COUNT(*) FROM locations) as location,
  (SELECT COUNT(*) FROM churches) as chiese,
  (SELECT COUNT(*) FROM subscription_packages) as packages,
  (SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active') as sub_attive;

-- ===========================================================================
-- SEZIONE 2: CHECK CRITICI
-- ===========================================================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '🔍 CHECK CRITICI' as section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Check 1: Orphan expenses
SELECT 
  '1. Expenses orfane' as check,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    WHEN COUNT(*) < 10 THEN '⚠️ WARNING'
    ELSE '❌ CRITICAL'
  END as status
FROM expenses e
LEFT JOIN events ev ON e.event_id = ev.id
WHERE ev.id IS NULL;

-- Check 2: Budget negativi
SELECT 
  '2. Budget negativi' as check,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ CRITICAL'
  END as status
FROM events
WHERE total_budget < 0 OR bride_initial_budget < 0 OR groom_initial_budget < 0;

-- Check 3: Spend_type invalidi
SELECT 
  '3. Spend_type invalidi' as check,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    ELSE '❌ CRITICAL'
  END as status
FROM expenses
WHERE spend_type NOT IN ('common', 'bride', 'groom');

-- Check 4: Subscriptions scadute attive
SELECT 
  '4. Subscriptions scadute attive' as check,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK'
    WHEN COUNT(*) < 5 THEN '⚠️ WARNING'
    ELSE '❌ CRITICAL'
  END as status
FROM user_subscriptions
WHERE status = 'active' AND end_date < CURRENT_DATE;

-- Check 5: RLS abilitato
SELECT 
  '5. RLS abilitato' as check,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ OK'
    ELSE '⚠️ WARNING'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = TRUE;

-- Check 6: Seed data presente
SELECT 
  '6. Seed data completo' as check,
  (SELECT COUNT(*) FROM suppliers) + 
  (SELECT COUNT(*) FROM locations) + 
  (SELECT COUNT(*) FROM churches) as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM suppliers) > 50 
     AND (SELECT COUNT(*) FROM locations) > 50 
     AND (SELECT COUNT(*) FROM churches) > 50 
    THEN '✅ OK'
    ELSE '⚠️ WARNING'
  END as status;

-- ===========================================================================
-- SEZIONE 3: ATTIVITÀ RECENTE
-- ===========================================================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '📈 ATTIVITÀ RECENTE (24h)' as section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

SELECT 
  (SELECT COUNT(*) FROM events WHERE created_at >= NOW() - INTERVAL '24 hours') as nuovi_eventi,
  (SELECT COUNT(*) FROM expenses WHERE created_at >= NOW() - INTERVAL '24 hours') as nuove_spese,
  (SELECT COUNT(*) FROM incomes WHERE created_at >= NOW() - INTERVAL '24 hours') as nuove_entrate,
  (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE created_at >= NOW() - INTERVAL '24 hours') as totale_speso_24h;

-- ===========================================================================
-- SEZIONE 4: TOP PROBLEMI (se presenti)
-- ===========================================================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '⚠️ TOP 5 PROBLEMI (se presenti)' as section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Eventi con budget zero
SELECT 
  '⚠ Eventi con budget = 0' as issue,
  COUNT(*) as affected_records
FROM events
WHERE total_budget = 0
HAVING COUNT(*) > 0;

-- Spese senza fornitore
SELECT 
  '⚠ Spese senza fornitore' as issue,
  COUNT(*) as affected_records
FROM expenses
WHERE (supplier_name IS NULL OR supplier_name = '')
AND amount > 100  -- Solo spese significative
HAVING COUNT(*) > 0;

-- Eventi senza spese (dopo 7 giorni dalla creazione)
SELECT 
  '⚠ Eventi senza spese (>7gg)' as issue,
  COUNT(*) as affected_records
FROM events e
WHERE created_at < NOW() - INTERVAL '7 days'
AND NOT EXISTS (SELECT 1 FROM expenses WHERE event_id = e.id)
HAVING COUNT(*) > 0;

-- Spese duplicate (stesso importo, fornitore, data)
SELECT 
  '⚠ Possibili spese duplicate' as issue,
  COUNT(*) / 2 as affected_records  -- Diviso 2 perché conta entrambe le copie
FROM (
  SELECT amount, supplier_name, DATE(created_at), COUNT(*)
  FROM expenses
  WHERE supplier_name IS NOT NULL
  GROUP BY amount, supplier_name, DATE(created_at)
  HAVING COUNT(*) > 1
) dups
HAVING COUNT(*) > 0;

-- Subscriptions in scadenza nei prossimi 3 giorni
SELECT 
  '⚠ Subscriptions in scadenza (3gg)' as issue,
  COUNT(*) as affected_records
FROM user_subscriptions
WHERE status = 'active'
AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
HAVING COUNT(*) > 0;

-- ===========================================================================
-- SEZIONE 5: PERFORMANCE SNAPSHOT
-- ===========================================================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;
SELECT '⚡ PERFORMANCE SNAPSHOT' as section;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

-- Dimensioni tabelle principali
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('events', 'expenses', 'incomes', 'suppliers', 'locations', 'churches')
ORDER BY pg_total_relation_size('public.' || tablename) DESC;

-- Numero indici
SELECT 
  COUNT(*) as total_indexes,
  COUNT(DISTINCT tablename) as tables_with_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- ===========================================================================
-- RIEPILOGO FINALE
-- ===========================================================================

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator;

DO $$
DECLARE
  v_critical INT := 0;
  v_warnings INT := 0;
  v_health_score INT;
BEGIN
  -- Conta problemi critici
  SELECT COUNT(*) INTO v_critical FROM (
    SELECT 1 FROM expenses e LEFT JOIN events ev ON e.event_id = ev.id WHERE ev.id IS NULL
    UNION ALL
    SELECT 1 FROM events WHERE total_budget < 0
    UNION ALL
    SELECT 1 FROM expenses WHERE spend_type NOT IN ('common', 'bride', 'groom')
  ) critical_issues;
  
  -- Conta warnings
  SELECT COUNT(*) INTO v_warnings FROM (
    SELECT 1 FROM user_subscriptions WHERE status = 'active' AND end_date < CURRENT_DATE
    UNION ALL
    SELECT 1 FROM events WHERE total_budget = 0
  ) warning_issues;
  
  -- Calcola health score (0-100)
  v_health_score := 100 - (v_critical * 10) - (v_warnings * 2);
  IF v_health_score < 0 THEN v_health_score := 0; END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                    HEALTH CHECK SUMMARY                       ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════════════════════╣';
  RAISE NOTICE '║ Health Score: %/100                                         ║', LPAD(v_health_score::text, 3, ' ');
  RAISE NOTICE '║ Critical Issues: %                                            ║', LPAD(v_critical::text, 2, ' ');
  RAISE NOTICE '║ Warnings: %                                                   ║', LPAD(v_warnings::text, 2, ' ');
  RAISE NOTICE '╠═══════════════════════════════════════════════════════════════╣';
  
  IF v_health_score >= 90 THEN
    RAISE NOTICE '║ Status: ✅ EXCELLENT - Database in optimal condition         ║';
  ELSIF v_health_score >= 70 THEN
    RAISE NOTICE '║ Status: ✅ GOOD - Minor issues detected                      ║';
  ELSIF v_health_score >= 50 THEN
    RAISE NOTICE '║ Status: ⚠️  WARNING - Action recommended                     ║';
  ELSE
    RAISE NOTICE '║ Status: ❌ CRITICAL - Immediate attention required           ║';
  END IF;
  
  RAISE NOTICE '╚═══════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  
  IF v_critical > 0 THEN
    RAISE NOTICE '🔴 ACTION REQUIRED: Fix critical issues immediately!';
  ELSIF v_warnings > 0 THEN
    RAISE NOTICE '🟡 ATTENTION: Review warnings when possible.';
  ELSE
    RAISE NOTICE '🟢 ALL CLEAR: No issues detected. Database healthy!';
  END IF;
  
END $$;

\timing off
