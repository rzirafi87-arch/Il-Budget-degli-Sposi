-- =====================================================
-- SCRIPT UNIFICATO: Tutti i Patch SQL in Ordine
-- =====================================================
-- Esegui questo script DOPO aver eseguito supabase-COMPLETE-SETUP.sql
-- Contiene tutti i patch necessari per il funzionamento completo dell'app
-- =====================================================

-- =====================================================
-- PATCH 1: Total Budget
-- =====================================================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0;

COMMENT ON COLUMN events.total_budget IS 'Budget totale disponibile inserito dagli sposi';

-- =====================================================
-- PATCH 2: Spend Type
-- =====================================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS spend_type TEXT NOT NULL DEFAULT 'common';

COMMENT ON COLUMN public.expenses.spend_type IS 'Type of expense: common (shared), bride, or groom';

-- =====================================================
-- PATCH 3: Per-Spouse Budget (CRITICO PER REGISTRAZIONE!)
-- =====================================================
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS bride_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS groom_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bride_email TEXT,
  ADD COLUMN IF NOT EXISTS groom_email TEXT;

-- Add constraint only if it doesn't exist (PostgreSQL safe way)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_budgets_nonnegative'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_budgets_nonnegative
      CHECK (
        COALESCE(bride_initial_budget,0) >= 0 AND
        COALESCE(groom_initial_budget,0) >= 0 AND
        COALESCE(total_budget,0) >= 0
      );
  END IF;
END $$;

-- =====================================================
-- PATCH 8: Subscription Packages System (suppliers/locations/churches)
-- Full tiered subscription model with packages, transactions, visibility helpers
-- Safe and idempotent for repeated runs
-- =====================================================

-- Columns for suppliers (note: tier/expires may already exist from Patch 6)
ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Same columns for locations
ALTER TABLE public.locations 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'));

ALTER TABLE public.locations 
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.locations 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Same columns for churches
ALTER TABLE public.churches 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'));

ALTER TABLE public.churches 
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.churches 
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create subscription packages table
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT UNIQUE NOT NULL CHECK (tier IN ('free', 'base', 'premium', 'premium_plus')),
  name_it TEXT NOT NULL,
  description_it TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription transactions table
CREATE TABLE IF NOT EXISTS public.subscription_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  payment_provider TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (
    (supplier_id IS NOT NULL AND location_id IS NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NOT NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NULL AND church_id IS NOT NULL)
  )
);

-- Default package pricing
INSERT INTO public.subscription_packages (tier, name_it, description_it, price_monthly, price_yearly, features, display_order) VALUES
('free', 'Gratuito', 'Inserimento base senza visibilità pubblica', 0, 0, 
  '[
    "Creazione profilo fornitore",
    "Gestione dati di contatto",
    "NON appare nelle ricerche pubbliche"
  ]'::jsonb, 1),

('base', 'Base', 'Visibilità nella tua categoria', 29.90, 299.00,
  '[
    "Tutto di Gratuito, più:",
    "Appare nella pagina categoria specifica",
    "Profilo con foto e descrizione",
    "Dati di contatto visibili",
    "Badge ""Fornitore Certificato"""
  ]'::jsonb, 2),

('premium', 'Premium', 'Massima visibilità nel portale', 69.90, 699.00,
  '[
    "Tutto di Base, più:",
    "Appare nella pagina hub Fornitori",
    "Posizione prioritaria nei risultati",
    "Galleria fino a 10 foto",
    "Statistiche visualizzazioni profilo",
    "Badge ""Fornitore Premium"""
  ]'::jsonb, 3),

('premium_plus', 'Premium Plus', 'Visibilità garantita anche in Demo', 129.90, 1299.00,
  '[
    "Tutto di Premium, più:",
    "Appare nella Demo per utenti non registrati",
    "Posizione TOP nei risultati di ricerca",
    "Galleria illimitata",
    "Link diretto al sito web evidenziato",
    "Supporto dedicato",
    "Badge ""Partner Ufficiale""",
    "Analytics avanzate"
  ]'::jsonb, 4)
ON CONFLICT (tier) DO NOTHING;

