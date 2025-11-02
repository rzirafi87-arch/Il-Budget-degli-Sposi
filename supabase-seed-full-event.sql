-- Seed full wedding event structure (categories + subcategories) for a given event
-- Idempotent: clears existing categories/subcategories for the event before seeding

CREATE OR REPLACE FUNCTION seed_full_event(p_event UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Remove existing structure for the event to avoid duplicates on re-run
  DELETE FROM public.subcategories
  WHERE category_id IN (
    SELECT id FROM public.categories WHERE event_id = p_event
  );

  DELETE FROM public.categories WHERE event_id = p_event;

  -- Insert all categories and capture their ids
  WITH c AS (
    INSERT INTO public.categories (event_id, name)
    SELECT p_event, unnest(ARRAY[
      'Sposa',
      'Sposo',
      'Abiti & Accessori (altri)',
      'Cerimonia',
      'Location & Catering',
      'Fiori & Decor',
      'Foto & Video',
      'Inviti & Stationery',
      'Musica & Intrattenimento',
      'Beauty & Benessere',
      'Bomboniere & Regali',
      'Trasporti',
      'Ospitalità & Logistica',
      'Viaggio di nozze',
      'Staff & Coordinamento',
      'Burocrazia & Documenti',
      'Comunicazione & Media',
      'Extra & Contingenze'
    ])
    RETURNING id, name
  )
  INSERT INTO public.subcategories (category_id, name)
  VALUES
    -- Sposa
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Abito sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Scarpe sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Accessori sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Acconciatura'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Trucco'),

    -- Sposo
    ((SELECT id FROM c WHERE name = 'Sposo'), 'Abito sposo'),
    ((SELECT id FROM c WHERE name = 'Sposo'), 'Scarpe sposo'),
    ((SELECT id FROM c WHERE name = 'Sposo'), 'Accessori sposo'),

    -- Abiti & Accessori (altri)
    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Damigelle'),
    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Paggetti'),
    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Accessori vari'),

    -- Cerimonia
    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Chiesa / Comune'),
    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Documenti e pratiche'),
    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Offertorio / celebrante'),

    -- Location & Catering
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Location'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Catering / menù'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Torta nuziale'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Mise en place / allestimenti'),

    -- Fiori & Decor
    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Bouquet sposa'),
    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Allestimenti floreali'),
    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Centrotavola'),

    -- Foto & Video
    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Fotografo'),
    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Videomaker'),
    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Album / stampe'),

    -- Inviti & Stationery
    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Partecipazioni'),
    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Tableau / segnaposto'),
    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Menù'),

    -- Musica & Intrattenimento
    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Musica cerimonia'),
    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'DJ / Band ricevimento'),
    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Animazione / intrattenimento'),

    -- Beauty & Benessere
    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova trucco'),
    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova acconciatura'),
    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Trattamenti estetici'),

    -- Bomboniere & Regali
    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Bomboniere'),
    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Confetti e sacchetti'),
    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Regali testimoni'),

    -- Trasporti
    ((SELECT id FROM c WHERE name = 'Trasporti'), 'Auto sposi'),
    ((SELECT id FROM c WHERE name = 'Trasporti'), 'Transfer invitati'),

    -- Ospitalità & Logistica
    ((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Alloggi invitati'),
    ((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Bus navetta / logistica'),

    -- Viaggio di nozze
    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Voli'),
    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Sistemazione'),
    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Attività'),

    -- Staff & Coordinamento
    ((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Wedding planner'),
    ((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Coordinamento giorno evento'),

    -- Burocrazia & Documenti
    ((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Marche da bollo / diritti'),
    ((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Certificati / copie'),

    -- Comunicazione & Media
    ((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Sito matrimonio'),
    ((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Save the date / comunicazioni'),

    -- Extra & Contingenze
    ((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Extra vari'),
    ((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Fondo imprevisti');
END;
$$;

