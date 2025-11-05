# ⚡ Quick Start - Applicazione Patch Priority 0 & 1

## 🎯 Obiettivo

Applicare tutti i patch SQL e seed in 5 minuti.

---

## 📋 Prerequisiti

- ✅ Account Supabase con progetto attivo
- ✅ `.env.local` configurato con credenziali Supabase
- ✅ Node.js >= 18.17.0

---

## 🚀 Opzione A: SQL Editor Manuale (5 minuti)

### 1. Vai su Supabase SQL Editor

https://app.supabase.com → Il tuo progetto → SQL Editor → New Query

### 2. Copia/Incolla ed Esegui in Ordine

#### ① PATCH 16 FIXED (Owner_id + RLS)

```
Apri: supabase-2025-11-events-owner-rls-FIXED.sql
Copia tutto → Incolla in SQL Editor → Run
```

✅ **Verifica**: Nessun errore, policy create su `events` e `payment_reminders`

---

#### ② PATCH 17 (Trigger Owner_id)

```
Apri: supabase-2025-11-events-owner-trigger.sql
Copia tutto → Incolla in SQL Editor → Run
```

✅ **Verifica**: Funzione `set_owner_id()` e trigger creati

---

#### ③ PATCH 18 (Schema Event Types)

```
Apri: supabase-2025-11-event-types-schema.sql
Copia tutto → Incolla in SQL Editor → Run
```

✅ **Verifica**: 6 tabelle create (event_types, categories, subcategories, event_timelines, event_category_selection, user_event_timeline)

---

#### ④ PATCH 19 (Trigger Auto-Popolazione)

```
Apri: supabase-2025-11-auto-populate-triggers.sql
Copia tutto → Incolla in SQL Editor → Run
```

✅ **Verifica**: 2 funzioni trigger create (`populate_user_timeline`, `populate_event_categories`)

---

### 3. Esegui Seed Contenuti

```powershell
node scripts/seed-event-types.mjs
```

✅ **Verifica Output**:
```
✅ WEDDING (uuid-123)
✅ Categoria: Location & Catering
   ✅ Affitto location (budget: €3000)
   ... (40+ voci totali)
✅ Scegli la data del matrimonio (365 giorni prima)
   ... (15 milestone totali)
```

---

## 🚀 Opzione B: Script Automatico (2 minuti)

### 1. Configura Database URL

Aggiungi in `.env.local`:

```env
# Direct connection string (trova su Supabase Dashboard → Settings → Database)
SUPABASE_DB_URL=postgres://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

### 2. Esegui Tutti i Patch in Sequenza

```powershell
node scripts/codex-sync-db.mjs supabase-2025-11-events-owner-rls-FIXED.sql
node scripts/codex-sync-db.mjs supabase-2025-11-events-owner-trigger.sql
node scripts/codex-sync-db.mjs supabase-2025-11-event-types-schema.sql
node scripts/codex-sync-db.mjs supabase-2025-11-auto-populate-triggers.sql
```

### 3. Esegui Seed

```powershell
node scripts/seed-event-types.mjs
```

---

## ✅ Verifica Finale

### Query SQL di Verifica

Esegui su Supabase SQL Editor:

```sql
-- 1. Verifica owner_id constraint
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'owner_id';
-- Risultato atteso: is_nullable = 'NO', column_default contiene 'auth.uid()'

-- 2. Verifica policy RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('events', 'payment_reminders');
-- Risultato atteso: 6 policy totali (4 su events, 2 su payment_reminders)

-- 3. Verifica event_types popolati
SELECT COUNT(*) FROM event_types;
-- Risultato atteso: 13

-- 4. Verifica categories Wedding
SELECT COUNT(*) FROM categories c
JOIN event_types et ON et.id = c.event_type_id
WHERE et.code = 'WEDDING';
-- Risultato atteso: 11

-- 5. Verifica subcategories Wedding
SELECT COUNT(*) FROM subcategories s
JOIN categories c ON c.id = s.category_id
JOIN event_types et ON et.id = c.event_type_id
WHERE et.code = 'WEDDING';
-- Risultato atteso: 40+

-- 6. Verifica timeline Wedding
SELECT COUNT(*) FROM event_timelines et_timeline
JOIN event_types et ON et.id = et_timeline.event_type_id
WHERE et.code = 'WEDDING';
-- Risultato atteso: 15
```

---

## 🧪 Test Funzionalità

### Test 1: Auto-Creazione Evento

1. Crea utente test su Supabase → Authentication → Add User
2. Login con quell'utente nell'app
3. Vai su `/dashboard`
4. **Atteso**: Evento "Il mio evento" creato automaticamente

### Test 2: Verifica Auto-Popolazione

```sql
-- Dopo aver creato l'evento (sostituisci con ID reale)
SELECT 
  (SELECT COUNT(*) FROM user_event_timeline WHERE event_id = 'event-id-here') AS timeline_count,
  (SELECT COUNT(*) FROM event_category_selection WHERE event_id = 'event-id-here') AS categories_count;

-- Risultato atteso:
-- timeline_count: 15
-- categories_count: 40+
```

---

## 📊 Riepilogo Patch

| Patch | File | Cosa Fa | Tempo |
|-------|------|---------|-------|
| 16 FIXED | `supabase-2025-11-events-owner-rls-FIXED.sql` | Fix owner_id + RLS con gestione dipendenze | ~1 min |
| 17 | `supabase-2025-11-events-owner-trigger.sql` | Trigger auto owner_id | ~30 sec |
| 18 | `supabase-2025-11-event-types-schema.sql` | Schema event_types/categories/timeline | ~2 min |
| 19 | `supabase-2025-11-auto-populate-triggers.sql` | Trigger auto timeline/categorie | ~1 min |
| Seed | `scripts/seed-event-types.mjs` | Popola dati Wedding | ~30 sec |

**Totale**: ~5 minuti

---

## ❌ Troubleshooting

### Errore: "cannot alter type of a column used in a policy"

✅ **Soluzione**: Usa `supabase-2025-11-events-owner-rls-FIXED.sql` invece di `supabase-2025-11-events-owner-rls.sql`. Il file FIXED gestisce le dipendenze policy.

### Errore: "ENOTFOUND db.xxx.supabase.co"

✅ **Soluzione Opzione A**: Database in pausa, riattivalo su Supabase Dashboard  
✅ **Soluzione Opzione B**: Usa SQL Editor manuale invece dello script

### Seed non trova event_types

✅ **Soluzione**: Applica PATCH 18 prima di eseguire seed

---

## 🎉 Fatto!

Se tutte le verifiche passano, hai completato l'implementazione Priority 0 & 1! 🚀

**Prossimi Step**:
1. Integra `ensureDefaultEvent()` in `/dashboard/page.tsx`
2. Testa UX onboarding con nuovo utente
3. Sviluppa UI per timeline/budget (vedi `PRIORITY-1-IMPLEMENTATION-GUIDE.md`)

---

**Per supporto completo**: Consulta `INIZIA-QUI-PRIORITY-1.md` e `IMPLEMENTAZIONI-COMPLETE-SUMMARY.md`
