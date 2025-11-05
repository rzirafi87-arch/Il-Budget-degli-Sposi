-- =====================================================
-- PATCH 2025-11: Events.owner_id – NOT NULL + Default + RLS hardening
-- Esegui su Supabase SQL Editor oppure tramite task Codex
-- Sicuro e idempotente
-- =====================================================

-- 1) Colonna owner_id: tipo, NOT NULL e default
ALTER TABLE public.events
  ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid,
  ALTER COLUMN owner_id SET NOT NULL,
  ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- 2) Backfill eventuali righe NULL (assegna all'utente corrente)
UPDATE public.events
SET owner_id = auth.uid()
WHERE owner_id IS NULL;

-- 3) RLS: abilita (se non già abilitata)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4) Policy minime separate (drop della cumulativa se presente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_owner_all'
  ) THEN
    DROP POLICY "events_owner_all" ON public.events;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_select_own'
  ) THEN
    CREATE POLICY events_select_own ON public.events FOR SELECT USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_insert_self'
  ) THEN
    CREATE POLICY events_insert_self ON public.events FOR INSERT WITH CHECK (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_update_own'
  ) THEN
    CREATE POLICY events_update_own ON public.events FOR UPDATE USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_delete_own'
  ) THEN
    CREATE POLICY events_delete_own ON public.events FOR DELETE USING (owner_id = auth.uid());
  END IF;
END$$;
