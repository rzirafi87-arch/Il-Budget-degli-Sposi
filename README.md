npm run codex:checknpm run codex:check# Il Budget degli Sposi 🎉

Un'applicazione web completa per la gestione del budget matrimoniale, costruita con **Next.js 16**, **React 19**, **Supabase** e **Tailwind CSS 4**.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)


## ✨ Caratteristiche

- 💰 **Budget Tracking** - Gestione completa del budget separato (sposo/sposa/comune)
- 📊 **Dashboard Interattiva** - Visualizzazione in tempo reale di spese e budget residuo
- 🏰 **Database Location** - Oltre 500+ location per matrimoni in Italia e supporto multi-nazione
- ⛪ **Database Chiese** - Catalogo completo delle chiese per regione
- 🏢 **Gestione Fornitori** - Database fornitori con categorie e contatti
- 💸 **Tracciamento Spese** - Registrazione dettagliata di ogni spesa
- 💌 **Partecipazioni PDF** - Generazione automatica inviti matrimonio
- 👥 **Gestione Ospiti** - Lista invitati con assegnazione tavoli
- 🔐 **Autenticazione Sicura** - Auth via Supabase con RLS
- 🌍 **Multi-lingua** - Interfaccia disponibile in 13 lingue:
   - Italiano (it)
   - English (en)
   - Español (es)
   - Français (fr)
   - Deutsch (de)
   - العربية (ar)
   - हिन्दी (hi)
   - 日本語 (ja)
   - 中文 (zh)
   - Español (México) (mx)
   - Português (pt)
   - Русский (ru)
   - Bahasa Indonesia (id)
- 🌐 **Multi-nazione** - Supporto per eventi e location in:
   - Italia (IT)
   - Messico (MX)
   - Regno Unito (GB)
   - Stati Uniti (US)
   - Giappone (JP)
   - Francia (FR)
   - Germania (DE)
   - Spagna (ES)
   - Cina (CN)
   - India (IN)
- 📱 **Responsive Design** - Ottimizzato per mobile e desktop

## 🚀 Quick Start

### Prerequisiti

- **Node.js** ≥ 18.17.0
- **npm** o **pnpm** o **yarn**
- **Docker** (opzionale, per database locale)
- Account **Supabase** (gratuito)
- Account **Vercel** (opzionale, per deploy)

### Installazione

1. **Clone del repository**
   ```bash
   git clone https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi.git
   cd Il-Budget-degli-Sposi
   ```

2. **Installa dipendenze**
   ```bash
   npm install
   ```

