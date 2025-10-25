-- ═══════════════════════════════════════════════════════════════════════════
-- SCRIPT CREAZIONE UTENTE TEST PER IL BUDGET DEGLI SPOSI
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 📧 Email: test@ilbudgetdeglisposi.it
-- 🔑 Password: Test123!
--
-- Questo utente è GIÀ CONFERMATO e può fare login immediatamente.
-- ⚠️  IMPORTANTE: Eseguire SOLO in ambiente di TEST/SVILUPPO
--
-- ═══════════════════════════════════════════════════════════════════════════

-- Abilita funzioni di hashing per la password (necessario per crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1️⃣  CREA L'UTENTE NELLA TABELLA auth.users
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
  '00000000-0000-0000-0000-000000000001'::uuid,  -- ID fisso per test
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Instance ID
  'test@ilbudgetdeglisposi.it',                   -- Email test
  crypt('Test123!', gen_salt('bf')),              -- Password: Test123! (hash bcrypt)
  NOW(),                                          -- ✅ Email GIÀ confermata
  NOW(),                                          -- Data creazione
  NOW(),                                          -- Data aggiornamento
  '{"provider":"email","providers":["email"]}'::jsonb,  -- Metadata provider
  '{"full_name":"Utente Test"}'::jsonb,          -- Metadata utente
  false,                                          -- Non super admin
  'authenticated',                                -- Ruolo standard
  'authenticated',                                -- Audience
  '',                                             -- Nessun token conferma
  '',                                             -- Nessun token recovery
  '',                                             -- Nessun token cambio email
  ''                                              -- Nessun cambio email
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at;

-- 2️⃣  CREA L'IDENTITÀ EMAIL PER L'AUTENTICAZIONE
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
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Stesso ID dell'utente
  '00000000-0000-0000-0000-000000000001'::uuid,  -- User ID
  jsonb_build_object(
    'sub', '00000000-0000-0000-0000-000000000001',
    'email', 'test@ilbudgetdeglisposi.it',
    'email_verified', true,
    'provider', 'email'
  ),
  'email',                                        -- Provider email
  'test@ilbudgetdeglisposi.it',                   -- Provider ID (per provider=email è l'email)
  NOW(),                                          -- Last sign in
  NOW(),                                          -- Created at
  NOW()                                           -- Updated at
)
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  last_sign_in_at = EXCLUDED.last_sign_in_at;

-- 3️⃣  CREA IL PROFILO PUBBLICO
INSERT INTO public.profiles (id, full_name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Utente Test',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name;

-- 4️⃣  CREA UN EVENTO DI TEST CON BUDGET
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

-- 5️⃣  POPOLA L'EVENTO CON CATEGORIE E SOTTOCATEGORIE (seed completo)
-- Usa la funzione esistente per creare struttura budget completa
SELECT seed_full_event('11111111-1111-1111-1111-111111111111'::uuid);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6️⃣  VERIFICA CREAZIONE UTENTE
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 
  '✅ UTENTE CREATO CORRETTAMENTE' as status,
  id,
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ CONFERMATA'
    ELSE '❌ NON CONFERMATA'
  END as email_status,
  role,
  created_at
FROM auth.users
WHERE email = 'test@ilbudgetdeglisposi.it';

-- Verifica evento
SELECT 
  '✅ EVENTO CREATO' as status,
  id,
  name,
  total_budget,
  bride_initial_budget,
  groom_initial_budget
FROM public.events
WHERE owner_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- ═══════════════════════════════════════════════════════════════════════════
-- 🎉 CREDENZIALI DI LOGIN PRONTE!
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 📧 Email:    test@ilbudgetdeglisposi.it
-- 🔑 Password: Test123!
--
-- Vai su: http://localhost:3000/auth
-- Inserisci le credenziali sopra
-- Clicca "Accedi"
--
-- ✅ Dovresti essere reindirizzato alla home con i tuoi dati!
-- ✅ L'evento "Matrimonio Test 2025" sarà già creato con budget €30.000
-- ✅ Tutte le categorie e sottocategorie saranno già popolate
-- ═══════════════════════════════════════════════════════════════════════════
