# 🔧 CORREZIONI TIMELINE - Riepilogo Interventi

**Data:** 3 Novembre 2025  
**Riferimento:** TIMELINE-LOGIC-ANALYSIS.md

---

## ✅ CORREZIONI APPLICATE

### 1️⃣ ENGAGEMENT PARTY (`supabase-engagement-party-seed.sql`)

**Problema:** Logica date invertita con `CURRENT_DATE + INTERVAL`

**Prima:**
```sql
-- ❌ Task "2-3 mesi prima" era +30 days (1 mese DOPO oggi)
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Fissa data e location', '...', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 1);
```

**Dopo:**
```sql
-- ✅ Task "2-3 mesi prima" è 90 giorni PRIMA dell'evento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '2-3 mesi prima', 'Fissa data e location', '...', 90, 'Idea e Pianificazione', false, 1);
```

**Modifiche:**
- ✅ Rimosso campo `due_date` (date assolute)
- ✅ Aggiunto campo `phase` (descrizione fase)
- ✅ Aggiunto campo `days_before` (giorni prima evento)
- ✅ Corretti tutti i 34 task (6 fasi)
- ✅ Valori negativi (-7) per task post-evento

**Mapping Fasi:**
| Fase | Prima (errato) | Dopo (corretto) |
|------|----------------|-----------------|
| 2-3 mesi prima | +30 days | 90 days_before |
| 1 mese prima | +60 days | 30 days_before |
| 2 settimane prima | +76 days | 14 days_before |
| 1 settimana prima | +83 days | 7 days_before |
| Giorno della Festa | +90 days | 0 days_before |
| Dopo l'evento | +97 days | -7 days_before |

---

### 2️⃣ GENDER REVEAL (`supabase-genderreveal-event-seed.sql`)

**Problema:** Stesso problema di Engagement Party

**Prima:**
```sql
-- ❌ Task "1 mese prima" era +30 days (dopo oggi)
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Scegli data e location', '...', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 1);
```

**Dopo:**
```sql
-- ✅ Task "1 mese prima" è 30 giorni PRIMA dell'evento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '1 mese prima', 'Scegli data e location', '...', 30, 'Ideazione e Pianificazione', false, 1);
```

**Modifiche:**
- ✅ Rimosso campo `due_date`
- ✅ Aggiunto campo `phase`
- ✅ Aggiunto campo `days_before`
- ✅ Corretti tutti i 30 task (5 fasi)

**Mapping Fasi:**
| Fase | Prima (errato) | Dopo (corretto) |
|------|----------------|-----------------|
| 1 mese prima | +30 days | 30 days_before |
| 2-3 settimane prima | +20 days | 20 days_before |
| 1 settimana prima | +7 days | 7 days_before |
| Giorno del Gender Reveal | +60 days | 0 days_before |
| Dopo l'evento | +67 days | -7 days_before |

---

### 3️⃣ PENSIONE (`supabase-pensione-seed.sql`)

**Problema:** Stessa logica errata con intervalli ancora più confusi

**Prima:**
```sql
-- ❌ Task "2-3 mesi prima" era +30 days
-- ❌ Task "1 mese prima" era ANCORA +30 days (identico alla fase precedente!)
-- ❌ Task "2 settimane prima" era +46 days
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Scegli data e location', '...', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 1);
```

**Dopo:**
```sql
-- ✅ Timeline logica con progressione corretta
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '2-3 mesi prima', 'Scegli data e location', '...', 90, 'Ideazione e Pianificazione', false, 1);
```

**Modifiche:**
- ✅ Rimosso campo `due_date`
- ✅ Aggiunto campo `phase`
- ✅ Aggiunto campo `days_before`
- ✅ Corretti tutti i 34 task (6 fasi)
- ✅ Risolto bug: Fase 1 e Fase 2 avevano stessa data (+30 days)

**Mapping Fasi:**
| Fase | Prima (errato) | Dopo (corretto) |
|------|----------------|-----------------|
| 2-3 mesi prima | +30 days | 90 days_before |
| 1 mese prima | +30 days ❌ duplicato | 30 days_before |
| 2 settimane prima | +46 days | 14 days_before |
| 1 settimana prima | +53 days | 7 days_before |
| Giorno dell'Evento | +60 days | 0 days_before |
| Dopo l'evento | +67 days | -7 days_before |

---

## 📊 STATISTICHE CORREZIONI

| File | Task Corretti | Fasi | Schema Prima | Schema Dopo |
|------|---------------|------|--------------|-------------|
| `supabase-engagement-party-seed.sql` | 34 | 6 | `due_date` | `phase` + `days_before` |
| `supabase-genderreveal-event-seed.sql` | 30 | 5 | `due_date` | `phase` + `days_before` |
| `supabase-pensione-seed.sql` | 34 | 6 | `due_date` | `phase` + `days_before` |
| **TOTALE** | **98** | **17** | - | - |

---

## 🎯 SCHEMA UNIFORMATO

### Struttura `timeline_items` Corretta

