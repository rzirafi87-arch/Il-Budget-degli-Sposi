# Matrimonio — checkpoint QA, 21 novembre 2026

## Stato

Matrimonio NON ancora chiuso. Nessun merge, migration o rilascio Production.
Battesimo mantenuto sul commit remoto 0cdf1fb5f43f83fd9aeddef05a7b66cf1e73f5ab:
protezioni pagamenti e prove QA già documentate, non reimplementate.
Main remoto ricontrollato: cd6b406ac2db510a1a5a06ea398a73c02d97bf7b.

## Risultati confermati

- Anteprima Matrimonio 5b2eb56 READY e percorso autenticato già verificato.
- Nuova correzione del confronto: una voce storica senza categoria viene
  collegata alla sottocategoria della spesa soltanto se la corrispondenza è unica.
  Nomi ambigui restano distinti; nessun aggiornamento dei dati storici.
- Errori HTTP del budget mostrano errore e Riprova, senza simulare un budget
  vuoto o cancellare i valori già caricati.
- 17 suite/104 test PASS; TypeScript PASS. Nuove correzioni da verificare nel
  browser dopo il deployment.

## Blocco reale dell’ambiente QA

Eseguito scripts/audit-wedding-qa-readiness.sql, sola lettura, sui due progetti.
La verifica principale restituisce zero prerequisiti mancanti. QA restituisce 12:

| Tipo | Oggetto mancante in QA |
| --- | --- |
| Colonna | appointments.client_key |
| Colonna | appointments.private_supplier_id |
| Colonna | saved_suppliers.catalog_snapshot |
| Colonna | saved_suppliers.private_overrides |
| Colonna | timeline_items.client_key |
| Colonna | timeline_items.private_supplier_id |
| Funzione | delete_event_table |
| Funzione | save_event_table_plan |
| Tabella | event_documents |
| Tabella | event_location_supplier_links |
| Tabella | event_private_catalog_records |
| Tabella | gift_list_items |

Questo è un controllo mirato dei prerequisiti, non un confronto completo degli
schemi. Le migration QA arrivano al Branch47 e aggiungono Battesimo/18 anni;
mancano parti del modello canonico dei Branch48–53 già presenti nel principale.
Non basta aggiungere due colonne alla Timeline: occorre verificare dipendenze,
autorizzazioni e funzioni condivise. Conservare le estensioni Battesimo e18anni,
il controllo email non vuota di can_access_event e i relativi dati QA.

## Passi per chiudere

1. Configurare anteprima dedicata qa/matrimonio-chiusura sul progetto QA
   tnopiqxlcuakkavpwbrq, evitando modifiche al link dei tester e al Battesimo.
2. Riutilizzare URL e chiave pubblica QA. La chiave server esistente in Vercel
   è sensitive e non viene restituita dall’API: va configurata anche per il
   nuovo branch tramite la schermata protetta di Vercel, senza inviarla in chat.
3. Preparare e validare il riallineamento delle migration canoniche necessarie,
   con snapshot/controlli prima-dopo dei dati Battesimo e nessun reset del QA.
4. Verificare in QA due Matrimoni dello stesso account, selezione esplicita,
   creazione/modifica/riapertura di spese, invitati, attività, salvataggi ripetuti,
   isolamento, ciclo logout/login e controlli360/390px.
5. Riepilogo Matrimonio con esiti reali, poi conferma dell’utente prima di
   proseguire con il Battesimo. Rilascio Production separato.

Nessuna credenziale o token viene salvato in questo documento.
