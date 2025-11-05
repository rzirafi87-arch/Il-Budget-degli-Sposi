-- =====================================================
-- PATCH 2025-11 (FIXED): Events.owner_id – NOT NULL + Default + RLS hardening
-- =====================================================
-- Data: 2025-11-05
-- Scopo: Fix critical owner_id NULL issues + implement granular RLS
-- FIXED: Gestisce dipendenze policy da altre tabelle (payment_reminders)
-- =====================================================

-- STEP 1: Drop policy dipendenti su payment_reminders (se esistono)
-- Queste policy usano la colonna owner_id in JOIN, quindi vanno droppate prima
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can view their own payment reminders'
  ) THEN
    DROP POLICY "Users can view their own payment reminders" ON public.payment_reminders;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can manage their own payment reminders'
  ) THEN
    DROP POLICY "Users can manage their own payment reminders" ON public.payment_reminders;
  END IF;
END$$;

-- STEP 2: Backfill eventuali righe NULL PRIMA di impostare NOT NULL
-- Assegna al primo utente del sistema (fallback sicuro)
UPDATE public.events
SET owner_id = (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
WHERE owner_id IS NULL;

-- STEP 3: Colonna owner_id: tipo, NOT NULL e default
ALTER TABLE public.events
  ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid,
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ALTER COLUMN owner_id SET NOT NULL;

-- STEP 4: RLS: abilita (se non già abilitata)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- STEP 5: Policy minime separate (drop della cumulativa se presente)
DO $$
BEGIN
  -- Drop vecchia policy monolitica se esiste
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_owner_all'
  ) THEN
    DROP POLICY "events_owner_all" ON public.events;
  END IF;

  -- Crea policy granulari (idempotente)
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

-- STEP 6: Ricrea policy su payment_reminders (SENZA "OR ev.owner_id IS NULL")
-- Ora che owner_id è NOT NULL, la condizione è più strict
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can view their own payment reminders'
  ) THEN
    CREATE POLICY "Users can view their own payment reminders"
    ON public.payment_reminders
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can manage their own payment reminders'
  ) THEN
    CREATE POLICY "Users can manage their own payment reminders"
    ON public.payment_reminders
    FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    );
  END IF;
END$$;

-- STEP 7: Comments per documentazione
COMMENT ON COLUMN public.events.owner_id IS 'User ID proprietario evento (NOT NULL, default auth.uid())';
COMMENT ON POLICY events_select_own ON public.events IS 'Utenti possono vedere solo i propri eventi';
COMMENT ON POLICY events_insert_self ON public.events IS 'Utenti possono creare eventi solo per se stessi';
COMMENT ON POLICY events_update_own ON public.events IS 'Utenti possono modificare solo i propri eventi';
COMMENT ON POLICY events_delete_own ON public.events IS 'Utenti possono eliminare solo i propri eventi';

-- =====================================================
-- Fine PATCH 2025-11 (FIXED)
-- =====================================================
