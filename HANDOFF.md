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

### Perimetro Beta (proposto, da confermare)
- Solo **matrimonio + Italia** visibili. Altri tipi di evento e paesi dietro feature flag.
- Coppie reali + **pochi fornitori pilota con pacchetto gratuito**, per validare i pacchetti prima di costruire i pagamenti (B60).

---

## 2. Stato attuale (verificato 2026-10-18)

| Elemento | Stato |
|---|---|
| `main` | `d296de5` (merge PR #73 e #74) |
| PR #72 — Branch 54 (Codex) | aperta, review indipendente: nessun P0/P1; P2 in lavorazione da Codex |
| PR #73 — truthfulness hotfix (Claude) | **mergiata** |
| PR #74 — 401 uniformi su `/api/my` (Claude) | **mergiata** |
| Vercel progetto reale | `il-budget-degli-sposi` → `il-budget-degli-sposi.vercel.app` (protetto da login Vercel) |
| Vercel `il-budget-degli-sposi-weom` | doppione: **scollegato da Git** il 2026-10-18 (non eliminato) |
| Dominio | **nessun dominio acquistato**; `ilbudgetdeglisposi.it` rimosso da Vercel. Il codice usa ancora `www.ilbudgetdeglisposi.it` come URL canonico |
| Costi attuali | solo GitHub. Vercel Hobby e Supabase Free |

---

## 3. Divisione del lavoro

Regole: **un branch = un proprietario**; mai gli stessi file in parallelo; **merge su `main` e gate Production li approva l'utente** (il merge su `main` fa deploy in Production).

| Chi | Cosa |
|---|---|
| **Codex** (PC dell'utente) | Roadmap principale: chiusura B54 → B55 → … ; Supabase locale, migration, gate Production |
| **Claude** (cloud) | Review indipendenti delle PR di Codex; hotfix fuori roadmap che non toccano file in lavorazione; inventari read-only; questo documento |

Prima di aprire un branch, controllare qui chi sta lavorando su cosa.

| Branch / PR | Proprietario | File principali | Stato |
|---|---|---|---|
| `branch-54-onboarding-activation-ux-mobile` / #72 | Codex | onboarding, ProgressiveSetup, event/resolve, auth page, migration activation | aperta |

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

### Prima del primo pacchetto a pagamento
- **Vercel Pro**: il piano Hobby è solo per uso non commerciale.

---

## 6. Come si lavora (invariato)

PRECHECK → SPEC → RED → IMPLEMENTAZIONE MINIMA → GREEN → RED TEAM → PR → CI → RELEASE READINESS → PRODUCTION GATE separato.
Niente DML/migration in Production senza gate; niente force push; niente cancellazione di dati utente.
