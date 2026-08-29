# Database Supabase

Audit aggiornato al 29 agosto 2026, Branch 25. La fonte autorevole per lo stato corrente è il catalogo PostgreSQL del progetto Supabase `Il Budget degli Sposi`; gli SQL storici nella root non sono migration canoniche e non devono essere applicati in blocco a production.

## Stato e confini

- PostgreSQL 17, schema Data API principale `public`.
- 44 tabelle `public`, 5 view `public`, 21 funzioni `public`, 27 trigger applicativi.
- RLS attivo su tutte le 44 tabelle `public`.
- Storage: nessun bucket e nessun oggetto; nessuna policy applicativa Storage.
- Realtime: nessuna tabella `public` pubblicata.
- Edge Functions: nessuna.
- Migration registrate prima del Branch 25: una (`20260828133459_secure_exposed_tables`).
- Dati rilevati: 2 utenti Auth, 10 eventi, 1 profilo.

Il backup/PITR configurato per il piano non è verificabile dagli strumenti del repository. Per questo Branch 25 non elimina tabelle, colonne, record o indici esistenti.

## Ownership utente → evento

Il modello production effettivo è owner-only:

```mermaid
flowchart TD
  U["auth.users"] -->|"events.owner_id"| E["events"]
  E --> C["categories / subcategories"]
  E --> B["expenses / incomes / budget"]
  E --> G["guests / tables"]
  E --> T["timeline / cards"]
```

- Un utente può possedere più eventi: non esiste unique constraint su `events.owner_id`, e un proprietario ha attualmente più eventi.
- Le tabelle private autorizzano tramite `events.owner_id`.
- Il partner opzionale viene invitato da Auth e salvato come email nell'evento, ma production non contiene `event_members`: il partner non acquisisce automaticamente accesso condiviso.
- Il codice contiene route sperimentali basate su `event_members` e share token, ma le relative tabelle non esistono in production.
- Tre eventi fanno riferimento a owner UUID non più presenti in `auth.users`. Non sono stati cancellati, riassegnati o vincolati con una nuova FK.
- Prima del Branch 25 un utente Auth non aveva una riga `profiles` e non esisteva un trigger di provisioning. Il Branch 25 introduce un'unica strategia tramite trigger Auth e inserisce soltanto i profili mancanti.

Prima di introdurre membership occorre decidere ruoli e inviti (`owner`, `editor`, `viewer`) e migrare gli owner esistenti senza sostituire l'attuale ownership.

## ORPHANED LEGACY EVENTS

Production contiene tre eventi legacy i cui account Auth originali sono stati
cancellati. I log Auth conservano evidenza univoca della relazione storica fra
ciascun UUID e l'identità registrata nell'evento; nessuna email o altro dato
personale è riportato nel repository.

| `public_id` | Owner storico mascherato | Stato Branch 25 |
|---|---|---|
| `gs6bp72d` | `93518589…` | preservato, non accessibile agli utenti correnti |
| `inxt751n` | `857bc452…` | preservato, non accessibile agli utenti correnti |
| `xye8v65y` | `949fc8c8…` | preservato, non accessibile agli utenti correnti |

Questi record non vengono cancellati perché rappresentano dati utente
recuperabili e non vengono riassegnati perché nessuno degli account Auth
attualmente attivi è il loro proprietario. Branch 25 mantiene invariati gli
`owner_id` e rinvia la FK `events.owner_id → auth.users.id`: aggiungerla e
validarla oggi fallirebbe sui tre record, mentre cancellazione, account fittizi
o riassegnazione produrrebbero perdita o accesso improprio.

Le policy owner-only confrontano `events.owner_id` con `auth.uid()`: gli
eventi orfani non sono leggibili o modificabili dagli utenti correnti, non sono
pubblici e non esiste alcuna RPC di “claim”. Il test RLS usa una fixture
equivalente, non dati production.

Procedura futura di recupero:

1. l'utente originale crea un nuovo account;
2. un amministratore verifica la corrispondenza con l'identità storica;
3. identifica in modo univoco l'evento da recuperare;
4. aggiorna `owner_id` al nuovo `auth.uid()` tramite procedura amministrativa;
5. esegue nuovamente i test RLS e verifica l'accesso esclusivo;
6. dopo la remediation di tutti gli orfani introduce e valida la FK con
   semantica `ON DELETE RESTRICT` o altra semantica approvata esplicitamente.

## Mappa delle tabelle

