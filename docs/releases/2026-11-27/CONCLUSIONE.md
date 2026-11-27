# Conclusione del checkpoint — 27 novembre 2026

**STOP al rollout, motivazione residua: backup Production non disponibile/verificato.**
Preparazione tecnica conclusa con prove eseguite, non soltanto pianificate.
Questo documento sostituisce gli stati provvisori di CHECKPOINT.md.

## Candidato e stato conservato
PR94 a4bd47f e PR95 98a1aebe invariati, aperti/draft/non mergiati.
Prod main cd6b406a, candidato applicativo 98a1aebe, tree applicativo di riferimento
62395fcbc2a53b185ecc6e490619c3a2ea0d6e42. Nessun nuovo sviluppo prodotto.
PR96 contiene le prove, la documentazione e una correzione di sola raccolta test:
la suite standard esclude anche eighteenth-modules.spec.ts, già verificata nei
progetti party18 dedicati. Nessuna asserzione rimossa; 120 casi standard,
12 percorsi obbligatori e 50 Preview non mutanti, chiave server mai al browser.
Il futuro tree di merge con documenti/workflow differirà dal tree applicativo:
confrontare separatamente codice prodotto, dipendenze e migrazioni; i soli file
QA/documentazione aggiunti non sono nuove funzionalità da risviluppare.

## Evidenze concluse
- PASS QA PR94 e PR95 conservati: registrazione reale non ripetuta, 998 test,
  cinque lingue, tre eventi, Diciottesimo 320/360/390, budget/acconti, checklist,
  fornitori/location, rientro e isolamento. Browser run 45637463755.
- CI di checkpoint 45993656597 PASS.
- Playwright i18n 45993656383 PASS (lifecycle generale, Battesimo360/390,
  Preview integration e pulizia finale). Le prove dedicate Diciottesimo
  non sono rieseguite da questo branch di checkpoint: restano PASS sullo SHA
  applicativo invariato98a1aebe nel run45637463755.
- Branch54 compatibilità 45993656505 PASS. Tutti e sette i workflow del
  checkpoint9d33ce94 sono conclusi SUCCESS.
- Database Rebuild 45993656368 PASS.
- Branch53 old-app/new-schema 45993656506 PASS.
- Validazione Production smoke 45993656595 PASS, **solo statica**;
  nessun job HTTP/browser Production avviato.
- Gate esplicito 45993656604 PASS, job 140487524859:
  OLD_APP_SHA=cd6b406ac2db510a1a5a06ea398a73c02d97bf7b;
  NEW_SCHEMA_SHA=98a1aebeceb4cecbe53ea1979d4ad7e5597dbefb;
  PRODUCTION_CONNECTION=NONE. Vecchia app immutata, build, onboarding e
  12 percorsi autenticati PASS, cleanup e distruzione stack PASS.
- Nello stesso job, vero pg_dump custom e pg_restore in database separato
  release_restore_drill: PASS, dato canary recuperato e fingerprint funzioni
  public/private identico. Ruolo amministrativo esistente del solo cluster
  temporaneo; ownership/ACL non disabilitate. Database di restore distrutto,
  dump temporaneo rimosso. Digest del dump isolato:
  eeee379997bba89395ba8a5accf5afa6b2f4e4a142c24de136e180598e2373d3.
  Non è un backup di Production né un test dei suoi dati/byte Storage.

## Riconciliazione schema conclusa per il perimetro
21/21 corpi funzione condivisi confrontati sono identici ignorando CRLF/LF;
ACL confrontate identiche. Le 2 configurazioni search_path divergenti sono
read_family_baptism/save_family_baptism: Production e sorgente candidato
conservano search_path vuoto; non copiare l'impostazione più ampia del QA.
8/8 policy condivise sospette risultano identiche al confronto completo,
come vincoli e trigger events/expenses. File di evidenza:
function-bodies.json, drift-classification.json, policy-comparison.json.
Il vecchio inventario hash grezzo includeva differenze di fine riga e nomi
troncati; non va usato per dedurre migrazioni da applicare automaticamente.

