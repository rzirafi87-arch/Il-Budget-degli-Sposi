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