| Tabella | Scopo e ownership | PK | Relazioni principali | Uso applicativo |
|---|---|---|---|---|
| `profiles` | Estensione privata di Auth, una riga per utente | UUID `id` | `id → auth.users` introdotta nel Branch 25 | preferenze utente e provisioning Auth |
| `events` | Evento privato, owner-only | UUID `id` | `owner_id` logico verso Auth; FK rinviata per orfani | nucleo di quasi tutte le route private |
| `categories` | Categorie per evento e categorie template | UUID `id` | `event_id → events`, `event_type_id → event_types` | dashboard, seed, budget |
| `subcategories` | Sottocategorie di budget | UUID `id` | `category_id → categories` | dashboard, spese, seed |
| `expenses` | Spese private | UUID `id` | `event_id → events` CASCADE; `subcategory_id` SET NULL | budget/dashboard |
| `incomes` | Entrate private | UUID `id` | `event_id → events` CASCADE | budget/dashboard |
| `budget_ideas` | Importi suggeriti per categoria/evento | UUID `id` | evento e categoria CASCADE; unique evento/categoria | idee budget |
| `budget_items` | Elementi budget/template; PK legacy integer | integer `id` | evento, vendor, tradition | budget e applicazione idee |
| `wedding_cards` | Dati cerimonia/ricevimento per evento | UUID `id` | evento CASCADE; church/location RESTRICT | wedding card |
| `guests` | Invitati privati | UUID `id` | evento CASCADE; gruppo famiglia SET NULL | gestione invitati/tavoli |
| `family_groups` | Nuclei familiari privati | UUID `id` | evento CASCADE; referente SET NULL | gestione invitati |
| `non_invited_recipients` | Destinatari non invitati | UUID `id` | evento CASCADE | gestione invitati |
| `tables` | Tavoli privati | UUID `id` | evento CASCADE; unique evento/numero | disposizione tavoli |
| `table_assignments` | Assegnazione univoca invitato-tavolo | UUID `id` | table e guest CASCADE | disposizione tavoli |
| `timeline_items` | Timeline privata legacy | UUID `id` | evento CASCADE | timeline baby shower e API privata |
| `user_event_timeline` | Istanze private da template timeline | UUID `id` | evento CASCADE; template SET NULL | timeline localizzata |
| `payment_reminders` | Promemoria di pagamento privati | UUID `id` | expense CASCADE | pagamenti |
| `suppliers` | Catalogo fornitore misto globale/contributo utente | UUID `id` | `user_id → auth.users` SET NULL; Google ID unique | catalogo/abbonamenti |
| `locations` | Catalogo location misto globale/contributo utente | UUID `id` | `user_id → auth.users` SET NULL; Google ID unique | catalogo/abbonamenti |
| `churches` | Catalogo chiese misto globale/contributo utente | UUID `id` | `user_id → auth.users` SET NULL; Google ID unique | catalogo/abbonamenti |
| `atelier` | Catalogo globale atelier | UUID `id` | nessuna ownership | elenco pubblico |
| `wedding_planners` | Proposte catalogo moderate | UUID `id` | `submitted_by → auth.users` | elenco pubblico/invio |
| `musica_cerimonia` | Proposte musicisti moderate | UUID `id` | `submitted_by → auth.users` | elenco pubblico/invio |
| `musica_ricevimento` | Proposte musicisti moderate | UUID `id` | `submitted_by → auth.users` | elenco pubblico/invio |
| `vendors` | Catalogo globale normalizzato e provenance | UUID `id` | `source_id` unique | sync e ricerca vendor |
| `places` | Luoghi normalizzati del catalogo vendor | UUID `id` | identificatori esterni unique | sync geografico |
| `vendor_places` | Relazione vendor-luogo | composita | vendor/place CASCADE | ricerca catalogo |
| `sync_jobs` | Stato ingestion server-only | UUID `id` | nessuna | route sync amministrative |
| `analytics_events` | Eventi analytics su cataloghi | UUID `id` | supplier/location/church CASCADE; user SET NULL | tracking server-side |
| `subscription_packages` | Piani pubblici attivi | UUID `id` | nessuna | checkout/listino |
| `subscription_transactions` | Pagamenti cataloghi | UUID `id` | supplier/location/church CASCADE | Stripe e profilo fornitore |
| `traditions` | Catalogo tradizioni | integer `id` | nessuna | contenuti pubblici |
| `checklist_modules` | Moduli template per tradizione | integer `id` | tradition | checklist pubblica |
| `event_types` | Catalogo tipi evento | UUID `id` | code unique | onboarding, dashboard, seed |
| `event_type_categories` | Categorie template per tipo | UUID `id` | event type CASCADE | seed/template |
| `event_type_subcategories` | Sottocategorie template | UUID `id` | categoria template CASCADE | seed/template |
| `event_timelines` | Timeline template | UUID `id` | event type CASCADE; unique tipo/key | timeline localizzata |
| `i18n_locales` | Locales supportate | text `code` | nessuna | i18n |
| `geo_countries` | Paesi e locale predefinito | text `code` | locale | i18n/geografia |
| `event_type_translations` | Traduzioni tipi evento | composita | event type e locale | i18n |
| `event_type_variants` | Override paese/tipo | composita | event type e paese | i18n |
| `category_translations` | Traduzioni categorie | composita | categoria e locale | i18n |
| `subcategory_translations` | Traduzioni sottocategorie | composita | sottocategoria e locale | i18n |
| `event_timeline_translations` | Traduzioni timeline | composita | timeline e locale | i18n |

