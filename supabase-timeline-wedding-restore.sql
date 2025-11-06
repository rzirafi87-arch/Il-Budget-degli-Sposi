-- =====================================================================
-- Timeline Wedding: Ripristino voci complete con traduzioni IT/EN
-- =====================================================================
-- Data: 2025-11-06
-- Scopo: Ripristinare tutte le voci della timeline matrimonio con
--        traduzioni IT e EN corrette
-- =====================================================================

-- Step 1: Assicurati che event_types contenga WEDDING
INSERT INTO public.event_types (code, name, icon, active)
VALUES ('WEDDING', 'Matrimonio', '💍', true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, icon = EXCLUDED.icon, active = EXCLUDED.active;

-- Step 2: Get event_type_id for WEDDING
DO $$
DECLARE
  v_event_type_id uuid;
BEGIN
  SELECT id INTO v_event_type_id
  FROM public.event_types
  WHERE code = 'WEDDING';

  IF v_event_type_id IS NULL THEN
    RAISE EXCEPTION 'Event type WEDDING not found';
  END IF;

  -- Step 3: Insert timeline entries (idempotent)
  INSERT INTO public.event_timelines (event_type_id, key, offset_days, sort_order)
  VALUES
    (v_event_type_id, 'announce-engagement', -365, 10),
    (v_event_type_id, 'set-budget-style', -330, 20),
    (v_event_type_id, 'book-venue-date', -300, 30),
    (v_event_type_id, 'photographer', -270, 40),
    (v_event_type_id, 'videomaker', -270, 50),
    (v_event_type_id, 'church-townhall', -270, 60),
    (v_event_type_id, 'catering', -240, 70),
    (v_event_type_id, 'music-ceremony', -210, 80),
    (v_event_type_id, 'music-party', -210, 90),
    (v_event_type_id, 'save-the-date', -210, 100),
    (v_event_type_id, 'flowers', -180, 110),
    (v_event_type_id, 'stationery', -150, 120),
    (v_event_type_id, 'invitations-send', -120, 130),
    (v_event_type_id, 'transport', -90, 140),
    (v_event_type_id, 'rings', -60, 150),
    (v_event_type_id, 'final-menu', -30, 160),
    (v_event_type_id, 'seating-plan', -21, 170),
    (v_event_type_id, 'final-payments', -7, 180),
    (v_event_type_id, 'wedding-day', 0, 190),
    (v_event_type_id, 'thank-you', 14, 200)
  ON CONFLICT (event_type_id, key)
  DO UPDATE SET
    offset_days = EXCLUDED.offset_days,
    sort_order = EXCLUDED.sort_order;

  RAISE NOTICE 'Timeline entries created/updated successfully';
END$$;

-- Step 4: Inserisci le traduzioni IT
DO $$
DECLARE
  v_timeline_id uuid;
BEGIN
  -- announce-engagement
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'announce-engagement';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Annuncio del fidanzamento', 'Comunicate la grande notizia a familiari e amici')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- set-budget-style
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'set-budget-style';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Definite budget e stile', 'Stabilite il budget totale e scegliete lo stile del matrimonio')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- book-venue-date
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'book-venue-date';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Prenotate location e data', 'Bloccate la location e la data con caparra')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- photographer
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'photographer';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Fotografo', 'Prenotate il fotografo per immortalare il vostro giorno speciale')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- videomaker
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'videomaker';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Videomaker', 'Prenotate il videomaker per creare il vostro film di nozze')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- church-townhall
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'church-townhall';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Chiesa/Comune', 'Prenotate chiesa o comune per la cerimonia')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- catering
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'catering';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Catering', 'Scegliete il menu e prenotate il servizio catering')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- music-ceremony
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'music-ceremony';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Musica cerimonia', 'Prenotate musicisti per la cerimonia')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- music-party
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'music-party';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Musica festa', 'Prenotate DJ o band per il ricevimento')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- save-the-date
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'save-the-date';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Save the date', 'Inviate i save the date agli invitati')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- flowers
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'flowers';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Fiori e decorazioni', 'Scegliete fiorista e decorazioni per location e chiesa')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- stationery
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'stationery';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Partecipazioni', 'Ordinate e preparate le partecipazioni')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- invitations-send
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'invitations-send';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Invio partecipazioni', 'Inviate le partecipazioni agli ospiti')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- transport
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'transport';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Trasporti', 'Organizzate i trasporti per sposi e invitati')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- rings
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'rings';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Fedi nuziali', 'Scegliete e ordinate le fedi nuziali')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- final-menu
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'final-menu';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Menu definitivo', 'Confermate il menu finale con il catering')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- seating-plan
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'seating-plan';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Tableau e tavoli', 'Organizzate la disposizione dei tavoli e il tableau')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- final-payments
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'final-payments';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Saldi finali', 'Completate i pagamenti finali ai fornitori')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- wedding-day
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'wedding-day';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Giorno del matrimonio', 'Il vostro giorno speciale è arrivato!')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- thank-you
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'thank-you';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'it-IT', 'Ringraziamenti', 'Inviate i biglietti di ringraziamento agli ospiti')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  RAISE NOTICE 'Italian translations created/updated successfully';
END$$;

-- Step 5: Inserisci le traduzioni EN
DO $$
DECLARE
  v_timeline_id uuid;
BEGIN
  -- announce-engagement
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'announce-engagement';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Announce engagement', 'Share the big news with family and friends')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- set-budget-style
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'set-budget-style';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Set budget and style', 'Establish total budget and choose wedding style')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- book-venue-date
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'book-venue-date';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Book venue and date', 'Secure venue and date with deposit')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- photographer
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'photographer';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Photographer', 'Book photographer to capture your special day')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- videomaker
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'videomaker';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Videographer', 'Book videographer to create your wedding film')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- church-townhall
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'church-townhall';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Church/Town Hall', 'Book church or town hall for ceremony')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- catering
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'catering';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Catering', 'Choose menu and book catering service')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- music-ceremony
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'music-ceremony';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Ceremony music', 'Book musicians for ceremony')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- music-party
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'music-party';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Reception music', 'Book DJ or band for reception')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- save-the-date
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'save-the-date';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Save the date', 'Send save the dates to guests')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- flowers
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'flowers';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Flowers and decorations', 'Choose florist and decorations for venue and church')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- stationery
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'stationery';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Invitations', 'Order and prepare invitations')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- invitations-send
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'invitations-send';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Send invitations', 'Send invitations to guests')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- transport
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'transport';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Transport', 'Organize transport for couple and guests')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- rings
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'rings';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Wedding rings', 'Choose and order wedding rings')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- final-menu
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'final-menu';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Final menu', 'Confirm final menu with caterer')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- seating-plan
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'seating-plan';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Seating plan', 'Organize table arrangements and seating chart')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- final-payments
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'final-payments';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Final payments', 'Complete final payments to suppliers')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- wedding-day
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'wedding-day';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Wedding day', 'Your special day has arrived!')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  -- thank-you
  SELECT id INTO v_timeline_id FROM public.event_timelines et
  JOIN public.event_types ety ON ety.id = et.event_type_id
  WHERE ety.code = 'WEDDING' AND et.key = 'thank-you';

  IF v_timeline_id IS NOT NULL THEN
    INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
    VALUES (v_timeline_id, 'en-GB', 'Thank you notes', 'Send thank you cards to guests')
    ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
  END IF;

  RAISE NOTICE 'English translations created/updated successfully';
END$$;

-- =====================================================================
-- Fine script ripristino Timeline Wedding
-- =====================================================================
