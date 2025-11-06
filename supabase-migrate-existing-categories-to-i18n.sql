-- =====================================================================
-- MIGRAZIONE: Associa categorie esistenti a event_types e aggiungi traduzioni
-- =====================================================================

-- Step 1: Identifica le categorie da migrare (quelle senza event_type_id)
-- Step 2: Crea un mapping manuale o automatico basato sul nome
-- Step 3: Aggiungi traduzioni IT/EN per le categorie esistenti

DO $$
DECLARE
  wedding_type_id UUID;
  cat_record RECORD;
  cat_name_lower TEXT;
BEGIN
  -- Trova l'ID del tipo evento WEDDING
  SELECT id INTO wedding_type_id
  FROM public.event_types
  WHERE code = 'WEDDING'
  LIMIT 1;

  IF wedding_type_id IS NULL THEN
    RAISE EXCEPTION 'Event type WEDDING non trovato. Esegui prima il seed degli event_types.';
  END IF;

  RAISE NOTICE 'Event type WEDDING trovato: %', wedding_type_id;

  -- Mapping automatico: associa tutte le categorie NULL a WEDDING
  -- (Personalizza questa logica se hai categorie specifiche per altri tipi evento)

  UPDATE public.categories
  SET event_type_id = wedding_type_id
  WHERE event_type_id IS NULL
    AND event_id IS NOT NULL; -- Solo categorie user-specific (vecchio sistema)

  RAISE NOTICE '✅ % categorie associate a WEDDING',
    (SELECT COUNT(*) FROM public.categories WHERE event_type_id = wedding_type_id);

  -- Step 2: Aggiungi traduzioni IT basate sul nome esistente
  -- (Se il nome esiste, usalo come traduzione IT)
  FOR cat_record IN
    SELECT id, name
    FROM public.categories
    WHERE event_type_id = wedding_type_id
      AND name IS NOT NULL
      AND name != ''
  LOOP
    -- Inserisci traduzione IT se non esiste
    INSERT INTO public.category_translations (category_id, locale, name)
    VALUES (cat_record.id, 'it-IT', cat_record.name)
    ON CONFLICT (category_id, locale) DO NOTHING;

    -- Mapping EN (esempio generico - personalizza se necessario)
    cat_name_lower := LOWER(cat_record.name);

    CASE
      WHEN cat_name_lower LIKE '%sposa%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Bride')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%sposo%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Groom')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%location%' OR cat_name_lower LIKE '%catering%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Venue & Catering')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%chiesa%' OR cat_name_lower LIKE '%cerimonia%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Church & Ceremony')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%foto%' OR cat_name_lower LIKE '%video%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Photo & Video')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%fiori%' OR cat_name_lower LIKE '%addobbi%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Flowers & Decorations')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%bomboniere%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Wedding Favors')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%musica%' OR cat_name_lower LIKE '%animazione%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Music & Entertainment')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%partecipazioni%' OR cat_name_lower LIKE '%inviti%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Invitations')
        ON CONFLICT (category_id, locale) DO NOTHING;

      WHEN cat_name_lower LIKE '%viaggio%' OR cat_name_lower LIKE '%nozze%' THEN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', 'Honeymoon')
        ON CONFLICT (category_id, locale) DO NOTHING;

      ELSE
        -- Default: usa il nome IT come fallback EN
        INSERT INTO public.category_translations (category_id, locale, name)
        VALUES (cat_record.id, 'en-GB', cat_record.name)
        ON CONFLICT (category_id, locale) DO NOTHING;
    END CASE;
  END LOOP;

  RAISE NOTICE '✅ Traduzioni IT/EN aggiunte alle categorie esistenti';

END$$;

-- Verifica risultati
SELECT
  c.id,
  c.event_type_id,
  c.name AS original_name,
  COALESCE(ct_it.name, ct_en.name, 'missing') AS nome,
  ct_it.locale AS locale_it,
  ct_en.locale AS locale_en
FROM public.categories c
LEFT JOIN public.category_translations ct_it ON c.id = ct_it.category_id AND ct_it.locale = 'it-IT'
LEFT JOIN public.category_translations ct_en ON c.id = ct_en.category_id AND ct_en.locale = 'en-GB'
WHERE c.event_type_id IS NOT NULL
ORDER BY nome
LIMIT 20;

-- Statistiche
SELECT
  'Categorie con event_type_id' AS stat,
  COUNT(*) AS count
FROM public.categories
WHERE event_type_id IS NOT NULL
UNION ALL
SELECT
  'Traduzioni IT',
  COUNT(*)
FROM public.category_translations
WHERE locale = 'it-IT'
UNION ALL
SELECT
  'Traduzioni EN',
  COUNT(*)
FROM public.category_translations
WHERE locale = 'en-GB';
