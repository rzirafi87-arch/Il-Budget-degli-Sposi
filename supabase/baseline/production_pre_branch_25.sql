-- Canonical schema baseline captured from production before Branch 25 consolidation.
-- Schema only: no production rows, Auth identities, or secrets.
--
-- IMPORTANT: this file is intentionally outside supabase/migrations.
-- New isolated environments apply it explicitly, followed by repository migrations.
-- Never apply this baseline to the existing production database.

-- 10: pgcrypto
create extension if not exists pgcrypto with schema extensions;

-- 10: uuid-ossp
create extension if not exists "uuid-ossp" with schema extensions;

-- 20: budget_items_id_seq
create sequence if not exists public.budget_items_id_seq as integer increment by 1 minvalue 1 maxvalue 2147483647 start with 1 cache 1 no cycle;

-- 20: checklist_modules_id_seq
create sequence if not exists public.checklist_modules_id_seq as integer increment by 1 minvalue 1 maxvalue 2147483647 start with 1 cache 1 no cycle;

-- 20: traditions_id_seq
create sequence if not exists public.traditions_id_seq as integer increment by 1 minvalue 1 maxvalue 2147483647 start with 1 cache 1 no cycle;

-- 30: analytics_events
create table public.analytics_events (
  id uuid default uuid_generate_v4() not null,
  supplier_id uuid,
  location_id uuid,
  church_id uuid,
  event_type text not null,
  user_id uuid,
  session_id text,
  referrer text,
  user_agent text,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 30: atelier
create table public.atelier (
  id uuid default gen_random_uuid() not null,
  name text not null,
  category text not null,
  region text not null,
  province text,
  city text not null,
  address text,
  phone text,
  email text,
  website text,
  description text,
  price_range text,
  styles text[],
  capacity integer,
  services text[],
  verified boolean default false,
  source text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  country text default 'it'::text
);

-- 30: budget_ideas
create table public.budget_ideas (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  category_id uuid not null,
  idea_amount numeric(10,2) default 0,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 30: budget_items
create table public.budget_items (
  id integer default nextval('budget_items_id_seq'::regclass) not null,
  event_id uuid,
  name text not null,
  amount numeric,
  vendor_id uuid,
  tradition_id integer,
  country_code text not null
);

-- 30: categories
create table public.categories (
  id uuid default uuid_generate_v4() not null,
  event_id uuid,
  name text,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  display_order integer default 0,
  icon text,
  event_type_id uuid,
  sort integer default 0 not null
);

-- 30: category_translations
create table public.category_translations (
  category_id uuid not null,
  locale text not null,
  name text not null
);

-- 30: checklist_modules
create table public.checklist_modules (
  id integer default nextval('checklist_modules_id_seq'::regclass) not null,
  tradition_id integer,
  module_name text not null,
  is_required boolean default false,
  country_code text not null
);

-- 30: churches
create table public.churches (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  address text,
  phone text,
  email text,
  website text,
  description text,
  church_type text,
  capacity integer,
  requires_baptism boolean default false,
  requires_marriage_course boolean default false,
  verified boolean default false,
  user_id uuid,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  google_place_id text,
  google_rating numeric(2,1),
  google_rating_count integer,
  last_synced_at timestamp with time zone,
  subscription_tier text default 'free'::text,
  subscription_expires_at timestamp with time zone,
  is_featured boolean default false,
  profile_views integer default 0,
  contact_clicks integer default 0,
  website_clicks integer default 0,
  last_view_at timestamp with time zone,
  country text default 'it'::text
);

-- 30: event_timeline_translations
create table public.event_timeline_translations (
  timeline_id uuid not null,
  locale text not null,
  title text not null,
  description text
);

-- 30: event_timelines
create table public.event_timelines (
  id uuid default gen_random_uuid() not null,
  event_type_id uuid,
  title text not null,
  description text,
  offset_days integer not null,
  category text,
  is_critical boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  key text not null,
  sort_order integer default 0
);

-- 30: event_type_categories
create table public.event_type_categories (
  id uuid default gen_random_uuid() not null,
  event_type_id uuid,
  name text not null,
  sort integer default 0 not null,
  icon text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 30: event_type_subcategories
create table public.event_type_subcategories (
  id uuid default gen_random_uuid() not null,
  category_id uuid,
  name text not null,
  sort integer default 0 not null,
  default_budget numeric(12,2) default 0,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 30: event_type_translations
create table public.event_type_translations (
  event_type_id uuid not null,
  locale text not null,
  name text not null
);

-- 30: event_type_variants
create table public.event_type_variants (
  event_type_id uuid not null,
  country_code text not null,
  overrides jsonb default '{}'::jsonb not null
);

-- 30: event_types
create table public.event_types (
  id uuid default gen_random_uuid() not null,
  code text not null,
  name text not null,
  locale text default 'it-IT'::text not null,
  description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 30: events
create table public.events (
  id uuid default uuid_generate_v4() not null,
  owner_id uuid default auth.uid() not null,
  public_id text,
  name text default 'Il nostro matrimonio'::text,
  currency text default 'EUR'::text,
  total_budget numeric(10,2) default 0,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  bride_initial_budget numeric default 0,
  groom_initial_budget numeric default 0,
  bride_email text,
  groom_email text,
  default_rsvp_deadline date,
  language text default 'it'::text,
  country text default 'it'::text,
  event_type text default 'wedding'::text,
  event_date date,
  event_location text,
  description text,
  color_theme text
);

-- 30: expenses
create table public.expenses (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  category text,
  subcategory text,
  supplier text,
  amount numeric(10,2) default 0,
  status text default 'pending'::text,
  spend_type text default 'common'::text,
  description text,
  expense_date date,
  from_dashboard boolean default false,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  payment_installments jsonb default '[]'::jsonb,
  subcategory_id uuid
);

-- 30: family_groups
create table public.family_groups (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  family_name character varying(255) not null,
  main_contact_guest_id uuid,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 30: geo_countries
create table public.geo_countries (
  code text not null,
  default_locale text
);

-- 30: guests
create table public.guests (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  name text not null,
  guest_type text not null,
  is_main_contact boolean default false,
  invitation_date date,
  rsvp_deadline date,
  rsvp_received boolean default false,
  attending boolean default false,
  menu_preferences text[] default '{}'::text[],
  receives_bomboniera boolean default false,
  notes text default ''::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  family_group_id uuid,
  exclude_from_family_table boolean default false
);

-- 30: i18n_locales
create table public.i18n_locales (
  code text not null,
  name text not null,
  direction text default 'ltr'::text not null
);

-- 30: incomes
create table public.incomes (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  name text not null,
  type text not null,
  amount numeric(10,2) default 0,
  notes text,
  date date default CURRENT_DATE not null,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  income_source text default 'common'::text
);

-- 30: locations
create table public.locations (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  address text,
  phone text,
  email text,
  website text,
  description text,
  price_range text,
  capacity_min integer,
  capacity_max integer,
  location_type text,
  verified boolean default false,
  user_id uuid,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  google_place_id text,
  google_rating numeric(2,1),
  google_rating_count integer,
  last_synced_at timestamp with time zone,
  subscription_tier text default 'free'::text,
  subscription_expires_at timestamp with time zone,
  is_featured boolean default false,
  profile_views integer default 0,
  contact_clicks integer default 0,
  website_clicks integer default 0,
  last_view_at timestamp with time zone,
  country text default 'it'::text
);

-- 30: musica_cerimonia
create table public.musica_cerimonia (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  phone text,
  email text,
  website text,
  description text,
  price_range text,
  music_type text,
  verified boolean default false,
  status text default 'pending'::text,
  submitted_by uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  country text default 'it'::text
);

-- 30: musica_ricevimento
create table public.musica_ricevimento (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  phone text,
  email text,
  website text,
  description text,
  price_range text,
  music_type text,
  verified boolean default false,
  status text default 'pending'::text,
  submitted_by uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  country text default 'it'::text
);

-- 30: non_invited_recipients
create table public.non_invited_recipients (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  name text not null,
  receives_bomboniera boolean default false,
  receives_confetti boolean default false,
  notes text default ''::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 30: payment_reminders
create table public.payment_reminders (
  id uuid default uuid_generate_v4() not null,
  expense_id uuid not null,
  amount numeric(10,2) not null,
  due_date date not null,
  is_paid boolean default false,
  paid_date date,
  reminder_sent boolean default false,
  reminder_date date,
  notes text default ''::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 30: places
create table public.places (
  id uuid default uuid_generate_v4() not null,
  google_place_id text,
  osm_id text,
  wikidata_qid text,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  address text,
  city text not null,
  province text not null,
  region text not null,
  postal_code text,
  country text default 'IT'::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 30: profiles
create table public.profiles (
  id uuid not null,
  full_name text,
  created_at timestamp with time zone default now() not null
);

-- 30: subcategories
create table public.subcategories (
  id uuid default uuid_generate_v4() not null,
  category_id uuid not null,
  name text,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  estimated_cost numeric(10,2) default 0,
  display_order integer default 0,
  description text,
  sort integer default 0 not null,
  default_budget numeric(12,2) default 0,
  notes text
);

-- 30: subcategory_translations
create table public.subcategory_translations (
  subcategory_id uuid not null,
  locale text not null,
  name text not null
);

-- 30: subscription_packages
create table public.subscription_packages (
  id uuid default uuid_generate_v4() not null,
  tier text not null,
  name_it text not null,
  description_it text,
  price_monthly numeric(10,2) default 0 not null,
  price_yearly numeric(10,2) default 0 not null,
  features jsonb default '[]'::jsonb,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 30: subscription_transactions
create table public.subscription_transactions (
  id uuid default uuid_generate_v4() not null,
  supplier_id uuid,
  location_id uuid,
  church_id uuid,
  tier text not null,
  amount numeric(10,2) not null,
  currency text default 'EUR'::text,
  billing_period text,
  payment_provider text,
  payment_id text,
  status text default 'pending'::text,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 30: suppliers
create table public.suppliers (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  address text,
  phone text,
  email text,
  website text,
  description text,
  category text,
  verified boolean default false,
  user_id uuid,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  google_place_id text,
  google_rating numeric(2,1),
  google_rating_count integer,
  last_synced_at timestamp with time zone,
  subscription_tier text default 'free'::text,
  subscription_expires_at timestamp with time zone,
  is_featured boolean default false,
  profile_views integer default 0,
  contact_clicks integer default 0,
  website_clicks integer default 0,
  last_view_at timestamp with time zone,
  country text default 'it'::text
);

-- 30: sync_jobs
create table public.sync_jobs (
  id uuid default uuid_generate_v4() not null,
  source text not null,
  type text not null,
  region text,
  province text,
  status text not null,
  results_count integer default 0,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 30: table_assignments
create table public.table_assignments (
  id uuid default uuid_generate_v4() not null,
  table_id uuid not null,
  guest_id uuid not null,
  seat_number integer,
  assigned_at timestamp with time zone default now()
);

-- 30: tables
create table public.tables (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  table_number integer not null,
  table_name character varying(255),
  table_type character varying(50) default 'round'::character varying not null,
  total_seats integer default 8 not null,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 30: timeline_items
create table public.timeline_items (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  title text not null,
  description text,
  due_date date,
  category text,
  completed boolean default false,
  display_order integer default 0,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  phase text,
  days_before integer
);

-- 30: traditions
create table public.traditions (
  id integer default nextval('traditions_id_seq'::regclass) not null,
  name text not null,
  description text,
  country_code text not null
);

-- 30: user_event_timeline
create table public.user_event_timeline (
  id uuid default gen_random_uuid() not null,
  event_id uuid,
  timeline_id uuid,
  title text not null,
  description text,
  due_date date not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 30: vendor_places
create table public.vendor_places (
  vendor_id uuid not null,
  place_id uuid not null,
  is_primary boolean default true,
  created_at timestamp with time zone default now()
);

-- 30: vendors
create table public.vendors (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  type text not null,
  phone text,
  email text,
  website text,
  price_range text,
  rating numeric(2,1),
  rating_count integer default 0,
  description text,
  verified boolean default false,
  source text not null,
  source_id text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone
);

-- 30: wedding_cards
create table public.wedding_cards (
  id uuid default uuid_generate_v4() not null,
  event_id uuid not null,
  bride_name text not null,
  groom_name text not null,
  wedding_date date not null,
  church_id uuid,
  church_name text,
  church_address text,
  location_id uuid,
  location_name text,
  location_address text,
  iban text,
  bank_name text,
  account_holder text,
  font_family text default 'Playfair Display'::text,
  background_image text,
  color_scheme text default 'classic'::text,
  template_style text default 'elegant'::text,
  ceremony_time time without time zone,
  reception_time time without time zone,
  dress_code text,
  custom_message text,
  rsvp_info text,
  pdf_url text,
  last_generated_at timestamp with time zone,
  inserted_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 30: wedding_planners
create table public.wedding_planners (
  id uuid default uuid_generate_v4() not null,
  name text not null,
  region text not null,
  province text not null,
  city text not null,
  phone text,
  email text,
  website text,
  description text,
  price_range text,
  services text,
  verified boolean default false,
  status text default 'pending'::text,
  submitted_by uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 35: analytics_events.analytics_events_check
alter table only public.analytics_events add constraint analytics_events_check CHECK (supplier_id IS NOT NULL AND location_id IS NULL AND church_id IS NULL OR supplier_id IS NULL AND location_id IS NOT NULL AND church_id IS NULL OR supplier_id IS NULL AND location_id IS NULL AND church_id IS NOT NULL);

-- 35: analytics_events.analytics_events_event_type_check
alter table only public.analytics_events add constraint analytics_events_event_type_check CHECK (event_type = ANY (ARRAY['profile_view'::text, 'contact_click'::text, 'website_click'::text, 'phone_click'::text, 'email_click'::text]));

-- 35: analytics_events.analytics_events_pkey
alter table only public.analytics_events add constraint analytics_events_pkey PRIMARY KEY (id);

-- 35: atelier.atelier_category_check
alter table only public.atelier add constraint atelier_category_check CHECK (category = ANY (ARRAY['sposa'::text, 'sposo'::text]));

-- 35: atelier.atelier_pkey
alter table only public.atelier add constraint atelier_pkey PRIMARY KEY (id);

-- 35: atelier.atelier_price_range_check
alter table only public.atelier add constraint atelier_price_range_check CHECK (price_range = ANY (ARRAY['€'::text, '€€'::text, '€€€'::text, '€€€€'::text]));

-- 35: budget_ideas.budget_ideas_pkey
alter table only public.budget_ideas add constraint budget_ideas_pkey PRIMARY KEY (id);

-- 35: budget_ideas.unique_budget_idea
alter table only public.budget_ideas add constraint unique_budget_idea UNIQUE (event_id, category_id);

-- 35: budget_items.budget_items_pkey
alter table only public.budget_items add constraint budget_items_pkey PRIMARY KEY (id);

-- 35: categories.categories_pkey
alter table only public.categories add constraint categories_pkey PRIMARY KEY (id);

-- 35: category_translations.category_translations_pkey
alter table only public.category_translations add constraint category_translations_pkey PRIMARY KEY (category_id, locale);

-- 35: checklist_modules.checklist_modules_pkey
alter table only public.checklist_modules add constraint checklist_modules_pkey PRIMARY KEY (id);

-- 35: churches.check_church_google_rating
alter table only public.churches add constraint check_church_google_rating CHECK (google_rating IS NULL OR google_rating >= 1.0 AND google_rating <= 5.0);

-- 35: churches.churches_google_place_id_key
alter table only public.churches add constraint churches_google_place_id_key UNIQUE (google_place_id);

-- 35: churches.churches_pkey
alter table only public.churches add constraint churches_pkey PRIMARY KEY (id);

-- 35: churches.churches_subscription_tier_check
alter table only public.churches add constraint churches_subscription_tier_check CHECK (subscription_tier = ANY (ARRAY['free'::text, 'base'::text, 'premium'::text, 'premium_plus'::text]));

-- 35: event_timeline_translations.event_timeline_translations_pkey
alter table only public.event_timeline_translations add constraint event_timeline_translations_pkey PRIMARY KEY (timeline_id, locale);

-- 35: event_timelines.event_timelines_event_type_id_key_key
alter table only public.event_timelines add constraint event_timelines_event_type_id_key_key UNIQUE (event_type_id, key);

-- 35: event_timelines.event_timelines_pkey
alter table only public.event_timelines add constraint event_timelines_pkey PRIMARY KEY (id);

-- 35: event_type_categories.event_type_categories_pkey
alter table only public.event_type_categories add constraint event_type_categories_pkey PRIMARY KEY (id);

-- 35: event_type_subcategories.event_type_subcategories_pkey
alter table only public.event_type_subcategories add constraint event_type_subcategories_pkey PRIMARY KEY (id);

-- 35: event_type_translations.event_type_translations_pkey
alter table only public.event_type_translations add constraint event_type_translations_pkey PRIMARY KEY (event_type_id, locale);

-- 35: event_type_variants.event_type_variants_pkey
alter table only public.event_type_variants add constraint event_type_variants_pkey PRIMARY KEY (event_type_id, country_code);

-- 35: event_types.event_types_code_key
alter table only public.event_types add constraint event_types_code_key UNIQUE (code);

-- 35: event_types.event_types_pkey
alter table only public.event_types add constraint event_types_pkey PRIMARY KEY (id);

-- 35: events.events_budgets_nonnegative
alter table only public.events add constraint events_budgets_nonnegative CHECK (COALESCE(bride_initial_budget, 0::numeric) >= 0::numeric AND COALESCE(groom_initial_budget, 0::numeric) >= 0::numeric AND COALESCE(total_budget, 0::numeric) >= 0::numeric);

-- 35: events.events_pkey
alter table only public.events add constraint events_pkey PRIMARY KEY (id);

-- 35: events.events_public_id_key
alter table only public.events add constraint events_public_id_key UNIQUE (public_id);

-- 35: expenses.expenses_pkey
alter table only public.expenses add constraint expenses_pkey PRIMARY KEY (id);

-- 35: family_groups.family_groups_pkey
alter table only public.family_groups add constraint family_groups_pkey PRIMARY KEY (id);

-- 35: geo_countries.geo_countries_pkey
alter table only public.geo_countries add constraint geo_countries_pkey PRIMARY KEY (code);

-- 35: guests.guests_guest_type_check
alter table only public.guests add constraint guests_guest_type_check CHECK (guest_type = ANY (ARRAY['bride'::text, 'groom'::text, 'common'::text]));

-- 35: guests.guests_name_check
alter table only public.guests add constraint guests_name_check CHECK (length(TRIM(BOTH FROM name)) > 0);

-- 35: guests.guests_pkey
alter table only public.guests add constraint guests_pkey PRIMARY KEY (id);

-- 35: i18n_locales.i18n_locales_direction_check
alter table only public.i18n_locales add constraint i18n_locales_direction_check CHECK (direction = ANY (ARRAY['ltr'::text, 'rtl'::text]));

-- 35: i18n_locales.i18n_locales_pkey
alter table only public.i18n_locales add constraint i18n_locales_pkey PRIMARY KEY (code);

-- 35: incomes.incomes_income_source_check
alter table only public.incomes add constraint incomes_income_source_check CHECK (income_source = ANY (ARRAY['bride'::text, 'groom'::text, 'common'::text]));

-- 35: incomes.incomes_pkey
alter table only public.incomes add constraint incomes_pkey PRIMARY KEY (id);

-- 35: incomes.incomes_type_check
alter table only public.incomes add constraint incomes_type_check CHECK (type = ANY (ARRAY['busta'::text, 'bonifico'::text, 'regalo'::text]));

-- 35: locations.check_google_rating
alter table only public.locations add constraint check_google_rating CHECK (google_rating IS NULL OR google_rating >= 1.0 AND google_rating <= 5.0);

-- 35: locations.locations_google_place_id_key
alter table only public.locations add constraint locations_google_place_id_key UNIQUE (google_place_id);

-- 35: locations.locations_pkey
alter table only public.locations add constraint locations_pkey PRIMARY KEY (id);

-- 35: locations.locations_subscription_tier_check
alter table only public.locations add constraint locations_subscription_tier_check CHECK (subscription_tier = ANY (ARRAY['free'::text, 'base'::text, 'premium'::text, 'premium_plus'::text]));

-- 35: locations.unique_location
alter table only public.locations add constraint unique_location UNIQUE (name, region, province, city);

-- 35: musica_cerimonia.musica_cerimonia_name_check
alter table only public.musica_cerimonia add constraint musica_cerimonia_name_check CHECK (length(TRIM(BOTH FROM name)) > 0);

-- 35: musica_cerimonia.musica_cerimonia_pkey
alter table only public.musica_cerimonia add constraint musica_cerimonia_pkey PRIMARY KEY (id);

-- 35: musica_cerimonia.musica_cerimonia_status_check
alter table only public.musica_cerimonia add constraint musica_cerimonia_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- 35: musica_ricevimento.musica_ricevimento_name_check
alter table only public.musica_ricevimento add constraint musica_ricevimento_name_check CHECK (length(TRIM(BOTH FROM name)) > 0);

-- 35: musica_ricevimento.musica_ricevimento_pkey
alter table only public.musica_ricevimento add constraint musica_ricevimento_pkey PRIMARY KEY (id);

-- 35: musica_ricevimento.musica_ricevimento_status_check
alter table only public.musica_ricevimento add constraint musica_ricevimento_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- 35: non_invited_recipients.non_invited_recipients_name_check
alter table only public.non_invited_recipients add constraint non_invited_recipients_name_check CHECK (length(TRIM(BOTH FROM name)) > 0);

-- 35: non_invited_recipients.non_invited_recipients_pkey
alter table only public.non_invited_recipients add constraint non_invited_recipients_pkey PRIMARY KEY (id);

-- 35: payment_reminders.payment_reminders_pkey
alter table only public.payment_reminders add constraint payment_reminders_pkey PRIMARY KEY (id);

-- 35: places.places_google_place_id_key
alter table only public.places add constraint places_google_place_id_key UNIQUE (google_place_id);

-- 35: places.places_osm_id_key
alter table only public.places add constraint places_osm_id_key UNIQUE (osm_id);

-- 35: places.places_pkey
alter table only public.places add constraint places_pkey PRIMARY KEY (id);

-- 35: places.places_wikidata_qid_key
alter table only public.places add constraint places_wikidata_qid_key UNIQUE (wikidata_qid);

-- 35: profiles.profiles_pkey
alter table only public.profiles add constraint profiles_pkey PRIMARY KEY (id);

-- 35: subcategories.subcategories_pkey
alter table only public.subcategories add constraint subcategories_pkey PRIMARY KEY (id);

-- 35: subcategory_translations.subcategory_translations_pkey
alter table only public.subcategory_translations add constraint subcategory_translations_pkey PRIMARY KEY (subcategory_id, locale);

-- 35: subscription_packages.subscription_packages_pkey
alter table only public.subscription_packages add constraint subscription_packages_pkey PRIMARY KEY (id);

-- 35: subscription_packages.subscription_packages_tier_check
alter table only public.subscription_packages add constraint subscription_packages_tier_check CHECK (tier = ANY (ARRAY['free'::text, 'base'::text, 'premium'::text, 'premium_plus'::text]));

-- 35: subscription_packages.subscription_packages_tier_key
alter table only public.subscription_packages add constraint subscription_packages_tier_key UNIQUE (tier);

-- 35: subscription_transactions.subscription_transactions_billing_per
alter table only public.subscription_transactions add constraint subscription_transactions_billing_period_check CHECK (billing_period = ANY (ARRAY['monthly'::text, 'yearly'::text]));

-- 35: subscription_transactions.subscription_transactions_check
alter table only public.subscription_transactions add constraint subscription_transactions_check CHECK (supplier_id IS NOT NULL AND location_id IS NULL AND church_id IS NULL OR supplier_id IS NULL AND location_id IS NOT NULL AND church_id IS NULL OR supplier_id IS NULL AND location_id IS NULL AND church_id IS NOT NULL);

-- 35: subscription_transactions.subscription_transactions_pkey
alter table only public.subscription_transactions add constraint subscription_transactions_pkey PRIMARY KEY (id);

-- 35: subscription_transactions.subscription_transactions_status_chec
alter table only public.subscription_transactions add constraint subscription_transactions_status_check CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]));

-- 35: suppliers.check_supplier_google_rating
alter table only public.suppliers add constraint check_supplier_google_rating CHECK (google_rating IS NULL OR google_rating >= 1.0 AND google_rating <= 5.0);

-- 35: suppliers.suppliers_google_place_id_key
alter table only public.suppliers add constraint suppliers_google_place_id_key UNIQUE (google_place_id);

-- 35: suppliers.suppliers_pkey
alter table only public.suppliers add constraint suppliers_pkey PRIMARY KEY (id);

-- 35: suppliers.suppliers_subscription_tier_check
alter table only public.suppliers add constraint suppliers_subscription_tier_check CHECK (subscription_tier = ANY (ARRAY['free'::text, 'base'::text, 'premium'::text, 'premium_plus'::text]));

-- 35: sync_jobs.sync_jobs_pkey
alter table only public.sync_jobs add constraint sync_jobs_pkey PRIMARY KEY (id);

-- 35: sync_jobs.sync_jobs_source_check
alter table only public.sync_jobs add constraint sync_jobs_source_check CHECK (source = ANY (ARRAY['google'::text, 'osm'::text, 'wikidata'::text]));

-- 35: sync_jobs.sync_jobs_status_check
alter table only public.sync_jobs add constraint sync_jobs_status_check CHECK (status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text]));

-- 35: table_assignments.table_assignments_guest_id_key
alter table only public.table_assignments add constraint table_assignments_guest_id_key UNIQUE (guest_id);

-- 35: table_assignments.table_assignments_pkey
alter table only public.table_assignments add constraint table_assignments_pkey PRIMARY KEY (id);

-- 35: tables.tables_event_id_table_number_key
alter table only public.tables add constraint tables_event_id_table_number_key UNIQUE (event_id, table_number);

-- 35: tables.tables_pkey
alter table only public.tables add constraint tables_pkey PRIMARY KEY (id);

-- 35: timeline_items.timeline_items_pkey
alter table only public.timeline_items add constraint timeline_items_pkey PRIMARY KEY (id);

-- 35: traditions.traditions_pkey
alter table only public.traditions add constraint traditions_pkey PRIMARY KEY (id);

-- 35: user_event_timeline.user_event_timeline_pkey
alter table only public.user_event_timeline add constraint user_event_timeline_pkey PRIMARY KEY (id);

-- 35: vendor_places.vendor_places_pkey
alter table only public.vendor_places add constraint vendor_places_pkey PRIMARY KEY (vendor_id, place_id);

-- 35: vendors.vendors_pkey
alter table only public.vendors add constraint vendors_pkey PRIMARY KEY (id);

-- 35: vendors.vendors_price_range_check
alter table only public.vendors add constraint vendors_price_range_check CHECK (price_range = ANY (ARRAY['€'::text, '€€'::text, '€€€'::text, '€€€€'::text]));

-- 35: vendors.vendors_rating_check
alter table only public.vendors add constraint vendors_rating_check CHECK (rating >= 1.0 AND rating <= 5.0);

-- 35: vendors.vendors_source_check
alter table only public.vendors add constraint vendors_source_check CHECK (source = ANY (ARRAY['google'::text, 'osm'::text, 'wikidata'::text, 'manual'::text]));

-- 35: vendors.vendors_source_id_unique
alter table only public.vendors add constraint vendors_source_id_unique UNIQUE (source_id);

-- 35: vendors.vendors_type_check
alter table only public.vendors add constraint vendors_type_check CHECK (type = ANY (ARRAY['location'::text, 'church'::text, 'band'::text, 'dj'::text, 'planner'::text, 'photographer'::text, 'videographer'::text, 'florist'::text, 'caterer'::text]));

-- 35: wedding_cards.wedding_cards_event_id_key
alter table only public.wedding_cards add constraint wedding_cards_event_id_key UNIQUE (event_id);

-- 35: wedding_cards.wedding_cards_pkey
alter table only public.wedding_cards add constraint wedding_cards_pkey PRIMARY KEY (id);

-- 35: wedding_planners.wedding_planners_name_check
alter table only public.wedding_planners add constraint wedding_planners_name_check CHECK (length(TRIM(BOTH FROM name)) > 0);

-- 35: wedding_planners.wedding_planners_pkey
alter table only public.wedding_planners add constraint wedding_planners_pkey PRIMARY KEY (id);

-- 35: wedding_planners.wedding_planners_status_check
alter table only public.wedding_planners add constraint wedding_planners_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- 40: analytics_events.analytics_events_church_id_fkey
alter table only public.analytics_events add constraint analytics_events_church_id_fkey FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;

-- 40: analytics_events.analytics_events_location_id_fkey
alter table only public.analytics_events add constraint analytics_events_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 40: analytics_events.analytics_events_supplier_id_fkey
alter table only public.analytics_events add constraint analytics_events_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

-- 40: budget_ideas.budget_ideas_category_id_fkey
alter table only public.budget_ideas add constraint budget_ideas_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 40: budget_ideas.budget_ideas_event_id_fkey
alter table only public.budget_ideas add constraint budget_ideas_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: budget_items.budget_items_event_id_fkey
alter table only public.budget_items add constraint budget_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id);

-- 40: budget_items.budget_items_tradition_id_fkey
alter table only public.budget_items add constraint budget_items_tradition_id_fkey FOREIGN KEY (tradition_id) REFERENCES traditions(id);

-- 40: budget_items.budget_items_vendor_id_fkey
alter table only public.budget_items add constraint budget_items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id);

-- 40: categories.categories_event_id_fkey
alter table only public.categories add constraint categories_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: categories.categories_event_type_id_fkey
alter table only public.categories add constraint categories_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- 40: category_translations.category_translations_category_id_fkey
alter table only public.category_translations add constraint category_translations_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 40: category_translations.category_translations_locale_fkey
alter table only public.category_translations add constraint category_translations_locale_fkey FOREIGN KEY (locale) REFERENCES i18n_locales(code);

-- 40: checklist_modules.checklist_modules_tradition_id_fkey
alter table only public.checklist_modules add constraint checklist_modules_tradition_id_fkey FOREIGN KEY (tradition_id) REFERENCES traditions(id);

-- 40: event_timeline_translations.event_timeline_translations_locale_
alter table only public.event_timeline_translations add constraint event_timeline_translations_locale_fkey FOREIGN KEY (locale) REFERENCES i18n_locales(code);

-- 40: event_timeline_translations.event_timeline_translations_timelin
alter table only public.event_timeline_translations add constraint event_timeline_translations_timeline_id_fkey FOREIGN KEY (timeline_id) REFERENCES event_timelines(id) ON DELETE CASCADE;

-- 40: event_timelines.event_timelines_event_type_id_fkey
alter table only public.event_timelines add constraint event_timelines_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- 40: event_type_categories.event_type_categories_event_type_id_fkey
alter table only public.event_type_categories add constraint event_type_categories_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- 40: event_type_subcategories.event_type_subcategories_category_id_f
alter table only public.event_type_subcategories add constraint event_type_subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES event_type_categories(id) ON DELETE CASCADE;

-- 40: event_type_translations.event_type_translations_event_type_id_f
alter table only public.event_type_translations add constraint event_type_translations_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- 40: event_type_translations.event_type_translations_locale_fkey
alter table only public.event_type_translations add constraint event_type_translations_locale_fkey FOREIGN KEY (locale) REFERENCES i18n_locales(code);

-- 40: event_type_variants.event_type_variants_country_code_fkey
alter table only public.event_type_variants add constraint event_type_variants_country_code_fkey FOREIGN KEY (country_code) REFERENCES geo_countries(code);

-- 40: event_type_variants.event_type_variants_event_type_id_fkey
alter table only public.event_type_variants add constraint event_type_variants_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- 40: expenses.expenses_event_id_fkey
alter table only public.expenses add constraint expenses_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: expenses.expenses_subcategory_id_fkey
alter table only public.expenses add constraint expenses_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL;

-- 40: family_groups.family_groups_event_id_fkey
alter table only public.family_groups add constraint family_groups_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: family_groups.fk_family_main_contact
alter table only public.family_groups add constraint fk_family_main_contact FOREIGN KEY (main_contact_guest_id) REFERENCES guests(id) ON DELETE SET NULL;

-- 40: geo_countries.geo_countries_default_locale_fkey
alter table only public.geo_countries add constraint geo_countries_default_locale_fkey FOREIGN KEY (default_locale) REFERENCES i18n_locales(code);

-- 40: guests.guests_event_id_fkey
alter table only public.guests add constraint guests_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: guests.guests_family_group_id_fkey
alter table only public.guests add constraint guests_family_group_id_fkey FOREIGN KEY (family_group_id) REFERENCES family_groups(id) ON DELETE SET NULL;

-- 40: incomes.incomes_event_id_fkey
alter table only public.incomes add constraint incomes_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: musica_cerimonia.musica_cerimonia_submitted_by_fkey
alter table only public.musica_cerimonia add constraint musica_cerimonia_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);

-- 40: musica_ricevimento.musica_ricevimento_submitted_by_fkey
alter table only public.musica_ricevimento add constraint musica_ricevimento_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);

-- 40: non_invited_recipients.non_invited_recipients_event_id_fkey
alter table only public.non_invited_recipients add constraint non_invited_recipients_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: payment_reminders.payment_reminders_expense_id_fkey
alter table only public.payment_reminders add constraint payment_reminders_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE;

-- 40: subcategories.subcategories_category_id_fkey
alter table only public.subcategories add constraint subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 40: subcategory_translations.subcategory_translations_locale_fkey
alter table only public.subcategory_translations add constraint subcategory_translations_locale_fkey FOREIGN KEY (locale) REFERENCES i18n_locales(code);

-- 40: subcategory_translations.subcategory_translations_subcategory_i
alter table only public.subcategory_translations add constraint subcategory_translations_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE;

-- 40: subscription_transactions.subscription_transactions_church_id_f
alter table only public.subscription_transactions add constraint subscription_transactions_church_id_fkey FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE;

-- 40: subscription_transactions.subscription_transactions_location_id
alter table only public.subscription_transactions add constraint subscription_transactions_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;

-- 40: subscription_transactions.subscription_transactions_supplier_id
alter table only public.subscription_transactions add constraint subscription_transactions_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

-- 40: table_assignments.table_assignments_guest_id_fkey
alter table only public.table_assignments add constraint table_assignments_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE;

-- 40: table_assignments.table_assignments_table_id_fkey
alter table only public.table_assignments add constraint table_assignments_table_id_fkey FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE;

-- 40: tables.tables_event_id_fkey
alter table only public.tables add constraint tables_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: timeline_items.timeline_items_event_id_fkey
alter table only public.timeline_items add constraint timeline_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: user_event_timeline.user_event_timeline_event_id_fkey
alter table only public.user_event_timeline add constraint user_event_timeline_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: user_event_timeline.user_event_timeline_timeline_id_fkey
alter table only public.user_event_timeline add constraint user_event_timeline_timeline_id_fkey FOREIGN KEY (timeline_id) REFERENCES event_timelines(id) ON DELETE SET NULL;

-- 40: vendor_places.vendor_places_place_id_fkey
alter table only public.vendor_places add constraint vendor_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;

-- 40: vendor_places.vendor_places_vendor_id_fkey
alter table only public.vendor_places add constraint vendor_places_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;

-- 40: wedding_cards.wedding_cards_church_id_fkey
alter table only public.wedding_cards add constraint wedding_cards_church_id_fkey FOREIGN KEY (church_id) REFERENCES churches(id);

-- 40: wedding_cards.wedding_cards_event_id_fkey
alter table only public.wedding_cards add constraint wedding_cards_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 40: wedding_cards.wedding_cards_location_id_fkey
alter table only public.wedding_cards add constraint wedding_cards_location_id_fkey FOREIGN KEY (location_id) REFERENCES locations(id);

-- 40: wedding_planners.wedding_planners_submitted_by_fkey
alter table only public.wedding_planners add constraint wedding_planners_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);

-- 45: budget_items_id_seq
alter sequence public.budget_items_id_seq owned by public.budget_items.id;

-- 45: checklist_modules_id_seq
alter sequence public.checklist_modules_id_seq owned by public.checklist_modules.id;

-- 45: traditions_id_seq
alter sequence public.traditions_id_seq owned by public.traditions.id;

-- 50: check_table_availability(uuid)
CREATE OR REPLACE FUNCTION public.check_table_availability(p_table_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_total_seats INTEGER;
  v_assigned_seats INTEGER;
BEGIN
  SELECT total_seats INTO v_total_seats
  FROM tables WHERE id = p_table_id;
  
  SELECT COUNT(*) INTO v_assigned_seats
  FROM table_assignments WHERE table_id = p_table_id;
  
  RETURN (v_assigned_seats < v_total_seats);
END;
$function$;


-- 50: ensure_subcategory(uuid,text)
CREATE OR REPLACE FUNCTION public.ensure_subcategory(p_category uuid, p_name text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  insert into public.subcategories (id, category_id, name)
  values (gen_random_uuid(), p_category, p_name)
  on conflict (category_id, lower(name)) do nothing;
end $function$;


-- 50: find_or_create_place(text,text,text,numeric,numeric,text,text,t
CREATE OR REPLACE FUNCTION public.find_or_create_place(p_google_place_id text, p_osm_id text, p_wikidata_qid text, p_lat numeric, p_lng numeric, p_address text, p_city text, p_province text, p_region text, p_postal_code text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_place_id UUID;
BEGIN
  -- Try to find existing place by IDs (priority: Google > OSM > Wikidata)
  SELECT id INTO v_place_id FROM places
  WHERE google_place_id = p_google_place_id AND p_google_place_id IS NOT NULL
  LIMIT 1;
  
  IF v_place_id IS NULL AND p_osm_id IS NOT NULL THEN
    SELECT id INTO v_place_id FROM places
    WHERE osm_id = p_osm_id
    LIMIT 1;
  END IF;
  
  IF v_place_id IS NULL AND p_wikidata_qid IS NOT NULL THEN
    SELECT id INTO v_place_id FROM places
    WHERE wikidata_qid = p_wikidata_qid
    LIMIT 1;
  END IF;
  
  -- If not found, create new place
  IF v_place_id IS NULL THEN
    INSERT INTO places (
      google_place_id, osm_id, wikidata_qid,
      lat, lng, address, city, province, region, postal_code
    ) VALUES (
      p_google_place_id, p_osm_id, p_wikidata_qid,
      p_lat, p_lng, p_address, p_city, p_province, p_region, p_postal_code
    )
    RETURNING id INTO v_place_id;
  ELSE
    -- Update existing place with new IDs if missing
    UPDATE places SET
      google_place_id = COALESCE(google_place_id, p_google_place_id),
      osm_id = COALESCE(osm_id, p_osm_id),
      wikidata_qid = COALESCE(wikidata_qid, p_wikidata_qid),
      lat = COALESCE(p_lat, lat),
      lng = COALESCE(p_lng, lng),
      updated_at = NOW()
    WHERE id = v_place_id;
  END IF;
  
  RETURN v_place_id;
END;
$function$;


-- 50: get_or_create_category(uuid,text)
CREATE OR REPLACE FUNCTION public.get_or_create_category(p_event uuid, p_name text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  v_id uuid;
begin
  insert into public.categories (id, event_id, name)
  values (gen_random_uuid(), p_event, p_name)
  on conflict (event_id, lower(name)) do nothing;

  select c.id into v_id
  from public.categories c
  where c.event_id = p_event and lower(c.name) = lower(p_name)
  limit 1;

  return v_id;
end $function$;


-- 50: get_table_stats(uuid)
CREATE OR REPLACE FUNCTION public.get_table_stats(p_event_id uuid)
 RETURNS TABLE(total_tables integer, total_seats integer, assigned_seats integer, available_seats integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT t.id)::INTEGER as total_tables,
    COALESCE(SUM(t.total_seats), 0)::INTEGER as total_seats,
    COUNT(DISTINCT ta.id)::INTEGER as assigned_seats,
    (COALESCE(SUM(t.total_seats), 0) - COUNT(DISTINCT ta.id))::INTEGER as available_seats
  FROM tables t
  LEFT JOIN table_assignments ta ON ta.table_id = t.id
  WHERE t.event_id = p_event_id;
END;
$function$;


-- 50: get_visible_suppliers(text,text,text,boolean)
CREATE OR REPLACE FUNCTION public.get_visible_suppliers(p_category text DEFAULT NULL::text, p_region text DEFAULT NULL::text, p_province text DEFAULT NULL::text, p_is_demo boolean DEFAULT false)
 RETURNS TABLE(id uuid, name text, region text, province text, city text, address text, phone text, email text, website text, description text, category text, verified boolean, subscription_tier text, is_featured boolean)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.region, s.province, s.city, s.address,
    s.phone, s.email, s.website, s.description, s.category,
    s.verified, s.subscription_tier, s.is_featured
  FROM public.suppliers s
  WHERE 
    -- Filter by category if provided
    (p_category IS NULL OR s.category = p_category)
    -- Filter by region if provided
    AND (p_region IS NULL OR s.region = p_region)
    -- Filter by province if provided
    AND (p_province IS NULL OR s.province = p_province)
    -- Visibility rules based on tier
    AND (
      -- Premium Plus: visible everywhere including demo
      (s.subscription_tier = 'premium_plus' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at))
      -- Premium: visible in hub + category (not in demo unless explicitly allowed)
      OR (s.subscription_tier = 'premium' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND NOT p_is_demo)
      -- Base: visible only in category pages (not in demo)
      OR (s.subscription_tier = 'base' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND p_category IS NOT NULL AND NOT p_is_demo)
      -- Free: never visible in public searches
    )
  ORDER BY 
    -- Premium Plus first
    CASE WHEN s.subscription_tier = 'premium_plus' THEN 1
         WHEN s.subscription_tier = 'premium' THEN 2
         WHEN s.subscription_tier = 'base' THEN 3
         ELSE 4 END,
    -- Featured items first within each tier
    s.is_featured DESC,
    -- Then by name
    s.name ASC;
END;
$function$;


-- 50: increment_analytics_counter(text,uuid,text)
CREATE OR REPLACE FUNCTION public.increment_analytics_counter(p_entity_type text, p_entity_id uuid, p_counter_type text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF p_entity_type = 'supplier' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.suppliers SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.suppliers SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.suppliers SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  ELSIF p_entity_type = 'location' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.locations SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.locations SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.locations SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  ELSIF p_entity_type = 'church' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.churches SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.churches SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.churches SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  END IF;
END;
$function$;


-- 50: is_subscription_active(text,timestamp with time zone)
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_subscription_tier text, p_expires_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Free tier is always "active"
  IF p_subscription_tier = 'free' THEN
    RETURN true;
  END IF;
  
  -- Paid tiers need valid expiry
  IF p_expires_at IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN p_expires_at > TIMEZONE('utc', NOW());
END;
$function$;


-- 50: normalize_phone(text)
CREATE OR REPLACE FUNCTION public.normalize_phone(phone_input text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  IF phone_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove spaces, dashes, parentheses
  phone_input := regexp_replace(phone_input, '[\s\-\(\)]', '', 'g');
  
  -- Add +39 if missing (Italian numbers)
  IF phone_input ~ '^3[0-9]{8,9}$' OR phone_input ~ '^0[0-9]{8,10}$' THEN
    phone_input := '+39' || phone_input;
  ELSIF NOT phone_input ~ '^\+' THEN
    phone_input := '+' || phone_input;
  END IF;
  
  RETURN phone_input;
END;
$function$;


-- 50: normalize_url(text)
CREATE OR REPLACE FUNCTION public.normalize_url(url_input text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
  IF url_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Add https:// if missing
  IF url_input !~ '^https?://' THEN
    url_input := 'https://' || url_input;
  END IF;
  
  -- Replace http:// with https://
  url_input := regexp_replace(url_input, '^http://', 'https://');
  
  -- Remove trailing slash
  url_input := regexp_replace(url_input, '/$', '');
  
  RETURN url_input;
END;
$function$;


-- 50: populate_event_categories()
CREATE OR REPLACE FUNCTION public.populate_event_categories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  subcat_record RECORD;
BEGIN
  -- Solo se evento ha event_type valorizzato
  IF NEW.event_type IS NOT NULL THEN
    -- Copia tutte le subcategories per questo tipo evento
    FOR subcat_record IN
      SELECT s.id, s.default_budget
      FROM public.subcategories s
      JOIN public.categories c ON c.id = s.category_id
      JOIN public.event_types et ON et.id = c.event_type_id
      WHERE et.code = NEW.event_type
    LOOP
      INSERT INTO public.event_category_selection (
        event_id,
        subcategory_id,
        budget,
        is_selected
      ) VALUES (
        NEW.id,
        subcat_record.id,
        COALESCE(subcat_record.default_budget, 0),
        true -- Di default tutte selezionate
      )
      ON CONFLICT (event_id, subcategory_id) DO NOTHING; -- Evita duplicati
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;


-- 50: populate_user_timeline()
CREATE OR REPLACE FUNCTION public.populate_user_timeline()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  template_record RECORD;
BEGIN
  IF NEW.event_type IS NOT NULL AND NEW.event_date IS NOT NULL THEN
    FOR template_record IN
      SELECT et.id, et.title, et.description, et.offset_days, et.category, et.is_critical
      FROM public.event_timelines et
      JOIN public.event_types evt ON evt.id = et.event_type_id
      WHERE evt.code = NEW.event_type
    LOOP
      INSERT INTO public.user_event_timeline (
        event_id,
        timeline_id,
        title,
        description,
        due_date,
        is_completed
      ) VALUES (
        NEW.id,
        template_record.id,
        template_record.title,
        template_record.description,
        (NEW.event_date::date + template_record.offset_days * INTERVAL '1 day')::date,
        false
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;


-- 50: regenerate_event_data(uuid)
CREATE OR REPLACE FUNCTION public.regenerate_event_data(p_event_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  event_record RECORD;
  timeline_count INT;
  category_count INT;
BEGIN
  -- Ottieni evento
  SELECT * INTO event_record FROM public.events WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RETURN 'Evento non trovato';
  END IF;

  -- Pulisci dati esistenti
  DELETE FROM public.user_event_timeline WHERE event_id = p_event_id;
  DELETE FROM public.event_category_selection WHERE event_id = p_event_id;

  -- Rigenera timeline
  INSERT INTO public.user_event_timeline (event_id, timeline_id, title, description, due_date, is_completed)
  SELECT 
    p_event_id,
    et.id,
    et.title,
    et.description,
    (event_record.event_date::date + et.offset_days * INTERVAL '1 day')::date,
    false
  FROM public.event_timelines et
  JOIN public.event_types evt ON evt.id = et.event_type_id
  WHERE evt.code = event_record.event_type;

  GET DIAGNOSTICS timeline_count = ROW_COUNT;

  -- Rigenera categorie
  INSERT INTO public.event_category_selection (event_id, subcategory_id, budget, is_selected)
  SELECT 
    p_event_id,
    s.id,
    COALESCE(s.default_budget, 0),
    true
  FROM public.subcategories s
  JOIN public.categories c ON c.id = s.category_id
  JOIN public.event_types et ON et.id = c.event_type_id
  WHERE et.code = event_record.event_type;

  GET DIAGNOSTICS category_count = ROW_COUNT;

  RETURN format('✅ Rigenerato: %s timeline, %s categorie', timeline_count, category_count);
END;
$function$;


-- 50: regenerate_event_timeline(uuid)
CREATE OR REPLACE FUNCTION public.regenerate_event_timeline(p_event_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  event_record RECORD;
  timeline_count INT;
BEGIN
  SELECT * INTO event_record FROM public.events WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RETURN 'Evento non trovato';
  END IF;

  DELETE FROM public.user_event_timeline WHERE event_id = p_event_id;

  INSERT INTO public.user_event_timeline (event_id, timeline_id, title, description, due_date, is_completed)
  SELECT 
    p_event_id,
    et.id,
    et.title,
    et.description,
    (event_record.event_date::date + et.offset_days * INTERVAL '1 day')::date,
    false
  FROM public.event_timelines et
  JOIN public.event_types evt ON evt.id = et.event_type_id
  WHERE evt.code = event_record.event_type;

  GET DIAGNOSTICS timeline_count = ROW_COUNT;

  RETURN format('✅ Rigenerato: %s milestone timeline', timeline_count);
END;
$function$;


-- 50: seed_categories(uuid)
CREATE OR REPLACE FUNCTION public.seed_categories(p_event uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.categories (id, event_id, name)
  SELECT uuid_generate_v4(), p_event, t.name
  FROM (VALUES
    ('Sposa'),
    ('Sposo'),
    ('Abiti & Accessori (altri)'),
    ('Cerimonia'),
    ('Location & Catering'),
    ('Fiori & Decor'),
    ('Foto & Video'),
    ('Inviti & Stationery'),
    ('Musica & Intrattenimento'),
    ('Beauty & Benessere'),
    ('Bomboniere & Regali'),
    ('Trasporti'),
    ('Ospitalità & Logistica'),
    ('Viaggio di nozze'),
    ('Staff & Coordinamento'),
    ('Burocrazia & Documenti'),
    ('Comunicazione & Media'),
    ('Extra & Contingenze')
  ) AS t(name);
END $function$;


-- 50: seed_full_event(uuid)
CREATE OR REPLACE FUNCTION public.seed_full_event(p_event uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  v_cat uuid;
begin
  -- 1) Abiti & Accessori (altri)
  v_cat := get_or_create_category(p_event, 'Abiti & Accessori (altri)');
  perform ensure_subcategory(v_cat, 'Ospiti/Genitori extra');
  perform ensure_subcategory(v_cat, 'Fedi nuziali');

  -- 2) Cerimonia
  v_cat := get_or_create_category(p_event, 'Cerimonia');
  perform ensure_subcategory(v_cat, 'Chiesa/comune');
  perform ensure_subcategory(v_cat, 'Musiche');
  perform ensure_subcategory(v_cat, 'Libretti');
  perform ensure_subcategory(v_cat, 'Fiori cerimonia');
  perform ensure_subcategory(v_cat, 'Documenti e pratiche');
  perform ensure_subcategory(v_cat, 'Offerte / Diritti');

  -- 3) Fiori & Decor
  v_cat := get_or_create_category(p_event, 'Fiori & Decor');
  perform ensure_subcategory(v_cat, 'Bouquet');
  perform ensure_subcategory(v_cat, 'Boutonnière');
  perform ensure_subcategory(v_cat, 'Centrotavola');
  perform ensure_subcategory(v_cat, 'Allestimenti');
  perform ensure_subcategory(v_cat, 'Candele');
  perform ensure_subcategory(v_cat, 'Tableau');
  perform ensure_subcategory(v_cat, 'Segnaposto');
  perform ensure_subcategory(v_cat, 'Noleggi (vasi/strutture)');

  -- 4) Foto & Video
  v_cat := get_or_create_category(p_event, 'Foto & Video');
  perform ensure_subcategory(v_cat, 'Servizio foto');
  perform ensure_subcategory(v_cat, 'Video');
  perform ensure_subcategory(v_cat, 'Drone');
  perform ensure_subcategory(v_cat, 'Album');
  perform ensure_subcategory(v_cat, 'Stampe');
  perform ensure_subcategory(v_cat, 'Secondo fotografo');

  -- 5) Inviti & Stationery
  v_cat := get_or_create_category(p_event, 'Inviti & Stationery');
  perform ensure_subcategory(v_cat, 'Partecipazioni');
  perform ensure_subcategory(v_cat, 'Menu');
  perform ensure_subcategory(v_cat, 'Segnaposto');
  perform ensure_subcategory(v_cat, 'Libretti Messa');
  perform ensure_subcategory(v_cat, 'Timbri & Cliché');
  perform ensure_subcategory(v_cat, 'Francobolli / Spedizioni');
  perform ensure_subcategory(v_cat, 'Calligrafia');
  perform ensure_subcategory(v_cat, 'Cartoncini / Tag');
  perform ensure_subcategory(v_cat, 'QR code & Stampa');

  -- 6) Sposa
  v_cat := get_or_create_category(p_event, 'Sposa');
  perform ensure_subcategory(v_cat, 'Abito sposa');
  perform ensure_subcategory(v_cat, 'Scarpe sposa');
  perform ensure_subcategory(v_cat, 'Accessori (velo, gioielli)');
  perform ensure_subcategory(v_cat, 'Intimo & sottogonna');
  perform ensure_subcategory(v_cat, 'Parrucchiera');
  perform ensure_subcategory(v_cat, 'Make-up');
  perform ensure_subcategory(v_cat, 'Prove');
  perform ensure_subcategory(v_cat, 'Altro sposa');

  -- 7) Sposo
  v_cat := get_or_create_category(p_event, 'Sposo');
  perform ensure_subcategory(v_cat, 'Abito sposo');
  perform ensure_subcategory(v_cat, 'Scarpe sposo');
  perform ensure_subcategory(v_cat, 'Accessori (cravatta, gemelli)');
  perform ensure_subcategory(v_cat, 'Barbiere / Grooming');
  perform ensure_subcategory(v_cat, 'Prove');
  perform ensure_subcategory(v_cat, 'Altro sposo');

  -- 8) Location & Catering
  v_cat := get_or_create_category(p_event, 'Location & Catering');
  perform ensure_subcategory(v_cat, 'Affitto sala');
  perform ensure_subcategory(v_cat, 'Catering / Banqueting');
  perform ensure_subcategory(v_cat, 'Torta nuziale');
  perform ensure_subcategory(v_cat, 'Vini & Bevande');
  perform ensure_subcategory(v_cat, 'Open bar');
  perform ensure_subcategory(v_cat, 'Mise en place');
  perform ensure_subcategory(v_cat, 'Noleggio tovagliato / piatti');

  -- 9) Musica & Intrattenimento
  v_cat := get_or_create_category(p_event, 'Musica & Intrattenimento');
  perform ensure_subcategory(v_cat, 'DJ / Band');
  perform ensure_subcategory(v_cat, 'Audio / Luci');
  perform ensure_subcategory(v_cat, 'Animazione');
  perform ensure_subcategory(v_cat, 'Diritti SIAE');
  perform ensure_subcategory(v_cat, 'Guestbook phone / postazioni');

  -- 10) Trasporti
  v_cat := get_or_create_category(p_event, 'Trasporti');
  perform ensure_subcategory(v_cat, 'Auto sposi');
  perform ensure_subcategory(v_cat, 'Navette ospiti');
  perform ensure_subcategory(v_cat, 'Carburante / Pedaggi');

  -- 11) Bomboniere & Regali ospiti
  v_cat := get_or_create_category(p_event, 'Bomboniere & Regali');
  perform ensure_subcategory(v_cat, 'Bomboniere');
  perform ensure_subcategory(v_cat, 'Confetti');
  perform ensure_subcategory(v_cat, 'Packaging / Scatole');
  perform ensure_subcategory(v_cat, 'Allestimento tavolo bomboniere');

  -- 12) Ospitalità & Logistica
  v_cat := get_or_create_category(p_event, 'Ospitalità & Logistica');
  perform ensure_subcategory(v_cat, 'Alloggi ospiti');
  perform ensure_subcategory(v_cat, 'Welcome bag / Kit');
  perform ensure_subcategory(v_cat, 'Cartellonistica & Segnaletica');

  -- 13) Burocrazia
  v_cat := get_or_create_category(p_event, 'Burocrazia');
  perform ensure_subcategory(v_cat, 'Pubblicazioni');
  perform ensure_subcategory(v_cat, 'Certificati');
  perform ensure_subcategory(v_cat, 'Traduzioni / Apostille');

  -- 14) Beauty & Benessere
  v_cat := get_or_create_category(p_event, 'Beauty & Benessere');
  perform ensure_subcategory(v_cat, 'Estetista');
  perform ensure_subcategory(v_cat, 'SPA / Massaggi');
  perform ensure_subcategory(v_cat, 'Solarium');

  -- 15) Viaggio di nozze
  v_cat := get_or_create_category(p_event, 'Viaggio di nozze');
  perform ensure_subcategory(v_cat, 'Quota viaggio');
  perform ensure_subcategory(v_cat, 'Assicurazioni');
  perform ensure_subcategory(v_cat, 'Visti / Documenti');
  perform ensure_subcategory(v_cat, 'Extra');
  perform ensure_subcategory(v_cat, 'Lista nozze');

  -- 16) Comunicazione & Media
  v_cat := get_or_create_category(p_event, 'Comunicazione & Media');
  perform ensure_subcategory(v_cat, 'Sito web / QR');
  perform ensure_subcategory(v_cat, 'Social media');
  perform ensure_subcategory(v_cat, 'Grafica / Design');

  -- 17) Extra & Contingenze
  v_cat := get_or_create_category(p_event, 'Extra & Contingenze');
  perform ensure_subcategory(v_cat, 'Imprevisti');
  perform ensure_subcategory(v_cat, 'Spese varie');
end $function$;


-- 50: seed_subcategories(uuid,text[])
CREATE OR REPLACE FUNCTION public.seed_subcategories(p_category uuid, VARIADIC p_names text[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
  n TEXT;
BEGIN
  FOREACH n IN ARRAY p_names LOOP
    INSERT INTO public.subcategories (id, category_id, name)
    VALUES (uuid_generate_v4(), p_category, n);
  END LOOP;
END $function$;


-- 50: set_owner_id()
CREATE OR REPLACE FUNCTION public.set_owner_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;


-- 50: update_updated_at()
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;


-- 50: update_updated_at_column()
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;


-- 50: upsert_vendor(text,text,text,text,text,text,text,numeric,intege
CREATE OR REPLACE FUNCTION public.upsert_vendor(p_name text, p_type text, p_source text, p_source_id text, p_phone text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_website text DEFAULT NULL::text, p_rating numeric DEFAULT NULL::numeric, p_rating_count integer DEFAULT 0, p_description text DEFAULT NULL::text, p_price_range text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb, p_google_place_id text DEFAULT NULL::text, p_osm_id text DEFAULT NULL::text, p_wikidata_qid text DEFAULT NULL::text, p_lat numeric DEFAULT NULL::numeric, p_lng numeric DEFAULT NULL::numeric, p_address text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_province text DEFAULT NULL::text, p_region text DEFAULT NULL::text, p_postal_code text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_vendor_id UUID;
  v_place_id UUID;
BEGIN
  -- Normalize inputs
  p_phone := normalize_phone(p_phone);
  p_website := normalize_url(p_website);
  
  -- Find or create place (if location data provided)
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL AND p_city IS NOT NULL THEN
    v_place_id := find_or_create_place(
      p_google_place_id, p_osm_id, p_wikidata_qid,
      p_lat, p_lng, p_address, p_city, p_province, p_region, p_postal_code
    );
  END IF;
  
  -- Upsert vendor
  INSERT INTO vendors (
    name, type, source, source_id, phone, email, website,
    rating, rating_count, description, price_range, metadata,
    verified, last_synced_at
  ) VALUES (
    p_name, p_type, p_source, p_source_id, p_phone, p_email, p_website,
    p_rating, p_rating_count, p_description, p_price_range, p_metadata,
    (p_rating >= 4.0), NOW()
  )
  ON CONFLICT (source_id) WHERE source_id IS NOT NULL
  DO UPDATE SET
    name = EXCLUDED.name,
    phone = COALESCE(EXCLUDED.phone, vendors.phone),
    email = COALESCE(EXCLUDED.email, vendors.email),
    website = COALESCE(EXCLUDED.website, vendors.website),
    rating = EXCLUDED.rating,
    rating_count = EXCLUDED.rating_count,
    description = COALESCE(EXCLUDED.description, vendors.description),
    price_range = COALESCE(EXCLUDED.price_range, vendors.price_range),
    metadata = COALESCE(EXCLUDED.metadata, vendors.metadata),
    verified = (EXCLUDED.rating >= 4.0),
    last_synced_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_vendor_id;
  
  -- Link vendor to place
  IF v_place_id IS NOT NULL THEN
    INSERT INTO vendor_places (vendor_id, place_id, is_primary)
    VALUES (v_vendor_id, v_place_id, true)
    ON CONFLICT (vendor_id, place_id) DO NOTHING;
  END IF;
  
  RETURN v_vendor_id;
END;
$function$;


-- 60: high_rated_locations
create or replace view public.high_rated_locations with (security_invoker=true) as
 SELECT id,
    name,
    region,
    province,
    city,
    location_type,
    google_rating,
    google_rating_count,
    verified
   FROM locations
  WHERE google_rating >= 4.0 AND google_rating_count >= 10
  ORDER BY google_rating DESC, google_rating_count DESC;;

-- 60: location_stats_by_region
create or replace view public.location_stats_by_region with (security_invoker=true) as
 SELECT region,
    count(*) AS total_locations,
    count(
        CASE
            WHEN verified = true THEN 1
            ELSE NULL::integer
        END) AS verified_count,
    avg(google_rating) AS avg_rating,
    sum(google_rating_count) AS total_reviews
   FROM locations
  WHERE google_rating IS NOT NULL
  GROUP BY region
  ORDER BY (count(*)) DESC;;

-- 60: sync_stats
create or replace view public.sync_stats with (security_invoker=true) as
 SELECT source,
    type,
    count(*) AS total_syncs,
    count(*) FILTER (WHERE status = 'completed'::text) AS successful,
    count(*) FILTER (WHERE status = 'failed'::text) AS failed,
    max(completed_at) AS last_sync,
    sum(results_count) AS total_results
   FROM sync_jobs
  GROUP BY source, type;;

-- 60: vendors_with_places
create or replace view public.vendors_with_places with (security_invoker=true) as
 SELECT v.id,
    v.name,
    v.type,
    v.phone,
    v.email,
    v.website,
    v.price_range,
    v.rating,
    v.rating_count,
    v.description,
    v.verified,
    v.source,
    v.source_id,
    v.metadata,
    v.created_at,
    v.updated_at,
    v.last_synced_at,
    p.google_place_id,
    p.osm_id,
    p.wikidata_qid,
    p.lat,
    p.lng,
    p.address,
    p.city,
    p.province,
    p.region,
    p.postal_code
   FROM vendors v
     LEFT JOIN vendor_places vp ON v.id = vp.vendor_id AND vp.is_primary = true
     LEFT JOIN places p ON vp.place_id = p.id;;

-- 60: top_vendors_by_region
create or replace view public.top_vendors_by_region with (security_invoker=true) as
 SELECT region,
    type,
    count(*) AS vendor_count,
    round(avg(rating), 2) AS avg_rating,
    sum(rating_count) AS total_reviews
   FROM vendors_with_places
  WHERE verified = true
  GROUP BY region, type
  ORDER BY region, (count(*)) DESC;;

-- 70: categories_unique_event_lowername
CREATE UNIQUE INDEX categories_unique_event_lowername ON public.categories USING btree (event_id, lower(name));

-- 70: expenses_subcategory_id_idx
CREATE INDEX expenses_subcategory_id_idx ON public.expenses USING btree (subcategory_id);

-- 70: idx_analytics_church
CREATE INDEX idx_analytics_church ON public.analytics_events USING btree (church_id, created_at DESC);

-- 70: idx_analytics_event_type
CREATE INDEX idx_analytics_event_type ON public.analytics_events USING btree (event_type, created_at DESC);

-- 70: idx_analytics_location
CREATE INDEX idx_analytics_location ON public.analytics_events USING btree (location_id, created_at DESC);

-- 70: idx_analytics_supplier
CREATE INDEX idx_analytics_supplier ON public.analytics_events USING btree (supplier_id, created_at DESC);

-- 70: idx_atelier_category
CREATE INDEX idx_atelier_category ON public.atelier USING btree (category);

-- 70: idx_atelier_city
CREATE INDEX idx_atelier_city ON public.atelier USING btree (city);

-- 70: idx_atelier_country
CREATE INDEX idx_atelier_country ON public.atelier USING btree (country);

-- 70: idx_atelier_province
CREATE INDEX idx_atelier_province ON public.atelier USING btree (province);

-- 70: idx_atelier_region
CREATE INDEX idx_atelier_region ON public.atelier USING btree (region);

-- 70: idx_atelier_verified
CREATE INDEX idx_atelier_verified ON public.atelier USING btree (verified);

-- 70: idx_budget_ideas_category
CREATE INDEX idx_budget_ideas_category ON public.budget_ideas USING btree (category_id);

-- 70: idx_budget_ideas_event
CREATE INDEX idx_budget_ideas_event ON public.budget_ideas USING btree (event_id);

-- 70: idx_categories_display_order
CREATE INDEX idx_categories_display_order ON public.categories USING btree (event_id, display_order);

-- 70: idx_categories_event_id
CREATE INDEX idx_categories_event_id ON public.categories USING btree (event_id);

-- 70: idx_categories_event_type_sort
CREATE INDEX idx_categories_event_type_sort ON public.categories USING btree (event_type_id, sort) WHERE (event_type_id IS NOT NULL);

-- 70: idx_category_translations_category
CREATE INDEX idx_category_translations_category ON public.category_translations USING btree (category_id);

-- 70: idx_category_translations_locale
CREATE INDEX idx_category_translations_locale ON public.category_translations USING btree (locale);

-- 70: idx_churches_country
CREATE INDEX idx_churches_country ON public.churches USING btree (country);

-- 70: idx_churches_featured
CREATE INDEX idx_churches_featured ON public.churches USING btree (is_featured);

-- 70: idx_churches_google_place_id
CREATE INDEX idx_churches_google_place_id ON public.churches USING btree (google_place_id);

-- 70: idx_churches_region
CREATE INDEX idx_churches_region ON public.churches USING btree (region);

-- 70: idx_churches_subscription_expires
CREATE INDEX idx_churches_subscription_expires ON public.churches USING btree (subscription_expires_at);

-- 70: idx_churches_subscription_tier
CREATE INDEX idx_churches_subscription_tier ON public.churches USING btree (subscription_tier);

-- 70: idx_event_timeline_translations_locale
CREATE INDEX idx_event_timeline_translations_locale ON public.event_timeline_translations USING btree (locale);

-- 70: idx_event_timeline_translations_timeline
CREATE INDEX idx_event_timeline_translations_timeline ON public.event_timeline_translations USING btree (timeline_id);

-- 70: idx_event_timelines_event_type
CREATE INDEX idx_event_timelines_event_type ON public.event_timelines USING btree (event_type_id);

-- 70: idx_event_timelines_offset
CREATE INDEX idx_event_timelines_offset ON public.event_timelines USING btree (event_type_id, offset_days);

-- 70: idx_event_timelines_type_key
CREATE INDEX idx_event_timelines_type_key ON public.event_timelines USING btree (event_type_id, key);

-- 70: idx_event_type_categories_event_type
CREATE INDEX idx_event_type_categories_event_type ON public.event_type_categories USING btree (event_type_id);

-- 70: idx_event_type_categories_sort
CREATE INDEX idx_event_type_categories_sort ON public.event_type_categories USING btree (event_type_id, sort);

-- 70: idx_event_type_subcategories_category
CREATE INDEX idx_event_type_subcategories_category ON public.event_type_subcategories USING btree (category_id);

-- 70: idx_event_type_subcategories_sort
CREATE INDEX idx_event_type_subcategories_sort ON public.event_type_subcategories USING btree (category_id, sort);

-- 70: idx_event_types_code
CREATE INDEX idx_event_types_code ON public.event_types USING btree (code);

-- 70: idx_events_event_type
CREATE INDEX idx_events_event_type ON public.events USING btree (event_type);

-- 70: idx_expenses_event_id
CREATE INDEX idx_expenses_event_id ON public.expenses USING btree (event_id);

-- 70: idx_expenses_status
CREATE INDEX idx_expenses_status ON public.expenses USING btree (status);

-- 70: idx_family_groups_event
CREATE INDEX idx_family_groups_event ON public.family_groups USING btree (event_id);

-- 70: idx_family_groups_main_contact
CREATE INDEX idx_family_groups_main_contact ON public.family_groups USING btree (main_contact_guest_id);

-- 70: idx_guests_attending
CREATE INDEX idx_guests_attending ON public.guests USING btree (attending);

-- 70: idx_guests_event_id
CREATE INDEX idx_guests_event_id ON public.guests USING btree (event_id);

-- 70: idx_guests_exclude_family_table
CREATE INDEX idx_guests_exclude_family_table ON public.guests USING btree (family_group_id, exclude_from_family_table) WHERE (family_group_id IS NOT NULL);

-- 70: idx_guests_family_group
CREATE INDEX idx_guests_family_group ON public.guests USING btree (family_group_id);

-- 70: idx_guests_guest_type
CREATE INDEX idx_guests_guest_type ON public.guests USING btree (guest_type);

-- 70: idx_guests_main_contact
CREATE INDEX idx_guests_main_contact ON public.guests USING btree (is_main_contact);

-- 70: idx_incomes_event_id
CREATE INDEX idx_incomes_event_id ON public.incomes USING btree (event_id);

-- 70: idx_locations_country
CREATE INDEX idx_locations_country ON public.locations USING btree (country);

-- 70: idx_locations_featured
CREATE INDEX idx_locations_featured ON public.locations USING btree (is_featured);

-- 70: idx_locations_google_place_id
CREATE INDEX idx_locations_google_place_id ON public.locations USING btree (google_place_id);

-- 70: idx_locations_region
CREATE INDEX idx_locations_region ON public.locations USING btree (region);

-- 70: idx_locations_region_city
CREATE INDEX idx_locations_region_city ON public.locations USING btree (region, city);

-- 70: idx_locations_subscription_expires
CREATE INDEX idx_locations_subscription_expires ON public.locations USING btree (subscription_expires_at);

-- 70: idx_locations_subscription_tier
CREATE INDEX idx_locations_subscription_tier ON public.locations USING btree (subscription_tier);

-- 70: idx_locations_verified
CREATE INDEX idx_locations_verified ON public.locations USING btree (verified);

-- 70: idx_musica_cerimonia_country
CREATE INDEX idx_musica_cerimonia_country ON public.musica_cerimonia USING btree (country);

-- 70: idx_musica_cerimonia_province
CREATE INDEX idx_musica_cerimonia_province ON public.musica_cerimonia USING btree (province);

-- 70: idx_musica_cerimonia_region
CREATE INDEX idx_musica_cerimonia_region ON public.musica_cerimonia USING btree (region);

-- 70: idx_musica_cerimonia_status
CREATE INDEX idx_musica_cerimonia_status ON public.musica_cerimonia USING btree (status);

-- 70: idx_musica_ricevimento_country
CREATE INDEX idx_musica_ricevimento_country ON public.musica_ricevimento USING btree (country);

-- 70: idx_musica_ricevimento_province
CREATE INDEX idx_musica_ricevimento_province ON public.musica_ricevimento USING btree (province);

-- 70: idx_musica_ricevimento_region
CREATE INDEX idx_musica_ricevimento_region ON public.musica_ricevimento USING btree (region);

-- 70: idx_musica_ricevimento_status
CREATE INDEX idx_musica_ricevimento_status ON public.musica_ricevimento USING btree (status);

-- 70: idx_non_invited_event_id
CREATE INDEX idx_non_invited_event_id ON public.non_invited_recipients USING btree (event_id);

-- 70: idx_payment_reminders_due_date
CREATE INDEX idx_payment_reminders_due_date ON public.payment_reminders USING btree (due_date);

-- 70: idx_payment_reminders_expense_id
CREATE INDEX idx_payment_reminders_expense_id ON public.payment_reminders USING btree (expense_id);

-- 70: idx_payment_reminders_is_paid
CREATE INDEX idx_payment_reminders_is_paid ON public.payment_reminders USING btree (is_paid);

-- 70: idx_places_city
CREATE INDEX idx_places_city ON public.places USING btree (city);

-- 70: idx_places_google_id
CREATE INDEX idx_places_google_id ON public.places USING btree (google_place_id) WHERE (google_place_id IS NOT NULL);

-- 70: idx_places_location
CREATE INDEX idx_places_location ON public.places USING gist (point((lng)::double precision, (lat)::double precision));

-- 70: idx_places_osm_id
CREATE INDEX idx_places_osm_id ON public.places USING btree (osm_id) WHERE (osm_id IS NOT NULL);

-- 70: idx_places_province
CREATE INDEX idx_places_province ON public.places USING btree (province);

-- 70: idx_places_region
CREATE INDEX idx_places_region ON public.places USING btree (region);

-- 70: idx_places_wikidata_id
CREATE INDEX idx_places_wikidata_id ON public.places USING btree (wikidata_qid) WHERE (wikidata_qid IS NOT NULL);

-- 70: idx_subcategories_category_id
CREATE INDEX idx_subcategories_category_id ON public.subcategories USING btree (category_id);

-- 70: idx_subcategories_category_sort
CREATE INDEX idx_subcategories_category_sort ON public.subcategories USING btree (category_id, sort);

-- 70: idx_subcategories_display_order
CREATE INDEX idx_subcategories_display_order ON public.subcategories USING btree (category_id, display_order);

-- 70: idx_subcategory_translations_locale
CREATE INDEX idx_subcategory_translations_locale ON public.subcategory_translations USING btree (locale);

-- 70: idx_subcategory_translations_subcategory
CREATE INDEX idx_subcategory_translations_subcategory ON public.subcategory_translations USING btree (subcategory_id);

-- 70: idx_suppliers_category
CREATE INDEX idx_suppliers_category ON public.suppliers USING btree (category);

-- 70: idx_suppliers_country
CREATE INDEX idx_suppliers_country ON public.suppliers USING btree (country);

-- 70: idx_suppliers_featured
CREATE INDEX idx_suppliers_featured ON public.suppliers USING btree (is_featured);

-- 70: idx_suppliers_google_place_id
CREATE INDEX idx_suppliers_google_place_id ON public.suppliers USING btree (google_place_id);

-- 70: idx_suppliers_region
CREATE INDEX idx_suppliers_region ON public.suppliers USING btree (region);

-- 70: idx_suppliers_subscription_expires
CREATE INDEX idx_suppliers_subscription_expires ON public.suppliers USING btree (subscription_expires_at);

-- 70: idx_suppliers_subscription_tier
CREATE INDEX idx_suppliers_subscription_tier ON public.suppliers USING btree (subscription_tier);

-- 70: idx_sync_jobs_created
CREATE INDEX idx_sync_jobs_created ON public.sync_jobs USING btree (created_at DESC);

-- 70: idx_sync_jobs_source_type
CREATE INDEX idx_sync_jobs_source_type ON public.sync_jobs USING btree (source, type);

-- 70: idx_sync_jobs_status
CREATE INDEX idx_sync_jobs_status ON public.sync_jobs USING btree (status);

-- 70: idx_table_assignments_guest
CREATE INDEX idx_table_assignments_guest ON public.table_assignments USING btree (guest_id);

-- 70: idx_table_assignments_table
CREATE INDEX idx_table_assignments_table ON public.table_assignments USING btree (table_id);

-- 70: idx_tables_event
CREATE INDEX idx_tables_event ON public.tables USING btree (event_id);

-- 70: idx_timeline_due_date
CREATE INDEX idx_timeline_due_date ON public.timeline_items USING btree (due_date);

-- 70: idx_timeline_event_id
CREATE INDEX idx_timeline_event_id ON public.timeline_items USING btree (event_id);

-- 70: idx_timeline_items_days_before
CREATE INDEX idx_timeline_items_days_before ON public.timeline_items USING btree (days_before);

-- 70: idx_timeline_items_event_id
CREATE INDEX idx_timeline_items_event_id ON public.timeline_items USING btree (event_id);

-- 70: idx_timeline_items_phase
CREATE INDEX idx_timeline_items_phase ON public.timeline_items USING btree (phase);

-- 70: idx_transactions_church
CREATE INDEX idx_transactions_church ON public.subscription_transactions USING btree (church_id);

-- 70: idx_transactions_location
CREATE INDEX idx_transactions_location ON public.subscription_transactions USING btree (location_id);

-- 70: idx_transactions_supplier
CREATE INDEX idx_transactions_supplier ON public.subscription_transactions USING btree (supplier_id);

-- 70: idx_user_event_timeline_completed
CREATE INDEX idx_user_event_timeline_completed ON public.user_event_timeline USING btree (event_id, is_completed);

-- 70: idx_user_event_timeline_due_date
CREATE INDEX idx_user_event_timeline_due_date ON public.user_event_timeline USING btree (event_id, due_date);

-- 70: idx_user_event_timeline_event
CREATE INDEX idx_user_event_timeline_event ON public.user_event_timeline USING btree (event_id);

-- 70: idx_vendor_places_place
CREATE INDEX idx_vendor_places_place ON public.vendor_places USING btree (place_id);

-- 70: idx_vendor_places_primary
CREATE INDEX idx_vendor_places_primary ON public.vendor_places USING btree (vendor_id) WHERE (is_primary = true);

-- 70: idx_vendor_places_vendor
CREATE INDEX idx_vendor_places_vendor ON public.vendor_places USING btree (vendor_id);

-- 70: idx_vendors_rating
CREATE INDEX idx_vendors_rating ON public.vendors USING btree (rating DESC) WHERE (rating IS NOT NULL);

-- 70: idx_vendors_source
CREATE INDEX idx_vendors_source ON public.vendors USING btree (source);

-- 70: idx_vendors_source_id
CREATE INDEX idx_vendors_source_id ON public.vendors USING btree (source_id);

-- 70: idx_vendors_type
CREATE INDEX idx_vendors_type ON public.vendors USING btree (type);

-- 70: idx_vendors_verified
CREATE INDEX idx_vendors_verified ON public.vendors USING btree (verified);

-- 70: idx_wedding_cards_event_id
CREATE INDEX idx_wedding_cards_event_id ON public.wedding_cards USING btree (event_id);

-- 70: idx_wedding_planners_province
CREATE INDEX idx_wedding_planners_province ON public.wedding_planners USING btree (province);

-- 70: idx_wedding_planners_region
CREATE INDEX idx_wedding_planners_region ON public.wedding_planners USING btree (region);

-- 70: idx_wedding_planners_status
CREATE INDEX idx_wedding_planners_status ON public.wedding_planners USING btree (status);

-- 70: subcategories_unique_cat_lowername
CREATE UNIQUE INDEX subcategories_unique_cat_lowername ON public.subcategories USING btree (category_id, lower(name));

-- 80: analytics_events
alter table public.analytics_events enable row level security;

-- 80: atelier
alter table public.atelier enable row level security;

-- 80: budget_ideas
alter table public.budget_ideas enable row level security;

-- 80: budget_items
alter table public.budget_items enable row level security;

-- 80: categories
alter table public.categories enable row level security;

-- 80: category_translations
alter table public.category_translations enable row level security;

-- 80: checklist_modules
alter table public.checklist_modules enable row level security;

-- 80: churches
alter table public.churches enable row level security;

-- 80: event_timeline_translations
alter table public.event_timeline_translations enable row level security;

-- 80: event_timelines
alter table public.event_timelines enable row level security;

-- 80: event_type_categories
alter table public.event_type_categories enable row level security;

-- 80: event_type_subcategories
alter table public.event_type_subcategories enable row level security;

-- 80: event_type_translations
alter table public.event_type_translations enable row level security;

-- 80: event_type_variants
alter table public.event_type_variants enable row level security;

-- 80: event_types
alter table public.event_types enable row level security;

-- 80: events
alter table public.events enable row level security;

-- 80: expenses
alter table public.expenses enable row level security;

-- 80: family_groups
alter table public.family_groups enable row level security;

-- 80: geo_countries
alter table public.geo_countries enable row level security;

-- 80: guests
alter table public.guests enable row level security;

-- 80: i18n_locales
alter table public.i18n_locales enable row level security;

-- 80: incomes
alter table public.incomes enable row level security;

-- 80: locations
alter table public.locations enable row level security;

-- 80: musica_cerimonia
alter table public.musica_cerimonia enable row level security;

-- 80: musica_ricevimento
alter table public.musica_ricevimento enable row level security;

-- 80: non_invited_recipients
alter table public.non_invited_recipients enable row level security;

-- 80: payment_reminders
alter table public.payment_reminders enable row level security;

-- 80: places
alter table public.places enable row level security;

-- 80: profiles
alter table public.profiles enable row level security;

-- 80: subcategories
alter table public.subcategories enable row level security;

-- 80: subcategory_translations
alter table public.subcategory_translations enable row level security;

-- 80: subscription_packages
alter table public.subscription_packages enable row level security;

-- 80: subscription_transactions
alter table public.subscription_transactions enable row level security;

-- 80: suppliers
alter table public.suppliers enable row level security;

-- 80: sync_jobs
alter table public.sync_jobs enable row level security;

-- 80: table_assignments
alter table public.table_assignments enable row level security;

-- 80: tables
alter table public.tables enable row level security;

-- 80: timeline_items
alter table public.timeline_items enable row level security;

-- 80: traditions
alter table public.traditions enable row level security;

-- 80: user_event_timeline
alter table public.user_event_timeline enable row level security;

-- 80: vendor_places
alter table public.vendor_places enable row level security;

-- 80: vendors
alter table public.vendors enable row level security;

-- 80: wedding_cards
alter table public.wedding_cards enable row level security;

-- 80: wedding_planners
alter table public.wedding_planners enable row level security;

-- 90: analytics_events.Users can view own supplier analytics
create policy "Users can view own supplier analytics" on public.analytics_events as permissive for select to  using (((supplier_id IN ( SELECT suppliers.id
   FROM suppliers
  WHERE (suppliers.user_id = auth.uid()))) OR (location_id IN ( SELECT locations.id
   FROM locations
  WHERE (locations.user_id = auth.uid()))) OR (church_id IN ( SELECT churches.id
   FROM churches
  WHERE (churches.user_id = auth.uid())))));

-- 90: atelier.Allow authenticated users to insert atelier
create policy "Allow authenticated users to insert atelier" on public.atelier as permissive for insert to authenticated with check (true);

-- 90: atelier.Allow authenticated users to update atelier
create policy "Allow authenticated users to update atelier" on public.atelier as permissive for update to authenticated using (true) with check (true);

-- 90: atelier.Allow public read access to atelier
create policy "Allow public read access to atelier" on public.atelier as permissive for select to  using (true);

-- 90: budget_ideas.budget_ideas_read_all
create policy budget_ideas_read_all on public.budget_ideas as permissive for select to  using (true);

-- 90: budget_items.public read budget_items
create policy "public read budget_items" on public.budget_items as permissive for select to  using (true);

-- 90: categories.categories_delete_own
create policy categories_delete_own on public.categories as permissive for delete to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = categories.event_id) AND (events.owner_id = auth.uid())))));

