# SPEC — Branch 55: Data Quality & Coverage

Autore: Claude (2026-10-18). Esecutore: Codex. Approvazione e gate Production: utente.
Basata sull'inventario read-only di Production in `HANDOFF.md` §4 e sulle decisioni dell'utente in `HANDOFF.md` §1.

## Obiettivo
Prima della Beta le coppie devono vedere un catalogo **vero, senza duplicati, con categorie coerenti e con "Verificato" solo dove è vero**. Il catalogo deve poter crescere in **tutte le province italiane** senza scraping.

Perimetro Beta: **matrimonio + Italia**. La modalità demo senza login resta.

## Fatti di partenza (Production, 2026-10-18)
- `suppliers`: 326 righe, tutte `source=legacy`, tutte `verification_status=VERIFIED`, `verified=true`, nessuna con `user_id` (rivendicata). **199 duplicati** per `normalized_name`+`city` (circa 127 unici). Righe messicane, alcune con `country_code=IT`; 4 righe `premium_plus` di test messicane, scadute.
- Categorie testuali in `suppliers.category`: 20 valori con sinonimi e varianti di maiuscole (`Fiori & Decor`/`Fiorai`/`fiori`, `Fotografi`/`fotografi`/`Foto & Video`, `Musica & Intrattenimento`/`Musica Ricevimento`, `Location & Catering`/`Ricevimento Location`/`Catering`/`catering`).
- **Le pagine di categoria cercano una stringa esatta:** `/fiorai` chiama `/api/suppliers?category=Fiorai` (2 righe), mentre la maggior parte dei fiorai è in `Fiori & Decor`. Per questo `/it/fiorai` risulta vuota e `/it/fotografi` mostra solo un fotografo messicano.
- `vendors` (431, usata da `VendorExplorer` / `esplora-fornitori`): 307 da Google con `verified=true`.
- `locations` 155 (128 legacy `VERIFIED`), `churches` 896 da Wikidata senza contatti.
- `saved_suppliers`, `saved_locations`, `saved_churches`: **0 righe**, quindi nessun dato di coppie da migrare.

## MUST (prima della Beta)

### 55.A Tassonomia unica delle categorie
- Una tabella o mappa canonica `category_slug` (riusare quella di `core-categories` se esiste già; non crearne una terza) con le traduzioni nelle 5 lingue.
- Mappatura **esplicita e testata** di ogni valore testuale esistente su uno slug canonico. Nessun valore non mappato può restare pubblico.
- Le pagine di categoria (`/fiorai`, `/fotografi`, `/atelier`, `/beauty`, `/gioiellerie`, `/wedding-planner`, `/location`, `/chiese`) filtrano per **slug**, non per stringa.
- Il filtro in `/fornitori` mostra **ogni categoria una sola volta**, tradotta. L'elenco delle categorie resta quello attuale (decisione utente): si eliminano solo i duplicati.

### 55.B Stato di verifica veritiero
- `VERIFIED` solo per i record che hanno superato un controllo esplicito, per esempio un profilo rivendicato e una P.IVA verificata. I dati `legacy`, `google`, `openstreetmap` e `wikidata` passano a `UNVERIFIED`/`PROBABLE`, senza cancellare nulla.
- La UI mostra il badge "Verificato" **solo** se `verification_status='VERIFIED'`. Per gli altri: nessun badge oppure "Non verificato", da decidere nella SPEC UI. Mai il badge derivato dal pacchetto.
- Migration **additiva / DML di correzione** solo tramite gate Production esplicito, con conteggi prima/dopo nel report.

### 55.C Deduplica
- Regole d'identità (roadmap 55.2): stesso `normalized_name` + stessa `city` + stessa categoria canonica e nessun conflitto di contatti → duplicato certo. Qualsiasi conflitto (telefono o sito diversi) → **coda di revisione** (`catalog_review_queue` esiste già), senza fusione automatica.
- Fusione non distruttiva: un record canonico, gli altri marcati come duplicati (`merged_into` o equivalente) e nascosti dal catalogo pubblico. Nessun DELETE.
- Vincolo o indice che impedisca nuovi duplicati certi.

### 55.D Paese e dati di test
- Le righe con `country_code` incoerente con la regione (es. `IT` + Jalisco) vanno corrette o nascoste.
- I dati di test (4 `premium_plus` messicani, `Fotógrafo Luna`, ecc.) vanno nascosti dal catalogo pubblico italiano. Nel perimetro Beta l'API pubblica restituisce **solo `country_code='IT'`** per il matrimonio.

### 55.E Un solo catalogo pubblico
- Decidere e documentare (ADR breve) se `vendors` confluisce in `suppliers`/`locations`/`churches` o viene ritirato dalle pagine pubbliche. Nel perimetro Beta **una sola fonte** per ogni pagina pubblica.
- Dati importati da Google (`vendors.source='google'`): non mostrarli finché non è verificata la compatibilità con i termini di Google Maps Platform sulla conservazione dei dati. Decisione utente.

## SHOULD (prima della Beta, se il tempo lo consente)
- **Copertura per provincia:** report (script read-only) con il numero di fornitori unici per provincia e categoria canonica, da rigenerare a ogni import. Serve a pianificare la crescita su **tutte le province**.
- **Crescita con dati aperti:** pipeline di import da OpenStreetMap (attribuzione ODbL nel footer e nella pagina dati) per location e sale, sempre come `PROBABLE` con `catalog_provenance`. **Nessuno scraping** di siti terzi.
- Ricerca: normalizzazione di accenti e maiuscole e tolleranza agli errori di battitura su nome, comune e provincia (roadmap 55.3).

## OUT OF SCOPE (altri branch)
- Flusso di rivendicazione del profilo, staff fornitore, pacchetti → **B59** (vedi `HANDOFF.md` §5 "B59").
- Pagamenti → B60. Testi legali → B57.

## Test richiesti (RED prima del fix)
1. `/api/suppliers?category=<slug fiorai>` restituisce i fornitori oggi classificati `Fiori & Decor`/`Fiorai`/`fiori`.
2. Il filtro delle categorie pubbliche non contiene duplicati, né per slug né per etichetta tradotta, in 5 lingue.
3. Nessun record pubblico ha badge "Verificato" con `source in (legacy, google, openstreetmap, wikidata)` senza un controllo registrato.
4. Il catalogo pubblico IT non restituisce record con regione o città non italiana.
5. Dopo la deduplica non esistono due record pubblici con la stessa chiave d'identità certa. I casi ambigui finiscono in `catalog_review_queue`.
6. pgTAP: la fusione non cancella righe; RLS invariata sulle tabelle catalogo.
7. E2E: `/it/fiorai` e `/it/fotografi` mostrano risultati italiani; `/it/fornitori` ha un elenco senza duplicati.

## Evidenze richieste nel report finale
Conteggi prima/dopo per tabella (totale, pubblici, `VERIFIED`, duplicati, non IT), elenco della mappatura delle categorie, numero di casi in revisione, CI verde, Preview smoke. Nessuna modifica a Production senza gate.
