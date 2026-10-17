-- Branch 54: a private, transactional first-value metric. No historical backfill:
-- old template data must never be reported as a new activation.
begin;
create table if not exists private.event_activations (
  event_id uuid primary key references public.events(id) on delete cascade,
  activated_at timestamptz not null default now(),
  first_action text not null check (first_action in ('budget_item','expense','supplier'))
);
alter table private.event_activations enable row level security;
revoke all on private.event_activations from public, anon, authenticated, service_role;
-- Administrative reporting only; application clients cannot read this metric.
grant usage on schema private to service_role;
grant select on private.event_activations to service_role;

-- Trigger-only definer is needed because callers cannot write the private
-- ledger. Authorization remains on each originating relation (RLS/server APIs).
-- No public RPC, dynamic SQL, identity claims or user payload are accepted.
create or replace function private.record_first_value()
returns trigger language plpgsql security definer set search_path = '' as $$
declare action_name text;
begin
  if new.event_id is null then return new; end if;
  if tg_table_schema <> 'public' then raise exception 'INVALID_ACTIVATION_SOURCE'; end if;
  if tg_table_name = 'saved_suppliers' then
    if new.status not in ('SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED') then return new; end if;
    action_name := 'supplier';
  elsif tg_table_name = 'expenses' then
    if new.status = 'rejected' then return new; end if;
    action_name := 'expense';
  elsif tg_table_name = 'budget_items' then
    action_name := 'budget_item';
  else
    raise exception 'INVALID_ACTIVATION_SOURCE';
  end if;
  insert into private.event_activations(event_id,first_action)
  values (new.event_id,action_name) on conflict (event_id) do nothing;
  return new;
end $$;
revoke all on function private.record_first_value() from public, anon, authenticated, service_role;

drop trigger if exists record_budget_first_value on public.budget_items;
create trigger record_budget_first_value after insert on public.budget_items
for each row execute function private.record_first_value();
drop trigger if exists record_expense_first_value on public.expenses;
create trigger record_expense_first_value after insert or update of status on public.expenses
for each row execute function private.record_first_value();
drop trigger if exists record_supplier_first_value on public.saved_suppliers;
create trigger record_supplier_first_value after insert or update of status on public.saved_suppliers
for each row execute function private.record_first_value();
commit;
