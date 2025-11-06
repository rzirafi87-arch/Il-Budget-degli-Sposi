-- =====================================================
-- PATCH: Timeline reminders + RLS
-- =====================================================
-- Aggiunge colonne per reminder e abilita RLS per public.timeline_items
-- Sicuro da eseguire più volte (IF NOT EXISTS)
-- =====================================================

BEGIN;

-- Colonne reminder
ALTER TABLE public.timeline_items
  ADD COLUMN IF NOT EXISTS remind_days_before INT,
  ADD COLUMN IF NOT EXISTS remind_opt_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS remind_channel TEXT;

-- Vincolo canale (email|push|none)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'timeline_items_remind_channel_chk'
  ) THEN
    ALTER TABLE public.timeline_items
      ADD CONSTRAINT timeline_items_remind_channel_chk
      CHECK (remind_channel IS NULL OR remind_channel IN ('email','push','none'));
  END IF;
END $$;

-- Abilita RLS e policy owner
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='timeline_items' AND policyname='timeline_owner_all'
  ) THEN
    DROP POLICY timeline_owner_all ON public.timeline_items;
  END IF;
END $$;

CREATE POLICY timeline_owner_all ON public.timeline_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = timeline_items.event_id
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Indici utili (idempotenti)
CREATE INDEX IF NOT EXISTS idx_timeline_event_id ON public.timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_days_before ON public.timeline_items(days_before);

-- Commenti
COMMENT ON COLUMN public.timeline_items.remind_days_before IS 'Giorni prima dell\'evento in cui inviare il promemoria';
COMMENT ON COLUMN public.timeline_items.remind_opt_in IS 'L\'utente desidera ricevere promemoria per questo task';
COMMENT ON COLUMN public.timeline_items.remind_channel IS 'Canale di reminder: email|push|none';

COMMIT;
