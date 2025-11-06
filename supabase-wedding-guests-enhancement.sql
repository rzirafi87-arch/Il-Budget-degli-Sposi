-- =====================================================
-- WEDDING GUESTS ENHANCEMENT
-- =====================================================
-- Gestione completa degli invitati con:
-- - Assegnazione tavoli
-- - Preferenze alimentari
-- - Tracking +1/bambini
-- - RSVP status
-- - Gruppi/famiglie
-- =====================================================

-- Drop existing table if needed (dev only - comment out in production)
-- DROP TABLE IF EXISTS wedding_guests CASCADE;

-- Create or enhance wedding_guests table
CREATE TABLE IF NOT EXISTS wedding_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Invitation details
  invitation_sent BOOLEAN DEFAULT FALSE,
  invitation_sent_date DATE,
  rsvp_status TEXT CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'tentative')) DEFAULT 'pending',
  rsvp_date TIMESTAMP WITH TIME ZONE,

  -- Guest details
  side TEXT CHECK (side IN ('bride', 'groom', 'common')) DEFAULT 'common',
  relationship TEXT, -- Friend, Family, Colleague, etc.
  age_group TEXT CHECK (age_group IN ('adult', 'child', 'infant')) DEFAULT 'adult',

  -- Plus one tracking
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  plus_one_confirmed BOOLEAN DEFAULT FALSE,

  -- Dietary preferences
  dietary_restrictions TEXT[], -- ['vegetarian', 'vegan', 'gluten_free', 'lactose_free', 'halal', 'kosher', 'other']
  allergies TEXT,
  special_requests TEXT,

  -- Table assignment
  table_number INTEGER,
  table_name TEXT, -- Optional: "Famiglia", "Amici Università", etc.
  seating_priority INTEGER DEFAULT 0, -- Higher priority = assign first

  -- Group/Family
  family_group_id UUID, -- Links family members together
  is_group_leader BOOLEAN DEFAULT FALSE,

  -- Ceremony attendance
  attending_ceremony BOOLEAN DEFAULT TRUE,
  attending_reception BOOLEAN DEFAULT TRUE,

  -- Additional info
  notes TEXT,
  gift_received BOOLEAN DEFAULT FALSE,
  thank_you_sent BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_guests_event_id ON wedding_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_rsvp_status ON wedding_guests(rsvp_status);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_table_number ON wedding_guests(table_number);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_family_group ON wedding_guests(family_group_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_side ON wedding_guests(side);

-- Full text search index for names
CREATE INDEX IF NOT EXISTS idx_wedding_guests_name_search
ON wedding_guests USING gin(to_tsvector('simple', first_name || ' ' || last_name));

-- RLS Policies
ALTER TABLE wedding_guests ENABLE ROW LEVEL SECURITY;

-- Users can view guests for their own events
CREATE POLICY IF NOT EXISTS "Users can view own event guests"
  ON wedding_guests FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Users can insert guests for their own events
CREATE POLICY IF NOT EXISTS "Users can insert own event guests"
  ON wedding_guests FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Users can update guests for their own events
CREATE POLICY IF NOT EXISTS "Users can update own event guests"
  ON wedding_guests FOR UPDATE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Users can delete guests for their own events
CREATE POLICY IF NOT EXISTS "Users can delete own event guests"
  ON wedding_guests FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM events WHERE owner_id = auth.uid()
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wedding_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wedding_guests_updated_at ON wedding_guests;
CREATE TRIGGER wedding_guests_updated_at
  BEFORE UPDATE ON wedding_guests
  FOR EACH ROW
  EXECUTE FUNCTION update_wedding_guests_updated_at();

-- Helper view for guest statistics
CREATE OR REPLACE VIEW wedding_guest_stats AS
SELECT
  event_id,
  COUNT(*) as total_guests,
  COUNT(*) FILTER (WHERE rsvp_status = 'confirmed') as confirmed_guests,
  COUNT(*) FILTER (WHERE rsvp_status = 'declined') as declined_guests,
  COUNT(*) FILTER (WHERE rsvp_status = 'pending') as pending_guests,
  COUNT(*) FILTER (WHERE plus_one_allowed) as plus_ones_allowed,
  COUNT(*) FILTER (WHERE plus_one_confirmed) as plus_ones_confirmed,
  COUNT(*) FILTER (WHERE table_number IS NOT NULL) as guests_assigned_to_table,
  COUNT(DISTINCT table_number) as tables_used,
  COUNT(*) FILTER (WHERE side = 'bride') as bride_side,
  COUNT(*) FILTER (WHERE side = 'groom') as groom_side,
  COUNT(*) FILTER (WHERE side = 'common') as common_side
FROM wedding_guests
GROUP BY event_id;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Wedding guests table created/enhanced successfully';
  RAISE NOTICE '   - Full guest management with RSVP tracking';
  RAISE NOTICE '   - Table assignment and seating system';
  RAISE NOTICE '   - Dietary restrictions and allergies';
  RAISE NOTICE '   - Plus one tracking';
  RAISE NOTICE '   - Family grouping';
  RAISE NOTICE '   - Helper view wedding_guest_stats created';
END $$;
