# Branch 52 — Location, supplier, private catalog & timeline integration

## Stato e confini

Branch 52 è avviato esclusivamente in audit. Questo documento non introduce
funzionalità, migration, DML, fixture, backfill o modifiche a Production.

- Branch: `branch-52-location-supplier-catalog-timeline`
- Base autorevole: `08c7f95c380d1a307a6cc8746f7bfbb57e20c27a`
- Production: `dpl_CNhPuEc32DMVQ23C7mKG6iZyxacB`, `READY` sullo stesso SHA
- Production smoke #31: 37 PASS, 0 FAIL, 87 skip selettivi
- Event type: solo `wedding` / Matrimonio è `READY`
- Costo aggiuntivo: 0 €
- Snapshot Production read-only: 2026-09-19 08:18:15–08:24:07 UTC

### Scope

1. Location ↔ Fornitore, distinguendo associazioni globali da associazioni
   private dell'evento.
2. Cataloghi globali ↔ elementi salvati o privati, snapshot, override,
   preferiti, deduplica e provenienza.
3. Fornitore ↔ Timeline, appuntamenti, scadenze e navigazione.
4. Owner, partner attivo/revocato, estraneo, anonimo, CurrentEvent e IDOR.
5. UX desktop/mobile 320–430 px, light/dark, IT/EN/ES/FR/DE, stati e
   accessibilità.

### Fuori scope

- notifiche avanzate, scadenze automatiche dei pagamenti e automazioni
  avanzate Timeline (Branch 53);
- nuovi event type, monetizzazione, Stripe, marketplace, AI, dominio o email;
- classificazione/cleanup degli owner legacy assenti da Auth;
- riscrittura, deduplica distruttiva o backfill dei cataloghi reali;
- Branch 53 o successivi.

## Preflight

| Controllo | Esito | Evidenza |
|---|---|---|
| `origin/main` | PASS | `08c7f95c380d1a307a6cc8746f7bfbb57e20c27a` verificato prima della creazione |
| PR #64 / #65 / #66 | PASS | tutte `MERGED`; #66 produce lo SHA autorevole |
| Production | PASS | Vercel `READY`, target `production`, commit `08c7f95...` |
| Smoke #31 | PASS | 33 test principali + 4 M8; 87 skip selettivi |
| CI main #598 | PASS | run `35430297383` sullo SHA autorevole |
| Migration history | PASS | Production termina con `20260916193000_branch_51_least_privilege`; nessuna migration Branch 52 |
| Working tree | PASS | copia pulita separata; le due copie precedenti con modifiche estranee non sono state toccate |
| Branch 52 / Branch 53 preesistenti | PASS | assenti prima della creazione |

La versione remota registrata per l'ultima migration usa il timestamp di
applicazione `20260917102836` e conserva nel nome il filename canonico
`20260916193000_branch_51_least_privilege`. È lo stato già applicato e
verificato di Branch 51, non una migration Branch 52 pendente.

## Inventario tecnico

### Modello dati

| Area | Oggetti correnti | Contratto corrente |
|---|---|---|
| Cataloghi globali | `churches`, `locations`, `suppliers` | Lettura pubblica; scrittura applicativa diretta disabilitata. Identità tramite UUID, campi normalizzati, `google_place_id` e `(source, external_id)` quando disponibili. |
| Stato privato evento | `saved_churches`, `saved_locations`, `saved_suppliers` | FK al catalogo globale, FK evento `ON DELETE CASCADE`, unicità per evento/elemento; note, stato, selezione e dati commerciali privati. |
| Preferiti | `user_favorites`; flag `favorite` nelle tre `saved_*` | `user_favorites` è user-global e non event-scoped; i flag `saved_*` sono event-scoped. I due modelli non sono riconciliati. |
| Location ↔ Fornitore globale | `supplier_locations` | PK `(supplier_id, location_id, relationship_type)`; tipi `works_at`, `preferred_supplier`, `internal_supplier`, `external_allowed`, `recommended`, `historic_relationship`; lettura pubblica, scrittura service-role. |
| Location ↔ Fornitore privato | nessun oggetto | Non esiste un'associazione modificabile per evento tra `saved_locations` e `saved_suppliers`. |
| Timeline canonica | `timeline_items` | Event-scoped; contiene `saved_supplier_id` FK `ON DELETE SET NULL` e indice dedicato. |
| Timeline legacy/template | `event_timelines`, `user_event_timeline` | Tabelle presenti ma vuote in Production; la UI corrente usa `timeline_items`. |
| Appuntamenti | `appointments` | Event-scoped e protetto; nessun riferimento a fornitore salvato. |
| Finanza fornitore | `budget_items.saved_supplier_id`, `expenses.saved_supplier_id`, `payment_reminders.expense_id` | Collegamento stesso-evento già implementato nelle API Branch 50; FK fornitore `ON DELETE SET NULL`. |
| Provenienza | campi `source*` sui cataloghi + `catalog_provenance` | Provenienza globale server-only; nessuno snapshot di provenienza sulle `saved_*`. |

### Constraint, indici, trigger e cancellazioni

- `saved_suppliers`: unique `(event_id, supplier_id)`; FK catalogo
  `ON DELETE RESTRICT`; FK evento `ON DELETE CASCADE`.
- `saved_locations`: unique `(event_id, location_id, location_role)`; una sola
  selezionata per `(event_id, location_role)`; FK catalogo `RESTRICT`; evento
  `CASCADE`.
- `saved_churches`: unique `(event_id, church_id)`; una sola selezionata per
  evento; FK catalogo `RESTRICT`; evento `CASCADE`.
- `supplier_locations`: FK globali entrambe `ON DELETE CASCADE`; nessun
  `event_id`.
- `timeline_items.saved_supplier_id`, `budget_items.saved_supplier_id` ed
  `expenses.saved_supplier_id`: FK verso `saved_suppliers`, `ON DELETE SET NULL`.
- `appointments.event_id` e `timeline_items.event_id`: `ON DELETE CASCADE`.
- I trigger di normalizzazione/`updated_at` sono presenti sui cataloghi e sulle
  relazioni salvate. Non esiste un trigger che provi l'appartenenza allo stesso
  evento di una relazione Location ↔ Fornitore perché tale relazione privata
  non esiste ancora.

### RLS, grant e funzioni

- Tutte le tabelle coinvolte hanno RLS attiva.
- Cataloghi globali e `supplier_locations`: solo `SELECT` a `anon` e
  `authenticated`; privilegi completi soltanto a `service_role`.
- `catalog_provenance`: nessun grant a `anon`/`authenticated`; service-role
  only.
- `saved_*`, `timeline_items`, `appointments`, Budget/spese: CRUD a
  `authenticated` più policy basate su `can_access_event(event_id)`.
- `user_favorites`: CRUD per `authenticated`, policy `auth.uid() = user_id`;
  non è event-scoped.
- `can_access_event(uuid)` e `is_event_owner(uuid)` sono `SECURITY DEFINER`,
  hanno `search_path` fissato, verificano `auth.uid()` e non sono eseguibili da
  `PUBLIC`/`anon`. Sono concessi a `authenticated`; `service_role` mantiene il
  proprio accesso amministrativo.
- Il fallback email legacy in `can_access_event` è disabilitato appena esiste
  una membership canonica per quell'utente/evento; una membership revocata o
  lasciata non può ricadere nel fallback.

### Route, UI, hook e chiamanti

| Tipo | Percorsi |
|---|---|
| Ricerca catalogo canonica | `/api/catalog/search`; wrapper `/api/churches`, `/api/locations`, `/api/suppliers` |
| Stato privato canonico | `/api/my/churches`, `/api/my/locations`, `/api/my/suppliers`, `/api/my/planning-selections` |
| Preferiti | `/api/my/favorites`, `useFavorites`, pagina `/[locale]/preferiti` |
| Timeline | `/api/my/timeline`, pagina `/[locale]/timeline` |
| Appuntamenti | `/api/my/appointments`, `/api/my/appointments/[id]`, pagina `/[locale]/documenti/appuntamenti` |
| Finanza | `/api/budget-items`, `/api/my/expenses`, `/api/payment-reminders`, controlli Budget/Spese |
| Catalog UI | `/[locale]/chiese`, `/[locale]/location`, `/[locale]/fornitori`, `/[locale]/fornitori/[id]` |
| Alias/legacy | `/[locale]/ricevimento/location` re-esporta Location; restano route appuntamenti non localizzate e copie `/it`/`en`; le pagine categoria fornitore usano `user_favorites`, non `saved_suppliers` |