-- 90: categories.categories_insert_self
create policy categories_insert_self on public.categories as permissive for insert to  with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = categories.event_id) AND (events.owner_id = auth.uid())))));

-- 90: categories.categories_select_own
create policy categories_select_own on public.categories as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = categories.event_id) AND (events.owner_id = auth.uid())))));

-- 90: categories.categories_update_own
create policy categories_update_own on public.categories as permissive for update to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = categories.event_id) AND (events.owner_id = auth.uid())))));

-- 90: category_translations.Public can read category translations
create policy "Public can read category translations" on public.category_translations as permissive for select to anon, authenticated using (true);

-- 90: checklist_modules.public read checklist_modules
create policy "public read checklist_modules" on public.checklist_modules as permissive for select to  using (true);

-- 90: churches.churches_insert_auth
create policy churches_insert_auth on public.churches as permissive for insert to  with check ((auth.uid() IS NOT NULL));

-- 90: churches.churches_select_all
create policy churches_select_all on public.churches as permissive for select to  using (true);

-- 90: churches.churches_update_own
create policy churches_update_own on public.churches as permissive for update to  using (((user_id = auth.uid()) AND (verified = false)));

-- 90: event_timeline_translations.Public can read event timeline tran
create policy "Public can read event timeline translations" on public.event_timeline_translations as permissive for select to anon, authenticated using (true);

