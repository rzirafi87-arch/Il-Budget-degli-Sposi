# Sequenza vincolata per un rilascio successivamente autorizzato

Nessuna operazione di questa sequenza è stata eseguita su Production.

1. Backup manuale Production PostgreSQL17 con dump completo, ruoli/ACL,
   archivio Storage e configurazioni, conservato cifrato e verificato con restore
   isolato. Il piano Free non offre backup gestiti: non approvare upgrade.
   Se backup o restore non riescono: STOP, prima di ogni merge/DDL.
2. Bloccare il deploy automatico Production e gli altri hook del repository;
   mantenere lo SHA cd6b406a e il deployment dpl_54kfaRR3cR9Buvzfp77D82w7Ves7
   come ritorno. Questa modifica di configurazione richiede autorizzazione.
3. Congelare le scritture nella finestra concordata; acquisire il backup finale
   e i contatori di controllo. Confermare che HEAD PR94/PR95 non sono cambiati.
4. Integrare PR94, poi retarget e integrare PR95. Non integrare la PR96 come
   sostituto delle due PR: contiene la preparazione e le prove di rilascio.
   Portare anche la correzione di sola raccolta test playwright.config.ts dal
   checkpoint, senza cambiare codice prodotto. Registrare SHA/tree finali.
5. Migrazioni Production con checksum congelato, nell'ordine:
   20261125100634_baptism_revision_parent_cascade_guard.sql;
   20261125102641_eighteenth_party_plan_revision.sql;
   20261125104656_eighteenth_partial_payments.sql.
   Confermare prima che can_access_event usi già il resolver autorevole:
   il wrapper 20261125093000 è una riconciliazione condizionata, non un quarto
   passo obbligatorio. NON applicare event_access_nonempty_email.
6. Eseguire VERIFY_AFTER_MIGRATIONS.sql: tutti i booleani TRUE, RLS attiva,
   EXECUTE assente per anon/public e consentita solo ai ruoli previsti.
   Fermarsi al primo errore. Non proseguire alla cieca su DDL parziale.
7. Build finale con riferimenti Production corretti, senza ereditare i valori
   QA Preview. NEXT_PUBLIC_EIGHTEENTH_PREVIEW=1 nella sola build autorizzata.
   Verificare SHA, variabili per target e nessuna chiave server nel bundle.
8. Deploy/promozione Production solo con autorizzazione specifica; smoke
   autenticato dei tre eventi e controlli +0/+15/+60 minuti indicati nel checkpoint.
   Nessun health/latest come prova. Fixture dedicate e cleanup residue=0.
9. Riabilitare traffico/scritture solo dopo PASS. In caso di regressione,
   ripromuovere il vecchio deployment soltanto se il gate old-app/new-schema
   resta valido per il manifest realmente applicato; conservare dati/schema
   additivo. Un restore Production è un'operazione separata da autorizzare,
   con valutazione della perdita delle scritture successive al backup.
