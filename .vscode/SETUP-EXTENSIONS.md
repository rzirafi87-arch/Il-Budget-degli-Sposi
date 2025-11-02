# Guida Configurazione Estensioni VS Code

Questa guida ti aiuterà a configurare correttamente tutte le estensioni VS Code necessarie per lavorare con **Il Budget degli Sposi** e le sue integrazioni con GitHub, Supabase e Vercel.

## 📦 Estensioni Richieste

VS Code ti chiederà automaticamente di installare le estensioni raccomandate quando apri il progetto. Clicca su **"Installa tutto"** quando appare la notifica.

### Categorie di Estensioni

#### 🐙 GitHub Integration
- **GitHub Copilot** - AI pair programming
- **GitHub Copilot Chat** - Chat AI per assistenza codice
- **GitHub Pull Requests** - Gestione PR direttamente da VS Code

#### 🗄️ Database & Supabase
- **Supabase Extension** - Integrazione completa con Supabase
- **PostgreSQL (ms-ossdata)** - Client PostgreSQL nativo
- **SQL Server (mssql)** - Per confronti/migrations (opzionale)
- **Data Workspace** - Progetti database
- **SQL Database Projects** - Gestione schema database

#### 🚀 Vercel Deployment
- **VSCode Vercel** - Deploy e gestione Vercel da VS Code

#### ✨ Code Quality
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Formattazione automatica codice
- **Tailwind CSS IntelliSense** - Autocompletamento classi Tailwind

#### 🧪 Testing
- **Jest** - Test runner integrato

#### 🌍 Internazionalizzazione
- **i18n Ally** - Gestione traduzioni (configurato per italiano)

#### 🔧 Utilities
- **DotEnv** - Syntax highlighting per file `.env`
- **Docker** - Per gestire il container PostgreSQL locale

## 🔌 Configurazione Connessioni

### 1. Supabase Cloud

**File**: `.vscode/settings.json`

```jsonc
"postgres.connections": [
  {
    "label": "Supabase Cloud (Il Budget degli Sposi)",
    "connectionString": "postgresql://postgres:YOUR_DB_PASSWORD@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres?sslmode=require"
  }
]
```

**Setup**:
1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il progetto **Il Budget degli Sposi**
3. Vai su **Settings → Database**
4. Copia la **Connection String** (in modalità "URI")
5. Sostituisci `YOUR_DB_PASSWORD` con la password del database
6. Aggiorna il file `.vscode/settings.json`

