# Prima Comunione — Setup Guide

Questa guida descrive come è stata integrata la Prima Comunione nell’app (backend + frontend) e come verificarne il funzionamento.

## Struttura implementata

- Template categorie/sottocategorie: `src/data/templates/communion.ts`
- API seed: `src/app/api/communion/seed/[eventId]/route.ts`
- API dashboard: `src/app/api/my/communion-dashboard/route.ts`
- Ensure-default (creazione evento + seed): `src/app/api/event/ensure-default/route.ts` (ramo "communion")
- Navigazione: `src/components/NavTabs.tsx`, `src/components/ClientLayoutShell.tsx`
- Selettore tipo evento e Quick Settings: `src/app/select-event-type/page.tsx`, `src/components/QuickSettings.tsx`
- Idea di Budget (template + percentuali + suggerimenti): `src/app/idea-di-budget/page.tsx`
- Evento abilitato: `src/data/config/events.json` → `communion.available: true`
- Seed SQL opzionale (multi-evento): `supabase-communion-event-seed.sql`

## Requisiti

- Next.js 16, React 19, Tailwind 4
- Supabase URL/keys in `.env.local` (vedi README)

## Passi di verifica rapida

1) Avvio dev server
- `npm run dev`

2) Flusso demo (non autenticato)
- Vai su `/dashboard`: dovresti vedere la UI con dati demo quando non autenticato.

3) Selezione evento
- Vai su `/select-event-type` e scegli "Comunione" → l’app salva `eventType=communion` e reindirizza a `/dashboard`.

4) Ensure-default (autenticato)
- Effettua login nell’app.
- Chiama POST `/api/event/ensure-default` con `Authorization: Bearer <JWT>`; nel body includi `{ eventType: "communion" }`.
- Risultato: viene creato l’evento "La mia Prima Comunione" e viene richiamato il seed endpoint della Comunione.

5) Dashboard API (autenticato)
- GET `/api/my/communion-dashboard` con JWT deve restituire righe reali dal DB (categorie/sottocategorie collegate all’evento).
- POST sulla stessa rotta salva righe e aggiorna data/budget (spend_type: "common").

6) Idea di Budget
- Vai su `/idea-di-budget`: seleziona Comunione e usa il pulsante di suggerimento per ripartire il budget secondo le percentuali predefinite.

## Note di stile

- Estetica Natural Chic: palette verde salvia (brand `#A3B59D`), elementi naturali, tono intimo/familiare.
- Label data: "Data Cerimonia".

## Troubleshooting

- Se vedi "Not authenticated" sulle API: verifica JWT in header `Authorization`.
- Se la UI non mostra tab per Comunione: controlla `ClientLayoutShell.tsx` e `NavTabs.tsx`.
- Se i dati demo non compaiono: verifica la fallback demo in `communion-dashboard` GET.
