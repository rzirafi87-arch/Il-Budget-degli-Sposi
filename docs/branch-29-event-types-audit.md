# Branch 29 — Event types, modules and Coming Soon

Audit eseguito il 31 agosto 2026 sulla production e su `main` al merge commit Branch 28 `9284c74cfb2ba78932bd767e02d7a42a81178f93`.

## Baseline production prima della migration

| Dato | Conteggio |
|---|---:|
| events | 11 |
| churches | 2 |
| saved_churches | 0 |
| locations | 128 |
| saved_locations | 0 |
| suppliers | 326 |
| saved_suppliers | 0 |
| vendors | 431 |
| vendor_places | 431 |
| supplier_locations | 0 |
| categories | 30 |
| event_type_categories | 0 |
| event_timelines | 0 |

Distribuzione `events.event_type` rilevata prima della migration:

- `wedding`: 5
- `engagement-party`: 2
- `retirement`: 2
- `birthday`: 1
- `genderreveal`: 1

I sei eventi non wedding sono dati legacy e vengono preservati senza cambio tipo, cancellazione o seed automatico.

## Stato reale del catalogo event types

Prima del Branch 29 `public.event_types` contiene soltanto `WEDDING`. Le tabelle globali `event_type_categories` ed `event_timelines` non contengono template production. Il frontend, invece, espone numerosi event type tramite `EVENT_CONFIGS` e in precedenza li considerava tutti selezionabili.

La presenza di configurazioni frontend (anche quando comprendono liste di categorie o task) non è sufficiente per dichiarare un event type READY: mancano una fonte canonica di disponibilità, route guards, navigazione coerente e template globali production completi.

## Classificazione Branch 29

| Event type | Stato | Motivo |
|---|---|---|
| wedding | READY | flusso production esistente e regressione obbligatoria |
| baptism | COMING_SOON | configurazione non completa end-to-end |
| eighteenth | COMING_SOON | contenuti frontend presenti, ma template DB e workflow production non completi |
| graduation | COMING_SOON | categorie/timeline non complete |
| confirmation | COMING_SOON | categorie/timeline non complete |
| communion | COMING_SOON | categorie/timeline non complete |
| anniversary | COMING_SOON | flusso non validato end-to-end |
| birthday | COMING_SOON | evento legacy production presente, ma nessuna categoria evento production |
| fifty | COMING_SOON | flusso non validato end-to-end |
| gender-reveal | COMING_SOON | evento legacy production presente come alias `genderreveal`; workflow non completo |
| retirement | COMING_SOON | eventi legacy production presenti; workflow non completo |
| baby-shower | COMING_SOON | flusso non validato end-to-end |
| engagement-party | COMING_SOON | eventi legacy production presenti; workflow non completo |
| proposal | COMING_SOON | flusso non validato end-to-end |
| corporate | COMING_SOON | flusso non validato end-to-end |
| bar-mitzvah | COMING_SOON | tassonomia/workflow non completi |
| quinceanera | COMING_SOON | tassonomia/workflow non completi |
| charity-gala | COMING_SOON | flusso non validato end-to-end |

Nessun tipo viene classificato BETA: non esiste un caso in cui l'esperienza parziale sia sufficientemente coerente da giustificarlo.

## Capability matrix

La configurazione tipizzata `src/lib/eventTypeCapabilities.ts` è la fonte operativa usata da onboarding, navigazione e route guard. La migration Branch 29 ne registra nel catalogo DB lo stato e le capability per rendere il modello interrogabile e preparare l'estensione futura senza dipendere da label tradotte.

### Matrimonio — READY

Moduli abilitati:

- Dashboard
- Budget
- Idea di Budget
- Invitati
- Fornitori
- Location Ricevimento
- Location Cerimonia
- Chiese
- Timeline
- Documenti
- Contabilità
- Save the Date
- Preferiti

`ceremony_mode = religious_or_civil`.