**File `.env.local`** (necessario anche per il progetto):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://vsguhivizuneylqhygfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tuo_anon_key>
SUPABASE_SERVICE_ROLE=<tuo_service_role>
SUPABASE_DB_URL=postgres://postgres:<DB_PASSWORD>@db.vsguhivizuneylqhygfk.supabase.co:5432/postgres
```

### 2. PostgreSQL Locale (Docker)

**Avviare il database locale**:
```powershell
docker-compose up -d
```

La connessione locale è già configurata:
```jsonc
{
  "label": "Local Postgres (Docker - ibds)",
  "host": "localhost",
  "port": 5433,
  "user": "postgres",
  "password": "postgres",
  "database": "ibds",
  "ssl": false
}
```

**Inizializzare lo schema locale**:
Usa il task VS Code: `Run SQL: Init schema + patches (local PG)`
- Premi `Ctrl+Shift+P`
- Cerca: `Tasks: Run Task`
- Seleziona: `Run SQL: Init schema + patches (local PG)`

### 3. Vercel

**Collegare l'account Vercel**:

1. Installa l'estensione **VSCode Vercel**
2. Premi `Ctrl+Shift+P` → `Vercel: Login`
3. Autorizza VS Code nel browser
4. Il progetto dovrebbe essere rilevato automaticamente tramite `.vercel/project.json`

**Comandi utili Vercel da VS Code**:
- `Vercel: Deploy Production` - Deploy in produzione
- `Vercel: Deploy Preview` - Deploy di preview
- `Vercel: View Deployments` - Visualizza deployment
- `Vercel: View Logs` - Log in tempo reale

**File di configurazione**: `vercel.json` (già presente)

### 4. GitHub

Le estensioni GitHub si autenticano automaticamente tramite il tuo account VS Code.

**Verifica autenticazione**:
1. Clicca sull'icona dell'account in basso a sinistra
2. Assicurati di vedere il tuo account GitHub
3. L'estensione Pull Requests richiederà l'autorizzazione al primo uso

## 🎯 Utilizzo Quotidiano

### Lavorare con il Database

**Via Supabase Extension**:
1. Apri la sidebar Supabase (icona nella barra laterale)
2. Connetti al progetto
3. Naviga tra tabelle, funzioni, policies

**Via PostgreSQL Extension**:
1. Premi `Ctrl+Shift+P`
2. `PostgreSQL: New Query`
3. Seleziona la connessione (Cloud o Local)
4. Scrivi ed esegui query SQL

**Eseguire script SQL**:
- Apri un file `.sql` (es: `supabase-COMPLETE-SETUP.sql`)
- Usa il task: `Run SQL: Current File (Supabase Cloud)` o versione locale

### Deploy su Vercel

**Metodo 1: Git Push (Automatico)**
```bash
git add .
git commit -m "feat: nuova funzionalità"
git push origin main
```
Vercel deploya automaticamente ad ogni push su `main`.

**Metodo 2: VS Code Command**
- `Ctrl+Shift+P` → `Vercel: Deploy Production`

**Metodo 3: CLI**
```powershell
npm install -g vercel
vercel --prod
```

### GitHub Copilot

**Autocompletamento**:
- Inizia a scrivere codice, Copilot suggerisce automaticamente
- Premi `Tab` per accettare, `Esc` per rifiutare

**Chat**:
- `Ctrl+Shift+I` - Apre la chat Copilot
- Chiedi aiuto su codice, debug, refactoring
- Esempi:
  - "Spiega questa funzione"
  - "Come posso ottimizzare questa query?"
  - "Scrivi un test per questo componente"

**Inline Chat**:
- `Ctrl+I` - Chat inline nell'editor
- Seleziona codice e chiedi modifiche specifiche

## 🛠️ Tasks VS Code Configurati

Accedi tramite `Ctrl+Shift+P` → `Tasks: Run Task`:

### SQL Tasks (Local PG)
- `Run SQL: Current File (local PG)` - Esegue file SQL corrente
- `Run SQL: Init schema + patches (local PG)` - Setup completo schema
- `Run SQL: Events seed (local PG)` - Seed dati eventi
- `Run SQL: Seeds (local PG – multi)` - Seed completi

### SQL Tasks (Supabase Cloud)
- `Run SQL: Current File (Supabase Cloud)` - Esegue su cloud
- `Run SQL: Events seed (Supabase Cloud)` - Seed su cloud
- `Run SQL: Seeds (Supabase Cloud – multi)` - Seed completi su cloud

## 🔍 Troubleshooting

### Supabase Extension non si connette
1. Verifica `SUPABASE_DB_URL` in `.env.local`
2. Controlla password database in Supabase Dashboard
3. Riavvia VS Code

### PostgreSQL Extension - Connection Refused
1. Verifica che Docker sia avviato: `docker ps`
2. Verifica porta: `docker-compose ps` (dovrebbe mostrare porta 5433)
3. Riavvia container: `docker-compose restart`

### Vercel Extension - Progetto non trovato
1. Assicurati di aver fatto login: `Vercel: Login`
2. Verifica esistenza di `.vercel/project.json`
3. Puoi linkare manualmente: `vercel link` da terminale

### ESLint non funziona
1. Installa dipendenze: `npm install`
2. Riavvia ESLint Server: `Ctrl+Shift+P` → `ESLint: Restart ESLint Server`
3. Verifica `eslint.config.mjs` sia presente

### i18n Ally non mostra traduzioni
1. Verifica path: `src/messages/it.json` esista
2. Controlla impostazioni in `.vscode/settings.json`:
   ```json
   "i18n-ally.localesPaths": ["src/messages"]
   ```

## 📚 Risorse Utili

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [GitHub Copilot Docs](https://docs.github.com/copilot)
- [PostgreSQL Extension Guide](https://marketplace.visualstudio.com/items?itemName=ms-ossdata.vscode-pgsql)

## ✅ Checklist Setup Iniziale

- [ ] Installare tutte le estensioni raccomandate
- [ ] Configurare connessione Supabase Cloud in `.vscode/settings.json`
- [ ] Copiare `.env.local.example` → `.env.local` e compilare
- [ ] Autenticarsi con GitHub (account VS Code)
- [ ] Autenticarsi con Vercel (`Vercel: Login`)
- [ ] Avviare database locale: `docker-compose up -d`
- [ ] Testare connessione PostgreSQL locale
- [ ] Eseguire task `Run SQL: Init schema + patches (local PG)`
- [ ] Verificare che ESLint e Prettier funzionino (salvare un file)
- [ ] Testare GitHub Copilot con `Ctrl+Shift+I`

---

**Progetto**: Il Budget degli Sposi  
**Stack**: Next.js 16 + React 19 + Supabase + Vercel  
**Ultima modifica**: Novembre 2025
