# Il Budget degli Sposi — revisione iniziale e roadmap

Verifica: 17 novembre 2026. Production invariata. Nessun dato utente modificato, nessuna migrazione applicata, nessuna password cambiata, nessun merge su main.

## Giudizio sul prodotto

L'app è un MVP avanzato con persistenza, autorizzazioni e una dotazione significativa di test. Non è ancora certificata per il lancio commerciale. Le funzioni centrali esistono: non vanno ricostruite. La priorità è chiudere difetti di integrità, riconciliare le PR e verificare il percorso reale di una coppia in un ambiente isolato.

Questo rapporto distingue **implementato nel codice**, **test automatici disponibili**, **stato del database verificato** e **certificazione runtime**. Non equivale a una nuova certificazione end-to-end di tutti i moduli: in questa sessione non sono stati eseguiti percorsi autenticati nel browser né test scriventi sul database. L'audit visuale completo mobile resta un gate esplicito, non un PASS implicito.

## Stato verificato

| Elemento | Evidenza attuale |
|---|---|
| main | `cd6b406ac2db510a1a5a06ea398a73c02d97bf7b`, confermato dal clone |
| Production Vercel | `dpl_54kfaRR3cR9Buvzfp77D82w7Ves7`, READY sullo stesso SHA |
| PR #86 | OPEN, Draft, non mergiata, head `0fbdd4b10561b685d077585f8607d176966a9d76` |
| Preview #86 | `dpl_HqMPXHuCH6i5L4GT9asm2Jh51Wk3`, READY sullo SHA esatto |
| Sei workflow #86 | success: CI, Database Rebuild, B54 compatibility, B53 compatibility, Playwright i18n, Production smoke |
| Limite smoke | Solo validatore statico eseguito; job browser Production e HTTP preflight **skipped** |
| Supabase | Progetto corretto ACTIVE_HEALTHY; 53 migrazioni fino a download documenti B53 |
| B54/B57 DB | Non applicate; ledger B54 non disponibile in Production; tre tabelle private con RLS false |
| Accesso tabelle private | anon/authenticated senza USAGE sullo schema e senza SELECT sulle tre tabelle: assenza RLS non dimostra accesso pubblico |
| ensure_subcategory | SECURITY INVOKER, `proconfig=null`: search_path non fissato; fix B57 nel repository non applicato al DB |
| Backup | Ultimo run `43918331523` fallito in export/encrypt, upload archivio skipped; ripristino non certificato |

Database Rebuild #380 esegue ricostruzione, pgTAP, regressioni RED/GREEN B53/B54/B57 e concorrenza in database isolati. È evidenza del candidato #86, non prova che le migrazioni siano in Production.

## Inventario per modulo

“Core presente” significa implementazione individuata e copertura disponibile; non assenza garantita di bug.

