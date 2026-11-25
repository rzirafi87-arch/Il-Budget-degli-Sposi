# Diciottesimo — ripresa 23 novembre 2026

Base: feature/battesimo-completo@7473527641318c900e543dff4dbc9b21525897e9.
Branch isolato: feature/eighteenth-completion-20261123.

Il prototipo feature/eighteenth-party è già incluso nella base: non viene
ricostruito né unito una seconda volta. PR90 riguarda il core/lingue,
non è una PR dedicata al Diciottesimo.

## Primo intervento
- Riepilogo e spese caricati da un solo endpoint con eventId risolto una volta.
- Entrambe le query DB filtrano la stessa identità autorizzata.
- Il caricamento fallito azzera i dati precedenti, senza mostrare un falso zero.
- Il salvataggio invia X-Expected-Event-Id; POST spese risponde 409 EVENT_CHANGED
  se un'altra scheda ha selezionato un evento diverso. Il campo non autorizza
  accessi: il confronto avviene dopo la risoluzione server e prima di scrivere.
- Blocco sincrono dei doppi invii e conservazione dell'importo dopo errore.
- Importi positivi con massimo due decimali, tetto coerente col planner;
  budget iniziale non negativo, finito e con massimo due decimali.
- Date reali e bisestili validate, nome obbligatorio.
- Riprova disponibile nelle cinque lingue.

17 test mirati PASS in tre suite; TypeScript PASS. Nuovi test coprono
riepilogo univoco, data impossibile, importi non validi, cambio evento,
doppio invio e conservazione del modulo. Non equivalgono a un collaudo mobile.
Nessuna nuova migrazione per questo intervento; nessuna attivazione pubblica.
NEXT_PUBLIC_EIGHTEENTH_PREVIEW resta il gate di attivazione.

## Prima di proporre l'anteprima
Configurare e verificare il branch Vercel con progetto/chiave server QA dedicati.
Non usare automaticamente le variabili Production ereditate da nuovi branch.
Completare percorso organizzatore/festeggiato, programma, checklist dedicata,
invitati e conferme, spese/acconti, fornitori, location e messaggi/inviti.
Provare il cambio dei tre eventi con dati distinti e il rientro nell'account.

## Consegna precedente
Matrimonio/Battesimo consolidati nella PR94 verso main. Migrazioni necessarie
applicate e verificate; codice pubblico ancora non rilasciato. Restano reali
la prova di conferma email e la validazione finale del pacchetto: l'ordine
richiesto dall'utente non trasforma i test simulati in una conferma email reale.

## Ripresa 25 novembre — riallineamento e dettagli della festa
Riallineata la base con PR94 e6585e8 mantenendo 3daf382 come genitore e tutte
le sue correzioni a riepilogo/spese/cambio evento. Nessuna ricostruzione del prototipo.

Nuovo modulo italiano nel dashboard in Preview: scelta festeggiato/organizzatore,
nome di chi festeggia, luogo, indirizzo, orario, tema e note private; programma
con date/orari anche dopo mezzanotte; checklist preparativa relativa alla data;
invito in prima persona o per conto del festeggiato, senza note private.
Le altre lingue conservano il dashboard precedente: questa fase non certifica
la traduzione dei nuovi campi. Collegamenti fornitori/location/invitati conservati.

Persistenza separata solo per questi dettagli, senza copie di budget, spese o
ospiti. Tabella eighteenth_party_plans con SELECT autorizzata e RPC autenticata:
lock evento, controllo tipo e accesso autorevole, revisione ottimistica,
idempotenza dei retry, limiti del payload e controllo programma/scadenze.
Il conflitto conserva le modifiche; caricamento fallito non abilita scritture.
Modifiche aperte protette prima di lasciare i link del dashboard; le spese
non possono ricaricare il dashboard e perdere dettagli ancora da salvare.

Migrazione QA applicata: 20261125102641_eighteenth_party_plan_revision.
PASS SQL PostgreSQL locale: owner/read/RLS, altro attore, tipo errato,
retry, conflitto di revisione, data risposte e programma dopo mezzanotte.
PASS test SQL sul QA reale, tutte le fixture in rollback:
database/tests/eighteenth_party_plan.sql. Nessuna migrazione Production.
987 test in 148 suite PASS prima dell'ultima guardia UI; successivi 10 test
mirati in 3 suite PASS; TypeScript PASS, lint senza errori (un warning ref).
Isolamento delle suite standard PASS. Aggiunti tre progetti browser del
Diciottesimo (320/360/390) al workflow isolato, con prova dei dettagli persistiti.
La nuova esecuzione remota NON è ancora dichiarata PASS.

### Configurazione QA completata — 25 novembre
Superato il precedente blocco della chiave server: la chiave QA sensitive già
presente è stata resa predefinita solo per Preview, senza leggerne il valore,
modificarne il tipo o usare credenziali Production. Le variabili predefinite
Production/Development conservano valori e destinazioni necessarie; le nuove
Preview ereditano URL, anon, expected-ref e servizio del progetto QA
`tnopiqxlcuakkavpwbrq`. Il flag Diciottesimo è 1 solo sul branch PR95.

Redeploy QA sul commit 39c48d1: dpl_u7dSQdGANk64ZnRjABTyqPXTMy56 READY.
GET /api/budget-items?country=it restituisce 200 {items:[]}: il client server
ha superato il controllo di corrispondenza del progetto ed eseguito la query.
/api/health/latest restituisce invece 500 perché app_health_latest non esiste:
questa route diagnostica non è utilizzabile come evidenza di salute completa.

CI 45596601324 PASS. Preview integration 45596601327 PASS. Il collaudo isolato
Diciottesimo si è fermato al selettore organizzatore alle tre larghezze; nessun
PASS attribuito ai passaggi successivi. Corretto il nome accessibile esplicito
e il locator semantico. Nuova esecuzione sul commit ce5b3a7 in corso.

Restano: collaudo browser dei nuovi dettagli, traduzioni, integrazione della
checklist preparativa con timeline condivisa, acconti/pagamenti parziali,
prova completa fornitori/location/inviti/RSVP e cambio dei tre eventi sullo
stesso account. Le correzioni esistenti restano conservate; questo checkpoint
è un avanzamento e non una dichiarazione di completamento del Diciottesimo.

## Acconti e saldo — avanzamento QA
Migrazione QA 20261125104656_eighteenth_partial_payments applicata. RPC
autenticata sulla spesa canonica: lock evento/spesa, controllo attore e tipo,
importo positivo a due decimali, limite al saldo, data e nota limitate. UUID
del pagamento rende il retry idempotente; cambi di payload con lo stesso UUID
sono rifiutati. Nessuna copia del budget in metadati. Stato approved solo a saldo.
Test SQL PostgreSQL locale e sul QA PASS, fixture in rollback; UI mantiene
la bozza e l'identità del tentativo incerto. Pagato/saldo visibili per spesa,
preventivi aperti calcolati sulla parte ancora da pagare.
Nuovo collaudo browser include acconto 20 su preventivo 200 oltre a spesa 120,
rientro con pagato 140 e cambio fra tre eventi. Esito remoto ancora da verificare.
