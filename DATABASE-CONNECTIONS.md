# 🗄️ Database Connections - Il Budget degli Sposi

## ✅ Configurazione Completata

Tutte le connessioni database sono state configurate e testate con successo!

## 📊 Database Attivi

### 🟢 PostgreSQL Locale (Docker)
- **Status**: ✅ Connesso
- **Container**: `ibds-postgres`
- **Host**: localhost:5433
- **Database**: ibds
- **User**: postgres
- **Password**: postgres
- **Versione**: PostgreSQL 16.10
- **Tabelle**: 9

### 🔵 Supabase Cloud
- **Status**: ✅ Connesso
- **Host**: db.vsguhivizuneylqhygfk.supabase.co:5432
- **Database**: postgres (alias ibds)
- **User**: postgres
- **Versione**: PostgreSQL 16.10
- **Tabelle**: 9

## 🔧 VS Code Extensions Installate

```vscode-extensions
ms-ossdata.vscode-pgsql,ms-mssql.mssql,ms-mssql.data-workspace-vscode,ms-mssql.sql-database-projects-vscode,supabase.vscode-supabase-extension
```

### Configurazioni Attive

1. **PostgreSQL Extension** (`ms-ossdata.vscode-pgsql`)
   - 2 connessioni configurate in `.vscode/settings.json`
   - Supabase Cloud + Local Docker

2. **SQL Server Extension** (`ms-mssql.mssql`)
   - Pronto per connessioni MSSQL future

3. **Database Projects** (`ms-mssql.sql-database-projects-vscode`)
   - Project file: `./database/il-budget-sposi.sqlproj`
   - Workspace: `./database/dataworkspace.json`

4. **Data Workspace** (`ms-mssql.data-workspace-vscode`)
   - Gestione centralizzata progetti DB

## 🚀 Quick Start Commands

### NPM Scripts (aggiunti)
```bash
# Testa tutte le connessioni con info dettagliate
npm run db:connect

# Test rapido connessioni
npm run db:test

# Avvia container Docker
npm run db:up

# Ferma container Docker
npm run db:down

# Esegui file SQL
npm run sql:exec -- <file.sql>
```

### Comandi Diretti
```bash
# Connection launcher (mostra tutte le info)
node connect-databases.mjs

# Test semplice
node test-db-connection.mjs

# Esegui SQL su locale
SUPABASE_DB_URL=postgres://postgres:postgres@localhost:5433/ibds node scripts/run-sql.mjs file.sql

# Esegui SQL su cloud (usa .env.local automaticamente)
node scripts/run-sql.mjs file.sql
```

## 🌐 Interfacce Web

### Adminer (Database Locale)
- **URL**: http://localhost:8080
- **Server**: db
- **Username**: postgres
- **Password**: postgres
- **Database**: ibds

### Supabase Dashboard (Cloud)
- **URL**: https://vsguhivizuneylqhygfk.supabase.co
- **Features**: Table Editor, SQL Editor, Auth, Storage, Logs

## 📁 File Struttura Database

### Database Project
```
database/
├── il-budget-sposi.sqlproj    # VS Code Database Project
├── dataworkspace.json          # Workspace configuration
└── README.md                   # Documentazione completa
```

### Schema SQL Files (root)
```
supabase-COMPLETE-SETUP.sql     # Schema completo
supabase-ALL-PATCHES.sql        # Tutte le patch
supabase-seed-functions.sql     # Stored procedures
supabase-*-seed.sql             # Dati seed vari
```

### Scripts Utilità
```
scripts/run-sql.mjs             # SQL executor
test-db-connection.mjs          # Test connessioni
connect-databases.mjs           # Connection launcher
```

## 🎯 VS Code - Come Usare

### 1. PostgreSQL Extension

**Apri il pannello PostgreSQL:**
- Premi `Ctrl+Shift+P`
- Cerca "PostgreSQL: Focus on Database Explorer"
- Vedrai le tue 2 connessioni:
  - "Supabase Cloud (Il Budget degli Sposi)"
  - "Local Postgres (Docker - ibds)"

**Esegui query:**
- Click destro su una connessione → "New Query"
- Scrivi SQL e premi `F5` per eseguire

### 2. SQL Database Projects

**Apri il progetto:**
- File Explorer → `database/il-budget-sposi.sqlproj`
- Click destro → "Open in Database Projects"

**Gestisci schema:**
- Vedi tutti i file SQL organizzati
- Build, deploy, compare schemas

### 3. Data Workspace

**Apri workspace:**
- `Ctrl+Shift+P` → "Data: Open Workspace"
- Seleziona `database/dataworkspace.json`

## 🔄 Workflow Tipico

### Sviluppo Locale
```bash
# 1. Avvia Docker
npm run db:up

# 2. Verifica connessione
npm run db:connect

# 3. Inizializza schema (se vuoto)
npm run sql:init:all

# 4. Lavora con VS Code PostgreSQL Extension
# Oppure usa Adminer: http://localhost:8080
```

### Deploy su Cloud
```bash
# 1. Testa modifiche su locale
npm run sql:exec -- mio-update.sql

# 2. Verifica funzioni su locale
npm run db:test

# 3. Applica su cloud (usa SUPABASE_DB_URL da .env.local)
node scripts/run-sql.mjs mio-update.sql

# 4. Verifica su Supabase Dashboard
```

## 📊 Tabelle Database

Entrambi i database hanno le stesse 9 tabelle:

1. **categories** - Categorie spesa principali
2. **churches** - Database chiese per regione
3. **events** - Eventi matrimoniali
4. **expenses** - Spese dettagliate
5. **incomes** - Entrate/fonti budget
6. **locations** - Location ricevimenti
7. **profiles** - Profili utenti (Supabase Auth)
8. **subcategories** - Sottocategorie spesa
9. **suppliers** - Fornitori per servizio/regione

## 🛠️ Troubleshooting

### Docker non parte
```bash
docker ps
docker-compose logs
docker-compose restart
```

### Connessione PostgreSQL fallisce
```bash
# Verifica che Docker sia attivo
docker ps | grep ibds-postgres

# Testa manualmente
node connect-databases.mjs
```

### VS Code Extension non vede connessioni
1. Riapri VS Code
2. Verifica `.vscode/settings.json` → sezione `postgres.connections`
3. Ricarica Window (`Ctrl+Shift+P` → "Reload Window")

### Errori SSL su Supabase
- Gli script gestiscono SSL automaticamente
- Locale: SSL disabilitato
- Cloud: SSL con `rejectUnauthorized: false`

## 📝 Prossimi Passi

- ✅ Connessioni configurate
- ✅ Database Projects creato
- ✅ Scripts NPM aggiunti
- ✅ Documentazione completa

**Suggerimenti:**
1. Apri pannello PostgreSQL in VS Code per esplorare visualmente
2. Usa `npm run db:connect` quando inizia a lavorare
3. Tieni aperto Adminer su http://localhost:8080 per GUI locale
4. Consulta `database/README.md` per dettagli schema

## 🎉 Tutto Pronto!

Hai ora accesso completo a:
- 🐘 PostgreSQL locale (Docker)
- ☁️ Supabase Cloud
- 🔧 VS Code Extensions
- 📊 Database Projects
- 🌐 Adminer GUI
- ⚡ Scripts automatizzati

**Enjoy coding! 🚀**