-- 90: event_timelines.Anyone can view event timelines
create policy "Anyone can view event timelines" on public.event_timelines as permissive for select to  using (true);

-- 90: event_type_categories.Anyone can view event type categories
create policy "Anyone can view event type categories" on public.event_type_categories as permissive for select to  using (true);

-- 90: event_type_subcategories.Anyone can view event type subcategori
create policy "Anyone can view event type subcategories" on public.event_type_subcategories as permissive for select to  using (true);

-- 90: event_type_translations.Public can read event type translations
create policy "Public can read event type translations" on public.event_type_translations as permissive for select to anon, authenticated using (true);

-- 90: event_type_variants.Public can read event type variants
create policy "Public can read event type variants" on public.event_type_variants as permissive for select to anon, authenticated using (true);

-- 90: event_types.Anyone can view event types
create policy "Anyone can view event types" on public.event_types as permissive for select to  using (true);

-- 90: events.events_delete_own
create policy events_delete_own on public.events as permissive for delete to  using ((owner_id = auth.uid()));

-- 90: events.events_insert_self
create policy events_insert_self on public.events as permissive for insert to  with check ((owner_id = auth.uid()));

-- 90: events.events_select_own
create policy events_select_own on public.events as permissive for select to  using ((owner_id = auth.uid()));

