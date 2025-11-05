# 🎯 Implementazione Priorità 1 - UX Onboarding + Standardizzazione Contenuti

## 📋 Panoramica

Questa guida copre l'implementazione di:

1. **Fix SQL PATCH 16** (owner_id con gestione dipendenze policy)
2. **UX Onboarding senza blocchi** (auto-creazione evento di default)
3. **Schema standardizzato** per Event Types, Categories, Subcategories, Timeline
4. **Seed completo** per contenuti matrimonio

---

## 🔧 Parte 1: Fix SQL PATCH 16 (CRITICAL)

### Problema Originale

```
ERROR: 0A000: cannot alter type of a column used in a policy definition
DETAIL: policy "Users can view their own payment reminders" on table payment_reminders depends on column "owner_id"
```

### Soluzione

Il nuovo file **`supabase-2025-11-events-owner-rls-FIXED.sql`** risolve il problema:

1. **STEP 1**: Drop policy dipendenti su `payment_reminders`
2. **STEP 2**: Backfill `owner_id` NULL con primo utente
3. **STEP 3**: ALTER COLUMN (NOT NULL + DEFAULT)
4. **STEP 4**: Enable RLS su `events`
5. **STEP 5**: Crea policy granulari su `events`
6. **STEP 6**: Ricrea policy su `payment_reminders` (senza `IS NULL`)

### Come Applicare

**Opzione A: SQL Editor (Consigliato)**

1. Vai su https://app.supabase.com → Tuo Progetto → SQL Editor
2. New Query
3. Copia/incolla: `supabase-2025-11-events-owner-rls-FIXED.sql`
4. Run
5. Verifica: nessun errore, tutte le policy create

**Opzione B: Script Automatico**

```bash
# Configura SUPABASE_DB_URL in .env.local
node scripts/codex-sync-db.mjs supabase-2025-11-events-owner-rls-FIXED.sql
```

### Verifica Post-Applicazione

```sql
-- Controlla constraint
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.events'::regclass AND conname LIKE '%owner%';

-- Controlla policy
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'events' OR tablename = 'payment_reminders';

-- Controlla valori NULL
SELECT COUNT(*) FROM public.events WHERE owner_id IS NULL;
-- Dovrebbe restituire: 0
```

---

## 🚀 Parte 2: UX Onboarding Senza Blocchi

### File Creato

**`src/app/actions/ensureEvent.ts`** - Server Action

### Come Funziona

1. Utente autenticato accede a `/dashboard`
2. Server Action `ensureDefaultEvent()` verifica se esiste un evento
3. Se **non esiste**: crea automaticamente un evento starter
4. Se **esiste**: restituisce l'ID evento esistente
5. Dashboard si carica immediatamente con i dati

### Integrazione nelle Pagine

Esempio per `/dashboard/page.tsx`:

```typescript
import { ensureDefaultEvent } from "@/app/actions/ensureEvent";

export default async function DashboardPage() {
  // Garantisce evento di default (auto-crea se necessario)
  const eventId = await ensureDefaultEvent();

  // Ora puoi usare eventId per query dati
  const supabase = getServiceClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("event_id", eventId);

  return (
    <div>
      <h1>Dashboard Evento {eventId}</h1>
      {/* ... render UI ... */}
    </div>
  );
}
```

### Comportamento

| Scenario | Comportamento |
|----------|---------------|
| Primo accesso utente nuovo | Crea evento "Il mio evento" con budget €20.000 |
| Utente già esistente | Ritorna evento esistente (nessuna duplicazione) |
| Utente non autenticato | Throw error "User not authenticated" |

### Parametri Evento Default

```typescript
{
  public_id: "abc12def", // Random 8 char
  owner_id: user.id,
  name: "Il mio evento",
  event_type: "WEDDING",
  event_date: +1 anno da oggi,
  total_budget: 20000,
  bride_initial_budget: 10000,
  groom_initial_budget: 10000,
}
```

---

## 📊 Parte 3: Schema Standardizzato Contenuti

### File Creato

**`supabase-2025-11-event-types-schema.sql`** (PATCH 18)

### Tabelle Create

#### 1. `event_types` (Tipi evento supportati)

```sql
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- WEDDING, BAPTISM, etc.
  name TEXT NOT NULL,
  locale TEXT DEFAULT 'it-IT'
);
```

