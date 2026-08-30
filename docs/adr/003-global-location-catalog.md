# ADR 003 — Catalogo globale location e collegamenti tra moduli

- Stato: accettato per Branch 27
- Data: 2026-08-30

## Contesto e decisione

La tabella `locations` pre-Branch-27 era un mix legacy: catalogo pubblico, contributi utente diretti, dati Google, metriche e abbonamenti. I 128 record production documentati vengono preservati. I record senza provenienza ricostruibile diventano `source = legacy` e `TO_CHECK`; nessun dato privato viene trasferito o inventato.

`locations` diventa il catalogo globale server-managed. `saved_locations` conserva lo stato privato evento↔location: ruolo, preferito, contatto, visita, shortlist, selezione, note e preventivo/costo. La selezione è unica per `(event_id, location_role)`, non per il solo evento, perché ricevimento, cerimonia civile, pernottamento e festa possono usare strutture diverse.

`places` resta l'anagrafica geografica del sottosistema vendor; `vendor_places` resta la relazione N:N tra `vendors` e luoghi operativi. Non sono duplicati di una struttura ricettiva e non vengono eliminati. Il Branch 28 potrà associare fornitori a location tramite una relazione esplicita, senza reinterpretare automaticamente `place_id` come `location_id`.

## Collegamenti tra moduli

| Collegamento | Stato | Decisione |
|---|---|---|
| Event ↔ Church | IMPLEMENTATO | `saved_churches`, owner-only; invariato e coperto da regressione. |
| Event ↔ Location | IMPLEMENTATO | `saved_locations` con ruolo e stato privato. |
| Dashboard ↔ Church | IMPLEMENTATO | Nome selezionato o CTA “ancora da scegliere”. |
| Dashboard ↔ Location | IMPLEMENTATO | Location ricevimento selezionata o CTA. |
| Budget ↔ Location | PREDISPOSTO | `event_id`, location selezionata e `agreed_cost` permettono il futuro link opzionale; nessuna riscrittura di `expenses`. |
| Timeline ↔ Location | PREDISPOSTO | Timeline event-scoped; FK dedicata rinviata finché non esiste UX contestuale. |
| Supplier ↔ Location | RINVIATO | `vendor_places` indica aree operative, non strutture; relazione esplicita prevista nel Branch 28. |
| places/vendor_places ↔ locations | PREDISPOSTO | Modelli distinti preservati; coordinate e provenance consentono matching moderato futuro. |
| API ↔ UI | IMPLEMENTATO | Catalogo paginato, stato privato e riepilogo Dashboard. |
| Global ↔ saved/private | IMPLEMENTATO | Global read-only client; private owner-only con RLS. |

## Dataset pilota e ingestione

Cinque strutture della provincia di Agrigento validate offline da siti ufficiali: Villa Athena Resort, Hotel Villa Romana, Castello Chiaramonte, Parco Chiaramontano e Relais Villa Giuliana. Dry-run: 5 letti, 5 validi, 0 invalidi, 0 duplicati. Nessun prezzo incluso e nessun import production automatico.

Church e Location condividono `catalog-import-core`: normalizzazione testo/telefono/URL, ID deterministico, confidence e stati canonici. Deduplica primaria `(source, external_id)`; quella secondaria combina nome normalizzato, città, paese e indirizzo. Catene omonime in città diverse non vengono fuse.

## Rischi e rinvii

- Campi commerciali legacy preservati ma esclusi dai nuovi import.
- Nessuna mappa o ricerca per distanza finché non esiste una query geografica reale.
- Proposte utente richiedono un workflow moderato separato.
- Budget e timeline invariati per evitare relazioni premature e obbligatorie.