## RLS e policy

- Cataloghi realmente pubblici: lettura di tipi evento, traduzioni, paesi/locales, tradizioni, cataloghi fornitori/luoghi verificati o destinati alla consultazione.
- Dati privati: `events` e tutte le tabelle dipendenti verificano l'owner dell'evento.
- Il Branch 25 rende esplicito `TO authenticated`, aggiunge `WITH CHECK` agli update sensibili e rimuove letture pubbliche da `budget_items` e `budget_ideas`.
- Le policy duplicate SELECT su guests, payment reminders e timeline vengono consolidate.
- Le proposte catalogo richiedono autenticazione, auto-attribuzione e stato pending/non verificato.
- `sync_jobs` resta senza policy client: è server-only.
- Le view pubbliche usano `security_invoker=true` e quindi rispettano RLS delle tabelle sottostanti.

## Funzioni e trigger

Le 21 funzioni `public` ricevono un `search_path` fissato ai soli schemi
fidati `public, extensions, pg_temp`. Le RPC che scrivono o fanno manutenzione
sono revocate a `PUBLIC`, `anon` e `authenticated` e concesse
esplicitamente a `service_role`. La RPC legacy
`regenerate_event_data(uuid)`, che citava una tabella inesistente, delega ora
alla rigenerazione timeline valida e preserva le categorie. Le funzioni
`SECURITY DEFINER` sono:

- `populate_event_categories()` e `populate_user_timeline()`: trigger post-insert evento;
- `set_owner_id()`: trigger pre-insert evento;
- `regenerate_event_data(uuid)` e `regenerate_event_timeline(uuid)`: manutenzione server-only.

I trigger `updated_at` sono presenti sulle tabelle applicative che espongono il campo. Branch 25 aggiunge il trigger Auth `on_auth_user_created_create_profile`, con funzione in schema `private`, per eliminare la doppia strategia/race di provisioning. Non sono emersi trigger ricorsivi.

## Foreign key e cancellazioni

- Le dipendenze strettamente interne a un evento usano prevalentemente CASCADE.
- Collegamenti opzionali usano SET NULL dove la riga figlia deve sopravvivere.
- Cataloghi e riferimenti template usano CASCADE o NO ACTION secondo la semantica esistente.
- Branch 25 aggiunge FK sicure da profilo/contributi utente ad Auth.
- La FK `events.owner_id → auth.users.id` è rinviata: tre record incompatibili richiedono una decisione esplicita e recuperabile.
- Nessun `ON UPDATE CASCADE`: gli identificatori non sono progettati per mutare.

## Indici e vincoli univoci

Sono preservati i vincoli esistenti: `events.public_id`, Google Place ID per cataloghi, `(event_id, lower(name))` per categorie, `(event_id, category_id)` per budget ideas, `(event_id, table_number)`, guest singolo per assegnazione, chiavi i18n composite e source ID vendor.

Branch 25 aggiunge soltanto indici su owner e FK usate dalle query attuali. Non rimuove i 109 indici segnalati come “unused”: il database ha pochi dati e la metrica non è sufficiente per una cancellazione. Anche il doppio indice su `timeline_items.event_id` resta candidato a una futura pulizia dopo backup verificato.

## Drift e schema riproducibile

Esiste drift rilevante:

- production ha 44 tabelle create storicamente, ma il repository registrava una sola migration di hardening;
- molti SQL nella root sono bootstrap/patch/seed storici sovrapposti, non una catena ordinata;
- il codice fa riferimento a relazioni assenti in production: `appointments`, `budgets`, `contact_messages`, `countries`, `event_members`, `event_share_tokens`, `gift_list`, `languages`, `user_favorites`, `wedding_guests`, `app_health_latest` e `v_country_event_wedding`;
- alcune route sperimentali usano anche colonne non presenti nello schema effettivo (`type_id`, `title`, `is_public`, `slug` in vari percorsi core).

