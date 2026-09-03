-- Branch 38 follow-up: production recovery.
-- The application has long-supported committed/paid and payment tracking fields,
-- but the production database still exposes only the earlier `amount` contract.
-- Keep all legacy columns and add the missing fields non-destructively.

alter table public.expenses
  add column if not exists committed_amount numeric default 0,
  add column if not exists paid_amount numeric default 0,
  add column if not exists notes text,
  add column if not exists payment_method text,
  add column if not exists payment_date date,
  add column if not exists payment_status text default 'pending',
  add column if not exists payment_notes text;

-- Preserve existing data: old `amount` represented the committed value.
update public.expenses
set committed_amount = coalesce(committed_amount, amount, 0)
where committed_amount is null or committed_amount = 0;

-- Keep payment fields bounded to values already used by the application.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'expenses_payment_method_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_payment_method_check
      check (payment_method is null or payment_method in ('cash','bank_transfer','credit_card','debit_card','check','paypal','other'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'expenses_payment_status_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_payment_status_check
      check (payment_status is null or payment_status in ('pending','paid','partial','overdue','canceled'));
  end if;
end $$;

create index if not exists idx_expenses_payment_status on public.expenses(payment_status);
create index if not exists idx_expenses_payment_method on public.expenses(payment_method);
create index if not exists idx_expenses_payment_date on public.expenses(payment_date);
