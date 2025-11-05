-- =====================================================================
-- PATCH 18 v2: Schema event_types con nomi NON conflittuali
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Creare schema template event_types/categories SENZA conflitti con
--        le tabelle esistenti categories/subcategories (che sono per-evento)
-- 
-- Strategia: Usare nomi distinti:
--   - event_types (nuovo)
--   - event_type_categories (nuovo, template globale)
--   - event_type_subcategories (nuovo, template globale)
--   - event_timelines (nuovo, template globale)
-- 
-- Le tabelle esistenti categories/subcategories rimangono invariate
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

COMMENT ON TABLE public.event_types IS 'Tipi di evento supportati (template globali)';
COMMENT ON COLUMN public.event_types.code IS 'Codice univoco tipo evento (uppercase)';
COMMENT ON COLUMN public.event_types.name IS 'Nome localizzato del tipo evento';

CREATE INDEX IF NOT EXISTS idx_event_types_code ON public.event_types(code);

-- =====================================================================
-- 2. Tabella Event Type Categories (template categorie globali)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_type_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_type_categories IS 'Template categorie di spesa per tipo evento (globale)';
COMMENT ON COLUMN public.event_type_categories.icon IS 'Nome icona Lucide React (opzionale)';

CREATE INDEX IF NOT EXISTS idx_event_type_categories_event_type ON public.event_type_categories(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_type_categories_sort ON public.event_type_categories(event_type_id, sort);

-- =====================================================================
-- 3. Tabella Event Type Subcategories (template voci globali)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_type_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.event_type_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort INT NOT NULL DEFAULT 0,
  default_budget NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_type_subcategories IS 'Template sottocategorie (voci di spesa globali)';
COMMENT ON COLUMN public.event_type_subcategories.default_budget IS 'Budget suggerito';

CREATE INDEX IF NOT EXISTS idx_event_type_subcategories_category ON public.event_type_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_event_type_subcategories_sort ON public.event_type_subcategories(category_id, sort);

-- =====================================================================
-- 4. Tabella Event Timelines (template milestone globali)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.event_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  offset_days INT NOT NULL,
  category TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_timelines IS 'Template timeline con milestone per tipo evento';
COMMENT ON COLUMN public.event_timelines.offset_days IS 'Offset in giorni dalla data evento';

CREATE INDEX IF NOT EXISTS idx_event_timelines_event_type ON public.event_timelines(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_timelines_offset ON public.event_timelines(event_type_id, offset_days);

-- =====================================================================
-- 5. Tabella User Event Timeline (milestone personalizzate utente)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_event_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  timeline_id UUID REFERENCES public.event_timelines(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_event_timeline IS 'Timeline personalizzata per evento utente';

CREATE INDEX IF NOT EXISTS idx_user_event_timeline_event ON public.user_event_timeline(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_timeline_due_date ON public.user_event_timeline(event_id, due_date);
CREATE INDEX IF NOT EXISTS idx_user_event_timeline_completed ON public.user_event_timeline(event_id, is_completed);

-- =====================================================================
-- 6. RLS Policies
-- =====================================================================

-- Event Types (pubblici, read-only)
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view event types" ON public.event_types;
CREATE POLICY "Anyone can view event types"
ON public.event_types FOR SELECT USING (true);

-- Event Type Categories (pubbliche, read-only)
ALTER TABLE public.event_type_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view event type categories" ON public.event_type_categories;
CREATE POLICY "Anyone can view event type categories"
ON public.event_type_categories FOR SELECT USING (true);

-- Event Type Subcategories (pubbliche, read-only)
ALTER TABLE public.event_type_subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view event type subcategories" ON public.event_type_subcategories;
CREATE POLICY "Anyone can view event type subcategories"
ON public.event_type_subcategories FOR SELECT USING (true);

-- Event Timelines (pubbliche, read-only)
ALTER TABLE public.event_timelines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view event timelines" ON public.event_timelines;
CREATE POLICY "Anyone can view event timelines"
ON public.event_timelines FOR SELECT USING (true);

-- User Event Timeline (privato per owner evento)
ALTER TABLE public.user_event_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own timeline" ON public.user_event_timeline;
CREATE POLICY "Users can view their own timeline"
ON public.user_event_timeline FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = user_event_timeline.event_id
      AND events.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage their own timeline" ON public.user_event_timeline;
CREATE POLICY "Users can manage their own timeline"
ON public.user_event_timeline FOR ALL
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
-- 7. Triggers per updated_at
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_event_types_updated_at ON public.event_types;
CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_type_categories_updated_at ON public.event_type_categories;
CREATE TRIGGER update_event_type_categories_updated_at
  BEFORE UPDATE ON public.event_type_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_type_subcategories_updated_at ON public.event_type_subcategories;
CREATE TRIGGER update_event_type_subcategories_updated_at
  BEFORE UPDATE ON public.event_type_subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_timelines_updated_at ON public.event_timelines;
CREATE TRIGGER update_event_timelines_updated_at
  BEFORE UPDATE ON public.event_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_event_timeline_updated_at ON public.user_event_timeline;
CREATE TRIGGER update_user_event_timeline_updated_at
  BEFORE UPDATE ON public.user_event_timeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- Fine PATCH 18 v2
-- =====================================================================
