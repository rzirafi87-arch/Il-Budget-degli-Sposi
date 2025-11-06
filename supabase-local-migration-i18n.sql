-- =====================================================================
-- MIGRAZIONE LOCALE: Allineamento schema locale a Cloud (i18n ready)
-- =====================================================================
-- Data: 2025-11-06
-- Scopo: Portare il database locale PostgreSQL allo stesso schema Cloud
--        con supporto per event_types, traduzioni i18n, e relazioni
--        category/subcategory basate su event_type_id invece di event_id
-- =====================================================================
-- ATTENZIONE: Questo script modifica lo schema esistente.
--            Esegui un backup prima: pg_dump -U postgres -d ibds > backup.sql
-- =====================================================================

-- Step 1: Crea tabelle i18n se non esistono
-- (Stessa struttura di supabase-i18n-tables.sql)

CREATE TABLE IF NOT EXISTS i18n_locales (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'ltr' CHECK (direction IN ('ltr','rtl'))
);

CREATE TABLE IF NOT EXISTS geo_countries (
  code TEXT PRIMARY KEY,
  default_locale TEXT REFERENCES i18n_locales(code)
);

-- Step 2: Crea event_types se non esiste
-- (Nota: potrebbe già esistere se hai usato patch recenti)

CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  locale TEXT DEFAULT 'it-IT',
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_types_code ON event_types(code);

-- Step 3: Crea tabelle di traduzione per event_types

CREATE TABLE IF NOT EXISTS event_type_translations (
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  locale TEXT REFERENCES i18n_locales(code),
  name TEXT NOT NULL,
  PRIMARY KEY (event_type_id, locale)
);

CREATE TABLE IF NOT EXISTS event_type_variants (
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  country_code TEXT REFERENCES geo_countries(code),
  overrides JSONB NOT NULL DEFAULT '{}'::JSONB,
  PRIMARY KEY (event_type_id, country_code)
);

-- Step 4: Verifica struttura categories esistente e migra se necessario
-- Controlla se esiste già event_type_id o event_id

DO $$
BEGIN
  -- Se categories ha event_id ma non event_type_id, creiamo la nuova colonna
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'event_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'event_type_id'
  ) THEN
    -- Aggiungi event_type_id (nullable temporaneamente)
    ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE;

    RAISE NOTICE 'Colonna event_type_id aggiunta a categories. IMPORTANTE: event_id è ancora presente.';
    RAISE NOTICE 'Migrazione manuale necessaria: assegna event_type_id alle categorie esistenti prima di rimuovere event_id.';
    RAISE NOTICE 'Esempio: UPDATE categories SET event_type_id = (SELECT id FROM event_types WHERE code = ''WEDDING'' LIMIT 1);';
  END IF;

  -- Aggiungi sort se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'sort'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN sort INT NOT NULL DEFAULT 0;
  END IF;

  -- Aggiungi icon se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'categories'
      AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN icon TEXT;
  END IF;
END$$;

-- Step 5: Crea tabella category_translations

CREATE TABLE IF NOT EXISTS category_translations (
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  locale TEXT REFERENCES i18n_locales(code),
  name TEXT NOT NULL,
  PRIMARY KEY (category_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_category_translations_category ON category_translations(category_id);
CREATE INDEX IF NOT EXISTS idx_category_translations_locale ON category_translations(locale);

-- Step 6: Verifica subcategories e aggiungi colonne mancanti

DO $$
BEGIN
  -- Aggiungi sort se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcategories'
      AND column_name = 'sort'
  ) THEN
    ALTER TABLE public.subcategories ADD COLUMN sort INT NOT NULL DEFAULT 0;
  END IF;

  -- Aggiungi default_budget se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcategories'
      AND column_name = 'default_budget'
  ) THEN
    ALTER TABLE public.subcategories ADD COLUMN default_budget NUMERIC(12,2) DEFAULT 0;
  END IF;

  -- Aggiungi notes se non esiste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subcategories'
      AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.subcategories ADD COLUMN notes TEXT;
  END IF;
END$$;

-- Step 7: Crea tabella subcategory_translations

