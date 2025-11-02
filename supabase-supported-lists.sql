-- Supported countries and languages for dynamic onboarding/localization
-- Safe defaults: public read, writes disabled (service role bypasses RLS)

begin;

create table if not exists public.supported_countries (
  code text primary key,
  name text not null,
  enabled boolean not null default true
);

create table if not exists public.supported_languages (
  code text primary key,
  name text not null,
  enabled boolean not null default true,
  default_country text null references public.supported_countries(code)
);

-- Helpful indexes for fast lookups
create index if not exists idx_supported_countries_enabled on public.supported_countries(enabled);
create index if not exists idx_supported_languages_enabled on public.supported_languages(enabled);
create index if not exists idx_supported_languages_country on public.supported_languages(default_country);

-- RLS: allow reads to everyone (public lists), block writes by default
alter table public.supported_countries enable row level security;
alter table public.supported_languages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'supported_countries' and policyname = 'supported_countries_select_public'
  ) then
    create policy supported_countries_select_public on public.supported_countries
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'supported_languages' and policyname = 'supported_languages_select_public'
  ) then
    create policy supported_languages_select_public on public.supported_languages
      for select using (true);
  end if;
end $$;

-- Seed minimal dataset (idempotent upserts)
insert into public.supported_countries(code, name, enabled) values
  ('it', 'Italy', true),
  ('us', 'United States', true),
  ('in', 'India', true),
  ('jp', 'Japan', true),
  ('ru', 'Russia', true),
  ('fr', 'France', true),
  ('ar', 'Arabia', true),
  ('mx', 'Mexico', true)
on conflict (code) do update set name = excluded.name, enabled = excluded.enabled;

insert into public.supported_languages(code, name, enabled, default_country) values
  ('it', 'Italiano', true, 'it'),
  ('en', 'English', true, 'us'),
  ('es', 'Español', true, 'mx'),
  ('fr', 'Français', true, 'fr'),
  ('de', 'Deutsch', true, null),
  ('ru', 'Русский', true, 'ru'),
  ('ja', '日本語', true, 'jp'),
  ('ar', 'العربية', true, 'ar'),
  ('zh', '中文', true, null)
on conflict (code) do update set name = excluded.name, enabled = excluded.enabled, default_country = excluded.default_country;

commit;

