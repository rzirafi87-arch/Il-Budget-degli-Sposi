# Matrimonio — verifica di chiusura, 21 novembre 2026

Stato: APERTO. Nessuna chiusura o pubblicazione Production dichiarata.

Repository rzirafi87-arch/Il-Budget-degli-Sposi, PR92 draft verso
preview/matrimonio-tester. Anteprima tester ancora45c9c60; correzione resolver
8e3c9c2 su fix/matrimonio-tester-access, non mergiata.

Deployment correttivo verificato READY: dpl_AHvyjvy6B127rBParyHpd675QkoL.
Browser: /it/dashboard rimanda al login senza sessione. Percorso autenticato
non verificato in questa sessione.

Correzioni aggiunte: recupero errori di sessione nella scelta iniziale evento;
pulsanti semantici accessibili dentro lista; messaggio di errore e Riprova.
Il selettore nelle impostazioni resta nascosto. Nessuna creazione automatica
di eventi per account con più eventi.

Verifica locale: 7 suite,59 test PASS: resolver, onboarding, scelta esplicita
fra due Matrimoni, retry dopo errore sessione, scelta fallita senza redirect,
autorizzazioni pianificazione/finanze e logout. TypeScript PASS.

Da completare prima della chiusura:
- login tester e recupero evento e dati;
- apertura dashboard, spese/budget, invitati, fornitori, location e checklist;
- salvataggi e riapertura in ambiente QA, ciclo logout/login;
- account con più eventi e selezione esplicita;
- verifica mobile360/390 e leggibilità;
- corrispondenza del link consegnato con il commit approvato;
- checkpoint per autorizzare separatamente merge, migrazioni e Production.

Nessuna migrazione, merge o modifica Production eseguiti.

## Verifica autenticata del 21 novembre

Anteprima fix/matrimonio-tester-access su e95fa40: READY, deployment
 dpl_pLi8HCMFDp2H7zQ92ayTNcftrDLf. Accesso tramite modulo protetto riuscito;
evento e voci salvate recuperati. Budget, Contabilità, Invitati, Fornitori,
Location, Preferiti e Timeline aperti nel browser, in sola lettura.

Problemi riprodotti e corretti nel nuovo codice:
- selettore evento residuo nel DynamicHeader/LocaleSwitcher, che alterava solo
  la preferenza locale senza selezionare un evento reale: rimosso;
- collegamento Timeline assente dal menu: aggiunto nel desktop e menu mobile;
- Budget includeva pending come approvato (1670 contro 0 di Contabilità): ora
  include solo approved; preventivi conservati in Contabilità;
- checklist senza template quando il catalogo non ne restituisce: otto attività
  iniziali tradotte nelle cinque lingue, conservando quelle personali esistenti;
- etichette mancanti countdown, entrate, dettagli location: completate.

Test aggiunti: spese approved/pending/rejected/senza stato; preferenze header
senza cambio evento; template checklist senza scritture automatiche e rispetto
attività personali. 6 suite/15 test PASS, oltre ai 59 test del checkpoint precedente.
Il nuovo codice richiede ancora deploy e verifica browser prima di dichiararlo
verificato. Restano aperti salvataggi QA, mobile reale, account multipli nel browser,
logout/login e riconciliazione delle righe del confronto pianificato/effettivo
(etichette storiche diverse tra budget e spese). Nessuna modifica dati o Production.