| Modulo | Già presente | Incompleto / problema / UX | Dipendenze | Test presenti e prossimo gate |
|---|---|---|---|---|
| Registrazione e accesso | Registrazione, conferma email, reinvio con cooldown, login, recupero password, callback, password visibile/nascosta | B54 migliora form nativo, Invio, errori rete e stato loading; miglioramenti ancora fuori Production. Consegna email reale non ricertificata oggi | Supabase Auth, provider email, routing locale | auth/resend/callback/register API, B54 Auth; prossimo: email reale e recupero sessione in backend isolato |
| Matrimonio / eventi | Creazione e riuso evento, selettore evento corrente, metadati, budget totale, ciclo vita e cancellazione protetta | PATCH event/update aggiorna events prima di validare interamente wedding_card e poi scrive la card separatamente: possibile esito parziale. Serve regressione con fault injection | events, wedding_cards, currentEvent, capabilities | lifecycle-foundation, event-create/delete, pgTAP lifecycle; aggiungere atomicità aggiornamento e concorrenza |
| Onboarding | Selezione lingua/paese/tipo e ripresa da stato server | B54 checklist prima utilità, retry e registro attivazione; ledger richiede migrazione. Non ricreare un nuovo wizard | Auth, evento, budget, fornitori | onboardingClient/Routing, branch54Recovery, e2e B54; verificare resume dopo logout e cambio dispositivo |
| Dashboard | Riepiloghi, progressione impostazione, budget, fornitori, checklist | B54 corregge progressi fuorvianti e recupero errori; audit visuale gerarchia/densità ancora da fare | Evento, spese, selezioni, onboarding | dashboard/empty, B49 integration, B54 recovery; fault injection e coerenza dopo modifiche partner |
| Budget e spese | Voci budget, spese, categorie canoniche, idea budget, entrate, collegamento fornitori, promemoria | Default source/spend_type non materializzati in main; fix in #86. Apply Idea Budget fa DELETE e INSERT separati. Imprevisti solo localStorage. #79 migliora salvataggio/conferma ma non risolve atomicità | budget_items, expenses, categorie, supplier links | B41 snapshot, B43 isolation, B45 taxonomy, B50 financial, B54; mancano prova rollback apply e concorrenza applicazioni |
| Fornitori/catalogo | Ricerca geografica, categorie, preferiti/salvati/selezionati, schede private, moderazione, collegamenti location, appuntamenti e spese | #76 non integrata e non mergeable; due cataloghi suppliers/vendors da governare. Regola riclassificazione storica non corrisponde ai dati correnti | Cataloghi, provenance, planning, budget | catalog import/search, B44 moderation, B49/B52; necessari dry-run attuale, dedup con contatti discordanti e verifica referenze |
| Invitati | Famiglie, RSVP manuale, preferenze menu/allergie, bomboniere, salvataggio snapshot, card mobile e retry | GET può restituire eccezioni interne: riprodotto e corretto su branch isolato. Da verificare conflitti tra due sessioni che salvano snapshot | Evento, family_groups, guests, tavoli | B41 GuestSnapshot, GuestMobileCard, pgTAP snapshot; aggiunti quattro test runtime della route; necessario scenario due partner |
| Tavoli | CRUD e assegnazioni, capacità, ospiti disponibili, salvataggio/cancellazione via RPC, vincoli e locking | Core presente. Restano da ricertificare interazione touch, errori/conflitti e raggiungibilità dei comandi su schermi piccoli | Invitati confermati, evento, table_assignments | Route/UI tests, pgTAP transactional/atomic/delete, concurrency B53; prossimo: mobile reale e due sessioni |
| Lista regali | CRUD persistente, URL validati, importi, priorità, stati wanted/received/archived | È una lista interna; non certificare come raccolta fondi o acquisto pubblico. Estensioni condivisione/contributi sono prodotto futuro | Evento, gift_list_items | Route/UI test, pgTAP gift list e compatibilità legacy; prossimo reload/seconda sessione e error recovery |
| Documenti | Storage privato, upload con prenotazioni/idempotenza, download autorizzato, cancellazione recuperabile e retry | Core sostanziale già implementato. Restano QA dimensione/rete lenta/mobile e ripristino coordinato DB+Storage | Auth, evento, Storage, tabelle lifecycle private | Route/UI, pgTAP lifecycle/upload races/late guard/download; revoca durante trasferimento e restore Storage da ricertificare |
| Collaborazione partner | Invito, token hash/rotazione/scadenza, accettazione/rifiuto/revoca, leave, ownership e accesso condiviso | B54 aggiunge retry e impedisce navigazione dopo leave fallito. Nessuna nuova attestazione di delivery email oggi | Auth/email, invitations/members, resolver evento | B47/B48 unit + pgTAP, partner-lifecycle e2e; due browser, revoca in corsa, invito scaduto |
| Impostazioni, lingue, mobile | Profilo, tema, cinque lingue pubbliche IT/EN/ES/FR/DE, impostazioni e navigazione adattiva | #77 menu persistente dopo navigazione; B54 focus/dialog e posizione trigger mobile. Matrice visuale attuale ancora da eseguire | Messaggi, routing, auth, layout | i18n matrix, translationCoverage, ThemeProvider, settings B54; 320–430 px, tastiera, focus, contrasto e overflow |
| Assistenza e account | Contatti UI; richiesta cancellazione account con attesa 7 giorni e annullamento | `/api/contact` restituisce 503 intenzionale. Nessun esecutore richieste cancellazione trovato in src/scripts/workflow esaminati: verificare eventuale processo operativo esterno | Coda supporto, email, Auth, dati/Storage | ProductTruth e legalTruthfulness; necessari delivery/retry e contratto operativo cancellazione, senza cancellare dati per questo audit |
| Monetizzazione / evoluzioni | Strutture Stripe, pacchetti e transazioni; Save the Date PDF | Pagamenti disabilitati da flag server; non pronti al lancio. Video Save the Date non disponibile. AI non prioritaria e non attivata in questa fase | Claim fornitori, webhook, fatturazione, costi autorizzati | monetization-disabled e subscription-security; checkout/webhook sandbox/idempotenza prima di qualunque attivazione |

### Catalogo: differenza rispetto alla PR storica

Conteggi SQL read-only del 17/11: suppliers 326 (326 VERIFIED); locations 155 (128 VERIFIED); churches 896 (1 VERIFIED).

