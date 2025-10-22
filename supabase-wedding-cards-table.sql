-- Create wedding_cards table for PDF invitation/info card configuration
-- Stores the configuration for generating personalized wedding PDFs

CREATE TABLE IF NOT EXISTS public.wedding_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Sposi info
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  
  -- Location details (from approved expenses/selections)
  church_id UUID REFERENCES public.churches(id),
  church_name TEXT,
  church_address TEXT,
  
  location_id UUID REFERENCES public.locations(id),
  location_name TEXT,
  location_address TEXT,
  
  -- Payment info
  iban TEXT,
  bank_name TEXT,
  account_holder TEXT,
  
  -- Design preferences
  font_family TEXT DEFAULT 'Playfair Display', -- Font per i nomi
  background_image TEXT, -- URL o path dell'immagine di sfondo
  color_scheme TEXT DEFAULT 'classic', -- classic, modern, rustic, romantic
  template_style TEXT DEFAULT 'elegant', -- elegant, minimal, floral, vintage
  
  -- Additional text
  ceremony_time TIME,
  reception_time TIME,
  dress_code TEXT,
  custom_message TEXT, -- Messaggio personalizzato
  rsvp_info TEXT,
  
  -- Generated PDF info
  pdf_url TEXT, -- URL del PDF generato e salvato
  last_generated_at TIMESTAMP WITH TIME ZONE,
  
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wedding_cards_event_id ON public.wedding_cards(event_id);

-- RLS policies
ALTER TABLE public.wedding_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wedding_cards_owner_all ON public.wedding_cards;
CREATE POLICY wedding_cards_owner_all ON public.wedding_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = wedding_cards.event_id 
      AND (events.owner_id = auth.uid() OR events.owner_id IS NULL)
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_wedding_cards_updated_at ON public.wedding_cards;
CREATE TRIGGER update_wedding_cards_updated_at
  BEFORE UPDATE ON public.wedding_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
