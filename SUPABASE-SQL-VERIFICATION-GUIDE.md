# Script SQL per Verifica Database (Supabase SQL Editor)

> 📖 **Quick Reference:** Per esempi pratici e casi d'uso, vedi [SQL-SCRIPTS-QUICK-REFERENCE.md](./SQL-SCRIPTS-QUICK-REFERENCE.md)

## 📋 Panoramica

Questi script SQL possono essere eseguiti direttamente nel **SQL Editor di Supabase** senza bisogno di accesso locale al database o di strumenti esterni. Sono progettati per essere **read-only** e sicuri da eseguire anche in produzione.

## 🎯 Script Disponibili

### 1. `supabase-verify-config.sql`
**Verifica configurazione base del database**

Controlla:
- ✅ Esistenza tabelle principali (events, expenses, suppliers, etc.)
- ✅ Row Level Security (RLS) abilitato
- ✅ Policies configurate
- ✅ Stored procedures essenziali
- ✅ Dati di seed (suppliers, locations, churches)
- ✅ Subscription packages
- ✅ Colonne chiave presenti

**Quando usarlo:** Prima esecuzione dopo setup, dopo modifiche schema

---

### 2. `supabase-verify-data-integrity.sql`
**Verifica integrità e coerenza dei dati**

Controlla:
- 🔗 Orphan records (expenses/incomes senza evento)
- 🔗 Subcategories senza categoria
- ✅ Valori `spend_type` validi (common/bride/groom)
- ✅ Valori `event_type` validi
- 💰 Budget e importi negativi
- 📅 Subscriptions scadute ma attive
- 🔄 Fornitori duplicati
- 🏷️ Provider types validi

**Quando usarlo:** Periodicamente per controllo qualità dati, dopo import massivi

---

### 3. `supabase-verify-performance.sql`
**Verifica performance e ottimizzazione**

Controlla:
- 📊 Indici su foreign keys principali
- 📈 Statistiche utilizzo tabelle
- 💾 Dimensioni tabelle e indici
- ⚡ Tabelle senza indici (oltre PK)

**Quando usarlo:** Quando noti rallentamenti, prima di ottimizzazioni

---

### 4. `supabase-diagnostics-complete.sql` ⭐
**Diagnostica completa all-in-one**

Include TUTTO in un unico script:
- Informazioni generali database
- Struttura tabelle con conteggio righe
- Seed data per tipologia
- Integrità referenziale
- Validazione valori
- Security & RLS
- Performance & indici
- Stored procedures
- **Riepilogo finale con statistiche**

**Quando usarlo:** Report completo dello stato del database, troubleshooting generale

---

### 5. `supabase-monitor-activity.sql`
**Monitoraggio attività e trend**

Analizza:
- 📊 Eventi creati nelle ultime 24 ore
- 💰 Spese/entrate degli ultimi 7 giorni
- 👥 Nuovi utenti ultimo mese
- 📅 Subscriptions attive e in scadenza
- 🏆 Top fornitori più utilizzati
- 💌 Wedding cards recenti
- 📝 Record modificati (updated_at)
- ⏰ Pattern utilizzo per ora del giorno

**Quando usarlo:** Analytics, trend analysis, audit trail

---

### 6. `supabase-generate-reports.sql`
**Generatore report CSV**

Genera report esportabili in formato CSV:
- 📋 Riepilogo tabelle con dimensioni
- 🌱 Seed data summary
- 📊 Eventi per tipo
- 💸 Spese per categoria (top 20)
- 🏢 Fornitori più utilizzati (top 30)
- 📆 Attività mensile (ultimo anno)
- ⚠️ Problemi rilevati con severità
- 🔐 Security overview (RLS + policies)
- ⚡ Performance metrics

**Quando usarlo:** Export dati per analisi esterna, presentazioni, backup statistiche

---

## 🚀 Come Usare

