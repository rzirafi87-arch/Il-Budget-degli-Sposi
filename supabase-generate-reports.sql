-- ============================================================================
-- GENERA REPORT DATABASE (formato CSV-ready)
-- ============================================================================
-- Script per generare report esportabili da Supabase SQL Editor
-- Output ottimizzato per export CSV o copia/incolla in Excel
-- ============================================================================

-- ===========================================================================
-- REPORT 1: RIEPILOGO TABELLE
-- ===========================================================================

\echo '=== REPORT: Riepilogo Tabelle ==='

COPY (
  SELECT 
    t.table_name as "Tabella",
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as "Num Colonne",
    pg_size_pretty(pg_total_relation_size('public.' || t.table_name)) as "Dimensione Totale",
    COALESCE((
      SELECT to_char(COUNT(*)::numeric, '999,999,999') 
      FROM information_schema.tables 
      WHERE table_name = t.table_name
    ), '0') as "Righe (stima)"
  FROM information_schema.tables t
  WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size('public.' || t.table_name) DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 2: SEED DATA SUMMARY
-- ===========================================================================

\echo ''
\echo '=== REPORT: Seed Data Summary ==='

COPY (
  SELECT 
    'Fornitori' as "Tipo Seed",
    provider_type as "Categoria",
    COUNT(*) as "Conteggio",
    COUNT(DISTINCT city) as "Città Diverse",
    COUNT(DISTINCT region) as "Regioni Diverse"
  FROM suppliers
  GROUP BY provider_type
  
  UNION ALL
  
  SELECT 
    'Location',
    venue_type,
    COUNT(*),
    COUNT(DISTINCT city),
    COUNT(DISTINCT region)
  FROM locations
  GROUP BY venue_type
  
  UNION ALL
  
  SELECT 
    'Chiese',
    'N/A',
    COUNT(*),
    COUNT(DISTINCT city),
    COUNT(DISTINCT region)
  FROM churches
  
  ORDER BY "Tipo Seed", "Conteggio" DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 3: EVENTI PER TIPO
-- ===========================================================================

\echo ''
\echo '=== REPORT: Eventi per Tipo ==='

COPY (
  SELECT 
    event_type as "Tipo Evento",
    COUNT(*) as "Num Eventi",
    ROUND(AVG(total_budget), 2) as "Budget Medio",
    SUM(total_budget) as "Budget Totale",
    MIN(event_date) as "Prima Data",
    MAX(event_date) as "Ultima Data"
  FROM events
  GROUP BY event_type
  ORDER BY "Num Eventi" DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 4: SPESE PER CATEGORIA (TOP 20)
-- ===========================================================================

\echo ''
\echo '=== REPORT: Top 20 Categorie di Spesa ==='

COPY (
  SELECT 
    c.name as "Categoria",
    COUNT(e.id) as "Num Spese",
    SUM(e.amount) as "Totale Speso",
    ROUND(AVG(e.amount), 2) as "Media per Spesa",
    COUNT(DISTINCT e.event_id) as "Eventi Coinvolti"
  FROM expenses e
  JOIN subcategories s ON e.subcategory_id = s.id
  JOIN categories c ON s.category_id = c.id
  GROUP BY c.name
  ORDER BY "Totale Speso" DESC
  LIMIT 20
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 5: FORNITORI PIÙ UTILIZZATI
-- ===========================================================================

\echo ''
\echo '=== REPORT: Top 30 Fornitori ==='

COPY (
  SELECT 
    supplier_name as "Fornitore",
    COUNT(*) as "Num Utilizzi",
    SUM(amount) as "Totale Fatturato",
    ROUND(AVG(amount), 2) as "Valore Medio",
    COUNT(DISTINCT event_id) as "Clienti Diversi"
  FROM expenses
  WHERE supplier_name IS NOT NULL AND supplier_name != ''
  GROUP BY supplier_name
  ORDER BY "Num Utilizzi" DESC
  LIMIT 30
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 6: SUBSCRIPTIONS STATUS
-- ===========================================================================

\echo ''
\echo '=== REPORT: Subscriptions Overview ==='

COPY (
  SELECT 
    sp.name as "Pacchetto",
    sp.price as "Prezzo",
    COUNT(us.id) as "Sottoscrizioni Totali",
    COUNT(CASE WHEN us.status = 'active' THEN 1 END) as "Attive",
    COUNT(CASE WHEN us.status = 'expired' THEN 1 END) as "Scadute",
    COUNT(CASE WHEN us.status = 'cancelled' THEN 1 END) as "Cancellate",
    SUM(CASE WHEN us.status = 'active' THEN sp.price ELSE 0 END) as "Revenue Attivo"
  FROM subscription_packages sp
  LEFT JOIN user_subscriptions us ON sp.id = us.package_id
  GROUP BY sp.id, sp.name, sp.price
  ORDER BY "Sottoscrizioni Totali" DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 7: ATTIVITÀ PER MESE (ULTIMO ANNO)
-- ===========================================================================

\echo ''
\echo '=== REPORT: Attività Mensile (Ultimo Anno) ==='

COPY (
  SELECT 
    TO_CHAR(created_at, 'YYYY-MM') as "Mese",
    COUNT(DISTINCT event_id) as "Eventi",
    COUNT(*) as "Spese",
    SUM(amount) as "Totale Speso",
    COUNT(DISTINCT supplier_name) as "Fornitori Unici"
  FROM expenses
  WHERE created_at >= NOW() - INTERVAL '12 months'
  GROUP BY TO_CHAR(created_at, 'YYYY-MM')
  ORDER BY "Mese" DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 8: PROBLEMI RILEVATI
-- ===========================================================================

\echo ''
\echo '=== REPORT: Problemi Rilevati ==='

COPY (
  SELECT 
    'Expenses orfane' as "Tipo Problema",
    COUNT(*) as "Occorrenze",
    'CRITICAL' as "Severità"
  FROM expenses e
  LEFT JOIN events ev ON e.event_id = ev.id
  WHERE ev.id IS NULL
  
  UNION ALL
  
  SELECT 
    'Budget negativi',
    COUNT(*),
    'CRITICAL'
  FROM events
  WHERE total_budget < 0 OR bride_initial_budget < 0 OR groom_initial_budget < 0
  
  UNION ALL
  
  SELECT 
    'Spend_type invalidi',
    COUNT(*),
    'CRITICAL'
  FROM expenses
  WHERE spend_type NOT IN ('common', 'bride', 'groom')
  
  UNION ALL
  
  SELECT 
    'Subscriptions scadute attive',
    COUNT(*),
    'WARNING'
  FROM user_subscriptions
  WHERE status = 'active' AND end_date < CURRENT_DATE
  
  UNION ALL
  
  SELECT 
    'Eventi senza spese (>7gg)',
    COUNT(*),
    'WARNING'
  FROM events e
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (SELECT 1 FROM expenses WHERE event_id = e.id)
  
  UNION ALL
  
  SELECT 
    'Spese senza fornitore (>€100)',
    COUNT(*),
    'INFO'
  FROM expenses
  WHERE (supplier_name IS NULL OR supplier_name = '')
  AND amount > 100
  
  ORDER BY 
    CASE "Severità"
      WHEN 'CRITICAL' THEN 1
      WHEN 'WARNING' THEN 2
      ELSE 3
    END,
    "Occorrenze" DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 9: STATISTICHE RLS & SECURITY
-- ===========================================================================

\echo ''
\echo '=== REPORT: Security Overview ==='

COPY (
  SELECT 
    t.tablename as "Tabella",
    CASE WHEN t.rowsecurity THEN 'Abilitato' ELSE 'Disabilitato' END as "RLS Status",
    COALESCE(p.num_policies, 0) as "Num Policies",
    COALESCE(i.num_indexes, 0) as "Num Indici"
  FROM pg_tables t
  LEFT JOIN (
    SELECT tablename, COUNT(*) as num_policies
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) p ON t.tablename = p.tablename
  LEFT JOIN (
    SELECT tablename, COUNT(*) as num_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    GROUP BY tablename
  ) i ON t.tablename = i.tablename
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- REPORT 10: PERFORMANCE METRICS
-- ===========================================================================

\echo ''
\echo '=== REPORT: Performance Metrics ==='

COPY (
  SELECT 
    schemaname as "Schema",
    tablename as "Tabella",
    n_live_tup as "Righe Live",
    n_dead_tup as "Righe Dead",
    n_tup_ins as "Insert Count",
    n_tup_upd as "Update Count",
    n_tup_del as "Delete Count",
    last_vacuum as "Ultimo Vacuum",
    last_autovacuum as "Ultimo Autovacuum",
    last_analyze as "Ultimo Analyze"
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY n_live_tup DESC
) TO STDOUT WITH CSV HEADER;

-- ===========================================================================
-- RIEPILOGO FINALE
-- ===========================================================================

\echo ''
\echo '=== REPORT COMPLETATO ==='
\echo 'Tutti i report sono stati generati in formato CSV.'
\echo 'Per salvare: Esegui questo script con psql e redirigi output a file:'
\echo '  psql <connection_string> -f supabase-generate-reports.sql > reports.csv'
\echo ''
\echo 'Oppure copia i risultati dal pannello Results di Supabase SQL Editor.'