`CurrentEvent` è risolto da `event_members` attive, owner e fallback legacy; il
cookie HTTP-only è soltanto un hint e viene accettato solo se l'evento compare
nel set accessibile. Le API private ignorano `event_id` dal body/query e
derivano l'evento dal contesto server. Le mutazioni di risorse filtrano sia
`id` sia `event_id`.

### Debito statico rilevante

- `select("*")` resta in `/api/my/suppliers` e `/api/my/favorites`; il resto
  delle route private principali usa proiezioni esplicite.
- `useFavorites` e varie pagine ricavano inline la sessione browser e inviano
  manualmente il bearer token; le API usano comunque `requireUser`.
- `/api/my/favorites` non valida UUID, rating, lunghezze o esistenza/tipo del
  record globale e restituisce messaggi DB grezzi.
- `/api/my/timeline` non espone né accetta `saved_supplier_id`, benché schema,
  FK e indice esistano; validazione UUID e limiti payload sono incompleti.
- `/api/my/appointments` non collega fornitori; GET anonimo restituisce demo e
  gli errori CurrentEvent sono appiattiti in 500.
- `/api/suppliers/[id]` seleziona `photo_urls`, `video_urls` e `discount_info`,
  colonne assenti dallo schema Production e dai tipi generati. Il dettaglio
  fornitore reale è quindi un blocco funzionale da correggere prima
  dell'integrazione Branch 52.

## Flussi correnti

1. **Globale → salvato privato:** ricerca pubblica → POST `/api/my/<entity>` →
   validazione UUID/esistenza globale → insert `saved_*` con `event_id` server.
   Vengono salvati riferimento e campi privati, non uno snapshot del catalogo.
2. **Privato → evento:** tutte le `saved_*` hanno `event_id`; Dashboard legge
   solo selezioni dell'evento corrente. Eliminazione evento rimuove le righe in
   cascata.
3. **Location → Fornitore:** solo schema globale `supplier_locations`, vuoto in
   Production e senza API/UI dedicata. Nessun flusso privato event-scoped.
4. **Fornitore → Budget/spesa:** implementato; ogni riferimento viene verificato
   nello stesso evento prima della scrittura. La rimozione del fornitore
   salvato scollega Budget/spesa/timeline con `SET NULL`; promemoria legati alla
   spesa impediscono unlink non sicuri.
5. **Fornitore → Timeline:** predisposto soltanto nello schema tramite
   `timeline_items.saved_supplier_id`; API e UI non lo usano.
6. **Cambio/rimozione CurrentEvent:** cambio cookie ricarica le pagine; le API
   rivalutano l'accesso. Eliminazione evento cancella il cookie o seleziona il
   successivo accessibile.
7. **Revoca partner:** `event_members.status` non attivo rimuove immediatamente
   l'evento dal resolver e dalle policy. I token restano autenticati ma non
   autorizzati alle righe dell'evento.

## Baseline Production read-only

Fingerprint: MD5 deterministico degli hash delle righe `to_jsonb`, ordinati;
serve solo come confronto di preservazione, non come obiettivo da ripristinare.

| Relazione | Righe | Fingerprint | Ultima modifica disponibile |
|---|---:|---|---|
| `events` | 26 | `0973ac2396ddff6abb3590e6a1490fcb` | 2026-09-19 06:45:43 UTC |
| `event_members` | 22 | `3dbf4b65643f606102f77701699005ec` | 2026-09-19 07:53:51 UTC |
| `suppliers` | 326 | `4d3bd2874d8031de2f68fb9b8f5c3b86` | 2026-08-30 18:35:45 UTC |
| `locations` | 155 | `8523cd712229d2c4d69fd8a6470a375c` | 2026-09-10 08:30:22 UTC |
| `churches` | 896 | `6933d39c916d32c79dd886fe42cc0a7a` | 2026-09-09 21:12:06 UTC |
| `saved_suppliers` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `saved_locations` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `saved_churches` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `user_favorites` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `supplier_locations` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `timeline_items` | 166 | `c78cba187dd781f06487da948c4ffb93` | 2025-11-04 10:27:14 UTC |
| `appointments` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `event_timelines` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `user_event_timeline` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |
| `catalog_provenance` | 922 | `796fb7bcdbb206beb02a07fa34198e15` | 2026-09-10 08:30:22 UTC |
| `budget_items` | 15 | `ae15d8745a8ddc2a172094c99f35e543` | campo timestamp assente |
| `expenses` | 610 | `63736c8e7700e35b43f19cfff0a3b76a` | 2026-09-19 06:46:58 UTC |
| `payment_reminders` | 0 | `d41d8cd98f00b204e9800998ecf8427e` | — |

Riconciliazione:

- owner assenti da `auth.users`: 11; owner presenti: 15;
- membership: 21 attive, 1 `left`, 0 revocate; 0 riferimenti a evento/utente
  mancante;
- residui QA Branch 51: 0 utenti Auth, 0 profili, 0 eventi posseduti, 0
  membership;
- link fornitore: 0 Timeline, 0 Budget, 0 spese; nessun riferimento rotto;
- provenienza: 895 chiese, 27 location, 0 fornitori; nessun
  `catalog_provenance.entity_id` nullo;
- record senza riga `catalog_provenance`: 1 chiesa, 128 location, 326 fornitori;
- tutti i cataloghi hanno `normalized_name`; gruppi omonimi per identità debole
  `(normalized_name, country_code, city)`: chiese 0, location 0, fornitori 117.
  Non sono classificati automaticamente come duplicati da eliminare.

I numeri sono uno snapshot, non un target da ripristinare. Qualunque futura
migration deve acquisire un nuovo pre/post snapshot e preservare i dati
presenti in quel momento.

## Matrice funzionale finale

Legenda stato: **IMPLEMENTATO**, **PREDISPOSTO**, **DA MODIFICARE**,
**RINVIATO**, **FUORI SCOPE**.

