-- =========================================
-- ADD spend_type COLUMN TO EXPENSES
-- =========================================
-- Run this in Supabase SQL Editor to add the spend_type field
-- If the column already exists, this will not cause an error

alter table public.expenses
  add column if not exists spend_type text not null default 'common';  -- common | bride | groom

comment on column public.expenses.spend_type is 'Type of expense: common (shared), bride, or groom';
