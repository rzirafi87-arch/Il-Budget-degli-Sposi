-- Disposable CI only: reviewed trigger before budget_idea exclusion.
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
    if new.status is null or new.status = 'rejected' then return new; end if;
    if tg_op = 'UPDATE' and old.status is not null and old.status <> 'rejected' then return new; end if;
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
