# 🤖 Guida Workflow con GitHub Copilot (Codex)

## 📋 Panoramica

Questa guida ti spiega come lavorare **autonomamente dal pannello Codex** di VS Code e sincronizzare automaticamente le modifiche su:
- ✅ **Supabase Cloud** (database)
- ✅ **GitHub** (repository)
- ✅ **Vercel** (deploy automatico)

---

## 🎯 Flusso di Lavoro Automatico

```
┌──────────────┐
│   CODEX      │  🤖 Chiedi modifiche a GitHub Copilot
│  (VS Code)   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Script SQL  │  📝 Copilot genera/modifica file SQL
│  Generato    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Task VS     │  🚀 Esegui task: "Codex: Sync Current SQL to Cloud"
│   Code       │
└──────┬───────┘
       │
       ├─────────────────────────────────────────────┐
       │                                             │
       ↓                                             ↓
┌──────────────┐                              ┌─────────────┐
│  SUPABASE    │  ☁️ Esegue SQL su DB Cloud   │    GIT      │  📦 Commit + Push
│   CLOUD      │                              │   GITHUB    │
└──────────────┘                              └──────┬──────┘
                                                     │
                                                     ↓
                                              ┌─────────────┐
                                              │   VERCEL    │  🚀 Deploy auto
                                              │   DEPLOY    │
                                              └─────────────┘
```

---

## 🚀 Metodi di Sincronizzazione

### Metodo 1: Task VS Code (Consigliato) ⭐

#### Opzione A: File SQL Aperto
1. Apri il file SQL che vuoi eseguire (es. `supabase-quick-check.sql`)
2. Premi `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
3. Digita: `Tasks: Run Task`
4. Seleziona: **`🤖 Codex: Sync Current SQL to Cloud`**
5. ✅ Fatto! Lo script viene eseguito, committato e deployato automaticamente

#### Opzione B: Quick Actions Predefiniti
Premi `Ctrl+Shift+P` → `Tasks: Run Task` → Scegli:

- **`🤖 Codex: Quick Health Check + Sync`**
  - Esegue `supabase-quick-check.sql`
  - Mostra health score
  - Auto-commit + push

- **`🤖 Codex: Full Diagnostics + Sync`**
  - Esegue `supabase-diagnostics-complete.sql`
  - Report completo database
  - Auto-commit + push

- **`🚀 Codex: Full Pipeline`**
  - Esegue file corrente
  - Commit + push
  - Trigger deploy Vercel

---

### Metodo 2: Terminale (Manuale)

```bash
# Esegui + sincronizza file SQL specifico
npm run codex:sync supabase-quick-check.sql

# Quick health check + sync
npm run codex:check

# Full diagnostics + sync
npm run codex:diagnostics

# Esegui file custom
node scripts/codex-sync-db.mjs mio-script.sql
```

---

## 📝 Workflow Completo con Esempi

### Scenario 1: Verificare lo Stato del Database

**Da Codex:**
> "Voglio verificare lo stato del database e fare commit delle modifiche"

**Azioni:**
1. Codex/Tu selezioni: `supabase-quick-check.sql`
2. Task: `🤖 Codex: Quick Health Check + Sync`
3. Risultato automatico:
   - ✅ Health check eseguito su Supabase
   - ✅ Risultati mostrati nel terminale
   - ✅ Commit automatico su GitHub
   - ✅ Deploy triggered su Vercel

---

### Scenario 2: Modificare uno Script SQL

**Da Codex:**
> "Aggiungi un controllo per le subscriptions scadute in supabase-verify-data-integrity.sql"

**Azioni:**
1. Codex modifica il file SQL
2. Salva il file (`Ctrl+S`)
3. Task: `🤖 Codex: Sync Current SQL to Cloud`
4. Risultato automatico:
   - ✅ Nuovo SQL eseguito su Supabase
   - ✅ File modificato committato
   - ✅ Push su GitHub
   - ✅ Vercel rebuild automatico

---

### Scenario 3: Creare Nuovo Script SQL

**Da Codex:**
> "Crea uno script che conta gli eventi per regione e salva su GitHub"

**Azioni:**
1. Codex crea `supabase-events-by-region.sql`
2. Apri il file nuovo
3. Task: `🤖 Codex: Sync Current SQL to Cloud`
4. Risultato automatico:
   - ✅ Script eseguito per test
   - ✅ File aggiunto a Git
   - ✅ Committato + pushed
   - ✅ Disponibile per team

---

## 🎨 Comandi Codex Suggeriti

### Per Verifiche Database
```
"Esegui un health check del database e fai commit"
"Verifica l'integrità dei dati e sincronizza"
"Controlla le performance e salva su GitHub"
```

### Per Modifiche SQL
```
"Modifica supabase-quick-check.sql per aggiungere controllo X e sincronizza"
"Crea uno script per verificare Y e committalo"
"Aggiungi la query Z a supabase-monitor-activity.sql e deploya"
```

### Per Report
```
"Genera un report CSV delle spese per categoria e salvalo"
"Crea uno script per esportare gli eventi dell'ultimo mese"
```

---

## ⚙️ Configurazione Automatica

### File Modificati/Creati

- ✅ **`scripts/codex-sync-db.mjs`** - Script di sincronizzazione automatica
- ✅ **`.vscode/tasks.json`** - Task predefiniti per Codex
- ✅ **`package.json`** - Script npm per CLI

### Task Disponibili

| Task | Descrizione | Uso |
|------|-------------|-----|
| `🤖 Codex: Sync Current SQL to Cloud` | Sync file aperto | File SQL aperto |
| `🤖 Codex: Quick Health Check + Sync` | Health check veloce | Verifica giornaliera |
| `🤖 Codex: Full Diagnostics + Sync` | Diagnostica completa | Troubleshooting |
| `🚀 Codex: Full Pipeline` | Pipeline completo | Deploy completo |

---

## 🔧 Requisiti

### Prerequisiti Obbligatori
- ✅ `.env.local` configurato con credenziali Supabase
- ✅ Git configurato e autenticato
- ✅ Repository collegato a Vercel
- ✅ Node.js >= 18.17.0

### Verifica Configurazione

```bash
# Verifica env
npm run env:verify

