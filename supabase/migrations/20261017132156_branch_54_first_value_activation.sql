-- Branch 54: a private, transactional first-value metric. No historical backfill:
-- old template data must never be reported as a new activation.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
-- Capture a stable pre-install cohort before enabling the new triggers.
-- Existing writers finish first; new writers wait until the capture commits.
lock table public.budget_items, public.expenses, public.saved_suppliers in share row exclusive mode;
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

-- Exclusion is not an activation: no timestamp/action is fabricated for legacy
-- events. Keep it even after their old value rows are deleted. Reapplying this
-- migration never excludes an event already tracked by the new ledger.
create table if not exists private.activation_legacy_events (
  event_id uuid primary key references public.events(id) on delete cascade
);
alter table private.activation_legacy_events enable row level security;
revoke all on private.activation_legacy_events from public, anon, authenticated, service_role;
grant select on private.activation_legacy_events to service_role;
insert into private.activation_legacy_events(event_id)
select distinct existing_value.event_id from (
  select event_id from public.budget_items where event_id is not null and source = 'manual'
  union all
  select event_id from public.expenses where status is not null and status <> 'rejected'
    and not (status = 'planned' and from_dashboard is true)
  union all
  select event_id from public.saved_suppliers where status in ('SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED')
) existing_value
where not exists(select 1 from private.event_activations tracked where tracked.event_id=existing_value.event_id)
on conflict (event_id) do nothing;

-- Trigger-only definer is needed because callers cannot write the private
-- ledger. Authorization remains on each originating relation (RLS/server APIs).
-- No public RPC, dynamic SQL, identity claims or user payload are accepted.
create or replace function private.record_first_value()
returns trigger language plpgsql security definer set search_path = '' as $$
declare action_name text;
begin
  if new.event_id is null then return new; end if;
  if exists(select 1 from private.activation_legacy_events legacy where legacy.event_id=new.event_id) then return new; end if;
  if tg_table_schema <> 'public' then raise exception 'INVALID_ACTIVATION_SOURCE'; end if;
  if tg_table_name = 'saved_suppliers' then
    if new.status not in ('SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED') then return new; end if;
    -- Existing valid records are not new first value: no cohort backfill on
    -- ordinary lifecycle updates after installing this migration.
    if tg_op = 'UPDATE' and old.status in ('SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED') then return new; end if;
    action_name := 'supplier';
  elsif tg_table_name = 'expenses' then
    -- Saving an Idea di Budget snapshot is setup, just like budget_idea rows.
    if new.status is null or new.status = 'rejected' or (new.status = 'planned' and new.from_dashboard is true) then return new; end if;
    if tg_op = 'UPDATE' and old.status is not null and old.status <> 'rejected'
      and not (old.status = 'planned' and old.from_dashboard is true) then return new; end if;
    action_name := 'expense';
  elsif tg_table_name = 'budget_items' then
    -- Applying a model is setup, not the first manual value action.
    if new.source <> 'manual' then return new; end if;
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
create trigger record_expense_first_value after insert or update of status, from_dashboard on public.expenses
for each row execute function private.record_first_value();
drop trigger if exists record_supplier_first_value on public.saved_suppliers;
create trigger record_supplier_first_value after insert or update of status on public.saved_suppliers
for each row execute function private.record_first_value();
commit;
