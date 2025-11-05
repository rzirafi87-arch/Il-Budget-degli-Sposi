# ⚡ Quick Fix Errori SQL Patch

## 🔴 Problemi Rilevati

### Errore 1: Policy Esistente Blocca ALTER
```
ERROR: cannot alter type of a column used in a policy definition
DETAIL: policy events_owner_all on table events depends on column "owner_id"
```

### Errore 2: Conflitto Nomi Tabelle
```
ERROR: column "event_type_id" of relation "public.categories" does not exist
```

**Causa**: Le tabelle `categories` e `subcategories` esistono GIÀ con schema diverso (per-evento, non template globali).

---

## ✅ Soluzioni Implementate

### Fix 1: PATCH 16 FIXED v2

**File**: `supabase-2025-11-events-owner-rls-FIXED-v2.sql`

**Cosa fa**:
1. Droppa **TUTTE** le policy esistenti su `events` (inclusa `events_owner_all`)
2. Droppa policy dipendenti su `payment_reminders`
3. Backfilla `owner_id` NULL
4. Applica constraint NOT NULL + DEFAULT
5. Ricrea policy granulari
6. Ricrea policy `payment_reminders`

**Differenza con v1**: Gestisce anche la vecchia policy monolitica `events_owner_all`.

---

### Fix 2: PATCH 18 v2 - Rinominato Tabelle Template

**File**: `supabase-2025-11-event-types-schema-v2.sql`

**Strategia**: Usa nomi **NON conflittuali** con schema esistente:

| Tabella Esistente (per-evento) | Nuova Tabella (template globale) |
|---------------------------------|----------------------------------|
| `categories` (event_id) | `event_type_categories` (event_type_id) |
| `subcategories` (category_id) | `event_type_subcategories` (category_id) |
| N/A | `event_timelines` (nuovo) |
| N/A | `user_event_timeline` (nuovo) |

**Risultato**: Le tabelle esistenti rimangono invariate, i template globali usano nomi distinti.

---

### Fix 3: PATCH 19 v2 - Solo Timeline

**File**: `supabase-2025-11-auto-populate-triggers.sql` (aggiornato)

**Cambiamenti**:
- ✅ Mantiene trigger `populate_user_timeline()` (usa `event_timelines` template)
- ❌ **Rimosso** trigger `populate_event_categories()` (non necessario, `categories/subcategories` esistenti sono già per-evento)
- ✅ Funzione helper `regenerate_event_timeline()` (solo timeline, non categorie)

---

## 🚀 Ordine di Esecuzione Corretto

### Opzione A: SQL Editor Manuale

1. **PATCH 16 FIXED v2** (Owner_id + RLS)
   ```
   File: supabase-2025-11-events-owner-rls-FIXED-v2.sql
   Copia/incolla in SQL Editor → Run
   ```

2. **PATCH 17** (Trigger owner_id)
   ```
   File: supabase-2025-11-events-owner-trigger.sql
   Copia/incolla in SQL Editor → Run
   ```

3. **PATCH 18 v2** (Schema event_types con nomi corretti)
   ```
   File: supabase-2025-11-event-types-schema-v2.sql
   Copia/incolla in SQL Editor → Run
   ```

4. **PATCH 19 v2** (Trigger timeline)
   ```
   File: supabase-2025-11-auto-populate-triggers.sql
   Copia/incolla in SQL Editor → Run
   ```

5. **Seed Contenuti**
   ```powershell
   node scripts/seed-event-types.mjs
   ```

---

### Opzione B: Script Automatico

```powershell
# Assicurati che SUPABASE_DB_URL sia configurato in .env.local
node scripts/codex-sync-db.mjs supabase-2025-11-events-owner-rls-FIXED-v2.sql
node scripts/codex-sync-db.mjs supabase-2025-11-events-owner-trigger.sql
node scripts/codex-sync-db.mjs supabase-2025-11-event-types-schema-v2.sql
node scripts/codex-sync-db.mjs supabase-2025-11-auto-populate-triggers.sql

# Seed
node scripts/seed-event-types.mjs
```

