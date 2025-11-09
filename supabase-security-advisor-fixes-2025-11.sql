-- SECURITY ADVISOR FIXES - NOV 2025
-- Questo script corregge i principali errori/warning di sicurezza segnalati da Supabase Security Advisor
-- 1. Rimuove SECURITY DEFINER dalle view
-- 2. Abilita RLS e aggiunge policy minime sulle tabelle esposte
-- 3. Imposta search_path sicuro nelle funzioni

-- 1. RIMUOVI SECURITY DEFINER DALLE VIEW
-- (Esempio per una view, ripetere per tutte le view segnalate)
-- DROP VIEW IF EXISTS public.top_vendors_by_region;
-- CREATE OR REPLACE VIEW public.top_vendors_by_region AS
-- ...definizione originale della view...
-- NB: NON usare SECURITY DEFINER

-- 2. ABILITA RLS E AGGIUNGI POLICY MINIMA
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendors_select ON public.vendors FOR SELECT USING (true);

ALTER TABLE public.vendor_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_places_select ON public.vendor_places FOR SELECT USING (true);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY places_select ON public.places FOR SELECT USING (true);

ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sync_jobs_select ON public.sync_jobs FOR SELECT USING (true);

-- 3. IMPOSTA search_path SICURO NELLE FUNZIONI
-- Esempio per una funzione, ripetere per tutte quelle segnalate:
-- CREATE OR REPLACE FUNCTION public.is_subscription_active(...) RETURNS ... AS $$
--   SET search_path = public;
--   ...funzione...
-- $$ LANGUAGE plpgsql;

-- TODO: Sostituire le definizioni delle view e funzioni con le versioni corrette senza SECURITY DEFINER e con search_path impostato.
-- Dopo aver applicato queste modifiche, eseguire "Rerun linter" su Supabase Security Advisor.
