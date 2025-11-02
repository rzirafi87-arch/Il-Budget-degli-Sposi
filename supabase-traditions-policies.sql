-- RLS e Policy per tradizioni e tabelle correlate

-- Abilita RLS
ALTER TABLE IF EXISTS public.traditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checklist_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.budget_items ENABLE ROW LEVEL SECURITY;

-- Politiche di sola lettura pubblica (facoltative per contenuti pubblici)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'traditions' AND policyname = 'public read traditions'
  ) THEN
    CREATE POLICY "public read traditions" ON public.traditions
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'checklist_modules' AND policyname = 'public read checklist_modules'
  ) THEN
    CREATE POLICY "public read checklist_modules" ON public.checklist_modules
      FOR SELECT USING (true);
  END IF;
END $$;

-- Budget items: regole più granulari
-- 1) Lettura pubblica SOLO per voci "template" (senza event_id)
DROP POLICY IF EXISTS "public read budget_items" ON public.budget_items;
CREATE POLICY "public read budget_items" ON public.budget_items
  FOR SELECT USING (event_id IS NULL);

-- 2) Lettura per l'utente autenticato limitata alle proprie voci di evento
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'budget_items' AND policyname = 'user read own budget_items'
  ) THEN
    CREATE POLICY "user read own budget_items" ON public.budget_items
      FOR SELECT USING (
        event_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = budget_items.event_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3) Inserimento/aggiornamento/cancellazione consentiti solo al proprietario dell'evento
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'budget_items' AND policyname = 'user insert own budget_items'
  ) THEN
    CREATE POLICY "user insert own budget_items" ON public.budget_items
      FOR INSERT WITH CHECK (
        event_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = budget_items.event_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'budget_items' AND policyname = 'user update own budget_items'
  ) THEN
    CREATE POLICY "user update own budget_items" ON public.budget_items
      FOR UPDATE USING (
        event_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = budget_items.event_id AND e.owner_id = auth.uid()
        )
      ) WITH CHECK (
        event_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = budget_items.event_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'budget_items' AND policyname = 'user delete own budget_items'
  ) THEN
    CREATE POLICY "user delete own budget_items" ON public.budget_items
      FOR DELETE USING (
        event_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = budget_items.event_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Nota: le policy sopra permettono lettura pubblica solo dei template (senza event_id),
-- mentre tutte le operazioni su righe collegate a un evento sono vincolate all'owner.