Branch 25 risolve il drift per i nuovi ambienti tramite
`supabase/baseline/production_pre_branch_25.sql`, export schema-only generato
dai cataloghi PostgreSQL production prima del consolidamento. Contiene
extension applicative portabili, 44 tabelle, sequence, constraint, FK
preesistenti, 5 view, 21 funzioni, indici, RLS, 77 policy, 27 trigger e grant
rilevanti. Non contiene record production, identità Auth o segreti.

La baseline è intenzionalmente fuori da `supabase/migrations`:

- un ambiente nuovo la applica esplicitamente, quindi applica la migration
  incrementale Branch 25;
- production, dove gli oggetti esistono già, riceve soltanto la migration
  incrementale;
- nessun `repair`, squash, reset remoto o modifica manuale della migration
  history è necessario.

Non applicare `supabase-COMPLETE-SETUP.sql` o
`supabase-ALL-PATCHES.sql` a production: sono bootstrap/patch storici
sovrapposti e non costituiscono la baseline canonica.

## Oggetti applicativi assenti e codice legacy

| Oggetto/colonna | Classificazione | Produzione e decisione Branch 25 |
|---|---|---|
| `appointments` | A — route raggiungibile ma persistence non disponibile | La pagina mostra un'agenda fallback; create/update/delete richiedono una migration futura dedicata. Non si crea la tabella implicitamente. |
| `budgets` | C/D — API sperimentali evento, migration storica mancante | Le route per baby shower, birthday ed engagement non sono il data layer budget production canonico, che usa `events.total_budget`, `expenses`, `incomes`, `budget_items` e `budget_ideas`. |
| `contact_messages` | C — persistenza opzionale futura | Il form accetta la richiesta in modalità best-effort; nessuna tabella viene inventata nel Branch 25. |
| `countries` | D — nome legacy sostituito | La route raggiungibile usa ora la tabella production `geo_countries`. |
| `languages` | D — nome legacy sostituito | La route raggiungibile usa ora `i18n_locales`. |
| `event_members`, `event_share_tokens` | C — condivisione sperimentale non production | Il modello Branch 25 resta owner-only; le RLS non dipendono da queste tabelle e le route share non sono una funzionalità production supportata. |
| `gift_list` | C/D — pagina raggiungibile, schema futuro mancante | Il codice usa inoltre colonne evento legacy; richiede una feature migration completa, non una tabella creata per far tacere gli errori. |
| `user_favorites` | C — relazione privata futura | Da sostituire nei Branch 26+ con relazioni `saved_*` tipizzate e RLS per evento. |
| `wedding_guests` | D — alias legacy errato | La route production `event/resolve` è stata allineata alla tabella canonica `guests`. |
| `app_health_latest` | C/D — modulo admin incompleto | View e RPC refresh non esistono; il workflow health contiene ancora un dominio placeholder e non è un controllo production affidabile. |
| `v_country_event_wedding` | C — schema `app` sperimentale | Le route wedding/traditions mantengono fallback; la view non viene creata nel Branch 25. |
| `type_id`, `title`, `is_public`, `slug` | B/C — colonne del core storico | Production usa `event_type`/`event_type_id`, `name`, ownership privata e `event_types.code`. Le dashboard/seed legacy che le citano richiedono consolidamento funzionale separato. |

## HOW TO REBUILD THE DATABASE FROM ZERO

Il percorso autorevole e privo di dati production è:

1. installare Supabase CLI 2.116.0 e un runtime Docker compatibile;
2. inizializzare un progetto Supabase locale vuoto in una directory temporanea;
3. avviare `supabase start`;
4. applicare con `psql -v ON_ERROR_STOP=1`
   `supabase/baseline/production_pre_branch_25.sql`;
5. applicare
   `supabase/migrations/20260829110059_consolidate_security_and_indexes.sql`;
6. eseguire `supabase/tests/branch_25_schema.sql`;
7. eseguire `supabase/tests/branch_25_rls.sql`;
8. generare i tipi con `supabase gen types typescript --local`;
9. arrestare l'ambiente temporaneo con `supabase stop --no-backup`.

Il workflow `.github/workflows/database-rebuild.yml` automatizza esattamente
questa sequenza in GitHub Actions. La migration storica
`20260828133459_secure_exposed_tables.sql` non viene riapplicata nel rebuild:
il suo stato production è già rappresentato dalla baseline PRE-Branch-25.

## Service role, Auth e Storage

