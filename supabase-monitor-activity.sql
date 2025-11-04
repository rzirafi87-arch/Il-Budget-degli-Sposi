-- ============================================================================
-- MONITORAGGIO ATTIVITÀ RECENTE
-- ============================================================================
-- Script per monitorare le modifiche e attività recenti sul database
-- Utile per audit e troubleshooting
-- Eseguibile direttamente nel SQL Editor di Supabase
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '              MONITORAGGIO ATTIVITÀ RECENTE                     ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

-- ===========================================================================
-- 1. EVENTI CREATI NELLE ULTIME 24 ORE
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'EVENTI CREATI NELLE ULTIME 24 ORE' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  id,
  event_type,
  event_date,
  total_budget,
  created_at,
  EXTRACT(HOUR FROM (NOW() - created_at)) || ' ore fa' as created_ago
FROM events
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Conteggio per tipo
SELECT 
  event_type,
  COUNT(*) as count,
  SUM(total_budget) as total_budget_sum
FROM events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type;

-- ===========================================================================
-- 2. SPESE RECENTI (ULTIMI 7 GIORNI)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'SPESE INSERITE NEGLI ULTIMI 7 GIORNI' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  e.id,
  ev.event_type,
  c.name as categoria,
  s.name as sottocategoria,
  e.amount,
  e.spend_type,
  e.supplier_name,
  e.created_at,
  EXTRACT(DAY FROM (NOW() - e.created_at)) || ' giorni fa' as created_ago
FROM expenses e
JOIN events ev ON e.event_id = ev.id
LEFT JOIN subcategories s ON e.subcategory_id = s.id
LEFT JOIN categories c ON s.category_id = c.id
WHERE e.created_at >= NOW() - INTERVAL '7 days'
ORDER BY e.created_at DESC
LIMIT 50;

-- Statistiche spese recenti
SELECT 
  ev.event_type,
  COUNT(*) as num_spese,
  SUM(e.amount) as totale_speso,
  AVG(e.amount) as media_per_spesa,
  MAX(e.amount) as spesa_massima
FROM expenses e
JOIN events ev ON e.event_id = ev.id
WHERE e.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ev.event_type
ORDER BY totale_speso DESC;

-- ===========================================================================
-- 3. ENTRATE RECENTI (ULTIMI 7 GIORNI)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'ENTRATE INSERITE NEGLI ULTIMI 7 GIORNI' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  i.id,
  ev.event_type,
  i.source,
  i.amount,
  i.received_date,
  i.created_at,
  EXTRACT(DAY FROM (NOW() - i.created_at)) || ' giorni fa' as created_ago
FROM incomes i
JOIN events ev ON i.event_id = ev.id
WHERE i.created_at >= NOW() - INTERVAL '7 days'
ORDER BY i.created_at DESC
LIMIT 50;

-- ===========================================================================
-- 4. NUOVI UTENTI (ULTIMO MESE)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'NUOVI UTENTI REGISTRATI NELL\'ULTIMO MESE' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

-- Questa query richiede accesso alla tabella auth.users (solo se hai i permessi)
-- Se non funziona, commentala

-- SELECT 
--   id,
--   email,
--   created_at,
--   last_sign_in_at,
--   EXTRACT(DAY FROM (NOW() - created_at)) || ' giorni fa' as registered_ago
-- FROM auth.users
-- WHERE created_at >= NOW() - INTERVAL '30 days'
-- ORDER BY created_at DESC;

-- Alternativa: conta eventi creati per dedurre nuovi utenti
SELECT 
  user_id,
  MIN(created_at) as first_event_date,
  COUNT(*) as num_events,
  EXTRACT(DAY FROM (NOW() - MIN(created_at))) || ' giorni fa' as first_activity
FROM events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY first_event_date DESC;

-- ===========================================================================
-- 5. SUBSCRIPTIONS ATTIVE E SCADENZE PROSSIME
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'SUBSCRIPTIONS: ATTIVE E IN SCADENZA' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

-- Subscriptions attive
SELECT 
  us.id,
  us.user_id,
  sp.name as package_name,
  sp.price,
  us.start_date,
  us.end_date,
  EXTRACT(DAY FROM (us.end_date - NOW())) as giorni_rimanenti,
  us.status
FROM user_subscriptions us
JOIN subscription_packages sp ON us.package_id = sp.id
WHERE us.status = 'active'
ORDER BY us.end_date ASC;

-- Subscriptions in scadenza nei prossimi 7 giorni
SELECT 
  COUNT(*) as num_subscriptions_in_scadenza,
  SUM(sp.price) as revenue_at_risk
FROM user_subscriptions us
JOIN subscription_packages sp ON us.package_id = sp.id
WHERE us.status = 'active' 
AND us.end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days';

-- ===========================================================================
-- 6. ATTIVITÀ PER TIPO EVENTO (TREND)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'TREND ATTIVITÀ PER TIPO EVENTO (ULTIMI 30 GIORNI)' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  event_type,
  COUNT(*) as eventi_creati,
  (SELECT COUNT(*) FROM expenses e WHERE e.event_id IN (
    SELECT id FROM events WHERE event_type = ev.event_type AND created_at >= NOW() - INTERVAL '30 days'
  )) as spese_inserite,
  (SELECT SUM(amount) FROM expenses e WHERE e.event_id IN (
    SELECT id FROM events WHERE event_type = ev.event_type AND created_at >= NOW() - INTERVAL '30 days'
  )) as totale_speso