-- 90: events.events_update_own
create policy events_update_own on public.events as permissive for update to  using ((owner_id = auth.uid()));

-- 90: expenses.expenses_delete_own
create policy expenses_delete_own on public.expenses as permissive for delete to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = expenses.event_id) AND (events.owner_id = auth.uid())))));

-- 90: expenses.expenses_insert_self
create policy expenses_insert_self on public.expenses as permissive for insert to  with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = expenses.event_id) AND (events.owner_id = auth.uid())))));

-- 90: expenses.expenses_select_own
create policy expenses_select_own on public.expenses as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = expenses.event_id) AND (events.owner_id = auth.uid())))));

-- 90: expenses.expenses_update_own
create policy expenses_update_own on public.expenses as permissive for update to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = expenses.event_id) AND (events.owner_id = auth.uid())))));

-- 90: family_groups.Owners can manage family groups
create policy "Owners can manage family groups" on public.family_groups as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = family_groups.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid)))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = family_groups.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid))))));

-- 90: geo_countries.Public can read countries
create policy "Public can read countries" on public.geo_countries as permissive for select to anon, authenticated using (true);

-- 90: guests.Users can manage their own guests
create policy "Users can manage their own guests" on public.guests as permissive for all to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = guests.event_id) AND (events.owner_id = auth.uid()))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = guests.event_id) AND (events.owner_id = auth.uid())))));

-- 90: guests.Users can view their own guests
create policy "Users can view their own guests" on public.guests as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = guests.event_id) AND (events.owner_id = auth.uid())))));

-- 90: i18n_locales.Public can read locales
create policy "Public can read locales" on public.i18n_locales as permissive for select to anon, authenticated using (true);

-- 90: incomes.incomes_delete_own
create policy incomes_delete_own on public.incomes as permissive for delete to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = incomes.event_id) AND (events.owner_id = auth.uid())))));

-- 90: incomes.incomes_insert_self
create policy incomes_insert_self on public.incomes as permissive for insert to  with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = incomes.event_id) AND (events.owner_id = auth.uid())))));

-- 90: incomes.incomes_select_own
create policy incomes_select_own on public.incomes as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = incomes.event_id) AND (events.owner_id = auth.uid())))));

-- 90: incomes.incomes_update_own
create policy incomes_update_own on public.incomes as permissive for update to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = incomes.event_id) AND (events.owner_id = auth.uid())))));

-- 90: locations.locations_insert_auth
create policy locations_insert_auth on public.locations as permissive for insert to  with check ((auth.uid() IS NOT NULL));

-- 90: locations.locations_select_all
create policy locations_select_all on public.locations as permissive for select to  using (true);

-- 90: locations.locations_update_own
create policy locations_update_own on public.locations as permissive for update to  using (((user_id = auth.uid()) AND (verified = false)));

-- 90: musica_cerimonia.Anyone can view approved ceremony musicians
create policy "Anyone can view approved ceremony musicians" on public.musica_cerimonia as permissive for select to  using ((status = 'approved'::text));

-- 90: musica_cerimonia.Users can submit ceremony musicians
create policy "Users can submit ceremony musicians" on public.musica_cerimonia as permissive for insert to  with check (true);

-- 90: musica_ricevimento.Anyone can view approved reception musicians
create policy "Anyone can view approved reception musicians" on public.musica_ricevimento as permissive for select to  using ((status = 'approved'::text));

-- 90: musica_ricevimento.Users can submit reception musicians
create policy "Users can submit reception musicians" on public.musica_ricevimento as permissive for insert to  with check (true);

-- 90: non_invited_recipients.Owners can manage non invited recipients
create policy "Owners can manage non invited recipients" on public.non_invited_recipients as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = non_invited_recipients.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid)))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = non_invited_recipients.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid))))));

-- 90: payment_reminders.Users can manage their own payment reminders
create policy "Users can manage their own payment reminders" on public.payment_reminders as permissive for all to  using ((EXISTS ( SELECT 1
   FROM (expenses e
     JOIN events ev ON ((ev.id = e.event_id)))
  WHERE ((e.id = payment_reminders.expense_id) AND (ev.owner_id = auth.uid()))))) with check ((EXISTS ( SELECT 1
   FROM (expenses e
     JOIN events ev ON ((ev.id = e.event_id)))
  WHERE ((e.id = payment_reminders.expense_id) AND (ev.owner_id = auth.uid())))));

-- 90: payment_reminders.Users can view their own payment reminders
create policy "Users can view their own payment reminders" on public.payment_reminders as permissive for select to  using ((EXISTS ( SELECT 1
   FROM (expenses e
     JOIN events ev ON ((ev.id = e.event_id)))
  WHERE ((e.id = payment_reminders.expense_id) AND (ev.owner_id = auth.uid())))));

-- 90: places.Public can read places
create policy "Public can read places" on public.places as permissive for select to anon, authenticated using (true);

-- 90: profiles.profiles_insert_self
create policy profiles_insert_self on public.profiles as permissive for insert to  with check ((auth.uid() = id));

-- 90: profiles.profiles_select_own
create policy profiles_select_own on public.profiles as permissive for select to  using ((auth.uid() = id));

-- 90: profiles.profiles_update_own
create policy profiles_update_own on public.profiles as permissive for update to  using ((auth.uid() = id));

-- 90: subcategories.subcategories_delete_own
create policy subcategories_delete_own on public.subcategories as permissive for delete to  using ((EXISTS ( SELECT 1
   FROM (categories c
     JOIN events e ON ((e.id = c.event_id)))
  WHERE ((c.id = subcategories.category_id) AND (e.owner_id = auth.uid())))));

-- 90: subcategories.subcategories_insert_self
create policy subcategories_insert_self on public.subcategories as permissive for insert to  with check ((EXISTS ( SELECT 1
   FROM (categories c
     JOIN events e ON ((e.id = c.event_id)))
  WHERE ((c.id = subcategories.category_id) AND (e.owner_id = auth.uid())))));

-- 90: subcategories.subcategories_select_own
create policy subcategories_select_own on public.subcategories as permissive for select to  using ((EXISTS ( SELECT 1
   FROM (categories c
     JOIN events e ON ((e.id = c.event_id)))
  WHERE ((c.id = subcategories.category_id) AND (e.owner_id = auth.uid())))));

-- 90: subcategories.subcategories_update_own
create policy subcategories_update_own on public.subcategories as permissive for update to  using ((EXISTS ( SELECT 1
   FROM (categories c
     JOIN events e ON ((e.id = c.event_id)))
  WHERE ((c.id = subcategories.category_id) AND (e.owner_id = auth.uid())))));

-- 90: subcategory_translations.Public can read subcategory translatio
create policy "Public can read subcategory translations" on public.subcategory_translations as permissive for select to anon, authenticated using (true);

-- 90: subscription_packages.Allow public read subscription_packages
create policy "Allow public read subscription_packages" on public.subscription_packages as permissive for select to  using ((is_active = true));

-- 90: subscription_transactions.Users can view own transactions via s
create policy "Users can view own transactions via supplier" on public.subscription_transactions as permissive for select to  using (((supplier_id IN ( SELECT suppliers.id
   FROM suppliers
  WHERE (suppliers.user_id = auth.uid()))) OR (location_id IN ( SELECT locations.id
   FROM locations
  WHERE (locations.user_id = auth.uid()))) OR (church_id IN ( SELECT churches.id
   FROM churches
  WHERE (churches.user_id = auth.uid())))));

-- 90: suppliers.suppliers_insert_auth
create policy suppliers_insert_auth on public.suppliers as permissive for insert to  with check ((auth.uid() IS NOT NULL));

-- 90: suppliers.suppliers_select_all
create policy suppliers_select_all on public.suppliers as permissive for select to  using (true);

-- 90: suppliers.suppliers_update_own
create policy suppliers_update_own on public.suppliers as permissive for update to  using (((user_id = auth.uid()) AND (verified = false)));

-- 90: table_assignments.Owners can manage table assignments
create policy "Owners can manage table assignments" on public.table_assignments as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM (tables
     JOIN events ON ((events.id = tables.event_id)))
  WHERE ((tables.id = table_assignments.table_id) AND (events.owner_id = ( SELECT auth.uid() AS uid)))))) with check ((EXISTS ( SELECT 1
   FROM (tables
     JOIN events ON ((events.id = tables.event_id)))
  WHERE ((tables.id = table_assignments.table_id) AND (events.owner_id = ( SELECT auth.uid() AS uid))))));

-- 90: tables.Owners can manage tables
create policy "Owners can manage tables" on public.tables as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = tables.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid)))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = tables.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid))))));

-- 90: timeline_items.Owners can manage timeline items
create policy "Owners can manage timeline items" on public.timeline_items as permissive for all to authenticated using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = timeline_items.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid)))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = timeline_items.event_id) AND (events.owner_id = ( SELECT auth.uid() AS uid))))));

-- 90: traditions.public read traditions
create policy "public read traditions" on public.traditions as permissive for select to  using (true);

-- 90: user_event_timeline.Users can manage their own timeline
create policy "Users can manage their own timeline" on public.user_event_timeline as permissive for all to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = user_event_timeline.event_id) AND (events.owner_id = auth.uid()))))) with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = user_event_timeline.event_id) AND (events.owner_id = auth.uid())))));

-- 90: user_event_timeline.Users can view their own timeline
create policy "Users can view their own timeline" on public.user_event_timeline as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = user_event_timeline.event_id) AND (events.owner_id = auth.uid())))));

-- 90: vendor_places.Public can read vendor places
create policy "Public can read vendor places" on public.vendor_places as permissive for select to anon, authenticated using (true);

-- 90: vendors.Public can read vendors
create policy "Public can read vendors" on public.vendors as permissive for select to anon, authenticated using (true);

-- 90: wedding_cards.wedding_cards_delete_own
create policy wedding_cards_delete_own on public.wedding_cards as permissive for delete to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = wedding_cards.event_id) AND (events.owner_id = auth.uid())))));

-- 90: wedding_cards.wedding_cards_insert_self
create policy wedding_cards_insert_self on public.wedding_cards as permissive for insert to  with check ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = wedding_cards.event_id) AND (events.owner_id = auth.uid())))));

-- 90: wedding_cards.wedding_cards_select_own
create policy wedding_cards_select_own on public.wedding_cards as permissive for select to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = wedding_cards.event_id) AND (events.owner_id = auth.uid())))));

-- 90: wedding_cards.wedding_cards_update_own
create policy wedding_cards_update_own on public.wedding_cards as permissive for update to  using ((EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = wedding_cards.event_id) AND (events.owner_id = auth.uid())))));

-- 90: wedding_planners.Anyone can view approved wedding planners
create policy "Anyone can view approved wedding planners" on public.wedding_planners as permissive for select to  using ((status = 'approved'::text));

-- 90: wedding_planners.Users can submit wedding planners
create policy "Users can submit wedding planners" on public.wedding_planners as permissive for insert to  with check (true);

-- 100: categories.update_categories_updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: churches.update_churches_updated_at
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON churches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: event_timelines.update_event_timelines_updated_at
CREATE TRIGGER update_event_timelines_updated_at BEFORE UPDATE ON event_timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: event_type_categories.update_event_type_categories_updated_at
CREATE TRIGGER update_event_type_categories_updated_at BEFORE UPDATE ON event_type_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: event_type_subcategories.update_event_type_subcategories_update
CREATE TRIGGER update_event_type_subcategories_updated_at BEFORE UPDATE ON event_type_subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: event_types.update_event_types_updated_at
CREATE TRIGGER update_event_types_updated_at BEFORE UPDATE ON event_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: events.trg_events_set_owner
CREATE TRIGGER trg_events_set_owner BEFORE INSERT ON events FOR EACH ROW EXECUTE FUNCTION set_owner_id();

-- 100: events.trg_populate_event_categories
CREATE TRIGGER trg_populate_event_categories AFTER INSERT ON events FOR EACH ROW EXECUTE FUNCTION populate_event_categories();

-- 100: events.trg_populate_user_timeline
CREATE TRIGGER trg_populate_user_timeline AFTER INSERT ON events FOR EACH ROW EXECUTE FUNCTION populate_user_timeline();

-- 100: events.update_events_updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: expenses.update_expenses_updated_at
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: family_groups.update_family_groups_updated_at
CREATE TRIGGER update_family_groups_updated_at BEFORE UPDATE ON family_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: guests.update_guests_updated_at
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: incomes.update_incomes_updated_at
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: locations.update_locations_updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: musica_cerimonia.update_musica_cerimonia_updated_at
CREATE TRIGGER update_musica_cerimonia_updated_at BEFORE UPDATE ON musica_cerimonia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: musica_ricevimento.update_musica_ricevimento_updated_at
CREATE TRIGGER update_musica_ricevimento_updated_at BEFORE UPDATE ON musica_ricevimento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: non_invited_recipients.update_non_invited_updated_at
CREATE TRIGGER update_non_invited_updated_at BEFORE UPDATE ON non_invited_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: payment_reminders.update_payment_reminders_updated_at
CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: places.places_updated_at
CREATE TRIGGER places_updated_at BEFORE UPDATE ON places FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 100: subcategories.update_subcategories_updated_at
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: suppliers.update_suppliers_updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: tables.update_tables_updated_at
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: user_event_timeline.update_user_event_timeline_updated_at
CREATE TRIGGER update_user_event_timeline_updated_at BEFORE UPDATE ON user_event_timeline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: vendors.vendors_updated_at
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 100: wedding_cards.update_wedding_cards_updated_at
CREATE TRIGGER update_wedding_cards_updated_at BEFORE UPDATE ON wedding_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 100: wedding_planners.update_wedding_planners_updated_at
CREATE TRIGGER update_wedding_planners_updated_at BEFORE UPDATE ON wedding_planners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 110: analytics_events.anon.DELETE
grant DELETE on table public.analytics_events to anon;

-- 110: analytics_events.anon.INSERT
grant INSERT on table public.analytics_events to anon;

-- 110: analytics_events.anon.MAINTAIN
grant MAINTAIN on table public.analytics_events to anon;

-- 110: analytics_events.anon.REFERENCES
grant REFERENCES on table public.analytics_events to anon;

-- 110: analytics_events.anon.SELECT
grant SELECT on table public.analytics_events to anon;

-- 110: analytics_events.anon.TRIGGER
grant TRIGGER on table public.analytics_events to anon;

-- 110: analytics_events.anon.TRUNCATE
grant TRUNCATE on table public.analytics_events to anon;

-- 110: analytics_events.anon.UPDATE
grant UPDATE on table public.analytics_events to anon;

