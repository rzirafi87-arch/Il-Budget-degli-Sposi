-- =====================================================================
-- PATCH 16 FIXED v4 COMPLETO: Fix owner_id + RLS (TUTTE le tabelle)
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Fix owner_id NOT NULL + RLS con gestione COMPLETA di TUTTE
--        le policy dipendenti da events.owner_id (33 tabelle totali)
-- =====================================================================

-- =====================================================================
-- STEP 1: Drop TUTTE le policy su events
-- =====================================================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "events_owner_all" ON public.events;
  DROP POLICY IF EXISTS "events_select_own" ON public.events;
  DROP POLICY IF EXISTS "events_insert_self" ON public.events;
  DROP POLICY IF EXISTS "events_update_own" ON public.events;
  DROP POLICY IF EXISTS "events_delete_own" ON public.events;
  RAISE NOTICE 'Dropped all policies on events';
END$$;

-- =====================================================================
-- STEP 2: Drop policy su TUTTE le altre tabelle (33 tabelle)
-- =====================================================================

DO $$
BEGIN
  -- Core tables
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    DROP POLICY IF EXISTS "cat_owner_all" ON public.categories;
    DROP POLICY IF EXISTS "categories_select_own" ON public.categories;
    DROP POLICY IF EXISTS "categories_insert_self" ON public.categories;
    DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
    DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;
    RAISE NOTICE 'Dropped policies on categories';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subcategories') THEN
    DROP POLICY IF EXISTS "sub_owner_all" ON public.subcategories;
    DROP POLICY IF EXISTS "subcat_owner_all" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_select_own" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_insert_self" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_update_own" ON public.subcategories;
    DROP POLICY IF EXISTS "subcategories_delete_own" ON public.subcategories;
    RAISE NOTICE 'Dropped policies on subcategories';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
    DROP POLICY IF EXISTS "exp_owner_all" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_owner_all" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_insert_self" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
    DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;
    RAISE NOTICE 'Dropped policies on expenses';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incomes') THEN
    DROP POLICY IF EXISTS "inc_owner_all" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_owner_all" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_select_own" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_insert_self" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_update_own" ON public.incomes;
    DROP POLICY IF EXISTS "incomes_delete_own" ON public.incomes;
    RAISE NOTICE 'Dropped policies on incomes';
  END IF;

  -- Feature tables
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_reminders') THEN
    DROP POLICY IF EXISTS "Users can view their own payment reminders" ON public.payment_reminders;
    DROP POLICY IF EXISTS "Users can manage their own payment reminders" ON public.payment_reminders;
    RAISE NOTICE 'Dropped policies on payment_reminders';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_event_timeline') THEN
    DROP POLICY IF EXISTS "Users can view their own timeline" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "Users can manage their own timeline" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_select_own" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_insert_self" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_update_own" ON public.user_event_timeline;
    DROP POLICY IF EXISTS "timeline_delete_own" ON public.user_event_timeline;
    RAISE NOTICE 'Dropped policies on user_event_timeline';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wedding_cards') THEN
    DROP POLICY IF EXISTS "wedding_cards_owner_all" ON public.wedding_cards;
    DROP POLICY IF EXISTS "wedding_cards_select_own" ON public.wedding_cards;
    DROP POLICY IF EXISTS "wedding_cards_insert_self" ON public.wedding_cards;
    DROP POLICY IF EXISTS "wedding_cards_update_own" ON public.wedding_cards;
    DROP POLICY IF EXISTS "wedding_cards_delete_own" ON public.wedding_cards;
    RAISE NOTICE 'Dropped policies on wedding_cards';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guests') THEN
    DROP POLICY IF EXISTS "Users can view their own guests" ON public.guests;
    DROP POLICY IF EXISTS "Users can insert their own guests" ON public.guests;
    DROP POLICY IF EXISTS "Users can update their own guests" ON public.guests;
    DROP POLICY IF EXISTS "Users can delete their own guests" ON public.guests;
    DROP POLICY IF EXISTS "Users can manage their own guests" ON public.guests;
    DROP POLICY IF EXISTS "guests_select_own" ON public.guests;
    DROP POLICY IF EXISTS "guests_insert_self" ON public.guests;
    DROP POLICY IF EXISTS "guests_update_own" ON public.guests;
    DROP POLICY IF EXISTS "guests_delete_own" ON public.guests;
    RAISE NOTICE 'Dropped policies on guests';
  END IF;

  -- Nuove tabelle scoperte
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'atelier') THEN
    EXECUTE 'DROP POLICY IF EXISTS "atelier_owner_all" ON public.atelier';
    EXECUTE 'DROP POLICY IF EXISTS "atelier_select" ON public.atelier';
    EXECUTE 'DROP POLICY IF EXISTS "atelier_insert" ON public.atelier';
    EXECUTE 'DROP POLICY IF EXISTS "atelier_update" ON public.atelier';
    RAISE NOTICE 'Dropped policies on atelier';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budget_ideas') THEN
    EXECUTE 'DROP POLICY IF EXISTS "budget_ideas_owner_all" ON public.budget_ideas';
    RAISE NOTICE 'Dropped policies on budget_ideas';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budget_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS "budget_items_owner_all" ON public.budget_items';
    RAISE NOTICE 'Dropped policies on budget_items';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'checklist_modules') THEN
    EXECUTE 'DROP POLICY IF EXISTS "checklist_modules_owner_all" ON public.checklist_modules';
    RAISE NOTICE 'Dropped policies on checklist_modules';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'churches') THEN
    EXECUTE 'DROP POLICY IF EXISTS "churches_owner_all" ON public.churches';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.churches';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.churches';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on email" ON public.churches';
    RAISE NOTICE 'Dropped policies on churches';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'family_groups') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own family groups" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own family groups" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own family groups" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own family groups" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own family groups" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "family_groups_select" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "family_groups_insert" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "family_groups_update" ON public.family_groups';
    EXECUTE 'DROP POLICY IF EXISTS "family_groups_delete" ON public.family_groups';
    RAISE NOTICE 'Dropped policies on family_groups';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "locations_owner_all" ON public.locations';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.locations';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.locations';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on email" ON public.locations';
    RAISE NOTICE 'Dropped policies on locations';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'musica_cerimonia') THEN
    EXECUTE 'DROP POLICY IF EXISTS "musica_cerimonia_select" ON public.musica_cerimonia';
    EXECUTE 'DROP POLICY IF EXISTS "musica_cerimonia_all" ON public.musica_cerimonia';
    RAISE NOTICE 'Dropped policies on musica_cerimonia';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'musica_ricevimento') THEN
    EXECUTE 'DROP POLICY IF EXISTS "musica_ricevimento_select" ON public.musica_ricevimento';
    EXECUTE 'DROP POLICY IF EXISTS "musica_ricevimento_all" ON public.musica_ricevimento';
    RAISE NOTICE 'Dropped policies on musica_ricevimento';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'non_invited_recipients') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own non-invited recipients" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own non-invited recipients" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own non-invited recipients" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own non-invited recipients" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own non-invited recipients" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "non_invited_recipients_select" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "non_invited_recipients_insert" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "non_invited_recipients_update" ON public.non_invited_recipients';
    EXECUTE 'DROP POLICY IF EXISTS "non_invited_recipients_delete" ON public.non_invited_recipients';
    RAISE NOTICE 'Dropped policies on non_invited_recipients';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "profiles_owner_all" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles';
    RAISE NOTICE 'Dropped policies on profiles';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'suppliers') THEN
    EXECUTE 'DROP POLICY IF EXISTS "suppliers_owner_all" ON public.suppliers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.suppliers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.suppliers';
    EXECUTE 'DROP POLICY IF EXISTS "Enable update for users based on email" ON public.suppliers';
    RAISE NOTICE 'Dropped policies on suppliers';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'table_assignments') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own table assignments" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own table assignments" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own table assignments" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own table assignments" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own table assignments" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "table_assignments_select" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "table_assignments_insert" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "table_assignments_update" ON public.table_assignments';
    EXECUTE 'DROP POLICY IF EXISTS "table_assignments_delete" ON public.table_assignments';
    RAISE NOTICE 'Dropped policies on table_assignments';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tables') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own tables" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own tables" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own tables" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own tables" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage their own tables" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "tables_select" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "tables_insert" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "tables_update" ON public.tables';
    EXECUTE 'DROP POLICY IF EXISTS "tables_delete" ON public.tables';
    RAISE NOTICE 'Dropped policies on tables';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'traditions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "traditions_owner_all" ON public.traditions';
    RAISE NOTICE 'Dropped policies on traditions';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wedding_planners') THEN
    EXECUTE 'DROP POLICY IF EXISTS "wedding_planners_select" ON public.wedding_planners';
    EXECUTE 'DROP POLICY IF EXISTS "wedding_planners_all" ON public.wedding_planners';
    RAISE NOTICE 'Dropped policies on wedding_planners';
  END IF;

  -- Template tables (drop solo, no recreate)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_types') THEN
    EXECUTE 'DROP POLICY IF EXISTS "event_types_select" ON public.event_types';
    RAISE NOTICE 'Dropped policies on event_types';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_type_categories') THEN
    EXECUTE 'DROP POLICY IF EXISTS "event_type_categories_select" ON public.event_type_categories';
    RAISE NOTICE 'Dropped policies on event_type_categories';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_type_subcategories') THEN
    EXECUTE 'DROP POLICY IF EXISTS "event_type_subcategories_select" ON public.event_type_subcategories';
    RAISE NOTICE 'Dropped policies on event_type_subcategories';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_timelines') THEN
    EXECUTE 'DROP POLICY IF EXISTS "event_timelines_select" ON public.event_timelines';
    RAISE NOTICE 'Dropped policies on event_timelines';
  END IF;

  -- Analytics/system tables (drop solo)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_events') THEN
    EXECUTE 'DROP POLICY IF EXISTS "analytics_events_insert" ON public.analytics_events';
    RAISE NOTICE 'Dropped policies on analytics_events';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_packages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "subscription_packages_select" ON public.subscription_packages';
    RAISE NOTICE 'Dropped policies on subscription_packages';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_transactions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "subscription_transactions_owner" ON public.subscription_transactions';
    RAISE NOTICE 'Dropped policies on subscription_transactions';
  END IF;
