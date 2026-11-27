# Checkpoint rilascio — 27 novembre 2026

**PASS preparazione ed evidenze funzionali. STOP autorizzazione rollout.**
Nessun merge, DDL/DML Production, deploy Production o nuovo evento eseguito.

## Riferimenti immutabili verificati
- PR94 OPEN/DRAFT, base main cd6b406ac2db510a1a5a06ea398a73c02d97bf7b,
  HEAD a4bd47fcd1fced13f435a2141be7c476f3b0c1ca.
- PR95 OPEN/DRAFT, base PR94 a4bd47f, HEAD 98a1aebeceb4cecbe53ea1979d4ad7e5597dbefb.
- Candidato applicativo: PR95; tree 62395fcbc2a53b185ecc6e490619c3a2ea0d6e42.
  Non è ancora il commit di merge finale. Dopo integrazione il tree deve coincidere;
  ogni differenza sostanziale riapre i test. Nessuna integrazione simulata dichiarata reale.
- Production READY dpl_54kfaRR3cR9Buvzfp77D82w7Ves7 su main@cd6b406a.
- Preview finale READY dpl_AKGmnRx1qe52Bpu6CPD3wKjMinA9 sullo SHA PR95:
  https://il-budget-degli-sposi-qwv489r71-rzirafi87-archs-projects.vercel.app/it/dashboard

## PASS da conservare
PR94: email reale confermata e rientro, revisione diff, sei workflow su e6585e8;
HEAD a4bd47f successivo solo documentale. Non ripetere signup reale.
PR95: CI 45637463717 e browser 45637463755 ancora SUCCESS alla rilettura;
151 suite/998 test, 6 prove Diciottesimo 320/360/390, 2 Battesimo360/390,
14 percorsi generali, cleanup residue=0 e stack distrutto. Cinque lingue,
checklist/timeline comune, acconti, fornitori/location, rientro/isolamento PASS.
Limite: Chromium mobile, nessuna certificazione Safari/iOS reale.

## Ordine di integrazione da autorizzare in seguito
1. Prima di qualsiasi merge su main: verificare/sospendere il deploy automatico
   Production del progetto Vercel e gli altri hook di rilascio. Un merge può
   avviare Production: non considerarlo un'operazione soltanto Git.
2. PR94 -> main mantenendo ancestry; verificare base immutata e niente conflitti.
3. Retarget PR95 a main, verifica diff residuo, poi PR95 -> main senza ricostruire
   le correzioni. Non usare squash che perda le relazioni senza rivalidare il tree.
4. Fissare il nuovo SHA finale, confrontare il tree applicativo col candidato,
   eseguire CI/preview sullo SHA finale e sul manifest schema definitivo.
5. Solo con gate sotto GREEN: backup verificato, manutenzione scritture,
   migrazioni concordate e promozione controllata. Nessun passo autorizzato oggi.

## Confronto QA / Production in sola lettura
QA tnopiqxlcuakkavpwbrq PG17.12; Production vsguhivizuneylqhygfk PG17.6.
Entrambi ACTIVE_HEALTHY dal control plane: non equivale a collaudo applicativo.
Evidence.json conserva inventari, hash DDL/ACL/RLS, definizioni RPC mirate,
vincoli/trigger events/expenses e ledger migrazioni. I nomi dei ledger sono
spesso timestamp provider + nome di file originale: non confrontare solo version.
Gli hash sono inventario diagnostico, non una prova di equivalenza semantica.
Vincoli e trigger di events/expenses identici; i corpi delle funzioni possono differire.

### Migrazioni mancanti / ordine proposto
| Ordine | File del repository | QA / Production | Azione proposta |
|---|---|---|---|
| 0 | 20261125093000_restore_actor_authorization_wrapper.sql | Ledger assente in entrambi; can_access_event effettivo già equivalente | Riconciliare ledger/definizione prima; DDL additiva solo se necessaria e approvata. |
| 1 | 20261125100634_baptism_revision_parent_cascade_guard.sql | QA presente / Production assente, difetto nel corpo trigger confermato | Applicare soltanto dopo backup e test sul pacchetto completo. |
| 2 | 20261125102641_eighteenth_party_plan_revision.sql | QA presente / Production assente | Creare tabella, RLS e RPC metadati. |
| 3 | 20261125104656_eighteenth_partial_payments.sql | QA presente / Production assente | RPC acconti/saldo dopo controllo dipendenze expenses. |

Non riapplicare migrazioni B53/B54/B57, atomic_budget_idea_apply,
atomic_event_update, baptism_family_plans/validation/client_rpc_grants:
il ledger Production le registra già, con versioni provider differenti.
Non applicare la storica 20261119201651_event_access_nonempty_email:
non presente nel ledger Production, ma reintroduce il wrapper JWT insicuro.
Non è un passo mancante da eseguire in sequenza cieca.

