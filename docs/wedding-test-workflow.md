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

## 2.1 Check aggiuntivi per i paesi

* Verifica che la lista dei paesi (`src/data/locales.ts` / `COUNTRIES`) mostri i nuovi entry (Spagna, Francia, India, Giappone, Regno Unito, Emirati, USA, Brasile, Germania, Canada, Cina, Indonesia). Mantieni lo stato “coming soon” attivo finché non testi i contenuti specifici.
* Controlla che `src/constants/geo.ts` fornisca almeno una regione placeholder per ciascun paese, così la UI responsive non rompe la ricerca geografica.

## 3. Report

* Se i comandi automatici passano e le UI sono corrette, aggiorna `TODO-wedding-launch.md` con la data del check (Fase 2 completata).
* In caso di errore segnalalo qui sotto (basta aggiungere un bullet con i comandi falliti o i passi manuali da rifare).

## 4. Prossimi step

Una volta confermato il funzionamento multilingua, procedi con:

- (Fase 3) Configurazione dei paesi aggiuntivi (geo_countries e UI “coming soon”)
- (Fase 4) Test mobile + build finale + sessioni reali

## 4.1 Workflow Fase 4

1. **Test mobile completo** su onboarding (+wizard), dashboard, budget, invitati, timeline, ripetendo i flussi in landscape/portrait su due breakpoint (sm/md). Tieni traccia di screenshot o note di layout che si rompono (padding, overflow).
2. **Build finale** (`npm run build`) con `node --trace-warnings` se vuoi indagare warning addizionali; cattura eventuali errori di stringhe mancanti o moduli dynamic.
3. **Sessione tester reali (soft beta)**: invita 1–3 persone, chiedi di completare un wedding (lingua es. FR, nazione ES); raccogli feedback su bug, confusione UX, testi scorretti e inseriscili in `docs/wedding-beta-feedback.md` (nuovo file da creare se necessario).
4. **Fix immediati**: correggi bug critici, poi ricorri al TODO per segnare i passaggi completati (soprattutto il test mobile e la build finale).
