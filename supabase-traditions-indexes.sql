-- Indexes to speed up traditions/checklist/budget template and user queries
begin;

-- Traditions by country
create index if not exists idx_traditions_country on public.traditions(country_code);

-- Checklist modules by country and tradition
create index if not exists idx_checklist_modules_country on public.checklist_modules(country_code);
create index if not exists idx_checklist_modules_tradition on public.checklist_modules(tradition_id);

-- Budget items templates and per-event
create index if not exists idx_budget_items_country on public.budget_items(country_code);
create index if not exists idx_budget_items_event on public.budget_items(event_id);
create index if not exists idx_budget_items_tradition on public.budget_items(tradition_id);

commit;