3. **Configura variabili d'ambiente**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Verifica Database** (Opzionale ma raccomandato)

   Esegui script di verifica nel [SQL Editor di Supabase](https://app.supabase.com):

   - **Quick Check** (< 3 sec): Copia/incolla `supabase-quick-check.sql`
   - **Diagnostica Completa**: Usa `supabase-diagnostics-complete.sql`

   📚 [Guida completa alla verifica DB →](./SUPABASE-SQL-VERIFICATION-GUIDE.md)

   Modifica `.env.local` con le tue credenziali Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE=your_service_role
   SUPABASE_DB_URL=postgres://postgres:password@db.your-project.supabase.co:5432/postgres
   ```

4. **Setup Database** (vedi sezione Database Setup)

5. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

   Apri [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Opzione 1: Supabase Cloud (Consigliato per Produzione)

1. Crea un progetto su [Supabase](https://app.supabase.com)
2. Vai su **SQL Editor** in dashboard
3. Esegui gli script in **questo ordine**:

   ```sql
   -- 1. Schema principale
   supabase-COMPLETE-SETUP.sql

   -- 2. Tutte le patch (include aggiornamenti schema)
   supabase-ALL-PATCHES.sql

   -- 3. Funzioni seed
   supabase-seed-functions.sql

   -- 4. Seed dati (scegli quali servono)
   supabase-suppliers-seed.sql
   supabase-locations-seed.sql
   supabase-churches-seed.sql
   supabase-events-seed.sql
   supabase-wedding-cards-table.sql
   ```

4. Copia le credenziali da **Settings → API**

### Opzione 2: PostgreSQL Locale (via Docker)

1. **Avvia container**
   ```bash
   docker-compose up -d
   ```

2. **Esegui migrations via VS Code Task**
   - Premi `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
   - Cerca: `Tasks: Run Task`
   - Seleziona: `Run SQL: Init schema + patches (local PG)`

3. **Oppure via terminale**
   ```bash
   node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql supabase-ALL-PATCHES.sql
   ```

Il database locale sarà disponibile su `localhost:5433`

## 🛠️ Configurazione VS Code

Questo progetto include configurazioni ottimizzate per Visual Studio Code.

### Estensioni Raccomandate

Quando apri il progetto, VS Code ti chiederà di installare le estensioni raccomandate. Clicca **"Installa tutto"**.

Estensioni incluse:
- ✅ **GitHub Copilot** - AI assistente programmazione
- ✅ **Supabase Extension** - Gestione database integrata
- ✅ **PostgreSQL** - Client SQL nativo
- ✅ **Vercel** - Deploy da VS Code
- ✅ **ESLint + Prettier** - Code quality
- ✅ **Tailwind CSS IntelliSense** - Autocompletamento classi
- ✅ **i18n Ally** - Gestione traduzioni

📖 **Guida completa**: [`.vscode/SETUP-EXTENSIONS.md`](.vscode/SETUP-EXTENSIONS.md)

### Tasks VS Code Configurati

Accedi tramite `Ctrl+Shift+P` → `Tasks: Run Task`:

- 🔧 `Run SQL: Init schema + patches (local PG)` - Setup database locale
- 🌱 `Run SQL: Seeds (local PG – multi)` - Seed completo
- ☁️ `Run SQL: Current File (Supabase Cloud)` - Esegue SQL su cloud

## 📚 Documentazione Completa

### 📖 Setup & Configurazione
- 📘 [**Guida Setup Estensioni**](.vscode/SETUP-EXTENSIONS.md) - Configurazione VS Code dettagliata
- 🔗 [**Guida Integrazione**](.github/INTEGRATION-GUIDE.md) - GitHub + Supabase + Vercel
- 🚀 [**Deployment Guide**](DEPLOYMENT-GUIDE.md) - Deploy su Vercel
- 🔐 [**Security & SEO**](SECURITY-AND-SEO.md) - Best practices

### 🤖 GitHub Copilot / Codex
- 🎯 **[Workflow con Codex](CODEX-WORKFLOW-GUIDE.md)** - Lavora autonomamente da Copilot ⭐
  - Sincronizzazione automatica Supabase → GitHub → Vercel
  - Task predefiniti per modifiche SQL
  - Pipeline completa con un click
- 🚀 **[Quick Start Codex](CODEX-QUICK-START.md)** - Inizia in 3 minuti
- 🎬 **[Demo Workflow](CODEX-DEMO.md)** - Esempio pratico passo-passo

### 🗄️ Database & SQL
- 🏥 **[Verifica Database (Supabase SQL Editor)](SUPABASE-SQL-VERIFICATION-GUIDE.md)** - Script per Supabase SQL Editor
- 📋 **[Indice Script SQL](SQL-SCRIPTS-INDEX.md)** - Elenco completo script disponibili
- 🚀 **[Quick Reference SQL](SQL-SCRIPTS-QUICK-REFERENCE.md)** - Esempi pratici e casi d'uso

**Script Principali:**
  - `supabase-quick-check.sql` - Health check rapido (< 3 sec)
  - `supabase-diagnostics-complete.sql` - Diagnostica completa
  - `supabase-verify-config.sql` - Verifica configurazione
  - `supabase-verify-data-integrity.sql` - Controllo integrità dati
  - `supabase-verify-performance.sql` - Analisi performance
  - `supabase-monitor-activity.sql` - Monitoraggio attività
  - `supabase-generate-reports.sql` - Generazione report CSV

### 📝 Changelog & Features
- 📝 [**Changelog**](CHANGELOG_CURRENT.md) - Ultime modifiche
- 🆕 [**Nuove Funzionalità**](NUOVE_FUNZIONALITA.md) - Roadmap features

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🧩 Git auto-commit helper (opzionale)

Se vuoi salvare e pubblicare rapidamente le modifiche senza digitare sempre i comandi Git:

- Esegui un commit+push immediato:
   - `npm run autocommit`
- Avvia il dev server facendo prima un autocommit:
   - `npm run dev:ac`
- Commit automatico ogni 10 minuti (lascia il processo aperto):
   - Windows: `scripts/autocommit-loop.bat`
   - macOS/Linux: `bash scripts/autocommit-loop.sh`

Nota: l’autocommit usa un messaggio generico “auto: save” e non fallisce se non ci sono cambiamenti.

## 🔗 Pipeline VS Code → Supabase → GitHub → Vercel

Esegui tutto in sequenza con i task preconfigurati (Ctrl+Shift+P → Tasks: Run Task):

- Pipeline Cloud: `Pipeline: Cloud DB -> Commit+Push -> Vercel`
   1) Applica `supabase-COMPLETE-SETUP.sql` e `supabase-ALL-PATCHES.sql` su Supabase Cloud.
   2) Esegue `npm run autocommit` (commit + push su GitHub), che innesca il deploy su Vercel.

- Pipeline Locale (sviluppo): `Pipeline: Local DB -> Commit+Push -> Vercel`
   1) Applica schema+patch su Postgres locale (docker: 5433).
   2) Autocommit + push per triggerare Vercel.

Requisiti:
- Supabase Cloud collegato (credenziali in `.env.local`).
- Repo collegato a Vercel con deploy automatici su push.
