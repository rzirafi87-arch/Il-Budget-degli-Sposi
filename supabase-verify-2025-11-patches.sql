-- ================================================================
-- VERIFICA APPLICAZIONE PATCHES 2025-11 (PATCH 16-19)
-- ================================================================
-- Questo script verifica se i 4 patches critici sono stati applicati
-- su Supabase Cloud senza modificare il database.
--
-- Data creazione: 6 Novembre 2025
-- Scopo: Verificare PATCH 16-19 applicati correttamente
-- ================================================================

\echo '🔍 VERIFICA PATCHES 2025-11 (PATCH 16-19)'
\echo '=========================================='
\echo ''

-- ================================================================
-- PATCH 16: events.owner_id NOT NULL + RLS
-- ================================================================
\echo '📋 PATCH 16: Verifica colonna owner_id e RLS su events'
\echo '------------------------------------------------------'

-- Verifica 1: owner_id è NOT NULL?
SELECT 
    CASE 
        WHEN is_nullable = 'NO' THEN '✅ PASS: owner_id è NOT NULL'
        ELSE '❌ FAIL: owner_id accetta ancora NULL'
    END AS check_owner_id_not_null
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'events' 
  AND column_name = 'owner_id';

-- Verifica 2: RLS è abilitato su events?
SELECT 
    CASE 
        WHEN relrowsecurity THEN '✅ PASS: RLS abilitato su events'
        ELSE '❌ FAIL: RLS NON abilitato su events'
    END AS check_rls_enabled
FROM pg_class
WHERE relname = 'events' 
  AND relnamespace = 'public'::regnamespace;

-- Verifica 3: Policy "Users can view their own events" esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Policy "Users can view their own events" trovata'
        ELSE '❌ FAIL: Policy SELECT mancante'
    END AS check_select_policy
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'events' 
  AND policyname = 'Users can view their own events';

-- Verifica 4: Policy "Users can insert their own events" esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Policy "Users can insert their own events" trovata'
        ELSE '❌ FAIL: Policy INSERT mancante'
    END AS check_insert_policy
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'events' 
  AND policyname = 'Users can insert their own events';

-- Verifica 5: Policy "Users can update their own events" esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Policy "Users can update their own events" trovata'
        ELSE '❌ FAIL: Policy UPDATE mancante'
    END AS check_update_policy
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'events' 
  AND policyname = 'Users can update their own events';

-- Verifica 6: Policy "Users can delete their own events" esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Policy "Users can delete their own events" trovata'
        ELSE '❌ FAIL: Policy DELETE mancante'
    END AS check_delete_policy
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'events' 
  AND policyname = 'Users can delete their own events';

\echo ''

-- ================================================================
-- PATCH 17: Trigger auto-popolazione owner_id
-- ================================================================
\echo '📋 PATCH 17: Verifica trigger auto-popolazione owner_id'
\echo '-------------------------------------------------------'

-- Verifica 7: Funzione set_owner_id_from_jwt() esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Funzione set_owner_id_from_jwt() trovata'
        ELSE '❌ FAIL: Funzione trigger mancante'
    END AS check_trigger_function
FROM pg_proc
WHERE proname = 'set_owner_id_from_jwt'
  AND pronamespace = 'public'::regnamespace;

-- Verifica 8: Trigger trg_set_owner_id esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Trigger trg_set_owner_id trovato'
        ELSE '❌ FAIL: Trigger mancante'
    END AS check_trigger
FROM pg_trigger
WHERE tgname = 'trg_set_owner_id'
  AND tgrelid = 'public.events'::regclass;

\echo ''

-- ================================================================
-- PATCH 18: Schema event_types, categories, subcategories, timeline
-- ================================================================
\echo '📋 PATCH 18: Verifica schema event_types e tabelle correlate'
\echo '-------------------------------------------------------------'

-- Verifica 9: Tabella event_types esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Tabella event_types trovata'
        ELSE '❌ FAIL: Tabella event_types mancante'
    END AS check_event_types_table
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'event_types';

-- Verifica 10: Colonna type_id esiste in categories?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Colonna type_id in categories trovata'
        ELSE '❌ FAIL: Colonna type_id mancante in categories'
    END AS check_type_id_categories
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'categories' 
  AND column_name = 'type_id';

-- Verifica 11: Tabella timeline_items esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Tabella timeline_items trovata'
        ELSE '❌ FAIL: Tabella timeline_items mancante'
    END AS check_timeline_items_table
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'timeline_items';