-- Indici
CREATE INDEX IF NOT EXISTS idx_suppliers_subscription_tier ON public.suppliers(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_suppliers_featured ON public.suppliers(is_featured);
CREATE INDEX IF NOT EXISTS idx_suppliers_subscription_expires ON public.suppliers(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_locations_subscription_tier ON public.locations(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_locations_featured ON public.locations(is_featured);
CREATE INDEX IF NOT EXISTS idx_locations_subscription_expires ON public.locations(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_churches_subscription_tier ON public.churches(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_churches_featured ON public.churches(is_featured);
CREATE INDEX IF NOT EXISTS idx_churches_subscription_expires ON public.churches(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON public.subscription_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON public.subscription_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_transactions_church ON public.subscription_transactions(church_id);

-- RLS Policies for subscription_packages (public read)
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscription_packages' 
      AND policyname = 'Allow public read subscription_packages'
  ) THEN
    CREATE POLICY "Allow public read subscription_packages" 
      ON public.subscription_packages 
      FOR SELECT 
      USING (is_active = true);
  END IF;
END$$;

-- RLS Policies for subscription_transactions (users can view their own)
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscription_transactions' 
      AND policyname = 'Users can view own transactions via supplier'
  ) THEN
    CREATE POLICY "Users can view own transactions via supplier" ON public.subscription_transactions 
    FOR SELECT 
    USING (
      supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()) OR
      location_id IN (SELECT id FROM public.locations WHERE user_id = auth.uid()) OR
      church_id IN (SELECT id FROM public.churches WHERE user_id = auth.uid())
    );
  END IF;
END$$;

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(
  p_subscription_tier TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_subscription_tier = 'free' THEN
    RETURN true;
  END IF;
  IF p_expires_at IS NULL THEN
    RETURN false;
  END IF;
  RETURN p_expires_at > TIMEZONE('utc', NOW());
END;
$$;

-- Function to get visible suppliers based on context
CREATE OR REPLACE FUNCTION public.get_visible_suppliers(
  p_category TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL,
  p_is_demo BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  region TEXT,
  province TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  category TEXT,
  verified BOOLEAN,
  subscription_tier TEXT,
  is_featured BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.region, s.province, s.city, s.address,
    s.phone, s.email, s.website, s.description, s.category,
    s.verified, s.subscription_tier, s.is_featured
  FROM public.suppliers s
  WHERE 
    (p_category IS NULL OR s.category = p_category)
    AND (p_region IS NULL OR s.region = p_region)
    AND (p_province IS NULL OR s.province = p_province)
    AND (
      (s.subscription_tier = 'premium_plus' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at))
      OR (s.subscription_tier = 'premium' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND NOT p_is_demo)
      OR (s.subscription_tier = 'base' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND p_category IS NOT NULL AND NOT p_is_demo)
    )
  ORDER BY 
    CASE WHEN s.subscription_tier = 'premium_plus' THEN 1
         WHEN s.subscription_tier = 'premium' THEN 2
         WHEN s.subscription_tier = 'base' THEN 3
         ELSE 4 END,
    s.is_featured DESC,
    s.name ASC;
END;
$$;

COMMENT ON TABLE public.subscription_packages IS 'Defines the available subscription tiers for suppliers/locations/churches';
COMMENT ON TABLE public.subscription_transactions IS 'Tracks all subscription purchases and renewals';
COMMENT ON FUNCTION public.is_subscription_active IS 'Checks if a subscription tier is currently active based on expiry date';
COMMENT ON FUNCTION public.get_visible_suppliers IS 'Returns suppliers filtered by subscription tier visibility rules';

-- =====================================================
-- PATCH 13: Events – country and rite columns for localization layer
-- =====================================================
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS rite TEXT;

COMMENT ON COLUMN public.events.country IS 'ISO country code or label for the event context (e.g., IT, US)';
COMMENT ON COLUMN public.events.rite IS 'Rite/religion or ceremony type (e.g., catholic, civil, hindu)';

-- =====================================================
-- PATCH X: Appointments (Agenda) with Reminder Flags
-- =====================================================
-- Basic agenda table to store user appointments per event with reminder tracking
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  reminder_7d_sent BOOLEAN DEFAULT false,
  reminder_48h_sent BOOLEAN DEFAULT false,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_event_id ON public.appointments(event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder7d ON public.appointments(reminder_7d_sent);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder48h ON public.appointments(reminder_48h_sent);

-- Update trigger
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies: user can manage appointments for their own events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'appointments_owner_all'
  ) THEN
    CREATE POLICY appointments_owner_all ON public.appointments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.events e
          WHERE e.id = appointments.event_id
            AND (e.owner_id = auth.uid() OR e.owner_id IS NULL)
        )
      );
  END IF;
END$$;

-- =====================================================
-- PATCH 4: Expenses Enhancements
-- =====================================================
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS from_dashboard BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN expenses.description IS 'Descrizione dettagliata della spesa';
COMMENT ON COLUMN expenses.expense_date IS 'Data in cui è stata sostenuta la spesa';
COMMENT ON COLUMN expenses.from_dashboard IS 'Indica se la spesa era presente nel preventivo della dashboard';

-- =====================================================
-- TUTTI I PATCH APPLICATI CON SUCCESSO!
-- =====================================================
-- Ora puoi procedere con la registrazione dell'utente
-- =====================================================
-- =====================================================
-- PATCH 16: Events.owner_id – NOT NULL + Default + RLS hardening
-- Obiettivo: prevenire errori 23502 su owner_id NULL e semplificare le policy
-- Idempotente e sicuro su Supabase
-- =====================================================

-- 1) Colonna owner_id: tipo, NOT NULL e default
ALTER TABLE public.events
  ALTER COLUMN owner_id TYPE uuid USING owner_id::uuid,
  ALTER COLUMN owner_id SET NOT NULL,
  ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- 2) Backfill eventuali righe NULL (assegna all'utente chiamante)
--    Nota: in Supabase, auth.uid() è disponibile anche in SQL editor con sessione JWT
UPDATE public.events
SET owner_id = auth.uid()
WHERE owner_id IS NULL;

-- 3) RLS: abilita (se non già abilitata)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies: rimpiazza la policy cumulativa con 4 policy chiare
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_owner_all'
  ) THEN
    DROP POLICY "events_owner_all" ON public.events;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_select_own'
  ) THEN
    CREATE POLICY events_select_own ON public.events FOR SELECT USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_insert_self'
  ) THEN
    CREATE POLICY events_insert_self ON public.events FOR INSERT WITH CHECK (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_update_own'
  ) THEN
    CREATE POLICY events_update_own ON public.events FOR UPDATE USING (owner_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'events_delete_own'
  ) THEN
    CREATE POLICY events_delete_own ON public.events FOR DELETE USING (owner_id = auth.uid());
  END IF;
END$$;

-- 5) Propaga la restrizione NOT NULL nei vincoli a cascata (nessuna azione necessaria sui FK, solo su policies già allineate)

-- =====================================================
-- PATCH 5: Suppliers media & promo fields
-- =====================================================
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[],
  ADD COLUMN IF NOT EXISTS video_urls TEXT[],
  ADD COLUMN IF NOT EXISTS discount_info TEXT;

COMMENT ON COLUMN public.suppliers.description IS 'Descrizione del fornitore, visibile pubblicamente';
COMMENT ON COLUMN public.suppliers.photo_urls IS 'Elenco URL immagini del fornitore';
COMMENT ON COLUMN public.suppliers.video_urls IS 'Elenco URL video (embed/link) del fornitore';
COMMENT ON COLUMN public.suppliers.discount_info IS 'Informazioni su sconti o promozioni attive';

