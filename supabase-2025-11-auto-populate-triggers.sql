-- =====================================================================
-- PATCH 19: Trigger automatici per popolare timeline e categorie su INSERT evento
-- =====================================================================
-- Data: 2025-11-05
-- Scopo: Quando un utente crea un nuovo evento, auto-popola:
--        1. user_event_timeline (copia da event_timelines con calcolo due_date)
--        2. event_category_selection (copia da subcategories con default_budget)
-- =====================================================================

-- =====================================================================
-- 1. Funzione: popola user_event_timeline da template
-- =====================================================================

CREATE OR REPLACE FUNCTION public.populate_user_timeline()
RETURNS TRIGGER AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Solo se evento ha event_type valorizzato
  IF NEW.event_type IS NOT NULL AND NEW.event_date IS NOT NULL THEN
    -- Copia tutte le milestone da event_timelines per questo tipo evento
    FOR template_record IN
      SELECT et.id, et.title, et.description, et.offset_days, et.category, et.is_critical
      FROM public.event_timelines et
      JOIN public.event_types evt ON evt.id = et.event_type_id
      WHERE evt.code = NEW.event_type
    LOOP
      INSERT INTO public.user_event_timeline (
        event_id,
        timeline_id,
        title,
        description,
        due_date,
        is_completed
      ) VALUES (
        NEW.id,
        template_record.id,
        template_record.title,
        template_record.description,
        (NEW.event_date::date + template_record.offset_days * INTERVAL '1 day')::date,
        false
      )
      ON CONFLICT DO NOTHING; -- Evita duplicati se trigger viene eseguito più volte
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.populate_user_timeline() IS 
'Trigger function: auto-popola user_event_timeline copiando da event_timelines template';

-- =====================================================================
-- 2. Funzione: popola event_category_selection da subcategories
-- =====================================================================

CREATE OR REPLACE FUNCTION public.populate_event_categories()
RETURNS TRIGGER AS $$
DECLARE
  subcat_record RECORD;
BEGIN
  -- Solo se evento ha event_type valorizzato
  IF NEW.event_type IS NOT NULL THEN
    -- Copia tutte le subcategories per questo tipo evento
    FOR subcat_record IN
      SELECT s.id, s.default_budget
      FROM public.subcategories s
      JOIN public.categories c ON c.id = s.category_id
      JOIN public.event_types et ON et.id = c.event_type_id
      WHERE et.code = NEW.event_type
    LOOP
      INSERT INTO public.event_category_selection (
        event_id,
        subcategory_id,
        budget,
        is_selected
      ) VALUES (
        NEW.id,
        subcat_record.id,
        COALESCE(subcat_record.default_budget, 0),
        true -- Di default tutte selezionate
      )
      ON CONFLICT (event_id, subcategory_id) DO NOTHING; -- Evita duplicati
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.populate_event_categories() IS 
'Trigger function: auto-popola event_category_selection copiando da subcategories template';

-- =====================================================================
-- 3. Trigger: esegui dopo INSERT su events
-- =====================================================================

DROP TRIGGER IF EXISTS trg_populate_user_timeline ON public.events;
CREATE TRIGGER trg_populate_user_timeline
AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.populate_user_timeline();

DROP TRIGGER IF EXISTS trg_populate_event_categories ON public.events;
CREATE TRIGGER trg_populate_event_categories
AFTER INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.populate_event_categories();

COMMENT ON TRIGGER trg_populate_user_timeline ON public.events IS 
'Auto-popola user_event_timeline quando viene creato un nuovo evento';

COMMENT ON TRIGGER trg_populate_event_categories ON public.events IS 
'Auto-popola event_category_selection quando viene creato un nuovo evento';

-- =====================================================================
-- 4. Funzione helper: rigenera timeline per evento esistente (manuale)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.regenerate_event_data(p_event_id UUID)
RETURNS TEXT AS $$
DECLARE
  event_record RECORD;
  timeline_count INT;
  category_count INT;
BEGIN
  -- Ottieni evento
  SELECT * INTO event_record FROM public.events WHERE id = p_event_id;
  
  IF NOT FOUND THEN
    RETURN 'Evento non trovato';
  END IF;

  -- Pulisci dati esistenti
  DELETE FROM public.user_event_timeline WHERE event_id = p_event_id;
  DELETE FROM public.event_category_selection WHERE event_id = p_event_id;

  -- Rigenera timeline
  INSERT INTO public.user_event_timeline (event_id, timeline_id, title, description, due_date, is_completed)
  SELECT 
    p_event_id,
    et.id,
    et.title,
    et.description,
    (event_record.event_date::date + et.offset_days * INTERVAL '1 day')::date,
    false
  FROM public.event_timelines et
  JOIN public.event_types evt ON evt.id = et.event_type_id
  WHERE evt.code = event_record.event_type;

  GET DIAGNOSTICS timeline_count = ROW_COUNT;

  -- Rigenera categorie
  INSERT INTO public.event_category_selection (event_id, subcategory_id, budget, is_selected)
  SELECT 
    p_event_id,
    s.id,
    COALESCE(s.default_budget, 0),
    true
  FROM public.subcategories s
  JOIN public.categories c ON c.id = s.category_id
  JOIN public.event_types et ON et.id = c.event_type_id
  WHERE et.code = event_record.event_type;

  GET DIAGNOSTICS category_count = ROW_COUNT;

  RETURN format('✅ Rigenerato: %s timeline, %s categorie', timeline_count, category_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.regenerate_event_data(UUID) IS 
'Helper manuale: rigenera timeline e categorie per evento esistente (pulisce + ricrea)';

-- =====================================================================
-- Fine PATCH 19
-- =====================================================================
