-- Disposable CI only: restore the reviewed pre-fix trigger to prove RED.
create or replace function private.record_first_value()
returns trigger language plpgsql security definer set search_path = '' as $$
declare action_name text;
begin
  if new.event_id is null then return new; end if;
  if tg_table_name = 'saved_suppliers' then
    if new.status not in ('SAVED','CONTACTED','QUOTE_REQUESTED','QUOTE_RECEIVED','SHORTLISTED','SELECTED') then return new; end if;
    action_name := 'supplier';
  elsif tg_table_name = 'expenses' then
    if new.status = 'rejected' then return new; end if;
    action_name := 'expense';
  else action_name := 'budget_item';
  end if;
  insert into private.event_activations(event_id,first_action)
  values (new.event_id,action_name) on conflict (event_id) do nothing;
  return new;
end $$;
