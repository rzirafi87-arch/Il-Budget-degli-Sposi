-- Seed functions for categories and subcategories
-- These functions help populate the database with default categories and subcategories for each event

-- Function to seed categories for a given event
CREATE OR REPLACE FUNCTION seed_categories(p_event UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.categories (id, event_id, name)
  SELECT uuid_generate_v4(), p_event, t.name
  FROM (VALUES
    ('Sposa'),
    ('Sposo'),
    ('Abiti & Accessori (altri)'),
    ('Cerimonia'),
    ('Location & Catering'),
    ('Fiori & Decor'),
    ('Foto & Video'),
    ('Inviti & Stationery'),
    ('Musica & Intrattenimento'),
    ('Beauty & Benessere'),
    ('Bomboniere & Regali'),
    ('Trasporti'),
    ('Ospitalità & Logistica'),
    ('Viaggio di nozze'),
    ('Staff & Coordinamento'),
    ('Burocrazia & Documenti'),
    ('Comunicazione & Media'),
    ('Extra & Contingenze')
  ) AS t(name);
END $$;

-- Function to seed subcategories for a given category
CREATE OR REPLACE FUNCTION seed_subcategories(p_category UUID, VARIADIC p_names TEXT[])
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE 
  n TEXT;
BEGIN
  FOREACH n IN ARRAY p_names LOOP
    INSERT INTO public.subcategories (id, category_id, name)
    VALUES (uuid_generate_v4(), p_category, n);
  END LOOP;
END $$;

-- Notes:
-- To populate categories for a new event, call: SELECT seed_categories('<event_id>');
-- Then insert subcategories using seed_subcategories(<category_id>, VARIADIC ARRAY['Name1','Name2', ...]);
