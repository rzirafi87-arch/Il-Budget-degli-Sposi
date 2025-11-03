# 📊 ANALISI LOGICA TIMELINE EVENTI

**Data Analisi:** 3 Novembre 2025  
**Autore:** AI Assistant  
**Scopo:** Verifica coerenza e logica delle timeline SQL per tutti gli eventi

---

## 🎯 EXECUTIVE SUMMARY

### ⚠️ PROBLEMI CRITICI RILEVATI

#### 1. **INCOERENZA NEI MODELLI DI TIMELINE**
Gli eventi utilizzano **DUE SCHEMI SQL DIFFERENTI** per le timeline:

**SCHEMA A - `timeline_items` (Semplice)**
- Usato da: **Baby Shower**
- Campi: `event_id`, `phase`, `title`, `description`, `days_before`, `display_order`, `created_at`
- Pro: Semplice, diretto
- Contro: Non normalizzato, dipendente da UUID hardcoded

**SCHEMA B - `timeline_items` con `due_date` (Data Assoluta)**
- Usato da: **Engagement Party, Gender Reveal, Pensione**
- Campi: `event_id`, `title`, `description`, `due_date`, `category`, `completed`, `display_order`
- Pro: Traccia completamento tasks
- Contro: Date hardcoded con `CURRENT_DATE + INTERVAL`, illogico per eventi storici

**SCHEMA C - `timeline_phases` + `timeline_tasks` (Normalizzato)**
- Usato da: **Anniversario**
- Tabelle: `timeline_phases` (fasi temporali) → `timeline_tasks` (task per fase)
- Pro: Normalizzato, riutilizzabile per event_type
- Contro: Più complesso da gestire

#### 2. **LOGICA DATE ERRATA**
❌ **Problema**: Molti eventi usano `CURRENT_DATE + INTERVAL 'X days'` per calcolare `due_date`
- Engagement Party: `CURRENT_DATE + INTERVAL '30 days'`, `'60 days'`, `'76 days'`, `'83 days'`, `'90 days'`, `'97 days'`
- Gender Reveal: `CURRENT_DATE + INTERVAL '30 days'`, `'20 days'`, `'7 days'`, `'60 days'`, `'67 days'`
- Pensione: `CURRENT_DATE + INTERVAL '30 days'`, `'46 days'`, `'53 days'`, `'60 days'`, `'67 days'`

**Conseguenze:**
- Task che dovrebbero essere "2 mesi prima" sono invece "30 giorni DOPO oggi"
- Timeline incoerenti con la realtà dell'evento
- Impossibile usare per eventi passati o futuri specifici

#### 3. **EVENTI SENZA TIMELINE**
I seguenti eventi **NON hanno timeline SQL**:
- ❌ Battesimo (baptism)
- ❌ Compleanno (birthday)
- ❌ Prima Comunione (communion)
- ❌ Cresima (confirmation)
- ❌ Diciottesimo (eighteenth)
- ❌ Laurea (graduation)
- ❌ Matrimonio (wedding)

---

## 📋 DETTAGLIO PER EVENTO

### ✅ ANNIVERSARIO (Anniversary)
**File:** `supabase-anniversary-event-seed.sql`  
**Schema:** `timeline_phases` + `timeline_tasks` (NORMALIZZATO)  
**Fasi:** 6 (Pianificazione, Fornitori, Rifinitura, Coordinamento, Evento, Post-evento)  
**Task Totali:** ~30+  
**Logica Date:** ✅ Usa `months_before` (logico)  
**Verifica Query:** ✅ Presente  

**Valutazione:** ⭐⭐⭐⭐⭐ ECCELLENTE - Modello da seguire

---

### ✅ BABY SHOWER (Baby Shower)
**File:** `supabase-babyshower-event-seed.sql`  
**Schema:** `timeline_items` con `days_before` + `phase`  
**Fasi:** 6 ("2 mesi prima", "1 mese prima", "2 settimane prima", "1 settimana prima", "Giorno del Baby Shower", "Dopo l'evento")  
**Task Totali:** 36  
**Logica Date:** ✅ Usa `days_before` (campo numerico, corretto)  
**Verifica Query:** ❌ Assente  
**UUID Hardcoded:** `00000000-0000-0000-0000-000000000009`

**Problemi:**
- Dipende da UUID fisso (non dinamico come altri eventi)
- Nessuna query di verifica finale

**Valutazione:** ⭐⭐⭐ BUONO ma da standardizzare

---