| ID / requisito | Stato | Evidenza e comportamento attuale | Rischio | Intervento minimo / milestone | Migration | Test richiesti | Dati da preservare |
|---|---|---|---|---|---|---|---|
| R01 Cataloghi globali church/location/supplier | IMPLEMENTATO | Migration B26–B32; API catalog/search; lettura pubblica con proiezioni | Basso | Conservare il read model / M1 | No | unit route + Data API anon/auth | Tutti i record globali e UUID |
| R02 Salvataggio event-scoped dei tre cataloghi | IMPLEMENTATO | `saved_*`, route `/api/my/*`, `event_id` server-side | Medio: supplier usa `select(*)` | Proiezione esplicita / M1 | No | unit contratti; SQL RLS; PW owner/partner | Stato, note, selezione, importi |
| R03 Snapshot del globale al salvataggio | DA MODIFICARE | `saved_*` conserva solo FK e campi privati | Alto: mutazioni globali cambiano retroattivamente la vista privata | Aggiungere snapshot versionato e fingerprint origine / M2 | Sì | unit serializer; SQL default/backfill-safe; PW visualizzazione | FK e campi privati esistenti |
| R04 Override privati senza mutare il globale | PREDISPOSTO | note/status/importi privati esistono; non esiste override strutturato di nome/contatti | Medio | Override allowlisted separato dallo snapshot / M2 | Sì | unit merge; SQL isolamento; PW edit/reset | Valori globali e note correnti |
| R05 Record interamente privati | DA MODIFICARE | FK globali `NOT NULL`; impossibile salvare un'entità solo evento | Alto | Modello additivo privato o FK nullable con XOR + identità privata / M2 | Sì | unit identità; SQL FK/check/RLS; PW CRUD | Nessuna conversione dei cataloghi reali |
| R06 Deduplica/identità canonica | PREDISPOSTO | normalizzazione, source/external ID e Google ID; saved uniqueness per UUID | Alto sui 326 fornitori legacy con 117 gruppi omonimi | Non deduplicare Production; definire chiave privata e test collisioni / M2 | Possibile | unit dedup; SQL unique parziali; PW conflitto | 326 fornitori invariati |
| R07 Provenienza globale e privata | PREDISPOSTO | source fields + 922 provenance; nessuna provenance nello snapshot privato | Medio/alto: cataloghi legacy senza provenance table | Copiare evidenza disponibile nello snapshot senza backfill globale / M2 | Sì | unit provenance; SQL immutable snapshot | 922 righe e source fields |
| R08 Preferiti user-global | IMPLEMENTATO | `user_favorites`, RLS per `user_id`; non concede accesso ai cataloghi | Medio: item polymorphic senza FK/validazione | Validare tipo/UUID/esistenza, proiezione/errori / M1 | No | unit input/IDOR; SQL RLS; PW add/remove | Eventuali preferiti creati dopo snapshot |
| R09 Preferiti event-scoped | PREDISPOSTO | flag `favorite` nelle `saved_*`, separato da `user_favorites` | Alto: doppio significato e UI incoerente | Dichiarare user-global discovery vs event shortlist; non fondere implicitamente / M2 | No o Sì secondo contratto | unit mapping; SQL isolamento; PW cambio evento | Entrambi i modelli senza perdita |
| R10 Location ↔ Fornitore globale | PREDISPOSTO | `supplier_locations`, tipi e provenienza presenti; 0 righe, nessuna API/UI | Medio | Read API esplicita e visualizzazione; write solo pipeline/admin / M3 | No | unit read; Data API read-only; PW dettaglio location | Tabella e tipi correnti |
| R11 Fornitore interno/consigliato dalla location | PREDISPOSTO | enum globale contiene `internal_supplier`, `preferred_supplier`, `recommended` | Medio | Esporre label/provenienza senza inventare righe / M3 | No | unit enum; PW filtri/badge | Nessun seed fittizio |
| R12 Associazione Location ↔ Fornitore privata evento | DA MODIFICARE | nessuna relazione tra `saved_locations` e `saved_suppliers` | Alto | Tabella event-scoped con prova same-event, tipo, origine e note / M3 | Sì | unit API; SQL owner/partner/revoked/IDOR; PW CRUD | saved rows e UUID globali |
| R13 Modifica/rimozione associazione | DA MODIFICARE | nessuna API/UI privata | Alto | PATCH/DELETE filtrati per evento e risorsa / M3 | Con R12 | unit allowlist; SQL RLS; PW edit/remove | Nessuna cancellazione dei cataloghi |
| R14 Fornitore ↔ Budget/spesa | IMPLEMENTATO | FK e API B50 con guard same-event | Basso | Regressione soltanto / M6 | No | unit esistenti + SQL FK + PW link/unlink | 15 Budget, 610 spese |
| R15 Fornitore ↔ Timeline schema | PREDISPOSTO | `timeline_items.saved_supplier_id`, FK SET NULL, indice | Medio | Nessuna nuova colonna Timeline / M4 | No | SQL FK/RLS; unit same-event | 166 Timeline invariati |
| R16 Fornitore ↔ Timeline API/UI | DA MODIFICARE | route non legge/scrive il riferimento; nessuna navigazione | Alto | Proiezione, input UUID/null, guard same-event, link bidirezionali / M4 | No | unit route; SQL IDOR; PW supplier↔task | Titoli/date/completamento esistenti |
| R17 Fornitore ↔ appuntamento | DA MODIFICARE | `appointments` non ha supplier FK | Medio | FK opzionale a `saved_suppliers` + guard same-event / M4 | Sì | unit; SQL FK/RLS; PW create/delete/nav | Appuntamenti futuri |
| R18 Scadenze/attività manuali | PREDISPOSTO | `due_date`, `days_before`, appuntamenti e attività manuali esistono | Medio | Integrare senza automazione / M4 | No | unit date; PW stati | 166 Timeline |
| R19 Notifiche/scadenze automatiche pagamenti | RINVIATO | nessuna automazione autorizzata | — | Branch 53 | No in B52 | Solo predisposizione contrattuale | Payment reminders invariati |
| R20 Automazioni avanzate Timeline | RINVIATO | fuori dal contratto B52 | — | Branch 53 | No in B52 | Nessun test B52 salvo non-regressione | Timeline invariata |
| R21 Owner e partner attivo | IMPLEMENTATO | `can_access_event`, `requirePlanningSelectionAccess`, CurrentEvent | Medio: service role richiede guard esplicita ovunque | Riutilizzare helper condivisi / M1-M6 | No | unit ruoli; SQL/Data API; PW owner/partner | Membership |
| R22 Partner revocato/left | IMPLEMENTATO | membership non attiva esclusa; fallback legacy bloccato dalla presenza canonica | Basso | Regressione dedicata / M6 | No | SQL + PW revoca durante sessione | 1 membership `left` |
| R23 Estraneo e anonimo | IMPLEMENTATO | privato 401/404/no row; globali leggibili | Medio: GET favorites/timeline/appuntamenti anonimi usa empty/demo 200 | Uniformare contratto API privato / M1 | No | unit 401; Data API anon; PW redirect | Cataloghi pubblici |
| R24 CurrentEvent manipolato | IMPLEMENTATO | cookie accettato solo se evento nel set accessibile | Basso | Regressione su tutte le nuove route / M6 | No | unit + PW cookie tamper | Cookie/selection UX |
| R25 `event_id`/resource ID alterati | IMPLEMENTATO PARZIALE → DA MODIFICARE | route saved/finanza filtrano evento; favorites non è event-scoped; timeline valida poco gli ID | Medio | UUID, allowlist, same-event guard per nuove relazioni / M1-M4 | No | unit IDOR; SQL; PW cross-event | Risorse evento |
| R26 Eliminazione evento | IMPLEMENTATO | CASCADE per saved/timeline/appointments; link supplier finanziari SET NULL quando si rimuove il saved supplier | Medio per nuove tabelle | Definire CASCADE nuove relazioni e test snapshot / M3-M6 | Sì con nuove tabelle | SQL delete lifecycle; PW delete event | Conteggi/fingerprint pre/post mirati |
| R27 UX 320–430 px | PREDISPOSTO | componenti responsive; smoke attuale verifica Location/Fornitori a 390, Budget/Spese a 320/390/430 | Medio | Estendere matrix a 320/390/430 per tutti i flussi B52 / M5 | No | PW overflow/azioni/dialog | UX attuale |
| R28 Light/dark | DA MODIFICARE | le sei pagine B52 non contengono varianti `dark:` dedicate | Medio/alto leggibilità | Token/superfici dark e test contrasto / M5 | No | unit classi minime; PW light/dark | Tema globale |
| R29 IT/EN/ES/FR/DE | IMPLEMENTATO per baseline, DA ESTENDERE per B52 | 2.906 chiavi per locale, 0 missing/extra/placeholder/residui | Basso | Aggiungere chiavi identiche per le nuove UI / M5 | No | Jest coverage; PW locale matrix | Dizionari esistenti |
| R30 Loading/empty/error/retry | DA MODIFICARE | loading/empty diffusi; retry esplicito solo Chiese; error handling incoerente | Medio | State component condivisi e retry non distruttivo / M5 | No | unit stati; PW network fail/retry | Nessun dato cancellato su retry |
| R31 Tastiera/screen reader | PREDISPOSTO | diversi `aria-*`; Preferiti e Timeline hanno copertura semantica ridotta | Medio | focus, live regions, nomi accessibili, tastiera / M5 | No | Testing Library + axe se disponibile; PW keyboard | Label tradotte |
| R32 Dettaglio fornitore | DA MODIFICARE — BLOCCANTE | API richiede 3 colonne inesistenti in Production | Alto: profilo reale non caricabile | Allineare proiezione e tipi allo schema reale prima dell'integrazione / M1 | No | unit schema contract; PW dettaglio reale | 326 fornitori invariati |
| R33 Gate DB affidabile | IMPLEMENTATO — M0 CHIUSA | Database Rebuild #258 usa il runner TAP, esegue 5 suite/50 assertion e prova 6 casi controllati; ogni non-PASS termina non-zero | Basso: manifest e parser sono regressioni permanenti | Conservare manifest, prove negative e riepilogo nei log / M0 | No | workflow negativo/positivo PASS | Nessuna modifica Production |
| R34 Nuovi event type | FUORI SCOPE | `wedding` unico READY; altri 17 COMING_SOON | Critico se alterato | Nessuna modifica / tutti i milestone | No | test capability esistenti | Config invariata |

