# Prima Comunione — Completamento

Questa checklist riassume le attività completate per la Prima Comunione e ciò che resta opzionale.

## Fatto

- Template con 10 categorie e sottocategorie coerenti con il tono della Comunione
- Percentuali di Idea di Budget + funzione di suggerimento importi
- API di seed (`/api/communion/seed/[eventId]`) con controllo JWT e proprietà evento
- API dashboard (`/api/my/communion-dashboard`) con fallback demo (GET) e persistenza (POST)
- Ensure-default aggiornato per creare "La mia Prima Comunione" e invocare il seed
- Navigazione: NavTabs e Layout abilitati per `communion`
- Routing: selettore tipo evento e Quick Settings reindirizzano a `/dashboard`
- Evento abilitato in `src/data/config/events.json`
- Seed SQL multi-evento opzionale: `supabase-communion-event-seed.sql`

## Opzionale / Next steps

- Test automatici aggiuntivi per le API (smoke test JWT + demo mode)
- Documentazione estesa con screenshot
- Rifiniture lint/typing su file legacy non bloccanti

## Verifica manuale suggerita

- Seleziona Comunione e verifica redirect a Dashboard
- In Idea di Budget, prova il pulsante "Suggerisci importi" per Comunione
- Autenticati e salva alcune righe su Dashboard; ricarica e controlla che persistano
