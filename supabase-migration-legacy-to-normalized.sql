-- =========================================
-- MIGRATION: Legacy to Normalized Schema
-- Converts existing suppliers/locations/churches to new vendors schema
-- =========================================

-- ===================
-- STEP 1: Migrate Locations → Vendors
-- ===================

DO $$
DECLARE
  loc RECORD;
  vendor_id UUID;
  place_id UUID;
BEGIN
  RAISE NOTICE 'Starting location migration...';
  
  FOR loc IN SELECT * FROM locations LOOP
    -- Create vendor (without coordinates - will need geocoding later)
    vendor_id := upsert_vendor(
      p_name => loc.name,
      p_type => 'location',
      p_source => 'manual',
      p_source_id => 'legacy:location:' || loc.id,
      p_phone => loc.phone,
      p_email => loc.email,
      p_website => loc.website,
      p_description => loc.description,
      p_metadata => jsonb_build_object(
        'capacity_min', loc.capacity_min,
        'capacity_max', loc.capacity_max,
        'location_type', loc.location_type,
        'price_range', loc.price_range,
        'legacy_id', loc.id,
        'verified', loc.verified,
        'needs_geocoding', true
      ),
      -- Dummy coordinates (will be updated by geocoding later)
      p_lat => 0.0,
      p_lng => 0.0,
      p_address => loc.address,
      p_city => loc.city,
      p_province => loc.province,
      p_region => loc.region
    );
    
  END LOOP;
  
  RAISE NOTICE 'Location migration complete.';
END $$;

-- ===================
-- STEP 2: Migrate Churches → Vendors
-- ===================

DO $$
DECLARE
  church RECORD;
  vendor_id UUID;
  place_id UUID;
BEGIN
  RAISE NOTICE 'Starting church migration...';
  
  FOR church IN SELECT * FROM churches LOOP
    vendor_id := upsert_vendor(
      p_name => church.name,
      p_type => 'church',
      p_source => 'manual',
      p_source_id => 'legacy:church:' || church.id,
      p_phone => church.phone,
      p_email => church.email,
      p_website => church.website,
      p_description => church.description,
      p_metadata => jsonb_build_object(
        'capacity', church.capacity,
        'legacy_id', church.id,
        'verified', church.verified,
        'needs_geocoding', true
      ),
      -- Dummy coordinates (will be updated by geocoding later)
      p_lat => 0.0,
      p_lng => 0.0,
      p_address => church.address,
      p_city => church.city,
      p_province => church.province,
      p_region => church.region
    );
  END LOOP;
  
  RAISE NOTICE 'Church migration complete.';
END $$;

-- ===================
-- STEP 3: Migrate Suppliers → Vendors
-- ===================

DO $$
DECLARE
  supplier RECORD;
  vendor_id UUID;
  vendor_type TEXT;
BEGIN
  RAISE NOTICE 'Starting supplier migration...';
  
  FOR supplier IN SELECT * FROM suppliers LOOP
    -- Map legacy category to vendor type
    vendor_type := CASE 
      WHEN supplier.category IN ('Ricevimento Location', 'Location & Catering') THEN 'location'
      WHEN supplier.category = 'Cerimonia/Chiesa Location' THEN 'church'
      WHEN supplier.category LIKE '%Fotograf%' THEN 'photographer'
      WHEN supplier.category LIKE '%Video%' THEN 'videographer'
      WHEN supplier.category LIKE '%Fior%' THEN 'florist'
      WHEN supplier.category LIKE '%Catering%' THEN 'caterer'
      WHEN supplier.category LIKE '%Musica%' THEN 'band'
      WHEN supplier.category LIKE '%DJ%' THEN 'dj'
      WHEN supplier.category LIKE '%Planner%' THEN 'planner'
      ELSE 'location' -- Default fallback
    END;
    
    vendor_id := upsert_vendor(
      p_name => supplier.name,
      p_type => vendor_type,
      p_source => 'manual',
      p_source_id => 'legacy:supplier:' || supplier.id,
      p_phone => supplier.phone,
      p_email => supplier.email,
      p_website => supplier.website,
      p_description => supplier.description,
      p_metadata => jsonb_build_object(
        'category', supplier.category,
        'legacy_id', supplier.id,
        'verified', supplier.verified,
        'needs_geocoding', true
      ),
      -- Dummy coordinates (will be updated by geocoding later)
      p_lat => 0.0,
      p_lng => 0.0,
      p_address => supplier.address,
      p_city => supplier.city,
      p_province => supplier.province,
      p_region => supplier.region
    );
  END LOOP;
  
  RAISE NOTICE 'Supplier migration complete.';
END $$;

-- ===================
-- STEP 4: Verification & Stats
-- ===================

-- Count migrated vendors
SELECT 
  source,
  type,
  COUNT(*) as count
FROM vendors
GROUP BY source, type
ORDER BY source, count DESC;

-- Check for vendors without places
SELECT COUNT(*) as vendors_without_places
FROM vendors v
LEFT JOIN vendor_places vp ON v.id = vp.vendor_id
WHERE vp.place_id IS NULL;

-- Top regions by vendor count
SELECT 
  region,
  COUNT(*) as vendor_count
FROM vendors_with_places
GROUP BY region
ORDER BY vendor_count DESC
LIMIT 10;

-- ===================
-- STEP 5: Optional - Rename Legacy Tables
-- ===================

-- Uncomment if you want to keep legacy tables as backup
-- ALTER TABLE locations RENAME TO locations_legacy;
-- ALTER TABLE churches RENAME TO churches_legacy;
-- ALTER TABLE suppliers RENAME TO suppliers_legacy;

-- OR drop them if migration is successful
-- DROP TABLE IF EXISTS locations CASCADE;
-- DROP TABLE IF EXISTS churches CASCADE;
-- DROP TABLE IF EXISTS suppliers CASCADE;

-- Migration complete! Review the stats above.
