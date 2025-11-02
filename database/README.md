# Il Budget degli Sposi - Database Project

## 📊 Panoramica

Questo Database Project contiene lo schema completo per l'applicazione "Il Budget degli Sposi", un sistema di gestione budget matrimoniali basato su PostgreSQL/Supabase.

## 🗄️ Struttura Database

### Tabelle Principali
- **events** - Eventi matrimoniali (1 per utente)
- **categories** - Categorie di spesa (es. "Sposa", "Location")
- **subcategories** - Sottocategorie dettagliate
- **expenses** - Spese effettive con tipo (common/bride/groom)
- **incomes** - Entrate/fonti di budget
- **profiles** - Profili utenti (Supabase Auth)

### Tabelle di Supporto
- **suppliers** - Fornitori regionali (fotografi, fioristi, etc.)
- **locations** - Location ricevimenti per regione
- **churches** - Chiese per cerimonie

## 🚀 Comandi Disponibili

### Connessioni Database

#### Database Locale (Docker)
```bash
# Avvia il container
docker-compose up -d

# Verifica stato
docker ps

# Accesso via Adminer
# http://localhost:8080
# Server: db
# User: postgres
# Password: postgres
# Database: ibds
```

#### Database Cloud (Supabase)
```bash
# URL Dashboard
https://vsguhivizuneylqhygfk.supabase.co

# Connection String (già configurato in .env.local)
postgresql://postgres:12LuglioRocco!@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres
```

### Script SQL

#### Esecuzione SQL Files
```bash
# File singolo (locale)
node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql

# File singolo (cloud - usa SUPABASE_DB_URL da .env.local)
node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql

# Multipli file
node scripts/run-sql.mjs file1.sql file2.sql file3.sql
```

#### VS Code Tasks
- `Run SQL: Current File (local PG)` - Esegue il file SQL corrente su DB locale
- `Run SQL: Init schema + patches (local PG)` - Setup completo schema locale
- `Run SQL: Events seed (local PG)` - Popola dati eventi
- `Run SQL: Seeds (local PG – multi)` - Tutti i seed in una volta

### Test Connessioni
```bash
node test-db-connection.mjs
```

## 📁 File Principali

### Schema Base
- `supabase-COMPLETE-SETUP.sql` - Schema completo (tabelle, RLS, policies)
- `supabase-ALL-PATCHES.sql` - Tutte le patch migrate in ordine

### Funzioni
- `supabase-seed-functions.sql` - Stored procedures (seed_full_event, etc.)

### Seed Data
- `supabase-suppliers-seed.sql` - ~500 fornitori italiani
- `supabase-locations-seed.sql` - Location per regione
- `supabase-churches-seed.sql` - Chiese italiane
- `supabase-events-seed.sql` - Dati demo eventi

### Seeds Internazionali
- `supabase-india-seed.sql` - Dati India
- `supabase-mexico-seed.sql` - Dati Messico
- `supabase-mx-seed-*.sql` - Dati Messico estesi

## 🔐 Sicurezza (Row Level Security)

Tutte le tabelle usano RLS (Row Level Security) di Supabase:
- Gli utenti vedono solo i propri dati
- Le API routes usano `service_role` per bypassare RLS lato server
- I client usano `anon` key con RLS attivo

## 🏗️ Workflow Sviluppo

1. **Modifiche Schema**
   - Modifica `supabase-COMPLETE-SETUP.sql` o crea nuova patch
   - Testa su DB locale
   - Applica a cloud quando pronto

2. **Seed Data**
   - Aggiungi/modifica file seed
   - Esegui su locale prima di cloud

3. **Migration**
   - Le patch sono numerate (es. `supabase-budget-ideas.sql`)
   - `supabase-ALL-PATCHES.sql` le raggruppa in ordine

## 🛠️ Strumenti Consigliati

- **Adminer** (http://localhost:8080) - GUI web per DB locale
- **Supabase Dashboard** - GUI cloud
- **VS Code PostgreSQL Extension** - Editor integrato
- **pgAdmin** (opzionale) - Client desktop avanzato

## 📊 Monitoring

### Metriche Disponibili
```sql
-- Conteggio tabelle
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Dimensione database
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Tabelle con più righe
SELECT schemaname, tablename, n_live_tup as rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

## 🔄 Backup e Restore

### Backup Locale
```bash
docker exec ibds-postgres pg_dump -U postgres ibds > backup.sql
```

### Backup Cloud
```bash
# Via Supabase Dashboard → Database → Backups
# O via CLI Supabase
```

## 📝 Note Tecniche

- **PostgreSQL Version**: 16.10
- **Collation**: SQL_Latin1_General_CP1_CI_AS
- **Encoding**: UTF-8
- **Time Zone**: UTC (convertito nell'app)
- **Connection Pool**: Gestito da Supabase (max 60 per progetto free tier)

## 🐛 Troubleshooting

### Errore "Too many connections"
- Supabase free tier: max 60 connections
- Usa connection pooling nell'app
- Chiudi connessioni inutilizzate

### Schema non aggiornato
```bash
# Locale: re-run setup
node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql supabase-ALL-PATCHES.sql

# Cloud: verifica versione su dashboard
```

### RLS blocca queries
- API routes: usa `getServiceClient()` con service_role
- Client: usa `getBrowserClient()` con JWT session

## 📞 Supporto

Per problemi con il database:
1. Verifica log container: `docker logs ibds-postgres`
2. Controlla Supabase Dashboard → Logs
3. Esegui test: `node test-db-connection.mjs`