-- 110: analytics_events.authenticated.DELETE
grant DELETE on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.INSERT
grant INSERT on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.MAINTAIN
grant MAINTAIN on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.REFERENCES
grant REFERENCES on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.SELECT
grant SELECT on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.TRIGGER
grant TRIGGER on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.TRUNCATE
grant TRUNCATE on table public.analytics_events to authenticated;

-- 110: analytics_events.authenticated.UPDATE
grant UPDATE on table public.analytics_events to authenticated;

-- 110: analytics_events.service_role.DELETE
grant DELETE on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.INSERT
grant INSERT on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.MAINTAIN
grant MAINTAIN on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.REFERENCES
grant REFERENCES on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.SELECT
grant SELECT on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.TRIGGER
grant TRIGGER on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.TRUNCATE
grant TRUNCATE on table public.analytics_events to service_role;

-- 110: analytics_events.service_role.UPDATE
grant UPDATE on table public.analytics_events to service_role;

-- 110: atelier.anon.DELETE
grant DELETE on table public.atelier to anon;

-- 110: atelier.anon.INSERT
grant INSERT on table public.atelier to anon;

-- 110: atelier.anon.MAINTAIN
grant MAINTAIN on table public.atelier to anon;

-- 110: atelier.anon.REFERENCES
grant REFERENCES on table public.atelier to anon;

-- 110: atelier.anon.SELECT
grant SELECT on table public.atelier to anon;

-- 110: atelier.anon.TRIGGER
grant TRIGGER on table public.atelier to anon;

-- 110: atelier.anon.TRUNCATE
grant TRUNCATE on table public.atelier to anon;

-- 110: atelier.anon.UPDATE
grant UPDATE on table public.atelier to anon;

-- 110: atelier.authenticated.DELETE
grant DELETE on table public.atelier to authenticated;

-- 110: atelier.authenticated.INSERT
grant INSERT on table public.atelier to authenticated;

-- 110: atelier.authenticated.MAINTAIN
grant MAINTAIN on table public.atelier to authenticated;

-- 110: atelier.authenticated.REFERENCES
grant REFERENCES on table public.atelier to authenticated;

-- 110: atelier.authenticated.SELECT
grant SELECT on table public.atelier to authenticated;

-- 110: atelier.authenticated.TRIGGER
grant TRIGGER on table public.atelier to authenticated;

-- 110: atelier.authenticated.TRUNCATE
grant TRUNCATE on table public.atelier to authenticated;

-- 110: atelier.authenticated.UPDATE
grant UPDATE on table public.atelier to authenticated;

-- 110: atelier.service_role.DELETE
grant DELETE on table public.atelier to service_role;

-- 110: atelier.service_role.INSERT
grant INSERT on table public.atelier to service_role;

-- 110: atelier.service_role.MAINTAIN
grant MAINTAIN on table public.atelier to service_role;

-- 110: atelier.service_role.REFERENCES
grant REFERENCES on table public.atelier to service_role;

-- 110: atelier.service_role.SELECT
grant SELECT on table public.atelier to service_role;

-- 110: atelier.service_role.TRIGGER
grant TRIGGER on table public.atelier to service_role;

-- 110: atelier.service_role.TRUNCATE
grant TRUNCATE on table public.atelier to service_role;

-- 110: atelier.service_role.UPDATE
grant UPDATE on table public.atelier to service_role;

-- 110: budget_ideas.anon.DELETE
grant DELETE on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.INSERT
grant INSERT on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.MAINTAIN
grant MAINTAIN on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.REFERENCES
grant REFERENCES on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.SELECT
grant SELECT on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.TRIGGER
grant TRIGGER on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.TRUNCATE
grant TRUNCATE on table public.budget_ideas to anon;

-- 110: budget_ideas.anon.UPDATE
grant UPDATE on table public.budget_ideas to anon;

-- 110: budget_ideas.authenticated.DELETE
grant DELETE on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.INSERT
grant INSERT on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.MAINTAIN
grant MAINTAIN on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.REFERENCES
grant REFERENCES on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.SELECT
grant SELECT on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.TRIGGER
grant TRIGGER on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.TRUNCATE
grant TRUNCATE on table public.budget_ideas to authenticated;

-- 110: budget_ideas.authenticated.UPDATE
grant UPDATE on table public.budget_ideas to authenticated;

-- 110: budget_ideas.service_role.DELETE
grant DELETE on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.INSERT
grant INSERT on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.MAINTAIN
grant MAINTAIN on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.REFERENCES
grant REFERENCES on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.SELECT
grant SELECT on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.TRIGGER
grant TRIGGER on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.TRUNCATE
grant TRUNCATE on table public.budget_ideas to service_role;

-- 110: budget_ideas.service_role.UPDATE
grant UPDATE on table public.budget_ideas to service_role;

-- 110: budget_items.anon.DELETE
grant DELETE on table public.budget_items to anon;

-- 110: budget_items.anon.INSERT
grant INSERT on table public.budget_items to anon;

-- 110: budget_items.anon.MAINTAIN
grant MAINTAIN on table public.budget_items to anon;

-- 110: budget_items.anon.REFERENCES
grant REFERENCES on table public.budget_items to anon;

-- 110: budget_items.anon.SELECT
grant SELECT on table public.budget_items to anon;

-- 110: budget_items.anon.TRIGGER
grant TRIGGER on table public.budget_items to anon;

-- 110: budget_items.anon.TRUNCATE
grant TRUNCATE on table public.budget_items to anon;

-- 110: budget_items.anon.UPDATE
grant UPDATE on table public.budget_items to anon;

-- 110: budget_items.authenticated.DELETE
grant DELETE on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.INSERT
grant INSERT on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.MAINTAIN
grant MAINTAIN on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.REFERENCES
grant REFERENCES on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.SELECT
grant SELECT on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.TRIGGER
grant TRIGGER on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.TRUNCATE
grant TRUNCATE on table public.budget_items to authenticated;

-- 110: budget_items.authenticated.UPDATE
grant UPDATE on table public.budget_items to authenticated;

-- 110: budget_items.service_role.DELETE
grant DELETE on table public.budget_items to service_role;

-- 110: budget_items.service_role.INSERT
grant INSERT on table public.budget_items to service_role;

-- 110: budget_items.service_role.MAINTAIN
grant MAINTAIN on table public.budget_items to service_role;

-- 110: budget_items.service_role.REFERENCES
grant REFERENCES on table public.budget_items to service_role;

-- 110: budget_items.service_role.SELECT
grant SELECT on table public.budget_items to service_role;

-- 110: budget_items.service_role.TRIGGER
grant TRIGGER on table public.budget_items to service_role;

-- 110: budget_items.service_role.TRUNCATE
grant TRUNCATE on table public.budget_items to service_role;

-- 110: budget_items.service_role.UPDATE
grant UPDATE on table public.budget_items to service_role;

-- 110: budget_items_id_seq.anon.SELECT
grant SELECT on sequence public.budget_items_id_seq to anon;

-- 110: budget_items_id_seq.anon.UPDATE
grant UPDATE on sequence public.budget_items_id_seq to anon;

-- 110: budget_items_id_seq.anon.USAGE
grant USAGE on sequence public.budget_items_id_seq to anon;

-- 110: budget_items_id_seq.authenticated.SELECT
grant SELECT on sequence public.budget_items_id_seq to authenticated;

-- 110: budget_items_id_seq.authenticated.UPDATE
grant UPDATE on sequence public.budget_items_id_seq to authenticated;

-- 110: budget_items_id_seq.authenticated.USAGE
grant USAGE on sequence public.budget_items_id_seq to authenticated;

-- 110: budget_items_id_seq.service_role.SELECT
grant SELECT on sequence public.budget_items_id_seq to service_role;

-- 110: budget_items_id_seq.service_role.UPDATE
grant UPDATE on sequence public.budget_items_id_seq to service_role;

-- 110: budget_items_id_seq.service_role.USAGE
grant USAGE on sequence public.budget_items_id_seq to service_role;

-- 110: categories.anon.DELETE
grant DELETE on table public.categories to anon;

-- 110: categories.anon.INSERT
grant INSERT on table public.categories to anon;

-- 110: categories.anon.MAINTAIN
grant MAINTAIN on table public.categories to anon;

-- 110: categories.anon.REFERENCES
grant REFERENCES on table public.categories to anon;

-- 110: categories.anon.SELECT
grant SELECT on table public.categories to anon;

-- 110: categories.anon.TRIGGER
grant TRIGGER on table public.categories to anon;

-- 110: categories.anon.TRUNCATE
grant TRUNCATE on table public.categories to anon;

-- 110: categories.anon.UPDATE
grant UPDATE on table public.categories to anon;

-- 110: categories.authenticated.DELETE
grant DELETE on table public.categories to authenticated;

-- 110: categories.authenticated.INSERT
grant INSERT on table public.categories to authenticated;

-- 110: categories.authenticated.MAINTAIN
grant MAINTAIN on table public.categories to authenticated;

-- 110: categories.authenticated.REFERENCES
grant REFERENCES on table public.categories to authenticated;

-- 110: categories.authenticated.SELECT
grant SELECT on table public.categories to authenticated;

-- 110: categories.authenticated.TRIGGER
grant TRIGGER on table public.categories to authenticated;

-- 110: categories.authenticated.TRUNCATE
grant TRUNCATE on table public.categories to authenticated;

-- 110: categories.authenticated.UPDATE
grant UPDATE on table public.categories to authenticated;

-- 110: categories.service_role.DELETE
grant DELETE on table public.categories to service_role;

-- 110: categories.service_role.INSERT
grant INSERT on table public.categories to service_role;

-- 110: categories.service_role.MAINTAIN
grant MAINTAIN on table public.categories to service_role;

-- 110: categories.service_role.REFERENCES
grant REFERENCES on table public.categories to service_role;

-- 110: categories.service_role.SELECT
grant SELECT on table public.categories to service_role;

-- 110: categories.service_role.TRIGGER
grant TRIGGER on table public.categories to service_role;

-- 110: categories.service_role.TRUNCATE
grant TRUNCATE on table public.categories to service_role;

-- 110: categories.service_role.UPDATE
grant UPDATE on table public.categories to service_role;

-- 110: category_translations.anon.DELETE
grant DELETE on table public.category_translations to anon;

-- 110: category_translations.anon.INSERT
grant INSERT on table public.category_translations to anon;

-- 110: category_translations.anon.MAINTAIN
grant MAINTAIN on table public.category_translations to anon;

-- 110: category_translations.anon.REFERENCES
grant REFERENCES on table public.category_translations to anon;

-- 110: category_translations.anon.SELECT
grant SELECT on table public.category_translations to anon;

-- 110: category_translations.anon.TRIGGER
grant TRIGGER on table public.category_translations to anon;

-- 110: category_translations.anon.TRUNCATE
grant TRUNCATE on table public.category_translations to anon;

-- 110: category_translations.anon.UPDATE
grant UPDATE on table public.category_translations to anon;

-- 110: category_translations.authenticated.DELETE
grant DELETE on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.INSERT
grant INSERT on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.MAINTAIN
grant MAINTAIN on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.REFERENCES
grant REFERENCES on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.SELECT
grant SELECT on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.TRIGGER
grant TRIGGER on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.TRUNCATE
grant TRUNCATE on table public.category_translations to authenticated;

-- 110: category_translations.authenticated.UPDATE
grant UPDATE on table public.category_translations to authenticated;

-- 110: category_translations.service_role.DELETE
grant DELETE on table public.category_translations to service_role;

-- 110: category_translations.service_role.INSERT
grant INSERT on table public.category_translations to service_role;

-- 110: category_translations.service_role.MAINTAIN
grant MAINTAIN on table public.category_translations to service_role;

-- 110: category_translations.service_role.REFERENCES
grant REFERENCES on table public.category_translations to service_role;

-- 110: category_translations.service_role.SELECT
grant SELECT on table public.category_translations to service_role;

-- 110: category_translations.service_role.TRIGGER
grant TRIGGER on table public.category_translations to service_role;

-- 110: category_translations.service_role.TRUNCATE
grant TRUNCATE on table public.category_translations to service_role;

-- 110: category_translations.service_role.UPDATE
grant UPDATE on table public.category_translations to service_role;

-- 110: checklist_modules.anon.DELETE
grant DELETE on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.INSERT
grant INSERT on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.MAINTAIN
grant MAINTAIN on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.REFERENCES
grant REFERENCES on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.SELECT
grant SELECT on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.TRIGGER
grant TRIGGER on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.TRUNCATE
grant TRUNCATE on table public.checklist_modules to anon;

-- 110: checklist_modules.anon.UPDATE
grant UPDATE on table public.checklist_modules to anon;

-- 110: checklist_modules.authenticated.DELETE
grant DELETE on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.INSERT
grant INSERT on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.MAINTAIN
grant MAINTAIN on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.REFERENCES
grant REFERENCES on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.SELECT
grant SELECT on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.TRIGGER
grant TRIGGER on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.TRUNCATE
grant TRUNCATE on table public.checklist_modules to authenticated;

-- 110: checklist_modules.authenticated.UPDATE
grant UPDATE on table public.checklist_modules to authenticated;

-- 110: checklist_modules.service_role.DELETE
grant DELETE on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.INSERT
grant INSERT on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.MAINTAIN
grant MAINTAIN on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.REFERENCES
grant REFERENCES on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.SELECT
grant SELECT on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.TRIGGER
grant TRIGGER on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.TRUNCATE
grant TRUNCATE on table public.checklist_modules to service_role;

-- 110: checklist_modules.service_role.UPDATE
grant UPDATE on table public.checklist_modules to service_role;

-- 110: checklist_modules_id_seq.anon.SELECT
grant SELECT on sequence public.checklist_modules_id_seq to anon;

-- 110: checklist_modules_id_seq.anon.UPDATE
grant UPDATE on sequence public.checklist_modules_id_seq to anon;

-- 110: checklist_modules_id_seq.anon.USAGE
grant USAGE on sequence public.checklist_modules_id_seq to anon;

-- 110: checklist_modules_id_seq.authenticated.SELECT
grant SELECT on sequence public.checklist_modules_id_seq to authenticated;

-- 110: checklist_modules_id_seq.authenticated.UPDATE
grant UPDATE on sequence public.checklist_modules_id_seq to authenticated;

-- 110: checklist_modules_id_seq.authenticated.USAGE
grant USAGE on sequence public.checklist_modules_id_seq to authenticated;

-- 110: checklist_modules_id_seq.service_role.SELECT
grant SELECT on sequence public.checklist_modules_id_seq to service_role;

-- 110: checklist_modules_id_seq.service_role.UPDATE
grant UPDATE on sequence public.checklist_modules_id_seq to service_role;

-- 110: checklist_modules_id_seq.service_role.USAGE
grant USAGE on sequence public.checklist_modules_id_seq to service_role;

-- 110: churches.anon.DELETE
grant DELETE on table public.churches to anon;

-- 110: churches.anon.INSERT
grant INSERT on table public.churches to anon;

-- 110: churches.anon.MAINTAIN
grant MAINTAIN on table public.churches to anon;

-- 110: churches.anon.REFERENCES
grant REFERENCES on table public.churches to anon;

-- 110: churches.anon.SELECT
grant SELECT on table public.churches to anon;

-- 110: churches.anon.TRIGGER
grant TRIGGER on table public.churches to anon;

-- 110: churches.anon.TRUNCATE
grant TRUNCATE on table public.churches to anon;

-- 110: churches.anon.UPDATE
grant UPDATE on table public.churches to anon;

-- 110: churches.authenticated.DELETE
grant DELETE on table public.churches to authenticated;

-- 110: churches.authenticated.INSERT
grant INSERT on table public.churches to authenticated;

-- 110: churches.authenticated.MAINTAIN
grant MAINTAIN on table public.churches to authenticated;

-- 110: churches.authenticated.REFERENCES
grant REFERENCES on table public.churches to authenticated;

-- 110: churches.authenticated.SELECT
grant SELECT on table public.churches to authenticated;

-- 110: churches.authenticated.TRIGGER
grant TRIGGER on table public.churches to authenticated;

-- 110: churches.authenticated.TRUNCATE
grant TRUNCATE on table public.churches to authenticated;

-- 110: churches.authenticated.UPDATE
grant UPDATE on table public.churches to authenticated;

-- 110: churches.service_role.DELETE
grant DELETE on table public.churches to service_role;

-- 110: churches.service_role.INSERT
grant INSERT on table public.churches to service_role;

-- 110: churches.service_role.MAINTAIN
grant MAINTAIN on table public.churches to service_role;

-- 110: churches.service_role.REFERENCES
grant REFERENCES on table public.churches to service_role;

-- 110: churches.service_role.SELECT
grant SELECT on table public.churches to service_role;

-- 110: churches.service_role.TRIGGER
grant TRIGGER on table public.churches to service_role;

-- 110: churches.service_role.TRUNCATE
grant TRUNCATE on table public.churches to service_role;

-- 110: churches.service_role.UPDATE
grant UPDATE on table public.churches to service_role;

-- 110: event_timeline_translations.anon.DELETE
grant DELETE on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.INSERT
grant INSERT on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.MAINTAIN
grant MAINTAIN on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.REFERENCES
grant REFERENCES on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.SELECT
grant SELECT on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.TRIGGER
grant TRIGGER on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.TRUNCATE
grant TRUNCATE on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.anon.UPDATE
grant UPDATE on table public.event_timeline_translations to anon;

-- 110: event_timeline_translations.authenticated.DELETE
grant DELETE on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.INSERT
grant INSERT on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.MAINTAIN
grant MAINTAIN on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.REFERENCES
grant REFERENCES on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.SELECT
grant SELECT on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.TRIGGER
grant TRIGGER on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.TRUNCATE
grant TRUNCATE on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.authenticated.UPDATE
grant UPDATE on table public.event_timeline_translations to authenticated;

-- 110: event_timeline_translations.service_role.DELETE
grant DELETE on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.INSERT
grant INSERT on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.MAINTAIN
grant MAINTAIN on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.REFERENCES
grant REFERENCES on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.SELECT
grant SELECT on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.TRIGGER
grant TRIGGER on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.TRUNCATE
grant TRUNCATE on table public.event_timeline_translations to service_role;

-- 110: event_timeline_translations.service_role.UPDATE
grant UPDATE on table public.event_timeline_translations to service_role;

-- 110: event_timelines.anon.DELETE
grant DELETE on table public.event_timelines to anon;

-- 110: event_timelines.anon.INSERT
grant INSERT on table public.event_timelines to anon;

-- 110: event_timelines.anon.MAINTAIN
grant MAINTAIN on table public.event_timelines to anon;

-- 110: event_timelines.anon.REFERENCES
grant REFERENCES on table public.event_timelines to anon;

-- 110: event_timelines.anon.SELECT
grant SELECT on table public.event_timelines to anon;

-- 110: event_timelines.anon.TRIGGER
grant TRIGGER on table public.event_timelines to anon;

-- 110: event_timelines.anon.TRUNCATE
grant TRUNCATE on table public.event_timelines to anon;

-- 110: event_timelines.anon.UPDATE
grant UPDATE on table public.event_timelines to anon;

-- 110: event_timelines.authenticated.DELETE
grant DELETE on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.INSERT
grant INSERT on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.MAINTAIN
grant MAINTAIN on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.REFERENCES
grant REFERENCES on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.SELECT
grant SELECT on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.TRIGGER
grant TRIGGER on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.TRUNCATE
grant TRUNCATE on table public.event_timelines to authenticated;

-- 110: event_timelines.authenticated.UPDATE
grant UPDATE on table public.event_timelines to authenticated;

-- 110: event_timelines.service_role.DELETE
grant DELETE on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.INSERT
grant INSERT on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.MAINTAIN
grant MAINTAIN on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.REFERENCES
grant REFERENCES on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.SELECT
grant SELECT on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.TRIGGER
grant TRIGGER on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.TRUNCATE
grant TRUNCATE on table public.event_timelines to service_role;

-- 110: event_timelines.service_role.UPDATE
grant UPDATE on table public.event_timelines to service_role;

-- 110: event_type_categories.anon.DELETE
grant DELETE on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.INSERT
grant INSERT on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.MAINTAIN
grant MAINTAIN on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.REFERENCES
grant REFERENCES on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.SELECT
grant SELECT on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.TRIGGER
grant TRIGGER on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.TRUNCATE
grant TRUNCATE on table public.event_type_categories to anon;

-- 110: event_type_categories.anon.UPDATE
grant UPDATE on table public.event_type_categories to anon;

-- 110: event_type_categories.authenticated.DELETE
grant DELETE on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.INSERT
grant INSERT on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.MAINTAIN
grant MAINTAIN on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.REFERENCES
grant REFERENCES on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.SELECT
grant SELECT on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.TRIGGER
grant TRIGGER on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.TRUNCATE
grant TRUNCATE on table public.event_type_categories to authenticated;

-- 110: event_type_categories.authenticated.UPDATE
grant UPDATE on table public.event_type_categories to authenticated;

-- 110: event_type_categories.service_role.DELETE
grant DELETE on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.INSERT
grant INSERT on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.MAINTAIN
grant MAINTAIN on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.REFERENCES
grant REFERENCES on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.SELECT
grant SELECT on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.TRIGGER
grant TRIGGER on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.TRUNCATE
grant TRUNCATE on table public.event_type_categories to service_role;

-- 110: event_type_categories.service_role.UPDATE
grant UPDATE on table public.event_type_categories to service_role;

-- 110: event_type_subcategories.anon.DELETE
grant DELETE on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.INSERT
grant INSERT on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.MAINTAIN
grant MAINTAIN on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.REFERENCES
grant REFERENCES on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.SELECT
grant SELECT on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.TRIGGER
grant TRIGGER on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.TRUNCATE
grant TRUNCATE on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.anon.UPDATE
grant UPDATE on table public.event_type_subcategories to anon;

-- 110: event_type_subcategories.authenticated.DELETE
grant DELETE on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.INSERT
grant INSERT on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.MAINTAIN
grant MAINTAIN on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.REFERENCES
grant REFERENCES on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.SELECT
grant SELECT on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.TRIGGER
grant TRIGGER on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.TRUNCATE
grant TRUNCATE on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.authenticated.UPDATE
grant UPDATE on table public.event_type_subcategories to authenticated;

-- 110: event_type_subcategories.service_role.DELETE
grant DELETE on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.INSERT
grant INSERT on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.MAINTAIN
grant MAINTAIN on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.REFERENCES
grant REFERENCES on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.SELECT
grant SELECT on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.TRIGGER
grant TRIGGER on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.TRUNCATE
grant TRUNCATE on table public.event_type_subcategories to service_role;

-- 110: event_type_subcategories.service_role.UPDATE
grant UPDATE on table public.event_type_subcategories to service_role;

-- 110: event_type_translations.anon.DELETE
grant DELETE on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.INSERT
grant INSERT on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.MAINTAIN
grant MAINTAIN on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.REFERENCES
grant REFERENCES on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.SELECT
grant SELECT on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.TRIGGER
grant TRIGGER on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.TRUNCATE
grant TRUNCATE on table public.event_type_translations to anon;

-- 110: event_type_translations.anon.UPDATE
grant UPDATE on table public.event_type_translations to anon;

-- 110: event_type_translations.authenticated.DELETE
grant DELETE on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.INSERT
grant INSERT on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.MAINTAIN
grant MAINTAIN on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.REFERENCES
grant REFERENCES on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.SELECT
grant SELECT on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.TRIGGER
grant TRIGGER on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.TRUNCATE
grant TRUNCATE on table public.event_type_translations to authenticated;

-- 110: event_type_translations.authenticated.UPDATE
grant UPDATE on table public.event_type_translations to authenticated;

-- 110: event_type_translations.service_role.DELETE
grant DELETE on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.INSERT
grant INSERT on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.MAINTAIN
grant MAINTAIN on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.REFERENCES
grant REFERENCES on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.SELECT
grant SELECT on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.TRIGGER
grant TRIGGER on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.TRUNCATE
grant TRUNCATE on table public.event_type_translations to service_role;

-- 110: event_type_translations.service_role.UPDATE
grant UPDATE on table public.event_type_translations to service_role;

-- 110: event_type_variants.anon.DELETE
grant DELETE on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.INSERT
grant INSERT on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.MAINTAIN
grant MAINTAIN on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.REFERENCES
grant REFERENCES on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.SELECT
grant SELECT on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.TRIGGER
grant TRIGGER on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.TRUNCATE
grant TRUNCATE on table public.event_type_variants to anon;

-- 110: event_type_variants.anon.UPDATE
grant UPDATE on table public.event_type_variants to anon;

-- 110: event_type_variants.authenticated.DELETE
grant DELETE on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.INSERT
grant INSERT on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.MAINTAIN
grant MAINTAIN on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.REFERENCES
grant REFERENCES on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.SELECT
grant SELECT on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.TRIGGER
grant TRIGGER on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.TRUNCATE
grant TRUNCATE on table public.event_type_variants to authenticated;

-- 110: event_type_variants.authenticated.UPDATE
grant UPDATE on table public.event_type_variants to authenticated;

