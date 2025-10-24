-- Tabella per atelier sposa e sposo
CREATE TABLE IF NOT EXISTS public.atelier (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sposa', 'sposo')),
  region TEXT NOT NULL,
  province TEXT,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  price_range TEXT CHECK (price_range IN ('€', '€€', '€€€', '€€€€')),
  styles TEXT[], -- array di stili: ['Classico', 'Moderno', 'Romantico', etc.]
  capacity INTEGER,
  services TEXT[], -- array di servizi offerti
  verified BOOLEAN DEFAULT false,
  source TEXT, -- 'manual', 'google', 'website_scrape', etc.
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_atelier_category ON public.atelier(category);
CREATE INDEX IF NOT EXISTS idx_atelier_region ON public.atelier(region);
CREATE INDEX IF NOT EXISTS idx_atelier_province ON public.atelier(province);
CREATE INDEX IF NOT EXISTS idx_atelier_city ON public.atelier(city);
CREATE INDEX IF NOT EXISTS idx_atelier_verified ON public.atelier(verified);

-- RLS (Row Level Security)
ALTER TABLE public.atelier ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica
CREATE POLICY "Allow public read access to atelier"
  ON public.atelier
  FOR SELECT
  USING (true);

-- Policy per inserimento autenticato
CREATE POLICY "Allow authenticated users to insert atelier"
  ON public.atelier
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy per aggiornamento autenticato
CREATE POLICY "Allow authenticated users to update atelier"
  ON public.atelier
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Commenti
COMMENT ON TABLE public.atelier IS 'Atelier per abiti da sposa e sposo';
COMMENT ON COLUMN public.atelier.category IS 'Categoria: sposa o sposo';
COMMENT ON COLUMN public.atelier.styles IS 'Stili offerti: Classico, Moderno, Romantico, Boho, Vintage, etc.';
COMMENT ON COLUMN public.atelier.services IS 'Servizi: Sartoria, Noleggio, Accessori, Modifiche, etc.';
