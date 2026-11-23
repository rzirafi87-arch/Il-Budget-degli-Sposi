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