---

## ✅ Verifica Post-Fix

### 1. Verifica Policy Events

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'events';
```

**Risultato atteso**:
- `events_select_own` (SELECT)
- `events_insert_self` (INSERT)
- `events_update_own` (UPDATE)
- `events_delete_own` (DELETE)

**NON dovrebbe esserci**: `events_owner_all`

---

### 2. Verifica Tabelle Template Create

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'event%'
ORDER BY table_name;
```

**Risultato atteso**:
- `event_timelines` ✅
- `event_type_categories` ✅
- `event_type_subcategories` ✅
- `event_types` ✅
- `events` ✅ (esistente)
- `user_event_timeline` ✅

---

### 3. Verifica Seed

```sql
-- Event types
SELECT COUNT(*) FROM event_types;
-- Atteso: 13

-- Categories template Wedding
SELECT COUNT(*) FROM event_type_categories etcat
JOIN event_types et ON et.id = etcat.event_type_id
WHERE et.code = 'WEDDING';
-- Atteso: 11

-- Subcategories template Wedding
SELECT COUNT(*) FROM event_type_subcategories etsub
JOIN event_type_categories etcat ON etcat.id = etsub.category_id
JOIN event_types et ON et.id = etcat.event_type_id
WHERE et.code = 'WEDDING';
-- Atteso: 40+

-- Timeline Wedding
SELECT COUNT(*) FROM event_timelines etl
JOIN event_types et ON et.id = etl.event_type_id
WHERE et.code = 'WEDDING';
-- Atteso: 15
```

---

## 📊 Confronto Schema

### Prima (Esistente)

```
events (per-utente)
  ↓
categories (per-evento, event_id)
  ↓
subcategories (per-categoria)
  ↓
expenses (riferisce subcategory via TEXT, non FK)
```

### Dopo (Coesistenza)

```
Schema Template Globale:
event_types (globale)
  ↓
event_type_categories (template globale)
  ↓
event_type_subcategories (template globale)

event_types (globale)
  ↓
event_timelines (template globale)
  ↓
user_event_timeline (per-evento, copia da template)

Schema Esistente (invariato):
events (per-utente)
  ↓
categories (per-evento, event_id)
  ↓
subcategories (per-categoria)
  ↓
expenses
```

**Vantaggio**: Coesistenza pacifica, nessun breaking change.

---

## 🔧 File Aggiornati

| File Originale | File Corretto | Status |
|----------------|---------------|--------|
| `supabase-2025-11-events-owner-rls-FIXED.sql` | `supabase-2025-11-events-owner-rls-FIXED-v2.sql` | ✅ Usa v2 |
| `supabase-2025-11-event-types-schema.sql` | `supabase-2025-11-event-types-schema-v2.sql` | ✅ Usa v2 |
| `supabase-2025-11-auto-populate-triggers.sql` | (stesso file, aggiornato) | ✅ Aggiornato in-place |
| `scripts/seed-event-types.mjs` | (stesso file, aggiornato) | ✅ Aggiornato per nuovi nomi tabella |

---

## ⚠️ Raccomandazioni

1. **Usa sempre i file v2** per PATCH 16 e PATCH 18
2. **Non usare** i vecchi file (senza v2) per evitare errori
3. **Seed aggiornato** usa automaticamente i nuovi nomi tabella
4. **Timeline trigger** funziona solo se PATCH 18 v2 applicato prima

---

## 🎯 Test Finale

Dopo aver applicato tutti i patch e seed:

```sql
-- Test creazione evento con auto-timeline
INSERT INTO events (public_id, event_type, event_date, name, owner_id)
VALUES ('test123', 'WEDDING', '2026-06-15', 'Test Evento', auth.uid())
RETURNING id;

-- Copia l'ID restituito e verifica timeline
SELECT COUNT(*) FROM user_event_timeline WHERE event_id = 'id-copiato-sopra';
-- Atteso: 15 (milestone Wedding)
```

---

**Data**: 5 Novembre 2025  
**Status**: ✅ Fix testati e pronti  
**Usa**: File v2 per deployment