La migrazione #76 declassa soltanto righe VERIFIED con `user_id IS NULL`, `last_verified_at IS NULL` e source fra legacy/google/openstreetmap/wikidata. **Con questa stessa condizione i candidati attuali sono zero in tutte e tre le tabelle.** Nessuno dei 326 fornitori VERIFIED ha last_verified_at nullo. La data da sola non certifica una verifica umana; non si può però affermare che oggi sia assente. La promessa storica “326 → 0 VERIFIED” non è supportata dai dati attuali. Anche il numero storico di duplicati va ricalcolato con la regola completa, non riportato come dato attuale.

## Problemi confermati e limiti delle evidenze

1. **Release gate STOP**: manca prova di backup ripristinabile e manca smoke Production corrente; non superare con i sei workflow verdi.
2. **Default prima voce budget**: differenza verificata tra parser main e #86; bug già riprodotto nei test isolati B54. Nessuna nuova scrittura Production per riprodurlo.
3. **Applicazione Idea Budget non atomica**: codice in `src/app/api/idea-di-budget/apply/route.ts` cancella le voci generate prima dell'INSERT; se INSERT fallisce, non esiste rollback applicativo. Riprodotto con fault injection della route e persistenza simulata: DELETE riuscito seguito da errore INSERT restituisce 500 e lascia vuoto il set precedente (1/1 test RED). Non è una prova SQL live né una perdita osservata di dati utente. Riproduzione conservata in `docs/audits/reproductions/idea-budget-atomicity.repro.ts`; esecuzione esplicita: `npx jest --runInBand --testRegex=idea-budget-atomicity.repro.ts$ --runTestsByPath docs/audits/reproductions/idea-budget-atomicity.repro.ts`. È intenzionalmente fuori dalla raccolta ordinaria Jest e deve risultare RED finché il difetto non è corretto.
4. **Aggiornamento matrimonio parziale**: `event/update/route.ts` può modificare events e poi rifiutare wedding_card invalida. Validare tutto prima delle scritture; atomicità da progettare separatamente.
5. **Eccezioni Invitati esposte**: test runtime RED 2/4 sulla base; fix risposta generica GREEN 4/4, auth 401 e snapshot valido preservati.
6. **Branch 55 da riconciliare**: mergeable=false al controllo; riclassificazione con impatto attuale zero. Non applicare la migrazione affidandosi al testo della PR.
7. **Imprevisti non sincronizzati**: `budgetIdea.contingencyPct` salvato in localStorage, non nella persistenza server.
8. **Supporto non operativo**: 503 esplicito per POST contatti. Pagamenti disabilitati sono un limite intenzionale, non un guasto di Production.

Avvisi Supabase: search_path mutabile, visibilità oggetti GraphQL, funzioni SECURITY DEFINER eseguibili e protezione password compromesse disabilitata. Non equivalgono automaticamente a accesso non autorizzato alle righe. Le tabelle public esaminate hanno RLS attiva; le tre private hanno privilegi diretti negati. Classificare i warning secondo accesso effettivo e ruolo prima di modificare grant/policy.

## Roadmap ordinata

Difficoltà: B=bassa, M=media, A=alta. L'ordine distingue lavoro preparabile ora da rilascio, che richiede nuova autorizzazione. P0 indica qui un gate di sicurezza/integrità, non una violazione già accertata.