Oggetti legacy eighteenth_plans/action/snapshot/eighteenth_details sono solo QA,
non referenziati dal codice candidato né necessari al rebuild certificato:
non portarli in Production. Il codice e la compatibilità sono stati provati
senza tali aggiunte legacy, sullo schema ricostruito dai sorgenti, non su un
clone integrale del backup Production (oggi indisponibile).

### Manifest Production da autorizzare, ordine esatto
1. 20261125100634_baptism_revision_parent_cascade_guard.sql
2. 20261125102641_eighteenth_party_plan_revision.sql
3. 20261125104656_eighteenth_partial_payments.sql

Checksum in migrations.sha256 (include anche il wrapper opzionale).
can_access_event effettivo è già autorevole in QA e Production: la migrazione
20261125093000 non è un quarto passo obbligatorio; verificare definizione/ACL
prima e riconciliare ledger senza reintrodurre il vecchio hotfix JWT.
NON applicare 20261119201651_event_access_nonempty_email. Le precedenti
migrazioni B53/B54/B57/Battesimo sono già in Production con versioni provider
diverse; non ripeterle. Le tre mancanti restano non applicate.

## Blocco residuo verificato, non ipotetico
Dashboard Production /database/backups/scheduled consultata in sola lettura:
**Free Plan does not include project backups**; upgrade Pro proposto ma non
attivato. Non esiste un punto di ripristino gestito attestato da questa verifica.
La connessione DATABASE_URL su Vercel è sensitive e non viene restituita
all'esecutore: nessun indebolimento delle protezioni, esportazione di segreti
o cambio della configurazione Production per aggirare il limite.
Manca quindi l'acquisizione manuale di un backup completo e protetto Production
(DB/ruoli/ACL, Storage, configurazioni) e il suo restore verificato in isolamento.
La prova temporanea ora PASS dimostra la procedura, non sostituisce quel backup.
Nessun upgrade o servizio a pagamento è autorizzato o necessario come scelta
obbligata; è possibile un backup manuale con accesso DB già autorizzato tramite
canale protetto. Non inviare credenziali in chat. Finché non esiste quel pacchetto,
STOP prima di merge, DDL o deploy.

## Sequenza concreta dopo chiusura del blocco e autorizzazione
1. Acquisire/verificare backup reale; concordare finestra e checkpoint finale.
2. Disabilitare/sospendere autodeploy Production e confermare il ritorno a cd6b406a.
3. Integrare PR94, retarget/integrare PR95; incorporare la sola correzione QA
   del checkpoint e documenti/workflow dopo aver verificato il diff residuo PR96.
4. Congelare scritture e backup finale; applicare soltanto le 3 migrazioni sopra;
   eseguire VERIFY_AFTER_MIGRATIONS.sql, RLS/ACL e controllo ledger.
5. Build esplicita con credenziali/ref Production, EIGHTEENTH_PREVIEW=1 solo
   nella build autorizzata; verificare SHA finale e nessun fallback alle variabili QA.
6. Promozione/deploy Production, controlli tre eventi e cleanup +0/+15/+60 min.
   In caso di regressione: congelare scritture e ripromuovere il vecchio deployment
   sulla base del gate ottenuto; nessuna down migration o cancellazione dati.
   Restore reale eventualmente necessario richiede autorizzazione separata.
Dettaglio operativo: SEQUENZA_DA_AUTORIZZARE.md e BACKUP_RESTORE.md.

## Anteprima e limiti
Preview READY riconfermata sul candidato originale:
https://il-budget-degli-sposi-qwv489r71-rzirafi87-archs-projects.vercel.app/it/dashboard
App health/latest non utilizzata. Mobile Chromium, non Safari/iPhone reale.
Nessun merge, DDL/DML Production, deploy Production, altro evento o servizio
pagato. Checklist aggiornata nel pacchetto; non viene dichiarato aggiornato
il pannello Sites live, che non è stato ripubblicato.