```sql
CREATE TABLE timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,               -- es: "2 mesi prima", "1 settimana prima"
  title TEXT NOT NULL,               -- Nome del task
  description TEXT,                  -- Descrizione dettagliata
  days_before INT NOT NULL,          -- Giorni prima evento (positivo) o dopo (negativo)
  category TEXT,                     -- Categoria task (opzionale)
  completed BOOLEAN DEFAULT false,   -- Stato completamento
  display_order INT NOT NULL,        -- Ordine visualizzazione
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Semantica `days_before`

- **Positivo**: giorni PRIMA dell'evento
  - `90` = 3 mesi prima
  - `30` = 1 mese prima
  - `7` = 1 settimana prima
  - `0` = giorno dell'evento

- **Negativo**: giorni DOPO l'evento
  - `-7` = 1 settimana dopo (follow-up, chiusure, ringraziamenti)

---

## ✅ VANTAGGI DELLA NUOVA LOGICA

### 1. **Date Relative, Non Assolute**
```sql
-- ❌ PRIMA: Data fissa che diventa obsoleta
due_date = '2025-12-03'  -- Valida solo per evento in quella data

-- ✅ DOPO: Offset relativo sempre valido
days_before = 30  -- Sempre "1 mese prima", indipendentemente dalla data evento
```

### 2. **Calcolo Dinamico Lato App**
```typescript
// L'app può calcolare la data effettiva quando disponibile
const eventDate = new Date('2026-06-15');
const taskDate = new Date(eventDate);
taskDate.setDate(taskDate.getDate() - task.days_before);
// taskDate = 2026-05-16 (30 giorni prima del 15 giugno)
```

### 3. **Riutilizzabilità**
- ✅ Stessa timeline per tutti gli utenti che creano stesso tipo evento
- ✅ Non serve rigenerare timeline per ogni nuovo evento
- ✅ Template riutilizzabile

### 4. **Chiarezza Semantica**
```sql
-- Prima (confuso):
category = 'Idea e Pianificazione'
due_date = CURRENT_DATE + INTERVAL '30 days'  -- Cosa significa?

-- Dopo (chiaro):
phase = '2-3 mesi prima'  -- Fase temporale esplicita
days_before = 90          -- Offset numerico preciso
category = 'Idea e Pianificazione'  -- Categoria task
```

---

## 🔍 EVENTI ANCORA DA CORREGGERE

### Timeline SQL Assenti (da creare)
❌ **Matrimonio** (wedding) - PRIORITÀ CRITICA  
❌ Battesimo (baptism)  
❌ Compleanno (birthday)  
❌ Prima Comunione (communion)  
❌ Cresima (confirmation)  
❌ Diciottesimo (eighteenth)  
❌ Laurea (graduation)

### Timeline SQL Corrette
✅ **Anniversario** (anniversary) - Già corretto (schema `timeline_phases` + `timeline_tasks`)  
✅ **Baby Shower** (babyshower) - Già corretto (usa `days_before` + `phase`)  
✅ **Engagement Party** (engagement-party) - ✅ CORRETTO OGGI  
✅ **Gender Reveal** (genderreveal) - ✅ CORRETTO OGGI  
✅ **Pensione** (retirement) - ✅ CORRETTO OGGI

---

## 📝 PROSSIMI PASSI

### 1. Test SQL Corretti
```bash
# Test locale
node scripts/run-sql.mjs supabase-engagement-party-seed.sql
node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
node scripts/run-sql.mjs supabase-pensione-seed.sql

# Verifica conteggi
SELECT 
  e.event_type,
  COUNT(DISTINCT t.id) AS num_timeline_items,
  MIN(t.days_before) AS min_days,
  MAX(t.days_before) AS max_days
FROM events e
JOIN timeline_items t ON t.event_id = e.id
WHERE e.event_type IN ('engagement-party', 'genderreveal', 'retirement')
GROUP BY e.event_type;
```

### 2. Aggiornare Schema Database
Se la colonna `due_date` esiste ancora nella tabella, potrebbe essere necessario:

```sql
-- Backup dati esistenti (se ci sono timeline utente)
-- Eliminare colonna obsoleta
ALTER TABLE timeline_items DROP COLUMN IF EXISTS due_date;

-- Aggiungere nuove colonne se mancanti
ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS phase TEXT;
ALTER TABLE timeline_items ADD COLUMN IF NOT EXISTS days_before INT;
```

### 3. Creare Timeline Mancanti
Priorità:
1. **Matrimonio** (evento principale!)
2. Battesimo
3. Compleanno

Usare template:
```sql
-- FASE 1: [Descrizione fase]
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '[fase]', '[task]', '[descrizione]', [giorni], '[categoria]', false, [ordine]);
```

---

## 🎉 RISULTATI FINALI

### Prima delle Correzioni
- ❌ 3 eventi con timeline completamente sbagliate (98 task errati)
- ❌ Date che indicavano il FUTURO invece del PASSATO
- ❌ Timeline inutilizzabili per pianificazione reale
- ❌ Schema incoerente tra eventi

### Dopo le Correzioni
- ✅ 3 eventi con timeline corrette e logiche
- ✅ Date relative calcolabili dinamicamente
- ✅ Timeline utilizzabili per qualsiasi data evento
- ✅ Schema uniforme e semanticamente chiaro
- ✅ 98 task corretti totali
- ✅ 17 fasi temporali standardizzate

---

**Stato Timeline Progetto:**
- ✅ **5/12 eventi** con timeline SQL corrette (42%)
- ⚠️ **7/12 eventi** senza timeline (58%)
- 🎯 **Prossimo obiettivo:** Creare timeline per Matrimonio (evento core)

---

**Documento generato:** 3 Novembre 2025  
**Autore:** AI Assistant  
**Riferimenti:** TIMELINE-LOGIC-ANALYSIS.md
