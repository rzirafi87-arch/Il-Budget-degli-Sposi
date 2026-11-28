# Copertura configurazioni — 28 novembre 2026

## Acquisito e cifrato
- Connessione PostgreSQL Production funzionante e chiave API server usata per la lettura Storage.
- Configurazione del progetto Vercel e inventario di 22 variabili Production; valori di 10 variabili leggibili, JSON validato prima della cifratura.
- Chiavi email presenti nei secret QA del repository: copie recuperate come candidati, non attestate come valori originali delle variabili Vercel Production.
- Impostazioni Auth osservate il27/11: sito e8 redirect, email abilitata e conferma richiesta, provider esterni disabilitati, SMTP personalizzato disabilitato, opzioni email/OTP visibili. Questo inventario UI è parziale.

## Ricostruibile, non equivalente a copia del valore originale
POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, POSTGRES_PASSWORD e DATABASE_URL possono essere ricostruiti dalla connessione protetta già acquisita, adattando endpoint e modalità pooler. Non richiedere nuovamente la password DB. Le password dei ruoli amministrativi del cluster sono escluse da pg_dumpall: il target deve avere credenziali nuove; i record Auth degli utenti sono inclusi nel dump.

## Mancante o non attestato
- Valori originali Vercel sensitive EMAIL_PROVIDER, EMAIL_FROM, EMAIL_FROM_NAME, BREVO_API_KEY, RESEND_API_KEY, SUPABASE_SECRET_KEY, SUPABASE_JWT_SECRET. Un valore realmente non configurato deve essere attestato come tale, non sostituito con un placeholder.
- Export completo delle configurazioni Supabase Auth: template, sessioni, rate limit, MFA/hooks e materiale/piano di recupero delle chiavi di firma. Le sole impostazioni pubbliche o gli utenti nel database non sostituiscono tale export.
- Applicazione e collaudo dell'intera configurazione dei servizi nel target: non certificati.

## Canale protetto
https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/settings/secrets/actions/new

- BACKUP_SUPABASE_ACCESS_TOKEN: token personale Supabase con accesso al progetto Production, per esportare la configurazione Auth con sole richieste di lettura; in alternativa fornire un export JSON Auth equivalente nel pacchetto protetto. Il token non è la password PostgreSQL.
- PRODUCTION_RECOVERY_CONFIG_BUNDLE: JSON con oggetti vercel_production e supabase_auth_export, più attestazioni esplicite dei valori facoltativi non configurati. Inserire esclusivamente gli originali recuperati dal gestore credenziali o dalla configurazione sorgente. Nessun valore in chat, PR o repository. Non cambiare le protezioni Vercel o ruotare credenziali Production per esportarle.

La prevista sostituzione delle variabili al lancio può essere trattata in un successivo piano di recupero con nuove credenziali; non dimostra che l'export originale sia completo.

Il precedente export config del27/11 conteneva JSON troncato. Non usarlo per il ripristino: il nuovo export del28/11 viene validato integralmente prima della cifratura.