## Baseline tecnica

| Gate | Esito | Dettaglio |
|---|---|---|
| TypeScript | PASS | `tsc --noEmit` |
| ESLint | PASS con warning | 0 errori, 16 warning preesistenti |
| Jest | PASS | 93 suite, 566 test |
| Build | PASS | Next.js 16.3.3, 487/487 pagine |
| i18n IT/EN/ES/FR/DE | PASS | 2.906 chiavi/locale; zero missing, extra, empty, placeholder mismatch e residui italiani |
| Catalog test | PASS | 33 test |
| Import dry-run | PASS | Chiese 10/10 valide; Location 5/5 valide; supplier pilot input 0, nessuna scrittura |
| UTF-8 | PASS | nessun byte invalido |
| Mojibake | PASS | semantic scan |
| Secret/config scan | PASS | nessun pattern segreto; JSON config validi |
| Build-time validation | PASS | ripetuta dal `prebuild` |
| Italian runtime extra | FINDING non bloccante | scanner opzionale segnala la stringa tecnica `POST` come falso positivo italiano |
| Database Rebuild effimero | WORKFLOW PASS con finding bloccante | run #257, SHA `658318b...`; tree identico a `08c7f95...`; tutte le fasi completate, ma un'asserzione pgTAP stampa `not ok` senza fallire il job |
| Schema lint | PASS | `No schema errors found` nel rebuild #257 |
| RLS/Data API esistenti | PASS con limite del gate TAP | inventario Branch 51, test B25–B51 e tipi generati completati |
| Playwright Preview | PASS | run #135, tree identico; 32 PASS / 87 skip |
| Playwright isolato | PASS | 1 diagnostico + 5 journey, 0 skip |
| Production smoke | PASS | #31: 37 PASS / 0 FAIL / 87 skip |

Lo SHA `658318b5fc631dc0aae93f6083066c8aaf084cde` e il merge main
`08c7f95c...` hanno lo stesso tree Git
`31c639f52d0754adb730c698e9b31eb5937131ca`; i run Rebuild/Playwright sono
quindi applicabili byte-per-byte alla baseline funzionale corrente.

## Milestone proposte

### M0 — Rendere affidabile il gate SQL — CHIUSA

Checkpoint: 2026-09-19. Commit di implementazione verificato:
`a608b71b04efc0cb8fc395787617656c374c9fb9`.

#### Diagnosi e contratto autorevole

- causa **A + F**: aspettativa pgTAP obsoleta sulla rappresentazione del
  default e runner TAP difettoso;
- Database Rebuild #257 eseguiva le suite con `psql -f`: `psql` restituiva 0
  perché non c'erano errori SQL, anche se `finish()` riportava
  `# Looks like you failed 1 test of 2`;
- assertion errata: `col_default_is(..., '''common''::text', ...)`; il log
  mostrava `have: common`, `want: 'common'::text`;
- contratto corretto: valore di default logico esatto `common`. La migration
  Branch 41 dichiara `text not null default 'common'`, i tipi generati rendono
  `spend_type` obbligatorio in lettura e opzionale in insert, l'API applica il
  fallback `common`, il test Jest vincola migration e payload e la metadata
  Production read-only conferma `text`, `NOT NULL`, default SQL
  `'common'::text`;
- nessuna migration, modifica schema, DML o adeguamento dei dati è necessaria.

`pg_prove` non è presente nell'ambiente ed è distribuito separatamente da
pgTAP. È stato quindi introdotto un runner TAP equivalente senza nuove
dipendenze, con `psql --set ON_ERROR_STOP=1`, esecuzione senza pipeline,
manifest completo e validazione di:

- `not ok` e `Bail out!`;
- piano assente, multiplo, vuoto o non rispettato;
- conteggio e numerazione delle assertion;
- errore/exit code `psql`;
- file mancante, non dichiarato, privo di piano o non eseguito;
- numero di suite selezionate ed effettivamente completate.

Il workflow usa `set -Eeuo pipefail` negli step del runner e stampa file,
suite, assertion, PASS/FAIL, bailout ed exit code finale senza esporre la
connection string.

#### Prove e gate

| Gate | Esito M0 | Evidenza |
|---|---|---|
| Test unitari runner | PASS | 11 test: protocollo valido, `not ok`, bailout, piano mancante/incompleto, numerazione, file senza test/non dichiarato ed exit `psql` |
| Prove controllate su Supabase effimero | PASS | 6/6: PASS→0; `not ok`, errore SQL, piano incompleto, nessun test e bailout→non-zero |
| Suite pgTAP normale | PASS | 5 suite, 50 assertion, 50 PASS, 0 FAIL, 0 bailout; tutti i file del manifest eseguiti |
| `branch_41_budget_apply.sql` | PASS | 2/2 assertion con valore atteso `common` |
| Rebuild/idempotenza/RLS/Data API/RPC | PASS | Database Rebuild #258, tutti gli step Branch 25–51 e doppia applicazione Branch 51 completati |
| Schema lint | PASS | `No schema errors found` |
| Tipi Supabase | PASS | generazione e diff contro `src/types/database.types.ts` senza differenze |
| Jest | PASS | 93 suite, 566 test |
| TypeScript | PASS | `tsc --noEmit` |
| ESLint | PASS con warning | 0 errori, 16 warning preesistenti |
| Catalog test | PASS | 33 test |
| Build | PASS | Next.js 16.3.3, 487/487 pagine |
| Secret/config/UTF-8/mojibake | PASS | nessun segreto o errore di configurazione/codifica |
| CI remoto | PASS | #600 |
| Preview Vercel | READY | `dpl_8fjG4wVVS3Z6nu3hkSGFcV2HUHSB`, SHA esatto |
| Playwright isolato | PASS | diagnostico + 5 journey reali, nessuno skip |
| Playwright Preview | FINDING FUORI M0 | #136 e retry: 31 PASS, 2 FAIL, 87 skip; `REGISTRATION_DELIVERY_FAILED` e invito partner non apparso, senza modifiche ai flussi email/partner |

Il failure Preview è stato riprodotto al retry ed è separato dalle modifiche
M0, che riguardano esclusivamente workflow, runner e assertion SQL. Non è stato
corretto perché richiederebbe interventi sul provider email o sul flusso
partner fuori dallo scope autorizzato.

Main resta `08c7f95c380d1a307a6cc8746f7bfbb57e20c27a`; Production resta
`dpl_CNhPuEc32DMVQ23C7mKG6iZyxacB`, `READY` sullo stesso SHA. Nessuna
migration è stata creata o applicata, la PR #67 resta OPEN/DRAFT, M1 non è
iniziata e il costo aggiuntivo è 0 €.

### M1 — Contratti API e dettaglio fornitore

- `/api/suppliers/[id]` è allineata alle sole colonne reali del catalogo e
  rifiuta le scritture dirette; il placeholder demo e i campi inesistenti
  `photo_urls`, `video_urls`, `discount_info` sono rimossi;
- `/api/my/suppliers` usa proiezioni esplicite tipizzate per lista, dettaglio,
  creazione e aggiornamento; non usa `select(*)` né `as any`;
