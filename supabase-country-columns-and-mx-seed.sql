-- Add country columns if they don't exist and seed minimal MX dataset

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='locations' AND column_name='country'
  ) THEN
    ALTER TABLE public.locations ADD COLUMN country TEXT DEFAULT 'it';
    CREATE INDEX IF NOT EXISTS idx_locations_country ON public.locations(country);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='churches' AND column_name='country'
  ) THEN
    ALTER TABLE public.churches ADD COLUMN country TEXT DEFAULT 'it';
    CREATE INDEX IF NOT EXISTS idx_churches_country ON public.churches(country);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='suppliers' AND column_name='country'
  ) THEN
    ALTER TABLE public.suppliers ADD COLUMN country TEXT DEFAULT 'it';
    CREATE INDEX IF NOT EXISTS idx_suppliers_country ON public.suppliers(country);
  END IF;
END $$;

-- Optional category-specific tables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='atelier') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='atelier' AND column_name='country'
    ) THEN
      ALTER TABLE public.atelier ADD COLUMN country TEXT DEFAULT 'it';
      CREATE INDEX IF NOT EXISTS idx_atelier_country ON public.atelier(country);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='musica_cerimonia') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='musica_cerimonia' AND column_name='country'
    ) THEN
      ALTER TABLE public.musica_cerimonia ADD COLUMN country TEXT DEFAULT 'it';
      CREATE INDEX IF NOT EXISTS idx_musica_cerimonia_country ON public.musica_cerimonia(country);
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='musica_ricevimento') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='musica_ricevimento' AND column_name='country'
    ) THEN
      ALTER TABLE public.musica_ricevimento ADD COLUMN country TEXT DEFAULT 'it';
      CREATE INDEX IF NOT EXISTS idx_musica_ricevimento_country ON public.musica_ricevimento(country);
    END IF;
  END IF;
END $$;

-- Minimal seed for Mexico (MX) to verify separation by country
INSERT INTO public.locations (name, region, province, city, address, description, verified, country)
VALUES
  ('Hacienda San Ángel', 'Jalisco', 'Puerto Vallarta', 'Puerto Vallarta', 'Centro', 'Hacienda per matrimoni con vista sulla baia', true, 'mx')
ON CONFLICT DO NOTHING;

INSERT INTO public.churches (name, region, province, city, address, description, verified, country)
VALUES
  ('Parroquia de San Miguel Arcángel', 'Guanajuato', 'San Miguel de Allende', 'San Miguel de Allende', NULL, 'Iconica chiesa neogotica', true, 'mx')
ON CONFLICT DO NOTHING;

INSERT INTO public.suppliers (name, category, region, province, city, description, verified, subscription_tier, subscription_expires_at, country)
VALUES
  ('Mariachi Los Reyes', 'Musica Ricevimento', 'Jalisco', 'Guadalajara', 'Guadalajara', 'Mariachi tradizionale per matrimoni', true, 'premium_plus', NOW() + INTERVAL '180 days', 'mx'),
  ('Flores Azteca', 'Fiorai', 'CDMX', 'Ciudad de México', 'Ciudad de México', 'Fiorista per matrimoni', true, 'premium_plus', NOW() + INTERVAL '180 days', 'mx')
ON CONFLICT DO NOTHING;

-- Category tables if present
INSERT INTO public.musica_cerimonia (name, region, province, city, description, status, verified, country)
SELECT 'Coro Catedral', 'CDMX', 'Ciudad de México', 'Ciudad de México', 'Coro per cerimonie religiose', 'approved', true, 'mx'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='musica_cerimonia');

INSERT INTO public.musica_ricevimento (name, region, province, city, description, status, verified, country)
SELECT 'DJ Playa', 'Quintana Roo', 'Cancún', 'Cancún', 'DJ per ricevimenti in spiaggia', 'approved', true, 'mx'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='musica_ricevimento');

INSERT INTO public.atelier (name, category, region, province, city, description, price_range, verified, country)
SELECT 'Atelier Frida', 'sposa', 'CDMX', 'Ciudad de México', 'Ciudad de México', 'Abiti da sposa artigianali', '€€', true, 'mx'
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='atelier');

