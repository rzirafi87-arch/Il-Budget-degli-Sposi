# 🌍 Guida Migrazione i18n per Database Locale

## 📋 Panoramica

Questa guida ti accompagna passo-passo nell'allineare il database PostgreSQL locale allo schema Cloud con supporto per traduzioni multilingua (IT/EN/ES/JP).

---

## 🎯 Cosa Fa la Migrazione

La migrazione `supabase-local-migration-i18n.sql` trasforma il tuo schema locale da:

**PRIMA (schema event-centric):**
```
categories:
  - event_id (riferimento a events)
  - name (testo fisso in italiano)

subcategories:
  - category_id
  - name (testo fisso in italiano)
```

**DOPO (schema event-type + i18n):**
```
event_types:
  - code (WEDDING, BIRTHDAY, etc.)

categories:
  - event_type_id (riferimento a event_types)
  - event_id (rimane temporaneamente)
  - sort, icon

category_translations:
  - category_id
  - locale (it-IT, en-GB, es-ES, ja-JP)
  - name

subcategory_translations:
  - subcategory_id
  - locale
  - name

event_timelines + event_timeline_translations:
  - milestone per tipo evento con traduzioni
```

---

## ✅ Pre-requisiti

1. **Docker PostgreSQL locale in esecuzione:**
   ```powershell
   npm run db:up
   ```

2. **Backup del database locale:**
   ```powershell
   docker exec -it il-budget-degli-sposi-db-1 pg_dump -U postgres ibds > backup_locale_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
   ```

3. **Verifica connessione locale:**
   ```powershell
   npm run db:test
   ```

---

## 🚀 Esecuzione Migrazione

### Opzione A: Via Task VS Code (Consigliato)

1. Apri `supabase-local-migration-i18n.sql` in VS Code
2. Premi `Ctrl+Shift+P` → `Tasks: Run Task`
3. Seleziona: **`Run SQL: Current File (local PG)`**
4. Monitora l'output nel terminale

### Opzione B: Via npm script

```powershell
$env:SUPABASE_DB_URL="postgres://postgres:postgres@localhost:5433/ibds"
npm run sql:exec supabase-local-migration-i18n.sql
```

### Opzione C: Via psql diretto

```powershell
docker exec -i il-budget-degli-sposi-db-1 psql -U postgres -d ibds < supabase-local-migration-i18n.sql
```

---

## 📊 Cosa Succede Durante la Migrazione

Lo script esegue (in ordine sicuro):

1. ✅ Crea tabelle i18n: `i18n_locales`, `geo_countries`
2. ✅ Crea `event_types` (se mancante)
3. ✅ Crea tabelle traduzioni: `event_type_translations`, `event_type_variants`
4. ✅ Aggiunge colonne a `categories`: `event_type_id`, `sort`, `icon`
5. ✅ Crea `category_translations`
6. ✅ Aggiunge colonne a `subcategories`: `sort`, `default_budget`, `notes`
7. ✅ Crea `subcategory_translations`
8. ✅ Crea `event_timelines` + `event_timeline_translations`
9. ✅ Crea indici per performance
10. ✅ Aggiunge commenti di documentazione

**IMPORTANTE:** La colonna `event_id` in `categories` **NON viene rimossa automaticamente**. Questo ti permette di migrare i dati esistenti manualmente con calma.

---

## 🔧 Passo-Passo Post-Migrazione

### 1. Verifica tabelle create

```powershell
docker exec -it il-budget-degli-sposi-db-1 psql -U postgres -d ibds -c "\dt public.*i18n*"
docker exec -it il-budget-degli-sposi-db-1 psql -U postgres -d ibds -c "\dt public.*translation*"
```

Dovresti vedere:
- `i18n_locales`
- `category_translations`
- `subcategory_translations`
- `event_timeline_translations`

### 2. Popola locale e event_types di base

Esegui il seed (che popola anche le tabelle i18n):

```powershell
npm run seed:i18n
```

Questo crea:
- Locales: `it-IT`, `en-GB`, `es-ES`, `ja-JP`
- Countries: `IT`, `MX`, `GB`, `US`, `JP`
- Event type `WEDDING` con traduzioni IT/EN
- Categorie e sottocategorie per WEDDING con traduzioni IT/EN
- Timeline WEDDING con traduzioni IT/EN

### 3. (Opzionale) Migra dati esistenti in categories

Se hai già categorie con `event_id` e vuoi mantenerle:

```sql
-- a) Assicurati che event_types contenga WEDDING
INSERT INTO event_types (code, name, locale, active)
VALUES ('WEDDING', 'Matrimonio', 'it-IT', true)
ON CONFLICT (code) DO NOTHING;

-- b) Associa categorie esistenti a WEDDING
UPDATE categories
SET event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING' LIMIT 1)
WHERE event_type_id IS NULL;

-- c) Migra nomi italiani in category_translations
INSERT INTO category_translations (category_id, locale, name)
SELECT id, 'it-IT', name FROM categories
ON CONFLICT DO NOTHING;

-- d) Stessa cosa per subcategories
INSERT INTO subcategory_translations (subcategory_id, locale, name)
SELECT id, 'it-IT', name FROM subcategories
ON CONFLICT DO NOTHING;
```

