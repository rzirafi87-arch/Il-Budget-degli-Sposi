-- Creates table for storing "idea di spesa" per categoria

CREATE TABLE IF NOT EXISTS public.budget_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  idea_amount NUMERIC(10,2) DEFAULT 0,
  inserted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_budget_idea UNIQUE (event_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_budget_ideas_event ON public.budget_ideas(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_ideas_category ON public.budget_ideas(category_id);

-- Basic RLS: readable by anyone, writable by owner via event ownership
ALTER TABLE public.budget_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS budget_ideas_read_all ON public.budget_ideas;
CREATE POLICY budget_ideas_read_all ON public.budget_ideas FOR SELECT USING (true);

-- You may want stricter policies tied to auth.uid() and event owner_id.