CREATE TABLE IF NOT EXISTS subcategory_translations (
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
  locale TEXT REFERENCES i18n_locales(code),
  name TEXT NOT NULL,
  PRIMARY KEY (subcategory_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_subcategory_translations_subcategory ON subcategory_translations(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_subcategory_translations_locale ON subcategory_translations(locale);

-- Step 8: Crea event_timelines

CREATE TABLE IF NOT EXISTS event_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  offset_days INT NOT NULL,
  sort_order INT DEFAULT 0,
  category TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_type_id, key)
);

CREATE INDEX IF NOT EXISTS idx_event_timelines_event_type ON event_timelines(event_type_id);
CREATE INDEX IF NOT EXISTS idx_event_timelines_offset ON event_timelines(event_type_id, offset_days);

-- Step 9: Crea event_timeline_translations

CREATE TABLE IF NOT EXISTS event_timeline_translations (
  timeline_id UUID REFERENCES event_timelines(id) ON DELETE CASCADE,
  locale TEXT REFERENCES i18n_locales(code),
  title TEXT NOT NULL,
  description TEXT,
  PRIMARY KEY (timeline_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_event_timeline_translations_timeline ON event_timeline_translations(timeline_id);
CREATE INDEX IF NOT EXISTS idx_event_timeline_translations_locale ON event_timeline_translations(locale);

-- Step 10: Indici aggiuntivi per performance

CREATE INDEX IF NOT EXISTS idx_categories_event_type_sort ON categories(event_type_id, sort) WHERE event_type_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subcategories_category_sort ON subcategories(category_id, sort);

-- Step 11: Commenti per documentazione

COMMENT ON TABLE i18n_locales IS 'Locale/lingue supportate (it-IT, en-GB, es-ES, ja-JP)';
COMMENT ON TABLE geo_countries IS 'Paesi con locale di default per i18n';
COMMENT ON TABLE event_types IS 'Tipi di evento supportati (WEDDING, BAPTISM, BIRTHDAY, etc.)';
COMMENT ON TABLE event_type_translations IS 'Traduzioni per event_types';
COMMENT ON TABLE category_translations IS 'Traduzioni per categories (IT/EN/ES/JP)';
COMMENT ON TABLE subcategory_translations IS 'Traduzioni per subcategories (IT/EN/ES/JP)';
COMMENT ON TABLE event_timelines IS 'Timeline standard con milestone per tipo evento';
COMMENT ON TABLE event_timeline_translations IS 'Traduzioni per timeline (IT/EN/ES/JP)';

-- =====================================================================
-- FINE MIGRAZIONE
-- =====================================================================

-- PROSSIMI PASSI MANUALI (se necessario):
--
-- 1. Se hai già dati in categories con event_id:
--    a. Assicurati che event_types contenga i tipi evento necessari
--    b. Popola event_type_id per ogni categoria esistente:
--       UPDATE categories
--       SET event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING' LIMIT 1)
--       WHERE event_type_id IS NULL;
--    c. (Opzionale) Rimuovi event_id dopo aver verificato:
--       ALTER TABLE categories DROP COLUMN event_id;
--
-- 2. Se hai già dati in categories.name/subcategories.name:
--    a. Migra i nomi esistenti in category_translations/subcategory_translations:
--       INSERT INTO category_translations (category_id, locale, name)
--       SELECT id, 'it-IT', name FROM categories
--       ON CONFLICT DO NOTHING;
--    b. Stessa cosa per subcategories:
--       INSERT INTO subcategory_translations (subcategory_id, locale, name)
--       SELECT id, 'it-IT', name FROM subcategories
--       ON CONFLICT DO NOTHING;
--
-- 3. Esegui il seed per popolare WEDDING con traduzioni IT/EN:
--    npm run seed:i18n
--
-- 4. Verifica le traduzioni con query di fallback da:
--    supabase-i18n-fallback-examples.sql
--
-- =====================================================================
-- ROLLBACK (se necessario):
-- Se devi tornare indietro, esegui:
--   DROP TABLE IF EXISTS event_timeline_translations CASCADE;
--   DROP TABLE IF EXISTS event_timelines CASCADE;
--   DROP TABLE IF EXISTS subcategory_translations CASCADE;
--   DROP TABLE IF EXISTS category_translations CASCADE;
--   DROP TABLE IF EXISTS event_type_variants CASCADE;
--   DROP TABLE IF EXISTS event_type_translations CASCADE;
--   DROP TABLE IF EXISTS event_types CASCADE;
--   DROP TABLE IF EXISTS geo_countries CASCADE;
--   DROP TABLE IF EXISTS i18n_locales CASCADE;
--   ALTER TABLE categories DROP COLUMN IF EXISTS event_type_id;
--   ALTER TABLE categories DROP COLUMN IF EXISTS sort;
--   ALTER TABLE categories DROP COLUMN IF EXISTS icon;
--   ALTER TABLE subcategories DROP COLUMN IF EXISTS sort;
--   ALTER TABLE subcategories DROP COLUMN IF EXISTS default_budget;
--   ALTER TABLE subcategories DROP COLUMN IF EXISTS notes;
-- Poi ripristina il backup: psql -U postgres -d ibds < backup.sql
-- =====================================================================