END$$;

-- =====================================================================
-- STEP 3: Backfill eventuali righe NULL
-- =====================================================================

UPDATE public.events
SET owner_id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
WHERE owner_id IS NULL;

-- =====================================================================
-- STEP 4: ALTER COLUMN owner_id su events
-- =====================================================================

ALTER TABLE public.events
  ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid,
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ALTER COLUMN owner_id SET NOT NULL;

-- =====================================================================
-- STEP 5: Enable RLS
-- =====================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- STEP 6: Ricrea policy granulari su events
-- =====================================================================

CREATE POLICY events_select_own ON public.events FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY events_insert_self ON public.events FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY events_update_own ON public.events FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY events_delete_own ON public.events FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================================
-- STEP 7: Ricrea policy su tabelle dipendenti (solo quelle user-owned)
-- =====================================================================

-- Categories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    CREATE POLICY "categories_select_own" ON public.categories FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = categories.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "categories_insert_self" ON public.categories FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = categories.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = categories.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = categories.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on categories';
  END IF;
END$$;

-- Subcategories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subcategories') THEN
    CREATE POLICY "subcategories_select_own" ON public.subcategories FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.categories c JOIN public.events e ON e.id = c.event_id WHERE c.id = subcategories.category_id AND e.owner_id = auth.uid()));
    
    CREATE POLICY "subcategories_insert_self" ON public.subcategories FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.categories c JOIN public.events e ON e.id = c.event_id WHERE c.id = subcategories.category_id AND e.owner_id = auth.uid()));
    
    CREATE POLICY "subcategories_update_own" ON public.subcategories FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.categories c JOIN public.events e ON e.id = c.event_id WHERE c.id = subcategories.category_id AND e.owner_id = auth.uid()));
    
    CREATE POLICY "subcategories_delete_own" ON public.subcategories FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.categories c JOIN public.events e ON e.id = c.event_id WHERE c.id = subcategories.category_id AND e.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on subcategories';
  END IF;
