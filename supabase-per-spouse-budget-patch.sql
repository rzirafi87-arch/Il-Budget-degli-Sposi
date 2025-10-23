-- Adds per-spouse initial budgets and emails to events
-- Safe to run multiple times
alter table if exists public.events
  add column if not exists bride_initial_budget numeric default 0,
  add column if not exists groom_initial_budget numeric default 0,
  add column if not exists bride_email text,
  add column if not exists groom_email text;

-- Optional: simple check constraint to keep values non-negative
-- PostgreSQL safe way to add constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_budgets_nonnegative'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_budgets_nonnegative
      CHECK (
        coalesce(bride_initial_budget,0) >= 0 and
        coalesce(groom_initial_budget,0) >= 0 and
        coalesce(total_budget,0) >= 0
      );
  END IF;
END $$;
