-- =========================================
-- Traduzioni Matrimonio (IT/EN)
-- =========================================
-- Questo script popola event_type_translations, category_translations e
-- event_timeline_translations per il tipo evento Wedding.
-- Prima di eseguirlo verificare che event_types.code = 'WEDDING' esista.
--
-- Per sicurezza lanciare con:
--   node scripts/run-sql.mjs supabase-wedding-translations.sql

DO $$
DECLARE
  v_event_type_id uuid;
BEGIN
  SELECT id INTO v_event_type_id FROM public.event_types WHERE code = 'WEDDING';
  IF v_event_type_id IS NULL THEN
    RAISE EXCEPTION 'Tipo evento WEDDING assente, esegui prima supabase-wedding-event-seed.sql';
  END IF;

  INSERT INTO public.event_type_translations (event_type_id, locale, name)
  VALUES
    (v_event_type_id, 'it-IT', 'Matrimonio'),
    (v_event_type_id, 'en-GB', 'Wedding')
  ON CONFLICT (event_type_id, locale) DO UPDATE SET name = EXCLUDED.name;

  -- Categorie
  WITH cat AS (
    SELECT id, name FROM public.categories
    WHERE event_type_id = v_event_type_id
  )
  INSERT INTO public.category_translations (category_id, locale, name)
  SELECT id, 'it-IT', name FROM cat
    WHERE name IN (
      'Sposa','Sposo','Abiti & Accessori (altri)','Cerimonia','Location & Catering',
      'Fiori & Decor','Foto & Video','Inviti & Stationery','Musica & Intrattenimento',
      'Beauty & Benessere','Bomboniere & Regali','Trasporti','Ospitalità & Logistica',
      'Viaggio di nozze','Staff & Coordinamento','Burocrazia & Documenti',
      'Comunicazione & Media','Extra & Contingenze'
    )
  ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name;

  INSERT INTO public.category_translations (category_id, locale, name)
  SELECT id, 'en-GB', CASE name
    WHEN 'Sposa' THEN 'Bride'
    WHEN 'Sposo' THEN 'Groom'
    WHEN 'Abiti & Accessori (altri)' THEN 'Dresses & Accessories'
    WHEN 'Cerimonia' THEN 'Ceremony'
    WHEN 'Location & Catering' THEN 'Venues & Catering'
    WHEN 'Fiori & Decor' THEN 'Flowers & Decor'
    WHEN 'Foto & Video' THEN 'Photo & Video'
    WHEN 'Inviti & Stationery' THEN 'Invitations & Stationery'
    WHEN 'Musica & Intrattenimento' THEN 'Music & Entertainment'
    WHEN 'Beauty & Benessere' THEN 'Beauty & Wellness'
    WHEN 'Bomboniere & Regali' THEN 'Favours & Gifts'
    WHEN 'Trasporti' THEN 'Transport'
    WHEN 'Ospitalità & Logistica' THEN 'Hospitality & Logistics'
    WHEN 'Viaggio di nozze' THEN 'Honeymoon'
    WHEN 'Staff & Coordinamento' THEN 'Staff & Coordination'
    WHEN 'Burocrazia & Documenti' THEN 'Bureaucracy & Documents'
    WHEN 'Comunicazione & Media' THEN 'Communication & Media'
    WHEN 'Extra & Contingenze' THEN 'Extras & Contingencies'
    ELSE name
  END FROM cat
  ON CONFLICT (category_id, locale) DO UPDATE SET name = EXCLUDED.name;

END$$;

-- Timeline IT/EN (uso i dati già presenti in supabase-timeline-wedding-restore.sql)
-- Questo blocco assume che le timeline siano già create; aggiorna solo titolo/descrizione.
DO $$
DECLARE
  v_timeline_id uuid;
BEGIN
  FOR key, title_it, desc_it, title_en, desc_en IN
    SELECT key, title_it, desc_it, title_en, desc_en FROM (
      VALUES
        ('announce-engagement','Annuncio del fidanzamento','Comunicate la grande notizia a familiari e amici','Announce engagement','Share the big news with family and friends'),
        ('set-budget-style','Definite budget e stile','Stabilite il budget totale e scegliete lo stile del matrimonio','Set budget and style','Establish total budget and choose wedding style'),
        ('book-venue-date','Prenotate location e data','Bloccate la location e la data con caparra','Book venue and date','Secure venue and date with deposit'),
        ('photographer','Fotografo','Prenotate il fotografo per immortalare il vostro giorno speciale','Photographer','Book photographer to capture your special day'),
        ('videomaker','Videomaker','Prenotate il videomaker per creare il vostro film di nozze','Videographer','Book videographer to create your wedding film'),
        ('church-townhall','Chiesa/Comune','Prenotate chiesa o comune per la cerimonia','Church/Town Hall','Book church or town hall for ceremony'),
        ('catering','Catering','Scegliete il menu e prenotate il servizio catering','Catering','Choose menu and book catering service'),
        ('music-ceremony','Musica cerimonia','Prenotate musicisti per la cerimonia','Ceremony music','Book musicians for ceremony'),
        ('music-party','Musica festa','Prenotate DJ o band per il ricevimento','Reception music','Book DJ or band for reception'),
        ('save-the-date','Save the date','Inviate i save the date agli invitati','Save the date','Send save the dates to guests'),
        ('flowers','Fiori e decorazioni','Scegliete fiorista e decorazioni per location e chiesa','Flowers and decorations','Choose florist and decorations for venue and church'),
        ('stationery','Partecipazioni','Ordinate e preparate le partecipazioni','Invitations','Order and prepare invitations'),
        ('invitations-send','Invio partecipazioni','Inviate le partecipazioni agli ospiti','Send invitations','Send invitations to guests'),
        ('transport','Trasporti','Organizzate i trasporti per sposi e invitati','Transport','Organize transport for couple and guests'),
        ('rings','Fedi nuziali','Scegliete e ordinate le fedi nuziali','Wedding rings','Choose and order wedding rings'),
        ('final-menu','Menu definitivo','Confermate il menu finale con il catering','Final menu','Confirm final menu with caterer'),
        ('seating-plan','Tableau e tavoli','Organizzate la disposizione dei tavoli e il tableau','Seating plan','Organize table arrangements and seating chart'),
        ('final-payments','Saldi finali','Completate i pagamenti finali ai fornitori','Final payments','Complete final payments to suppliers'),
        ('wedding-day','Giorno del matrimonio','Il vostro giorno speciale è arrivato!','Wedding day','Your special day has arrived!'),
        ('thank-you','Ringraziamenti','Inviate i biglietti di ringraziamento agli ospiti','Thank you notes','Send thank you cards to guests')
    ) AS data(key, title_it, desc_it, title_en, desc_en)
  LOOP
    SELECT id INTO v_timeline_id FROM public.event_timelines et
    JOIN public.event_types ety ON ety.id = et.event_type_id
    WHERE ety.code = 'WEDDING' AND et.key = key;

    IF v_timeline_id IS NOT NULL THEN
      INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
      VALUES (v_timeline_id, 'it-IT', title_it, desc_it)
      ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

      INSERT INTO public.event_timeline_translations (timeline_id, locale, title, description)
      VALUES (v_timeline_id, 'en-GB', title_en, desc_en)
      ON CONFLICT (timeline_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
    END IF;
  END LOOP;
END$$;
