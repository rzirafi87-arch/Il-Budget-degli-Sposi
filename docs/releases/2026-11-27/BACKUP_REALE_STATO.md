# Backup reale Production — 27 novembre 2026

## Esito: STOP
Nessuna ripetizione dei test funzionali/compatibilità già PASS. Nessun merge,
DDL/DML, modifica configurazione, sospensione o deploy Production eseguito.

## Attività indipendenti concluse
- PR96 ancora aperta sul checkpoint tecnico 9d33ce94.
- Rilevati gli accessi e le variabili disponibili senza stampare valori.
- Recuperata la chiave di backup già autorizzata tramite canale privato,
  senza inserirne il contenuto in repository, report o messaggi.
- Esportate le configurazioni Vercel leggibili del progetto e metadati delle
  variabili Production. Cifratura ibrida RSA-OAEP SHA256 + AES-256-GCM;
  decifratura di controllo e confronto esatto dei byte PASS.
- Archivio CONFIG_PARZIALE del 27/11 conservato nello spazio privato persistente,
  senza condivisioni create. Nessun contenuto del backup nel repository.
- Verifica SQL read-only dell'inventario Auth/Storage completata; nessun dato
  applicativo o nome di file riportato qui. Non equivale a esportazione.

## Copertura effettiva e limiti
Configurazioni Vercel esportabili: acquisite e cifrate. Le variabili marcate
sensitive non sono esportabili in lettura; l'archivio le registra come mancanti,
non come valori ripristinabili. Nessun dump database, byte Storage o export
completo Auth è stato acquisito. Nessuna data di backup coerente DB+Storage
può essere attestata: esiste solo la data del pacchetto CONFIG_PARZIALE.
Il controllo di decifratura verifica quel pacchetto, NON un restore Production.
Il ripristino dei dati reali, i relativi conteggi, i file e i permessi non sono
stati verificati e restano STOP. Il precedente drill sintetico resta separato.

## Accessi mancanti, precisi
1. Connessione PostgreSQL Production utilizzabile da pg_dump PostgreSQL17:
   URL libpq completo del progetto vsguhivizuneylqhygfk, utente con lettura
   completa dei dati/schemi Auth/Storage e privilegi per il dump necessario,
   password e TLS. Preferire l'URL diretto o pooler in session mode; non il
   pooler transaction mode. NON è la anon key né la service_role API key.
   DATABASE_URL/POSTGRES_PASSWORD in Vercel sono sensitive e non restituiti:
   non cambiarne tipo, target o protezioni per esportarli.
2. Egress del worker isolato verso PostgreSQL e
   https://vsguhivizuneylqhygfk.supabase.co/storage/v1/ : due tentativi HTTPS
   innocui senza credenziali sono terminati in timeout nel runtime corrente.
   La chiave server API autorizzata è già disponibile privatamente; non serve
   reinviarla. Non sono stati copiati file in base a un semplice inventario SQL.
3. Pacchetto di configurazioni originali non esportabili, da password manager
   o canale protetto: valori Vercel sensitive e configurazione Supabase Auth,
   redirect, provider/SMTP e materiale necessario ai token/chiavi. Nel progetto
   risultano mancanti i valori sensitive EMAIL_PROVIDER, EMAIL_FROM,
   EMAIL_FROM_NAME, BREVO_API_KEY, RESEND_API_KEY, SUPABASE_SECRET_KEY,
   POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING,
   POSTGRES_PASSWORD, SUPABASE_JWT_SECRET, DATABASE_URL.
   Un valore facoltativo assente va attestato come tale, non inventato.

## Modalità protetta per la credenziale DB
Campo GitHub Actions repository secret: PRODUCTION_BACKUP_DATABASE_URL.
Valore: URL PostgreSQL completo già autorizzato, inserito soltanto nel campo
Secret mascherato di GitHub, mai in chat. L'inserimento non avvia il backup,
non cambia Production e non autorizza un rilascio. Prima dell'uso il workflow
va vincolato a sola lettura Production, worker temporaneo e uscita cifrata;
nessun dump plaintext o secret come artifact GitHub. L'archivio persistente
resta privato e cifrato separatamente dalla chiave.

## Coerenza richiesta dopo sblocco
Snapshot DB consistente; inventario Storage dalla stessa finestra; scaricamento
oggetti con verifiche di versione/digest pre/post, rilevamento modifiche concorrenti
senza fermare Production. Se non si ottiene un insieme coerente, STOP anziché
certificare un point-in-time inesistente. Ripristino in stack isolato gratuito,
con messaggistica/provider esterni disattivati solo nel clone, confronto conteggi,
vincoli, byte/digest, metadati, ownership/RLS/ACL e accessi autorizzati/negati.

## Decisione finale
STOP backup reale; il solo archivio parziale non chiude il blocco PR96.
Tutti i PASS precedenti sono conservati. Nessun servizio a pagamento attivato.
