-- Adds per-spouse initial budgets and emails to events
-- Safe to run multiple times
alter table if exists public.events
  add column if not exists bride_initial_budget numeric default 0,
  add column if not exists groom_initial_budget numeric default 0,
  add column if not exists bride_email text,
  add column if not exists groom_email text;

-- Optional: simple check constraint to keep values non-negative
alter table if exists public.events
  add constraint if not exists events_budgets_nonnegative
  check (
    coalesce(bride_initial_budget,0) >= 0 and
    coalesce(groom_initial_budget,0) >= 0 and
    coalesce(total_budget,0) >= 0
  );
