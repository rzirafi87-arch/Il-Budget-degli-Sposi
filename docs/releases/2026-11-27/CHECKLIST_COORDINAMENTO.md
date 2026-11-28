# Aggiornamento operativo — 28 novembre 2026

Questa sezione è corrente; le sezioni datate seguenti sono storico. Non estendere i PASS oltre SHA, ambiente e perimetro indicati. Nessuna operazione Production autorizzata.

| Evento | Area | Stato | Ambiente | Branch / PR / SHA | Evidenza e data | Limiti | Prossimo passo |
|---|---|---|---|---|---|---|---|
| Matrimonio/Battesimo | QA | Completato e verificato, PASS conservato | QA/Preview | PR94 a4bd47f, codice e6585e8 | HEAD remoto invariato 28/11; evidenze PR94 | Safari/iOS reale non certificato | Regressione solo per dipendenze modificate |
| Diciottesimo | QA, multi-evento | Completato e verificato, PASS conservato | QA/Preview | PR95 98a1aebe | HEAD invariato 28/11, 998 test/151 suite, run45637463755 | Chromium viewport; nessun nuovo collaudo mobile reale | Verificare cambi nuovi senza rifare intera suite |
| Tutti | Backup DB/Storage | Completato e verificato nel perimetro | Restore isolato | PR97 e29e4c9 | Run46135929450: 108 tabelle, conteggi/contenuti/RLS/ACL PASS; Storage1 bucket/0 oggetti; log letto28/11 | Persistenza/decifratura attestata dal rapporto568c700, non rieseguita qui | Conservare evidenze; configurazioni separate |
| Tutti | Configurazioni recupero | Bloccato | Production lettura / target isolato | PR97 e29e4c9 | CONFIG PARTIAL; FINAL STOP. CONFIG_COVERAGE.md 28/11 | Export Auth completo e sette valori Vercel non attestati; password DB già acquisita | Collector cifrato separato, validazione e recupero Auth isolato |
| Tutti | Continuità | Completato e verificato | Repository | integration/project-completion-20261128 / 831dc462 | Piano persistente docs/PROJECT_OPERATING_PLAN.md | Capacità residue non esposte: nessuna percentuale inventata | Salvare prima di fasi impegnative e dopo risultati significativi |
| Tutti | Scelta nazione | Completato e verificato nel perimetro | Locale/Preview | PR98 9db9122 / dpl_2NxUdT6Gj2FvMptoaQcN9k5kdRP3 | Test mirati e browser remoto ricerca/nessun risultato/selezione conservata PASS | Desktop, nessuna certificazione mobile reale | Regressione soltanto se modificata |
| Battesimo/Comunione/Cresima/Laurea | Contenuti | In corso | Branch isolato | docs/* recuperati nel nuovo branch | Word/Excel esistenti recuperati senza modificare il contenuto | Recupero non equivale ad approvazione attivazione o QA | Inventario e integrazione dei contenuti approvati |
| Compleanno/50 | Contenuti e sviluppo | Da verificare | Branch isolato | birthday / fifty, capability COMING_SOON | Materiali recuperabili, nessun flag attivato | API legacy da riconciliare con contesto autorevole | Recuperare materiali e sostituire flussi legacy prima dell’attivazione |
| Tutti | Migrazioni/rollback | Completato il piano; da autorizzare | Production invariata | Rapporto568c700, PR96 9d33ce9 | Tre migrazioni manifest; ledger riletto28/11: presenti QA e assenti Production; old-app/new-schema PASS run45993656604 | Non applicate le tre migrazioni, nessun merge/deploy | Checkpoint finale dopo chiusura configurazioni |
| Tutti | Rilascio | Bloccato | Production | main cd6b406a | Nessun rilascio eseguito | Backup config incompleto e autorizzazione assente | Presentare candidato completo revisionabile |
| Tutti | Coordinamento | Completato e verificato | Sito esistente | versione5 sorgente393db5fc | Pubblicazione e browser banner28/11 PASS; 13 test/TypeScript/build PASS | Non certifica il funzionamento dell’app | Aggiornare dopo prossimi risultati |

---

# Esito backup — 28 novembre 2026

**STOP complessivo: ripristino database e inventario Storage PASS; copertura configurazioni incompleta.**
Questo esito sostituisce gli arresti RESTORE_VERIFY precedenti. Nessun PASS dedotto dal solo SUCCESS del workflow.

## Evidenza conclusiva sui dati reali
- PR97 HEAD e29e4c9b62eb125e6a3bb95ac32c33a40aef7d7c.
- Run https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/46135929450 ; job140951101133.
- Rapporto cifrato: PASS_DATABASE_COUNTS_CONTENT_RLS_ACL; PASS_EXISTING_OWNER_AUTHORIZED; PASS_ANON_AND_AUTHENTICATED_WITHOUT_CLAIMS.
- Snapshot del28/11/2026 alle11:38:51 CET (10:38:51 UTC), acquisito in sola lettura.
- 108 tabelle: conteggi e impronte dei contenuti uguali alla fonte. 115 policy RLS,123 relazioni/proprietà/ACL,14 ruoli,19 appartenenze,11 schemi,191 funzioni,24 configurazioni di privilegi predefiniti, proprietà/database grants/impostazioni confrontati.
- Differenze risolte: wrapper GraphQL gestito da Supabase incluso come supplemento al dump; proprietà/ACL degli oggetti di estensione ricostruite dal manifest; ruolo e appartenenze aggiunti dal solo template locale rimossi dal clone. Impostazioni dei ruoli confrontate integralmente, normalizzando i timeout equivalenti (60000ms=1min), senza ignorare chiavi o flag.
- Restore su build PostgreSQL17.6.1.021 con estensioni della fonte; rete Docker interna, connessioni al clone su socket locale. Cleanup container/volumi/rete e file temporanei SUCCESS.
- Storage: 1 bucket e0 oggetti; inventario stabile pre/post, metadati del bucket e policy/ACL ripristinati. Non sono dichiarati verificati file esistenti o API Storage del clone: non c'erano byte di file da ripristinare.

## Conservazione e recuperabilità
Pacchetto Backup_Production_20261128_Checkpoint.enc conservato cifrato nello spazio privato persistente, senza condivisione creata.
2065200 byte; SHA256 89069e5f60d9e499d89b820dcb568be8852aae9e00a3b82aa6debe0f8705b1ff.
Scaricato nuovamente da tale spazio: digest, decifratura autenticata, tutti i digest dei membri e validità JSON configurazioni PASS.
Dump originale SHA256 fba60c549f11ba6bbc998c51563a83b2bd3312e548c471da0131b47f2d9407c1.
Cifratura RSA-OAEP SHA256/AES256-GCM con chiave di backup già autorizzata. La chiave privata non è nel repository né nel pacchetto. Il precedente export config27/11 era troncato: usare esclusivamente la nuova copia validata28/11.

## Blocchi residui precisi
1. Export completo Supabase Auth non acquisito: mancano configurazione completa e verifica di recupero del servizio Auth, oltre ai dati Auth già presenti nel database.
2. Valori originali delle variabili Vercel sensitive non tutti attestati. Inventario22, valori10 leggibili acquisiti con configurazione progetto e JSON valido;12 sensitive non esportabili. Connessione DB e varianti sono ricostruibili dalla credenziale già acquisita: non richiedere nuovamente la password. Sette valori originali restano da acquisire o attestare come non configurati: EMAIL_PROVIDER,EMAIL_FROM,EMAIL_FROM_NAME,BREVO_API_KEY,RESEND_API_KEY,SUPABASE_SECRET_KEY,SUPABASE_JWT_SECRET. Le chiavi email del repository sono candidati, non prova dei valori Vercel originali.
Dettaglio e campi protetti: CONFIG_COVERAGE.md. Nessun valore o dato personale in questi documenti.
La rigenerazione futura delle credenziali richiede un piano di recupero verificato; non trasforma l'export originale parziale in backup completo.

## Vincoli conservati
PR96 resta9d33ce94; PASS PR94/PR95 e test applicativi precedenti conservati, registrazione non ripetuta.
Nessun merge, modifica dati/configurazioni, sospensione, migrazione o deploy Production; nessun altro evento o servizio a pagamento attivato.
Checklist aggiornata nel repository; pannello Sites live non ripubblicato.
Il rilascio resta non autorizzato. Dopo la chiusura dei blocchi: checkpoint separato, ordine PR94→PR95, tre migrazioni nel manifest e deploy esplicito come in SEQUENZA_DA_AUTORIZZARE.md.

## Checklist precedente — evidenze applicative conservate

# Checklist di coordinamento — aggiornamento 28 novembre 2026

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

## Checklist tecnica precedente — PASS conservati e stati backup superati dall’aggiornamento sopra

# Coordinamento — esito conclusivo 27 novembre 2026

| Controllo | Esito | Evidenza |
|---|---|---|
| HEAD PR94/PR95 | PASS | a4bd47f / 98a1aebe invariati |
| Candidato finale applicativo | PASS | 98a1aebe, codice prodotto non riaperto |
| PASS QA tre eventi | CONSERVATI | 998 test e run 45637463755 |
| Migrazioni Production | MANIFEST DEFINITO | 3 file in ordine in CONCLUSIONE.md, non applicati |
| Differenze schema | RICONCILIATE per il perimetro | 21 corpi identici CRLF/LF, 8 policy identiche; search_path Production conservato |
| Vecchia app + schema candidato | PASS | 45993656604: cd6b406a + schema98a1aebe, 12 percorsi |
| Regressione checkpoint | PASS | Tutti i 7 workflow su9d33ce94 SUCCESS; lifecycle45993656383 con cleanup |
| Dump/ripristino isolato | PASS | pg_dump/pg_restore, canary, fingerprint, cleanup |
| Backup reale Production | STOP | Piano Free senza backup gestito; export/restore reale non verificato |
| Ordine PR e rilascio | DEFINITO | PR94 -> PR95; QA patch/manifest; 3 migrazioni; build/deploy espliciti |
| Production smoke | PASS STATICO | 45993656595; nessuno smoke live |
| Preview finale | READY | qwv489r71 sul candidato98a1aebe |
| Rilascio complessivo | STOP | Solo dopo backup Production verificato e autorizzazione |
| Merge / DDL / deploy Production | NON ESEGUITI | Nessuna autorizzazione dedotta dal PASS QA |
| Altri eventi / costi nuovi | NESSUNO | Perimetro rispettato |
| Pannello Sites live | NON RIPUBBLICATO | Questa checklist è la versione aggiornata nel pacchetto |

## Aggiornamento backup reale
- CONFIG_PARZIALE del27/11 cifrato, persistito privatamente e decifratura verificata: PASS parziale.
- Database e byte Storage: NON ACQUISITI; restore reale/conteggi/permessi: NON VERIFICATI.
- STOP: connessione PostgreSQL protetta, egress del worker e configurazioni sensitive originali mancanti.
- Dettaglio aggiornato: BACKUP_REALE_STATO.md. Nessun valore, dato o segreto nel repository.