Location roles: `ceremony`, `reception`, `accommodation`, `after_party`, `other`.

Il ruolo legacy `party` resta accettato in `saved_locations` per backward compatibility; vengono aggiunti `main_event` e `after_party` senza riscrivere record.

### Tutti i COMING_SOON

- nessun nuovo evento completo può essere creato;
- nessun modulo wedding viene ereditato per fallback;
- `church_module = false`;
- `ceremony_mode = not_configured`;
- nessun budget/timeline template viene dichiarato pronto;
- nessuna supplier taxonomy viene inventata.

## Diciottesimo

Il Diciottesimo possiede materiale frontend storico (categorie/task in configurazioni applicative), ma production non dispone di `event_type_categories` o `event_timelines` dedicati e il workflow generale non è stato validato come indipendente dal Matrimonio. Per rispettare la regola di prodotto viene quindi classificato `COMING_SOON`.

Il Branch 29 non inventa né promuove tassonomie solo per renderlo READY.

## Budget e Timeline

Per i nuovi eventi non READY Budget e Timeline non sono raggiungibili. Questo elimina il problema per cui un tipo alternativo poteva apparire operativo usando configurazioni wedding o parziali.

Matrimonio continua a utilizzare il seed production esistente `seed_full_event` per le categorie evento. Il Branch 29 non riscrive categorie/spese esistenti e non migra tassonomie utente verso template globali.

Le tabelle `event_type_categories`, `event_type_subcategories`, `event_timelines` e relative traduzioni restano il modello previsto per rendere READY futuri tipi evento in branch dedicati.

## Legacy events

Gli eventi non READY già esistenti:

- restano nel database con lo stesso `event_type`;
- non vengono cancellati o convertiti in Matrimonio;
- non ricevono seed wedding;
- quando si entra in un modulo protetto vengono indirizzati allo stato Coming Soon;
- mostrano un messaggio esplicito di preservazione dati.

La vecchia CTA che cambiava soltanto cookie/localStorage in `wedding` è stata rimossa.

## Cambio event type

`QuickSettings` non permette più di cambiare tipo evento dopo la creazione. La precedente implementazione modificava solo stato client, senza migrare categorie, timeline o dati. Finché non esiste una procedura transazionale e lossless il tipo evento è read-only.

## Route guards

`EventModuleGuard` risolve l'evento tramite l'API owner-only prima di renderizzare i moduli protetti. La capability non dipende dalla label tradotta né dal solo localStorage.

Sono protette le route di Dashboard, Budget/Idea Budget, Invitati, Fornitori, Location, Cerimonia, Chiese, Timeline, Documenti, Contabilità, Save the Date e Preferiti.

## Multi-event

Il database supporta più eventi per owner, ma l'API legacy `event/resolve` seleziona ancora il primo evento creato e l'interfaccia corrente non espone un selettore evento autorevole. Branch 29 impedisce leakage di capability sul singolo evento risolto, ma non introduce un nuovo sistema di selezione multi-event perché richiederebbe una decisione di prodotto e persistenza del current event distinta dallo scope di questa correzione.

Nessun dato degli eventi aggiuntivi viene modificato.

## Backward compatibility Matrimonio

Il Branch 29 non modifica tabelle o route dei cataloghi globali `churches`, `locations`, `suppliers` né le relazioni private `saved_churches`, `saved_locations`, `saved_suppliers`, salvo l'estensione non distruttiva dei valori ammessi per `saved_locations.location_role`.

La regressione “Aggiungi Chiesa” del Branch 26/27 resta requisito bloccante prima del merge.

## Rischi residui deliberatamente rinviati

- popolamento affidabile dei template globali per tipi evento non wedding;
- sistema UI di selezione dell'evento corrente per owner multi-event;
- conversione sicura di un evento da un tipo a un altro;
- audit completo delle lingue e completeness scoring (Branch 30, non incluso qui).
