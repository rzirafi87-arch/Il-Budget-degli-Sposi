# Revisione PR94 — e6585e8 — 25 novembre 2026

Base main: cd6b406ac2db510a1a5a06ea398a73c02d97bf7b.
Codice verificato: e6585e836fbd4bc3b3a52deaefadf5da948d9f19.
PR aperta/draft; nessun merge o rilascio Production autorizzato in questa fase.

## Revisione residua conclusa
Inventario completo: 167 file rispetto a main. Esaminate le modifiche runtime
(API, moduli condivisi, selettori evento, auth, dashboard, budget, invitati,
timeline, impostazioni, percorsi pubblici e proxy), migrazioni e privilegi,
workflow e script di rebuild/concorrenza. Controllati contratti dei test,
coerenza delle cinque traduzioni, contenuti/asset Battesimo e checkpoint.
Non sono state introdotte dipendenze o attivate funzioni a pagamento.
Il prototipo Diciottesimo incluso nella base resta protetto dal flag Preview;
la prosecuzione avviene separatamente nella PR95.

Finding corretti nella ripresa:
- Replay del rimedio storico autorizzativo: wrapper ricondotto all'identità
  autorevole auth.users/Branch53, senza riscrivere migrazioni storiche.
- Cancellazione evento Battesimo con spese: trigger revisione corretto per
  non aggiornare il piano dopo la rimozione del padre durante la cascata.
- Anchor interna, raccolta accidentale Diciottesimo nei test standard e
  selettori/testi obsoleti dei test, senza abbassare le asserzioni richieste.
- Test mobile: corretta attesa del titolo completo e preservazione di
  entrambi gli errori se percorso e cleanup falliscono insieme.
Nessun nuovo finding bloccante emerso nella revisione residua del pacchetto.
Questo giudizio è limitato al diff e alle prove indicate, non certifica
indefinitamente il repository o un futuro deployment Production.

## Evidenze
- Conferma email reale già PASS: nuova registrazione 09:08:54 UTC,
  conferma 09:09:11 UTC e login successivo nel planner. Conservata;
  nessuna nuova registrazione reale eseguita nella ripresa.
- CI 45593221149 PASS: lint, tipi, build e test applicativi.
- Database Rebuild 45593221426 PASS dopo retry del solo job di startup:
  il primo tentativo si fermava per porta Docker 54324 già occupata.
- Compatibilità vecchia app/nuovo schema Branch53 45593220982 PASS.
- Compatibilità main corrente/nuovo schema Branch54 45593221287 PASS.
- Validazione statica smoke 45593221074 PASS; i job Production non sono eseguiti.
- Playwright 45593220837: prima esecuzione completa PASS, compresi due
  collaudi Battesimo 360/390, percorsi Matrimonio, cleanup fixture e distruzione stack.
- Seconda esecuzione integrale richiesta: stesso workflow, attempt 2,
  job lifecycle 139138093061. Esito finale registrato nel checkpoint principale.
- Screenshot/report Battesimo attempt 2:
  https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/45593220837/artifacts/15012622529
- Anteprima e6585e8 READY:
  https://il-budget-degli-sposi-lvjzlwije-rzirafi87-archs-projects.vercel.app

I test Battesimo coprono schede, focus errori, invito senza note private,
pagamento aperto protetto, salvataggio di un pagamento, recupero dopo reload,
invitati, moduli condivisi, logout/login e assenza di overflow a 360/390.
Le fixture vengono eliminate tramite verifiche di proprietà; lo stack
temporaneo viene distrutto sempre al termine del workflow.

## Limite di rilascio
PASS dei gate tecnici non esegue un rilascio pubblico. Prima del rollout
serve il checkpoint richiesto dall'utente, con preflight del database reale
ed eventuale riconciliazione della nuova migrazione di cascata (oggi solo QA).
Non applicare automaticamente il rimedio storico che sostituisce il wrapper.
Non attivare il Diciottesimo in Production come effetto collaterale della PR94.