# Test connessione DB
npm run db:test

# Verifica Git
git status
```

---

## 🎯 Best Practices

### 1. Prima di Sincronizzare
- ✅ Salva sempre il file (`Ctrl+S`)
- ✅ Verifica che il file SQL sia sintatticamente corretto
- ✅ Controlla di essere sulla branch corretta (`git branch`)

### 2. Durante la Sincronizzazione
- ✅ Monitora l'output del task nel terminale
- ✅ Aspetta la conferma di successo prima di continuare
- ✅ Se errori, leggi i messaggi per capire il problema

### 3. Dopo la Sincronizzazione
- ✅ Verifica su Supabase Dashboard le modifiche DB
- ✅ Controlla GitHub per il nuovo commit
- ✅ Monitora Vercel per il deploy (circa 2-3 minuti)

---

## 🐛 Troubleshooting

### Problema: "File non trovato"
**Soluzione:**
- Verifica che il file SQL esista nella root del progetto
- Usa il path corretto: `supabase-*.sql`

### Problema: "Esecuzione SQL fallita"
**Soluzione:**
- Controlla la sintassi SQL
- Verifica le credenziali in `.env.local`
- Controlla SUPABASE_DB_URL o usa credenziali cloud

### Problema: "Push fallito"
**Soluzione:**
- Verifica autenticazione Git: `git remote -v`
- Fai pull prima: `git pull origin main`
- Controlla conflitti: `git status`

### Problema: "Vercel non deploya"
**Soluzione:**
- Controlla Vercel Dashboard → Deployments
- Verifica webhook GitHub su Vercel Settings
- Controlla build logs per errori

---

## 📊 Monitoring

### Verifica Sync Riuscita

1. **Supabase:**
   - Vai su [app.supabase.com](https://app.supabase.com)
   - Table Editor → verifica dati aggiornati

2. **GitHub:**
   - Vai su repository GitHub
   - Controlla commit recenti
   - Cerca commit con prefisso `auto: sync`

3. **Vercel:**
   - Vai su [vercel.com](https://vercel.com)
   - Dashboard → Deployments
   - Verifica stato "Ready"

---

## 🚀 Workflow Avanzati

### Auto-Commit su Modifica File

Già configurato! Il task `Auto-commit: Watch and push` è attivo e monitora le modifiche.

### Pipeline Completa Custom

Crea un nuovo task in `.vscode/tasks.json`:

```json
{
  "label": "🎯 My Custom Pipeline",
  "dependsOn": [
    "Run SQL: My custom script",
    "Git: Auto-commit once"
  ],
  "dependsOrder": "sequence"
}
```

---

## 📚 Link Utili

- 📖 [Script SQL Reference](./SQL-SCRIPTS-QUICK-REFERENCE.md)
- 🏥 [Guida Verifica Database](./SUPABASE-SQL-VERIFICATION-GUIDE.md)
- 📋 [Indice Script SQL](./SQL-SCRIPTS-INDEX.md)
- 🚀 [Deployment Guide](./DEPLOYMENT-GUIDE.md)

---

## 💡 Tips & Tricks

### Shortcut Veloci

- `Ctrl+Shift+P` → `Tasks: Run Task` → Cerca "Codex"
- Aggiungi keybinding custom in VS Code per task frequenti
- Usa terminale integrato per vedere output in tempo reale

### Comandi Rapidi da Terminale

```bash
# Health check immediato
npm run codex:check

# Diagnostica completa
npm run codex:diagnostics

# Sync file custom
npm run codex:sync mio-file.sql
```

### Automatizzazione Ulteriore

Modifica `scripts/autocommit-watch.mjs` per includere sync automatico:
```javascript
// Auto-esegui verifiche ogni X minuti
setInterval(() => {
  exec('npm run codex:check');
}, 60 * 60 * 1000); // Ogni ora
```

---

## ✅ Checklist Setup Iniziale

- [ ] Installa dipendenze: `npm install`
- [ ] Configura `.env.local` con credenziali Supabase
- [ ] Verifica Git: `git status`
- [ ] Test connessione DB: `npm run db:test`
- [ ] Esegui primo sync: Task → `🤖 Codex: Quick Health Check + Sync`
- [ ] Verifica su Supabase, GitHub, Vercel che tutto funzioni

---

## 🎉 Sei Pronto!

Ora puoi lavorare completamente autonomo da Codex:

1. **Chiedi modifiche a GitHub Copilot** nel pannello Codex
2. **Esegui un task Codex** per sincronizzare
3. **Verifica il risultato** su Supabase/GitHub/Vercel

Tutto automatico! 🚀

---

**Ultimo aggiornamento:** 4 Novembre 2025  
**Versione:** 1.0.0  
**Compatibilità:** VS Code 1.85+, GitHub Copilot extension