-- Verifica 12: Colonna display_order esiste in categories?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Colonna display_order in categories trovata'
        ELSE '❌ FAIL: Colonna display_order mancante'
    END AS check_display_order_categories
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'categories' 
  AND column_name = 'display_order';

-- Verifica 13: Colonna estimated_cost esiste in subcategories?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Colonna estimated_cost in subcategories trovata'
        ELSE '❌ FAIL: Colonna estimated_cost mancante'
    END AS check_estimated_cost_subcategories
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subcategories' 
  AND column_name = 'estimated_cost';

\echo ''

-- ================================================================
-- PATCH 19: Trigger auto-popolazione timeline/categorie
-- ================================================================
\echo '📋 PATCH 19: Verifica trigger auto-popolazione timeline/categorie'
\echo '------------------------------------------------------------------'

-- Verifica 14: Funzione auto_populate_event_data() esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Funzione auto_populate_event_data() trovata'
        ELSE '❌ FAIL: Funzione auto-popolazione mancante'
    END AS check_auto_populate_function
FROM pg_proc
WHERE proname = 'auto_populate_event_data'
  AND pronamespace = 'public'::regnamespace;

-- Verifica 15: Trigger trg_auto_populate_event esiste?
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS: Trigger trg_auto_populate_event trovato'
        ELSE '❌ FAIL: Trigger auto-popolazione mancante'
    END AS check_auto_populate_trigger
FROM pg_trigger
WHERE tgname = 'trg_auto_populate_event'
  AND tgrelid = 'public.events'::regclass;

\echo ''

-- ================================================================
-- RIEPILOGO FINALE
-- ================================================================
\echo '📊 RIEPILOGO VERIFICA PATCHES'
\echo '=============================='

WITH patch_checks AS (
  SELECT 
    COUNT(*) FILTER (WHERE 
      (SELECT is_nullable FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'owner_id') = 'NO'
      AND (SELECT relrowsecurity FROM pg_class WHERE relname = 'events') = TRUE
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can view their own events')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can insert their own events')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can update their own events')
      AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can delete their own events')
    ) AS patch_16_ok,
    
    COUNT(*) FILTER (WHERE 
      EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_owner_id_from_jwt')
      AND EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_owner_id')
    ) AS patch_17_ok,
    
    COUNT(*) FILTER (WHERE 
      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_types')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'type_id')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timeline_items')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'display_order')
      AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subcategories' AND column_name = 'estimated_cost')
    ) AS patch_18_ok,
    
    COUNT(*) FILTER (WHERE 
      EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'auto_populate_event_data')
      AND EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_populate_event')
    ) AS patch_19_ok
  FROM (SELECT 1) AS dummy
)
SELECT 
  CASE WHEN patch_16_ok > 0 THEN '✅ APPLICATO' ELSE '❌ NON APPLICATO' END AS "PATCH 16 (owner_id + RLS)",
  CASE WHEN patch_17_ok > 0 THEN '✅ APPLICATO' ELSE '❌ NON APPLICATO' END AS "PATCH 17 (trigger owner_id)",
  CASE WHEN patch_18_ok > 0 THEN '✅ APPLICATO' ELSE '❌ NON APPLICATO' END AS "PATCH 18 (event_types schema)",
  CASE WHEN patch_19_ok > 0 THEN '✅ APPLICATO' ELSE '❌ NON APPLICATO' END AS "PATCH 19 (auto-popolazione)",
  CASE 
    WHEN patch_16_ok > 0 AND patch_17_ok > 0 AND patch_18_ok > 0 AND patch_19_ok > 0 
    THEN '✅ TUTTI I PATCHES APPLICATI' 
    ELSE '⚠️ ALCUNI PATCHES MANCANTI - Vedere dettagli sopra'
  END AS "STATUS GENERALE"
FROM patch_checks;

\echo ''
\echo '================================================================'
\echo 'Se vedi "❌ NON APPLICATO", esegui i patch corrispondenti:'
\echo '  PATCH 16: supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql'
\echo '  PATCH 17: supabase-2025-11-events-owner-trigger.sql'
\echo '  PATCH 18: supabase-2025-11-event-types-schema-v2.sql'
\echo '  PATCH 19: supabase-2025-11-auto-populate-triggers.sql'
\echo '================================================================'
