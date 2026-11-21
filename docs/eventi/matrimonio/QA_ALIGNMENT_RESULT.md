# Esito riallineamento QA — 21 novembre 2026

Matrimonio ancora APERTO. Production non modificata. Battesimo: codice invariato su 0cdf1fb.

## Configurazione risolta
Chiave server del progetto QA recuperata dalla sessione Supabase autorizzata e salvata in Vercel come Secret, esclusivamente Preview / qa/matrimonio-chiusura. Nessun valore riportato in file o output. Verificato via metadati e UI.
Deployment dpl_Aknmde5ERkigG5Cn3GiXvAGfALFf READY sul codice 6d7ead0. Il percorso autenticato della nuova origine QA non è ancora verificato.

## Prova migrazioni e incidente
Il primo test di tre migration Branch52 con rollback è riuscito.
Nel successivo replay completo un errore di escaping nel confezionamento SQL ha conservato due COMMIT interni. Parte del riallineamento fino al Branch52 è quindi rimasta applicata a QA. Non è corretto descrivere quel replay come interamente annullato. Non è stata aggiornata la migration history: va riconciliata con gli oggetti effettivi prima di applicazioni successive.
Nessun tentativo di rollback distruttivo del database condiviso.

Controlli prima/dopo: identici conteggi e impronte per events (1), guests (3), expenses (3), baptism_family_plans (1). Dati Battesimo invariati.
Audit mirato: da12 a4 prerequisiti mancanti. Restano event_documents, gift_list_items, save_event_table_plan, delete_event_table.

Il confezionamento corretto verifica prima dell'esecuzione: un BEGIN esterno, zero COMMIT, un ROLLBACK finale. Il nuovo replay si arresta correttamente sul guard:
BRANCH48_PARTNER_DIVERGENT_FUNCTION: accept_event_invitation(p_token text, p_user_id uuid).
Il replay completo dei vecchi file non è dunque idempotente sullo stato QA parzialmente allineato. Non forzare o rimuovere il guard: confrontare definizioni attuali e dipendenze, poi riprendere dalle migration ancora necessarie.

## Prossimi passi obbligatori
- Inventario oggetti e definizioni effettive e riconciliazione della history QA.
- Validazione separata delle migration residue Branch53, conservando estensioni Battesimo/18 anni e autorizzazioni.
- Prove di login, due Matrimoni con scelta esplicita, salvataggi/riapertura, ripetizioni, isolamento e mobile360/390.
- Riepilogo di chiusura Matrimonio prima di proseguire al Battesimo. Nessun merge/rilascio Production autorizzato da questo documento.
