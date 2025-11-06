-- i18n and event type translated schema (idempotent)
-- This script creates the necessary tables if they don't already exist.

create table if not exists i18n_locales (
  code text primary key,
  name text not null,
  direction text not null default 'ltr' check (direction in ('ltr','rtl'))
);

create table if not exists geo_countries (
  code text primary key,
  default_locale text references i18n_locales(code)
);

create table if not exists event_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null
);

create table if not exists event_type_translations (
  event_type_id uuid references event_types(id) on delete cascade,
  locale text references i18n_locales(code),
  name text not null,
  primary key (event_type_id, locale)
);

create table if not exists event_type_variants (
  event_type_id uuid references event_types(id) on delete cascade,
  country_code text references geo_countries(code),
  overrides jsonb not null default '{}'::jsonb,
  primary key (event_type_id, country_code)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid references event_types(id) on delete cascade,
  sort int not null default 0
);

create table if not exists category_translations (
  category_id uuid references categories(id) on delete cascade,
  locale text references i18n_locales(code),
  name text not null,
  primary key (category_id, locale)
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  sort int not null default 0
);

create table if not exists subcategory_translations (
  subcategory_id uuid references subcategories(id) on delete cascade,
  locale text references i18n_locales(code),
  name text not null,
  primary key (subcategory_id, locale)
);

create table if not exists event_timelines (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid references event_types(id) on delete cascade,
  key text not null,
  offset_days int not null,
  sort_order int default 0,
  category text,
  is_critical boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_type_id, key)
);

create table if not exists event_timeline_translations (
  timeline_id uuid references event_timelines(id) on delete cascade,
  locale text references i18n_locales(code),
  title text not null,
  description text,
  primary key (timeline_id, locale)
);

-- Optional indexes for performance
create index if not exists idx_categories_event_type_sort on categories(event_type_id, sort);
create index if not exists idx_subcategories_category_sort on subcategories(category_id, sort);
create index if not exists idx_event_timelines_type_key on event_timelines(event_type_id, key);
create index if not exists idx_event_timelines_offset on event_timelines(event_type_id, offset_days);