FROM events ev
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type
ORDER BY eventi_creati DESC;

-- ===========================================================================
-- 7. TOP FORNITORI UTILIZZATI (ULTIMO MESE)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'TOP FORNITORI PIÙ UTILIZZATI (ULTIMO MESE)' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  supplier_name,
  COUNT(*) as num_utilizzi,
  SUM(amount) as totale_speso,
  AVG(amount) as media_per_utilizzo,
  COUNT(DISTINCT event_id) as eventi_diversi
FROM expenses
WHERE created_at >= NOW() - INTERVAL '30 days'
AND supplier_name IS NOT NULL
AND supplier_name != ''
GROUP BY supplier_name
ORDER BY num_utilizzi DESC
LIMIT 20;

-- ===========================================================================
-- 8. WEDDING CARDS RECENTI
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'PARTECIPAZIONI CREATE NEGLI ULTIMI 7 GIORNI' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

SELECT 
  wc.id,
  ev.event_type,
  wc.bride_name,
  wc.groom_name,
  wc.ceremony_date,
  wc.created_at,
  EXTRACT(DAY FROM (NOW() - wc.created_at)) || ' giorni fa' as created_ago
FROM wedding_cards wc
JOIN events ev ON wc.event_id = ev.id
WHERE wc.created_at >= NOW() - INTERVAL '7 days'
ORDER BY wc.created_at DESC;

-- ===========================================================================
-- 9. MODIFICHE RECENTI (UPDATED_AT)
-- ===========================================================================

SELECT '─────────────────────────────────────────────────────────────' as divider;
SELECT 'RECORD MODIFICATI NEGLI ULTIMI 3 GIORNI' as section;
SELECT '─────────────────────────────────────────────────────────────' as divider;

-- Eventi modificati
SELECT 
  'Event' as record_type,
  id,
  event_type as detail,
  updated_at,
  EXTRACT(HOUR FROM (NOW() - updated_at)) || ' ore fa' as modified_ago
FROM events
WHERE updated_at >= NOW() - INTERVAL '3 days'
AND updated_at != created_at  -- Solo modifiche, non creazioni
ORDER BY updated_at DESC
LIMIT 20;

-- Spese modificate
SELECT 
  'Expense' as record_type,
  id,
  supplier_name as detail,
  updated_at,
  EXTRACT(HOUR FROM (NOW() - updated_at)) || ' ore fa' as modified_ago
FROM expenses
WHERE updated_at >= NOW() - INTERVAL '3 days'
AND updated_at != created_at
ORDER BY updated_at DESC
LIMIT 20;

-- ===========================================================================
-- 10. RIEPILOGO STATISTICHE GENERALI
-- ===========================================================================

SELECT '═══════════════════════════════════════════════════════════════' as separator;
SELECT '                   RIEPILOGO STATISTICHE                        ' as title;
SELECT '═══════════════════════════════════════════════════════════════' as separator;

DO $$
DECLARE
  v_total_events INT;
  v_events_24h INT;
  v_total_expenses INT;
  v_expenses_7d INT;
  v_total_spent NUMERIC;
  v_spent_7d NUMERIC;
  v_active_subs INT;
BEGIN
  SELECT COUNT(*) INTO v_total_events FROM events;
  SELECT COUNT(*) INTO v_events_24h FROM events WHERE created_at >= NOW() - INTERVAL '24 hours';
  SELECT COUNT(*) INTO v_total_expenses FROM expenses;
  SELECT COUNT(*) INTO v_expenses_7d FROM expenses WHERE created_at >= NOW() - INTERVAL '7 days';
  SELECT COALESCE(SUM(amount), 0) INTO v_total_spent FROM expenses;
  SELECT COALESCE(SUM(amount), 0) INTO v_spent_7d FROM expenses WHERE created_at >= NOW() - INTERVAL '7 days';
  SELECT COUNT(*) INTO v_active_subs FROM user_subscriptions WHERE status = 'active';
  
  RAISE NOTICE '📊 STATISTICHE ATTIVITÀ:';
  RAISE NOTICE '';
  RAISE NOTICE '   Eventi Totali: %', v_total_events;
  RAISE NOTICE '   ├─ Ultimi 24h: %', v_events_24h;
  RAISE NOTICE '   └─ Crescita: %%%', ROUND((v_events_24h::numeric / NULLIF(v_total_events, 0)) * 100, 2);
  RAISE NOTICE '';
  RAISE NOTICE '   Spese Totali: %', v_total_expenses;
  RAISE NOTICE '   ├─ Ultimi 7gg: %', v_expenses_7d;
  RAISE NOTICE '   └─ Importo 7gg: €%', v_spent_7d;
  RAISE NOTICE '';
  RAISE NOTICE '   Subscriptions Attive: %', v_active_subs;
  RAISE NOTICE '';
  RAISE NOTICE '   💰 Totale Speso (lifetime): €%', v_total_spent;
  
END $$;

-- Query finale: attività per ora del giorno (pattern utilizzo)
SELECT 
  EXTRACT(HOUR FROM created_at) as ora,
  COUNT(*) as num_operazioni
FROM (
  SELECT created_at FROM expenses WHERE created_at >= NOW() - INTERVAL '7 days'
  UNION ALL
  SELECT created_at FROM incomes WHERE created_at >= NOW() - INTERVAL '7 days'
  UNION ALL
  SELECT created_at FROM events WHERE created_at >= NOW() - INTERVAL '7 days'
) activity
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY ora;