- UUID, `resource_id`, enum, valuta, importi, note e payload sono allowlisted;
  `event_id`, `owner_id` e campi estranei sono rifiutati e l'evento è sempre
  derivato dal CurrentEvent server-side;
- owner e partner attivo possono leggere e mutare; partner revocato, estraneo
  e anonimo sono fermati prima del service client; risorsa assente o di altro
  evento restituisce lo stesso `SAVED_SUPPLIER_NOT_FOUND` 404;
- il dettaglio UI usa soltanto `suppliers` e `saved_suppliers`, con loading,
  not-found, errore, retry, salvataggio, selezione e note private esistenti.

Nessuna migration prevista.

Checkpoint M1: nessuna migration o scrittura catalogo, nessuna associazione
Location–Fornitore, snapshot, override o record private-only introdotti. I test
mirati sono 38/38 PASS e Jest completo è 586/586 PASS; TypeScript, ESLint e
build sono PASS (restano 16 warning ESLint preesistenti, zero errori).

### M2 — Elementi privati, snapshot, override e preferiti

#### Modello autorevole e invarianti

| Concetto | Identità e persistenza | Mutabilità / accesso |
|---|---|---|
| Record globale | `churches`, `locations`, `suppliers`; UUID canonico e provenienza correnti | Pubblico in lettura; scrittura solo pipeline/server secondo i contratti esistenti |
| Globale salvato nell'evento | riga `saved_*` con FK globale ed `event_id` | Stato, note, importi e shortlist restano condivisi tra owner e partner attivo |
| Snapshot event-scoped | sei colonne additive su ogni `saved_*`: payload, versione 1, timestamp, SHA-256, provenienza sicura e override separato | Creato atomicamente dal trigger al nuovo salvataggio; identità, payload, versione, timestamp, fingerprint e provenienza sono immutabili |
| Override privato | `private_overrides` sulla riga `saved_*` | Solo campi descrittivi allowlisted; mai UUID, source/provenance, verifica, analytics o timestamp globali |
| Record completamente privato | `event_private_catalog_records`, FK evento `ON DELETE CASCADE`, `entity_type`, `client_key`, snapshot base e override | Owner e partner attivo; snapshot/identità immutabili; `client_key` rende retry e concorrenza idempotenti senza fondere record omonimi |
| Preferito user-global | `user_favorites(user_id,item_type,item_id)` | Preferenza personale trasversale a 0/1/N eventi; non concede accesso a eventi o record privati |
| Preferito event-scoped | flag `favorite` nelle tre `saved_*` | Shortlist condivisa del solo CurrentEvent; non viene sincronizzata o fusa implicitamente con `user_favorites` |

La precedenza di lettura è deterministica:

1. override privato;
2. snapshot immutabile;
3. catalogo globale come fallback esclusivamente per campi mancanti e righe
   legacy con snapshot `NULL`.

Campi copiati nel payload snapshot:

- comuni: UUID origine, nome, indirizzo/località/nazione, contatti, descrizione,
  coordinate e campi pubblici di source/verifica;
- chiesa: tipo, denominazione/religione, sottotipo, capienza, disponibilità
  cerimonia, accessibilità e parcheggio;
- location: tipo/sottotipo, capienze, alloggio, catering, spazi,
  accessibilità/parcheggio e fascia prezzo/valuta;
- fornitore: categoria/sottocategoria, canali social, area/regioni servite,
  disponibilità trasferta e fascia prezzo/valuta;
- provenienza: riepilogo pubblico del record e delle fonti pipeline, senza
  copiare metadata tecnici arbitrari o alterare `catalog_provenance`.

Allowlist override: gli stessi soli campi descrittivi sopra, esclusi `id`,
`source*`, `external_id`, `verification_status`, `google_place_id`,
fingerprint, timestamp e campi tecnici. Tipi, lunghezze, coordinate, valuta,
importi e array sono validati sia dall'API sia dai constraint database.

#### Comportamenti limite

- Aggiornamento globale: i nuovi risultati pubblici cambiano, lo snapshot
  evento no.
- Rimozione/non disponibilità globale: la FK `RESTRICT` impedisce una
  cancellazione fisica finché esiste un salvataggio; una rimozione logica resta
  leggibile dallo snapshot.
- Legacy: nessun backfill. Le righe `saved_*` preesistenti restano valide con
  snapshot `NULL` e fallback globale.
- Salvataggio ripetuto/concorrenza: le unique esistenti dei `saved_*` e la
  unique `(event_id,entity_type,client_key)` dei privati impediscono doppioni;
  le API restituiscono la risorsa esistente come successo idempotente.
- Omonimi: non esiste unique su nome/città. Due entità reali omonime restano
  distinte; la deduplica riguarda solo UUID globale o `client_key` di retry.
- Cambio evento/CurrentEvent alterato: l'API ignora `event_id` client e filtra
  sempre evento e risorsa sul contesto server autorevole.
- Eliminazione evento: CASCADE elimina `saved_*` e privati dell'evento; gli
  oggetti globali e `user_favorites` restano invariati.
- Partner revocato/left, estraneo e anonimo: esclusi da CurrentEvent, API e
  RLS; owner e partner attivo condividono lettura e mutazioni evento.

#### Migration M2

`20260919161056_branch_52_event_catalog_snapshots.sql` è schema-only e
idempotente: nuove colonne con `NULL`/default sicuro, nuova tabella, constraint,
indici, policy e trigger. Non contiene cleanup, backfill, deduplica o DML sui
dati applicativi; non rende nullable FK esistenti e non sostituisce UUID.
La funzione privilegiata che legge `catalog_provenance` vive nello schema
non esposto `private`, con `search_path` fissato e nessun EXECUTE a
`PUBLIC`/`anon`/`authenticated`.

### M3 — Location ↔ Fornitore

#### Contratto dati approvato prima dell'implementazione

Le associazioni globali e private restano due concetti distinti e non vengono
fuse, copiate o inferite:

| Ambito | Identità | Scrittura | Cancellazione |
|---|---|---|---|
| Globale curato | `supplier_locations(supplier_id,location_id,relationship_type)` tra UUID canonici di `suppliers` e `locations` | Solo pipeline/service role; il client normale conserva esclusivamente `SELECT` | Segue le FK globali esistenti; nessun dato viene creato o modificato da M3 |
| Privato evento | Nuova riga `event_location_supplier_links` con `event_id`, un solo endpoint location e un solo endpoint supplier | Owner e partner attivo del CurrentEvent; API e RLS verificano lo stesso evento | `CASCADE` con l'evento o con uno dei soli endpoint privati collegati; i cataloghi globali non sono toccati |

Ogni endpoint privato usa una XOR esplicita:

- location: `saved_location_id` **oppure** `private_location_id`;
- fornitore: `saved_supplier_id` **oppure** `private_supplier_id`.

Le quattro combinazioni lecite sono quindi globale salvato ↔ globale salvato,
globale salvato ↔ private-only, private-only ↔ globale salvato e private-only
↔ private-only. Per i record globali l'associazione punta alla riga `saved_*`,
non direttamente al catalogo: questo conserva snapshot, override e identità
event-scoped della Milestone 2. Per i record private-only punta a
`event_private_catalog_records` con `entity_type` vincolato rispettivamente a
`location` o `supplier`.

L'appartenenza allo stesso evento è provata da FK composite, non inferita dal
client: ogni riferimento include `event_id`; i riferimenti private-only
includono anche il tipo entità costante. Il client non può cambiare evento,
endpoint, creatore o provenienza dopo l'inserimento.

Il tipo di relazione riusa esattamente l'allowlist globale esistente:
`works_at`, `preferred_supplier`, `internal_supplier`, `external_allowed`,
`recommended`, `historic_relationship`. Sono ammesse note private fino a 4.000
caratteri. La provenienza privata è rappresentata da `created_by` e dalla
tabella event-scoped; non viene inventato un campo source e non viene copiata
la provenance globale. Non è introdotto un ordinamento manuale: l'ordine
deterministico è `created_at,id`.