### Passo 1: Apri Supabase SQL Editor
1. Vai su [app.supabase.com](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Nel menu laterale, clicca **SQL Editor**
4. Clicca **+ New query**

### Passo 2: Copia e Incolla
1. Apri uno degli script SQL da questo repository
2. **Copia tutto il contenuto** del file
3. **Incolla** nel SQL Editor di Supabase

### Passo 3: Esegui
1. Clicca il pulsante **Run** (o `Ctrl+Enter`)
2. Attendi i risultati
3. Leggi i messaggi `NOTICE` e `WARNING` nel pannello Messages
4. Controlla le tabelle risultanti nel pannello Results

---

## 📊 Interpretazione Risultati

### Simboli nei Messaggi
- `✅` / `✓` = **OK** - Tutto configurato correttamente
- `⚠️` / `⚠` = **ATTENZIONE** - Problema rilevato, richiede azione
- `✖` = **ERRORE** - Problema critico

### Esempi di Output

#### Output Positivo
```
✅ VERIFICA COMPLETATA: Database configurato correttamente!
   ✓ Trovate 11 tabelle principali
   ✓ RLS abilitato su 8 tabelle
   ✓ Nessuna spesa orfana
```

#### Output con Problemi
```
⚠️ VERIFICA FALLITA: Alcuni elementi mancanti
   ⚠ Mancano 2 tabelle!
   ⚠ Trovate 15 spese senza evento associato!
   ⚠ Nessun fornitore trovato! Eseguire seed degli suppliers.
```

---

## 🔧 Risoluzione Problemi Comuni

### "Mancano tabelle"
➡️ Esegui `supabase-COMPLETE-SETUP.sql` nel SQL Editor

### "Nessun fornitore/location/chiesa trovato"
➡️ Esegui i file seed:
- `supabase-suppliers-seed.sql`
- `supabase-locations-seed.sql`
- `supabase-churches-seed.sql`

### "Trovate spese/entrate orfane"
➡️ Possibili cause:
1. Eventi cancellati senza cascata
2. Import dati con ID errati

**Fix:**
```sql
-- Elimina expenses orfane
DELETE FROM expenses WHERE event_id NOT IN (SELECT id FROM events);

-- Oppure assegna a evento di default
UPDATE expenses 
SET event_id = (SELECT id FROM events WHERE user_id = auth.uid() LIMIT 1)
WHERE event_id NOT IN (SELECT id FROM events);
```

### "Subscriptions scadute ma attive"
➡️ Aggiorna lo status:
```sql
UPDATE user_subscriptions 
SET status = 'expired' 
WHERE status = 'active' AND end_date < CURRENT_DATE;
```

### "Mancano indici"
➡️ Esegui `supabase-ALL-PATCHES.sql` che include ottimizzazioni indici

---

## 🔒 Sicurezza

### ✅ Questi script sono SICURI perché:
- **Read-only**: Non modificano dati (solo lettura e RAISE NOTICE)
- **No DROP/DELETE**: Non cancellano tabelle o dati
- **No ALTER**: Non modificano schema
- **Transaction-safe**: Usano blocchi `DO $$` isolati

### ⚠️ Accortezze:
- Alcuni script interrogano tutte le righe (possono essere lenti su DB grandi)
- Le query di conteggio (`COUNT(*)`) possono impiegare tempo su milioni di record
- Se il database è sotto carico, preferisci orari di basso traffico

---

## 📅 Cadenza Consigliata

| Script | Frequenza | Scenario |
|--------|-----------|----------|
| `supabase-verify-config.sql` | Dopo ogni deploy/migrazione | Verifica setup |
| `supabase-verify-data-integrity.sql` | Settimanale | Manutenzione ordinaria |
| `supabase-verify-performance.sql` | Mensile | Monitoraggio performance |
| `supabase-diagnostics-complete.sql` | On-demand | Troubleshooting completo |

---

## 🆘 Supporto

Se uno script restituisce errori:

1. **Copia il messaggio di errore completo**
2. **Annota quale script stavi eseguendo**
3. **Controlla la versione PostgreSQL** (deve essere >= 12)
4. **Verifica le permissions** (devi essere proprietario o superuser)

### Query Utili di Debug
```sql
-- Controlla versione PostgreSQL
SELECT version();

-- Controlla il tuo ruolo
SELECT current_user, session_user;

-- Lista tutte le tabelle
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

## 🔄 Integrazione con Pipeline

Questi script possono essere integrati in:
- **CI/CD**: Esegui verifica prima del deploy
- **Monitoring**: Cron job giornaliero per check integrità
- **Testing**: Valida database di test prima dei test E2E

Esempio con `scripts/run-sql.mjs`:
```bash
# Locale
node scripts/run-sql.mjs supabase-diagnostics-complete.sql

# Con PostgreSQL locale
SUPABASE_DB_URL="postgres://postgres:postgres@localhost:5433/ibds" \
  node scripts/run-sql.mjs supabase-verify-config.sql
```

---

## 📝 Note Tecniche

### Compatibilità
- ✅ PostgreSQL 12+
- ✅ Supabase Cloud
- ✅ Supabase Local (Docker)
- ✅ PostgreSQL self-hosted

### Estensioni Richieste
Nessuna! Usano solo funzionalità core PostgreSQL.

### Performance
- `supabase-verify-config.sql`: ~1-2 secondi
- `supabase-verify-data-integrity.sql`: ~2-5 secondi
- `supabase-verify-performance.sql`: ~1-3 secondi  
- `supabase-diagnostics-complete.sql`: ~5-10 secondi

*(tempi indicativi su DB con ~10k records)*

---

## 🎓 Best Practices

1. **Salva le query**: Nel SQL Editor, clicca "Save" per riutilizzarle
2. **Nomina le query**: Es. "Daily Health Check", "Post-Deploy Verify"
3. **Bookmark i risultati**: Snapshot dei risultati per confronti temporali
4. **Automatizza**: Crea uno scheduled job in Supabase per esecuzioni periodiche

---

## 📚 File Correlati

- `scripts/run-sql.mjs` - Runner locale per sviluppo
- `supabase-COMPLETE-SETUP.sql` - Setup schema completo
- `supabase-ALL-PATCHES.sql` - Tutte le patch cumulative
- `.vscode/tasks.json` - Task VS Code per esecuzione rapida

---

**Ultimo aggiornamento:** 4 Novembre 2025  
**Versione:** 1.0.0  
**Compatibilità:** PostgreSQL 12+, Supabase Cloud/Local
