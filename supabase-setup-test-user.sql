-- ==============================================
-- ALL-IN-ONE: Setup utente test + evento + seed
-- Esegui in Supabase SQL Editor (ambiente test)
-- Idempotente: sicuro da rilanciare
-- ==============================================

BEGIN;

-- Estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabelle minime richieste (create if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID,
  public_id TEXT UNIQUE,
  name TEXT DEFAULT 'Il nostro matrimonio',
  currency TEXT DEFAULT 'EUR',
  total_budget NUMERIC(10, 2) DEFAULT 0,
  bride_initial_budget NUMERIC DEFAULT 0,
  groom_initial_budget NUMERIC DEFAULT 0,
  bride_email TEXT,
  groom_email TEXT,
  inserted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- In caso lo schema esista ma manchino colonne, aggiungile
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS total_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bride_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS groom_initial_budget NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bride_email TEXT,
  ADD COLUMN IF NOT EXISTS groom_email TEXT;

-- Vincolo di non negatività dei budget (crealo se assente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_budgets_nonnegative'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_budgets_nonnegative
      CHECK (
        COALESCE(bride_initial_budget,0) >= 0 AND
        COALESCE(groom_initial_budget,0) >= 0 AND
        COALESCE(total_budget,0) >= 0
      );
  END IF;
END $$;

-- Funzione seed completa (categorie + sottocategorie)
CREATE OR REPLACE FUNCTION seed_full_event(p_event UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.subcategories
  WHERE category_id IN (
    SELECT id FROM public.categories WHERE event_id = p_event
  );

  DELETE FROM public.categories WHERE event_id = p_event;

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
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Abito sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Scarpe sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Accessori sposa'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Acconciatura'),
    ((SELECT id FROM c WHERE name = 'Sposa'), 'Trucco'),

    ((SELECT id FROM c WHERE name = 'Sposo'), 'Abito sposo'),
    ((SELECT id FROM c WHERE name = 'Sposo'), 'Scarpe sposo'),
    ((SELECT id FROM c WHERE name = 'Sposo'), 'Accessori sposo'),

    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Damigelle'),
    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Paggetti'),
    ((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Accessori vari'),

    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Chiesa / Comune'),
    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Documenti e pratiche'),
    ((SELECT id FROM c WHERE name = 'Cerimonia'), 'Offertorio / celebrante'),

    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Location'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Catering / menù'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Torta nuziale'),
    ((SELECT id FROM c WHERE name = 'Location & Catering'), 'Mise en place / allestimenti'),

    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Bouquet sposa'),
    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Allestimenti floreali'),
    ((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Centrotavola'),

    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Fotografo'),
    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Videomaker'),
    ((SELECT id FROM c WHERE name = 'Foto & Video'), 'Album / stampe'),

    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Partecipazioni'),
    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Tableau / segnaposto'),
    ((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Menù'),

    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Musica cerimonia'),
    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'DJ / Band ricevimento'),
    ((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Animazione / intrattenimento'),

    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova trucco'),
    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova acconciatura'),
    ((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Trattamenti estetici'),

    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Bomboniere'),
    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Confetti e sacchetti'),
    ((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Regali testimoni'),

    ((SELECT id FROM c WHERE name = 'Trasporti'), 'Auto sposi'),
    ((SELECT id FROM c WHERE name = 'Trasporti'), 'Transfer invitati'),

    ((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Alloggi invitati'),
    ((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Bus navetta / logistica'),

    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Voli'),
    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Sistemazione'),
    ((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Attività'),

    ((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Wedding planner'),
    ((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Coordinamento giorno evento'),

    ((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Marche da bollo / diritti'),
    ((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Certificati / copie'),

    ((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Sito matrimonio'),
    ((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Save the date / comunicazioni'),

    ((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Extra vari'),
    ((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Fondo imprevisti');
END;
$$;

-- Utente di test (auth)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@ilbudgetdeglisposi.it',
  crypt('Test123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Utente Test"}'::jsonb,
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at;

-- Identità email
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000001',
    'email', 'test@ilbudgetdeglisposi.it',
    'email_verified', true,
    'provider', 'email'
  ),
  'email',
  'test@ilbudgetdeglisposi.it',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  last_sign_in_at = EXCLUDED.last_sign_in_at;

-- Profilo pubblico
INSERT INTO public.profiles (id, full_name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Utente Test',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name;

-- Evento di test con budget
INSERT INTO public.events (
  id,
  owner_id,
  name,
  currency,
  total_budget,
  bride_initial_budget,
  groom_initial_budget,
  bride_email,
  groom_email,
  inserted_at,
  updated_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Matrimonio Test 2025',
  'EUR',
  30000.00,
  15000.00,
  15000.00,
  'test@ilbudgetdeglisposi.it',
  'partner@ilbudgetdeglisposi.it',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_budget = EXCLUDED.total_budget;

-- Popola struttura budget
SELECT seed_full_event('11111111-1111-1111-1111-111111111111'::uuid);

COMMIT;

-- Verifiche
SELECT 'UTENTE CREATO' as status, id, email, role
FROM auth.users WHERE email = 'test@ilbudgetdeglisposi.it';

SELECT 'EVENTO CREATO' as status, id, name, total_budget
FROM public.events WHERE id = '11111111-1111-1111-1111-111111111111'::uuid;