-- 110: event_type_variants.service_role.DELETE
grant DELETE on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.INSERT
grant INSERT on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.MAINTAIN
grant MAINTAIN on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.REFERENCES
grant REFERENCES on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.SELECT
grant SELECT on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.TRIGGER
grant TRIGGER on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.TRUNCATE
grant TRUNCATE on table public.event_type_variants to service_role;

-- 110: event_type_variants.service_role.UPDATE
grant UPDATE on table public.event_type_variants to service_role;

-- 110: event_types.anon.DELETE
grant DELETE on table public.event_types to anon;

-- 110: event_types.anon.INSERT
grant INSERT on table public.event_types to anon;

-- 110: event_types.anon.MAINTAIN
grant MAINTAIN on table public.event_types to anon;

-- 110: event_types.anon.REFERENCES
grant REFERENCES on table public.event_types to anon;

-- 110: event_types.anon.SELECT
grant SELECT on table public.event_types to anon;

-- 110: event_types.anon.TRIGGER
grant TRIGGER on table public.event_types to anon;

-- 110: event_types.anon.TRUNCATE
grant TRUNCATE on table public.event_types to anon;

-- 110: event_types.anon.UPDATE
grant UPDATE on table public.event_types to anon;

-- 110: event_types.authenticated.DELETE
grant DELETE on table public.event_types to authenticated;

-- 110: event_types.authenticated.INSERT
grant INSERT on table public.event_types to authenticated;

-- 110: event_types.authenticated.MAINTAIN
grant MAINTAIN on table public.event_types to authenticated;

-- 110: event_types.authenticated.REFERENCES
grant REFERENCES on table public.event_types to authenticated;

-- 110: event_types.authenticated.SELECT
grant SELECT on table public.event_types to authenticated;

-- 110: event_types.authenticated.TRIGGER
grant TRIGGER on table public.event_types to authenticated;

-- 110: event_types.authenticated.TRUNCATE
grant TRUNCATE on table public.event_types to authenticated;

-- 110: event_types.authenticated.UPDATE
grant UPDATE on table public.event_types to authenticated;

-- 110: event_types.service_role.DELETE
grant DELETE on table public.event_types to service_role;

-- 110: event_types.service_role.INSERT
grant INSERT on table public.event_types to service_role;

-- 110: event_types.service_role.MAINTAIN
grant MAINTAIN on table public.event_types to service_role;

-- 110: event_types.service_role.REFERENCES
grant REFERENCES on table public.event_types to service_role;

-- 110: event_types.service_role.SELECT
grant SELECT on table public.event_types to service_role;

-- 110: event_types.service_role.TRIGGER
grant TRIGGER on table public.event_types to service_role;

-- 110: event_types.service_role.TRUNCATE
grant TRUNCATE on table public.event_types to service_role;

-- 110: event_types.service_role.UPDATE
grant UPDATE on table public.event_types to service_role;

-- 110: events.anon.DELETE
grant DELETE on table public.events to anon;

-- 110: events.anon.INSERT
grant INSERT on table public.events to anon;

-- 110: events.anon.MAINTAIN
grant MAINTAIN on table public.events to anon;

-- 110: events.anon.REFERENCES
grant REFERENCES on table public.events to anon;

-- 110: events.anon.SELECT
grant SELECT on table public.events to anon;

-- 110: events.anon.TRIGGER
grant TRIGGER on table public.events to anon;

-- 110: events.anon.TRUNCATE
grant TRUNCATE on table public.events to anon;

-- 110: events.anon.UPDATE
grant UPDATE on table public.events to anon;

-- 110: events.authenticated.DELETE
grant DELETE on table public.events to authenticated;

-- 110: events.authenticated.INSERT
grant INSERT on table public.events to authenticated;

-- 110: events.authenticated.MAINTAIN
grant MAINTAIN on table public.events to authenticated;

-- 110: events.authenticated.REFERENCES
grant REFERENCES on table public.events to authenticated;

-- 110: events.authenticated.SELECT
grant SELECT on table public.events to authenticated;

-- 110: events.authenticated.TRIGGER
grant TRIGGER on table public.events to authenticated;

-- 110: events.authenticated.TRUNCATE
grant TRUNCATE on table public.events to authenticated;

-- 110: events.authenticated.UPDATE
grant UPDATE on table public.events to authenticated;

-- 110: events.service_role.DELETE
grant DELETE on table public.events to service_role;

-- 110: events.service_role.INSERT
grant INSERT on table public.events to service_role;

-- 110: events.service_role.MAINTAIN
grant MAINTAIN on table public.events to service_role;

-- 110: events.service_role.REFERENCES
grant REFERENCES on table public.events to service_role;

-- 110: events.service_role.SELECT
grant SELECT on table public.events to service_role;

-- 110: events.service_role.TRIGGER
grant TRIGGER on table public.events to service_role;

-- 110: events.service_role.TRUNCATE
grant TRUNCATE on table public.events to service_role;

-- 110: events.service_role.UPDATE
grant UPDATE on table public.events to service_role;

-- 110: expenses.anon.DELETE
grant DELETE on table public.expenses to anon;

-- 110: expenses.anon.INSERT
grant INSERT on table public.expenses to anon;

-- 110: expenses.anon.MAINTAIN
grant MAINTAIN on table public.expenses to anon;

-- 110: expenses.anon.REFERENCES
grant REFERENCES on table public.expenses to anon;

-- 110: expenses.anon.SELECT
grant SELECT on table public.expenses to anon;

-- 110: expenses.anon.TRIGGER
grant TRIGGER on table public.expenses to anon;

-- 110: expenses.anon.TRUNCATE
grant TRUNCATE on table public.expenses to anon;

-- 110: expenses.anon.UPDATE
grant UPDATE on table public.expenses to anon;

-- 110: expenses.authenticated.DELETE
grant DELETE on table public.expenses to authenticated;

-- 110: expenses.authenticated.INSERT
grant INSERT on table public.expenses to authenticated;

-- 110: expenses.authenticated.MAINTAIN
grant MAINTAIN on table public.expenses to authenticated;

-- 110: expenses.authenticated.REFERENCES
grant REFERENCES on table public.expenses to authenticated;

-- 110: expenses.authenticated.SELECT
grant SELECT on table public.expenses to authenticated;

-- 110: expenses.authenticated.TRIGGER
grant TRIGGER on table public.expenses to authenticated;

-- 110: expenses.authenticated.TRUNCATE
grant TRUNCATE on table public.expenses to authenticated;

-- 110: expenses.authenticated.UPDATE
grant UPDATE on table public.expenses to authenticated;

-- 110: expenses.service_role.DELETE
grant DELETE on table public.expenses to service_role;

-- 110: expenses.service_role.INSERT
grant INSERT on table public.expenses to service_role;

-- 110: expenses.service_role.MAINTAIN
grant MAINTAIN on table public.expenses to service_role;

-- 110: expenses.service_role.REFERENCES
grant REFERENCES on table public.expenses to service_role;

-- 110: expenses.service_role.SELECT
grant SELECT on table public.expenses to service_role;

-- 110: expenses.service_role.TRIGGER
grant TRIGGER on table public.expenses to service_role;

-- 110: expenses.service_role.TRUNCATE
grant TRUNCATE on table public.expenses to service_role;

-- 110: expenses.service_role.UPDATE
grant UPDATE on table public.expenses to service_role;

-- 110: family_groups.anon.DELETE
grant DELETE on table public.family_groups to anon;

-- 110: family_groups.anon.INSERT
grant INSERT on table public.family_groups to anon;

-- 110: family_groups.anon.MAINTAIN
grant MAINTAIN on table public.family_groups to anon;

-- 110: family_groups.anon.REFERENCES
grant REFERENCES on table public.family_groups to anon;

-- 110: family_groups.anon.SELECT
grant SELECT on table public.family_groups to anon;

-- 110: family_groups.anon.TRIGGER
grant TRIGGER on table public.family_groups to anon;

-- 110: family_groups.anon.TRUNCATE
grant TRUNCATE on table public.family_groups to anon;

-- 110: family_groups.anon.UPDATE
grant UPDATE on table public.family_groups to anon;

-- 110: family_groups.authenticated.DELETE
grant DELETE on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.INSERT
grant INSERT on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.MAINTAIN
grant MAINTAIN on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.REFERENCES
grant REFERENCES on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.SELECT
grant SELECT on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.TRIGGER
grant TRIGGER on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.TRUNCATE
grant TRUNCATE on table public.family_groups to authenticated;

-- 110: family_groups.authenticated.UPDATE
grant UPDATE on table public.family_groups to authenticated;

-- 110: family_groups.service_role.DELETE
grant DELETE on table public.family_groups to service_role;

-- 110: family_groups.service_role.INSERT
grant INSERT on table public.family_groups to service_role;

-- 110: family_groups.service_role.MAINTAIN
grant MAINTAIN on table public.family_groups to service_role;

-- 110: family_groups.service_role.REFERENCES
grant REFERENCES on table public.family_groups to service_role;

-- 110: family_groups.service_role.SELECT
grant SELECT on table public.family_groups to service_role;

-- 110: family_groups.service_role.TRIGGER
grant TRIGGER on table public.family_groups to service_role;

-- 110: family_groups.service_role.TRUNCATE
grant TRUNCATE on table public.family_groups to service_role;

-- 110: family_groups.service_role.UPDATE
grant UPDATE on table public.family_groups to service_role;

-- 110: geo_countries.anon.DELETE
grant DELETE on table public.geo_countries to anon;

-- 110: geo_countries.anon.INSERT
grant INSERT on table public.geo_countries to anon;

-- 110: geo_countries.anon.MAINTAIN
grant MAINTAIN on table public.geo_countries to anon;

-- 110: geo_countries.anon.REFERENCES
grant REFERENCES on table public.geo_countries to anon;

-- 110: geo_countries.anon.SELECT
grant SELECT on table public.geo_countries to anon;

-- 110: geo_countries.anon.TRIGGER
grant TRIGGER on table public.geo_countries to anon;

-- 110: geo_countries.anon.TRUNCATE
grant TRUNCATE on table public.geo_countries to anon;

-- 110: geo_countries.anon.UPDATE
grant UPDATE on table public.geo_countries to anon;

-- 110: geo_countries.authenticated.DELETE
grant DELETE on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.INSERT
grant INSERT on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.MAINTAIN
grant MAINTAIN on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.REFERENCES
grant REFERENCES on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.SELECT
grant SELECT on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.TRIGGER
grant TRIGGER on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.TRUNCATE
grant TRUNCATE on table public.geo_countries to authenticated;

-- 110: geo_countries.authenticated.UPDATE
grant UPDATE on table public.geo_countries to authenticated;

-- 110: geo_countries.service_role.DELETE
grant DELETE on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.INSERT
grant INSERT on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.MAINTAIN
grant MAINTAIN on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.REFERENCES
grant REFERENCES on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.SELECT
grant SELECT on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.TRIGGER
grant TRIGGER on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.TRUNCATE
grant TRUNCATE on table public.geo_countries to service_role;

-- 110: geo_countries.service_role.UPDATE
grant UPDATE on table public.geo_countries to service_role;

-- 110: guests.anon.DELETE
grant DELETE on table public.guests to anon;

-- 110: guests.anon.INSERT
grant INSERT on table public.guests to anon;

-- 110: guests.anon.MAINTAIN
grant MAINTAIN on table public.guests to anon;

-- 110: guests.anon.REFERENCES
grant REFERENCES on table public.guests to anon;

-- 110: guests.anon.SELECT
grant SELECT on table public.guests to anon;

-- 110: guests.anon.TRIGGER
grant TRIGGER on table public.guests to anon;

-- 110: guests.anon.TRUNCATE
grant TRUNCATE on table public.guests to anon;

-- 110: guests.anon.UPDATE
grant UPDATE on table public.guests to anon;

-- 110: guests.authenticated.DELETE
grant DELETE on table public.guests to authenticated;

-- 110: guests.authenticated.INSERT
grant INSERT on table public.guests to authenticated;

-- 110: guests.authenticated.MAINTAIN
grant MAINTAIN on table public.guests to authenticated;

-- 110: guests.authenticated.REFERENCES
grant REFERENCES on table public.guests to authenticated;

-- 110: guests.authenticated.SELECT
grant SELECT on table public.guests to authenticated;

-- 110: guests.authenticated.TRIGGER
grant TRIGGER on table public.guests to authenticated;

-- 110: guests.authenticated.TRUNCATE
grant TRUNCATE on table public.guests to authenticated;

-- 110: guests.authenticated.UPDATE
grant UPDATE on table public.guests to authenticated;

-- 110: guests.service_role.DELETE
grant DELETE on table public.guests to service_role;

-- 110: guests.service_role.INSERT
grant INSERT on table public.guests to service_role;

-- 110: guests.service_role.MAINTAIN
grant MAINTAIN on table public.guests to service_role;

-- 110: guests.service_role.REFERENCES
grant REFERENCES on table public.guests to service_role;

-- 110: guests.service_role.SELECT
grant SELECT on table public.guests to service_role;

-- 110: guests.service_role.TRIGGER
grant TRIGGER on table public.guests to service_role;

-- 110: guests.service_role.TRUNCATE
grant TRUNCATE on table public.guests to service_role;

-- 110: guests.service_role.UPDATE
grant UPDATE on table public.guests to service_role;

-- 110: high_rated_locations.anon.DELETE
grant DELETE on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.INSERT
grant INSERT on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.MAINTAIN
grant MAINTAIN on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.REFERENCES
grant REFERENCES on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.SELECT
grant SELECT on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.TRIGGER
grant TRIGGER on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.TRUNCATE
grant TRUNCATE on table public.high_rated_locations to anon;

-- 110: high_rated_locations.anon.UPDATE
grant UPDATE on table public.high_rated_locations to anon;

-- 110: high_rated_locations.authenticated.DELETE
grant DELETE on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.INSERT
grant INSERT on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.MAINTAIN
grant MAINTAIN on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.REFERENCES
grant REFERENCES on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.SELECT
grant SELECT on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.TRIGGER
grant TRIGGER on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.TRUNCATE
grant TRUNCATE on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.authenticated.UPDATE
grant UPDATE on table public.high_rated_locations to authenticated;

-- 110: high_rated_locations.service_role.DELETE
grant DELETE on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.INSERT
grant INSERT on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.MAINTAIN
grant MAINTAIN on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.REFERENCES
grant REFERENCES on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.SELECT
grant SELECT on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.TRIGGER
grant TRIGGER on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.TRUNCATE
grant TRUNCATE on table public.high_rated_locations to service_role;

-- 110: high_rated_locations.service_role.UPDATE
grant UPDATE on table public.high_rated_locations to service_role;

-- 110: i18n_locales.anon.DELETE
grant DELETE on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.INSERT
grant INSERT on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.MAINTAIN
grant MAINTAIN on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.REFERENCES
grant REFERENCES on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.SELECT
grant SELECT on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.TRIGGER
grant TRIGGER on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.TRUNCATE
grant TRUNCATE on table public.i18n_locales to anon;

-- 110: i18n_locales.anon.UPDATE
grant UPDATE on table public.i18n_locales to anon;

-- 110: i18n_locales.authenticated.DELETE
grant DELETE on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.INSERT
grant INSERT on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.MAINTAIN
grant MAINTAIN on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.REFERENCES
grant REFERENCES on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.SELECT
grant SELECT on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.TRIGGER
grant TRIGGER on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.TRUNCATE
grant TRUNCATE on table public.i18n_locales to authenticated;

-- 110: i18n_locales.authenticated.UPDATE
grant UPDATE on table public.i18n_locales to authenticated;

-- 110: i18n_locales.service_role.DELETE
grant DELETE on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.INSERT
grant INSERT on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.MAINTAIN
grant MAINTAIN on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.REFERENCES
grant REFERENCES on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.SELECT
grant SELECT on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.TRIGGER
grant TRIGGER on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.TRUNCATE
grant TRUNCATE on table public.i18n_locales to service_role;

-- 110: i18n_locales.service_role.UPDATE
grant UPDATE on table public.i18n_locales to service_role;

-- 110: incomes.anon.DELETE
grant DELETE on table public.incomes to anon;

-- 110: incomes.anon.INSERT
grant INSERT on table public.incomes to anon;

-- 110: incomes.anon.MAINTAIN
grant MAINTAIN on table public.incomes to anon;

-- 110: incomes.anon.REFERENCES
grant REFERENCES on table public.incomes to anon;

-- 110: incomes.anon.SELECT
grant SELECT on table public.incomes to anon;

-- 110: incomes.anon.TRIGGER
grant TRIGGER on table public.incomes to anon;

-- 110: incomes.anon.TRUNCATE
grant TRUNCATE on table public.incomes to anon;

-- 110: incomes.anon.UPDATE
grant UPDATE on table public.incomes to anon;

-- 110: incomes.authenticated.DELETE
grant DELETE on table public.incomes to authenticated;

-- 110: incomes.authenticated.INSERT
grant INSERT on table public.incomes to authenticated;

-- 110: incomes.authenticated.MAINTAIN
grant MAINTAIN on table public.incomes to authenticated;

-- 110: incomes.authenticated.REFERENCES
grant REFERENCES on table public.incomes to authenticated;

-- 110: incomes.authenticated.SELECT
grant SELECT on table public.incomes to authenticated;

-- 110: incomes.authenticated.TRIGGER
grant TRIGGER on table public.incomes to authenticated;

-- 110: incomes.authenticated.TRUNCATE
grant TRUNCATE on table public.incomes to authenticated;

-- 110: incomes.authenticated.UPDATE
grant UPDATE on table public.incomes to authenticated;

-- 110: incomes.service_role.DELETE
grant DELETE on table public.incomes to service_role;

-- 110: incomes.service_role.INSERT
grant INSERT on table public.incomes to service_role;

-- 110: incomes.service_role.MAINTAIN
grant MAINTAIN on table public.incomes to service_role;

-- 110: incomes.service_role.REFERENCES
grant REFERENCES on table public.incomes to service_role;

-- 110: incomes.service_role.SELECT
grant SELECT on table public.incomes to service_role;

-- 110: incomes.service_role.TRIGGER
grant TRIGGER on table public.incomes to service_role;

-- 110: incomes.service_role.TRUNCATE
grant TRUNCATE on table public.incomes to service_role;

-- 110: incomes.service_role.UPDATE
grant UPDATE on table public.incomes to service_role;

-- 110: location_stats_by_region.anon.DELETE
grant DELETE on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.INSERT
grant INSERT on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.MAINTAIN
grant MAINTAIN on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.REFERENCES
grant REFERENCES on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.SELECT
grant SELECT on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.TRIGGER
grant TRIGGER on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.TRUNCATE
grant TRUNCATE on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.anon.UPDATE
grant UPDATE on table public.location_stats_by_region to anon;

-- 110: location_stats_by_region.authenticated.DELETE
grant DELETE on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.INSERT
grant INSERT on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.MAINTAIN
grant MAINTAIN on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.REFERENCES
grant REFERENCES on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.SELECT
grant SELECT on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.TRIGGER
grant TRIGGER on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.TRUNCATE
grant TRUNCATE on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.authenticated.UPDATE
grant UPDATE on table public.location_stats_by_region to authenticated;

-- 110: location_stats_by_region.service_role.DELETE
grant DELETE on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.INSERT
grant INSERT on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.MAINTAIN
grant MAINTAIN on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.REFERENCES
grant REFERENCES on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.SELECT
grant SELECT on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.TRIGGER
grant TRIGGER on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.TRUNCATE
grant TRUNCATE on table public.location_stats_by_region to service_role;

-- 110: location_stats_by_region.service_role.UPDATE
grant UPDATE on table public.location_stats_by_region to service_role;

-- 110: locations.anon.DELETE
grant DELETE on table public.locations to anon;

-- 110: locations.anon.INSERT
grant INSERT on table public.locations to anon;

-- 110: locations.anon.MAINTAIN
grant MAINTAIN on table public.locations to anon;

-- 110: locations.anon.REFERENCES
grant REFERENCES on table public.locations to anon;

-- 110: locations.anon.SELECT
grant SELECT on table public.locations to anon;

-- 110: locations.anon.TRIGGER
grant TRIGGER on table public.locations to anon;

-- 110: locations.anon.TRUNCATE
grant TRUNCATE on table public.locations to anon;

-- 110: locations.anon.UPDATE
grant UPDATE on table public.locations to anon;

-- 110: locations.authenticated.DELETE
grant DELETE on table public.locations to authenticated;

-- 110: locations.authenticated.INSERT
grant INSERT on table public.locations to authenticated;

-- 110: locations.authenticated.MAINTAIN
grant MAINTAIN on table public.locations to authenticated;

-- 110: locations.authenticated.REFERENCES
grant REFERENCES on table public.locations to authenticated;

-- 110: locations.authenticated.SELECT
grant SELECT on table public.locations to authenticated;

-- 110: locations.authenticated.TRIGGER
grant TRIGGER on table public.locations to authenticated;

-- 110: locations.authenticated.TRUNCATE
grant TRUNCATE on table public.locations to authenticated;

-- 110: locations.authenticated.UPDATE
grant UPDATE on table public.locations to authenticated;

-- 110: locations.service_role.DELETE
grant DELETE on table public.locations to service_role;

-- 110: locations.service_role.INSERT
grant INSERT on table public.locations to service_role;

-- 110: locations.service_role.MAINTAIN
grant MAINTAIN on table public.locations to service_role;

-- 110: locations.service_role.REFERENCES
grant REFERENCES on table public.locations to service_role;

-- 110: locations.service_role.SELECT
grant SELECT on table public.locations to service_role;

-- 110: locations.service_role.TRIGGER
grant TRIGGER on table public.locations to service_role;

-- 110: locations.service_role.TRUNCATE
grant TRUNCATE on table public.locations to service_role;

-- 110: locations.service_role.UPDATE
grant UPDATE on table public.locations to service_role;

-- 110: musica_cerimonia.anon.DELETE
grant DELETE on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.INSERT
grant INSERT on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.MAINTAIN
grant MAINTAIN on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.REFERENCES
grant REFERENCES on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.SELECT
grant SELECT on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.TRIGGER
grant TRIGGER on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.TRUNCATE
grant TRUNCATE on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.anon.UPDATE
grant UPDATE on table public.musica_cerimonia to anon;

-- 110: musica_cerimonia.authenticated.DELETE
grant DELETE on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.INSERT
grant INSERT on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.MAINTAIN
grant MAINTAIN on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.REFERENCES
grant REFERENCES on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.SELECT
grant SELECT on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.TRIGGER
grant TRIGGER on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.TRUNCATE
grant TRUNCATE on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.authenticated.UPDATE
grant UPDATE on table public.musica_cerimonia to authenticated;

-- 110: musica_cerimonia.service_role.DELETE
grant DELETE on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.INSERT
grant INSERT on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.MAINTAIN
grant MAINTAIN on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.REFERENCES
grant REFERENCES on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.SELECT
grant SELECT on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.TRIGGER
grant TRIGGER on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.TRUNCATE
grant TRUNCATE on table public.musica_cerimonia to service_role;

-- 110: musica_cerimonia.service_role.UPDATE
grant UPDATE on table public.musica_cerimonia to service_role;

-- 110: musica_ricevimento.anon.DELETE
grant DELETE on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.INSERT
grant INSERT on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.MAINTAIN
grant MAINTAIN on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.REFERENCES
grant REFERENCES on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.SELECT
grant SELECT on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.TRIGGER
grant TRIGGER on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.TRUNCATE
grant TRUNCATE on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.anon.UPDATE
grant UPDATE on table public.musica_ricevimento to anon;

-- 110: musica_ricevimento.authenticated.DELETE
grant DELETE on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.INSERT
grant INSERT on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.MAINTAIN
grant MAINTAIN on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.REFERENCES
grant REFERENCES on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.SELECT
grant SELECT on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.TRIGGER
grant TRIGGER on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.TRUNCATE
grant TRUNCATE on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.authenticated.UPDATE
grant UPDATE on table public.musica_ricevimento to authenticated;

-- 110: musica_ricevimento.service_role.DELETE
grant DELETE on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.INSERT
grant INSERT on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.MAINTAIN
grant MAINTAIN on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.REFERENCES
grant REFERENCES on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.SELECT
grant SELECT on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.TRIGGER
grant TRIGGER on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.TRUNCATE
grant TRUNCATE on table public.musica_ricevimento to service_role;

-- 110: musica_ricevimento.service_role.UPDATE
grant UPDATE on table public.musica_ricevimento to service_role;

-- 110: non_invited_recipients.anon.DELETE
grant DELETE on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.INSERT
grant INSERT on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.MAINTAIN
grant MAINTAIN on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.REFERENCES
grant REFERENCES on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.SELECT
grant SELECT on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.TRIGGER
grant TRIGGER on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.TRUNCATE
grant TRUNCATE on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.anon.UPDATE
grant UPDATE on table public.non_invited_recipients to anon;

-- 110: non_invited_recipients.authenticated.DELETE
grant DELETE on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.INSERT
grant INSERT on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.MAINTAIN
grant MAINTAIN on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.REFERENCES
grant REFERENCES on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.SELECT
grant SELECT on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.TRIGGER
grant TRIGGER on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.TRUNCATE
grant TRUNCATE on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.authenticated.UPDATE
grant UPDATE on table public.non_invited_recipients to authenticated;

