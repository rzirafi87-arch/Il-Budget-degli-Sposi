-- =====================================================
-- GUESTS AND NON-INVITED RECIPIENTS TABLES
-- =====================================================
-- This migration adds support for the Invitati page:
-- - guests: Main guest list with RSVP tracking and menu preferences
-- - non_invited_recipients: People receiving bomboniere/confetti without invitation
-- - Adds default_rsvp_deadline column to events table
--
-- Run this AFTER supabase-COMPLETE-SETUP.sql
-- =====================================================

-- Add default RSVP deadline to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS default_rsvp_deadline DATE;

COMMENT ON COLUMN public.events.default_rsvp_deadline IS 
'Default RSVP deadline for new guests (can be overridden per-guest)';

-- =====================================================
-- GUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    
    -- Guest identification
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    guest_type TEXT NOT NULL CHECK (guest_type IN ('bride', 'groom', 'common')),
    is_main_contact BOOLEAN DEFAULT false,
    
    -- Invitation tracking
    invitation_date DATE,
    rsvp_deadline DATE,
    rsvp_received BOOLEAN DEFAULT false,
    attending BOOLEAN DEFAULT false,
    
    -- Menu and preferences
    menu_preferences TEXT[] DEFAULT '{}',
    -- Available preferences: carne, pesce, baby, animazione, vegetariano, posto_tavolo
    
    -- Bomboniera tracking
    receives_bomboniera BOOLEAN DEFAULT false,
    
    -- Notes
    notes TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_guest_type ON public.guests(guest_type);
CREATE INDEX IF NOT EXISTS idx_guests_attending ON public.guests(attending);
CREATE INDEX IF NOT EXISTS idx_guests_main_contact ON public.guests(is_main_contact);

-- Comments
COMMENT ON TABLE public.guests IS 
'Wedding guest list with RSVP tracking, menu preferences, and bomboniera tracking';

COMMENT ON COLUMN public.guests.guest_type IS 
'Bride/groom/common classification for budget tracking';

COMMENT ON COLUMN public.guests.is_main_contact IS 
'Main family contact (e.g., head of household) - useful for grouping';

COMMENT ON COLUMN public.guests.menu_preferences IS 
'Array of menu preferences: carne, pesce, baby, animazione, vegetariano, posto_tavolo';

COMMENT ON COLUMN public.guests.receives_bomboniera IS 
'Whether this guest receives a wedding favor (bomboniera)';

-- =====================================================
-- NON-INVITED RECIPIENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.non_invited_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    
    -- Recipient identification
    name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    
    -- What they receive
    receives_bomboniera BOOLEAN DEFAULT false,
    receives_confetti BOOLEAN DEFAULT false,
    
    -- Notes
    notes TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_non_invited_event_id ON public.non_invited_recipients(event_id);

-- Comments
COMMENT ON TABLE public.non_invited_recipients IS 
'People who are not invited to the wedding but receive bomboniere or confetti';

COMMENT ON COLUMN public.non_invited_recipients.receives_bomboniera IS 
'Whether this person receives a wedding favor (bomboniera)';

COMMENT ON COLUMN public.non_invited_recipients.receives_confetti IS 
'Whether this person receives confetti (sugared almonds)';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_invited_recipients ENABLE ROW LEVEL SECURITY;

-- Guests policies: Users can only access their own event's guests
CREATE POLICY "Users can view their own guests"
ON public.guests
FOR SELECT
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own guests"
ON public.guests
FOR INSERT
WITH CHECK (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own guests"
ON public.guests
FOR UPDATE
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own guests"
ON public.guests
FOR DELETE
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

-- Non-invited recipients policies
CREATE POLICY "Users can view their own non-invited recipients"
ON public.non_invited_recipients
FOR SELECT
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert their own non-invited recipients"
ON public.non_invited_recipients
FOR INSERT
WITH CHECK (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own non-invited recipients"
ON public.non_invited_recipients
FOR UPDATE
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own non-invited recipients"
ON public.non_invited_recipients
FOR DELETE
USING (
    event_id IN (
        SELECT id FROM public.events 
        WHERE user_id = auth.uid() OR partner_user_id = auth.uid()
    )
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON public.guests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_non_invited_updated_at ON public.non_invited_recipients;
CREATE TRIGGER update_non_invited_updated_at
    BEFORE UPDATE ON public.non_invited_recipients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (commented out - uncomment for testing)
-- =====================================================

/*
-- Insert sample guests for an event (replace event_id with actual UUID)
INSERT INTO public.guests (event_id, name, guest_type, is_main_contact, invitation_date, rsvp_deadline, rsvp_received, attending, menu_preferences, receives_bomboniera, notes)
VALUES 
    ('YOUR_EVENT_ID', 'Mario Rossi', 'groom', true, '2024-01-15', '2024-03-01', true, true, ARRAY['carne', 'posto_tavolo'], true, 'Padre dello sposo'),
    ('YOUR_EVENT_ID', 'Laura Bianchi', 'bride', true, '2024-01-15', '2024-03-01', true, true, ARRAY['pesce', 'vegetariano'], true, 'Madre della sposa'),
    ('YOUR_EVENT_ID', 'Giuseppe Verdi', 'common', false, '2024-01-20', '2024-03-01', false, false, ARRAY[], true, 'Amico di famiglia');

-- Insert sample non-invited recipients
INSERT INTO public.non_invited_recipients (event_id, name, receives_bomboniera, receives_confetti, notes)
VALUES
    ('YOUR_EVENT_ID', 'Ufficio postale', true, false, 'Per il postino'),
    ('YOUR_EVENT_ID', 'Vicini di casa', false, true, 'Solo confetti');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('guests', 'non_invited_recipients');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN ('guests', 'non_invited_recipients');

-- Count policies
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('guests', 'non_invited_recipients');