**Popolata con**:
- WEDDING (Matrimonio)
- BAPTISM (Battesimo)
- COMMUNION (Prima Comunione)
- CONFIRMATION (Cresima)
- GRADUATION (Laurea)
- ANNIVERSARY (Anniversario)
- BABY_SHOWER
- GENDER_REVEAL
- ENGAGEMENT (Fidanzamento)
- PROPOSAL (Proposta)
- BIRTHDAY_18 (Diciottesimo)
- BIRTHDAY_50 (50° Compleanno)
- RETIREMENT (Pensionamento)

#### 2. `categories` (Categorie di spesa)

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY,
  event_type_id UUID REFERENCES event_types(id),
  name TEXT NOT NULL,
  sort INT DEFAULT 0,
  icon TEXT -- Lucide React icon name
);
```

**Esempio Wedding**:
- Location & Catering (MapPin)
- Cerimonia (Church)
- Foto & Video (Camera)
- Sposa (User)
- Sposo (User)
- Intrattenimento (Music)
- Allestimenti (Flower2)
- Partecipazioni & Bomboniere (Gift)
- Auto & Trasporti (Car)
- Anelli & Fedi (Gem)
- Viaggio di Nozze (Plane)

#### 3. `subcategories` (Voci dettagliate)

```sql
CREATE TABLE public.subcategories (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  sort INT DEFAULT 0,
  default_budget NUMERIC(12,2) DEFAULT 0,
  notes TEXT
);
```

**Esempio: Location & Catering**:
- Affitto location (€3.000)
- Catering (€5.000)
- Torta nuziale (€500)
- Open bar (€1.500)
- Servizio sala (€800)

#### 4. `event_category_selection` (Selezione per evento utente)

```sql
CREATE TABLE public.event_category_selection (
  event_id UUID REFERENCES events(id),
  subcategory_id UUID REFERENCES subcategories(id),
  budget NUMERIC(12,2) DEFAULT 0,
  is_selected BOOLEAN DEFAULT true,
  PRIMARY KEY (event_id, subcategory_id)
);
```

**Uso**: Quando utente crea evento, copia tutte subcategories rilevanti in questa tabella per personalizzazione.

#### 5. `event_timelines` (Timeline template standard)

```sql
CREATE TABLE public.event_timelines (
  id UUID PRIMARY KEY,
  event_type_id UUID REFERENCES event_types(id),
  title TEXT NOT NULL,
  description TEXT,
  offset_days INT NOT NULL, -- -365 = 1 anno prima, +30 = 1 mese dopo
  category TEXT, -- PLANNING, CEREMONY, POST_EVENT
  is_critical BOOLEAN DEFAULT false
);
```

**Esempio Wedding Timeline**:
- -365 giorni: "Scegli la data del matrimonio" (CRITICAL)
- -330 giorni: "Scegli location ricevimento" (CRITICAL)
- -270 giorni: "Ordina abito sposa" (CRITICAL)
- -180 giorni: "Ordina partecipazioni" (CRITICAL)
- 0 giorni: "Giorno del matrimonio!" (CRITICAL)
- +30 giorni: "Invia thank-you cards"
- +90 giorni: "Ricevi album fotografico"

#### 6. `user_event_timeline` (Timeline personalizzata utente)

```sql
CREATE TABLE public.user_event_timeline (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  timeline_id UUID REFERENCES event_timelines(id), -- NULL se custom
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);
```

**Uso**: Quando utente crea evento, copia `event_timelines` e calcola `due_date` basandosi su `event_date + offset_days`.

### RLS Policies

- **event_types, categories, subcategories, event_timelines**: Pubblici (SELECT per tutti)
- **event_category_selection**: Privato per owner evento
- **user_event_timeline**: Privato per owner evento

---

## 🌱 Parte 4: Seed Contenuti

### File Creato

**`scripts/seed-event-types.mjs`**

### Come Eseguire

```bash
# Assicurati che .env.local sia configurato
node scripts/seed-event-types.mjs
```

### Cosa Fa

1. **Seed Event Types** (13 tipi evento)
2. **Seed Categories per WEDDING** (11 categorie)
3. **Seed Subcategories per WEDDING** (40+ voci)
4. **Seed Timeline per WEDDING** (15 milestone)

### Output Atteso

```
🌱 Inizio seed Event Types, Categories, Subcategories, Timelines...

📌 Seed Event Types...
   ✅ WEDDING (uuid-123)
   ✅ BAPTISM (uuid-456)
   ... (13 tipi)

📌 Seed Categories e Subcategories per WEDDING...
   ✅ Categoria: Location & Catering (uuid-abc)
      ✅ Affitto location (budget: €3000)
      ✅ Catering (budget: €5000)
      ...
   ✅ Categoria: Cerimonia (uuid-def)
      ✅ Chiesa/Comune (budget: €500)
      ...

