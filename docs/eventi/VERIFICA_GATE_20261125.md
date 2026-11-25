# Gate di lancio — 25 novembre 2026

## Riferimenti verificati sul remoto
- PR94: aperta/draft, base main cd6b406ac2db510a1a5a06ea398a73c02d97bf7b,
  HEAD in ingresso 7473527641318c900e543dff4dbc9b21525897e9.
- PR95: aperta/draft, HEAD 3daf382a54aac4eeb45c341711b3bf12e4f91f1e.
- Anteprima PR94 iqn5p57uf: registrazione, conferma email reale e login del nuovo account verificati.
- Anteprima PR95 esistente READY su 3daf382, ma non certificata per scritture QA.

## Esito: PASS dei gate tecnici su e6585e8; rilascio in attesa di checkpoint
| Gate | Esito | Evidenza e limite |
| --- | --- | --- |
| Conferma email reale | PASS | Nuovo account QA creato il 25/11 alle 09:08:54 UTC; email inviata alle 09:08:54, confermata alle 09:09:11. Verifica read-only auth.users. Login successivo completato nel browser tramite modulo protetto: /it/battesimo autenticato, comandi Esci e Nuovo battesimo visibili. Nessuna conferma amministrativa. |
| Mobile 360/390 | PASS | Due esecuzioni integrali del workflow 45593220837 sullo stesso codice; Battesimo 360/390, percorsi Matrimonio, cleanup fixture e distruzione stack. Evidenze e limite di rilascio in REVISIONE_PR94_E6585E8.md. |
| Revisione diff completo | PASS | Revisione residua conclusa su 167 file; correzioni autorizzazione/cascata incluse, nessun finding bloccante aperto nel pacchetto verificato. Rapporto REVISIONE_PR94_E6585E8.md. |

## Storico delle verifiche
Le sezioni seguenti documentano i checkpoint precedenti; dove differiscono, prevalgono il riepilogo corrente e il rapporto finale.

## Difetto confermato e correzione
La migrazione storica 20261119201651_event_access_nonempty_email sostituisce
il wrapper Branch53 con una funzione che usa l'email del JWT per il fallback
legacy. Un token con email non più corrispondente ad auth.users può ottenere
accesso; la funzione autorevole private.event_access_role_for_actor lo nega.
Il QA attuale ha già il wrapper corretto (lettura pg_get_functiondef verificata).
Questo finding riguarda replay e coerenza dei sorgenti, non dimostra un accesso
abusivo avvenuto nel QA o in Production.

Aggiunta una migrazione successiva che ripristina il wrapper Branch53 senza
riscrivere i file storici, e un test SQL con fixture in rollback. La CI isolata
applica la versione storica, richiede il fallimento STALE_JWT_EMAIL_AUTHORIZED,
applica la riconciliazione e richiede PASS. Lo script di rebuild include il wrapper.

Prove completate in questa ripresa:
- PostgreSQL locale PGlite: RED sulla funzione storica, GREEN dopo la nuova
  migrazione, verificando token obsoleto, partner attivo, revoca, owner e anonimo.
- Test SQL sul QA tnopiqxlcuakkavpwbrq: PASS sul wrapper già corretto; ROLLBACK.
  Nessuna DDL o migrazione applicata al QA o a Production in questa ripresa.
- PR94: 963 test / 143 suite PASS.
- PR95 originale: 980 test / 146 suite PASS; TypeScript PASS.
- Preflight statico B54/B57: 18/18 PASS; non equivale a un gate runtime.
- bash -n e git diff --check PASS.

## Preparazione PR95
Configurate esclusivamente sul branch feature/eighteenth-completion-20261123
le variabili pubbliche URL/anon QA e SUPABASE_EXPECTED_PROJECT_REF.
NEXT_PUBLIC_EIGHTEENTH_PREVIEW=0 fino al completamento della configurazione.
La chiave server QA del branch Battesimo è di tipo sensitive: il connettore
non ne restituisce il valore. Non è stata sostituita con la chiave Production
né ne è stato indebolito il tipo. Serve configurare SUPABASE_SERVICE_ROLE_KEY
QA per il solo branch PR95 prima di ricostruire/attivare l'anteprima.
Nessuna nuova build PR95 richiesta con configurazione incompleta.
Nessuna nuova funzione Diciottesimo dichiarata completata.

## Conferma email e rientro completati
La prova usa un nuovo account reale, senza creazione o conferma amministrativa.
Dopo la conferma, il login protetto è riuscito nell'anteprima PR94 iqn5p57uf.
Il planner mostra correttamente una lista vuota e Nuovo battesimo, senza dati
appartenenti agli altri account. Le due sessioni già aperte sull'alias QA
sono state riconosciute e restano disponibili.

