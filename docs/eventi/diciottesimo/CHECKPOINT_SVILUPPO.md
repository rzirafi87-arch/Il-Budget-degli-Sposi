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

### STOP anteprima Diciottesimo con scritture
URL/anon/expected-ref QA configurati per il branch PR95. Manca ancora
SUPABASE_SERVICE_ROLE_KEY QA dedicata al branch. Il valore sensitive del
branch Battesimo non è leggibile tramite il connettore; non è stato spostato,
reso leggibile o sostituito con una chiave Production. NEXT_PUBLIC_EIGHTEENTH_PREVIEW=0
sul branch hosted; nessuna anteprima dichiarata utilizzabile prima del completamento.
Serve inserire la chiave del progetto tnopiqxlcuakkavpwbrq come sensitive,
solo Preview / feature/eighteenth-completion-20261123. Non inviarla in chat.

Restano: collaudo browser dei nuovi dettagli, traduzioni, integrazione della
checklist preparativa con timeline condivisa, acconti/pagamenti parziali,
prova completa fornitori/location/inviti/RSVP e cambio dei tre eventi sullo
stesso account. Le correzioni esistenti restano conservate; questo checkpoint
è un avanzamento e non una dichiarazione di completamento del Diciottesimo.