-- 110: non_invited_recipients.service_role.DELETE
grant DELETE on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.INSERT
grant INSERT on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.MAINTAIN
grant MAINTAIN on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.REFERENCES
grant REFERENCES on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.SELECT
grant SELECT on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.TRIGGER
grant TRIGGER on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.TRUNCATE
grant TRUNCATE on table public.non_invited_recipients to service_role;

-- 110: non_invited_recipients.service_role.UPDATE
grant UPDATE on table public.non_invited_recipients to service_role;

-- 110: payment_reminders.anon.DELETE
grant DELETE on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.INSERT
grant INSERT on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.MAINTAIN
grant MAINTAIN on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.REFERENCES
grant REFERENCES on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.SELECT
grant SELECT on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.TRIGGER
grant TRIGGER on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.TRUNCATE
grant TRUNCATE on table public.payment_reminders to anon;

-- 110: payment_reminders.anon.UPDATE
grant UPDATE on table public.payment_reminders to anon;

-- 110: payment_reminders.authenticated.DELETE
grant DELETE on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.INSERT
grant INSERT on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.MAINTAIN
grant MAINTAIN on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.REFERENCES
grant REFERENCES on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.SELECT
grant SELECT on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.TRIGGER
grant TRIGGER on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.TRUNCATE
grant TRUNCATE on table public.payment_reminders to authenticated;

-- 110: payment_reminders.authenticated.UPDATE
grant UPDATE on table public.payment_reminders to authenticated;

-- 110: payment_reminders.service_role.DELETE
grant DELETE on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.INSERT
grant INSERT on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.MAINTAIN
grant MAINTAIN on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.REFERENCES
grant REFERENCES on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.SELECT
grant SELECT on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.TRIGGER
grant TRIGGER on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.TRUNCATE
grant TRUNCATE on table public.payment_reminders to service_role;

-- 110: payment_reminders.service_role.UPDATE
grant UPDATE on table public.payment_reminders to service_role;

-- 110: places.anon.DELETE
grant DELETE on table public.places to anon;

-- 110: places.anon.INSERT
grant INSERT on table public.places to anon;

-- 110: places.anon.MAINTAIN
grant MAINTAIN on table public.places to anon;

-- 110: places.anon.REFERENCES
grant REFERENCES on table public.places to anon;

-- 110: places.anon.SELECT
grant SELECT on table public.places to anon;

-- 110: places.anon.TRIGGER
grant TRIGGER on table public.places to anon;

-- 110: places.anon.TRUNCATE
grant TRUNCATE on table public.places to anon;

-- 110: places.anon.UPDATE
grant UPDATE on table public.places to anon;

-- 110: places.authenticated.DELETE
grant DELETE on table public.places to authenticated;

-- 110: places.authenticated.INSERT
grant INSERT on table public.places to authenticated;

-- 110: places.authenticated.MAINTAIN
grant MAINTAIN on table public.places to authenticated;

-- 110: places.authenticated.REFERENCES
grant REFERENCES on table public.places to authenticated;

-- 110: places.authenticated.SELECT
grant SELECT on table public.places to authenticated;

-- 110: places.authenticated.TRIGGER
grant TRIGGER on table public.places to authenticated;

-- 110: places.authenticated.TRUNCATE
grant TRUNCATE on table public.places to authenticated;

-- 110: places.authenticated.UPDATE
grant UPDATE on table public.places to authenticated;

-- 110: places.service_role.DELETE
grant DELETE on table public.places to service_role;

-- 110: places.service_role.INSERT
grant INSERT on table public.places to service_role;

-- 110: places.service_role.MAINTAIN
grant MAINTAIN on table public.places to service_role;

-- 110: places.service_role.REFERENCES
grant REFERENCES on table public.places to service_role;

-- 110: places.service_role.SELECT
grant SELECT on table public.places to service_role;

-- 110: places.service_role.TRIGGER
grant TRIGGER on table public.places to service_role;

-- 110: places.service_role.TRUNCATE
grant TRUNCATE on table public.places to service_role;

-- 110: places.service_role.UPDATE
grant UPDATE on table public.places to service_role;

-- 110: profiles.anon.DELETE
grant DELETE on table public.profiles to anon;

-- 110: profiles.anon.INSERT
grant INSERT on table public.profiles to anon;

-- 110: profiles.anon.MAINTAIN
grant MAINTAIN on table public.profiles to anon;

-- 110: profiles.anon.REFERENCES
grant REFERENCES on table public.profiles to anon;

-- 110: profiles.anon.SELECT
grant SELECT on table public.profiles to anon;

-- 110: profiles.anon.TRIGGER
grant TRIGGER on table public.profiles to anon;

-- 110: profiles.anon.TRUNCATE
grant TRUNCATE on table public.profiles to anon;

-- 110: profiles.anon.UPDATE
grant UPDATE on table public.profiles to anon;

-- 110: profiles.authenticated.DELETE
grant DELETE on table public.profiles to authenticated;

-- 110: profiles.authenticated.INSERT
grant INSERT on table public.profiles to authenticated;

-- 110: profiles.authenticated.MAINTAIN
grant MAINTAIN on table public.profiles to authenticated;

-- 110: profiles.authenticated.REFERENCES
grant REFERENCES on table public.profiles to authenticated;

-- 110: profiles.authenticated.SELECT
grant SELECT on table public.profiles to authenticated;

-- 110: profiles.authenticated.TRIGGER
grant TRIGGER on table public.profiles to authenticated;

-- 110: profiles.authenticated.TRUNCATE
grant TRUNCATE on table public.profiles to authenticated;

-- 110: profiles.authenticated.UPDATE
grant UPDATE on table public.profiles to authenticated;

-- 110: profiles.service_role.DELETE
grant DELETE on table public.profiles to service_role;

-- 110: profiles.service_role.INSERT
grant INSERT on table public.profiles to service_role;

-- 110: profiles.service_role.MAINTAIN
grant MAINTAIN on table public.profiles to service_role;

-- 110: profiles.service_role.REFERENCES
grant REFERENCES on table public.profiles to service_role;

-- 110: profiles.service_role.SELECT
grant SELECT on table public.profiles to service_role;

-- 110: profiles.service_role.TRIGGER
grant TRIGGER on table public.profiles to service_role;

-- 110: profiles.service_role.TRUNCATE
grant TRUNCATE on table public.profiles to service_role;

-- 110: profiles.service_role.UPDATE
grant UPDATE on table public.profiles to service_role;

-- 110: subcategories.anon.DELETE
grant DELETE on table public.subcategories to anon;

-- 110: subcategories.anon.INSERT
grant INSERT on table public.subcategories to anon;

-- 110: subcategories.anon.MAINTAIN
grant MAINTAIN on table public.subcategories to anon;

-- 110: subcategories.anon.REFERENCES
grant REFERENCES on table public.subcategories to anon;

-- 110: subcategories.anon.SELECT
grant SELECT on table public.subcategories to anon;

-- 110: subcategories.anon.TRIGGER
grant TRIGGER on table public.subcategories to anon;

-- 110: subcategories.anon.TRUNCATE
grant TRUNCATE on table public.subcategories to anon;

-- 110: subcategories.anon.UPDATE
grant UPDATE on table public.subcategories to anon;

-- 110: subcategories.authenticated.DELETE
grant DELETE on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.INSERT
grant INSERT on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.MAINTAIN
grant MAINTAIN on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.REFERENCES
grant REFERENCES on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.SELECT
grant SELECT on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.TRIGGER
grant TRIGGER on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.TRUNCATE
grant TRUNCATE on table public.subcategories to authenticated;

-- 110: subcategories.authenticated.UPDATE
grant UPDATE on table public.subcategories to authenticated;

-- 110: subcategories.service_role.DELETE
grant DELETE on table public.subcategories to service_role;

-- 110: subcategories.service_role.INSERT
grant INSERT on table public.subcategories to service_role;

-- 110: subcategories.service_role.MAINTAIN
grant MAINTAIN on table public.subcategories to service_role;

-- 110: subcategories.service_role.REFERENCES
grant REFERENCES on table public.subcategories to service_role;

-- 110: subcategories.service_role.SELECT
grant SELECT on table public.subcategories to service_role;

-- 110: subcategories.service_role.TRIGGER
grant TRIGGER on table public.subcategories to service_role;

-- 110: subcategories.service_role.TRUNCATE
grant TRUNCATE on table public.subcategories to service_role;

-- 110: subcategories.service_role.UPDATE
grant UPDATE on table public.subcategories to service_role;

-- 110: subcategory_translations.anon.DELETE
grant DELETE on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.INSERT
grant INSERT on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.MAINTAIN
grant MAINTAIN on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.REFERENCES
grant REFERENCES on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.SELECT
grant SELECT on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.TRIGGER
grant TRIGGER on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.TRUNCATE
grant TRUNCATE on table public.subcategory_translations to anon;

-- 110: subcategory_translations.anon.UPDATE
grant UPDATE on table public.subcategory_translations to anon;

-- 110: subcategory_translations.authenticated.DELETE
grant DELETE on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.INSERT
grant INSERT on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.MAINTAIN
grant MAINTAIN on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.REFERENCES
grant REFERENCES on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.SELECT
grant SELECT on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.TRIGGER
grant TRIGGER on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.TRUNCATE
grant TRUNCATE on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.authenticated.UPDATE
grant UPDATE on table public.subcategory_translations to authenticated;

-- 110: subcategory_translations.service_role.DELETE
grant DELETE on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.INSERT
grant INSERT on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.MAINTAIN
grant MAINTAIN on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.REFERENCES
grant REFERENCES on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.SELECT
grant SELECT on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.TRIGGER
grant TRIGGER on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.TRUNCATE
grant TRUNCATE on table public.subcategory_translations to service_role;

-- 110: subcategory_translations.service_role.UPDATE
grant UPDATE on table public.subcategory_translations to service_role;

-- 110: subscription_packages.anon.DELETE
grant DELETE on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.INSERT
grant INSERT on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.MAINTAIN
grant MAINTAIN on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.REFERENCES
grant REFERENCES on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.SELECT
grant SELECT on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.TRIGGER
grant TRIGGER on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.TRUNCATE
grant TRUNCATE on table public.subscription_packages to anon;

-- 110: subscription_packages.anon.UPDATE
grant UPDATE on table public.subscription_packages to anon;

-- 110: subscription_packages.authenticated.DELETE
grant DELETE on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.INSERT
grant INSERT on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.MAINTAIN
grant MAINTAIN on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.REFERENCES
grant REFERENCES on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.SELECT
grant SELECT on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.TRIGGER
grant TRIGGER on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.TRUNCATE
grant TRUNCATE on table public.subscription_packages to authenticated;

-- 110: subscription_packages.authenticated.UPDATE
grant UPDATE on table public.subscription_packages to authenticated;

-- 110: subscription_packages.service_role.DELETE
grant DELETE on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.INSERT
grant INSERT on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.MAINTAIN
grant MAINTAIN on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.REFERENCES
grant REFERENCES on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.SELECT
grant SELECT on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.TRIGGER
grant TRIGGER on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.TRUNCATE
grant TRUNCATE on table public.subscription_packages to service_role;

-- 110: subscription_packages.service_role.UPDATE
grant UPDATE on table public.subscription_packages to service_role;

-- 110: subscription_transactions.anon.DELETE
grant DELETE on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.INSERT
grant INSERT on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.MAINTAIN
grant MAINTAIN on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.REFERENCES
grant REFERENCES on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.SELECT
grant SELECT on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.TRIGGER
grant TRIGGER on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.TRUNCATE
grant TRUNCATE on table public.subscription_transactions to anon;

-- 110: subscription_transactions.anon.UPDATE
grant UPDATE on table public.subscription_transactions to anon;

-- 110: subscription_transactions.authenticated.DELETE
grant DELETE on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.INSERT
grant INSERT on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.MAINTAIN
grant MAINTAIN on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.REFERENCES
grant REFERENCES on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.SELECT
grant SELECT on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.TRIGGER
grant TRIGGER on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.TRUNCATE
grant TRUNCATE on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.authenticated.UPDATE
grant UPDATE on table public.subscription_transactions to authenticated;

-- 110: subscription_transactions.service_role.DELETE
grant DELETE on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.INSERT
grant INSERT on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.MAINTAIN
grant MAINTAIN on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.REFERENCES
grant REFERENCES on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.SELECT
grant SELECT on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.TRIGGER
grant TRIGGER on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.TRUNCATE
grant TRUNCATE on table public.subscription_transactions to service_role;

-- 110: subscription_transactions.service_role.UPDATE
grant UPDATE on table public.subscription_transactions to service_role;

-- 110: suppliers.anon.DELETE
grant DELETE on table public.suppliers to anon;

-- 110: suppliers.anon.INSERT
grant INSERT on table public.suppliers to anon;

-- 110: suppliers.anon.MAINTAIN
grant MAINTAIN on table public.suppliers to anon;

-- 110: suppliers.anon.REFERENCES
grant REFERENCES on table public.suppliers to anon;

-- 110: suppliers.anon.SELECT
grant SELECT on table public.suppliers to anon;

-- 110: suppliers.anon.TRIGGER
grant TRIGGER on table public.suppliers to anon;

-- 110: suppliers.anon.TRUNCATE
grant TRUNCATE on table public.suppliers to anon;

-- 110: suppliers.anon.UPDATE
grant UPDATE on table public.suppliers to anon;

-- 110: suppliers.authenticated.DELETE
grant DELETE on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.INSERT
grant INSERT on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.MAINTAIN
grant MAINTAIN on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.REFERENCES
grant REFERENCES on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.SELECT
grant SELECT on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.TRIGGER
grant TRIGGER on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.TRUNCATE
grant TRUNCATE on table public.suppliers to authenticated;

-- 110: suppliers.authenticated.UPDATE
grant UPDATE on table public.suppliers to authenticated;

-- 110: suppliers.service_role.DELETE
grant DELETE on table public.suppliers to service_role;

-- 110: suppliers.service_role.INSERT
grant INSERT on table public.suppliers to service_role;

-- 110: suppliers.service_role.MAINTAIN
grant MAINTAIN on table public.suppliers to service_role;

-- 110: suppliers.service_role.REFERENCES
grant REFERENCES on table public.suppliers to service_role;

-- 110: suppliers.service_role.SELECT
grant SELECT on table public.suppliers to service_role;

-- 110: suppliers.service_role.TRIGGER
grant TRIGGER on table public.suppliers to service_role;

-- 110: suppliers.service_role.TRUNCATE
grant TRUNCATE on table public.suppliers to service_role;

-- 110: suppliers.service_role.UPDATE
grant UPDATE on table public.suppliers to service_role;

-- 110: sync_jobs.anon.DELETE
grant DELETE on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.INSERT
grant INSERT on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.MAINTAIN
grant MAINTAIN on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.REFERENCES
grant REFERENCES on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.SELECT
grant SELECT on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.TRIGGER
grant TRIGGER on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.TRUNCATE
grant TRUNCATE on table public.sync_jobs to anon;

-- 110: sync_jobs.anon.UPDATE
grant UPDATE on table public.sync_jobs to anon;

-- 110: sync_jobs.authenticated.DELETE
grant DELETE on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.INSERT
grant INSERT on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.MAINTAIN
grant MAINTAIN on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.REFERENCES
grant REFERENCES on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.SELECT
grant SELECT on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.TRIGGER
grant TRIGGER on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.TRUNCATE
grant TRUNCATE on table public.sync_jobs to authenticated;

-- 110: sync_jobs.authenticated.UPDATE
grant UPDATE on table public.sync_jobs to authenticated;

-- 110: sync_jobs.service_role.DELETE
grant DELETE on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.INSERT
grant INSERT on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.MAINTAIN
grant MAINTAIN on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.REFERENCES
grant REFERENCES on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.SELECT
grant SELECT on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.TRIGGER
grant TRIGGER on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.TRUNCATE
grant TRUNCATE on table public.sync_jobs to service_role;

-- 110: sync_jobs.service_role.UPDATE
grant UPDATE on table public.sync_jobs to service_role;

-- 110: sync_stats.anon.DELETE
grant DELETE on table public.sync_stats to anon;

-- 110: sync_stats.anon.INSERT
grant INSERT on table public.sync_stats to anon;

-- 110: sync_stats.anon.MAINTAIN
grant MAINTAIN on table public.sync_stats to anon;

-- 110: sync_stats.anon.REFERENCES
grant REFERENCES on table public.sync_stats to anon;

-- 110: sync_stats.anon.SELECT
grant SELECT on table public.sync_stats to anon;

-- 110: sync_stats.anon.TRIGGER
grant TRIGGER on table public.sync_stats to anon;

-- 110: sync_stats.anon.TRUNCATE
grant TRUNCATE on table public.sync_stats to anon;

-- 110: sync_stats.anon.UPDATE
grant UPDATE on table public.sync_stats to anon;

-- 110: sync_stats.authenticated.DELETE
grant DELETE on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.INSERT
grant INSERT on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.MAINTAIN
grant MAINTAIN on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.REFERENCES
grant REFERENCES on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.SELECT
grant SELECT on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.TRIGGER
grant TRIGGER on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.TRUNCATE
grant TRUNCATE on table public.sync_stats to authenticated;

-- 110: sync_stats.authenticated.UPDATE
grant UPDATE on table public.sync_stats to authenticated;

-- 110: sync_stats.service_role.DELETE
grant DELETE on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.INSERT
grant INSERT on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.MAINTAIN
grant MAINTAIN on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.REFERENCES
grant REFERENCES on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.SELECT
grant SELECT on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.TRIGGER
grant TRIGGER on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.TRUNCATE
grant TRUNCATE on table public.sync_stats to service_role;

-- 110: sync_stats.service_role.UPDATE
grant UPDATE on table public.sync_stats to service_role;

-- 110: table_assignments.anon.DELETE
grant DELETE on table public.table_assignments to anon;

-- 110: table_assignments.anon.INSERT
grant INSERT on table public.table_assignments to anon;

-- 110: table_assignments.anon.MAINTAIN
grant MAINTAIN on table public.table_assignments to anon;

-- 110: table_assignments.anon.REFERENCES
grant REFERENCES on table public.table_assignments to anon;

-- 110: table_assignments.anon.SELECT
grant SELECT on table public.table_assignments to anon;

-- 110: table_assignments.anon.TRIGGER
grant TRIGGER on table public.table_assignments to anon;

-- 110: table_assignments.anon.TRUNCATE
grant TRUNCATE on table public.table_assignments to anon;

-- 110: table_assignments.anon.UPDATE
grant UPDATE on table public.table_assignments to anon;

-- 110: table_assignments.authenticated.DELETE
grant DELETE on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.INSERT
grant INSERT on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.MAINTAIN
grant MAINTAIN on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.REFERENCES
grant REFERENCES on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.SELECT
grant SELECT on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.TRIGGER
grant TRIGGER on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.TRUNCATE
grant TRUNCATE on table public.table_assignments to authenticated;

-- 110: table_assignments.authenticated.UPDATE
grant UPDATE on table public.table_assignments to authenticated;

-- 110: table_assignments.service_role.DELETE
grant DELETE on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.INSERT
grant INSERT on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.MAINTAIN
grant MAINTAIN on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.REFERENCES
grant REFERENCES on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.SELECT
grant SELECT on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.TRIGGER
grant TRIGGER on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.TRUNCATE
grant TRUNCATE on table public.table_assignments to service_role;

-- 110: table_assignments.service_role.UPDATE
grant UPDATE on table public.table_assignments to service_role;

-- 110: tables.anon.DELETE
grant DELETE on table public.tables to anon;

-- 110: tables.anon.INSERT
grant INSERT on table public.tables to anon;

-- 110: tables.anon.MAINTAIN
grant MAINTAIN on table public.tables to anon;

-- 110: tables.anon.REFERENCES
grant REFERENCES on table public.tables to anon;

-- 110: tables.anon.SELECT
grant SELECT on table public.tables to anon;

-- 110: tables.anon.TRIGGER
grant TRIGGER on table public.tables to anon;

-- 110: tables.anon.TRUNCATE
grant TRUNCATE on table public.tables to anon;

-- 110: tables.anon.UPDATE
grant UPDATE on table public.tables to anon;

-- 110: tables.authenticated.DELETE
grant DELETE on table public.tables to authenticated;

-- 110: tables.authenticated.INSERT
grant INSERT on table public.tables to authenticated;

-- 110: tables.authenticated.MAINTAIN
grant MAINTAIN on table public.tables to authenticated;

-- 110: tables.authenticated.REFERENCES
grant REFERENCES on table public.tables to authenticated;

-- 110: tables.authenticated.SELECT
grant SELECT on table public.tables to authenticated;

-- 110: tables.authenticated.TRIGGER
grant TRIGGER on table public.tables to authenticated;

-- 110: tables.authenticated.TRUNCATE
grant TRUNCATE on table public.tables to authenticated;

-- 110: tables.authenticated.UPDATE
grant UPDATE on table public.tables to authenticated;

-- 110: tables.service_role.DELETE
grant DELETE on table public.tables to service_role;

-- 110: tables.service_role.INSERT
grant INSERT on table public.tables to service_role;

-- 110: tables.service_role.MAINTAIN
grant MAINTAIN on table public.tables to service_role;

-- 110: tables.service_role.REFERENCES
grant REFERENCES on table public.tables to service_role;

-- 110: tables.service_role.SELECT
grant SELECT on table public.tables to service_role;

-- 110: tables.service_role.TRIGGER
grant TRIGGER on table public.tables to service_role;

-- 110: tables.service_role.TRUNCATE
grant TRUNCATE on table public.tables to service_role;

-- 110: tables.service_role.UPDATE
grant UPDATE on table public.tables to service_role;

-- 110: timeline_items.anon.DELETE
grant DELETE on table public.timeline_items to anon;

-- 110: timeline_items.anon.INSERT
grant INSERT on table public.timeline_items to anon;

-- 110: timeline_items.anon.MAINTAIN
grant MAINTAIN on table public.timeline_items to anon;

-- 110: timeline_items.anon.REFERENCES
grant REFERENCES on table public.timeline_items to anon;

-- 110: timeline_items.anon.SELECT
grant SELECT on table public.timeline_items to anon;

-- 110: timeline_items.anon.TRIGGER
grant TRIGGER on table public.timeline_items to anon;

-- 110: timeline_items.anon.TRUNCATE
grant TRUNCATE on table public.timeline_items to anon;

-- 110: timeline_items.anon.UPDATE
grant UPDATE on table public.timeline_items to anon;

-- 110: timeline_items.authenticated.DELETE
grant DELETE on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.INSERT
grant INSERT on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.MAINTAIN
grant MAINTAIN on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.REFERENCES
grant REFERENCES on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.SELECT
grant SELECT on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.TRIGGER
grant TRIGGER on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.TRUNCATE
grant TRUNCATE on table public.timeline_items to authenticated;

-- 110: timeline_items.authenticated.UPDATE
grant UPDATE on table public.timeline_items to authenticated;

-- 110: timeline_items.service_role.DELETE
grant DELETE on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.INSERT
grant INSERT on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.MAINTAIN
grant MAINTAIN on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.REFERENCES
grant REFERENCES on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.SELECT
grant SELECT on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.TRIGGER
grant TRIGGER on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.TRUNCATE
grant TRUNCATE on table public.timeline_items to service_role;

-- 110: timeline_items.service_role.UPDATE
grant UPDATE on table public.timeline_items to service_role;

-- 110: top_vendors_by_region.anon.DELETE
grant DELETE on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.INSERT
grant INSERT on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.MAINTAIN
grant MAINTAIN on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.REFERENCES
grant REFERENCES on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.SELECT
grant SELECT on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.TRIGGER
grant TRIGGER on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.TRUNCATE
grant TRUNCATE on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.anon.UPDATE
grant UPDATE on table public.top_vendors_by_region to anon;

-- 110: top_vendors_by_region.authenticated.DELETE
grant DELETE on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.INSERT
grant INSERT on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.MAINTAIN
grant MAINTAIN on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.REFERENCES
grant REFERENCES on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.SELECT
grant SELECT on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.TRIGGER
grant TRIGGER on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.TRUNCATE
grant TRUNCATE on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.authenticated.UPDATE
grant UPDATE on table public.top_vendors_by_region to authenticated;

-- 110: top_vendors_by_region.service_role.DELETE
grant DELETE on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.INSERT
grant INSERT on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.MAINTAIN
grant MAINTAIN on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.REFERENCES
grant REFERENCES on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.SELECT
grant SELECT on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.TRIGGER
grant TRIGGER on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.TRUNCATE
grant TRUNCATE on table public.top_vendors_by_region to service_role;

-- 110: top_vendors_by_region.service_role.UPDATE
grant UPDATE on table public.top_vendors_by_region to service_role;

-- 110: traditions.anon.DELETE
grant DELETE on table public.traditions to anon;

-- 110: traditions.anon.INSERT
grant INSERT on table public.traditions to anon;

-- 110: traditions.anon.MAINTAIN
grant MAINTAIN on table public.traditions to anon;