L'unicità è `(event_id, endpoint location, endpoint supplier,
relationship_type)` per ciascuna delle quattro combinazioni. Quattro indici
unique parziali rendono idempotenti retry e richieste concorrenti; la stessa
coppia può conservare tipi di relazione diversi come nel catalogo globale.

#### Contratto API e sicurezza

- endpoint pubblico tipizzato: elenco globale filtrato per UUID location e/o
  fornitore; POST/PATCH/DELETE non disponibili;
- endpoint privato tipizzato: elenco, creazione, aggiornamento di soli
  `relationship_type`/`private_notes` ed eliminazione;
- `event_id`, `owner_id`, `created_by` e campi endpoint non allowlisted sono
  rifiutati; il CurrentEvent server-side è sempre autorevole;
- UUID, enum, lunghezze e forma XOR sono validati prima del database;
- risorsa privata assente, cancellata o appartenente ad altro evento produce
  un 404 uniforme senza enumerazione; duplicato incompatibile produce 409;
- RLS e grant Data API applicano least privilege anche se la route server usa
  il service role dopo la guard esplicita owner/partner attivo;
- nessuna migration o DML Production, nessun backfill e nessuna associazione
  globale o privata generata automaticamente.

Migration necessaria esclusivamente per `event_location_supplier_links` e per
le chiavi candidate composite richieste dalle FK same-event. Deve essere
additiva, schema-only, idempotente e riapplicabile dopo M2.

### M4 — Fornitore ↔ Timeline e appuntamenti

#### Contratto autorevole adottato prima dell'implementazione

Timeline e appuntamenti restano risorse autonome event-scoped. Il collegamento
al fornitore è facoltativo e usa lo stesso modello a due endpoint introdotto da
M2–M3, senza modificare cataloghi globali o snapshot:

| Stato del collegamento | Riferimento persistito | Regola |
|---|---|---|
| Nessun fornitore | entrambi gli endpoint `NULL` | comportamento storico pienamente valido |
| Globale salvato | `saved_supplier_id` → `saved_suppliers(id,event_id)` | il fornitore globale deve essere già salvato nell'evento; nessun salvataggio implicito |
| Private-only | `private_supplier_id` → `event_private_catalog_records(id,event_id)` + trigger tipo | il record privato deve appartenere allo stesso evento e avere `entity_type='supplier'` |

Gli endpoint sono esclusivi: al massimo uno tra `saved_supplier_id` e
`private_supplier_id` può essere valorizzato. `event_id`, identità della
risorsa, owner e creatore non sono mai accettati dal payload. Il CurrentEvent
risolto server-side determina l'evento e ogni lettura/mutazione filtra sia
l'identità della risorsa sia l'evento. `event_id` e `client_key` diventano
immutabili anche sulla Data API mediante trigger, così una UPDATE diretta non
può spostare la risorsa tra eventi né riciclare una chiave idempotente.

Il FK Timeline esistente verso il solo `saved_supplier_id` viene conservato
per compatibilità ma non è sufficiente: non rappresenta i fornitori
private-only e, da solo, non prova l'appartenenza allo stesso evento. M4 usa
quindi le chiavi candidate composite già introdotte da M3 e aggiunge:

- `timeline_items.private_supplier_id`, FK composita same-event e trigger di
  validazione del tipo `supplier`;
- FK composite same-event per entrambi gli endpoint Timeline;
- `appointments.saved_supplier_id`, `appointments.private_supplier_id`, FK
  composite same-event e lo stesso trigger di tipo;
- FK composite same-event per entrambi gli endpoint appuntamento;
- check XOR nullable e indici parziali di lettura per evento/fornitore;
- `client_key uuid` nullable su entrambe le risorse, con unicità
  `(event_id,client_key)`: le righe storiche restano `NULL`, mentre ogni nuova
  creazione manuale invia una chiave stabile conservata dal client fino al
  successo.

La migration è strettamente additiva e schema-only: nessun backfill, cleanup,
deduplica, associazione inferita o DML applicativo. Le righe esistenti restano
senza fornitore e continuano a funzionare. Non vengono modificati UUID,
snapshot M2, provenance, associazioni M3 o record globali.

#### Ciclo di vita e cancellazioni

- scollegamento manuale: imposta entrambi gli endpoint a `NULL` e non elimina
  Timeline, appuntamento, fornitore o catalogo globale;
- eliminazione di un `saved_supplier` o di un fornitore private-only: `ON
  DELETE SET NULL` sul solo endpoint interessato; attività e appuntamenti
  restano invariati;
- eliminazione evento: i `CASCADE` event-scoped esistenti eliminano Timeline e
  appuntamenti; gli endpoint fornitore decadono con le risorse dell'evento e i
  cataloghi globali restano invariati;
- revoca/uscita partner: nessuna modifica ai dati; accesso immediatamente
  negato dal resolver e dalle policy esistenti;
- cambio CurrentEvent: le API rileggono esclusivamente il nuovo evento; un ID
  della risorsa o del fornitore appartenente a un altro evento produce 404
  uniforme senza enumerazione.

#### Contratto API, concorrenza e navigazione

- payload discriminato `supplier: {scope:'saved'|'private',resource_id:UUID}`
  oppure `supplier:null`; UUID, forma, allowlist, date, numeri e lunghezze sono
  validati prima del database;
- `POST`/`PUT` Timeline e `POST`/`PATCH` appuntamenti restituiscono la risorsa
  proiettata esplicitamente con il fornitore risolto; `DELETE` elimina solo la
  risorsa richiesta;
- ripetere o eseguire in concorrenza lo stesso link/unlink è idempotente:
  l'ultimo aggiornamento completo imposta una sola coppia di endpoint e i
  vincoli impediscono stati misti o cross-event; per le creazioni manuali la
  coppia `(event_id,client_key)` rende idempotenti anche retry e richieste
  concorrenti, mentre i controlli UI impediscono il doppio invio locale;
- l'elenco dei fornitori selezionabili contiene esclusivamente
  `saved_suppliers` e fornitori private-only del CurrentEvent, con ricerca
  client accessibile per elenchi ampi;
- Timeline e appuntamenti espongono filtro manuale e link al dettaglio del
  fornitore; i dettagli del fornitore globale salvato e private-only espongono
  le attività e gli appuntamenti collegati con link inversi;
- service role resta esclusivamente server-side dopo guard esplicita;
  Data API continua a essere protetta da RLS e FK same-event;
- errori pubblici stabili: 400 input, 401 autenticazione, 403 ruolo non
  ammesso, 404 risorsa/endpoint non accessibile, 409 selezione evento o
  conflitto coerente, 500 sanitizzato.

Nessuna creazione automatica di attività, notifica, email, reminder, scadenza
o sincronizzazione calendario è introdotta. Le colonne reminder appuntamento e
il cron preesistente non vengono invocati o estesi da M4.

## Implementazione Milestone 4

Il contratto sopra è stato implementato esclusivamente nel perimetro M4. Non
sono stati avviati Milestone 5, Milestone 6 o Branch 53: accessibilità,
localizzazione, responsive e sicurezza citate qui sono soltanto i gate
obbligatori richiesti per M4.

### Superficie applicativa

- API tipizzate `supplier-options`, Timeline e appuntamenti con proiezioni
  esplicite, validazione UUID/payload, autorizzazione server-side e risposte
  400/401/403/404/409 sanitizzate;
- creazione, modifica, filtro, scollegamento e navigazione diretta/inversa per
  Timeline e appuntamenti;
- selettore accessibile e ricercabile, stati loading/empty/error/retry,
  conservazione dei dati inseriti dopo un errore, protezione dal doppio invio,
  annunci live e tastiera;
- dettagli inversi sia per fornitore globale salvato sia per private-only;
- unico routing localizzato per gli appuntamenti, senza entrypoint statici
  legacy concorrenti;
- messaggi IT/EN/ES/FR/DE e resa light/dark a 320 e 430 px.

### Matrice autorizzativa verificata

| Attore/caso | Esito |
| --- | --- |
| Owner del CurrentEvent | CRUD consentito |
| Partner attivo | CRUD consentito secondo il contratto planning condiviso |
| Partner revoked/left | negato immediatamente, dati invariati |
| Estraneo o anonimo | negato senza enumerazione |
| Autenticato senza evento / senza CurrentEvent valido | negato; selezione evento richiesta |
| CurrentEvent manipolato / `event_id` alterato | nessun privilegio; evento ricavato server-side |
| Supplier, Timeline o appuntamento cross-event | respinto; 404 uniforme alle API e vincoli/RLS nella Data API |
| Fornitore eliminato o non accessibile | nuovo collegamento respinto; link esistente azzerato da FK solo se eliminato |
| Service role | esclusivamente server-side |

### Gate dell'implementazione `8bc994cef3c0fa2a80f8d1075fe45047de112e82`

- CI #628 PASS: UTF-8/config/secrets, ESLint (0 errori, 16 warning
  preesistenti), TypeScript, Build e Jest completo 104 suite / 655 test;
- i18n PASS: 3.082 messaggi per ciascuna lingua, 0 missing, extra, empty,
  placeholder mismatch o residui italiani;
- Database Rebuild #286 PASS su database effimero: M2, M3 e M4 applicate e
  riapplicate in ordine; snapshot M2 invariato; schema lint senza errori; tipi
  Supabase correnti; test di concorrenza PASS;
- pgTAP runner PASS (11 test e 6/6 casi controllati); tutte le suite pgTAP
  PASS, 8 suite / 200 asserzioni, incluse le 64/64 M4;
- Playwright isolato autenticato PASS senza skip: diagnostica 1/1 e lifecycle
  9/9; i journey M4 320/430 completano CRUD, viste inverse, matrice di
  visualizzazione, light/dark e cleanup fixture/identità;
- Preview Vercel esatta READY: `dpl_CPAjZLjbSWqRsyDEfPHiUAQqixNm` sullo SHA
  sopra; Playwright Preview PASS con 33 test eseguiti e 87 skip condizionali
  della matrice generale. La suite Preview usa lo schema remoto volutamente non
  migrato e lascia i journey M2–M4 al database effimero ricostruito, senza
  sostituirli con mock;
- Production smoke #50 PASS come validazione infrastructure-only; i job browser
  e HTTP Production sono volutamente skipped e non costituiscono un gate M4.

### Rischi residui non bloccanti

- 16 warning ESLint preesistenti;
- falso positivo `POST` nello scanner runtime italiano opzionale;
- cataloghi legacy privi di `catalog_provenance` strutturata: restano
  preservati e non sono stati corretti nel Branch 52;
- M2, M3 e M4 restano intenzionalmente non applicate in Production, quindi la
  Preview remota collegata a quello schema non può eseguire i journey M4: la
  copertura end-to-end M4 autorevole è l'ambiente effimero ricostruito.

## Dati da preservare

- 26 eventi, 22 membership e 11 owner legacy assenti da Auth;
- ogni riga e UUID dei 326 fornitori, 155 location e 896 chiese;
- 922 record di provenienza e tutti i campi `source*` dei cataloghi;
- 166 Timeline, 15 Budget, 610 spese e relative identità;
- qualunque `saved_*`, preferito, associazione, appuntamento o promemoria che
  venga creato dopo questo snapshot;
- membership revocate/left, inviti, cookie CurrentEvent e comportamento di
  cancellazione;
- Matrimonio unico READY e monetizzazione fail-closed.

## Stop Milestone 4

M4 è conclusa. La migration M4 è stata applicata soltanto su database
effimeri; M2, M3 e M4 non sono state applicate in Production. Nessun DML,
cleanup o backfill è stato eseguito in Production. Main, cataloghi globali,
snapshot/provenance e provider esterni restano invariati. La PR #67 resta
OPEN/DRAFT; nessun merge. Milestone 5–6 e Branch 53 non sono iniziati.

## Hotfix conclusiva del Production smoke Branch 52

Il precedente stop M4 è superato dal merge della PR #67. Il riferimento
immutabile di partenza di questa hotfix è `main`
`eb34063b4b5fb9e687e1b3b2a2589c219fc7ea47`, tree
`b5ecca049b34722002308d0442a729134a6731d9`, già servito READY dal deployment
Production `dpl_379nMxch6V6taBSD35ea8L8gtVny`. Il Production smoke #56 ha
superato il preflight HTTP ma si è fermato con 33 PASS, 120 FAIL e 87 skip;
il gruppo M8 non è stato eseguito. Migration M2 38/38, M3 48/48 e M4 64/64,
rollback sicurezza 150/150, FK 91/91 e assenza fixture applicative erano già
PASS.

### Causa e correzione limitata

La causa dei 120 FAIL era esclusivamente la raccolta degli spec isolati M4,
M5 e M6 attraverso i 30 progetti standard: per esempio `de-430` eseguiva test
che dichiarano obbligatoriamente `m8-430`. La configurazione standard ora
ignora esattamente i cinque file isolati Branch 52; la configurazione
Production dedicata raccoglie tutti e soli i 12 journey obbligatori, una volta
ciascuno, sui progetti `m8-320`, `m8-390` e `m8-430`.

Il gate automatizzato esegue `playwright test --list --reporter=json` prima
del browser e fallisce se cambia una delle seguenti invarianti:

- matrice standard: 120 casi raccolti, quattro journey su 30 progetti
  IT/EN/ES/FR/DE;
- Branch 52: 12 journey raccolti una volta, 0 attraverso progetti standard;
- nessun journey obbligatorio mancante e nessuna duplicazione;
- service-role rimossa esplicitamente dall'ambiente del processo Chromium e
  disponibile soltanto al test runner Node per fixture marcate e cleanup.

Le identità temporanee ora portano insieme `qa_scope`, `qa_run_id` e
`qa_marker`; email, eventi e risorse derivate incorporano il run marker. Il
Production smoke acquisisce una baseline completa di `rate_limit_buckets` ed
`event_members`, riconcilia prima di cancellare e usa soltanto chiavi esatte.
Qualunque riga non-QA cambiata, firma bucket inattesa, timestamp fuori
finestra o classificazione membership C/D causa STOP prima del cleanup.

### Riconciliazione del run #56

I quattro bucket aggiunti dal run `35606256571` sono le sole righe nella
finestra 13:32:22–13:37:02 UTC e coincidono con le chiamate osservate nei log:

| Identità tecnica | Chiave SHA-256 | Conteggio | `window_started_at` UTC |
| --- | --- | ---: | --- |
| register | `5f3d3d992c096f03fc05b6f153402515af1267bdea9add311f1987b87f8274e3` | 1 | 2026-09-21 13:33:38.802426 |
| partner-invite | `7ebd1be2739ab82c29011d7143155a2c57821b02b60ed99e94876d521ffb699f` | 2 | 2026-09-21 13:33:50.282042 |
| invitation-inspect | `6f19afdd62a19c495d8fc8d6cac670cb7dd2244f8e721f264b6fd7b650f88a43` | 4 | 2026-09-21 13:34:28.262066 |
| resend-confirmation | `bb5a15e65b97b6345ab4bf12b2afaac6b267784f15b405836cb8218905188622` | 1 | 2026-09-21 13:34:38.873093 |

Il preflight ha verificato 326 righe totali, quattro match esatti, 322 righe
non target, 0 FK referenti, 0 trigger utente e fingerprint non target
`43a62c8601389cb95b4fb6e7dd1a62fb`. La cancellazione è autorizzata solo dopo
la scadenza delle finestre endpoint e deve lasciare le 322 righe non-QA
byte-identiche.

Alle 14:34:57 UTC tutte le finestre erano scadute. La transazione fail-closed
ha cancellato le sole quattro tuple complete sopra elencate: conteggio finale
322, bucket #56 residui 0 e fingerprint delle righe non-QA ancora
`43a62c8601389cb95b4fb6e7dd1a62fb`. Nessun'altra tabella è stata oggetto di
DML.

La membership persistente QA è classificata **B**. Prima e dopo il lifecycle
restano invariati `id=5de753c6-c6c8-46c4-906b-4d74e3f90499`,
`event_id=c3dd9a31-5e21-421f-997c-667765a79e07`,
`user_id=09170166-8a3b-4e1e-8c1c-7702fe715b72`, `role=partner`, `status=left`
e `created_at=2026-09-15 04:42:25.541957 UTC`. Il fingerprint JSON dei campi
funzionali è `dc828808573b207ac5ba691a02ad83e8`. Soltanto l'audit tecnico del
lifecycle è avanzato: `accepted_at` da 2026-09-20 09:54:31.759091 a
2026-09-21 13:35:48.373585 UTC e `updated_at` da
2026-09-20 09:54:38.840000 a 2026-09-21 13:35:55.268000 UTC. La riga non
viene riscritta.

### Gate hotfix prima della pubblicazione

- isolamento/guardie: 8/8 test Node PASS e raccolta 120 standard + 12 isolati
  PASS;
- Jest completo: 106 suite, 667 test, 0 fail, 0 skip;
- i18n: 3.095 messaggi per ciascuna delle cinque lingue, zero differenze;
- TypeScript PASS; ESLint PASS con 0 errori e 16 warning baseline; Build PASS;
- UTF-8, mojibake, config e secret scan PASS;
- nessuna modifica UI/API/schema/migration;
- la configurazione Preview raccoglie esattamente 30 controlli pubblici
  GET-only (cinque lingue per sei viewport) e rifiuta qualsiasi spec
  autenticato o mutante; i lifecycle autenticati restano confinati al
  Supabase effimero locale, quindi la Preview non esegue DML remoto.

La chiusura resta bloccata fino a CI, Database Rebuild/pgTAP, Playwright
isolato, Preview read-only, merge, Production READY sul nuovo SHA e nuovo
Production smoke interamente PASS. Branch 53 resta non iniziato.

### Follow-up controllato dopo il Production smoke #59

La PR hotfix #68 è stata unita nel commit
`810f0790877e5a5fbc85ea4f55ca3e476b8abac6` e il deployment Production
`dpl_BDsUYwiaYn1e8cDaukKjpNTuz2Dg` è risultato READY sullo stesso SHA. Il
Production smoke #59 ha dimostrato che l'isolamento è corretto prima
dell'esecuzione: 120 casi standard, 12 journey Branch 52, zero raccolte tramite
progetti standard, zero duplicazioni e zero service-role nel processo
Chromium. Il gruppo standard ha concluso 33 PASS / 0 FAIL / 87 skip
condizionali; il gruppo M8 si è fermato a 6 PASS / 6 FAIL / 0 skip.

Le sei cause sono limitate all'infrastruttura del test e non richiedono alcuna
modifica applicativa:

- la security matrix leggeva `PLAYWRIGHT_SUPABASE_ANON_KEY`, mentre il workflow
  esportava soltanto l'alias `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- il callback reale di password recovery reindirizzava all'hostname canonico
  protetto Vercel senza che la configurazione M8 propagasse il bypass;