-- =====================================================
-- PATCH 6: Suppliers - Minimal subscription columns
-- (Keeps API gating functional even without full subscription system)
-- =====================================================
ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- PATCH 7: Supabase Storage bucket for suppliers (public)
-- Safe-guarded: only runs on Supabase (storage schema available)
-- =====================================================
DO $$
BEGIN
  -- Proceed only if Supabase storage schema exists
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    -- Create bucket if missing (ignore exceptions due to signature diffs)
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'suppliers') THEN
        PERFORM storage.create_bucket('suppliers', public := true);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- ignore on local Postgres or signature mismatch
      NULL;
    END;

    -- Public read policy on objects in 'suppliers' bucket
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read suppliers bucket'
      ) THEN
        CREATE POLICY "Public read suppliers bucket" ON storage.objects
        FOR SELECT TO anon, authenticated, service_role
        USING (bucket_id = 'suppliers');
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Authenticated insert into suppliers bucket
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth upload suppliers bucket'
      ) THEN
        CREATE POLICY "Auth upload suppliers bucket" ON storage.objects
        FOR INSERT TO authenticated, service_role
        WITH CHECK (bucket_id = 'suppliers');
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Owner can update/delete (relaxed: allow authenticated)
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth update suppliers bucket'
      ) THEN
        CREATE POLICY "Auth update suppliers bucket" ON storage.objects
        FOR UPDATE TO authenticated, service_role
        USING (bucket_id = 'suppliers')
        WITH CHECK (bucket_id = 'suppliers');
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Auth delete suppliers bucket'
      ) THEN
        CREATE POLICY "Auth delete suppliers bucket" ON storage.objects
        FOR DELETE TO authenticated, service_role
        USING (bucket_id = 'suppliers');
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

-- =====================================================
-- PATCH 12: Subscription Packages System
-- =====================================================
-- Add subscription tier to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'));

-- Add subscription expiry date
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Add featured flag for premium listings
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Same columns for locations
ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'));

ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Same columns for churches
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'base', 'premium', 'premium_plus'));

ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create subscription packages table
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT UNIQUE NOT NULL CHECK (tier IN ('free', 'base', 'premium', 'premium_plus')),
  name_it TEXT NOT NULL,
  description_it TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription transactions table
CREATE TABLE IF NOT EXISTS public.subscription_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  payment_provider TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (
    (supplier_id IS NOT NULL AND location_id IS NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NOT NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NULL AND church_id IS NOT NULL)
  )
);

-- Insert default package pricing
INSERT INTO public.subscription_packages (tier, name_it, description_it, price_monthly, price_yearly, features, display_order) VALUES
('free', 'Gratuito', 'Inserimento base senza visibilità pubblica', 0, 0, 
  '["Creazione profilo fornitore","Gestione dati di contatto","NON appare nelle ricerche pubbliche"]'::jsonb, 1),
('base', 'Base', 'Visibilità nella tua categoria', 29.90, 299.00,
  '["Tutto di Gratuito, più:","Appare nella pagina categoria specifica","Profilo con foto e descrizione","Dati di contatto visibili","Badge \"Fornitore Certificato\""]'::jsonb, 2),
('premium', 'Premium', 'Massima visibilità nel portale', 69.90, 699.00,
  '["Tutto di Base, più:","Appare nella pagina hub Fornitori","Posizione prioritaria nei risultati","Galleria fino a 10 foto","Statistiche visualizzazioni profilo","Badge \"Fornitore Premium\""]'::jsonb, 3),
('premium_plus', 'Premium Plus', 'Visibilità garantita anche in Demo', 129.90, 1299.00,
  '["Tutto di Premium, più:","Appare nella Demo per utenti non registrati","Posizione TOP nei risultati di ricerca","Galleria illimitata","Link diretto al sito web evidenziato","Supporto dedicato","Badge \"Partner Ufficiale\"","Analytics avanzate"]'::jsonb, 4)