📌 Seed Timeline per WEDDING...
   ✅ Scegli la data del matrimonio (365 giorni prima)
   ✅ Scegli location ricevimento (330 giorni prima)
   ...

✅ Seed completato con successo!
🎉 Seed terminato!
```

---

## 📐 Architettura Completa

### Flusso Onboarding Utente

```
1. Utente si registra → auth.users
   ↓
2. Primo accesso /dashboard → ensureDefaultEvent()
   ↓
3. Crea evento in public.events (owner_id, event_type)
   ↓
4. Trigger automatico popola user_event_timeline
   (copia da event_timelines con calcolo due_date)
   ↓
5. Trigger automatico popola event_category_selection
   (copia subcategories con default_budget)
   ↓
6. Dashboard mostra:
   - Budget overview (da event_category_selection)
   - Timeline prossime scadenze (da user_event_timeline)
   - Quick actions
```

### Query Tipo Dashboard

```typescript
// 1. Ottieni evento utente
const { data: event } = await supabase
  .from("events")
  .select("*, event_types(name)")
  .eq("owner_id", user.id)
  .single();

// 2. Ottieni categorie selezionate con spese
const { data: budget } = await supabase
  .from("event_category_selection")
  .select(`
    *,
    subcategories(name, categories(name, icon))
  `)
  .eq("event_id", event.id)
  .eq("is_selected", true)
  .order("subcategories.categories.sort", { ascending: true });

// 3. Ottieni prossime milestone
const { data: milestones } = await supabase
  .from("user_event_timeline")
  .select("*")
  .eq("event_id", event.id)
  .eq("is_completed", false)
  .gte("due_date", new Date().toISOString())
  .order("due_date", { ascending: true })
  .limit(5);
```

---

## ✅ Checklist Implementazione

### SQL Patches

- [ ] Applicare `supabase-2025-11-events-owner-rls-FIXED.sql`
- [ ] Applicare `supabase-2025-11-events-owner-trigger.sql`
- [ ] Applicare `supabase-2025-11-event-types-schema.sql` (PATCH 18)
- [ ] Eseguire seed: `node scripts/seed-event-types.mjs`

### Codice Applicazione

- [x] Server Action `ensureEvent.ts` creato
- [ ] Integrare `ensureDefaultEvent()` in `/dashboard/page.tsx`
- [ ] Integrare in `/budget/page.tsx`
- [ ] Integrare in `/spese/page.tsx`
- [ ] (Opzionale) Creare trigger DB per auto-popolare `user_event_timeline` e `event_category_selection` on evento INSERT

### Testing

- [ ] Test: Nuovo utente accede a dashboard → evento creato automaticamente
- [ ] Test: Utente esistente accede → nessuna duplicazione
- [ ] Test: Query categorie/timeline funzionano correttamente
- [ ] Test: RLS previene accesso cross-user

---

## 🚀 Prossimi Passi Post-Implementazione

### Funzionalità da Sviluppare

1. **Dashboard Redesign**
   - Widget budget per categoria
   - Timeline card con prossime scadenze
   - Progress bar completamento planning

2. **Pagina Timeline**
   - Vista Kanban (To Do, In Progress, Done)
   - Filtra per category (PLANNING, CEREMONY, POST_EVENT)
   - Mark milestone as completed
   - Add custom milestone

3. **Pagina Budget**
   - Tabella categorie/subcategories
   - Toggle is_selected per voce
   - Modifica budget allocato
   - Calcolo automatico totale vs disponibile

4. **Wizard Creazione Evento**
   - Step 1: Seleziona tipo evento (WEDDING, BAPTISM, etc.)
   - Step 2: Nome e data evento
   - Step 3: Budget totale
   - Step 4: Seleziona categorie rilevanti
   - Step 5: Genera timeline automatica

5. **Seed Altri Event Types**
   - BAPTISM: categorie/timeline battesimo
   - GRADUATION: categorie/timeline laurea
   - COMMUNION, CONFIRMATION, ANNIVERSARY, etc.

---

## 📚 Documentazione Correlata

- `AUDIT-IMPLEMENTAZIONI-NOV-2025.md` - Stato implementazioni Priority 0
- `VERCEL-DEPLOYMENT-GUIDE.md` - Guida deployment Vercel
- `.env.example` - Template environment variables
- `CODEX-WORKFLOW-GUIDE.md` - Workflow automatizzato Codex

---

**Data:** 5 Novembre 2025  
**Versione:** 1.0.0  
**Stato:** ✅ Schema + Seed + Server Action implementati, pronti per integrazione
