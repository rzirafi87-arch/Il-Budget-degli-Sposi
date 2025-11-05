-- =====================================================================
-- PATCH 16 FIXED v3: Fix owner_id + RLS (gestione COMPLETA policy dipendenti)
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Fix owner_id NOT NULL + RLS con gestione di TUTTE le policy
--        dipendenti da events.owner_id (incluse su altre tabelle)
-- =====================================================================

-- =====================================================================
-- STEP 1: Drop TUTTE le policy su events
-- =====================================================================

DO $$
BEGIN
  -- Drop policy esistenti su events
  DROP POLICY IF EXISTS "events_owner_all" ON public.events;
  DROP POLICY IF EXISTS "events_select_own" ON public.events;
  DROP POLICY IF EXISTS "events_insert_self" ON public.events;
  DROP POLICY IF EXISTS "events_update_own" ON public.events;
  DROP POLICY IF EXISTS "events_delete_own" ON public.events;
  
  RAISE NOTICE 'Dropped all policies on events';
END$$;

-- =====================================================================
-- STEP 2: Drop policy dipendenti su ALTRE tabelle che usano events.owner_id
-- =====================================================================

DO $$
BEGIN
  -- Categories (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    DROP POLICY IF EXISTS "cat_owner_all" ON public.categories;
    DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
    DROP POLICY IF EXISTS "categories_insert_self" ON public.categories;
    DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
    DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
    RAISE NOTICE 'Dropped policies on categories';
  END IF;

  -- Subcategories (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subcategories') THEN
    DROP POLICY IF EXISTS "sub_owner_all" ON public.subcategories;
    DROP POLICY IF EXISTS "subcat_owner_all" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_select_own" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_insert_self" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_update_own" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_delete_own" ON public.subcategories;
    RAISE NOTICE 'Dropped policies on subcategories';
  END IF;

  -- Expenses (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
    DROP POLICY IF EXISTS "exp_owner_all" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_owner_all" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_insert_self" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;
    RAISE NOTICE 'Dropped policies on expenses';
  END IF;

  -- Incomes (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incomes') THEN
    DROP POLICY IF EXISTS "inc_owner_all" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_select_own" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_insert_self" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_update_own" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_delete_own" ON public.incomes;
    RAISE NOTICE 'Dropped policies on incomes';
  END IF;

  -- Payment Reminders (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_reminders') THEN
    DROP POLICY IF EXISTS "Users can view their own payment reminders" ON public.payment_reminders;
    DROP POLICY IF EXISTS "Users can manage their own payment reminders" ON public.payment_reminders;
    RAISE NOTICE 'Dropped policies on payment_reminders';
  END IF;

  -- User Event Timeline (se esiste)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_event_timeline') THEN
    DROP POLICY IF EXISTS "Users can view their own timeline" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "Users can manage their own timeline" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_select_own" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_insert_self" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_update_own" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_delete_own" ON public.user_event_timeline;
    RAISE NOTICE 'Dropped policies on user_event_timeline';
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
-- STEP 6: Ricrea policy granulari su events
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
-- STEP 7: Ricrea policy su tabelle dipendenti
-- =====================================================================

-- Categories (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    CREATE POLICY "categories_select_own"
    ON public.categories FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = categories.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "categories_insert_self"
    ON public.categories FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = categories.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "categories_update_own"
    ON public.categories FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = categories.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "categories_delete_own"
    ON public.categories FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = categories.event_id
          AND events.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on categories';
  END IF;
END$$;

-- Subcategories (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subcategories') THEN
    CREATE POLICY "subcategories_select_own"
    ON public.subcategories FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.categories c
        JOIN public.events e ON e.id = c.event_id
        WHERE c.id = subcategories.category_id
          AND e.owner_id = auth.uid()
      )
    );

    CREATE POLICY "subcategories_insert_self"
    ON public.subcategories FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.categories c
        JOIN public.events e ON e.id = c.event_id
        WHERE c.id = subcategories.category_id
          AND e.owner_id = auth.uid()
      )
    );

    CREATE POLICY "subcategories_update_own"
    ON public.subcategories FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.categories c
        JOIN public.events e ON e.id = c.event_id
        WHERE c.id = subcategories.category_id
          AND e.owner_id = auth.uid()
      )
    );

    CREATE POLICY "subcategories_delete_own"
    ON public.subcategories FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.categories c
        JOIN public.events e ON e.id = c.event_id
        WHERE c.id = subcategories.category_id
          AND e.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on subcategories';
  END IF;
END$$;

-- Expenses (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
    CREATE POLICY "expenses_select_own"
    ON public.expenses FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "expenses_insert_self"
    ON public.expenses FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "expenses_update_own"
    ON public.expenses FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "expenses_delete_own"
    ON public.expenses FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = expenses.event_id
          AND events.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on expenses';
  END IF;
END$$;

-- Incomes (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incomes') THEN
    CREATE POLICY "incomes_select_own"
    ON public.incomes FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = incomes.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "incomes_insert_self"
    ON public.incomes FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = incomes.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "incomes_update_own"
    ON public.incomes FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = incomes.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "incomes_delete_own"
    ON public.incomes FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = incomes.event_id
          AND events.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on incomes';
  END IF;
END$$;

-- Payment Reminders (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_reminders') THEN
    CREATE POLICY "Users can view their own payment reminders"
    ON public.payment_reminders FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    );

    CREATE POLICY "Users can manage their own payment reminders"
    ON public.payment_reminders FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.expenses e
        JOIN public.events ev ON ev.id = e.event_id
        WHERE e.id = payment_reminders.expense_id
          AND ev.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on payment_reminders';
  END IF;
END$$;

-- User Event Timeline (se esiste)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_event_timeline') THEN
    CREATE POLICY "Users can view their own timeline"
    ON public.user_event_timeline FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = user_event_timeline.event_id
          AND events.owner_id = auth.uid()
      )
    );

    CREATE POLICY "Users can manage their own timeline"
    ON public.user_event_timeline FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = user_event_timeline.event_id
          AND events.owner_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = user_event_timeline.event_id
          AND events.owner_id = auth.uid()
      )
    );
    
    RAISE NOTICE 'Recreated policies on user_event_timeline';
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
-- Fine PATCH 16 FIXED v3
-- =====================================================================