### ❌ BATTESIMO (Baptism)
**File:** `supabase-baptism-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ❌ COMPLEANNO (Birthday)
**File:** `supabase-birthday-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ❌ PRIMA COMUNIONE (Communion)
**File:** `supabase-communion-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ❌ CRESIMA (Confirmation)
**File:** `supabase-confirmation-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ❌ DICIOTTESIMO (Eighteenth)
**File:** `supabase-eighteenth-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ⚠️ FESTA DI FIDANZAMENTO (Engagement Party)
**File:** `supabase-engagement-party-seed.sql`  
**Schema:** `timeline_items` con `due_date` assoluta  
**Fasi:** 6 (Idea e Pianificazione, Conferme e Fornitori, Rifinitura, Coordinamento Finale, Giorno della Festa, Chiusura e Ricordi)  
**Task Totali:** 34  
**Logica Date:** ❌ **ERRATA** - Usa `CURRENT_DATE + INTERVAL`  
**Verifica Query:** ✅ Presente  

**Date Problematiche:**
```sql
-- FASE 1: "2-3 mesi prima" ma usa +30 days (1 mese DOPO oggi!)
CURRENT_DATE + INTERVAL '30 days'

-- FASE 2: "1 mese prima" ma usa +60 days (2 mesi DOPO!)
CURRENT_DATE + INTERVAL '60 days'

-- FASE 3: "2 settimane prima" ma usa +76 days (2.5 mesi DOPO!)
CURRENT_DATE + INTERVAL '76 days'

-- FASE 4: "1 settimana prima" ma usa +83 days (quasi 3 mesi DOPO!)
CURRENT_DATE + INTERVAL '83 days'

-- FASE 5: "Giorno della Festa" ma usa +90 days (3 mesi DOPO!)
CURRENT_DATE + INTERVAL '90 days'

-- FASE 6: "Dopo l'evento" ma usa +97 days
CURRENT_DATE + INTERVAL '97 days'
```

**Valutazione:** ⚠️ CRITICO - Logic invertita

---

### ⚠️ GENDER REVEAL
**File:** `supabase-genderreveal-event-seed.sql`  
**Schema:** `timeline_items` con `due_date` assoluta  
**Fasi:** 5 (Ideazione e Pianificazione, Preparativi e Fornitori, Rifinitura e Coordinamento, Giorno del Gender Reveal, Chiusura e Ricordi)  
**Task Totali:** 30  
**Logica Date:** ❌ **ERRATA** - Usa `CURRENT_DATE + INTERVAL`  
**Verifica Query:** ✅ Presente  

**Date Problematiche:**
```sql
-- FASE 1: "1 mese prima" ma usa +30 days (1 mese DOPO!)
CURRENT_DATE + INTERVAL '30 days'

-- FASE 2: "2-3 settimane prima" ma usa +20 days (20 giorni DOPO!)
CURRENT_DATE + INTERVAL '20 days'

-- FASE 3: "1 settimana prima" ma usa +7 days (1 settimana DOPO!)
CURRENT_DATE + INTERVAL '7 days'

-- FASE 4: "Giorno del Gender Reveal" ma usa +60 days (2 mesi DOPO!)
CURRENT_DATE + INTERVAL '60 days'

-- FASE 5: "Dopo l'evento" ma usa +67 days
CURRENT_DATE + INTERVAL '67 days'
```

**Valutazione:** ⚠️ CRITICO - Logic invertita

---

### ❌ LAUREA (Graduation)
**File:** `supabase-graduation-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie

**Valutazione:** ❌ INCOMPLETO

---

