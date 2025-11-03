-- =====================================================
-- PATCH: Aggiungi colonne multi-evento a public.events
-- =====================================================
-- Aggiunge le colonne necessarie per supportare il sistema multi-evento
-- (Battesimo, Gender Reveal, Festa Fidanzamento, ecc.)
-- Eseguire PRIMA dei seed evento specifici se le colonne non esistono
-- =====================================================

-- Aggiungi colonne se non esistono
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS event_location TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS color_theme TEXT;

-- Aggiungi colonne display per categorie e timeline
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS icon TEXT;

ALTER TABLE public.subcategories
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Crea tabella timeline_items se non esiste
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT,
  completed BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_event_id ON public.timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_due_date ON public.timeline_items(due_date);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(event_id, display_order);
CREATE INDEX IF NOT EXISTS idx_subcategories_display_order ON public.subcategories(category_id, display_order);

-- Verifica
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'events' 
  AND column_name IN ('event_type', 'event_date', 'event_location', 'description', 'color_theme')
ORDER BY column_name;
