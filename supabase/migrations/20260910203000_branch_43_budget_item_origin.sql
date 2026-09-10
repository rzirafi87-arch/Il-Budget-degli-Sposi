-- Branch 43 follow-up: keep applied budget ideas separate from manually managed budget items.

alter table public.budget_items
  add column if not exists source text not null default 'manual';

alter table public.budget_items drop constraint if exists budget_items_source_check;
alter table public.budget_items add constraint budget_items_source_check
  check (source in ('manual', 'budget_idea'));

create index if not exists idx_budget_items_event_country_source
  on public.budget_items (event_id, country_code, source);

comment on column public.budget_items.source is
  'Origin of the row. budget_idea rows may be replaced idempotently without touching manual budget work.';
