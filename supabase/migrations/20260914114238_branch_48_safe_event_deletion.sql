-- Schema-only: no existing event or catalog row is modified.
alter table public.budget_items
  drop constraint if exists budget_items_event_id_fkey;

alter table public.budget_items
  add constraint budget_items_event_id_fkey
  foreign key (event_id) references public.events(id) on delete cascade
  not valid;