- La service role è letta soltanto da variabili server-side e non usa prefissi `NEXT_PUBLIC_`.
- Le API con service role devono autenticare il JWT e filtrare per owner perché bypassano RLS. I test IDOR coprono le route private principali.
- Due moduli admin duplicati (`supabase-admin.ts` e `supabaseAdmin.ts`) sono candidati a consolidamento futuro; non vengono rimossi senza migrare gli import.
- Una password database era versionata in file di configurazione/documentazione. È stata rimossa, ma deve essere ruotata perché resta nella cronologia Git.
- Non essendoci bucket, policy o chiamate Storage applicative, la gestione documenti non è oggi implementata tramite Supabase Storage.

### Censimento consumer della password database

| Consumer | Classe | Evidenza |
|---|---|---|
| Next.js browser/server e API Vercel | A | Usano URL Supabase, publishable/anon key e service role; non aprono connessioni PostgreSQL dirette. |
| Script `run-sql`, seed, verifica patch, connessione DB e task VS Code | B | Leggono `SUPABASE_DB_URL` o `DATABASE_URL` da ambiente locale non versionato. |
| Docker Compose locale | B, ma indipendente da production | Usa credenziali locali statiche e non la password Supabase production. |
| GitHub Actions attuali | A | La CI applicativa usa endpoint fittizi; il rebuild DB usa soltanto credenziali Supabase locali temporanee. |
| GitHub repository/organization secrets | C | I nomi/valori dei secret non sono enumerabili con gli strumenti disponibili. |
| Vercel environment variables | C per il censimento completo | La configurazione progetto è accessibile, ma il connettore disponibile non espone l'elenco delle variabili; non è possibile escludere un `DATABASE_URL` amministrativo. |
| Postazioni amministrative e secret store esterni | C | Non accessibili dal repository o dai connettori. |

### Piano di rotazione programmata

1. Inventariare in Vercel e GitHub i soli nomi delle variabili
   `SUPABASE_DB_URL`, `DATABASE_URL`, `POSTGRES_URL*`, `PGPASSWORD`.
2. Inventariare postazioni amministrative, task VS Code e automazioni esterne.
3. Salvare temporaneamente la nuova password in un password manager
   amministrativo; non inserirla in Git, chat o log.
4. Ruotare la password database dal pannello Supabase.
5. Aggiornare atomicamente ogni consumer diretto classificato B, iniziando dai
   job non interattivi e terminando con le postazioni locali.
6. Verificare connessione SQL read-only, migration tooling, CI, login,
   onboarding e API applicative.
7. Se un consumer diretto smette di funzionare, ripristinare temporaneamente la
   password precedente dal pannello Supabase, riallineare tutti i secret store
   e ripetere la rotazione. Non mantenere due connection string divergenti.

La rotazione resta obbligatoria prima del merge. La storia Git condivisa non
viene riscritta nel Branch 25.

## Evoluzione per Branch 26+

Separare sempre catalogo pubblico e stato privato:

| Globale | Relazione privata wedding | Provenance minima |
|---|---|---|
| `suppliers` | `saved_suppliers` | `source`, `source_url`, `external_id`, `verified_at`, `updated_at`, `confidence` |
| `venues` (non riusare automaticamente `locations`) | `saved_venues` | stessi campi |
| `churches` | `saved_churches` | stessi campi |

Le relazioni private devono contenere `event_id`, stato pipeline, preferito, contattato, note, preventivo/costo e scelta finale, con unique `(event_id, global_entity_id)` e RLS membership-aware. Non inserire note personali nelle entità globali.

Strategia futura:

- deduplicazione: unique parziale su `(source, external_id)`, normalizzazione nome/indirizzo e revisione manuale dei match ambigui;
- geospaziale: lat/lng validati, PostGIS `geography(Point, 4326)` e GiST quando iniziano query di distanza reali;
- ricerca: colonne normalizzate, `unaccent`, `pg_trgm` per fuzzy matching e GIN full-text per nome/categoria/città;
- indici: aggiungerli dalle query reali, inclusi `(country, region, city)` e chiavi di relazione privata;
- membership: tabella evento-membro come fonte unica di autorizzazione, senza rimuovere `owner_id` durante la prima migrazione.

## Workflow migration

1. Creare una migration timestampata in `supabase/migrations`.
2. Eseguire preflight su record incompatibili e backup disponibile.
3. Applicare a un branch Supabase senza dati o a un ambiente locale equivalente.
4. Eseguire `supabase/tests/branch_25_rls.sql` e test applicativi.
5. Controllare Security/Performance Advisor e drift.
6. Applicare a production solo dopo verifica; mai modificare production manualmente fuori migration.
