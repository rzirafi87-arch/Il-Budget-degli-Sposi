-- =====================================================================
-- PATCH 16 FIXED v2: Fix owner_id + RLS (gestione completa policy esistenti)
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Fix owner_id NOT NULL + RLS con gestione di TUTTE le policy esistenti
-- =====================================================================

-- =====================================================================
-- STEP 1: Drop TUTTE le policy esistenti su events (sia vecchie che nuove)
-- =====================================================================

DO $$
BEGIN
  -- Drop vecchia policy monolitica (se esiste)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_owner_all'
  ) THEN
    DROP POLICY "events_owner_all" ON public.events;
    RAISE NOTICE 'Dropped policy: events_owner_all';
  END IF;

  -- Drop policy granulari (se esistono)
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_select_own'
  ) THEN
    DROP POLICY "events_select_own" ON public.events;
    RAISE NOTICE 'Dropped policy: events_select_own';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_insert_self'
  ) THEN
    DROP POLICY "events_insert_self" ON public.events;
    RAISE NOTICE 'Dropped policy: events_insert_self';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_update_own'
  ) THEN
    DROP POLICY "events_update_own" ON public.events;
    RAISE NOTICE 'Dropped policy: events_update_own';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_delete_own'
  ) THEN
    DROP POLICY "events_delete_own" ON public.events;
    RAISE NOTICE 'Dropped policy: events_delete_own';
  END IF;
END$$;

-- =====================================================================
-- STEP 2: Drop policy dipendenti su payment_reminders (se esistono)
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can view their own payment reminders'
  ) THEN
    DROP POLICY "Users can view their own payment reminders" ON public.payment_reminders;
    RAISE NOTICE 'Dropped policy: Users can view their own payment reminders';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payment_reminders' 
      AND policyname = 'Users can manage their own payment reminders'
  ) THEN
    DROP POLICY "Users can manage their own payment reminders" ON public.payment_reminders;
    RAISE NOTICE 'Dropped policy: Users can manage their own payment reminders';
  END IF;
END$$;

-- =====================================================================
-- STEP 3: Backfill eventuali righe NULL PRIMA di impostare NOT NULL
-- =====================================================================

UPDATE public.events
SET owner_id = (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
WHERE owner_id IS NULL;

-- =====================================================================
-- STEP 4: Colonna owner_id: tipo, NOT NULL e default
-- =====================================================================

ALTER TABLE public.events
  ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid,
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ALTER COLUMN owner_id SET NOT NULL;

-- =====================================================================
-- STEP 5: RLS: abilita (se non già abilitata)
-- =====================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 6: Crea policy granulari su events
-- =====================================================================

CREATE POLICY events_select_own ON public.events 
  FOR SELECT 
  USING (owner_id = auth.uid());

CREATE POLICY events_insert_self ON public.events 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY events_update_own ON public.events 
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY events_delete_own ON public.events 
  FOR DELETE 
  USING (owner_id = auth.uid());

-- =====================================================================
-- STEP 7: Ricrea policy su payment_reminders (SENZA "OR IS NULL")
-- =====================================================================

-- Solo se la tabella payment_reminders esiste
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_reminders') THEN
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
    
    RAISE NOTICE 'Recreated payment_reminders policies';
  END IF;
END$$;

-- =====================================================================
-- STEP 8: Comments per documentazione
-- =====================================================================

COMMENT ON COLUMN public.events.owner_id IS 'User ID proprietario evento (NOT NULL, default auth.uid())';
COMMENT ON POLICY events_select_own ON public.events IS 'Utenti possono vedere solo i propri eventi';
COMMENT ON POLICY events_insert_self ON public.events IS 'Utenti possono creare eventi solo per se stessi';
COMMENT ON POLICY events_update_own ON public.events IS 'Utenti possono modificare solo i propri eventi';
COMMENT ON POLICY events_delete_own ON public.events IS 'Utenti possono eliminare solo i propri eventi';

-- =====================================================================
-- Fine PATCH 16 FIXED v2
-- =====================================================================
