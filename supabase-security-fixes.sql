-- ========================================
-- SUPABASE SECURITY FIXES
-- Risolve tutti i problemi evidenziati dal Security Advisor
-- ========================================

BEGIN;

-- ========================================
-- PARTE 1: ABILITARE RLS SU TABELLE PUBBLICHE
-- ========================================

-- Abilita RLS sulle tabelle che lo richiedono
ALTER TABLE IF EXISTS public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_jobs ENABLE ROW LEVEL SECURITY;

-- Policy di default: lettura pubblica, scrittura solo autenticati
-- Vendors
DROP POLICY IF EXISTS "vendors_select_public" ON public.vendors;
CREATE POLICY "vendors_select_public" ON public.vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "vendors_insert_auth" ON public.vendors;
CREATE POLICY "vendors_insert_auth" ON public.vendors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "vendors_update_auth" ON public.vendors;
CREATE POLICY "vendors_update_auth" ON public.vendors
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "vendors_delete_auth" ON public.vendors;
CREATE POLICY "vendors_delete_auth" ON public.vendors
  FOR DELETE USING (auth.role() = 'authenticated');

-- Vendor Places
DROP POLICY IF EXISTS "vendor_places_select_public" ON public.vendor_places;
CREATE POLICY "vendor_places_select_public" ON public.vendor_places
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "vendor_places_insert_auth" ON public.vendor_places;
CREATE POLICY "vendor_places_insert_auth" ON public.vendor_places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "vendor_places_update_auth" ON public.vendor_places;
CREATE POLICY "vendor_places_update_auth" ON public.vendor_places
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "vendor_places_delete_auth" ON public.vendor_places;
CREATE POLICY "vendor_places_delete_auth" ON public.vendor_places
  FOR DELETE USING (auth.role() = 'authenticated');

-- Places
DROP POLICY IF EXISTS "places_select_public" ON public.places;
CREATE POLICY "places_select_public" ON public.places
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "places_insert_auth" ON public.places;
CREATE POLICY "places_insert_auth" ON public.places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "places_update_auth" ON public.places;
CREATE POLICY "places_update_auth" ON public.places
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "places_delete_auth" ON public.places;
CREATE POLICY "places_delete_auth" ON public.places
  FOR DELETE USING (auth.role() = 'authenticated');

-- Sync Jobs
DROP POLICY IF EXISTS "sync_jobs_select_public" ON public.sync_jobs;
CREATE POLICY "sync_jobs_select_public" ON public.sync_jobs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sync_jobs_insert_service" ON public.sync_jobs;
CREATE POLICY "sync_jobs_insert_service" ON public.sync_jobs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "sync_jobs_update_service" ON public.sync_jobs;
CREATE POLICY "sync_jobs_update_service" ON public.sync_jobs
  FOR UPDATE USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "sync_jobs_delete_service" ON public.sync_jobs;
CREATE POLICY "sync_jobs_delete_service" ON public.sync_jobs
  FOR DELETE USING (auth.role() = 'service_role');

-- ========================================
-- PARTE 2: CORREGGERE SECURITY DEFINER VIEWS
-- ========================================

-- Ricrea le viste con SECURITY INVOKER invece di SECURITY DEFINER
-- per rispettare le policy RLS delle tabelle sottostanti

-- Top Vendors By Region
DROP VIEW IF EXISTS public.top_vendors_by_region CASCADE;
CREATE OR REPLACE VIEW public.top_vendors_by_region 
SECURITY INVOKER
AS
SELECT 
  region,
  name,
  category,
  rating,
  verified
FROM public.vendors
WHERE verified = true
ORDER BY region, rating DESC NULLS LAST;

-- Location Stats By Region
DROP VIEW IF EXISTS public.location_stats_by_region CASCADE;
CREATE OR REPLACE VIEW public.location_stats_by_region
SECURITY INVOKER
AS
SELECT 
  region,
  COUNT(*) as location_count,
  AVG(CASE WHEN verified THEN 1 ELSE 0 END) as verified_percentage
FROM public.locations
GROUP BY region;

-- High Rated Locations
DROP VIEW IF EXISTS public.high_rated_locations CASCADE;
CREATE OR REPLACE VIEW public.high_rated_locations
SECURITY INVOKER
AS
SELECT 
  name,
  region,
  province,
  city,
  location_type,
  capacity_max
FROM public.locations
WHERE verified = true
ORDER BY name;

-- Vendors With Places
DROP VIEW IF EXISTS public.vendors_with_places CASCADE;
CREATE OR REPLACE VIEW public.vendors_with_places
SECURITY INVOKER
AS
SELECT 
  v.id,
  v.name,
  v.region,
  v.category,
  COUNT(vp.place_id) as places_count
FROM public.vendors v
LEFT JOIN public.vendor_places vp ON v.id = vp.vendor_id
GROUP BY v.id, v.name, v.region, v.category;

-- Sync Stats
DROP VIEW IF EXISTS public.sync_stats CASCADE;
CREATE OR REPLACE VIEW public.sync_stats
SECURITY INVOKER
AS
SELECT 
  status,
  COUNT(*) as count,
  MAX(completed_at) as last_completed
FROM public.sync_jobs
GROUP BY status;

-- ========================================
-- PARTE 3: CORREGGERE FUNCTION SEARCH PATH
-- ========================================

-- Lista funzioni da correggere:
-- is_subscription_active, get_visible_suppliers, seed_categories, seed_subcategories,
-- normalize_url, increment_analytics_count, get_or_create_category, ensure_subcategory,
-- seed_full_event

-- Funzione per impostare search_path sicuro su tutte le funzioni
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Itera su tutte le funzioni nel schema public
  FOR func_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'is_subscription_active',
        'get_visible_suppliers',
        'seed_categories',
        'seed_subcategories',
        'normalize_url',
        'increment_analytics_count',
        'get_or_create_category',
        'ensure_subcategory',
        'seed_full_event'
      )
  LOOP
    -- Imposta search_path sicuro per ogni funzione
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
      func_record.schema_name,
      func_record.function_name,
      func_record.args
    );
    
    RAISE NOTICE 'Fixed search_path for function: %.%(%)', 
      func_record.schema_name, 
      func_record.function_name,
      func_record.args;
  END LOOP;
END $$;

-- ========================================
-- PARTE 4: FUNZIONI AGGIUNTIVE CON SEARCH PATH
-- ========================================

-- Se esistono altre funzioni menzionate nel Security Advisor, correggile qui
-- Esempio generico per funzioni personalizzate:

-- ALTER FUNCTION public.my_custom_function() SET search_path = public, pg_temp;

COMMIT;

-- ========================================
-- VERIFICA POST-APPLICAZIONE
-- ========================================

-- Esegui queste query per verificare che tutto sia corretto:

-- 1. Verifica RLS abilitato
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('vendors', 'vendor_places', 'places', 'sync_jobs');

-- 2. Verifica policy create
-- SELECT tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public';

-- 3. Verifica viste con security invoker
-- SELECT table_name, view_definition 
-- FROM information_schema.views 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('top_vendors_by_region', 'location_stats_by_region', 'high_rated_locations', 'vendors_with_places', 'sync_stats');

-- 4. Verifica search_path funzioni
-- SELECT n.nspname || '.' || p.proname as function, 
--        prosrc, 
--        proconfig 
-- FROM pg_proc p 
-- JOIN pg_namespace n ON p.pronamespace = n.oid 
-- WHERE n.nspname = 'public' 
-- AND proconfig IS NOT NULL;
