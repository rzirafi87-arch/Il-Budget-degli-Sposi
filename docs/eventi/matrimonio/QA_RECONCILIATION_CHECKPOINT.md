# Checkpoint riconciliazione QA — 21 novembre 2026

## Completato e verificato
- Verificate le definizioni di18 funzioni, normalizzando gli spazi dei corpi PostgreSQL e confrontando gli hash con l'ultima definizione dei10 file canonici Branch48–52.
- Verificata tramite guard l'esistenza di tabelle, indici e trigger richiesti dai medesimi file.
- Applicata e riletta la sola attestazione qa_reconcile_verified_branch48_through_branch52, versione20261121204143. Registra lo stato già presente senza DML applicativo o riscrittura dello schema.
- Chiave server QA configurata come Secret sul solo branch qa/matrimonio-chiusura; build codice6d7ead0 READY (dpl_Aknmde5ERkigG5Cn3GiXvAGfALFf).
- Dati QA invariati: events1, guests3, expenses3, baptism_family_plans1. Le impronte coincidono con quelle prima dell'incidente.
- Codice Battesimo mantenuto su0cdf1fb; Production non modificata.

## Non completato
Le14 migration canoniche successive Branch53–57 sono state preparate con rimozione delle transazioni interne e guard finale, ma la richiesta ha perso il risultato quando il runtime è stato sostituito. Verifica remota successiva: nessuna voce qa_wedding_branch53_57_canonical_alignment nello storico e quattro prerequisiti ancora assenti:
event_documents, gift_list_items, save_event_table_plan, delete_event_table.
Non dichiarare tali migration applicate o validate dal solo invio della richiesta. Ricontrollare lo stato prima di ritentare.

L'ambiente di esecuzione e il browser sono divenuti indisponibili durante il lavoro. Le prove reali di accesso/rientro, salvataggi e riapertura, account multipli e360/390px sul nuovo QA restano aperte. I100/104 test e le verifiche browser dell'anteprima Matrimonio già documentate rimangono evidenze del precedente codice, non sostituiscono queste prove.

## Ripresa
1. Ricontrollare history QA e quattro prerequisiti; evitare replay del guard storico Branch48 sullo stato successivo.
2. Validare e applicare atomicamente soltanto le migration residue, tramite gestione migration, senza COMMIT interni e con verifica finale.
3. Ripetere hash dati Battesimo e controlli autorizzazioni, conservando estensioni Battesimo/18anni.
4. Completare il percorso Matrimonio completo in QA e verificare il commit del link consegnato.
5. Riepilogo conclusivo Matrimonio; attendere “vai avanti” prima del Battesimo.
Nessun rilascio Production senza checkpoint e autorizzazione.
