-- Validation: events.owner_id and RLS/policies

-- 1) Column type and nulls
SELECT
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='events' AND column_name='owner_id';

SELECT COUNT(*) AS null_owner_id_rows
FROM public.events
WHERE owner_id IS NULL;

-- 2) RLS enabled on events
SELECT c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='events';

-- 3) Policies on events
SELECT policyname, cmd, permissive, roles
FROM pg_policies
WHERE schemaname='public' AND tablename='events'
ORDER BY policyname;

-- 4) Spot check: policies exist on key tables
SELECT tablename, COUNT(*) AS policies
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('categories','subcategories','expenses','incomes','payment_reminders','user_event_timeline','wedding_cards','guests')
GROUP BY tablename
ORDER BY tablename;