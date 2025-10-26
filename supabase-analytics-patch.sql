-- Add analytics tracking columns to suppliers
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_view_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.locations 
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_view_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS website_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_view_at TIMESTAMP WITH TIME ZONE;

-- Create analytics_events table for detailed tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('profile_view', 'contact_click', 'website_click', 'phone_click', 'email_click')),
  user_id UUID, -- NULL if not logged in
  session_id TEXT, -- Browser session tracking
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (
    (supplier_id IS NOT NULL AND location_id IS NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NOT NULL AND church_id IS NULL) OR
    (supplier_id IS NULL AND location_id IS NULL AND church_id IS NOT NULL)
  )
);

-- Index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_supplier ON public.analytics_events(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_location ON public.analytics_events(location_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_church ON public.analytics_events(church_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type, created_at DESC);

-- RLS for analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own supplier analytics" ON public.analytics_events 
FOR SELECT 
USING (
  supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid()) OR
  location_id IN (SELECT id FROM public.locations WHERE user_id = auth.uid()) OR
  church_id IN (SELECT id FROM public.churches WHERE user_id = auth.uid())
);

-- Function to increment analytics counters
CREATE OR REPLACE FUNCTION public.increment_analytics_counter(
  p_entity_type TEXT, -- 'supplier', 'location', 'church'
  p_entity_id UUID,
  p_counter_type TEXT -- 'profile_views', 'contact_clicks', 'website_clicks'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_entity_type = 'supplier' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.suppliers SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.suppliers SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.suppliers SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  ELSIF p_entity_type = 'location' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.locations SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.locations SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.locations SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  ELSIF p_entity_type = 'church' THEN
    IF p_counter_type = 'profile_views' THEN
      UPDATE public.churches SET profile_views = profile_views + 1, last_view_at = TIMEZONE('utc', NOW()) WHERE id = p_entity_id;
    ELSIF p_counter_type = 'contact_clicks' THEN
      UPDATE public.churches SET contact_clicks = contact_clicks + 1 WHERE id = p_entity_id;
    ELSIF p_counter_type = 'website_clicks' THEN
      UPDATE public.churches SET website_clicks = website_clicks + 1 WHERE id = p_entity_id;
    END IF;
  END IF;
END;
$$;

COMMENT ON TABLE public.analytics_events IS 'Detailed analytics tracking for supplier/location/church profiles';
COMMENT ON FUNCTION public.increment_analytics_counter IS 'Increments analytics counters for suppliers, locations, and churches';
