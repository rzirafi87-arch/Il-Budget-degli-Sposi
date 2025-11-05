-- =====================================================================
-- PATCH 18: Schema unificato per Event Types, Categories, Subcategories e Timeline
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Standardizzare i contenuti (categorie/timeline) per tutti i tipi di evento
--        supportati: WEDDING, BAPTISM, GRADUATION, COMMUNION, CONFIRMATION,
--        ANNIVERSARY, BABY_SHOWER, GENDER_REVEAL, ENGAGEMENT, PROPOSAL, etc.
-- =====================================================================

-- =====================================================================
-- 1. Tabella Event Types (tipi di evento supportati)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- es: WEDDING, BAPTISM, GRADUATION
  name TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'it-IT',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_types IS 'Tipi di evento supportati dall''applicazione';
COMMENT ON COLUMN public.event_types.code IS 'Codice univoco tipo evento (uppercase)';
COMMENT ON COLUMN public.event_types.name IS 'Nome localizzato del tipo evento';
COMMENT ON COLUMN public.event_types.locale IS 'Lingua (es: it-IT, en-US)';

-- Indice per query rapide per code
CREATE INDEX IF NOT EXISTS idx_event_types_code ON public.event_types(code);

-- =====================================================================
-- 2. Tabella Categories (categorie di spesa per tipo evento)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  icon TEXT, -- es: "MapPin", "Camera", "Music"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Categorie di spesa per ogni tipo di evento';
COMMENT ON COLUMN public.categories.event_type_id IS 'Tipo di evento a cui appartiene la categoria';
COMMENT ON COLUMN public.categories.sort IS 'Ordinamento visualizzazione';
COMMENT ON COLUMN public.categories.icon IS 'Nome icona Lucide React (opzionale)';

-- Indici
CREATE INDEX IF NOT EXISTS idx_categories_event_type ON public.categories(event_type_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(event_type_id, sort);

-- =====================================================================
-- 3. Tabella Subcategories (voci dettagliate di spesa)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  default_budget NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subcategories IS 'Sottocategorie (voci di spesa dettagliate)';
COMMENT ON COLUMN public.subcategories.category_id IS 'Categoria padre';
COMMENT ON COLUMN public.subcategories.default_budget IS 'Budget suggerito (opzionale)';
COMMENT ON COLUMN public.subcategories.notes IS 'Note o consigli per la voce';

-- Indici
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_sort ON public.subcategories(category_id, sort);

-- =====================================================================
-- 4. Tabella Event Category Selection (voci selezionate per un evento)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_category_selection (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE,
  budget NUMERIC(12,2) DEFAULT 0,
  is_selected BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, subcategory_id)
);

COMMENT ON TABLE public.event_category_selection IS 'Voci di spesa selezionate per ogni evento';
COMMENT ON COLUMN public.event_category_selection.budget IS 'Budget allocato per questa voce';
COMMENT ON COLUMN public.event_category_selection.is_selected IS 'Se false, voce ignorata per questo evento';

-- Indici
CREATE INDEX IF NOT EXISTS idx_event_category_selection_event ON public.event_category_selection(event_id);
CREATE INDEX IF NOT EXISTS idx_event_category_selection_subcategory ON public.event_category_selection(subcategory_id);

-- =====================================================================
-- 5. Tabella Event Timelines (milestone standard per tipo evento)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  offset_days INT NOT NULL, -- Giorni dall'evento: -365 = 1 anno prima, +1 = giorno dopo
  category TEXT, -- es: "PLANNING", "CEREMONY", "POST_EVENT"
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_timelines IS 'Timeline standard con milestone per tipo evento';
COMMENT ON COLUMN public.event_timelines.offset_days IS 'Offset in giorni dalla data evento (negativi = prima, positivi = dopo)';
COMMENT ON COLUMN public.event_timelines.category IS 'Categoria milestone (PLANNING, CEREMONY, POST_EVENT, etc.)';
COMMENT ON COLUMN public.event_timelines.is_critical IS 'Milestone critica (da evidenziare in UI)';

-- Indici
CREATE INDEX IF NOT EXISTS idx_event_timelines_event_type ON public.event_timelines(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_timelines_offset ON public.event_timelines(event_type_id, offset_days);

-- =====================================================================
-- 6. Tabella User Event Timeline (milestone personalizzate per evento utente)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_event_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES public.event_timelines(id) ON DELETE SET NULL, -- NULL se custom
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_event_timeline IS 'Timeline personalizzata per ogni evento utente (basata su template o custom)';
COMMENT ON COLUMN public.user_event_timeline.timeline_id IS 'Riferimento a template standard (NULL se milestone custom)';
COMMENT ON COLUMN public.user_event_timeline.due_date IS 'Data di scadenza calcolata (event_date + offset_days)';

-- Indici
CREATE INDEX IF NOT EXISTS idx_user_event_timeline_event ON public.user_event_timeline(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_timeline_due_date ON public.user_event_timeline(event_id, due_date);
CREATE INDEX IF NOT EXISTS idx_user_event_timeline_completed ON public.user_event_timeline(event_id, is_completed);

-- =====================================================================
-- 7. RLS Policies
-- =====================================================================

-- Event Types (pubblici, read-only)
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event types"
ON public.event_types
FOR SELECT
USING (true);

-- Categories (pubbliche, read-only)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

-- Subcategories (pubbliche, read-only)
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subcategories"
ON public.subcategories
FOR SELECT
USING (true);

-- Event Timelines (pubbliche, read-only)
ALTER TABLE public.event_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event timelines"
ON public.event_timelines
FOR SELECT
USING (true);

-- Event Category Selection (privato per owner evento)
ALTER TABLE public.event_category_selection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own event selections"
ON public.event_category_selection
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_category_selection.event_id
      AND events.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own event selections"
ON public.event_category_selection
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_category_selection.event_id
      AND events.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_category_selection.event_id
      AND events.owner_id = auth.uid()
  )
);

-- User Event Timeline (privato per owner evento)
ALTER TABLE public.user_event_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timeline"
ON public.user_event_timeline
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = user_event_timeline.event_id
      AND events.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own timeline"
ON public.user_event_timeline
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = user_event_timeline.event_id
      AND events.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = user_event_timeline.event_id
      AND events.owner_id = auth.uid()
  )
);

-- =====================================================================
-- 8. Triggers per updated_at
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Event Types
DROP TRIGGER IF EXISTS update_event_types_updated_at ON public.event_types;
CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Subcategories
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event Category Selection
DROP TRIGGER IF EXISTS update_event_category_selection_updated_at ON public.event_category_selection;
CREATE TRIGGER update_event_category_selection_updated_at
  BEFORE UPDATE ON public.event_category_selection
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event Timelines
DROP TRIGGER IF EXISTS update_event_timelines_updated_at ON public.event_timelines;
CREATE TRIGGER update_event_timelines_updated_at
  BEFORE UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User Event Timeline
DROP TRIGGER IF EXISTS update_user_event_timeline_updated_at ON public.user_event_timeline;
CREATE TRIGGER update_user_event_timeline_updated_at
  BEFORE UPDATE ON public.user_event_timeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- Fine PATCH 18
-- =====================================================================