ON CONFLICT (tier) DO NOTHING;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_suppliers_subscription_tier ON public.suppliers(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_suppliers_featured ON public.suppliers(is_featured);
CREATE INDEX IF NOT EXISTS idx_suppliers_subscription_expires ON public.suppliers(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_locations_subscription_tier ON public.locations(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_locations_featured ON public.locations(is_featured);
CREATE INDEX IF NOT EXISTS idx_locations_subscription_expires ON public.locations(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_churches_subscription_tier ON public.churches(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_churches_featured ON public.churches(is_featured);
CREATE INDEX IF NOT EXISTS idx_churches_subscription_expires ON public.churches(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON public.subscription_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON public.subscription_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_transactions_church ON public.subscription_transactions(church_id);

-- RLS Policies for subscription_packages (public read)
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscription_packages' 
      AND policyname = 'Allow public read subscription_packages'
  ) THEN
    CREATE POLICY "Allow public read subscription_packages" 
      ON public.subscription_packages 
      FOR SELECT 
      USING (is_active = true);
  END IF;
END$$;

-- RLS Policies for subscription_transactions
ALTER TABLE public.subscription_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'subscription_transactions' 
      AND policyname = 'Users can view own transactions via supplier'
  ) THEN
    CREATE POLICY "Users can view own transactions via supplier" 
      ON public.subscription_transactions 
      FOR SELECT 
      USING (
        supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()) OR
        location_id IN (SELECT id FROM public.locations WHERE user_id = auth.uid()) OR
        church_id IN (SELECT id FROM public.churches WHERE user_id = auth.uid())
      );
  END IF;
END$$;

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(
  p_subscription_tier TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_subscription_tier = 'free' THEN
    RETURN true;
  END IF;
  
  IF p_expires_at IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN p_expires_at > TIMEZONE('utc', NOW());
END;
$$;

-- Function to get visible suppliers based on context
CREATE OR REPLACE FUNCTION public.get_visible_suppliers(
  p_category TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL,
  p_is_demo BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  region TEXT,
  province TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  category TEXT,
  verified BOOLEAN,
  subscription_tier TEXT,
  is_featured BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.region, s.province, s.city, s.address,
    s.phone, s.email, s.website, s.description, s.category,
    s.verified, s.subscription_tier, s.is_featured
  FROM public.suppliers s
  WHERE 
    (p_category IS NULL OR s.category = p_category)
    AND (p_region IS NULL OR s.region = p_region)
    AND (p_province IS NULL OR s.province = p_province)
    AND (
      (s.subscription_tier = 'premium_plus' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at))
      OR (s.subscription_tier = 'premium' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND NOT p_is_demo)
      OR (s.subscription_tier = 'base' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND p_category IS NOT NULL AND NOT p_is_demo)
    )
  ORDER BY 
    CASE WHEN s.subscription_tier = 'premium_plus' THEN 1
         WHEN s.subscription_tier = 'premium' THEN 2
         WHEN s.subscription_tier = 'base' THEN 3
         ELSE 4 END,
    s.is_featured DESC,
    s.name ASC;
END;
$$;

COMMENT ON TABLE public.subscription_packages IS 'Defines the available subscription tiers for suppliers/locations/churches';
COMMENT ON TABLE public.subscription_transactions IS 'Tracks all subscription purchases and renewals';
COMMENT ON FUNCTION public.is_subscription_active IS 'Checks if a subscription tier is currently active based on expiry date';
COMMENT ON FUNCTION public.get_visible_suppliers IS 'Returns suppliers filtered by subscription tier visibility rules';

-- =====================================================
-- PATCH 14: Localization schema (app.*) for country/rite presets
-- =====================================================

-- Schema container
CREATE SCHEMA IF NOT EXISTS app;

-- Master data
CREATE TABLE IF NOT EXISTS app.countries (
  id BIGSERIAL PRIMARY KEY,
  iso2 TEXT UNIQUE NOT NULL CHECK (char_length(iso2) = 2),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS app.event_types (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

-- Country-specific configuration for an event type (e.g., Matrimonio in IT)
CREATE TABLE IF NOT EXISTS app.country_events (
  id BIGSERIAL PRIMARY KEY,
  country_id BIGINT NOT NULL REFERENCES app.countries(id) ON DELETE CASCADE,
  event_type_id BIGINT NOT NULL REFERENCES app.event_types(id) ON DELETE CASCADE,
  description TEXT,
  duration_days INT,
  legal_requirements TEXT,
  registry_style TEXT,
  outfits_count INT,
  alcohol_allowed_default BOOLEAN,
  gender_separation_possible BOOLEAN,
  destination_friendly BOOLEAN,
  UNIQUE(country_id, event_type_id)
);

-- Lookup tables (deduplicated values)
CREATE TABLE IF NOT EXISTS app.ceremony_types (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.rituals        (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.roles          (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.vendor_types   (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.timeline_steps (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.music_styles   (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.location_styles(id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.inv_channels   (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.gift_types     (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.food_notes     (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS app.colors         (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL);

-- Bridge tables (N:N) anchored to country_events
CREATE TABLE IF NOT EXISTS app.country_event_ceremonies (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  ceremony_type_id BIGINT REFERENCES app.ceremony_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, ceremony_type_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_rituals (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  ritual_id BIGINT REFERENCES app.rituals(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, ritual_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_roles (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES app.roles(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, role_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_vendors (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  vendor_type_id BIGINT REFERENCES app.vendor_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, vendor_type_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_timeline (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  step_id BIGINT REFERENCES app.timeline_steps(id) ON DELETE RESTRICT,
  ord SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (country_event_id, step_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_music (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  music_style_id BIGINT REFERENCES app.music_styles(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, music_style_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_locations (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  location_style_id BIGINT REFERENCES app.location_styles(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, location_style_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_inv_channels (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  inv_channel_id BIGINT REFERENCES app.inv_channels(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, inv_channel_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_gifts (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  gift_type_id BIGINT REFERENCES app.gift_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, gift_type_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_food (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  food_note_id BIGINT REFERENCES app.food_notes(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, food_note_id)
);

CREATE TABLE IF NOT EXISTS app.country_event_colors (
  country_event_id BIGINT REFERENCES app.country_events(id) ON DELETE CASCADE,
  color_id BIGINT REFERENCES app.colors(id) ON DELETE RESTRICT,
  PRIMARY KEY (country_event_id, color_id)
);

-- Budget focus percentages (1:1)
CREATE TABLE IF NOT EXISTS app.country_event_budget_focus (
  country_event_id BIGINT PRIMARY KEY REFERENCES app.country_events(id) ON DELETE CASCADE,
  catering NUMERIC NOT NULL CHECK (catering >= 0),
  location NUMERIC NOT NULL CHECK (location >= 0),
  attire NUMERIC NOT NULL CHECK (attire >= 0),
  photo_video NUMERIC NOT NULL CHECK (photo_video >= 0),
  decor NUMERIC NOT NULL CHECK (decor >= 0),
  entertainment NUMERIC NOT NULL CHECK (entertainment >= 0),
  stationery_gifts NUMERIC NOT NULL CHECK (stationery_gifts >= 0),
  CONSTRAINT app_budget_sum_check CHECK (
    (catering + location + attire + photo_video + decor + entertainment + stationery_gifts) BETWEEN 99 AND 101
  )
);

-- Upsert procedure for a single country+event (wedding)
CREATE OR REPLACE FUNCTION app.upsert_country_event_wedding(
  p_country_iso2 TEXT,
  p_country_name TEXT,
  p_language TEXT,
  p_event_slug TEXT,
  p_event_name TEXT,
  p_description TEXT,
  p_main_colors TEXT[],
  p_duration_days INT,
  p_ceremony_types TEXT[],
  p_rituals TEXT[],
  p_roles TEXT[],
  p_vendor_types TEXT[],
  p_timeline TEXT[],
  p_legal_requirements TEXT,
  p_gifts TEXT[],
  p_food_notes TEXT[],
  p_music_styles TEXT[],
  p_location_styles TEXT[],
  p_invitation_channels TEXT[],
  p_registry_style TEXT,
  p_alcohol_allowed_default BOOLEAN,
  p_gender_separation_possible BOOLEAN,
  p_destination_friendly BOOLEAN,
  p_outfits_count INT,
  p_budget_catering NUMERIC,
  p_budget_location NUMERIC,
  p_budget_attire NUMERIC,
  p_budget_photo_video NUMERIC,
  p_budget_decor NUMERIC,
  p_budget_entertainment NUMERIC,
  p_budget_stationery_gifts NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_country_id BIGINT;
  v_event_type_id BIGINT;
  v_country_event_id BIGINT;
  i INT;
  v_txt TEXT;
  v_step_id BIGINT;
BEGIN
  INSERT INTO app.countries(iso2, name, language)
  VALUES (UPPER(p_country_iso2), p_country_name, p_language)
  ON CONFLICT (iso2) DO UPDATE SET name = EXCLUDED.name, language = EXCLUDED.language
  RETURNING id INTO v_country_id;

  INSERT INTO app.event_types(slug, name)
  VALUES (p_event_slug, p_event_name)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_event_type_id;

  INSERT INTO app.country_events(
    country_id, event_type_id, description, duration_days, legal_requirements,
    registry_style, outfits_count, alcohol_allowed_default, gender_separation_possible,
    destination_friendly
  ) VALUES (
    v_country_id, v_event_type_id, p_description, p_duration_days, p_legal_requirements,
    p_registry_style, p_outfits_count, p_alcohol_allowed_default, p_gender_separation_possible,
    p_destination_friendly
  )
  ON CONFLICT (country_id, event_type_id) DO UPDATE SET
    description = EXCLUDED.description,
    duration_days = EXCLUDED.duration_days,
    legal_requirements = EXCLUDED.legal_requirements,
    registry_style = EXCLUDED.registry_style,
    outfits_count = EXCLUDED.outfits_count,
    alcohol_allowed_default = EXCLUDED.alcohol_allowed_default,
    gender_separation_possible = EXCLUDED.gender_separation_possible,
    destination_friendly = EXCLUDED.destination_friendly
  RETURNING id INTO v_country_event_id;

  -- Clear relations (idempotent)
  DELETE FROM app.country_event_ceremonies WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_rituals   WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_roles     WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_vendors   WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_timeline  WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_music     WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_locations WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_inv_channels WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_gifts     WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_food      WHERE country_event_id = v_country_event_id;
  DELETE FROM app.country_event_colors    WHERE country_event_id = v_country_event_id;

  -- Colors
  IF p_main_colors IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_main_colors LOOP
      INSERT INTO app.colors(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_colors(country_event_id, color_id)
      SELECT v_country_event_id, id FROM app.colors WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Ceremony types
  IF p_ceremony_types IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_ceremony_types LOOP
      INSERT INTO app.ceremony_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_ceremonies(country_event_id, ceremony_type_id)
      SELECT v_country_event_id, id FROM app.ceremony_types WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Rituals
  IF p_rituals IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_rituals LOOP
      INSERT INTO app.rituals(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_rituals(country_event_id, ritual_id)
      SELECT v_country_event_id, id FROM app.rituals WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Roles
  IF p_roles IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_roles LOOP
      INSERT INTO app.roles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_roles(country_event_id, role_id)
      SELECT v_country_event_id, id FROM app.roles WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Vendors
  IF p_vendor_types IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_vendor_types LOOP
      INSERT INTO app.vendor_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_vendors(country_event_id, vendor_type_id)
      SELECT v_country_event_id, id FROM app.vendor_types WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Timeline (ordered)
  IF p_timeline IS NOT NULL THEN
    FOR i IN ARRAY_LOWER(p_timeline, 1)..ARRAY_UPPER(p_timeline, 1) LOOP
      v_txt := p_timeline[i];
      INSERT INTO app.timeline_steps(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      SELECT id INTO v_step_id FROM app.timeline_steps WHERE name = v_txt;
      INSERT INTO app.country_event_timeline(country_event_id, step_id, ord)
      VALUES (v_country_event_id, v_step_id, i)
      ON CONFLICT (country_event_id, step_id) DO UPDATE SET ord = EXCLUDED.ord;
    END LOOP;
  END IF;

  -- Gifts
  IF p_gifts IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_gifts LOOP
      INSERT INTO app.gift_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_gifts(country_event_id, gift_type_id)
      SELECT v_country_event_id, id FROM app.gift_types WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Food notes
  IF p_food_notes IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_food_notes LOOP
      INSERT INTO app.food_notes(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_food(country_event_id, food_note_id)
      SELECT v_country_event_id, id FROM app.food_notes WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Music styles
  IF p_music_styles IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_music_styles LOOP
      INSERT INTO app.music_styles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_music(country_event_id, music_style_id)
      SELECT v_country_event_id, id FROM app.music_styles WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Location styles
  IF p_location_styles IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_location_styles LOOP
      INSERT INTO app.location_styles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_locations(country_event_id, location_style_id)
      SELECT v_country_event_id, id FROM app.location_styles WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Invitation channels
  IF p_invitation_channels IS NOT NULL THEN
    FOREACH v_txt IN ARRAY p_invitation_channels LOOP
      INSERT INTO app.inv_channels(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
      INSERT INTO app.country_event_inv_channels(country_event_id, inv_channel_id)
      SELECT v_country_event_id, id FROM app.inv_channels WHERE name = v_txt
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  -- Budget focus
  INSERT INTO app.country_event_budget_focus(
    country_event_id, catering, location, attire, photo_video, decor, entertainment, stationery_gifts
  ) VALUES (
    v_country_event_id, p_budget_catering, p_budget_location, p_budget_attire,
    p_budget_photo_video, p_budget_decor, p_budget_entertainment, p_budget_stationery_gifts
  )
  ON CONFLICT (country_event_id) DO UPDATE SET
    catering = EXCLUDED.catering,
    location = EXCLUDED.location,
    attire = EXCLUDED.attire,
    photo_video = EXCLUDED.photo_video,
    decor = EXCLUDED.decor,
    entertainment = EXCLUDED.entertainment,
    stationery_gifts = EXCLUDED.stationery_gifts;
END;
$$;

-- JSON importer (array of countries with event_types[] and traditions block)
CREATE OR REPLACE FUNCTION app.import_country_events_from_json(p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  rec_country JSONB;
  rec_event JSONB;
  v_country_id BIGINT;
  v_event_type_id BIGINT;
  v_country_event_id BIGINT;
  v_txt TEXT;
  i INT;
  v_step_id BIGINT;
  v_iso2 TEXT;
  v_country_name TEXT;
  v_language TEXT;
  v_event_slug TEXT;
  v_event_name TEXT;
  v_desc TEXT;
  v_duration INT;
  v_legal TEXT;
  v_registry TEXT;
  v_outfits INT;
  v_alcohol BOOLEAN;
  v_gender BOOLEAN;
  v_destination BOOLEAN;
  j_colors JSONB;
  j_ceremonies JSONB;
  j_rituals JSONB;
  j_roles JSONB;
  j_vendor_types JSONB;
  j_timeline JSONB;
  j_gifts JSONB;
  j_food JSONB;
  j_music JSONB;
  j_locations JSONB;
  j_inv_channels JSONB;
  j_budget JSONB;
BEGIN
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'array' THEN
    RAISE EXCEPTION 'Payload deve essere un array JSONB di paesi';
  END IF;

  FOR rec_country IN SELECT value FROM jsonb_array_elements(p_payload) LOOP
    v_iso2 := upper(rec_country->>'country_code');
    v_country_name := rec_country->>'country_name';
    v_language := COALESCE(rec_country->>'language', 'en');
    IF v_iso2 IS NULL OR v_country_name IS NULL THEN
      RAISE EXCEPTION 'country_code o country_name mancanti in: %', rec_country;
    END IF;

    INSERT INTO app.countries(iso2, name, language)
    VALUES (v_iso2, v_country_name, v_language)
    ON CONFLICT (iso2) DO UPDATE SET name = EXCLUDED.name, language = EXCLUDED.language
    RETURNING id INTO v_country_id;

    FOR rec_event IN SELECT value FROM jsonb_array_elements(COALESCE(rec_country->'event_types', '[]'::jsonb)) LOOP
      v_event_slug := rec_event->>'slug';
      v_event_name := rec_event->>'name';
      IF v_event_slug IS NULL THEN RAISE EXCEPTION 'slug evento mancante per country %', v_iso2; END IF;

      INSERT INTO app.event_types(slug, name)
      VALUES (v_event_slug, v_event_name)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id INTO v_event_type_id;

      v_desc := COALESCE(rec_event#>>'{traditions,description}', '');
      v_duration := NULLIF(rec_event#>>'{traditions,duration_days}', '')::INT;
      v_legal := COALESCE(rec_event#>>'{traditions,legal_requirements}', '');
      v_registry := COALESCE(rec_event#>>'{traditions,registry_style}', '');
      v_outfits := NULLIF(rec_event#>>'{traditions,outfits_count}', '')::INT;
      v_alcohol := (rec_event#>>'{traditions,alcohol_allowed_default}')::BOOLEAN;
      v_gender := (rec_event#>>'{traditions,gender_separation_possible}')::BOOLEAN;
      v_destination := (rec_event#>>'{traditions,destination_friendly}')::BOOLEAN;

      INSERT INTO app.country_events(
        country_id, event_type_id, description, duration_days, legal_requirements,
        registry_style, outfits_count, alcohol_allowed_default, gender_separation_possible,
        destination_friendly
      ) VALUES (
        v_country_id, v_event_type_id, v_desc, v_duration, v_legal,
        v_registry, v_outfits, v_alcohol, v_gender, v_destination
      )
      ON CONFLICT (country_id, event_type_id) DO UPDATE SET
        description = EXCLUDED.description,
        duration_days = EXCLUDED.duration_days,
        legal_requirements = EXCLUDED.legal_requirements,
        registry_style = EXCLUDED.registry_style,
        outfits_count = EXCLUDED.outfits_count,
        alcohol_allowed_default = EXCLUDED.alcohol_allowed_default,
        gender_separation_possible = EXCLUDED.gender_separation_possible,
        destination_friendly = EXCLUDED.destination_friendly
      RETURNING id INTO v_country_event_id;

      -- Clear relations
      DELETE FROM app.country_event_ceremonies WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_rituals   WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_roles     WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_vendors   WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_timeline  WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_music     WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_locations WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_inv_channels WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_gifts     WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_food      WHERE country_event_id = v_country_event_id;
      DELETE FROM app.country_event_colors    WHERE country_event_id = v_country_event_id;

      j_colors := rec_event#>'{traditions,main_colors}';
      IF j_colors IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_colors) LOOP
          INSERT INTO app.colors(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_colors(country_event_id, color_id)
          SELECT v_country_event_id, id FROM app.colors WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_ceremonies := rec_event#>'{traditions,ceremony_types}';
      IF j_ceremonies IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_ceremonies) LOOP
          INSERT INTO app.ceremony_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_ceremonies(country_event_id, ceremony_type_id)
          SELECT v_country_event_id, id FROM app.ceremony_types WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_rituals := rec_event#>'{traditions,rituals}';
      IF j_rituals IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_rituals) LOOP
          INSERT INTO app.rituals(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_rituals(country_event_id, ritual_id)
          SELECT v_country_event_id, id FROM app.rituals WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_roles := rec_event#>'{traditions,roles}';
      IF j_roles IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_roles) LOOP
          INSERT INTO app.roles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_roles(country_event_id, role_id)
          SELECT v_country_event_id, id FROM app.roles WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_vendor_types := rec_event#>'{traditions,vendor_types}';
      IF j_vendor_types IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_vendor_types) LOOP
          INSERT INTO app.vendor_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_vendors(country_event_id, vendor_type_id)
          SELECT v_country_event_id, id FROM app.vendor_types WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_timeline := rec_event#>'{traditions,timeline}';
      IF j_timeline IS NOT NULL THEN
        i := 0;
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_timeline) LOOP
          i := i + 1;
          INSERT INTO app.timeline_steps(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          SELECT id INTO v_step_id FROM app.timeline_steps WHERE name = v_txt;
          INSERT INTO app.country_event_timeline(country_event_id, step_id, ord)
          VALUES (v_country_event_id, v_step_id, i)
          ON CONFLICT (country_event_id, step_id) DO UPDATE SET ord = EXCLUDED.ord;
        END LOOP;
      END IF;

      j_gifts := rec_event#>'{traditions,gifts}';
      IF j_gifts IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_gifts) LOOP
          INSERT INTO app.gift_types(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_gifts(country_event_id, gift_type_id)
          SELECT v_country_event_id, id FROM app.gift_types WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_food := rec_event#>'{traditions,food_notes}';
      IF j_food IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_food) LOOP
          INSERT INTO app.food_notes(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_food(country_event_id, food_note_id)
          SELECT v_country_event_id, id FROM app.food_notes WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_music := rec_event#>'{traditions,music_styles}';
      IF j_music IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_music) LOOP
          INSERT INTO app.music_styles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_music(country_event_id, music_style_id)
          SELECT v_country_event_id, id FROM app.music_styles WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_locations := rec_event#>'{traditions,location_styles}';
      IF j_locations IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_locations) LOOP
          INSERT INTO app.location_styles(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_locations(country_event_id, location_style_id)
          SELECT v_country_event_id, id FROM app.location_styles WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      j_inv_channels := rec_event#>'{traditions,invitation_channel}';
      IF j_inv_channels IS NOT NULL THEN
        FOR v_txt IN SELECT value::TEXT FROM jsonb_array_elements_text(j_inv_channels) LOOP
          INSERT INTO app.inv_channels(name) VALUES (v_txt) ON CONFLICT (name) DO NOTHING;
          INSERT INTO app.country_event_inv_channels(country_event_id, inv_channel_id)
          SELECT v_country_event_id, id FROM app.inv_channels WHERE name = v_txt ON CONFLICT DO NOTHING;
        END LOOP;
      END IF;

      -- Budget block
      j_budget := rec_event#>'{traditions,budget_focus_pct}';
      IF j_budget IS NOT NULL THEN
        INSERT INTO app.country_event_budget_focus(
          country_event_id, catering, location, attire, photo_video, decor, entertainment, stationery_gifts
        ) VALUES (
          v_country_event_id,
          COALESCE((j_budget->>'catering')::NUMERIC, 0),
          COALESCE((j_budget->>'location')::NUMERIC, 0),
          COALESCE((j_budget->>'attire')::NUMERIC, 0),
          COALESCE((j_budget->>'photo_video')::NUMERIC, 0),
          COALESCE((j_budget->>'decor')::NUMERIC, 0),
          COALESCE((j_budget->>'entertainment')::NUMERIC, 0),
          COALESCE((j_budget->>'stationery_gifts')::NUMERIC, 0)
        )
        ON CONFLICT (country_event_id) DO UPDATE SET
          catering = EXCLUDED.catering,
          location = EXCLUDED.location,
          attire = EXCLUDED.attire,
          photo_video = EXCLUDED.photo_video,
          decor = EXCLUDED.decor,
          entertainment = EXCLUDED.entertainment,
          stationery_gifts = EXCLUDED.stationery_gifts;
      END IF;

    END LOOP; -- rec_event
  END LOOP; -- rec_country
END;
$$;

-- View for simplified UI consumption
CREATE OR REPLACE VIEW app.v_country_event_wedding AS
SELECT
  c.iso2,
  c.name AS country_name,
  et.slug AS event_slug,
  et.name AS event_name,
  ce.description,
  ce.duration_days,
  ce.legal_requirements,
  ce.registry_style,
  ce.outfits_count,
  ce.alcohol_allowed_default,
  ce.gender_separation_possible,
  ce.destination_friendly,
  (
    SELECT jsonb_agg(col.name ORDER BY col.name)
    FROM app.country_event_colors cec
    JOIN app.colors col ON col.id = cec.color_id
    WHERE cec.country_event_id = ce.id
  ) AS main_colors,
  (
    SELECT jsonb_agg(ct.name ORDER BY ct.name)
    FROM app.country_event_ceremonies cec
    JOIN app.ceremony_types ct ON ct.id = cec.ceremony_type_id
    WHERE cec.country_event_id = ce.id
  ) AS ceremony_types,
  (
    SELECT jsonb_agg(r.name ORDER BY r.name)
    FROM app.country_event_rituals cer
    JOIN app.rituals r ON r.id = cer.ritual_id
    WHERE cer.country_event_id = ce.id
  ) AS rituals,
  (
    SELECT jsonb_agg(ro.name ORDER BY ro.name)
    FROM app.country_event_roles cer
    JOIN app.roles ro ON ro.id = cer.role_id
    WHERE cer.country_event_id = ce.id
  ) AS roles,
  (
    SELECT jsonb_agg(vt.name ORDER BY vt.name)
    FROM app.country_event_vendors cev
    JOIN app.vendor_types vt ON vt.id = cev.vendor_type_id
    WHERE cev.country_event_id = ce.id
  ) AS vendor_types,
  (
    SELECT jsonb_agg(ts.name ORDER BY cet.ord)
    FROM app.country_event_timeline cet
    JOIN app.timeline_steps ts ON ts.id = cet.step_id
    WHERE cet.country_event_id = ce.id
  ) AS timeline,
  (
    SELECT jsonb_agg(g.name ORDER BY g.name)
    FROM app.country_event_gifts cg
    JOIN app.gift_types g ON g.id = cg.gift_type_id
    WHERE cg.country_event_id = ce.id
  ) AS gifts,
  (
    SELECT jsonb_agg(f.name ORDER BY f.name)
    FROM app.country_event_food cf
    JOIN app.food_notes f ON f.id = cf.food_note_id
    WHERE cf.country_event_id = ce.id
  ) AS food_notes,
  (
    SELECT jsonb_agg(ms.name ORDER BY ms.name)
    FROM app.country_event_music cm
    JOIN app.music_styles ms ON ms.id = cm.music_style_id
    WHERE cm.country_event_id = ce.id
  ) AS music_styles,
  (
    SELECT jsonb_agg(ls.name ORDER BY ls.name)
    FROM app.country_event_locations cl
    JOIN app.location_styles ls ON ls.id = cl.location_style_id
    WHERE cl.country_event_id = ce.id
  ) AS location_styles,
  (
    SELECT jsonb_agg(ic.name ORDER BY ic.name)
    FROM app.country_event_inv_channels cic
    JOIN app.inv_channels ic ON ic.id = cic.inv_channel_id
    WHERE cic.country_event_id = ce.id
  ) AS invitation_channel,
  (
    SELECT to_jsonb(b.*) - 'country_event_id'
    FROM app.country_event_budget_focus b
    WHERE b.country_event_id = ce.id
  ) AS budget_focus_pct
FROM app.country_events ce
JOIN app.countries c ON c.id = ce.country_id
JOIN app.event_types et ON et.id = ce.event_type_id;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_app_countries_iso2 ON app.countries(iso2);
CREATE INDEX IF NOT EXISTS idx_app_event_types_slug ON app.event_types(slug);
CREATE INDEX IF NOT EXISTS idx_app_country_events_country ON app.country_events(country_id);
CREATE INDEX IF NOT EXISTS idx_app_country_events_event ON app.country_events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_app_timeline_ord ON app.country_event_timeline(country_event_id, ord);

-- =====================================================
-- PATCH 15: Seeds – 5 countries for Wedding (idempotent upsert)
-- =====================================================

-- ITALIA
SELECT app.upsert_country_event_wedding(
  'IT','Italia','it',
  'matrimonio','Matrimonio',
  'Rito civile o cattolico, ricevimento conviviale, confetti e bomboniere.',
  ARRAY['bianco','verde salvia','oro tenue'],
  1,
  ARRAY['civile','religiosa','simbolica'],
  ARRAY['Scambio anelli','Lancio del riso','Taglio torta'],
  ARRAY['Sposo','Sposa','Testimoni','Genitori','Amici'],
  ARRAY['Fiorista','Fotografo','Catering','Wedding planner','Band/DJ','Auto d''epoca'],
  ARRAY['Pubblicazioni','Cerimonia','Aperitivo','Cena','Torta'],
  'Pubblicazioni civili presso il Comune; atto di matrimonio.',
  ARRAY['Busta','Lista nozze'],
  ARRAY['Cucina mediterranea','vino','dolci tipici'],
  ARRAY['Band dal vivo','DJ','Coro liturgico'],
  ARRAY['Chiesa','Municipio','Villa','Tenuta'],
  ARRAY['Cartaceo + QR','WhatsApp'],
  'Lista nozze / busta',
  TRUE,FALSE,TRUE,1,
  40,20,12,10,10,5,3
);

-- MESSICO
SELECT app.upsert_country_event_wedding(
  'MX','Messico','es',
  'matrimonio','Boda',
  'Forte tradizione cattolica; lazo e arras; mariachi e festa lunga.',
  ARRAY['bianco','colori vivaci','oro'],
  1,
  ARRAY['civile','religiosa','simbolica'],
  ARRAY['Lazo','Arras (13 monete)','Callejoneada'],
  ARRAY['Novio','Novia','Padrinos'],
  ARRAY['Mariachi','Catering','Fotografo','DJ/Band'],
  ARRAY['Cerimonia','Fiesta','Baile'],
  'Atto civile; talvolta separato dal rito religioso.',
  ARRAY['Regali','Busta'],
  ARRAY['Cucina messicana','tequila bar'],
  ARRAY['Mariachi','DJ'],
  ARRAY['Chiesa','Hacienda','Spiaggia'],
  ARRAY['Cartaceo','WhatsApp'],
  'Lista/denaro',
  TRUE,FALSE,TRUE,1,
  35,22,8,10,10,10,5
);

-- STATI UNITI
SELECT app.upsert_country_event_wedding(
  'US','Stati Uniti','en',
  'matrimonio','Wedding',
  'Cerimonia con officiant, bridal party, rehearsal dinner e after party.',
  ARRAY['ivory','blush','black tie'],
  2,
  ARRAY['civile','religiosa','simbolica'],
  ARRAY['Rehearsal dinner','First look','First dance'],
  ARRAY['Bride','Groom','Maid of honor','Best man','Bridal party'],
  ARRAY['Planner','Caterer','Photographer','Videographer','Band/DJ','Photobooth'],
  ARRAY['Rehearsal','Ceremony','Cocktail hour','Reception','After-party'],
  'Marriage license per contea; officiant registrato.',
  ARRAY['Registry','Cash fund (honeymoon)'],
  ARRAY['Open bar','cocktail hour'],
  ARRAY['Band','DJ'],
  ARRAY['Barn','Hotel ballroom','Vineyard'],
  ARRAY['Wedding website + RSVP','Email'],
  'Registry / cash fund',
  TRUE,FALSE,TRUE,1,
  32,28,8,12,10,7,3
);

-- INDIA
SELECT app.upsert_country_event_wedding(
  'IN','India','en',
  'matrimonio','Wedding (Hindu/Sikh/Muslim/Christian)',
  'Eventi multipli: Mehndi, Sangeet, Baraat, Pheras o Nikah/Walima.',
  ARRAY['rosso','oro','verde'],
  3,
  ARRAY['religiosa','civile','simbolica'],
  ARRAY['Mehndi','Sangeet','Baraat','Pheras','Vidaai'],
  ARRAY['Famiglie allargate','Pandit/Imam/Priest'],
  ARRAY['Mehndi artist','Dhol','Decorator','Caterer','Photographer'],
  ARRAY['Riti pre-matrimonio','Cerimonia','Ricevimento'],
  'Marriage Act locale; registrazione civile.',
  ARRAY['Doni famiglia','Busta'],
  ARRAY['Vegetariano/Jain','speziato','talvolta no alcol'],
  ARRAY['DJ Bollywood','Dhol'],
  ARRAY['Hotel','Palace','Mandap'],
  ARRAY['Cartaceo + WhatsApp','Sito'],
  'Cash/gifts',
  FALSE,TRUE,TRUE,3,
  25,18,18,10,17,7,5
);

-- GIAPPONE
SELECT app.upsert_country_event_wedding(
  'JP','Giappone','ja',
  'matrimonio','結婚式',
  'Cerimonia shinto (san-san-kudo) o civile in hotel; grande formalità.',
  ARRAY['bianco','rosso','oro'],
  1,
  ARRAY['shinto','civile','simbolica'],
  ARRAY['San-san-kudo','Tea greeting','Goshugi-bukuro'],
  ARRAY['Coppia','Famiglie','Shinto priest'],
  ARRAY['Kimono dresser','Taiko','Photographer','Hotel coordinator'],
  ARRAY['Cerimonia','Ricevimento (kaiseki)','Saluto genitori'],
  'Registrazione municipale (kon''in todoke).',
  ARRAY['Buste (goshugi)'],
  ARRAY['Kaiseki','sake'],
  ARRAY['Taiko','Quartetto','DJ'],
  ARRAY['Santuario','Hotel','Sala da tè'],
  ARRAY['Cartaceo','Line/QR'],
  'Cash gift',

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
  TRUE,FALSE,TRUE,2,
  26,24,16,12,10,5,7
);

