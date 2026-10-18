# HANDOFF — Il Budget degli Sposi

Documento condiviso tra **Claude** e **Codex**. Leggerlo all'inizio di ogni sessione e aggiornarlo alla fine di ogni blocco di lavoro.
Fonte di verità per stato, divisione del lavoro e decisioni prese. Le decisioni legali e commerciali restano umane.

Ultimo aggiornamento: 2026-10-18 (Claude)

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
| `main` | `d296de5` (merge PR #73 e #74) |
| PR #72 — Branch 54 (Codex) | aperta, review indipendente: nessun P0/P1; P2 in lavorazione da Codex |
| PR #75 — questo `HANDOFF.md` (Claude) | aperta: **`HANDOFF.md` non è ancora su `main`**, vive solo sul branch `docs/handoff` |
| PR #76 (B55), #77, #78, #79 (Claude) | aperte, **nessuna mergiata**; `main` ancora `d296de5`. Stato CI e ordine di sblocco in §3.1 |
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
| `ci/vercel-preview-env` / #78 | Claude | `.github/workflows/playwright-i18n.yml` (riga del lookup Preview) | CI verde. **Da mergiare per prima (l'utente)**: sblocca il check `Preview integration` di #76, #77 e #79 |
| `fix/user-menu-close` / #77 | Claude | `src/components/UserMenu.tsx` | in attesa di #78 |
| `fix/budget-idea-lock` / #79 | Claude | `idea-di-budget/page.tsx`, messaggi budgetIdea | tutti i check verdi tranne `Preview integration` (blocco di #78, §3.1). Nessuna modifica al codice necessaria |
| `branch-55-data-quality` / #76 | **Claude** | catalogo: `suppliers`/`locations`/`churches`/`vendors`, categorie, `/api/suppliers`, pagine categoria e `/fornitori` | aperta (parallelo a B54, argomenti distinti). Tipi DB sincronizzati in `667d645`; `Preview integration` attende #78 (§3.1) |

### 3.1 Sblocco CI di #76 e #79 (2026-10-18)

Situazione verificata: `main` = `d296de5`, #72 e #78 **non** sono su `main`, quindi nessun merge da `main` è stato fatto (#76 e #79 sono a 0 commit di distanza da `main`) e nessun conflitto B54/B55 è stato risolto. Nessun merge, nessun rebase, nessun force push, Production non toccata.

Due cause distinte dei check rossi:
1. **`Preview integration` (#76, #79; stesso passo "Resolve exact Vercel Preview for this commit").** I deploy Vercel di queste PR hanno environment `Preview` (senza suffisso) mentre il workflow su `main` cerca solo `Preview – il-budget-degli-sposi`. #78 accetta entrambi i nomi ed è verde perché il suo branch contiene già il workflow corretto. Finché #78 non è su `main`, questo check resta rosso e **non è un difetto del codice** di #76/#79.
2. **`rebuild` (solo #76).** Tutti i passi di migration e pgTAP erano verdi; falliva `Verify committed database types are current` perché `src/types/database.types.ts` non rifletteva la migration B55. Aggiunti `supplier_category_aliases`, `supplier_category_slug()`, `suppliers.duplicate_of` e il suo FK (commit `667d645`). I tipi sono stati **derivati a mano dalla DDL** (nel cloud non c'è Supabase CLI): se la CI dovesse ancora segnalare differenze, scaricare l'artifact `current-database-types` dal run di `Database Rebuild` e copiarlo in `src/types/database.types.ts`.

Ordine di sblocco:
1. L'utente mergia **#78**.
2. Claude fa `git merge main` (no rebase, no force push) in #77, #79 e #76 e controlla i workflow.
3. Quando B54 (#72) o B55 (#76) è su `main`, l'altro branch risolve i conflitti su **tre** file: `scripts/rebuild-local-supabase.sh`, `.github/workflows/database-rebuild.yml` e `supabase/tests/pgtap-suites.txt`, tenendo **prima B54 poi B55** (la migration B54 è `20261017…`, quella B55 `20261018…`). B54 non tocca `src/types/database.types.ts`.
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
- **Repo pubblico**: scansione secret su tutta la storia git (es. gitleaks) e decisione se renderlo privato.
- Pagine pubbliche di categoria con dati errati/vuoti (vedi §4) → B55.
- `private.subcategory_identity_reservations` senza RLS → B57.
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
- **Il clone cloud è shallow e single-branch**: per altri branch usare refspec espliciti (`git fetch origin +refs/heads/X:refs/remotes/origin/X`); `checkout -b --track` fallisce.
