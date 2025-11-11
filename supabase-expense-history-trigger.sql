-- Script: supabase-expense-history-trigger.sql
-- Trigger per tracciare modifiche sulla tabella expenses e loggare in expense_history

create or replace function log_expense_history() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    insert into expense_history (expense_id, user_id, action, new_data)
    values (NEW.id, NEW.user_id, 'create', to_jsonb(NEW));
    return NEW;
  elsif (TG_OP = 'UPDATE') then
    insert into expense_history (expense_id, user_id, action, old_data, new_data)
    values (NEW.id, NEW.user_id, 'update', to_jsonb(OLD), to_jsonb(NEW));
    return NEW;
  elsif (TG_OP = 'DELETE') then
    insert into expense_history (expense_id, user_id, action, old_data)
    values (OLD.id, OLD.user_id, 'delete', to_jsonb(OLD));
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Drop e ricrea trigger per evitare duplicati

drop trigger if exists tr_expense_history on expenses;
create trigger tr_expense_history
  after insert or update or delete on expenses
  for each row execute function log_expense_history();
