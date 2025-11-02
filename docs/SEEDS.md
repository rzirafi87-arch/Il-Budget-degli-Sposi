# SQL Seeds

## Prerequisiti
- Metti in `.env.local` una delle variabili:
  - Cloud: `SUPABASE_DB_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.<PROJECT-REF>.supabase.co:5432/postgres`
  - Locale: `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ibds`

## Script npm
- Solo eventi: `npm run sql:seed:events`
- Tutto (multi): `npm run sql:seed:all`

## Task VS Code
- Cloud:
  - `Run SQL: Current File (Supabase Cloud)`
  - `Run SQL: Events seed (Supabase Cloud)`
  - `Run SQL: Seeds (Supabase Cloud – multi)`
- Locale:
  - `Run SQL: Current File (local PG)`
  - `Run SQL: Events seed (local PG)`
  - `Run SQL: Seeds (local PG – multi)`

## Note
- Le stringhe Supabase Cloud richiedono SSL (`sslmode=require` lato estensione). Il runner `scripts/run-sql.mjs` abilita SSL automaticamente per host non-local.
- Non usare le API key Supabase (anon/service role) come password DB: la password DB è separata e visibile nel Dashboard Supabase → Project Settings → Database → Connection info.

