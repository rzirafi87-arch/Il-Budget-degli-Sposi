-- Canonical i18n schema for neutral event definitions + translations
-- Run after enabling the pgcrypto extension (needed for UUID defaults).

begin;

create schema if not exists app_i18n;

-- Master list of locales available to the application (ltr + rtl supported).
create table if not exists app_i18n.locales (
  code text primary key,
  name text not null,
  direction text not null default 'ltr' check (direction in ('ltr','rtl')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- List of countries supported (used to attach overrides).
create table if not exists app_i18n.countries (
  code text primary key,
  name text not null,
  default_locale text not null references app_i18n.locales(code),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Neutral event types (no language specific labels).
create table if not exists app_i18n.event_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_i18n_event_types_code on app_i18n.event_types(code);

create table if not exists app_i18n.event_type_translations (
  event_type_id uuid not null references app_i18n.event_types(id) on delete cascade,
  locale text not null references app_i18n.locales(code) on delete cascade,
  name text not null,
  description text,
  primary key (event_type_id, locale)
);

-- Optional overrides per country (json structure defined at application level).
create table if not exists app_i18n.event_type_variants (
  event_type_id uuid not null references app_i18n.event_types(id) on delete cascade,
  country_code text not null references app_i18n.countries(code) on delete cascade,
  overrides jsonb not null default '{}'::jsonb,
  primary key (event_type_id, country_code)
);

-- Categories are neutral and translated separately.
create table if not exists app_i18n.categories (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references app_i18n.event_types(id) on delete cascade,
  code text not null,
  sort int not null default 0,
  unique (event_type_id, code)
);

create table if not exists app_i18n.category_translations (
  category_id uuid not null references app_i18n.categories(id) on delete cascade,
  locale text not null references app_i18n.locales(code) on delete cascade,
  name text not null,
  primary key (category_id, locale)
);

create table if not exists app_i18n.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references app_i18n.categories(id) on delete cascade,
  code text not null,
  sort int not null default 0,
  unique (category_id, code)
);

create table if not exists app_i18n.subcategory_translations (
  subcategory_id uuid not null references app_i18n.subcategories(id) on delete cascade,
  locale text not null references app_i18n.locales(code) on delete cascade,
  name text not null,
  primary key (subcategory_id, locale)
);

-- Timeline entries expressed as offsets (days) relative to event date.
create table if not exists app_i18n.event_timelines (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid not null references app_i18n.event_types(id) on delete cascade,
  key text not null,
  offset_days int not null,
  sort int not null default 0,
  unique (event_type_id, key)
);

create index if not exists idx_app_i18n_timelines_event on app_i18n.event_timelines(event_type_id, sort);

create table if not exists app_i18n.event_timeline_translations (
  timeline_id uuid not null references app_i18n.event_timelines(id) on delete cascade,
  locale text not null references app_i18n.locales(code) on delete cascade,
  title text not null,
  description text,
  primary key (timeline_id, locale)
);

commit;
