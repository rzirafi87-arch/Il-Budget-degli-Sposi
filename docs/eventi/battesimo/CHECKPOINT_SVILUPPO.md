# Battesimo — checkpoint di sviluppo, 19 novembre 2026

Stato: sviluppo recuperato; NON pronto al rilascio.

Base: feature/battesimo-famiglia@1f78d86bc0f44143986c44edb690008e238aecd0.
La base include lavoro precedente sull'evento Diciottesimo: il diff verso main
richiede separazione e revisione prima di qualsiasi merge.

Specifiche lette: DOCX e XLSX del branch docs/battesimo-pacchetto-approvato.

Implementazione: tre passaggi, bozza, programma, invitati individuali con gruppo,
accompagnatori, conferme distinte, menù, note private, spese con quantità e
pagamenti, disattivazione ritrovo senza perdita acconti, checklist relativa,
inviti e promemoria localizzati, ringraziamenti. Immagini fotografiche generate
con avorio e azzurro polvere, formati 1600x900 e 900x1125 WebP.

Verifiche: typecheck PASS; 15 test dominio PASS. Budget: 393/1354/3980 EUR.
Controllo PostgreSQL isolato PASS: sintassi, rollback input incompleti, ledger condivisi, replay, revisioni e controllo proprietario.
Browser autenticato, nuovo accesso, concorrenza reale, RLS e migrazione QA: PENDING.

La migrazione proposta sposta ospiti e costi nelle tabelle condivise guests ed
expenses, lasciando nel JSON i dettagli specifici e le scadenze relative.
NON applicata in QA alla verifica del recupero. Richiede test SQL prima
 dell'utilizzo. La UI nuova richiede read_family_baptism e non va proposta come
anteprima funzionale finché la migrazione non è validata.

Problemi ancora da risolvere:
- credenziale server QA non dedicata nell'inventario precedente;
- registrazione normale ancora non allineata al Battesimo;
- ripristino automatico dell'ultimo evento e bozza da verificare;
- integrazione e cambio Matrimonio/Battesimo da implementare e provare;
- verificare protezione Vercel per l'accesso dei tester;
- verifiche mobile a 360 e 390 px e accessibilità;
- revisione SQL di autorizzazioni, replay, snapshot e aggiornamenti concorrenti.

Matrimonio: PR #92 separata; nessun merge o rilascio Production autorizzato.

## Verifica QA aggiornata
Migrazione baptism_shared_ledger_validation applicata in Preview QA.
PASS sul database reale: creazione, replay, riapertura, costo previsto,
disattivazione ritrovo, acconto conservato, revisione obsoleta e rifiuto RPC
per altro proprietario. Dati di prova annullati con rollback.

Il test RLS ha rilevato un bypass nella funzione condivisa can_access_event:
JWT senza email coincideva con email sposi vuote. Applicata in QA la migrazione
event_access_nonempty_email. Nuovo test come ruolo authenticated PASS:
proprietario autorizzato, altro utente senza email non vede piani, ospiti o spese.
Production NON aggiornata. La correzione condivisa va inclusa nel gate finale.
Browser e configurazione del deployment restano PENDING.

## Allineamento anteprima
Configurate in Vercel per il solo branch feature/battesimo-completo le variabili
NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY del QA e il riferimento
atteso SUPABASE_EXPECTED_PROJECT_REF=tnopiqxlcuakkavpwbrq.
Verificato che la chiave server ereditata appartiene invece al progetto
vsguhivizuneylqhygfk: serve una SUPABASE_SERVICE_ROLE_KEY specifica QA sul branch.
Aggiunto controllo server che rifiuta JWT anon, JWT non valido e progetto
incoerente prima di creare il client. Nessuna chiave inclusa nei messaggi.
22 test mirati PASS. Registrazione e percorso browser ancora NON verificati.

## Anteprima e prova browser — 19 novembre 2026
Chiave server QA configurata come Secret in Vercel, esclusivamente Preview /
feature/battesimo-completo. Credenziali non versionate. Le sessioni amministrative
aperte sono riutilizzabili nel browser; password e OTP non sono archiviati.

Deployment dpl_FG7PgCJdfUMzd2WEdWYHWLt9bdFZ READY su 9f9c7f5.
URL verificato: https://il-budget-degli-sposi-cvl027oov-rzirafi87-archs-projects.vercel.app/it/battesimo

Browser PASS: login con account QA tramite modulo protetto, creazione della bozza
Vittoria, salvataggio parziale del nome, modifica e salvataggio del programma,
cerimonia 18/04/2027 10:30 e ritrovo 13:00 in luoghi distinti, impostazione budget
1500 EUR e quantità 22 adulti / 5 bambini / 1 senza menù. Inserite tre voci di
prova (costi fissi aggregati): 22x38 + 5x18 + 428 = 1354 EUR. Due pagamenti
150+133=283, residuo1071, margine146. Reload della pagina, scelta dello stesso
Vittoria dalla lista e recupero del programma e di tutti e quattro i valori PASS.
I dati fittizi restano nell'account QA come esempio consultabile.

Questa prova NON equivale a logout/login: uscita e nuovo accesso restano da
eseguire, così come registrazione, prova browser invitati/inviti/checklist,
verifica dimensioni iPhone e cambio Matrimonio/Battesimo. Il sito pubblico
Production non è stato aggiornato.

## Seconda verifica browser — 19 novembre 2026
Sul deployment 9f9c7f5 verificati salvataggio e riapertura di due persone nello
stesso gruppo familiare, con accompagnatore e conferme distinte: cerimonia 2,
ritrovo 1. Copia dell'invito riuscita, con orari distinti e senza note private.
Prima attività completata, salvata e recuperata dopo reload e riapertura;
la prossima azione passa correttamente alla seconda attività.