- tre letture immediatamente successive alla creazione fixture hanno incontrato
  la latenza della lettura Production o del caricamento client oltre il timeout
  di cinque secondi;
- il riepilogo appuntamento espone titolo e data nello stesso `listitem`, quindi
  il selettore testuale `exact` non rappresentava il contratto accessibile.

Il follow-up aggiunge gli alias mancanti, usa il bypass soltanto come header
Playwright e lo rimuove dall'ambiente Chromium, attende esplicitamente la
leggibilità pubblica della fixture prima della navigazione, usa attese remote
limitate e seleziona il `listitem` dell'appuntamento senza indebolire le
asserzioni. Nessun test è rimosso, duplicato o convertito in skip.

La riconciliazione del run `35615793263-1` ha rimosso cinque bucket tecnici
esatti e ha ripristinato 322 righe; il fingerprint non-QA prima/dopo è
`511eb84dc9754bf2443c59efb532a427b8e0d7d5535b40799cec8d52825997bc`.
La membership persistente resta classificata B, 22 righe, stato funzionale
iniziale ripristinato e fingerprint delle 21 righe non target invariato
`30992144c7031ed02d6e64f53af74ae4ac00188ca1c070fa62618846fb12664c`.

Il controllo indipendente post-run ha inoltre trovato una sola identità
incompleta del journey reset, interrotto dal timeout prima del `finally`:
`196afefb-585d-4c94-a548-b75b78fadb89`, email e metadata esatti del run #59,
creata alle 15:05:08 UTC. Tutti i riferimenti applicativi e Storage erano zero.
La sola identità Auth e il profilo dipendente sono stati eliminati con un
predicato esatto su ID, email, timestamp, scope, run e marker; Auth e profili
sono tornati a 15 e i residui del run #59 a zero. Il reconciler ora inventaria,
ri-verifica e rimuove anche eventuali identità del solo run corrente rimaste
dopo un timeout, fallendo chiuso su dominio, scope, marker o finestra diversi.

