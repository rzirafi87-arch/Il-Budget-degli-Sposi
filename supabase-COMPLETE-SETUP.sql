-- =========================================
-- COMPLETE DATABASE SETUP - RUN THIS ONCE
-- =========================================
-- This script creates all tables from scratch with proper structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if needed (CAREFUL! This deletes all data)
-- Uncomment only if you want to start fresh
-- DROP TABLE IF EXISTS public.incomes CASCADE;
-- DROP TABLE IF EXISTS public.expenses CASCADE;
-- DROP TABLE IF EXISTS public.subcategories CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.events CASCADE;
-- DROP TABLE IF EXISTS public.suppliers CASCADE;
-- DROP TABLE IF EXISTS public.locations CASCADE;
-- DROP TABLE IF EXISTS public.churches CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- STEP 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 2: Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID,
  public_id TEXT UNIQUE,
  name TEXT DEFAULT 'Il nostro matrimonio',
  currency TEXT DEFAULT 'EUR',
  total_budget NUMERIC(10, 2) DEFAULT 0,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 3: Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 4: Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 5: Create expenses table with all needed columns
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT,
  subcategory TEXT,
  supplier TEXT,
  amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  spend_type TEXT DEFAULT 'common',
  description TEXT,
  expense_date DATE,
  from_dashboard BOOLEAN DEFAULT false,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 6: Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  category TEXT,
  verified BOOLEAN DEFAULT false,
  user_id UUID,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  description TEXT,
  photo_urls TEXT[],
  video_urls TEXT[],
  discount_info TEXT
);

-- STEP 7: Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  price_range TEXT,
  capacity_min INTEGER,
  capacity_max INTEGER,
  location_type TEXT,
  verified BOOLEAN DEFAULT false,
  user_id UUID,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 8: Create churches table
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  church_type TEXT,
  capacity INTEGER,
  requires_baptism BOOLEAN DEFAULT false,
  requires_marriage_course BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  user_id UUID,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 9: Create incomes table
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('busta', 'bonifico', 'regalo')),
  amount NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- STEP 10: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_event_id ON public.categories(event_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_incomes_event_id ON public.incomes(event_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_region ON public.suppliers(region);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON public.suppliers(category);
CREATE INDEX IF NOT EXISTS idx_locations_region ON public.locations(region);
CREATE INDEX IF NOT EXISTS idx_churches_region ON public.churches(region);

-- STEP 11: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 12: Apply triggers to all tables
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_churches_updated_at ON public.churches;
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_incomes_updated_at ON public.incomes;
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON public.incomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 13: Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- STEP 14: Create RLS Policies

-- Profiles policies
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events policies
DROP POLICY IF EXISTS events_owner_all ON public.events;
CREATE POLICY events_owner_all ON public.events
  FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (owner_id = auth.uid());

-- Categories policies
DROP POLICY IF EXISTS cat_owner_all ON public.categories;
CREATE POLICY cat_owner_all ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = categories.event_id 
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Subcategories policies
DROP POLICY IF EXISTS sub_owner_all ON public.subcategories;
CREATE POLICY sub_owner_all ON public.subcategories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.categories
      JOIN public.events ON events.id = categories.event_id
      WHERE categories.id = subcategories.category_id 
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Expenses policies
DROP POLICY IF EXISTS exp_owner_all ON public.expenses;
CREATE POLICY exp_owner_all ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = expenses.event_id 
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Incomes policies
DROP POLICY IF EXISTS incomes_owner_all ON public.incomes;
CREATE POLICY incomes_owner_all ON public.incomes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = incomes.event_id 
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Suppliers policies (everyone can read, only authenticated can insert)
DROP POLICY IF EXISTS suppliers_select_all ON public.suppliers;
CREATE POLICY suppliers_select_all ON public.suppliers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS suppliers_insert_auth ON public.suppliers;
CREATE POLICY suppliers_insert_auth ON public.suppliers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS suppliers_update_own ON public.suppliers;
CREATE POLICY suppliers_update_own ON public.suppliers
  FOR UPDATE USING (user_id = auth.uid() AND verified = false);

-- Locations policies (everyone can read, only authenticated can insert)
DROP POLICY IF EXISTS locations_select_all ON public.locations;
CREATE POLICY locations_select_all ON public.locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS locations_insert_auth ON public.locations;
CREATE POLICY locations_insert_auth ON public.locations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS locations_update_own ON public.locations;
CREATE POLICY locations_update_own ON public.locations
  FOR UPDATE USING (user_id = auth.uid() AND verified = false);

-- Churches policies (everyone can read, only authenticated can insert)
DROP POLICY IF EXISTS churches_select_all ON public.churches;
CREATE POLICY churches_select_all ON public.churches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS churches_insert_auth ON public.churches;
CREATE POLICY churches_insert_auth ON public.churches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS churches_update_own ON public.churches;
CREATE POLICY churches_update_own ON public.churches
  FOR UPDATE USING (user_id = auth.uid() AND verified = false);