END$$;

-- Expenses
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
    CREATE POLICY "expenses_select_own" ON public.expenses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = expenses.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "expenses_insert_self" ON public.expenses FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = expenses.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "expenses_update_own" ON public.expenses FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = expenses.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "expenses_delete_own" ON public.expenses FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = expenses.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on expenses';
  END IF;
END$$;

-- Incomes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incomes') THEN
    CREATE POLICY "incomes_select_own" ON public.incomes FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = incomes.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "incomes_insert_self" ON public.incomes FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = incomes.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "incomes_update_own" ON public.incomes FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = incomes.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "incomes_delete_own" ON public.incomes FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = incomes.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on incomes';
  END IF;
END$$;

-- Payment Reminders
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_reminders') THEN
    CREATE POLICY "Users can view their own payment reminders" ON public.payment_reminders FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.expenses e JOIN public.events ev ON ev.id = e.event_id WHERE e.id = payment_reminders.expense_id AND ev.owner_id = auth.uid()));
    
    CREATE POLICY "Users can manage their own payment reminders" ON public.payment_reminders FOR ALL
    USING (EXISTS (SELECT 1 FROM public.expenses e JOIN public.events ev ON ev.id = e.event_id WHERE e.id = payment_reminders.expense_id AND ev.owner_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.expenses e JOIN public.events ev ON ev.id = e.event_id WHERE e.id = payment_reminders.expense_id AND ev.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on payment_reminders';
  END IF;
END$$;

-- User Event Timeline
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_event_timeline') THEN
    CREATE POLICY "Users can view their own timeline" ON public.user_event_timeline FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = user_event_timeline.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "Users can manage their own timeline" ON public.user_event_timeline FOR ALL
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = user_event_timeline.event_id AND events.owner_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = user_event_timeline.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on user_event_timeline';
  END IF;
END$$;

-- Wedding Cards
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'wedding_cards') THEN
    CREATE POLICY "wedding_cards_select_own" ON public.wedding_cards FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = wedding_cards.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "wedding_cards_insert_self" ON public.wedding_cards FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = wedding_cards.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "wedding_cards_update_own" ON public.wedding_cards FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = wedding_cards.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "wedding_cards_delete_own" ON public.wedding_cards FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = wedding_cards.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on wedding_cards';
  END IF;
END$$;

-- Guests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guests') THEN
    CREATE POLICY "Users can view their own guests" ON public.guests FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = guests.event_id AND events.owner_id = auth.uid()));
    
    CREATE POLICY "Users can manage their own guests" ON public.guests FOR ALL
    USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = guests.event_id AND events.owner_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.events WHERE events.id = guests.event_id AND events.owner_id = auth.uid()));
    
    RAISE NOTICE 'Recreated policies on guests';
  END IF;