### ⚠️ PENSIONAMENTO (Retirement)
**File:** `supabase-pensione-seed.sql`  
**Schema:** `timeline_items` con `due_date` assoluta  
**Fasi:** 6 (Ideazione e Pianificazione, Conferme e Fornitori, Rifinitura, Coordinamento Finale, Giorno dell'Evento, Chiusura e Ricordi)  
**Task Totali:** 34  
**Logica Date:** ❌ **ERRATA** - Usa `CURRENT_DATE + INTERVAL`  
**Verifica Query:** ✅ Presente  

**Date Problematiche:**
```sql
-- FASE 1: "2-3 mesi prima" ma usa +30 days (1 mese DOPO!)
CURRENT_DATE + INTERVAL '30 days'

-- FASE 2: "1 mese prima" ma usa +30 days (stesso problema)
CURRENT_DATE + INTERVAL '30 days'

-- FASE 3: "2 settimane prima" ma usa +46 days (1.5 mesi DOPO!)
CURRENT_DATE + INTERVAL '46 days'

-- FASE 4: "1 settimana prima" ma usa +53 days (quasi 2 mesi DOPO!)
CURRENT_DATE + INTERVAL '53 days'

-- FASE 5: "Giorno dell'Evento" ma usa +60 days (2 mesi DOPO!)
CURRENT_DATE + INTERVAL '60 days'

-- FASE 6: "Dopo l'evento" ma usa +67 days
CURRENT_DATE + INTERVAL '67 days'
```

**Valutazione:** ⚠️ CRITICO - Logic invertita

---

### ❌ MATRIMONIO (Wedding)
**File:** `supabase-wedding-event-seed.sql`  
**Timeline SQL:** ❌ **ASSENTE**  
**Note:** Solo categorie e sottocategorie (evento principale!)

**Valutazione:** ❌ CRITICO - Evento principale senza timeline

---

## 🔧 RACCOMANDAZIONI CORRETTIVE

### 1️⃣ STANDARDIZZARE SCHEMA TIMELINE

**Soluzione Consigliata:** Adottare il modello **Anniversario** per tutti gli eventi

```sql
-- Tabella normalizzata per fasi temporali
CREATE TABLE timeline_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  months_before NUMERIC, -- oppure days_before per eventi brevi
  description TEXT,
  display_order INT,
  UNIQUE(event_type, phase_name)
);

-- Tabella normalizzata per task
CREATE TABLE timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES timeline_phases(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id), -- Link opzionale a categoria
  display_order INT
);
```

**Vantaggi:**
- ✅ Riutilizzabile per tutti gli eventi dello stesso tipo
- ✅ Non dipende da date assolute
- ✅ Facile da clonare e personalizzare per utente
- ✅ Separazione chiara fasi/task

---

### 2️⃣ CORREGGERE LOGICA DATE

**Problema Attuale:**
```sql
-- ❌ SBAGLIATO (task "1 mese prima" è invece 30 giorni DOPO oggi)
due_date = CURRENT_DATE + INTERVAL '30 days'
```

**Soluzioni Possibili:**

**Opzione A - Eliminare `due_date` (CONSIGLIATA)**
```sql
-- ✅ Usa campi relativi invece di date assolute
days_before INT, -- es: 60 = 2 mesi prima
phase TEXT -- es: "2 mesi prima"
```

**Opzione B - Calcolare da event_date (se disponibile)**
```sql
-- ✅ Solo se esiste event_date definita dall'utente
due_date = (SELECT wedding_date FROM events WHERE id = v_event_id) - INTERVAL '60 days'
```

**Opzione C - Lasciare NULL nel seed**
```sql
-- ✅ Popolare due_date solo quando utente definisce data evento
due_date = NULL -- Verrà calcolato lato app quando disponibile
```

---

### 3️⃣ AGGIUNGERE TIMELINE MANCANTI

**Priorità Alta:**
1. **Matrimonio** (wedding) - Evento principale!
2. **Compleanno** (birthday)
3. **Battesimo** (baptism)

**Priorità Media:**
4. Prima Comunione (communion)
5. Cresima (confirmation)
6. Diciottesimo (eighteenth)

**Priorità Bassa:**
7. Laurea (graduation)

---

### 4️⃣ AGGIUNGERE QUERY DI VERIFICA

Tutti i seed devono includere query finale:

```sql
-- VERIFICA FINALE
SELECT 
  e.name AS evento,
  e.event_type,
  COUNT(DISTINCT c.id) AS num_categorie,
  COUNT(DISTINCT s.id) AS num_sottocategorie,
  COUNT(DISTINCT p.id) AS num_fasi_timeline,
  COUNT(DISTINCT t.id) AS num_task_timeline,
  SUM(s.estimated_cost) AS budget_totale_stimato
FROM events e
LEFT JOIN categories c ON c.event_id = e.id
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN timeline_phases p ON p.event_type = e.event_type
LEFT JOIN timeline_tasks t ON t.phase_id = p.id
WHERE e.event_type = 'YOUR_EVENT_TYPE'
GROUP BY e.id, e.name, e.event_type;
```

---

## 📊 MATRICE COMPARATIVA

| Evento | Timeline SQL | Schema Usato | Date Logic | Fasi | Task | Query Verifica |
|--------|--------------|--------------|------------|------|------|----------------|
| **Anniversario** | ✅ | phases+tasks | ✅ months_before | 6 | ~30 | ✅ |
| **Baby Shower** | ✅ | timeline_items | ✅ days_before | 6 | 36 | ❌ |
| **Battesimo** | ❌ | - | - | - | - | ❌ |
| **Compleanno** | ❌ | - | - | - | - | ❌ |
| **Comunione** | ❌ | - | - | - | - | ❌ |
| **Cresima** | ❌ | - | - | - | - | ❌ |
| **Diciottesimo** | ❌ | - | - | - | - | ❌ |
| **Engagement** | ⚠️ | timeline_items | ❌ CURRENT_DATE+ | 6 | 34 | ✅ |
| **Gender Reveal** | ⚠️ | timeline_items | ❌ CURRENT_DATE+ | 5 | 30 | ✅ |
| **Laurea** | ❌ | - | - | - | - | ❌ |
| **Matrimonio** | ❌ | - | - | - | - | ❌ |
| **Pensione** | ⚠️ | timeline_items | ❌ CURRENT_DATE+ | 6 | 34 | ✅ |

**Legenda:**
- ✅ Corretto
- ⚠️ Presente ma con problemi
- ❌ Assente

---

## 🎯 AZIONI IMMEDIATE NECESSARIE

### CRITICO (Da fare subito)
1. ❌ **Correggere logica date** in Engagement Party, Gender Reveal, Pensione
2. ❌ **Aggiungere timeline SQL** per Matrimonio (evento principale!)
3. ❌ **Decidere schema standard** per tutti gli eventi futuri

### ALTA PRIORITÀ (Entro settimana)
4. ❌ Aggiungere timeline per Compleanno
5. ❌ Aggiungere timeline per Battesimo
6. ❌ Aggiungere query verifica in Baby Shower

### MEDIA PRIORITÀ (Entro mese)
7. ❌ Aggiungere timeline per Comunione, Cresima, Diciottesimo
8. ❌ Standardizzare tutti i seed al modello "Anniversario"
9. ❌ Creare migration script per uniformare schema

---

## 💡 SCHEMA PROPOSTO UNIFICATO

```sql
-- =====================================================
-- SCHEMA TIMELINE UNIFICATO (da applicare a tutti gli eventi)
-- =====================================================

-- 1. Tabella fasi (riutilizzabile per event_type)
CREATE TABLE IF NOT EXISTS timeline_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL REFERENCES event_types(slug),
  phase_name TEXT NOT NULL,
  days_before INT, -- Giorni prima dell'evento (es: 60 = 2 mesi)
  description TEXT,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_type, phase_name)
);

-- 2. Tabella task (per fase)
CREATE TABLE IF NOT EXISTS timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES timeline_phases(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  category_name TEXT, -- Nome categoria (non FK per flessibilità)
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indici performance
CREATE INDEX IF NOT EXISTS idx_timeline_phases_event_type ON timeline_phases(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_phase_id ON timeline_tasks(phase_id);

-- 4. RLS Policies (Read-only per tutti, seed gestito da admin)
ALTER TABLE timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tutti possono leggere fasi timeline"
  ON timeline_phases FOR SELECT
  USING (true);

CREATE POLICY "Tutti possono leggere task timeline"
  ON timeline_tasks FOR SELECT
  USING (true);
```

---

## 📝 TEMPLATE SEED SQL STANDARD

```sql
-- =====================================================
-- SEED TIMELINE: [NOME EVENTO]
-- Event Type: [slug]
-- =====================================================

BEGIN;

-- Elimina fasi esistenti (CASCADE elimina anche task)
DELETE FROM timeline_phases WHERE event_type = '[slug]';

-- FASE 1: [Nome Fase]
WITH phase1 AS (
  INSERT INTO timeline_phases (event_type, phase_name, days_before, description, display_order)
  VALUES ('[slug]', '[Nome Fase]', [giorni], '[Descrizione]', 1)
  RETURNING id
)
INSERT INTO timeline_tasks (phase_id, task_name, description, category_name, display_order)
SELECT id, task_name, description, category_name, display_order
FROM phase1
CROSS JOIN (
  VALUES
    ('[Task 1]', '[Descrizione task 1]', '[Categoria]', 1),
    ('[Task 2]', '[Descrizione task 2]', '[Categoria]', 2)
    -- ... altri task
) AS t(task_name, description, category_name, display_order);

-- Ripeti per altre fasi...

COMMIT;

-- VERIFICA FINALE
SELECT 
  '[slug]' as event_type,
  COUNT(DISTINCT p.id) AS num_fasi,
  COUNT(DISTINCT t.id) AS num_task
FROM timeline_phases p
LEFT JOIN timeline_tasks t ON t.phase_id = p.id
WHERE p.event_type = '[slug]';
```

---

## 🏁 CONCLUSIONI

### Stato Attuale: ⚠️ CRITICO

- **3/12 eventi** hanno timeline complete e corrette (25%)
- **3/12 eventi** hanno timeline con logica date errata (25%)
- **6/12 eventi** NON hanno timeline SQL (50%)
- **Schema disomogeneo** rende difficile manutenzione

### Impatto Utente

❌ **Problemi:**
- Timeline non disponibili per eventi principali (matrimonio, battesimo)
- Date illogiche rendono timeline inutilizzabili
- Esperienza utente incoerente tra eventi

✅ **Opportunità:**
- Standardizzando lo schema si facilita manutenzione
- Aggiungendo timeline mancanti si migliora UX
- Correggendo le date si rendono timeline utilizzabili

### Tempo Stimato per Correzioni

- **Critico (3 giorni):** Correggere date + aggiungere timeline Matrimonio
- **Alta priorità (1 settimana):** Timeline Compleanno, Battesimo
- **Standardizzazione completa (2 settimane):** Tutti gli eventi uniformati

---

**Report Generato:** 3 Novembre 2025  
**Prossima Revisione:** Dopo implementazione correzioni
