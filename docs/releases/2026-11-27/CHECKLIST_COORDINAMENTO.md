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
