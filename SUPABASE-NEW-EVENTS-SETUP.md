# Multi-Event Types: Schema + Seeds

This adds core tables and RLS for generic events (Battesimo, Diciottesimo, Compleanno, Anniversario, Pensione) plus seeds for event types and category dictionaries.

Important: This repository already defines an events/categories/expenses/incomes schema used by the app. These scripts are additive but not fully compatible with the existing model. Prefer running on a fresh Supabase project or review carefully before applying to production.

## Files
- `supabase-core-events-schema.sql`
- `supabase-seed-event-types.sql`
- `supabase-seed-event-categories.sql`
- `supabase-demo-public-event.sql` (seed demo opzionale)
- `supabase-generate-share-token.sql` (utility per creare un token di condivisione)
- `supabase-func-create-share-token.sql` (RPC per generare token via API)

### Optional event-specific seeds
- `supabase-communion-event-seed.sql` — Dizionario categorie/sottocategorie per Prima Comunione (multi-evento)

## Quick Run (VS Code PostgreSQL ext or Supabase SQL Editor)
1) Prerequisite (run once):
   - `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
2) Run in order:
   - `supabase-core-events-schema.sql`
   - `supabase-seed-event-types.sql`
   - `supabase-seed-event-categories.sql`
   - opzionale: `supabase-demo-public-event.sql`
   - opzionale: `supabase-func-create-share-token.sql`
   - opzionale: `supabase-generate-share-token.sql`

## Notes and gotchas
- If you see "owner_id contains null" when creating an event: make sure your server-side insert sets `owner_id = auth.get_user().id` (service role) or insert a corresponding row in `event_members` as context.
- Categories/subcategories are global per `event_types` (not per single event) so they can be reused and shown immediately in forms.
- For a public demo, set an event with `is_public = true` + a `public_id` and expose via a public route like `/e/[publicId]`.

## Next steps (optional)
On request, we can add Next.js Route Handlers:
Already added in this branch:
- `GET /api/public/[publicId]` → restituisce dati minimi evento (compatibile con schema esistente e nuovo)
- `GET /api/share/[token]` → risolve `event_share_tokens` e ritorna evento (richiede schema core)
- `POST /api/event-core/new` → crea evento del nuovo schema usando `type_slug` o `type_id`, imposta `owner_id` e membership owner
- `POST /api/share/new` → crea un token di condivisione per un evento (autorizzazione owner/editor), usa RPC `create_share_token`

### Test rapido
- Esegui il seed demo opzionale, poi apri `/e/demo-public-001`.
- Comodità: `/e` reindirizza a `/e/demo-public-001`.
- Script NPM: `npm run sql:init:core-events` e `npm run sql:seed:core-demo`.
- Vedi anche: `docs/CORE-EVENTS-QUICKTEST.md` per cURL rapidi.

Nota: esiste già `POST /api/event/new` nel progetto attuale, legato allo schema corrente. Non l'ho toccato per evitare conflitti.

And provide a minimal demo seed with a public event ready to showcase.
