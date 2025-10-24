-- =========================================
-- NORMALIZED VENDOR SCHEMA
-- Multi-source wedding vendor database (Google, OSM, Wikidata)
-- =========================================

-- ===================
-- CORE TABLES
-- ===================

-- Vendors (fornitori normalizzati)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('location', 'church', 'band', 'dj', 'planner', 'photographer', 'videographer', 'florist', 'caterer')),
  phone TEXT, -- E.164 format: +39xxxxxxxxxx
  email TEXT,
  website TEXT, -- Always https://
  price_range TEXT CHECK (price_range IN ('€', '€€', '€€€', '€€€€')),
  rating NUMERIC(2,1) CHECK (rating >= 1.0 AND rating <= 5.0),
  rating_count INTEGER DEFAULT 0,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  source TEXT NOT NULL CHECK (source IN ('google', 'osm', 'wikidata', 'manual')),
  source_id TEXT, -- google_place_id, osm_id, wikidata_qid
  metadata JSONB, -- Additional source-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  CONSTRAINT vendors_source_id_unique UNIQUE (source_id)
);

-- Places (luoghi geografici normalizzati)
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT UNIQUE,
  osm_id TEXT UNIQUE,
  wikidata_qid TEXT UNIQUE,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'IT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-Many relationship (un vendor può avere più sedi)
CREATE TABLE IF NOT EXISTS vendor_places (
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (vendor_id, place_id)
);

-- Sync jobs tracking (per gestire aggiornamenti incrementali)
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL CHECK (source IN ('google', 'osm', 'wikidata')),
  type TEXT NOT NULL,
  region TEXT,
  province TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- INDEXES
-- ===================

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(type);
CREATE INDEX IF NOT EXISTS idx_vendors_source ON vendors(source);
CREATE INDEX IF NOT EXISTS idx_vendors_source_id ON vendors(source_id);
CREATE INDEX IF NOT EXISTS idx_vendors_verified ON vendors(verified);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC) WHERE rating IS NOT NULL;

-- Places indexes
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_province ON places(province);
CREATE INDEX IF NOT EXISTS idx_places_region ON places(region);
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIST (point(lng, lat));
CREATE INDEX IF NOT EXISTS idx_places_google_id ON places(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_places_osm_id ON places(osm_id) WHERE osm_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_places_wikidata_id ON places(wikidata_qid) WHERE wikidata_qid IS NOT NULL;

-- Vendor places indexes
CREATE INDEX IF NOT EXISTS idx_vendor_places_vendor ON vendor_places(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_places_place ON vendor_places(place_id);
CREATE INDEX IF NOT EXISTS idx_vendor_places_primary ON vendor_places(vendor_id) WHERE is_primary = true;

-- Sync jobs indexes
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_source_type ON sync_jobs(source, type);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_created ON sync_jobs(created_at DESC);

-- ===================
-- FUNCTIONS
-- ===================

-- Normalize phone to E.164 format
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Normalize URL to always use https
CREATE OR REPLACE FUNCTION normalize_url(url_input TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Deduplicate place by priority: google > osm > wikidata
CREATE OR REPLACE FUNCTION find_or_create_place(
  p_google_place_id TEXT,
  p_osm_id TEXT,
  p_wikidata_qid TEXT,
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_address TEXT,
  p_city TEXT,
  p_province TEXT,
  p_region TEXT,
  p_postal_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

-- Upsert vendor with place
CREATE OR REPLACE FUNCTION upsert_vendor(
  p_name TEXT,
  p_type TEXT,
  p_source TEXT,
  p_source_id TEXT,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_rating NUMERIC DEFAULT NULL,
  p_rating_count INTEGER DEFAULT 0,
  p_description TEXT DEFAULT NULL,
  p_price_range TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  -- Place data
  p_google_place_id TEXT DEFAULT NULL,
  p_osm_id TEXT DEFAULT NULL,
  p_wikidata_qid TEXT DEFAULT NULL,
  p_lat NUMERIC DEFAULT NULL,
  p_lng NUMERIC DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql;

-- ===================
-- VIEWS
-- ===================

-- Complete vendor view with primary place
CREATE OR REPLACE VIEW vendors_with_places AS
SELECT 
  v.*,
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
LEFT JOIN places p ON vp.place_id = p.id;

-- High-rated vendors by region
CREATE OR REPLACE VIEW top_vendors_by_region AS
SELECT 
  region,
  type,
  COUNT(*) as vendor_count,
  ROUND(AVG(rating), 2) as avg_rating,
  SUM(rating_count) as total_reviews
FROM vendors_with_places
WHERE verified = true
GROUP BY region, type
ORDER BY region, vendor_count DESC;

-- Sync statistics
CREATE OR REPLACE VIEW sync_stats AS
SELECT 
  source,
  type,
  COUNT(*) as total_syncs,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  MAX(completed_at) as last_sync,
  SUM(results_count) as total_results
FROM sync_jobs
GROUP BY source, type;

-- ===================
-- TRIGGERS
-- ===================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS vendors_updated_at ON vendors;
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS places_updated_at ON places;
CREATE TRIGGER places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===================
-- COMMENTS
-- ===================

COMMENT ON TABLE vendors IS 'Normalized wedding vendors from multiple sources (Google, OSM, Wikidata)';
COMMENT ON TABLE places IS 'Geographic locations with deduplication by source IDs';
COMMENT ON TABLE vendor_places IS 'Many-to-many relationship between vendors and their locations';
COMMENT ON TABLE sync_jobs IS 'Tracking table for scheduled sync operations';

COMMENT ON COLUMN vendors.source IS 'Data source: google (Places API), osm (OpenStreetMap), wikidata, manual';
COMMENT ON COLUMN vendors.source_id IS 'Unique ID from source (google_place_id, osm:node/12345, Q12345)';
COMMENT ON COLUMN vendors.phone IS 'Phone in E.164 format (+39xxxxxxxxxx)';
COMMENT ON COLUMN vendors.website IS 'Website URL (always https://)';
COMMENT ON COLUMN vendors.price_range IS 'Price indicator: € (budget), €€ (moderate), €€€ (expensive), €€€€ (luxury)';
COMMENT ON COLUMN vendors.metadata IS 'Source-specific additional data (opening_hours, photos, etc.)';

COMMENT ON COLUMN places.google_place_id IS 'Google Places API unique identifier';
COMMENT ON COLUMN places.osm_id IS 'OpenStreetMap ID (node/way/relation)';
COMMENT ON COLUMN places.wikidata_qid IS 'Wikidata Q identifier';