### Drift da riconciliare, non da copiare automaticamente
- QA read_family_baptism/save_family_baptism hanno search_path
  pg_catalog,public,auth,extensions,pg_temp; Production ha search_path vuoto.
  I corpi, escluso quel setting, coincidono. Serve spiegare/normalizzare la
  provenienza prima di certificare un replay esatto; non ampliare ACL per tentativi.
- QA ha eighteenth_plans, eighteenth_action/snapshot, policy legacy,
  expenses.eighteenth_details e migrazioni QA del 20/11 non presenti in Production.
  Il codice candidato non referenzia questi oggetti: non copiarli come requisiti
  del nuovo planner. Verificare su clone esatto di Production che siano superflui.
- Altre funzioni/policy differiscono nell'inventario; schema-drift.txt elenca
  le identità complete delle funzioni. Differenze di formattazione/search_path/ACL
  non sono automaticamente nuove migrazioni. La convergenza completa non è PASS.

## Compatibilità vecchia app + nuovo schema: STOP del gate finale
I PASS storici B53/B54 su e6585e8 restano validi per quel pacchetto. Non coprono
le ultime due migrazioni Diciottesimo sullo SHA finale. Le modifiche nuove sono
additive nella lettura del diff; questo è un'indicazione, non un test runtime.
Il workflow branch54-main-compatibility.yml fissa OLD_APP_REF=cd6b406a e ricostruisce
il nuovo schema; deve essere eseguito sul candidato finale/manifest riconciliato.
In questa preparazione non è stato eseguito un nuovo gate contro un clone esatto
Production. Non promuovere il PASS della nuova app a PASS della vecchia app.

Prova richiesta prima della decisione:
- clone isolato PostgreSQL17 con schema Production senza dati personali;
- applicazione dei soli passi concordati sopra; verifica RLS/ACL/trigger;
- bundle cd6b406a: login, dashboard, spese/budget, invitati, location/fornitori,
  documenti, seating, cancellazione e rientro; nuovo bundle: tre eventi;
- fixture con owner/partner/revoca/legacy, nessuna contaminazione; residue=0;
- salvataggio report con SHA vecchio, SHA nuovo e digest schema/migrazioni.

## Backup e ripristino — piano concreto, non ancora certificato
Prima del DDL: verificare nel progetto Production il backup disponibile,
retention, punto temporale e possibilità di ripristino senza upgrade a pagamento.
I connettori disponibili non hanno fornito elenco backup né prova di restore:
NON esiste oggi una garanzia di ripristino verificata in questo checkpoint.

Pacchetto da acquisire tramite canale protetto, senza segreti nei log:
- dump consistente custom-format PostgreSQL17 + schema/ruoli/ACL e ledger;
- inventario Storage e copia versionata degli oggetti: il solo dump DB non
  ripristina i file; configurazioni Auth (redirect/mail), Vercel e riferimenti
  ai segreti conservati separatamente, senza pubblicare i valori;
- SHA256, orario, dimensioni, destinazione protetta, retention e restore drill.
Comandi modello in BACKUP_RESTORE.md. Non avviati contro Production.

Rollback: spegnere il flag Diciottesimo e ripromuovere il vecchio deployment
solo dopo PASS old-app/new-schema. Conservare schema additivo e nuovi dati;
non fare DROP/down migration alla cieca. Se occorre restore DB, fermare tutte
le scritture e riconciliare Storage e modifiche successive al backup: il restore
può perdere dati. Richiedere autorizzazione separata per quel ripristino.

## Controlli successivi al rilascio proposto
Verificare SHA effettivo + DB ref Production, flag compile-time Diciottesimo=1
solo nella build approvata, chiave server non esposta, login/rientro tre eventi,
budget/acconti e saldo, invitati, checklist/timeline, salvataggio fornitori/location,
isolamento e 404 cross-event, cancellazione Battesimo con pagamenti, download
privati, zero errori nuovi 5xx e pulizia fixture. Confrontare contatori/aggregati
pre/post senza scrivere su eventi reali. Osservare subito, +15min e +60min;
soglia di arresto: accesso cross-event, perdita dati, pagamenti duplicati o 5xx
riproducibili -> freeze scritture e rollback controllato. Nessuno smoke live eseguito.
Non usare /api/health/latest: manca app_health_latest.

## Decisione e autorizzazioni precise
**STOP per rollout**: drift non riconciliato; gate vecchia app sul manifest finale
non eseguito; backup/restore non verificato; SHA di merge non ancora creato.
Autorizzazione utile adesso: completare esclusivamente validazione isolata,
riconciliazione sorgenti e restore drill gratuito, mantenendo Production read-only.
L'autorizzazione a merge/DDL/deploy va richiesta solo con questi blocchi chiusi,
manifest e checksum congelati, SHA finale e piano di ritorno verificato.

Checklist operativa: CHECKLIST_COORDINAMENTO.md. Aggiornamento preparato come
file del repository; il pannello Sites non viene pubblicato in questo checkpoint
per rispettare il divieto di deploy. Non dichiarare aggiornata la vista live.
