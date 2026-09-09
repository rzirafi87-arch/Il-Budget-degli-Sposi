-- Branch 41 runtime fix: Idea di Budget applies each row with its contributor.
alter table public.budget_items
  add column if not exists spend_type text not null default 'common';

comment on column public.budget_items.spend_type is
  'Contributor selected when an Idea di Budget row is applied.';

