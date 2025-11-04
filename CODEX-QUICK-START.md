# 🚀 Quick Start: Workflow Codex

## ⚡ In 3 Minuti

### Passo 1: Verifica Setup ✅
```bash
# Controlla che tutto sia configurato
npm run env:verify
git status
```

### Passo 2: Primo Sync 🔄
1. Apri file: `supabase-quick-check.sql`
2. Premi: `Ctrl+Shift+P`
3. Digita: `Tasks: Run Task`
4. Seleziona: **`🤖 Codex: Quick Health Check + Sync`**
5. Guarda il terminale: vedrai il processo completo!

### Passo 3: Verifica Risultato ✨
- 🌐 **Supabase**: [app.supabase.com](https://app.supabase.com) → Verifica DB
- 📦 **GitHub**: Nuovo commit con prefisso `auto: sync`
- 🚀 **Vercel**: Deploy automatico in ~2 min

---

## 📝 Workflow Quotidiano

### Da Codex (Pannello Chat)

**Tu chiedi:**
> "Verifica lo stato del database"

**Copilot risponde e poi tu:**
1. Task: `🤖 Codex: Quick Health Check + Sync`
2. ✅ Fatto! Tutto sincronizzato automaticamente

---

**Tu chiedi:**
> "Aggiungi un controllo per subscriptions scadute in supabase-verify-data-integrity.sql"

**Copilot modifica il file, poi tu:**
1. Salva: `Ctrl+S`
2. Task: `🤖 Codex: Sync Current SQL to Cloud`
3. ✅ Modifiche deployate!

---

## 🎯 Task Principali

| Cosa Vuoi Fare | Task da Eseguire |
|----------------|------------------|
| Verificare DB | `🤖 Codex: Quick Health Check + Sync` |
| Diagnostica completa | `🤖 Codex: Full Diagnostics + Sync` |
| Sync file aperto | `🤖 Codex: Sync Current SQL to Cloud` |
| Deploy completo | `🚀 Codex: Full Pipeline` |

---

## 🔑 Comandi da Ricordare

```bash
# Terminale rapido
npm run codex:check           # Health check + sync
npm run codex:diagnostics     # Full diagnostics + sync
npm run codex:sync file.sql   # Sync file specifico
```

---

## ✅ Checklist

Prima di iniziare:
- [ ] `.env.local` configurato
- [ ] Git autenticato (`git status` funziona)
- [ ] Vercel collegato al repo
- [ ] Primo test eseguito con successo

---

## 🆘 SOS

**Problema comune:** "Task non trovato"
- Soluzione: Ricarica VS Code (`Ctrl+Shift+P` → `Reload Window`)

**Problema:** "Push fallito"
- Soluzione: `git pull origin main` poi riprova

**Problema:** "SQL error"
- Soluzione: Controlla `.env.local` → SUPABASE_DB_URL

---

## 📚 Approfondimenti

- 📖 [Guida Completa Codex](./CODEX-WORKFLOW-GUIDE.md)
- 🏥 [Script SQL Reference](./SQL-SCRIPTS-QUICK-REFERENCE.md)

---

**Sei pronto! Inizia a lavorare da Codex! 🎉**
