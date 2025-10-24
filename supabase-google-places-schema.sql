-- =========================================
-- DATABASE SCHEMA UPDATE FOR GOOGLE PLACES
-- =========================================
-- Aggiungi colonne per i dati provenienti da Google Places API

-- Aggiungi colonne alla tabella locations
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS google_rating_count INTEGER,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Crea indice per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_locations_google_place_id ON locations(google_place_id);
CREATE INDEX IF NOT EXISTS idx_locations_verified ON locations(verified);
CREATE INDEX IF NOT EXISTS idx_locations_region_city ON locations(region, city);

-- Commento sulle colonne
COMMENT ON COLUMN locations.google_place_id IS 'ID univoco da Google Places API';
COMMENT ON COLUMN locations.google_rating IS 'Rating Google (1.0-5.0)';
COMMENT ON COLUMN locations.google_rating_count IS 'Numero di recensioni Google';
COMMENT ON COLUMN locations.last_synced_at IS 'Ultima sincronizzazione con Google Places';

-- Aggiungi constraint per il rating (deve essere tra 1.0 e 5.0)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_google_rating' AND conrelid = 'locations'::regclass
    ) THEN
        ALTER TABLE locations 
        ADD CONSTRAINT check_google_rating 
        CHECK (google_rating IS NULL OR (google_rating >= 1.0 AND google_rating <= 5.0));
    END IF;
END $$;

-- Aggiungi lo stesso supporto per suppliers
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS google_rating_count INTEGER,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_suppliers_google_place_id ON suppliers(google_place_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_supplier_google_rating' AND conrelid = 'suppliers'::regclass
    ) THEN
        ALTER TABLE suppliers 
        ADD CONSTRAINT check_supplier_google_rating 
        CHECK (google_rating IS NULL OR (google_rating >= 1.0 AND google_rating <= 5.0));
    END IF;
END $$;

-- Aggiungi lo stesso supporto per churches
ALTER TABLE churches 
ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS google_rating NUMERIC(2,1),
ADD COLUMN IF NOT EXISTS google_rating_count INTEGER,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_churches_google_place_id ON churches(google_place_id);

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_church_google_rating' AND conrelid = 'churches'::regclass
    ) THEN
        ALTER TABLE churches 
        ADD CONSTRAINT check_church_google_rating 
        CHECK (google_rating IS NULL OR (google_rating >= 1.0 AND google_rating <= 5.0));
    END IF;
END $$;

-- Vista per location con rating alto
CREATE OR REPLACE VIEW high_rated_locations AS
SELECT 
    id,
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
ORDER BY google_rating DESC, google_rating_count DESC;

-- Vista per statistiche per regione
CREATE OR REPLACE VIEW location_stats_by_region AS
SELECT 
    region,
    COUNT(*) as total_locations,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified_count,
    AVG(google_rating) as avg_rating,
    SUM(google_rating_count) as total_reviews
FROM locations
WHERE google_rating IS NOT NULL
GROUP BY region
ORDER BY total_locations DESC;
