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
