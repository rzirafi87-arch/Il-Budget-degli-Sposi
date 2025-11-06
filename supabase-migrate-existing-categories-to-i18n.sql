<<<<<<< ours
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
=======
-- ============================================================================
-- MIGRAZIONE CATEGORIE ESISTENTI -> SCHEMA I18N
-- ============================================================================
-- Scopo:
--   * Associare le categorie esistenti al tipo evento globale (es. WEDDING)
--   * Creare/aggiornare le traduzioni italiane e inglesi
--
-- Utilizzo:
--   * Esegui nel SQL Editor Supabase oppure con scripts/run-sql.mjs
--
-- Note:
--   * Lo script è compatibile sia con lo schema "categories" classico sia con
--     gli alias template "event_type_categories" introdotti nelle patch recenti.
--   * Inserisce traduzioni con locale 'it-IT' e 'en-US'. In mancanza di
--     traduzione inglese specifica, usa il nome di base come fallback.
-- ============================================================================

DO $$
DECLARE
  v_event_type_id uuid;
  v_categories_table text;
  v_event_type_column text;
  v_name_column text;
  v_translations_table text;
  v_translation_locale_column text;
  v_translation_name_column text;
  v_categories_updated integer := 0;
  v_it_created integer := 0;
  v_en_created integer := 0;
  v_remaining_without_type integer := 0;
  v_categories_table_name text;
  v_translations_table_name text;
BEGIN
  -- 1) Recupera ID tipo evento WEDDING (code oppure slug)
  SELECT id INTO v_event_type_id
>>>>>>> theirs
  FROM public.event_types
  WHERE code = 'WEDDING'
  LIMIT 1;