| Ordine / priorità | Attività e impatto utente | Difficoltà | Dipendenze / branch | Test e definizione di completamento |
|---|---|---|---|---|
| 1 · P0 gate | Certificare backup/ripristino prima di operazioni dati | A | backup/controlled-snapshot-20261116; credenziali esistenti da non modificare | Export riuscito, restore su ambiente temporaneo, schema/ACL/count, Auth/Storage coperti o limiti espliciti; zero scritture Production |
| 2 · P1 integrità | Rendere apply Idea Budget transazionale; preservare budget su errore | M/A | Nuovo fix dedicato; budget_items; coordinare #79 | Test RED rollback su errore inserimento, concorrenza, isolamento evento/paese/source, idempotenza; migrazione solo isolata |
| 3 · P1 | Prima voce budget e percorso onboarding robusto | M | #86 comprende #72; non integrare due volte | Conservare B54/B57 CI; percorso reale signup→evento→voce→logout/login su Supabase usa e getta; nessuno skip contato PASS |
| 4 · P1 | Validazione completa e atomicità aggiornamento matrimonio | M | Nuovo fix event/update; events+wedding_cards | Nessuna modifica con payload card invalido; fault injection, rollback e due partner |
| 5 · P1 circoscritta | Non esporre eccezioni interne Invitati | B | fix/guest-read-error-disclosure-20261117 | RED→GREEN, 401 e read valido invariati; suite/typecheck/lint; Draft PR e Preview, nessun merge |
| 6 · P1 hardening | Riconciliare B57 DB e valutare CSP | M | Migrazione già in main non applicata; #83 separata | RLS/grant/ACL isolati, ricerca dipendenze search_path; browser Preview login/mappe/documenti/analytics per CSP |
| 7 · P1 catalogo | Aggiornare #76 ai dati reali, risolvere conflitti, unificare categorie | A | #76/#75, provenance, suppliers/vendors | Dry-run read-only, vecchia/nuova ricerca, no eliminazioni, contatti discordanti, referenze salvate preservate, risultato atteso ricalcolato |
| 8 · P2 | Portare chiusura menu già sviluppata | B | #77 | Test navigation/outside/Escape/focus e mobile sulla base aggiornata; riutilizzare PR esistente |
| 9 · P2 | Salvataggio Idea Budget comprensibile e conferma applicazione | B/M | #79, attività 2 | RED/GREEN esistenti, cinque lingue, reload, errore salvataggio; no duplicazione della correzione |
| 10 · P1/P2 | Persistenza imprevisti tra dispositivi | M | Nuovo branch dopo 2/9; API snapshot e DB | Migrazione compatibile, valori validi, reload/dispositivo diverso/partner; non sovrascrivere altri eventi |
| 11 · P1 prima beta pubblica | Supporto realmente consegnato e gestione richieste account | M/A | Branch 56 o successore; processo operativo da definire | Coda/retry/delivery senza falso successo; verifica presa in carico cancellazioni, senza eseguire cancellazioni non autorizzate |
| 12 · P2 | QA integrato mobile e accessibilità | M | Candidato coerente con #86/#77/#79, dati isolati | 320/360/375/390/412/430, cinque lingue, tastiera/short viewport, focus modali, overflow, touch, contrasto; evidenze per ciascun modulo |
| 13 · P2 | Concorrenza collaborazione e recupero da errori | A | Invitati/budget/documenti/tavoli, owner/partner | Due sessioni, revoca/scadenza, offline/timeout/doppio invio, nessuna sovrascrittura silenziosa; eventuale versionamento dopo riproduzione |
| 14 · P2 | Beta misurabile, performance e acquisizione | M | Stabilità core, consenso analytics, supporto | Funnel senza PII, metriche caricamento/errori, controlli pagine pubbliche/SEO; obiettivi e soglie misurati su Preview |
| 15 · P3 | Claim fornitori e monetizzazione | A | Catalogo attendibile, ruoli, consenso sui costi | Stripe sandbox, ownership, webhook duplicati/fuori ordine, riconciliazione, nessun pagamento reale |
| 16 · P3 | Contributi lista regali, video, AI, altri eventi | A | Core e beta validati, domanda utenti | Specifica separata, privacy/costi e test per feature; non riattivare CTA incomplete |

PR storiche #5/#6/#7/#15: presenti nella ricerca open, da classificare come ancora necessarie o superate con diff/current baseline. Non sono state chiuse o integrate. La sola presenza di una vecchia PR CVE non prova vulnerabilità attuale né sostituisce un audit aggiornato delle dipendenze.

## Primo sviluppo eseguito

Base isolata: main `cd6b406`; branch `fix/guest-read-error-disclosure-20261117`; commit remoto `29de6084d4c0cff9692295ae5204f4d571d9cf75`, tree `195bcb71ad3bf1a2042cfba5eca0e2640cace7af` identico a quello testato localmente. [PR #87](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/87) aperta Draft, non mergiata.

Modifica minima: l'errore inatteso in GET Invitati conserva HTTP 500 ma risponde con `GUEST_SNAPSHOT_READ_FAILED`, anziché il testo dell'eccezione. La classificazione AuthError resta 401. Nessuna migrazione, mutazione dati o modifica dei privilegi. Quattro test verificano errore resolver, errore trasporto, token invalido e snapshot valido filtrato per evento.

Validazione: RED iniziale 2 test falliti/2 passati; GREEN finale 4/4. Suite completa 122/122 e 861/861; typecheck, ESLint sui file modificati, validate e diff whitespace PASS. Corretto anche un errore di tipizzazione nel mock durante la verifica. Build/Preview/CI remoti sono gate separati da seguire sulla nuova PR; nessuna dichiarazione di release readiness.

## Fonti verificabili

- [PR #86](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/86)
- [CI #759](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/43870907465)
- [Database Rebuild #380](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/43870907466)
- [Production smoke #134: leggere i job skipped](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/43870907542)
- [Backup fallito #3](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/43918331523)
- [Catalogo #76](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/76), [menu #77](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/77), [Idea Budget #79](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/79), [CSP #83](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/83)
- [Avviso search_path Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

Le evidenze SQL sono aggregate/metadati; nessun dato personale è incluso nel rapporto. Le descrizioni storiche delle PR sono state confrontate con codice e stato corrente, non trattate come attestazioni attuali.