-- 110: traditions.anon.REFERENCES
grant REFERENCES on table public.traditions to anon;

-- 110: traditions.anon.SELECT
grant SELECT on table public.traditions to anon;

-- 110: traditions.anon.TRIGGER
grant TRIGGER on table public.traditions to anon;

-- 110: traditions.anon.TRUNCATE
grant TRUNCATE on table public.traditions to anon;

-- 110: traditions.anon.UPDATE
grant UPDATE on table public.traditions to anon;

-- 110: traditions.authenticated.DELETE
grant DELETE on table public.traditions to authenticated;

-- 110: traditions.authenticated.INSERT
grant INSERT on table public.traditions to authenticated;

-- 110: traditions.authenticated.MAINTAIN
grant MAINTAIN on table public.traditions to authenticated;

-- 110: traditions.authenticated.REFERENCES
grant REFERENCES on table public.traditions to authenticated;

-- 110: traditions.authenticated.SELECT
grant SELECT on table public.traditions to authenticated;

-- 110: traditions.authenticated.TRIGGER
grant TRIGGER on table public.traditions to authenticated;

-- 110: traditions.authenticated.TRUNCATE
grant TRUNCATE on table public.traditions to authenticated;

-- 110: traditions.authenticated.UPDATE
grant UPDATE on table public.traditions to authenticated;

-- 110: traditions.service_role.DELETE
grant DELETE on table public.traditions to service_role;

-- 110: traditions.service_role.INSERT
grant INSERT on table public.traditions to service_role;

-- 110: traditions.service_role.MAINTAIN
grant MAINTAIN on table public.traditions to service_role;

-- 110: traditions.service_role.REFERENCES
grant REFERENCES on table public.traditions to service_role;

-- 110: traditions.service_role.SELECT
grant SELECT on table public.traditions to service_role;

-- 110: traditions.service_role.TRIGGER
grant TRIGGER on table public.traditions to service_role;

-- 110: traditions.service_role.TRUNCATE
grant TRUNCATE on table public.traditions to service_role;

-- 110: traditions.service_role.UPDATE
grant UPDATE on table public.traditions to service_role;

-- 110: traditions_id_seq.anon.SELECT
grant SELECT on sequence public.traditions_id_seq to anon;

-- 110: traditions_id_seq.anon.UPDATE
grant UPDATE on sequence public.traditions_id_seq to anon;

-- 110: traditions_id_seq.anon.USAGE
grant USAGE on sequence public.traditions_id_seq to anon;

-- 110: traditions_id_seq.authenticated.SELECT
grant SELECT on sequence public.traditions_id_seq to authenticated;

-- 110: traditions_id_seq.authenticated.UPDATE
grant UPDATE on sequence public.traditions_id_seq to authenticated;

-- 110: traditions_id_seq.authenticated.USAGE
grant USAGE on sequence public.traditions_id_seq to authenticated;

-- 110: traditions_id_seq.service_role.SELECT
grant SELECT on sequence public.traditions_id_seq to service_role;

-- 110: traditions_id_seq.service_role.UPDATE
grant UPDATE on sequence public.traditions_id_seq to service_role;

-- 110: traditions_id_seq.service_role.USAGE
grant USAGE on sequence public.traditions_id_seq to service_role;

-- 110: user_event_timeline.anon.DELETE
grant DELETE on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.INSERT
grant INSERT on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.MAINTAIN
grant MAINTAIN on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.REFERENCES
grant REFERENCES on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.SELECT
grant SELECT on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.TRIGGER
grant TRIGGER on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.TRUNCATE
grant TRUNCATE on table public.user_event_timeline to anon;

-- 110: user_event_timeline.anon.UPDATE
grant UPDATE on table public.user_event_timeline to anon;

-- 110: user_event_timeline.authenticated.DELETE
grant DELETE on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.INSERT
grant INSERT on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.MAINTAIN
grant MAINTAIN on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.REFERENCES
grant REFERENCES on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.SELECT
grant SELECT on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.TRIGGER
grant TRIGGER on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.TRUNCATE
grant TRUNCATE on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.authenticated.UPDATE
grant UPDATE on table public.user_event_timeline to authenticated;

-- 110: user_event_timeline.service_role.DELETE
grant DELETE on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.INSERT
grant INSERT on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.MAINTAIN
grant MAINTAIN on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.REFERENCES
grant REFERENCES on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.SELECT
grant SELECT on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.TRIGGER
grant TRIGGER on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.TRUNCATE
grant TRUNCATE on table public.user_event_timeline to service_role;

-- 110: user_event_timeline.service_role.UPDATE
grant UPDATE on table public.user_event_timeline to service_role;

-- 110: vendor_places.anon.DELETE
grant DELETE on table public.vendor_places to anon;

-- 110: vendor_places.anon.INSERT
grant INSERT on table public.vendor_places to anon;

-- 110: vendor_places.anon.MAINTAIN
grant MAINTAIN on table public.vendor_places to anon;

-- 110: vendor_places.anon.REFERENCES
grant REFERENCES on table public.vendor_places to anon;

-- 110: vendor_places.anon.SELECT
grant SELECT on table public.vendor_places to anon;

-- 110: vendor_places.anon.TRIGGER
grant TRIGGER on table public.vendor_places to anon;

-- 110: vendor_places.anon.TRUNCATE
grant TRUNCATE on table public.vendor_places to anon;

-- 110: vendor_places.anon.UPDATE
grant UPDATE on table public.vendor_places to anon;

-- 110: vendor_places.authenticated.DELETE
grant DELETE on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.INSERT
grant INSERT on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.MAINTAIN
grant MAINTAIN on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.REFERENCES
grant REFERENCES on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.SELECT
grant SELECT on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.TRIGGER
grant TRIGGER on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.TRUNCATE
grant TRUNCATE on table public.vendor_places to authenticated;

-- 110: vendor_places.authenticated.UPDATE
grant UPDATE on table public.vendor_places to authenticated;

-- 110: vendor_places.service_role.DELETE
grant DELETE on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.INSERT
grant INSERT on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.MAINTAIN
grant MAINTAIN on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.REFERENCES
grant REFERENCES on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.SELECT
grant SELECT on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.TRIGGER
grant TRIGGER on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.TRUNCATE
grant TRUNCATE on table public.vendor_places to service_role;

-- 110: vendor_places.service_role.UPDATE
grant UPDATE on table public.vendor_places to service_role;

-- 110: vendors.anon.DELETE
grant DELETE on table public.vendors to anon;

-- 110: vendors.anon.INSERT
grant INSERT on table public.vendors to anon;

-- 110: vendors.anon.MAINTAIN
grant MAINTAIN on table public.vendors to anon;

-- 110: vendors.anon.REFERENCES
grant REFERENCES on table public.vendors to anon;

-- 110: vendors.anon.SELECT
grant SELECT on table public.vendors to anon;

-- 110: vendors.anon.TRIGGER
grant TRIGGER on table public.vendors to anon;

-- 110: vendors.anon.TRUNCATE
grant TRUNCATE on table public.vendors to anon;

-- 110: vendors.anon.UPDATE
grant UPDATE on table public.vendors to anon;

-- 110: vendors.authenticated.DELETE
grant DELETE on table public.vendors to authenticated;

-- 110: vendors.authenticated.INSERT
grant INSERT on table public.vendors to authenticated;

-- 110: vendors.authenticated.MAINTAIN
grant MAINTAIN on table public.vendors to authenticated;

-- 110: vendors.authenticated.REFERENCES
grant REFERENCES on table public.vendors to authenticated;

-- 110: vendors.authenticated.SELECT
grant SELECT on table public.vendors to authenticated;

-- 110: vendors.authenticated.TRIGGER
grant TRIGGER on table public.vendors to authenticated;

-- 110: vendors.authenticated.TRUNCATE
grant TRUNCATE on table public.vendors to authenticated;

-- 110: vendors.authenticated.UPDATE
grant UPDATE on table public.vendors to authenticated;

-- 110: vendors.service_role.DELETE
grant DELETE on table public.vendors to service_role;

-- 110: vendors.service_role.INSERT
grant INSERT on table public.vendors to service_role;

-- 110: vendors.service_role.MAINTAIN
grant MAINTAIN on table public.vendors to service_role;

-- 110: vendors.service_role.REFERENCES
grant REFERENCES on table public.vendors to service_role;

-- 110: vendors.service_role.SELECT
grant SELECT on table public.vendors to service_role;

-- 110: vendors.service_role.TRIGGER
grant TRIGGER on table public.vendors to service_role;

-- 110: vendors.service_role.TRUNCATE
grant TRUNCATE on table public.vendors to service_role;

-- 110: vendors.service_role.UPDATE
grant UPDATE on table public.vendors to service_role;

-- 110: vendors_with_places.anon.DELETE
grant DELETE on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.INSERT
grant INSERT on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.MAINTAIN
grant MAINTAIN on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.REFERENCES
grant REFERENCES on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.SELECT
grant SELECT on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.TRIGGER
grant TRIGGER on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.TRUNCATE
grant TRUNCATE on table public.vendors_with_places to anon;

-- 110: vendors_with_places.anon.UPDATE
grant UPDATE on table public.vendors_with_places to anon;

-- 110: vendors_with_places.authenticated.DELETE
grant DELETE on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.INSERT
grant INSERT on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.MAINTAIN
grant MAINTAIN on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.REFERENCES
grant REFERENCES on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.SELECT
grant SELECT on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.TRIGGER
grant TRIGGER on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.TRUNCATE
grant TRUNCATE on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.authenticated.UPDATE
grant UPDATE on table public.vendors_with_places to authenticated;

-- 110: vendors_with_places.service_role.DELETE
grant DELETE on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.INSERT
grant INSERT on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.MAINTAIN
grant MAINTAIN on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.REFERENCES
grant REFERENCES on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.SELECT
grant SELECT on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.TRIGGER
grant TRIGGER on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.TRUNCATE
grant TRUNCATE on table public.vendors_with_places to service_role;

-- 110: vendors_with_places.service_role.UPDATE
grant UPDATE on table public.vendors_with_places to service_role;

-- 110: wedding_cards.anon.DELETE
grant DELETE on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.INSERT
grant INSERT on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.MAINTAIN
grant MAINTAIN on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.REFERENCES
grant REFERENCES on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.SELECT
grant SELECT on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.TRIGGER
grant TRIGGER on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.TRUNCATE
grant TRUNCATE on table public.wedding_cards to anon;

-- 110: wedding_cards.anon.UPDATE
grant UPDATE on table public.wedding_cards to anon;

-- 110: wedding_cards.authenticated.DELETE
grant DELETE on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.INSERT
grant INSERT on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.MAINTAIN
grant MAINTAIN on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.REFERENCES
grant REFERENCES on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.SELECT
grant SELECT on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.TRIGGER
grant TRIGGER on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.TRUNCATE
grant TRUNCATE on table public.wedding_cards to authenticated;

-- 110: wedding_cards.authenticated.UPDATE
grant UPDATE on table public.wedding_cards to authenticated;

-- 110: wedding_cards.service_role.DELETE
grant DELETE on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.INSERT
grant INSERT on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.MAINTAIN
grant MAINTAIN on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.REFERENCES
grant REFERENCES on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.SELECT
grant SELECT on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.TRIGGER
grant TRIGGER on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.TRUNCATE
grant TRUNCATE on table public.wedding_cards to service_role;

-- 110: wedding_cards.service_role.UPDATE
grant UPDATE on table public.wedding_cards to service_role;

-- 110: wedding_planners.anon.DELETE
grant DELETE on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.INSERT
grant INSERT on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.MAINTAIN
grant MAINTAIN on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.REFERENCES
grant REFERENCES on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.SELECT
grant SELECT on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.TRIGGER
grant TRIGGER on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.TRUNCATE
grant TRUNCATE on table public.wedding_planners to anon;

-- 110: wedding_planners.anon.UPDATE
grant UPDATE on table public.wedding_planners to anon;

-- 110: wedding_planners.authenticated.DELETE
grant DELETE on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.INSERT
grant INSERT on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.MAINTAIN
grant MAINTAIN on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.REFERENCES
grant REFERENCES on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.SELECT
grant SELECT on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.TRIGGER
grant TRIGGER on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.TRUNCATE
grant TRUNCATE on table public.wedding_planners to authenticated;

-- 110: wedding_planners.authenticated.UPDATE
grant UPDATE on table public.wedding_planners to authenticated;

-- 110: wedding_planners.service_role.DELETE
grant DELETE on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.INSERT
grant INSERT on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.MAINTAIN
grant MAINTAIN on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.REFERENCES
grant REFERENCES on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.SELECT
grant SELECT on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.TRIGGER
grant TRIGGER on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.TRUNCATE
grant TRUNCATE on table public.wedding_planners to service_role;

-- 110: wedding_planners.service_role.UPDATE
grant UPDATE on table public.wedding_planners to service_role;

-- 120: check_table_availability(uuid).PUBLIC.EXECUTE
grant EXECUTE on function check_table_availability(uuid) to public;

-- 120: check_table_availability(uuid).anon.EXECUTE
grant EXECUTE on function check_table_availability(uuid) to anon;

-- 120: check_table_availability(uuid).authenticated.EXECUTE
grant EXECUTE on function check_table_availability(uuid) to authenticated;

-- 120: check_table_availability(uuid).service_role.EXECUTE
grant EXECUTE on function check_table_availability(uuid) to service_role;

-- 120: ensure_subcategory(uuid,text).PUBLIC.EXECUTE
grant EXECUTE on function ensure_subcategory(uuid,text) to public;

-- 120: ensure_subcategory(uuid,text).anon.EXECUTE
grant EXECUTE on function ensure_subcategory(uuid,text) to anon;

-- 120: ensure_subcategory(uuid,text).authenticated.EXECUTE
grant EXECUTE on function ensure_subcategory(uuid,text) to authenticated;

-- 120: ensure_subcategory(uuid,text).service_role.EXECUTE
grant EXECUTE on function ensure_subcategory(uuid,text) to service_role;

-- 120: find_or_create_place(text,text,text,numeric,numeric,text,text,t
grant EXECUTE on function find_or_create_place(text,text,text,numeric,numeric,text,text,text,text,text) to anon;

-- 120: find_or_create_place(text,text,text,numeric,numeric,text,text,t
grant EXECUTE on function find_or_create_place(text,text,text,numeric,numeric,text,text,text,text,text) to authenticated;

-- 120: find_or_create_place(text,text,text,numeric,numeric,text,text,t
grant EXECUTE on function find_or_create_place(text,text,text,numeric,numeric,text,text,text,text,text) to public;

-- 120: find_or_create_place(text,text,text,numeric,numeric,text,text,t
grant EXECUTE on function find_or_create_place(text,text,text,numeric,numeric,text,text,text,text,text) to service_role;

-- 120: get_or_create_category(uuid,text).PUBLIC.EXECUTE
grant EXECUTE on function get_or_create_category(uuid,text) to public;

-- 120: get_or_create_category(uuid,text).anon.EXECUTE
grant EXECUTE on function get_or_create_category(uuid,text) to anon;

-- 120: get_or_create_category(uuid,text).authenticated.EXECUTE
grant EXECUTE on function get_or_create_category(uuid,text) to authenticated;

-- 120: get_or_create_category(uuid,text).service_role.EXECUTE
grant EXECUTE on function get_or_create_category(uuid,text) to service_role;

-- 120: get_table_stats(uuid).PUBLIC.EXECUTE
grant EXECUTE on function get_table_stats(uuid) to public;

-- 120: get_table_stats(uuid).anon.EXECUTE
grant EXECUTE on function get_table_stats(uuid) to anon;

-- 120: get_table_stats(uuid).authenticated.EXECUTE
grant EXECUTE on function get_table_stats(uuid) to authenticated;

-- 120: get_table_stats(uuid).service_role.EXECUTE
grant EXECUTE on function get_table_stats(uuid) to service_role;

-- 120: get_visible_suppliers(text,text,text,boolean).PUBLIC.EXECUTE
grant EXECUTE on function get_visible_suppliers(text,text,text,boolean) to public;

-- 120: get_visible_suppliers(text,text,text,boolean).anon.EXECUTE
grant EXECUTE on function get_visible_suppliers(text,text,text,boolean) to anon;

-- 120: get_visible_suppliers(text,text,text,boolean).authenticated.EXE
grant EXECUTE on function get_visible_suppliers(text,text,text,boolean) to authenticated;

-- 120: get_visible_suppliers(text,text,text,boolean).service_role.EXEC
grant EXECUTE on function get_visible_suppliers(text,text,text,boolean) to service_role;

-- 120: increment_analytics_counter(text,uuid,text).PUBLIC.EXECUTE
grant EXECUTE on function increment_analytics_counter(text,uuid,text) to public;

-- 120: increment_analytics_counter(text,uuid,text).anon.EXECUTE
grant EXECUTE on function increment_analytics_counter(text,uuid,text) to anon;

-- 120: increment_analytics_counter(text,uuid,text).authenticated.EXECU
grant EXECUTE on function increment_analytics_counter(text,uuid,text) to authenticated;

-- 120: increment_analytics_counter(text,uuid,text).service_role.EXECUT
grant EXECUTE on function increment_analytics_counter(text,uuid,text) to service_role;

-- 120: is_subscription_active(text,timestamp with time zone).PUBLIC.EX
grant EXECUTE on function is_subscription_active(text,timestamp with time zone) to public;

-- 120: is_subscription_active(text,timestamp with time zone).anon.EXEC
grant EXECUTE on function is_subscription_active(text,timestamp with time zone) to anon;

-- 120: is_subscription_active(text,timestamp with time zone).authentic
grant EXECUTE on function is_subscription_active(text,timestamp with time zone) to authenticated;

-- 120: is_subscription_active(text,timestamp with time zone).service_r
grant EXECUTE on function is_subscription_active(text,timestamp with time zone) to service_role;

-- 120: normalize_phone(text).PUBLIC.EXECUTE
grant EXECUTE on function normalize_phone(text) to public;

-- 120: normalize_phone(text).anon.EXECUTE
grant EXECUTE on function normalize_phone(text) to anon;

-- 120: normalize_phone(text).authenticated.EXECUTE
grant EXECUTE on function normalize_phone(text) to authenticated;

-- 120: normalize_phone(text).service_role.EXECUTE
grant EXECUTE on function normalize_phone(text) to service_role;

-- 120: normalize_url(text).PUBLIC.EXECUTE
grant EXECUTE on function normalize_url(text) to public;

-- 120: normalize_url(text).anon.EXECUTE
grant EXECUTE on function normalize_url(text) to anon;

-- 120: normalize_url(text).authenticated.EXECUTE
grant EXECUTE on function normalize_url(text) to authenticated;

-- 120: normalize_url(text).service_role.EXECUTE
grant EXECUTE on function normalize_url(text) to service_role;

-- 120: populate_event_categories().PUBLIC.EXECUTE
grant EXECUTE on function populate_event_categories() to public;

-- 120: populate_event_categories().anon.EXECUTE
grant EXECUTE on function populate_event_categories() to anon;

-- 120: populate_event_categories().authenticated.EXECUTE
grant EXECUTE on function populate_event_categories() to authenticated;

-- 120: populate_event_categories().service_role.EXECUTE
grant EXECUTE on function populate_event_categories() to service_role;

-- 120: populate_user_timeline().PUBLIC.EXECUTE
grant EXECUTE on function populate_user_timeline() to public;

-- 120: populate_user_timeline().anon.EXECUTE
grant EXECUTE on function populate_user_timeline() to anon;

-- 120: populate_user_timeline().authenticated.EXECUTE
grant EXECUTE on function populate_user_timeline() to authenticated;

-- 120: populate_user_timeline().service_role.EXECUTE
grant EXECUTE on function populate_user_timeline() to service_role;

-- 120: regenerate_event_data(uuid).PUBLIC.EXECUTE
grant EXECUTE on function regenerate_event_data(uuid) to public;

-- 120: regenerate_event_data(uuid).anon.EXECUTE
grant EXECUTE on function regenerate_event_data(uuid) to anon;

-- 120: regenerate_event_data(uuid).authenticated.EXECUTE
grant EXECUTE on function regenerate_event_data(uuid) to authenticated;

-- 120: regenerate_event_data(uuid).service_role.EXECUTE
grant EXECUTE on function regenerate_event_data(uuid) to service_role;

-- 120: regenerate_event_timeline(uuid).PUBLIC.EXECUTE
grant EXECUTE on function regenerate_event_timeline(uuid) to public;

-- 120: regenerate_event_timeline(uuid).anon.EXECUTE
grant EXECUTE on function regenerate_event_timeline(uuid) to anon;

-- 120: regenerate_event_timeline(uuid).authenticated.EXECUTE
grant EXECUTE on function regenerate_event_timeline(uuid) to authenticated;

-- 120: regenerate_event_timeline(uuid).service_role.EXECUTE
grant EXECUTE on function regenerate_event_timeline(uuid) to service_role;

-- 120: seed_categories(uuid).PUBLIC.EXECUTE
grant EXECUTE on function seed_categories(uuid) to public;

-- 120: seed_categories(uuid).anon.EXECUTE
grant EXECUTE on function seed_categories(uuid) to anon;

-- 120: seed_categories(uuid).authenticated.EXECUTE
grant EXECUTE on function seed_categories(uuid) to authenticated;

-- 120: seed_categories(uuid).service_role.EXECUTE
grant EXECUTE on function seed_categories(uuid) to service_role;

-- 120: seed_full_event(uuid).PUBLIC.EXECUTE
grant EXECUTE on function seed_full_event(uuid) to public;

-- 120: seed_full_event(uuid).anon.EXECUTE
grant EXECUTE on function seed_full_event(uuid) to anon;

-- 120: seed_full_event(uuid).authenticated.EXECUTE
grant EXECUTE on function seed_full_event(uuid) to authenticated;

-- 120: seed_full_event(uuid).service_role.EXECUTE
grant EXECUTE on function seed_full_event(uuid) to service_role;

-- 120: seed_subcategories(uuid,text[]).PUBLIC.EXECUTE
grant EXECUTE on function seed_subcategories(uuid,text[]) to public;

-- 120: seed_subcategories(uuid,text[]).anon.EXECUTE
grant EXECUTE on function seed_subcategories(uuid,text[]) to anon;

-- 120: seed_subcategories(uuid,text[]).authenticated.EXECUTE
grant EXECUTE on function seed_subcategories(uuid,text[]) to authenticated;

-- 120: seed_subcategories(uuid,text[]).service_role.EXECUTE
grant EXECUTE on function seed_subcategories(uuid,text[]) to service_role;

-- 120: set_owner_id().PUBLIC.EXECUTE
grant EXECUTE on function set_owner_id() to public;

-- 120: set_owner_id().anon.EXECUTE
grant EXECUTE on function set_owner_id() to anon;

-- 120: set_owner_id().authenticated.EXECUTE
grant EXECUTE on function set_owner_id() to authenticated;

-- 120: set_owner_id().service_role.EXECUTE
grant EXECUTE on function set_owner_id() to service_role;

-- 120: update_updated_at().PUBLIC.EXECUTE
grant EXECUTE on function update_updated_at() to public;

-- 120: update_updated_at().anon.EXECUTE
grant EXECUTE on function update_updated_at() to anon;

-- 120: update_updated_at().authenticated.EXECUTE
grant EXECUTE on function update_updated_at() to authenticated;

-- 120: update_updated_at().service_role.EXECUTE
grant EXECUTE on function update_updated_at() to service_role;

-- 120: update_updated_at_column().PUBLIC.EXECUTE
grant EXECUTE on function update_updated_at_column() to public;

-- 120: update_updated_at_column().anon.EXECUTE
grant EXECUTE on function update_updated_at_column() to anon;

-- 120: update_updated_at_column().authenticated.EXECUTE
grant EXECUTE on function update_updated_at_column() to authenticated;

-- 120: update_updated_at_column().service_role.EXECUTE
grant EXECUTE on function update_updated_at_column() to service_role;

-- 120: upsert_vendor(text,text,text,text,text,text,text,numeric,intege
grant EXECUTE on function upsert_vendor(text,text,text,text,text,text,text,numeric,integer,text,text,jsonb,text,text,text,numeric,numeric,text,text,text,text,text) to anon;

-- 120: upsert_vendor(text,text,text,text,text,text,text,numeric,intege
grant EXECUTE on function upsert_vendor(text,text,text,text,text,text,text,numeric,integer,text,text,jsonb,text,text,text,numeric,numeric,text,text,text,text,text) to authenticated;

-- 120: upsert_vendor(text,text,text,text,text,text,text,numeric,intege
grant EXECUTE on function upsert_vendor(text,text,text,text,text,text,text,numeric,integer,text,text,jsonb,text,text,text,numeric,numeric,text,text,text,text,text) to public;

-- 120: upsert_vendor(text,text,text,text,text,text,text,numeric,intege
grant EXECUTE on function upsert_vendor(text,text,text,text,text,text,text,numeric,integer,text,text,jsonb,text,text,text,numeric,numeric,text,text,text,text,text) to service_role;
