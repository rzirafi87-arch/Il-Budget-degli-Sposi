-- ============================================================================
-- DIAGNOSTICA COMPLETA DATABASE
-- ============================================================================
-- Script diagnostico all-in-one per il SQL Editor di Supabase
-- Include: configurazione, dati, integrità, performance, security
-- ============================================================================

-- ===========================================================================
-- SEZIONE 1: INFORMAZIONI GENERALI DATABASE
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                   DIAGNOSTICA DATABASE                         ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Versione PostgreSQL
SELECT 
  'INFO: PostgreSQL Version' as check_type,
  version() as details;

-- Database corrente
SELECT 
  'INFO: Database Name' as check_type,
  current_database() as details;

-- User corrente
SELECT 
  'INFO: Current User' as check_type,
  current_user as details;

-- ===========================================================================
-- SEZIONE 2: STRUTTURA TABELLE
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                     STRUTTURA TABELLE                          ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Lista tabelle con conteggio righe
SELECT 
  t.table_name,
  (SELECT COUNT(*) 
   FROM information_schema.columns c 
   WHERE c.table_name = t.table_name 
   AND c.table_schema = 'public') as num_columns,
  pg_size_pretty(pg_total_relation_size('public.' || t.table_name)) as total_size,
  (xpath('/row/cnt/text()', 
    query_to_xml(format('SELECT COUNT(*) as cnt FROM %I', t.table_name), 
    false, true, '')))[1]::text::int as row_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- ===========================================================================
-- SEZIONE 3: VERIFICA SEED DATA
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                   VERIFICA DATI DI SEED                        ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Conteggio fornitori per tipo
SELECT 
  'Fornitori per tipo' as metric,
  provider_type,
  COUNT(*) as count
FROM suppliers
GROUP BY provider_type
ORDER BY count DESC;

-- Conteggio location per regione
SELECT 
  'Location per regione' as metric,
  region,
  COUNT(*) as count
FROM locations
GROUP BY region
ORDER BY count DESC
LIMIT 10;

-- Conteggio chiese per regione
SELECT 
  'Chiese per regione' as metric,
  region,
  COUNT(*) as count
FROM churches
GROUP BY region
ORDER BY count DESC
LIMIT 10;

-- Subscription packages
SELECT 
  'Subscription Packages' as metric,
  name,
  price,
  is_active
FROM subscription_packages
ORDER BY price;

-- ===========================================================================
-- SEZIONE 4: VERIFICA INTEGRITÀ REFERENZIALE
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '              INTEGRITÀ REFERENZIALE                            ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Orphan expenses
SELECT 
  'INTEGRITÀ' as check_type,
  'Expenses orfane (senza evento)' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM expenses e
LEFT JOIN events ev ON e.event_id = ev.id
WHERE ev.id IS NULL;

-- Orphan incomes
SELECT 
  'INTEGRITÀ' as check_type,
  'Incomes orfane (senza evento)' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM incomes i
LEFT JOIN events ev ON i.event_id = ev.id
WHERE ev.id IS NULL;

-- Orphan subcategories
SELECT 
  'INTEGRITÀ' as check_type,
  'Subcategories orfane (senza categoria)' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM subcategories s
LEFT JOIN categories c ON s.category_id = c.id
WHERE c.id IS NULL;

-- Orphan categories
SELECT 
  'INTEGRITÀ' as check_type,
  'Categories orfane (senza evento)' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM categories c
LEFT JOIN events e ON c.event_id = e.id
WHERE e.id IS NULL;

-- ===========================================================================
-- SEZIONE 5: VERIFICA VALORI
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                  VALIDAZIONE VALORI                            ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Spend_type non validi
SELECT 
  'VALIDAZIONE' as check_type,
  'Expenses con spend_type non valido' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM expenses
WHERE spend_type NOT IN ('common', 'bride', 'groom');

-- Event_type non validi
SELECT 
  'VALIDAZIONE' as check_type,
  'Events con event_type non valido' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM events
WHERE event_type NOT IN (
  'matrimonio', 'compleanno', 'anniversario', 'battesimo', 
  'comunione', 'cresima', 'laurea', 'pensione', 'diciottesimo',
  'cinquantesimo', 'engagement-party', 'baby-shower', 'gender-reveal'
);

-- Budget negativi
SELECT 
  'VALIDAZIONE' as check_type,
  'Events con budget negativo' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM events
WHERE total_budget < 0 OR bride_initial_budget < 0 OR groom_initial_budget < 0;

-- Amount negativi
SELECT 
  'VALIDAZIONE' as check_type,
  'Expenses con importo negativo' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✓ OK' ELSE '⚠ ATTENZIONE' END as status
FROM expenses
WHERE amount < 0;

-- ===========================================================================
-- SEZIONE 6: SECURITY & RLS
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '            ROW LEVEL SECURITY (RLS)                            ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Tabelle con RLS abilitato
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ Abilitato' ELSE '⚠ Disabilitato' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Policies attive
SELECT 
  'SECURITY' as check_type,
  'Policies configurate' as metric,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public';

-- Dettaglio policies
SELECT 
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================================================================
-- SEZIONE 7: PERFORMANCE & INDICI
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '              PERFORMANCE E INDICI                              ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Indici per tabella
SELECT 
  tablename,
  COUNT(*) as num_indexes,
  string_agg(indexname, ', ') as index_names
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Tabelle più grandi
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ===========================================================================
-- SEZIONE 8: STORED PROCEDURES
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '              STORED PROCEDURES E FUNZIONI                      ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- Lista funzioni pubbliche
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  t.typname as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_type t ON p.prorettype = t.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'  -- Solo funzioni, non procedure
ORDER BY p.proname;

-- ===========================================================================
-- RIEPILOGO FINALE
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                    RIEPILOGO FINALE                            ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

DO $$
DECLARE
  v_tables INT;
  v_policies INT;
  v_functions INT;
  v_suppliers INT;
  v_locations INT;
  v_churches INT;
  v_issues INT := 0;
BEGIN
  SELECT COUNT(*) INTO v_tables FROM information_schema.tables WHERE table_schema = 'public';
  SELECT COUNT(*) INTO v_policies FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO v_functions FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';
  SELECT COUNT(*) INTO v_suppliers FROM suppliers;
  SELECT COUNT(*) INTO v_locations FROM locations;
  SELECT COUNT(*) INTO v_churches FROM churches;
  
  -- Conta problemi
  SELECT COUNT(*) INTO v_issues FROM expenses e LEFT JOIN events ev ON e.event_id = ev.id WHERE ev.id IS NULL;
  
  RAISE NOTICE '📊 STATISTICHE DATABASE:';
  RAISE NOTICE '   • Tabelle: %', v_tables;
  RAISE NOTICE '   • Policies RLS: %', v_policies;
  RAISE NOTICE '   • Funzioni: %', v_functions;
  RAISE NOTICE '   • Fornitori: %', v_suppliers;
  RAISE NOTICE '   • Location: %', v_locations;
  RAISE NOTICE '   • Chiese: %', v_churches;
  RAISE NOTICE '';
  
  IF v_issues = 0 AND v_tables >= 10 AND v_policies >= 5 THEN
    RAISE NOTICE '✅ DATABASE HEALTHY: Configurazione ottimale!';
  ELSE
    RAISE NOTICE '⚠️ ATTENZIONE: Rilevati alcuni problemi. Verificare i dettagli sopra.';
  END IF;
END $$;
