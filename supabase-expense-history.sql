-- Script: supabase-expense-history.sql
-- Crea tabella per storico modifiche spese (expense_history)

create table if not exists expense_history (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null, -- 'create', 'update', 'delete', 'status_change'
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_expense_history_expense_id on expense_history(expense_id);
create index if not exists idx_expense_history_user_id on expense_history(user_id);

-- Nota: la tabella va popolata via trigger o logica API.