La chiusura resta bloccata fino al follow-up PR, ai gate completi, al nuovo
merge/deployment e a un Production smoke integralmente PASS. Branch 53 resta
non iniziato.

## Production smoke #61 checkpoint

- Head verificato: `ad7ed1dae7e210f04cc8d8f0b7b90b311c015774`; deployment Production `dpl_GVu48Te59ddehYHKubse61onsG3N` READY sullo SHA esatto.
- HTTP preflight e matrice standard: PASS; raccolta preventiva: 120 casi standard + 12 journey M8, senza leakage o duplicazioni.
- M8: 11 PASS / 1 FAIL / 0 skip. Il solo reset-password ha raggiunto la callback reale e la sessione autenticata, ma `page.goto` è rimasto in attesa durante i redirect client-side dell'onboarding fino al timeout.
- Il reconciler si è fermato prima di qualsiasi delete perché la verifica degli eventi QA interrogava `events.created_at`; lo schema autorevole usa `events.inserted_at`.
- Inventario post-run in sola lettura: una sola identità/profilo con run marker esatto `35620141619-1`, zero eventi posseduti, cinque bucket tecnici con firma esatta `[1,1,1,2,4]`, 22 membership persistenti. Nessuna cancellazione eseguita dal reconciler fallito.
- La verifica successiva ha trovato il teardown completato senza DML manuale: identità/profilo del run 0, bucket del run 0, Auth/profili 15 e `rate_limit_buckets` 322. Il fingerprint delle 322 righe non-QA è tornato byte-identico a `511eb84dc9754bf2443c59efb532a427b8e0d7d5535b40799cec8d52825997bc`.
- Correzione limitata al test harness: callback attesa fino al primo commit, verifica dell'origine e della sessione, navigazione esplicita alla route reset sulla stessa origine; cleanup ownership aggiornato a `inserted_at` con contratto automatico.
- Branch 53 resta non iniziato. Branch 52 non è dichiarato chiuso fino a nuovo smoke completamente PASS e integrità finale.

## Playwright isolato #173 checkpoint

Il primo gate Playwright isolato della PR follow-up ha fallito soltanto il
journey reset-password prima di aprire la callback: il workflow locale espone
`PLAYWRIGHT_LOCAL_SUPABASE=1` e serve l'applicazione su
`http://127.0.0.1:3000`, ma non definisce `PLAYWRIGHT_BASE_URL`. Il test
richiedeva erroneamente quest'ultima variabile anche nel percorso Supabase
effimero locale.

Il test harness ora usa l'origine locale deterministica esclusivamente quando
`PLAYWRIGHT_LOCAL_SUPABASE` vale esattamente `1`; in Production continua a
richiedere `PLAYWRIGHT_BASE_URL` esplicito. Il contratto di isolamento verifica
automaticamente questo fallback. Nessuna configurazione applicativa, UI, API,
schema o migration è modificata. La PR resta Draft fino alla ripetizione di
tutti i gate sul nuovo commit.
