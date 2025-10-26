-- ============================================================
-- SUBSCRIPTION PACKAGES SYSTEM
-- Adds tiered subscription model for suppliers
-- ============================================================

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
  payment_provider TEXT, -- 'stripe', 'paypal', etc.
  payment_id TEXT, -- External payment ID
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

-- Insert default package pricing (prezzi competitivi vs Matrimonio.com)
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
    "Badge \"Fornitore Certificato\""
  ]'::jsonb, 2),

('premium', 'Premium', 'Massima visibilità nel portale', 69.90, 699.00,
  '[
    "Tutto di Base, più:",
    "Appare nella pagina hub Fornitori",
    "Posizione prioritaria nei risultati",
    "Galleria fino a 10 foto",
    "Statistiche visualizzazioni profilo",
    "Badge \"Fornitore Premium\""
  ]'::jsonb, 3),

('premium_plus', 'Premium Plus', 'Visibilità garantita anche in Demo', 129.90, 1299.00,
  '[
    "Tutto di Premium, più:",
    "Appare nella Demo per utenti non registrati",
    "Posizione TOP nei risultati di ricerca",
    "Galleria illimitata",
    "Link diretto al sito web evidenziato",
    "Supporto dedicato",
    "Badge \"Partner Ufficiale\"",
    "Analytics avanzate"
  ]'::jsonb, 4)
ON CONFLICT (tier) DO NOTHING;

-- Create index for faster queries
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

CREATE POLICY "Users can view own transactions via supplier" ON public.subscription_transactions 
FOR SELECT 
USING (
  supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()) OR
  location_id IN (SELECT id FROM public.locations WHERE user_id = auth.uid()) OR
  church_id IN (SELECT id FROM public.churches WHERE user_id = auth.uid())
);

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.is_subscription_active(
  p_subscription_tier TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
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
$$;

COMMENT ON TABLE public.subscription_packages IS 'Defines the available subscription tiers for suppliers/locations/churches';
COMMENT ON TABLE public.subscription_transactions IS 'Tracks all subscription purchases and renewals';
COMMENT ON FUNCTION public.is_subscription_active IS 'Checks if a subscription tier is currently active based on expiry date';
COMMENT ON FUNCTION public.get_visible_suppliers IS 'Returns suppliers filtered by subscription tier visibility rules';