## Esiti remoti su 32db25a
- Database Rebuild: PASS, inclusa regressione RED/GREEN autorizzazione.
- Compatibilità Branch53 vecchia app/nuovo schema: PASS.
- Compatibilità Branch54 main corrente/nuovo schema: PASS.
- Preview integration e signup mobile simulato: PASS; non sostituiscono email reale.
- CI: FAIL al lint della pagina anteprima (anchor interna invece di Link).
- Validazione smoke: FAIL per Diciottesimo raccolto nella suite standard
  (150 casi invece dei 120 richiesti). Nessuno smoke Production eseguito.
- Lifecycle isolato: FAIL per selettori listitem obsoleti dopo il passaggio
  a ul/li con button e per copia errore budget non aggiornata nel test.
Correzioni mirate in questa ripresa: Link interno; esclusione del test
Diciottesimo dalla suite standard (resta nel progetto party18 dedicato);
selettori button e testo budget letto dal catalogo effettivo. Nessuna
riduzione delle asserzioni di isolamento o delle soglie richieste.

## Collaudo mobile dedicato aggiunto
Aggiunti e2e/baptism-mobile.spec.ts e playwright.baptism.config.ts: due
progetti autenticati 360/390, esclusi dalla suite standard. Il workflow
isolato ricostruisce anche le migrazioni Battesimo e prova salvataggio,
pagamento aperto, recupero dopo reload, invitati, invito senza note private,
moduli condivisi, logout/login e assenza di overflow. Fixture esclusivamente
su database loopback temporaneo; email reale resta una prova separata.
Raccolta dei due test PASS; esecuzione browser remota ancora da verificare.
Lint PASS (0 errori), TypeScript PASS, isolamento suite standard PASS
(120 casi standard, 12 journey obbligatori, 50 Preview non mutanti).

## Prossimo passaggio necessario
Verificare la nuova CI, completare mobile autenticato 360/390 e revisione
residua, quindi aggiornare la base PR95 conservando 3daf382 e completarne
i moduli e il collaudo. Il lancio resta STOP per i gate residui.
Nessun merge, servizio a pagamento o rilascio Production eseguito.

## Controllo successivo su 7a0f54e
CI, Database Rebuild, validazione smoke e compatibilità Branch53/54 PASS.
Preview integration PASS. Lifecycle isolato STOP nel nuovo test Battesimo:
la pulizia mascherava l'asserzione iniziale del titolo (il titolo effettivo
include «Il battesimo di»). Corretto il selettore senza ridurre il controllo;
errori del percorso e del cleanup ora conservati entrambi.

La pulizia ha inoltre rivelato un difetto reale, riprodotto in QA con fixture
in rollback: la cancellazione di un evento con spese Battesimo genera 23503.
Il trigger bump_baptism_revision tenta di aggiornare il piano durante la
cascata dopo che il padre events è stato cancellato. Riprodotto RED anche
in PostgreSQL locale rispettando l'ordine reale di creazione delle FK.

Correzione additiva 20261125100634_baptism_revision_parent_cascade_guard,
generata/applicata esclusivamente in QA tramite il gestore migrazioni.
Il trigger aggiorna la revisione solo se il lock trova ancora il padre;
conservati controllo identità righe, lock, security definer, search_path e ACL.
GREEN locale e QA reale: guest edit incrementa revisione, cancellazione evento
con ospite e acconto riuscita senza orfani. Test SQL:
database/tests/baptism_event_delete_cascade.sql (tutte le fixture in rollback).
Fingerprint QA prima/dopo invariati:
- events b54b79ffac36bc9a5837e7a47da819a9
- expenses bbae2f23a64bdad03ae568d5ff4a10ec
- baptism_family_plans 2d5b930e369f7b3e0f7dee6122d0474e
TypeScript, controllo diff e sintassi shell PASS. Nuova esecuzione mobile
ancora necessaria. Nessuna modifica Production; il pacchetto di rilascio
futuro dovrà includere anche questa migrazione dopo il checkpoint richiesto.


## Chiusura tecnica Matrimonio/Battesimo — e6585e8
Matrimonio PASS QA/Release Candidate; Battesimo PASS QA/Release Candidate.
Conferma email reale conservata, nessuna ripetizione. Sei workflow PASS sul
checkpoint; il rebuild è passato dopo retry dello startup per porta occupata.
La seconda esecuzione integrale di Playwright include la pulizia delle fixture
e lo shutdown dello stack. Nuovo codice applicativo Production non rilasciato.
Prima del rilascio pubblico rimane il checkpoint esplicitamente richiesto,
con preflight e riconciliazione migrazioni Production. Non è un merge automatico.
