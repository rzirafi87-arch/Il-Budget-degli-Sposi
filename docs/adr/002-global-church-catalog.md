# ADR 002 — Catalogo globale chiese e stato privato evento

- Stato: accettato per Branch 26
- Data: 2026-08-29
- Ambito: chiese e luoghi di culto; non include location o fornitori

## Contesto rilevato

La tabella `churches` pre-Branch-26 era un mix:

- catalogo pubblico (`churches_select_all`);
- contributi diretti degli utenti (`user_id`, insert/update client);
- dati commerciali e analytics (`subscription_tier`, featured, click e view);
- dati provenienti da Google (`google_place_id`, rating e sync);
- requisiti cerimonia non corredati da provenance.

In production erano presenti 2 record. Il Branch 26 non li cancella né li
riattribuisce: aggiunge i nuovi campi, usa `source = legacy` quando la provenienza
non è ricostruibile e assegna `TO_CHECK` ai record non già verificati.

## Decisione

`public.churches` è il catalogo globale condiviso. I campi legacy restano per
compatibilità, ma i nuovi import usano il contratto Branch 26: classificazione,
indirizzo, provenance, stato di verifica e confidence.

`public.saved_churches` contiene esclusivamente lo stato privato di un evento:
preferito, contattato, scelta finale, stato, note e preventivo. Non duplica nome,
indirizzo o contatti del catalogo.

La lettura del catalogo è concessa ad `anon` e `authenticated`, coerentemente con
l'attuale route GET e con possibili usi pubblici futuri. Non vengono create pagine
SEO per singola chiesa. Insert, update e delete del catalogo sono riservati al
backend/service role. La vecchia POST `/api/churches` risponde 405.

`saved_churches` mantiene il modello owner-only del Branch 25. Le policy verificano
`events.owner_id = auth.uid()` per SELECT, INSERT, UPDATE e DELETE. Non viene
introdotta membership.

## Integrità e cancellazioni

- unique `(event_id, church_id)` evita salvataggi duplicati;
- unique parziale `(event_id) where selected` consente una sola scelta finale;
- `event_id -> events(id) ON DELETE CASCADE`: lo stato privato non sopravvive
  all'evento;
- `church_id -> churches(id) ON DELETE RESTRICT`: una chiesa globale referenziata
  non può essere cancellata accidentalmente; va prima archiviata o bonificata;
- `(source, external_id)` unique parziale rende gli import idempotenti.

## Ricerca e geospaziale

La ricerca Branch 26 copre nome, città, provincia, regione e nazione con filtri e
paginazione server-side (massimo 24 risultati). Per il dataset iniziale e per le
query reali non serve PostGIS. Coordinate validate vengono conservate come
latitudine/longitudine; `geography(Point,4326)` e GiST saranno valutati solo quando
verrà implementata una vera ricerca per distanza.

Non vengono attivate `pg_trgm`, `unaccent` o full-text in questa fase: colonne
normalizzate e indici B-tree sono sufficienti per il pilota. L'evoluzione fuzzy
sarà guidata da volume e query misurate.

## Provenance, verifica e deduplicazione

La pipeline applica:

1. record sorgente;
2. normalizzazione senza perdere i valori originali;
3. controlli qualità per nome, località, country code, URL, telefono, coordinate e
   capienza;
4. dedupe primaria `(source, external_id)`;
5. segnalazione, senza merge automatico, dei match secondari su nome normalizzato,
   indirizzo, città e nazione;
6. confidence e derivazione `VERIFIED` / `PROBABLE` / `TO_CHECK`;
7. upsert transazionale e log in `sync_jobs`.

`VERIFIED` conferma i campi sostenuti dalla fonte indicata; non implica che campi
nulli come disponibilità matrimonio, capienza o parcheggio siano conosciuti.

## Dataset pilota

- Copertura: Sicilia, Comune di Agrigento (non l'intera Sicilia);
- record: 10;
- fonte: annuario enti ufficiale dell'Arcidiocesi di Agrigento;
- esito dry-run: 10 validi, 0 scartati, 0 duplicati, 0 errori;
- status: 10 VERIFIED per identità/località ufficiale, 0 PROBABLE, 0 TO_CHECK;
- import production: non eseguito nel Branch finché migration, rebuild, RLS e CI
  non sono verdi e non sono registrati i conteggi pre-import.

## Decisioni rinviate

- `church_suggestions`: necessario prima di riaprire proposte utente, ma fuori
  scope perché non esiste un workflow moderazione;
- adapter Google Places: non è richiesto né viene consumata quota;
- adapter OSM/Overpass e Wikidata: il contratto sorgente è predisposto, ma nessuna
  query massiva viene eseguita;
- dettaglio pubblico, mappa e pagine SEO: rinviati dopo la validazione qualità.

