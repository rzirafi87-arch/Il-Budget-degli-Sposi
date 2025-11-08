# 🔍 Guida Verifica Patches 2025-11

## 📋 Panoramica

Questa guida ti aiuta a verificare se i 4 patches critici (PATCH 16-19) sono stati applicati correttamente su Supabase Cloud.

---

## 🚀 Metodo 1: Script Automatico (Consigliato)

### Prerequisiti

1. **Configura password database in `.env.local`**:

   Apri `.env.local` e trova la riga:
   ```bash
   SUPABASE_DB_URL=postgresql://postgres.vsguhivizuneylqhygfk:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

2. **Ottieni la password da Supabase Dashboard**:
   - Vai su [Supabase Dashboard](https://app.supabase.com)
   - Seleziona il tuo progetto
   - **Settings → Database**
   - Nella sezione "Connection string", clicca su "URI"
   - Copia la stringa completa (include la password)
   - Sostituisci `[PASSWORD]` in `.env.local`

3. **Esegui verifica**:
   ```bash
   npm run verify:patches
   ```

### Output Atteso

Se tutti i patches sono applicati:
```
✅ TUTTI I PATCHES 2025-11 SONO APPLICATI CORRETTAMENTE!
```

Se mancano patches:
```
⚠️ ALCUNI PATCHES NON SONO APPLICATI

Patches da applicare in ordine:
  1. supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql
  2. supabase-2025-11-events-owner-trigger.sql
  3. supabase-2025-11-event-types-schema-v2.sql
  4. supabase-2025-11-auto-populate-triggers.sql
```

---

## 🔧 Metodo 2: SQL Editor Manuale

Se preferisci verificare manualmente:

### Step 1: Apri SQL Editor

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. **SQL Editor → New Query**

### Step 2: Esegui Script di Verifica

Copia/incolla il contenuto di `supabase-verify-2025-11-patches.sql` e clicca **Run**.

### Step 3: Leggi i Risultati

Lo script eseguirà 15 controlli e mostrerà:
- ✅ PASS - Check superato
- ❌ FAIL - Check fallito

---

## 📊 Cosa Verifica lo Script

### PATCH 16: owner_id NOT NULL + RLS
- ✅ Colonna `owner_id` è NOT NULL
- ✅ RLS abilitato su tabella `events`
- ✅ 4 policy RLS create (SELECT, INSERT, UPDATE, DELETE)

### PATCH 17: Trigger Auto-popolazione owner_id
- ✅ Funzione `set_owner_id_from_jwt()` esiste
- ✅ Trigger `trg_set_owner_id` configurato

### PATCH 18: Schema Event Types
- ✅ Tabella `event_types` creata
- ✅ Colonna `type_id` aggiunta a `categories`
- ✅ Tabella `timeline_items` creata
- ✅ Colonne `display_order`, `estimated_cost` aggiunte

### PATCH 19: Trigger Auto-popolazione Timeline/Categorie
- ✅ Funzione `auto_populate_event_data()` esiste
- ✅ Trigger `trg_auto_populate_event` configurato

---

## 🛠️ Come Applicare Patches Mancanti

### Opzione A: VS Code Task (Raccomandato)

1. Apri il file SQL del patch (es. `supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql`)
2. Premi `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
3. Seleziona: **Tasks: Run Task**
4. Scegli: **🤖 Codex: Sync Current SQL to Cloud**

Ripeti per tutti i patches nell'ordine corretto.

### Opzione B: Supabase Dashboard

1. Apri [Supabase Dashboard](https://app.supabase.com)
2. **SQL Editor → New Query**
3. Copia/incolla contenuto del file patch
4. Clicca **Run**
5. Verifica nessun errore

Esegui i 4 patches in questo ordine:
1. `supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql`
2. `supabase-2025-11-events-owner-trigger.sql`
3. `supabase-2025-11-event-types-schema-v2.sql`
4. `supabase-2025-11-auto-populate-triggers.sql`

### Opzione C: Terminale

```bash
# Sync singolo patch
npm run codex:sync supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql

# O esegui tutti in sequenza
npm run codex:sync supabase-2025-11-events-owner-rls-FIXED-v4-COMPLETO.sql && \
npm run codex:sync supabase-2025-11-events-owner-trigger.sql && \
npm run codex:sync supabase-2025-11-event-types-schema-v2.sql && \
npm run codex:sync supabase-2025-11-auto-populate-triggers.sql
```

---

## ⚠️ Troubleshooting

### Errore: "Tenant or user not found"
**Causa**: Password database non configurata in `.env.local`
**Soluzione**: Segui "Prerequisiti" sopra per configurare `SUPABASE_DB_URL` con password

### Errore: "cannot alter type of a column used in a policy"
**Causa**: PATCH 16 vecchio (non v4-COMPLETO) applicato
**Soluzione**: Usa la versione `FIXED-v4-COMPLETO` che gestisce le dipendenze

### Script restituisce tutti ❌ FAIL
**Causa**: Nessun patch applicato
**Soluzione**: Applica tutti i 4 patches nell'ordine indicato

### Alcuni checks PASS, altri FAIL
**Causa**: Patches applicati parzialmente
**Soluzione**: Applica solo i patches mancanti, nell'ordine corretto

---

## 📝 Note Importanti

- ✅ Lo script di verifica è **READ-ONLY** (non modifica il database)
- ✅ Puoi eseguirlo quante volte vuoi senza rischi
- ✅ Patches sono **idempotenti** (puoi ri-eseguirli se necessario)
- ⚠️ Applica patches **nell'ordine indicato** (16 → 17 → 18 → 19)
- ⚠️ **PATCH 16**: usa solo la versione `v4-COMPLETO`, non le versioni precedenti

---

## 🎯 Comandi Rapidi

```bash
# Verifica patches
npm run verify:patches

# Sync patch specifico
npm run codex:sync <file-patch.sql>

# Health check database
npm run codex:check

# Diagnostica completa
npm run codex:diagnostics
```

---

## 📚 File Correlati

- `supabase-verify-2025-11-patches.sql` - Script SQL di verifica
- `scripts/verify-2025-11-patches.mjs` - Script Node.js automatico
- `supabase-2025-11-*.sql` - Files patches da applicare
- `PRIORITY-1-IMPLEMENTATION-GUIDE.md` - Guida completa implementazione

---

**Ultimo aggiornamento**: 6 Novembre 2025
**Versione**: 1.0.0
