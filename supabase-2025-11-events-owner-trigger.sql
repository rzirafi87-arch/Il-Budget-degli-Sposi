-- =====================================================================
-- PATCH 17: Trigger automatico per impostare owner_id su events
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Garantire che ogni nuovo evento abbia owner_id valorizzato
--        automaticamente con auth.uid() se NULL al momento dell'insert.
--        Questo trigger evita che INSERT manuali dimentichino owner_id.
-- =====================================================================

-- Funzione trigger: imposta owner_id se NULL
create or replace function public.set_owner_id()
returns trigger as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

comment on function public.set_owner_id() is 
'Trigger function: auto-popola owner_id con auth.uid() se NULL su insert events';

-- Trigger: before insert su events
drop trigger if exists trg_events_set_owner on public.events;

create trigger trg_events_set_owner
before insert on public.events
for each row execute function public.set_owner_id();

comment on trigger trg_events_set_owner on public.events is 
'Auto-popola owner_id con auth.uid() se NULL prima di INSERT su events';