Esegui via SQL Editor o salvando in un file `migrate-existing-data.sql` e usando:

```powershell
$env:SUPABASE_DB_URL="postgres://postgres:postgres@localhost:5433/ibds"
npm run sql:exec migrate-existing-data.sql
```

### 4. (Opzionale) Rimuovi event_id quando tutto funziona

Una volta verificato che tutto va con `event_type_id`:

```sql
-- ATTENZIONE: Esegui solo dopo aver verificato che l'app funzioni con event_type_id
ALTER TABLE categories DROP COLUMN event_id;
```

---

## 🧪 Test e Verifica

### Query di test per verificare traduzioni

```sql
-- 1. Verifica locales
SELECT * FROM i18n_locales;

-- 2. Verifica event_types con traduzioni
SELECT
  et.code,
  ett_it.name AS nome_it,
  ett_en.name AS nome_en
FROM event_types et
LEFT JOIN event_type_translations ett_it ON ett_it.event_type_id = et.id AND ett_it.locale = 'it-IT'
LEFT JOIN event_type_translations ett_en ON ett_en.event_type_id = et.id AND ett_en.locale = 'en-GB'
WHERE et.code = 'WEDDING';

-- 3. Verifica categorie con traduzioni (fallback IT→EN)
WITH et AS (SELECT id FROM event_types WHERE code = 'WEDDING')
SELECT
  c.id,
  COALESCE(ct_it.name, ct_en.name) AS nome,
  c.sort
FROM categories c
LEFT JOIN category_translations ct_it ON ct_it.category_id = c.id AND ct_it.locale = 'it-IT'
LEFT JOIN category_translations ct_en ON ct_en.category_id = c.id AND ct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM et)
ORDER BY c.sort;

-- 4. Verifica sottocategorie con traduzioni
SELECT
  sc.id,
  c.id AS category_id,
  COALESCE(sct_it.name, sct_en.name) AS nome,
  sc.sort
FROM subcategories sc
JOIN categories c ON c.id = sc.category_id
LEFT JOIN subcategory_translations sct_it ON sct_it.subcategory_id = sc.id AND sct_it.locale = 'it-IT'
LEFT JOIN subcategory_translations sct_en ON sct_en.subcategory_id = sc.id AND sct_en.locale = 'en-GB'
WHERE c.event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING')
ORDER BY c.sort, sc.sort
LIMIT 20;

-- 5. Verifica timeline con traduzioni
SELECT
  tl.key,
  tl.offset_days,
  COALESCE(tlt_it.title, tlt_en.title) AS titolo,
  COALESCE(tlt_it.description, tlt_en.description) AS descrizione
FROM event_timelines tl
LEFT JOIN event_timeline_translations tlt_it ON tlt_it.timeline_id = tl.id AND tlt_it.locale = 'it-IT'
LEFT JOIN event_timeline_translations tlt_en ON tlt_en.timeline_id = tl.id AND tlt_en.locale = 'en-GB'
WHERE tl.event_type_id = (SELECT id FROM event_types WHERE code = 'WEDDING')
ORDER BY tl.offset_days;
```

Salva queste query in `test-i18n-local.sql` ed eseguile:

```powershell
$env:SUPABASE_DB_URL="postgres://postgres:postgres@localhost:5433/ibds"
npm run sql:exec test-i18n-local.sql
```

---

## 🔄 Rollback (Se Necessario)

Se qualcosa va storto, ripristina il backup:

```powershell
# 1. Ferma il DB
npm run db:down

# 2. Riavvia
npm run db:up

# 3. Ripristina backup
docker exec -i il-budget-degli-sposi-db-1 psql -U postgres -d ibds < backup_locale_20251106_xxxxxx.sql
```

Oppure esegui il rollback manuale documentato alla fine di `supabase-local-migration-i18n.sql`.

---

## 📚 File Correlati

- **Schema migrazione**: `supabase-local-migration-i18n.sql`
- **Schema i18n Cloud**: `supabase-i18n-tables.sql`
- **Seed IT/EN**: `scripts/seed_i18n.ts`
- **Esempi fallback**: `supabase-i18n-fallback-examples.sql`

---

## 🎉 Prossimi Passi

Dopo la migrazione locale e il seed:

1. ✅ Modifica l'app per leggere da `category_translations` invece di `categories.name`
2. ✅ Implementa il selettore lingua nell'UI
3. ✅ Estendi il seed per altri tipi evento (BIRTHDAY, BABY_SHOWER, etc.)
4. ✅ Testa il fallback IT→EN in produzione

---

**Ultimo aggiornamento:** 6 Novembre 2025
**Versione:** 1.0.0
**Compatibilità:** PostgreSQL 14+, Supabase
