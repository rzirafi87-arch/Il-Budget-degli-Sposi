# Gate di lancio — 25 novembre 2026

## Riferimenti verificati sul remoto
- PR94: aperta/draft, base main cd6b406ac2db510a1a5a06ea398a73c02d97bf7b,
  HEAD in ingresso 7473527641318c900e543dff4dbc9b21525897e9.
- PR95: aperta/draft, HEAD 3daf382a54aac4eeb45c341711b3bf12e4f91f1e.
- Anteprima PR94 aperta nel browser: /it/battesimo disponibile; richiede accesso.
- Anteprima PR95 esistente READY su 3daf382, ma non certificata per scritture QA.

## Esito: STOP al lancio pubblico
| Gate | Esito | Evidenza e limite |
| --- | --- | --- |
| Conferma email reale | STOP | Nessuna sessione autenticata disponibile nel browser corrente. Nessuna email pertinente trovata nella ricerca mirata degli ultimi 14 giorni. Registrazione/conferma/rientro non eseguiti; non sostituiti da creazione amministrativa o test simulati. |
| Mobile 360/390 | STOP | Nessun collaudo autenticato a queste due larghezze eseguito in questa ripresa. L'apertura desktop del planner non equivale a PASS mobile. |
| Revisione diff completo | STOP | Inventario di 159 file; esaminate aree di autorizzazione, API modificate, selezione evento, registrazione, workflow e ricostruzione DB. Trovato e riprodotto un difetto; la revisione completa e la nuova CI restano da chiudere. |

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

## Prossimo passaggio necessario
Completare nel browser QA registrazione e conferma email reale, poi rientro
con lo stesso account. La registrazione richiede intervento manuale secondo
le regole del browser; non richiede nuove password in chat.
Proseguire con mobile autenticato e revisione residua, quindi aggiornare
la base PR95 conservando 3daf382 e completarne i moduli e il collaudo.
Nessun merge, servizio a pagamento o rilascio Production eseguito.