Registrazione dedicata implementata: solo account, nessun Matrimonio creato,
rientro al Battesimo dopo conferma email e reinvio coerente. Campi conservati
in caso di errore. Registrazione reale con conferma email ancora da verificare
nel browser; 24 test mirati su registrazione, modello e ambiente PASS.
Restano aperti logout/login, dimensioni iPhone, cambio data nel browser,
concorrenza browser e integrazione cambio evento. Nessun aggiornamento Production.

## Registrazione pubblicata in anteprima QA
Commit funzionale 0541778e594381f56d6abb0c4cfb3f4c95872db7, deployment
dpl_obPyZosKcgLzn1uoAhLCWPTVfckw READY. Branch alias verificato nel browser:
https://il-budget-degli-sposi-git-featu-bd1aed-rzirafi87-archs-projects.vercel.app/it/battesimo
La registrazione da questo percorso mostra solo email e password, senza campi
Matrimonio. Typecheck e controllo SQL locale PASS. Nel database QA il trigger
nuovo utente crea solo il profilo, senza evento automatico.

Configurazione Auth QA: Site URL passato da localhost all'alias del branch;
aggiunti ritorni consentiti solo per alias del branch e hostname del deployment
0541778. Registrazione con password nuova e conferma email richiede intervento
manuale dell'utente; non ancora verificata end-to-end.

Ulteriore prova browser sul deployment 9f9c7f5: bambino con menù bambino e
risposte in attesa salvato; promemoria corretto generato.

## Riapertura, errori e concorrenza client
Implementati: preferenza dell'ultimo Battesimo per account (solo identificatore,
sempre riverificato dal database); ripresa bozze nella configurazione; protezione
da risposte tardive dopo uscita/cambio account; blocco del doppio salvataggio;
ricaricamento attraverso lo stesso percorso autorizzato; logout condiviso con
segnalazione degli errori. Gli errori di invitati, spese e invito riportano al
modulo pertinente e conservano gli inserimenti. Checklist ordinata per prossima
scadenza effettiva, con data di completamento visibile. Controlli sulle date
calendariali e testi di uscita/condivisione nelle cinque lingue.
32 test mirati PASS, inclusi 6 test interattivi del planner; typecheck PASS.
Queste nuove funzioni richiedono ancora verifica browser sull'anteprima aggiornata.

## Aggiornamento 20 novembre 2026
Checklist: il controllo delle risposte usa la scadenza dell'invito, conservando
una scadenza personalizzata o quella dell'attività già completata.
34 test mirati e typecheck PASS. Test interattivo aggiunto per conflitto di
revisione: inserimenti locali conservati e annullamento della ricarica rispettato.

Prova browser precedente su 2b5bdbc: apertura di Vittoria e reload con ripresa
automatica PASS; date di cerimonia e ritrovo spostate al 18/05/2027, checklist
ricalcolata al 23/03 per la stima, attività completata conservata al 21/02.
L'esempio QA resta alla data di maggio dopo questa prova.
La sessione browser autenticata non è disponibile al recupero del 20 novembre.
Restano da provare due schede concorrenti nel browser, logout/login, registrazione
con conferma email, dimensioni iPhone e integrazione del cambio evento.
Production non modificata.

## Verifica browser autenticata — 20 novembre 2026
Accesso completato manualmente dall'utente dopo credenziali rifiutate.
PASS: Vittoria riaperta automaticamente con programma, 2 conferme cerimonia,
1 conferma ritrovo, 1 risposta in attesa e importi 1354/283/1071/146 EUR.
PASS concorrenza reale tra due schede sulla stessa revisione: seconda scheda
salva budget1501; prima scheda tenta1502 e riceve conflitto, conservando1502
nel campo senza sovrascrivere il server. Seconda scheda ripristina1500; prima
scheda ricarica esplicitamente e recupera margine146. Nessuna spesa/pagamento
modificato nella prova.
PASS: checklist Verifica le risposte usa08/04/2027 dell'invito invece di08/05
relativo alla cerimonia di maggio. SHA funzionale verificato5e8ff06.
Rientro verificato dopo login manuale; NON ancora un ciclo automatizzato completo
di logout/login. Ancora aperti registrazione con conferma email, mobile390/360,
integrazione cambio evento e gate finale. Nessuna modifica Production.

## Quantità del preventivo dalle conferme
Aggiunte alle spese del ritrovo azioni esplicite per utilizzare i conteggi dei
menù adulto, bambino e nessun menù dei soli presenti confermati al ritrovo.
Conferma obbligatoria con vecchia quantità, nuova quantità e totale previsto.
Prezzo unitario e pagamenti conservati; nessuna modifica automatica ai costi
quando cambia una risposta. Menù da definire indicati separatamente.
36 test mirati e typecheck PASS. Nuova funzione non ancora verificata nel browser.
Nessuna modifica database o Production.

### Prova browser quantità su 449e24d
Deployment dpl_C9NwbyYwEHCzViGPorZABdrSin8X READY. La sessione QA è risultata
riutilizzabile aprendo una nuova scheda sull'alias del branch.
PASS: Pranzo adulti aggiornato da22 a1 usando il menù adulto confermato;
previsto556, pagato283, residuo385 (saldo calcolato per singola spesa),
segnalazione acconto150 maggiore della nuova stima38. Salvataggio e reload
recuperano quantità1. Ripristinata quantità22 e salvata: riepilogo torna
a1354/283/1071/146. Nessuna perdita di acconti.
