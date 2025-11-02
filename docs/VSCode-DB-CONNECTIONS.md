# VS Code: Connessione a Supabase (Cloud e Locale)

## Supabase Cloud (consigliato per DB reale)
- Dashboard ? Project Settings ? Database ? Connection string ? copia formato URI Postgres:
  `postgresql://postgres:YOUR_PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres?sslmode=require`
- VS Code ? estensione "PostgreSQL" (Microsoft) ? Add Connection ? tab "Connection String" ? incolla l'URI.
- Se richiesto SSL: imposta "Require".

## Supabase Locale (sviluppo)
- Requisiti: Docker Desktop e Supabase CLI (`npm i -g supabase`).
- Avvio: nella root del progetto esegui `supabase start`.
- Connettiti con l'estensione PostgreSQL (tab "Parameters"):
  - Server: `localhost`
  - Port: `5432` (oppure quella riportata da `supabase status`)
  - Database: `postgres`
  - User: `postgres`
  - Password: `postgres`
  - SSL: Off

## Profilo pronto all'uso
- Copia `.vscode/settings.sample.json` in `.vscode/settings.json` e sostituisci `PROJECT-REF` e `YOUR_PASSWORD`.
- Oppure configura manualmente dall'estensione PostgreSQL.

## Verifica rapida
- Esegui in una nuova query: `select now(), current_user, version();`
- Per i seed già inclusi nel repo: apri `supabase-events-seed.sql` e lancia lo script sull'istanza scelta.


## Eseguire i seed via npm (consigliato)
- Imposta in .env.local la variabile SUPABASE_DB_URL (Cloud) oppure DATABASE_URL (locale).
- Esegui: 
pm run sql:seed:events per applicare supabase-events-seed.sql.

## Task VS Code utili
- Local: Run SQL: Current File (local PG), Run SQL: Events seed (local PG) usa l'istanza Docker/Compose (porta 5433 nell'esempio).
- Cloud: Run SQL: Current File (Supabase Cloud), Run SQL: Events seed (Supabase Cloud) leggono SUPABASE_DB_URL da .env.local.
