# Wedding Test Workflow (Fase 2)

Questo documento raccoglie i comandi e i passaggi manuali consigliati per verificare che l’estensione delle lingue Wedding (FR/ES/PT/ZH) e la nuova timeline funzionino prima di passare all’espansione geografica.

## 1. Comandi automatici

1. `npm run lint`
   * Controlla che i file modificati (`src/messages/*`, `supabase-wedding-translations.sql`, `TODO-wedding-launch.md`) rispettino le regole di stile e non introducano warning di Next/TypeScript.
2. `npm run test` (oppure `npm run test -- timeline` se preferisci il subset)
   * Verifica che il provider/TimelinePage non fallisca con i nuovi testi e che eventuali test automatici sul wizard continuino a passare.
3. `npm run build`
   * Conferma che la build Next (anche con i messaggi aggiunti) passa e che non ci sono errori di dynamic import o strings mancanti.

## 2. Validazione UI per le lingue

1. Avvia l’app in locale (`npm run dev`) e seleziona ciascuna delle lingue FR/ES/PT/ZH tramite lo switcher o il wizard.
2. Vai su `/[locale]/timeline`:
   * Verifica che il titolo/descrizione della timeline venga dai nuovi `timelineSteps`.
   * Controlla che ogni step visualizzi titolo + descrizione nella lingua corretta.
3. Apri `/[locale]/dashboard` e `/[locale]/onboarding` (soprattutto il wizard) per assicurarti che menu/pulsanti usino le chiavi localizzate (puoi cercare i new keys `timelineSteps` in DevTools o `next-intl`).
4. Ripeti il blocco anche su mobile/responsive (riduci la finestra) per verificare che il layout non si rompa con testi più lunghi.

## 3. Report

* Se i comandi automatici passano e le UI sono corrette, aggiorna `TODO-wedding-launch.md` con la data del check (Fase 2 completata).
* In caso di errore segnalalo qui sotto (basta aggiungere un bullet con i comandi falliti o i passi manuali da rifare).

## 4. Prossimi step

Una volta confermato il funzionamento multilingua, procedi con:

- (Fase 3) Configurazione dei paesi aggiuntivi (geo_countries e UI “coming soon”)
- (Fase 4) Test mobile + build finale + sessioni reali
