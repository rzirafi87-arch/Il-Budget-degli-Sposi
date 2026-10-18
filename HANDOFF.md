# HANDOFF — Il Budget degli Sposi

Documento condiviso tra **Claude** e **Codex**. Leggerlo all'inizio di ogni sessione e aggiornarlo alla fine di ogni blocco di lavoro.
Fonte di verità per stato, divisione del lavoro e decisioni prese. Le decisioni legali e commerciali restano umane.

Ultimo aggiornamento: 2026-10-18 (Codex; verifica B57 in corso)

### Verifica B57 — 2026-10-18 (Codex)

- Aggiornamento utente successivo: richiesto di proseguire autonomamente e indicato «cambieremo tutto più avanti», interpretato come rinvio della rotazione chiavi. P0 resta aperto. Dopo la risposta «salvata», riletti soltanto i metadati Vercel: la variabile server non mostra un aggiornamento recente; salvataggio e nuova secret quindi non verificati. Nessun redeploy, revoca legacy o migration eseguiti. La richiesta di autonomia non sostituisce il gate Production esplicito iniziale.
- **B57 non ancora chiuso.** PR #80, #81, #82, #84 e #85 confermate **mergiate** via GitHub; `main` al controllo: `cd6b406a`. Le righe storiche sotto che le indicano aperte sono superate da questo aggiornamento.
- **#83 aperta**, head `6665795cf55a15de257b9a54b780ee6964f228c5`; CI build-test e deployment Vercel verdi. Preview esatta verificata READY. Accesso temporaneo Preview autorizzato dall'utente: home e pagina login aperte, nessuna violazione CSP osservata nella console su questi percorsi. Fornitori rimanda al login; dashboard e documenti richiedono sessione di test. `NEXT_PUBLIC_GA_ID` assente nelle env Vercel al controllo: banner/Analytics non esercitabili sul deploy corrente. Giro CSP **non completato**, nessun via libera al merge finché tutti i flussi richiesti non sono verificati.
- **Migration `20261018190000_branch_57_private_rls_hardening.sql` NON applicata in Production**, verificato sia nel registro migration sia sullo stato delle tre tabelle private (RLS disattivata). `ensure_subcategory` non ha configurazione `search_path`; advisor security conferma ancora `function_search_path_mutable`. Nessuna DDL/DML eseguita. Gate richiesto prima di applicazione e prova creazione sottocategoria.
- **Rotazione chiavi parziale, non completata.** Su richiesta esplicita dell'utente, aggiornata via connettore la variabile pubblica Supabase per Production e Preview con la publishable attiva del progetto; Development preservato, metadati riletti a conferma. Nessun redeploy eseguito. Secret key ancora da creare/inserire a cura dell'utente: il connettore Supabase non offre gestione delle secret key e l'inserimento di nuove credenziali nel browser richiede intervento umano. Attendere salvataggio, gate redeploy Production e smoke login/dashboard/documenti/catalogo; solo dopo disabilitare le chiavi legacy e ripetere gli smoke. Rotazione Google Cloud ancora da eseguire. Non registrare valori o dettagli dei segreti nel repository pubblico.
- Log API Supabase, finestra mobile ultime 24 ore al controllo: richieste con ruolo privilegiato osservate soltanto da reti cloud AWS e client Node. **Attribuzione a Vercel non dimostrata**: rete/user-agent non provano l'origine; serve correlazione con log Vercel. Non equivale ad assenza accertata di accessi esterni.
- Smoke HTTP Production B57 **eseguiti**: POST wedding-planner, musica-cerimonia e musica-ricevimento anonimi → 401; POST traditions/checklist-modules → 405; categories con UUID valido senza sessione → 401 (senza parametro event → 400 INVALID_EVENT_ID). Cron check-appointments senza credenziali, con x-vercel-cron, query secret fittizio e bearer errato → 401. Cron check-subscriptions nei medesimi casi → 409 FEATURE_DISABLED (payments), prima del controllo auth: ramo bearer non verificabile in Production con feature disabilitata. Non abilitare pagamenti per lo smoke. Il bearer valido può attivare effetti del cron: richiede gate prima di provarlo. `CRON_SECRET` assente dall'inventario env del progetto: verificare configurazione prima di dichiarare operativi i cron (falliscono chiusi).
- Autorizzati dall'utente controlli Production in lettura e aggiornamento delle variabili chiavi; aggiornamento pubblico effettuato come sopra. Migration, redeploy e prove con scritture ancora senza gate. Nessun testo legale modificato. Merge #75 da chiedere all'utente dopo aggiornamento finale degli esiti.
- Sequenza roadmap confermata: terminare i gate B57, poi **chiusura B54 (#72) → B56**.
- Precheck roadmap ripreso: #72 head `82eb9b4` ha CI, rebuild, compatibilità OLD APP/NEW SCHEMA, Preview integration e lifecycle isolato verdi; resta da sincronizzare e rivalutare rispetto ai merge B57 prima del proprio gate Production. Nessun merge effettuato.
- Gate migration B57 preparato: DDL limitata a RLS sulle tre tabelle private, revoca grant a public/anon/authenticated e `search_path` vuoto su `ensure_subcategory(uuid,text)`; niente modifica di righe. CI #84 (rebuild, compatibilità e browser) verde. Verifica dopo applicazione: advisor security, stato RLS/grant e prova di creazione sottocategoria con fixture isolata in transazione conclusa da ROLLBACK, previa autorizzazione esplicita anche per tale prova.
- Google Places: chiamate dal server (`src/app/api/sync/places/route.ts`), variabile `GOOGLE_PLACES_API_KEY` assente nell'inventario Vercel al controllo. Per la nuova chiave limitare API a Places API (New), quota esplicita e IP di uscita effettivamente stabile: una restrizione referrer non corrisponde a queste chiamate server. Verificare disponibilità di egress stabile prima di configurare la restrizione IP. Revoca della vecchia chiave ancora manuale e non verificata.

---

## 1. Cos'è il prodotto

**Marketplace a due lati per l'organizzazione di eventi**, partendo dal **matrimonio in Italia**, poi altri eventi e altri paesi.

- **Coppie (utenti):** strumenti gratuiti/premium per budget, spese, invitati, tavoli, documenti, fornitori, location.
- **Fornitori (clienti paganti):** presenza nel catalogo tramite **pacchetti** (gratuiti o a pagamento), rivendicazione del profilo, visibilità.
- Il **catalogo fornitori è il prodotto venduto**: qualità, verifica e proprietà dei dati sono centrali, non accessorie.

### Decisioni dell'utente (2026-10-18)
- **Perimetro Beta confermato:** solo **matrimonio + Italia** visibili. Altri tipi di evento e paesi dietro feature flag.
- **Copertura: tutte le province italiane** (non zone pilota). Crescita del catalogo con dati aperti non verificati + rivendicazione/creazione del profilo da parte dei fornitori.
- **Categorie:** l'elenco attuale va bene; vanno eliminati i **duplicati pubblicati** nei filtri (es. `Fiori e decorazioni`/`Fiorai`/`Fiori`, `Musica e intrattenimento`/`Musica per il ricevimento`, `Location e catering`/`Location per il ricevimento`, varianti maiuscole/minuscole).
- **Modalità demo senza login: si tiene.**
- **Pacchetti fornitori:** esistono già (`SUBSCRIPTION_SYSTEM.md`: Gratuito, Base €29,90, Premium €69,90, Premium Plus €129,90/mese; pagamenti disattivati). Revisione del modello in §5 "B59".

---

## 2. Stato attuale (verificato 2026-10-18)

| Elemento | Stato |
|---|---|
| `main` | `0390eb8` (merge PR #78, 2026-10-18 17:10 UTC; prima `d296de5`, merge PR #73 e #74) |
| PR #72 — Branch 54 (Codex) | aperta, review indipendente: nessun P0/P1; P2 in lavorazione da Codex |
| PR #75 — questo `HANDOFF.md` (Claude) | aperta: **`HANDOFF.md` non è ancora su `main`**, vive solo sul branch `docs/handoff` |
| PR #76 (B55) e #79 (Claude) | aperte, **CI tutta verde** e `mergeable_state=clean` (head `a872cc0` e `2ffdae7`, con `main` già unito). **Non mergiate**: il merge spetta all'utente. Dettagli in §3.1 |
| PR #77 (Claude) | aperta, **non aggiornata da `main`**: il suo `Preview integration` è ancora rosso sul vecchio head (stesso passo di §3.1). Serve `git merge main` |
| PR #78 — CI Preview Vercel (Claude) | **mergiata** (2026-10-18 17:10 UTC) |
| PR #73 — truthfulness hotfix (Claude) | **mergiata** |
| PR #74 — 401 uniformi su `/api/my` (Claude) | **mergiata** |
| Vercel progetto reale | `il-budget-degli-sposi` → `il-budget-degli-sposi.vercel.app` (protetto da login Vercel) |
| Vercel `il-budget-degli-sposi-weom` | doppione: **scollegato da Git** il 2026-10-18 (non eliminato) |
| Dominio | **nessun dominio acquistato**; `ilbudgetdeglisposi.it` rimosso da Vercel. Il codice usa ancora `www.ilbudgetdeglisposi.it` come URL canonico |
| Costi attuali | solo GitHub. Vercel Hobby e Supabase Free |

---

## 3. Divisione del lavoro

Regole:
- **un branch = un proprietario**; mai gli stessi file in parallelo;
- **di norma un branch di roadmap alla volta, ma due branch di roadmap possono avanzare in parallelo se non toccano lo stesso argomento** (decisione utente 2026-10-18);
- **merge su `main` e gate Production li approva l'utente** (il merge su `main` fa deploy in Production).

| Chi | Cosa |
|---|---|
| **Codex** (PC dell'utente) | Roadmap principale: chiusura B54 → B56 → … ; Supabase locale, gate Production |
| **Claude** (cloud) | Review indipendenti delle PR di Codex; hotfix fuori roadmap che non toccano file in lavorazione; inventari read-only; questo documento |

Prima di aprire un branch, controllare qui chi sta lavorando su cosa.

| Branch / PR | Proprietario | File principali | Stato |
|---|---|---|---|
| `branch-54-onboarding-activation-ux-mobile` / #72 | Codex | onboarding, ProgressiveSetup, event/resolve, auth page, migration activation | aperta |
| `ci/vercel-preview-env` / #78 | Claude | `.github/workflows/playwright-i18n.yml` (riga del lookup Preview) | **mergiata** il 2026-10-18 17:10 UTC |
| `fix/user-menu-close` / #77 | Claude | `src/components/UserMenu.tsx` | aperta; #78 è su `main`, serve `git merge main` e verifica dei workflow (fuori dal blocco CI #76/#79) |
| `fix/budget-idea-lock` / #79 | Claude | `idea-di-budget/page.tsx`, messaggi budgetIdea | **CI verde** (head `2ffdae7`, merge di `main`). Nessuna modifica al codice è stata necessaria. Pronta al merge dell'utente |
| `branch-55-data-quality` / #76 | **Claude** | catalogo: `suppliers`/`locations`/`churches`/`vendors`, categorie, `/api/suppliers`, pagine categoria e `/fornitori` | **CI verde** (head `a872cc0` = merge di `main` + tipi DB sincronizzati `667d645`). Pronta al merge dell'utente; parallela a B54, argomenti distinti |
| `security/b57-unauth-catalog-writes` / #80 | Claude (B57) | POST `checklist-modules`, `traditions`, `wedding-planner`, `musica-*`; `src/lib/communitySubmission.ts`; 3 form; messaggi it/en/es/fr/de/hi | aperta |
| `security/b57-cron-auth` / #81 | Claude (B57) | `api/cron/*`, `src/lib/cronAuth.ts`, `scripts/audit-branch51-routes.mjs` | aperta |
| `security/b57-categories-authz` / #82 | Claude (B57) | `api/categories/route.ts` | aperta |
| `security/b57-csp` / #83 | Claude (B57) | `next.config.ts`, `src/config/securityHeaders.ts` | aperta; prima del merge giro su Preview con console aperta (violazioni CSP) |
| `security/b57-private-rls` / #84 | Claude (B57) | migration `20261018190000_branch_57_private_rls_hardening.sql`, pgTAP, `database-rebuild.yml`, `pgtap-suites.txt` | aperta; **migration → gate Production**; rebase atteso con #76 (stessi due file CI) |
| `security/b57-deps` / #85 | Claude (B57) | `package.json`, `package-lock.json` (next 16.3.8 + patch transitive) | aperta |

### 3.1 CI di #76 e #79 portata a verde (2026-10-18)

**Esito (verificato via API sui due head):** #76 (`a872cc0`) e #79 (`2ffdae7`) hanno tutti i check verdi e `mergeable_state=clean`; restano "skipped" solo `Supabase Preview` e, su #79, i job di smoke Production (non girano sulle PR). **Nessuna PR è stata mergiata**, nessun rebase, nessun force push, Production non toccata.

Come si è arrivati lì:
1. **`Preview integration` (#76, #79, #77), passo "Resolve exact Vercel Preview for this commit".** I deploy Vercel hanno environment `Preview` (senza suffisso), mentre il lookup su `main` cercava solo `Preview – il-budget-degli-sposi`. Il fix è #78, **mergiata su `main` alle 17:10 UTC mentre il lavoro era in corso**. La run di #76 su `667d645`, partita dopo il merge di #78, è passata anche se il file del branch conteneva ancora il lookup vecchio: la spiegazione più probabile è che nelle run `pull_request` GitHub legga il workflow dal merge-ref (branch + `main` corrente). È un'**inferenza**: i log dei job non sono leggibili dal cloud. Non era un difetto del codice di #76/#79.
2. **`main` unito nei due branch con merge semplice** (#78 tocca solo `playwright-i18n.yml`, nessun conflitto): #76 → `a872cc0`, #79 → `2ffdae7`.
3. **`rebuild` (solo #76).** Tutti i passi di migration e pgTAP erano verdi; falliva `Verify committed database types are current` perché `src/types/database.types.ts` non rifletteva la migration B55. Aggiunti `supplier_category_aliases`, `supplier_category_slug()`, `suppliers.duplicate_of` e il suo FK (commit `667d645`). I tipi sono stati **derivati a mano dalla DDL** (nel cloud non c'è Supabase CLI) e la CI li ha confermati (verde su `667d645` e su `a872cc0`). Se in futuro la CI segnalasse differenze: scaricare l'artifact `current-database-types` del run di `Database Rebuild` e copiarlo in `src/types/database.types.ts`.

Prossimi passi:
1. **L'utente decide il merge** di #76 e #79.
2. **#77**: serve `git merge main` (no rebase, no force push) e verifica dei workflow; non era nel perimetro di questo blocco.
3. **B54 (#72) non è su `main`** (aperta, head `82eb9b4` al momento del controllo), quindi nessun conflitto B54/B55 è stato ancora risolto. Quando B54 o B55 entra su `main`, l'altro branch risolve i conflitti su **tre** file: `scripts/rebuild-local-supabase.sh`, `.github/workflows/database-rebuild.yml` e `supabase/tests/pgtap-suites.txt`, tenendo **prima B54 poi B55** (la migration B54 è `20261017…`, quella B55 `20261018…`). B54 non tocca `src/types/database.types.ts`.
4. I merge su `main` restano all'utente.

---

## 4. Inventario catalogo (Production, read-only, 2026-10-18)

| Tabella | Righe | Note |
|---|---|---|
| `suppliers` | 326 | **tutte `source=legacy`, tutte `VERIFIED`, nessuna rivendicata**. **199 duplicati** per nome+città → circa **127 fornitori unici**. 10 regioni coperte; alcune righe messicane con `country_code=IT` |
| `vendors` (pagine categoria pubbliche) | 431 | catalogo **separato** da `suppliers`: 307 da `google` segnati `verified=true`, 124 `manual` |
| `locations` | 155 | 128 `legacy` segnate `VERIFIED`, 23 OpenStreetMap, 4 Wikidata |
| `churches` | 896 | 895 da Wikidata (`PROBABLE`), **nessun contatto** |
| `categories` / `subcategories` | 339 / 1960 | categorie duplicate per maiuscole/sinonimi (es. `Fotografi`/`fotografi`, `Fiori & Decor`/`Fiorai`/`fiori`) |
| `saved_suppliers` | 0 | nessuna coppia ha ancora salvato fornitori |

**Implicazioni per B55 (Codex):**
1. Due cataloghi paralleli (`suppliers` vs `vendors`) spiegano perché `/it/fornitori` e `/it/fiorai`, `/it/fotografi` mostrano dati diversi: va scelto **un solo catalogo canonico**.
2. "Verificato" va riservato ai profili **rivendicati e controllati**. `legacy`, `google`, OSM e Wikidata = non verificati.
3. Dati importati da Google: verificare la compatibilità con i termini di Google Maps Platform (limiti alla conservazione dei dati).
4. Deduplica con regole d'identità, senza fusioni automatiche dei casi ambigui (come da roadmap 55.2).
5. Crescita del catalogo: dati aperti (OSM con attribuzione ODbL, Wikidata) marcati non verificati, più **rivendicazione/creazione profilo da parte del fornitore**. **No scraping** di siti terzi (termini d'uso, diritto sulle banche dati, GDPR per ditte individuali).

---

## 5. Backlog aperto (non assegnato a PR aperte)

### Prima della Beta
- **Dominio** da acquistare. Poi: Supabase Auth → Site URL = dominio, redirect `https://<dominio>/**`; togliere le 4 voci del vecchio progetto `-kbg1`. Oggi la Site URL è l'indirizzo `.vercel.app` protetto da login Vercel: con utenti esterni, conferma email e recupero password finirebbero sul login di Vercel.
- **Supabase Free**: progetto messo in pausa dopo 7 giorni di bassa attività → valutare Pro per la Beta.
- **Repo pubblico**: scansione secret sulla storia git **fatta** (B57, 2026-10-18). Ci sono **azioni manuali dell'utente in sospeso** su Supabase e Google Cloud, descritte nel report privato B57 (non nel repo). Resta la decisione se renderlo privato.
- Pagine pubbliche di categoria con dati errati/vuoti (vedi §4) → B55.
- `private.subcategory_identity_reservations` senza RLS → B57, PR #84 (non raggiungibile oggi; difesa in profondità).
- B57 seguiti: CSP con nonce (**prima Report-Only su Preview**, dopo #83); attivare Supabase Auth "leaked password protection" con gate utente; rimuovere o correggere `/api/public/[publicId]` e `/api/share/[token]`, che interrogano colonne/tabelle inesistenti (500/503); decisione umana sul rendere privato il repository.
- Modalità demo anonima su GET `/api/my/*` (dashboard, expenses, guests, incomes): decidere se tenerla. Il test `anonymousAccess.test.ts` garantisce che non legga il database.
- `/api/event/resolve` chiamato 2 volte per pagina.

### Legale (B57, con un legale)
- Titolare del trattamento come persona fisica/giuridica; confermare `privacy@` e la PEC.
- Termini: clausola "esclusivamente Foro di Roma" con consumatori.
- **Marketplace con fornitori paganti**: regolamento UE P2B (condizioni per i fornitori, trasparenza del ranking), segnalazione dei risultati sponsorizzati ai consumatori.
- Fatturazione elettronica B2B e IVA sui pacchetti (B60–61).

### B59 — revisione pacchetti (proposta Claude, decisione umana)
- Oggi il **Gratuito è invisibile** nelle ricerche: con un catalogo nuovo e zero fornitori paganti le coppie vedrebbero un catalogo vuoto. Proposta: profilo gratuito **visibile** con richieste di preventivo via piattaforma; si paga per posizione, contatti diretti, contenuti extra e statistiche (modello simile ai marketplace di settore).
- Il badge **"Fornitore Certificato" incluso nel Base a pagamento** fa sembrare comprabile una certificazione: "Verificato" deve dipendere da un controllo (es. P.IVA), non dal pacchetto. Le posizioni a pagamento vanno etichettate come sponsorizzate.
- La pagina pubblica `/pacchetti-fornitori` mostra prezzi non ancora decisi: fuori dal perimetro Beta.
- Esistono già `src/app/api/stripe/checkout` e `subscription_transactions`: B60 non parte da zero, ma il provider va comunque confermato (roadmap 60.1).
- 4 righe `premium_plus` in `suppliers` sono dati di test messicani scaduti → pulizia B55.

### Prima del primo pacchetto a pagamento
- **Vercel Pro**: il piano Hobby è solo per uso non commerciale.

---

## 6. Regole d'uso degli assistenti (decisione utente 2026-10-18)

Per non restare fermi per i limiti di utilizzo:
- **Sonnet** per i fix di routine (bug piccoli, test, copy, piccoli refactor).
- **Opus** per review indipendenti, architettura, sicurezza e specifiche.
- **Una chat nuova per ogni branch**, che parte leggendo questo `HANDOFF.md`; aggiornare questo file alla fine di ogni blocco di lavoro.
- Evitare browser/screenshot quando bastano codice, log e API; leggere solo i file e le righe necessari.

## 7. Come si lavora (invariato)

PRECHECK → SPEC → RED → IMPLEMENTAZIONE MINIMA → GREEN → RED TEAM → PR → CI → RELEASE READINESS → PRODUCTION GATE separato.
Niente DML/migration in Production senza gate; niente force push; niente cancellazione di dati utente.

## 8. Limiti dell'ambiente cloud di Claude (per chi riprende il lavoro)

Verificati il 2026-10-18; non sono bug del repo.
- **`gh pr view` e ogni chiamata GraphQL sono bloccati.** Usare le API REST: `gh api repos/<repo>/pulls/N`, `.../commits/<sha>/check-runs`, `.../actions/jobs/<id>` (passi) e `.../check-runs/<id>/annotations`.
- **Log dei job e artifact di Actions non scaricabili dal cloud**: il gateway rifiuta l'host blob di GitHub. Dal cloud si vede solo *quale passo* fallisce, non l'output (es. il diff dei tipi). Per leggere l'output serve l'utente o Codex dal PC.
- **Nessuna Supabase CLI e nessun Docker nel cloud**: i tipi DB (`src/types/database.types.ts`) non si possono rigenerare lì. Dal PC: `supabase gen types typescript --local`, oppure copiare l'artifact `current-database-types` del run di `Database Rebuild`.
- **Il clone cloud è shallow e single-branch**: per altri branch usare refspec espliciti (`git fetch origin +refs/heads/X:refs/remotes/origin/X`); `checkout -b --track` fallisce (e può lasciare indice e working tree su un altro albero: controllare `git status`).
- **`git push origin X:X` non aggiorna `origin/X`** con questo refspec: l'hook di fine sessione può segnalare commit "non pubblicati" già presenti sul remoto. Basta rifare il fetch esplicito di `X` e confrontare con `git ls-remote`.
- **Probabile (inferito, non verificato sui log): nelle run `pull_request` il workflow viene letto dal merge-ref (branch + `main` corrente)**, quindi una modifica al workflow già su `main` varrebbe anche per le PR che non la contengono, a partire dal prossimo push.
