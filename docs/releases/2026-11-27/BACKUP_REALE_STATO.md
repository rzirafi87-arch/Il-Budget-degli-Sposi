# Backup reale Production — stato corrente

## Aggiornamento verificato — 28 novembre 2026

**STOP: il blocco backup PR96 resta aperto.** Questo aggiornamento prevale sulle indicazioni storiche riportate sotto.

- Accesso PostgreSQL Production: PASS read-only nel run 46027023302. La credenziale DB è stata configurata; non va richiesta di nuovo.
- Backup reale: dump acquisiti da snapshot read-only, ruoli senza password amministrative, inventario Storage e configurazioni recuperabili cifrati. Una copia cifrata è già conservata privatamente in modo persistente; non contiene il solo database sintetico.
- Storage: inventario acquisito di 1 bucket e 0 oggetti. Non sono dichiarati collaudati file inesistenti.
- Ultimo worker: commit 833cb4ae0268792cd022d17060147a0298ead8bf, run 46038079998, job 140638505778. Il log riporta DATABASE=PASS; RESTORE=STOP; STORAGE=PASS_ACQUIRED; CONFIG=PARTIAL; FINAL=STOP. Il risultato SUCCESS del workflow attesta l'esecuzione e il cleanup, non il superamento del gate.
- Blocco tecnico: la verifica conclusiva del ripristino reale si arresta in RESTORE_VERIFY. Il dettaglio è conservato esclusivamente nel pacchetto cifrato; la causa residua dell'ultimo arresto non è ancora stata classificata. Non dichiarare il ripristino PASS sulla base dei confronti parziali precedenti.
- Blocco configurazioni: valori originali Vercel sensitive non esportabili con gli accessi disponibili ed export completo Supabase Auth non acquisito. Le impostazioni Auth visibili sono state raccolte parzialmente; manca un token personale Supabase per l'export programmatico completo, oppure un export originale equivalente. I valori originali mancanti devono transitare esclusivamente tramite campo protetto, mai in chat o nel repository.
- I PASS applicativi PR94/PR95 e i 7 workflow del checkpoint PR96 restano conservati; non sono stati ripetuti i test funzionali né la registrazione email.
- Nessun merge, DDL/DML, configurazione, sospensione o deploy Production eseguito. Nessun nuovo evento o servizio a pagamento attivato.
- Rapporti e checklist nel repository aggiornati; pannello Sites live non ripubblicato.

Evidenza: https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/46038079998

## Storico precedente

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
