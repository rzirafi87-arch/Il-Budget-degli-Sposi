-- =====================================================
-- GIFT LIST TABLE
-- =====================================================
-- Tabella per gestire la lista regalo degli eventi
-- Supporta vari tipi: viaggio, casa, esperienza, charity
-- =====================================================

-- Drop existing if needed (dev only)
DROP TABLE IF EXISTS gift_list CASCADE;

-- Create gift_list table
CREATE TABLE gift_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gift details
  type TEXT NOT NULL CHECK (type IN ('viaggio', 'casa', 'esperienza', 'charity', 'altro')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  url TEXT,
  
  -- Priority and status
  priority TEXT CHECK (priority IN ('alta', 'media', 'bassa')) DEFAULT 'media',
  status TEXT CHECK (status IN ('desiderato', 'acquistato', 'ricevuto')) DEFAULT 'desiderato',
  
  -- Additional info
  notes TEXT,
  image_url TEXT,
  purchased_by TEXT, -- Nome della persona che ha acquistato
  purchased_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_gift_list_event_id ON gift_list(event_id);
CREATE INDEX idx_gift_list_user_id ON gift_list(user_id);
CREATE INDEX idx_gift_list_status ON gift_list(status);
CREATE INDEX idx_gift_list_priority ON gift_list(priority);

-- RLS Policies
ALTER TABLE gift_list ENABLE ROW LEVEL SECURITY;

-- Users can view their own gift lists
CREATE POLICY "Users can view own gift lists"
  ON gift_list FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own gift items
CREATE POLICY "Users can insert own gift items"
  ON gift_list FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own gift items
CREATE POLICY "Users can update own gift items"
  ON gift_list FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own gift items
CREATE POLICY "Users can delete own gift items"
  ON gift_list FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gift_list_updated_at
  BEFORE UPDATE ON gift_list
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_list_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Gift list table created successfully with RLS policies';
END $$;