<<<<<<< ours
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
=======
  IF v_event_type_id IS NULL THEN
    SELECT id INTO v_event_type_id
    FROM public.event_types
    WHERE slug = 'wedding'
    LIMIT 1;
  END IF;

  IF v_event_type_id IS NULL THEN
    RAISE EXCEPTION 'Tipo evento WEDDING non trovato (code/slug).';
  END IF;

  -- 2) Determina tabella categorie e colonne rilevanti
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'categories'
               AND column_name IN ('event_type_id', 'type_id')
           ) THEN 'public.categories'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_categories'
               AND column_name = 'event_type_id'
           ) THEN 'public.event_type_categories'
         END
    INTO v_categories_table;

  IF v_categories_table IS NULL THEN
    RAISE EXCEPTION 'Impossibile individuare la tabella categorie (event_type_id/type_id mancante).';
  END IF;

  v_categories_table_name := split_part(v_categories_table, '.', 2);

  -- Colonna event_type (event_type_id oppure type_id)
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = v_categories_table_name
               AND column_name = 'event_type_id'
           ) THEN 'event_type_id'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = v_categories_table_name
               AND column_name = 'type_id'
           ) THEN 'type_id'
         END
    INTO v_event_type_column;

  IF v_event_type_column IS NULL THEN
    RAISE EXCEPTION 'La tabella % non espone una colonna event_type_id/type_id.', v_categories_table;
  END IF;

  -- Colonna nome base
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = v_categories_table_name
               AND column_name = 'display_name'
           ) THEN 'display_name'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = v_categories_table_name
               AND column_name = 'name'
           ) THEN 'name'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = v_categories_table_name
               AND column_name = 'label'
           ) THEN 'label'
         END
    INTO v_name_column;

  IF v_name_column IS NULL THEN
    RAISE EXCEPTION 'La tabella % non contiene una colonna nome/label utilizzabile.', v_categories_table;
  END IF;

  -- 3) Aggiorna event_type_id per le categorie senza associazione
  EXECUTE format(
    'UPDATE %s SET %I = $1 WHERE %I IS NULL',
    v_categories_table,
    v_event_type_column,
    v_event_type_column
  ) USING v_event_type_id;

  GET DIAGNOSTICS v_categories_updated = ROW_COUNT;

  -- 4) Individua tabella traduzioni categorie
  SELECT CASE
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'category_translations'
               AND column_name = 'category_id'
           ) THEN 'public.category_translations'
           WHEN EXISTS (
             SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name = 'event_type_category_translations'
               AND column_name = 'category_id'
           ) THEN 'public.event_type_category_translations'
         END
    INTO v_translations_table;

  IF v_translations_table IS NULL THEN
    RAISE EXCEPTION 'Tabella traduzioni categorie non trovata.';
  END IF;

  v_translations_table_name := split_part(v_translations_table, '.', 2);

  -- Colonna locale (locale, language, lang...)
  SELECT column_name
    INTO v_translation_locale_column
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = v_translations_table_name
    AND column_name IN ('locale', 'language', 'lang', 'language_code')
  LIMIT 1;

  IF v_translation_locale_column IS NULL THEN
    RAISE EXCEPTION 'La tabella % non contiene una colonna locale/language.', v_translations_table;
  END IF;

  -- Colonna testo traduzione (name/label/title/value)
  SELECT column_name
    INTO v_translation_name_column
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = v_translations_table_name
    AND column_name IN ('name', 'label', 'title', 'value', 'translation')
  LIMIT 1;

  IF v_translation_name_column IS NULL THEN
    RAISE EXCEPTION 'La tabella % non contiene una colonna per il testo tradotto.', v_translations_table;
  END IF;

  -- 5) Inserisci/aggiorna traduzioni italiane
  EXECUTE format(
    'WITH missing AS (
       SELECT c.id, c.%1$I AS base_name
       FROM %2$s c
       LEFT JOIN %3$s t
         ON t.category_id = c.id
        AND t.%4$I IN (''it'', ''it-IT'')
       WHERE c.%5$I = $1
         AND t.category_id IS NULL
         AND c.%1$I IS NOT NULL
     )
     INSERT INTO %3$s (category_id, %4$I, %6$I)
     SELECT id, $2, base_name FROM missing
     ON CONFLICT (category_id, %4$I) DO UPDATE
       SET %6$I = EXCLUDED.%6$I',
    v_name_column,
    v_categories_table,
    v_translations_table,
    v_translation_locale_column,
    v_event_type_column,
    v_translation_name_column
  ) USING v_event_type_id, 'it-IT';

  GET DIAGNOSTICS v_it_created = ROW_COUNT;

  -- 6) Inserisci/aggiorna traduzioni inglesi (fallback su nome base)
  EXECUTE format(
    'WITH missing AS (
       SELECT c.id, c.%1$I AS base_name
       FROM %2$s c
       LEFT JOIN %3$s t
         ON t.category_id = c.id
        AND t.%4$I IN (''en'', ''en-US'')
       WHERE c.%5$I = $1
         AND t.category_id IS NULL
         AND c.%1$I IS NOT NULL
     )
     INSERT INTO %3$s (category_id, %4$I, %6$I)
     SELECT id, $2, base_name FROM missing
     ON CONFLICT (category_id, %4$I) DO UPDATE
       SET %6$I = EXCLUDED.%6$I',
    v_name_column,
    v_categories_table,
    v_translations_table,
    v_translation_locale_column,
    v_event_type_column,
    v_translation_name_column
  ) USING v_event_type_id, 'en-US';

  GET DIAGNOSTICS v_en_created = ROW_COUNT;

  -- 7) Report finale
  EXECUTE format(
    'SELECT COUNT(*) FROM %s WHERE %I IS NULL',
    v_categories_table,
    v_event_type_column
  ) INTO v_remaining_without_type;

  RAISE NOTICE 'Categorie aggiornate: %', v_categories_updated;
  RAISE NOTICE 'Traduzioni it-IT create/aggiornate: %', v_it_created;
  RAISE NOTICE 'Traduzioni en-US create/aggiornate: %', v_en_created;
  RAISE NOTICE 'Categorie ancora senza event_type: %', v_remaining_without_type;
END $$;
>>>>>>> theirs