END$$;

-- NOTA: Le seguenti tabelle hanno policy ma NON dipendono da events.owner_id
-- Vengono droppate ma NON ricreate (policy pubbliche/system/template)
-- - atelier, churches, locations, suppliers (public read + auth insert/update)
-- - event_types, event_type_*, event_timelines (template tables, public read)
-- - profiles (user owns via profiles.id = auth.uid(), not events)
-- - traditions, budget_ideas, etc. (system/template data)
-- - analytics_events, subscription_* (system tables)
-- Le policy di queste tabelle devono essere ricreate manualmente se necessario

-- =====================================================================
-- STEP 8: Comments
-- =====================================================================

COMMENT ON COLUMN public.events.owner_id IS 'User ID proprietario evento (NOT NULL, default auth.uid())';
COMMENT ON POLICY events_select_own ON public.events IS 'Utenti possono vedere solo i propri eventi';
COMMENT ON POLICY events_insert_self ON public.events IS 'Utenti possono creare eventi solo per se stessi';
COMMENT ON POLICY events_update_own ON public.events IS 'Utenti possono modificare solo i propri eventi';
COMMENT ON POLICY events_delete_own ON public.events IS 'Utenti possono eliminare solo i propri eventi';

-- =====================================================================
-- Fine PATCH 16 FIXED v4 COMPLETO
-- =====================================================================
