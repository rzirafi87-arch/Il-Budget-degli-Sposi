# Prima Comunione — Implementation Summary

## Backend
- Seed endpoint: `src/app/api/communion/seed/[eventId]/route.ts`
  - Verifica JWT, controllo proprietà evento, upsert categorie e sottocategorie (idempotente)
- Dashboard endpoint: `src/app/api/my/communion-dashboard/route.ts`
  - GET: demo se non autenticato, dati reali se autenticato
  - POST: persiste righe + aggiorna budget/data dell’evento (spend_type: "common")
- Ensure-default: `src/app/api/event/ensure-default/route.ts`
  - Aggiunto ramo `communion` con nome evento "La mia Prima Comunione" e chiamata al seed
- Seed SQL opzionale: `supabase-communion-event-seed.sql`

## Frontend
- Template/percentuali: `src/data/templates/communion.ts`
- Navigazione: `src/components/NavTabs.tsx`, `src/components/ClientLayoutShell.tsx`
- Routing: `src/app/select-event-type/page.tsx`, `src/components/QuickSettings.tsx` (redirect → `/dashboard`)
- Idea di Budget: `src/app/idea-di-budget/page.tsx`
  - Integrazione Comunione con suggerimento basato su percentuali
- Eventi abilitati: `src/data/config/events.json` → `communion.available: true`

## Test
- Aggiungere un test di redirect selezione evento (vedi file per Laurea):
  - `src/app/__tests__/select-event-type-communion.test.tsx` (aggiunto in questa passata)

## Verifica
- Flusso demo non autenticato: mostra righe placeholder
- Flusso autenticato: persistenza funzionante e seed su ensure-default

## Note
- UI coerente con estetica Natural Chic; label data "Data Cerimonia"
- Budget singolo comune (no bride/groom split)
