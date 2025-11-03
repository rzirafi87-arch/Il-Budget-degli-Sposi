# 🎉 GENDER REVEAL - GUIDA AL SETUP

> **Evento:** Gender Reveal  
> **Tipo evento:** `genderreveal`  
> **Versione:** 1.0  
> **Data:** 3 novembre 2025

---

## 📖 INDICE

1. [Panoramica](#panoramica)
2. [Requisiti Preliminari](#requisiti-preliminari)
3. [Setup Database](#setup-database)
4. [Configurazione App](#configurazione-app)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 PANORAMICA

Il **Gender Reveal** è un evento completo per la rivelazione del sesso del bambino, con:

- **10 categorie** di spesa (Location, Rivelazione, Catering, Inviti, Foto, Intrattenimento, Regali, Beauty, Trasporti, Budget)
- **54 sottocategorie** dettagliate
- **30 voci di timeline** suddivise in 5 fasi
- **Budget stimato:** €3.500 - €12.000
- **Stile:** Natural Chic / La Trama

---

## ✅ REQUISITI PRELIMINARI

### Database
- Supabase project attivo
- Schema base presente: `events`, `categories`, `subcategories`, `timeline_items`
- SQL Script: `supabase-COMPLETE-SETUP.sql` già eseguito

### App
- Next.js 16+ (App Router)
- React 19+
- Supabase JS Client 2.76.1+
- File `.env.local` configurato:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE=your_service_role
  ```

---

## 🗄️ SETUP DATABASE

### Opzione 1: Supabase SQL Editor (Consigliato)

1. **Accedi a Supabase Dashboard**
   - Vai su [https://app.supabase.com](https://app.supabase.com)
   - Seleziona il tuo progetto

2. **Apri SQL Editor**
   - Menu laterale → SQL Editor → New query

3. **Esegui il seed**
   ```sql
   -- Copia e incolla il contenuto di:
   -- supabase-genderreveal-event-seed.sql
   ```

4. **Verifica successo**
   ```sql
   -- Query di verifica
   SELECT 
     e.name AS evento,
     e.event_type,
     COUNT(DISTINCT c.id) AS num_categorie,
     COUNT(DISTINCT s.id) AS num_sottocategorie,
     COUNT(DISTINCT t.id) AS num_timeline_items,
     SUM(s.estimated_cost) AS budget_totale_stimato
   FROM events e
   LEFT JOIN categories c ON c.event_id = e.id
   LEFT JOIN subcategories s ON s.category_id = c.id
   LEFT JOIN timeline_items t ON t.event_id = e.id
   WHERE e.event_type = 'genderreveal'
   GROUP BY e.id, e.name, e.event_type;
   ```

   **Output atteso:**
   ```
   evento         | event_type   | num_categorie | num_sottocategorie | num_timeline_items | budget_totale_stimato
   Gender Reveal  | genderreveal | 10            | 54                 | 30                 | 11440.00
   ```

---

### Opzione 2: Script Node.js (Locale o Cloud)

#### A. Database Locale (PostgreSQL Docker)

```powershell
# Assicurati che Docker sia attivo e database locale running
docker-compose up -d

# Esegui il seed
node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
```

**Variabile ambiente richiesta:**
```env
SUPABASE_DB_URL=postgres://postgres:postgres@localhost:5433/ibds
```

#### B. Database Cloud (Supabase)

```powershell
# Usa il task VS Code o comando diretto
node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
```

**Variabile ambiente richiesta:**
```env
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

---

### Opzione 3: VS Code Tasks

Se hai configurato i task in `.vscode/tasks.json`:

1. **Menu VS Code:** Terminal → Run Task
2. Scegli:
   - `Run SQL: Current File (local PG)` (se file aperto è il seed)
   - `Run SQL: Current File (Supabase Cloud)`

---

## 🎨 CONFIGURAZIONE APP

### 1. Verifica Event Type

Il tipo evento è già definito nello schema. Assicurati che l'app supporti `genderreveal` nei seguenti file:

#### `src/types/events.ts` (se esiste)
```typescript
export type EventType = 
  | 'matrimonio'
  | 'babyshower'
  | 'genderreveal' // ← Aggiungi questo
  | 'battesimo'
  | 'comunione'
  | 'cresima'
  | 'diciottesimo'
  | 'laurea'
  | 'anniversario';
```

---

### 2. Aggiungi Route API (Opzionale)

Se vuoi un endpoint dedicato per Gender Reveal:

**File:** `src/app/api/events/genderreveal/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo data per utenti non autenticati
  if (!jwt) {
    return NextResponse.json({
      event: {
        name: "Gender Reveal Demo",
        event_type: "genderreveal",
        total_budget: 3500,
        categories: [],
        timeline: []
      }
    });
  }

  // Fetch dati reali per utenti autenticati
  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  
  if (authError) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Query evento Gender Reveal dell'utente
  const { data: event, error } = await db
    .from("events")
    .select(`
      *,
      categories (
        *,
        subcategories (*)
      ),
      timeline_items (*)
    `)
    .eq("user_id", userId)
    .eq("event_type", "genderreveal")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event });
}
```

---

### 3. Aggiungi UI per Creazione Evento

**File:** `src/app/events/create/page.tsx` (esempio)

```typescript
"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabaseBrowser";

export default function CreateEventPage() {
  const [eventType, setEventType] = useState<string>("");
  
  const eventTypes = [
    { value: "matrimonio", label: "Matrimonio", icon: "💍" },
    { value: "babyshower", label: "Baby Shower", icon: "🍼" },
    { value: "genderreveal", label: "Gender Reveal", icon: "💗💙" },
    { value: "battesimo", label: "Battesimo", icon: "✝️" },
    // ... altri eventi
  ];

  const handleCreateEvent = async () => {
    const supabase = getBrowserClient();
    const { data: session } = await supabase.auth.getSession();
    const jwt = session.session?.access_token;

    const response = await fetch("/api/events/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt && { Authorization: `Bearer ${jwt}` })
      },
      body: JSON.stringify({ event_type: eventType })
    });

    const result = await response.json();
    console.log("Evento creato:", result);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Crea il tuo evento</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {eventTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setEventType(type.value)}
            className={`p-6 border rounded-lg ${
              eventType === type.value ? 'border-[#A3B59D] bg-green-50' : 'border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">{type.icon}</div>
            <div className="font-semibold">{type.label}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleCreateEvent}
        disabled={!eventType}
        className="mt-6 px-6 py-3 bg-[#A3B59D] text-white rounded-lg disabled:opacity-50"
      >
        Crea Evento
      </button>
    </div>
  );
}
```

---

## 🧪 TESTING

### Test 1: Verifica Database

```sql
-- Conta eventi Gender Reveal
SELECT COUNT(*) FROM events WHERE event_type = 'genderreveal';

-- Verifica categorie
SELECT c.name, COUNT(s.id) as num_subcategories
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
WHERE c.event_id IN (SELECT id FROM events WHERE event_type = 'genderreveal')
GROUP BY c.name
ORDER BY c.display_order;

-- Verifica timeline
SELECT category, COUNT(*) as items
FROM timeline_items
WHERE event_id IN (SELECT id FROM events WHERE event_type = 'genderreveal')
GROUP BY category
ORDER BY MIN(display_order);
```

---

### Test 2: Verifica API Route

```powershell
# Test locale
curl http://localhost:3000/api/events/genderreveal

# Test con autenticazione (sostituisci con JWT reale)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/events/genderreveal
```

---

### Test 3: Verifica UI

1. Avvia dev server: `npm run dev`
2. Vai su `http://localhost:3000/events/create`
3. Seleziona "Gender Reveal"
4. Clicca "Crea Evento"
5. Verifica che l'evento sia creato e visibile nel dashboard

---

## 🚀 DEPLOYMENT

### 1. Deployment Database (Supabase Cloud)

```powershell
# Esegui seed su Supabase Cloud
node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
```

**O usa il task VS Code:**
- Terminal → Run Task → `Run SQL: Current File (Supabase Cloud)`

---

### 2. Deployment App (Vercel)

#### Metodo A: Git Push

```powershell
git add .
git commit -m "feat: add Gender Reveal event type"
git push origin main
```

Vercel deploierà automaticamente.

---

#### Metodo B: Pipeline Completa

Usa il task VS Code predefinito:

- Terminal → Run Task → `Pipeline: Cloud DB -> Commit+Push -> Vercel`

Questo eseguirà in sequenza:
1. Init schema + patches su Supabase Cloud
2. Auto-commit delle modifiche
3. Push su GitHub
4. Auto-deploy su Vercel

---

### 3. Verifica Post-Deploy

1. **Database:**
   - Controlla Supabase Dashboard → Table Editor → `events`
   - Verifica presenza evento `genderreveal`

2. **App:**
   - Vai su `https://il-budget-degli-sposi.vercel.app`
   - Testa creazione nuovo evento Gender Reveal
   - Verifica che categorie e timeline siano popolate

---

## 🛠️ TROUBLESHOOTING

### Problema: Seed SQL fallisce

**Sintomo:** Errore durante esecuzione SQL

**Soluzioni:**

1. **Verifica schema base:**
   ```sql
   -- Controlla che le tabelle esistano
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('events', 'categories', 'subcategories', 'timeline_items');
   ```

2. **Esegui setup completo:**
   ```powershell
   node scripts/run-sql.mjs supabase-COMPLETE-SETUP.sql
   node scripts/run-sql.mjs supabase-ALL-PATCHES.sql
   node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
   ```

---

### Problema: Evento non appare in app

**Sintomo:** Gender Reveal non disponibile nel dropdown

**Soluzioni:**

1. **Verifica tipo evento nell'app:**
   - Controlla che `genderreveal` sia incluso in `EventType` (types/events.ts)

2. **Verifica API route:**
   - Testa endpoint `/api/events` per vedere se ritorna `genderreveal`

3. **Controlla filtri UI:**
   - Verifica che la logica di rendering non filtri `genderreveal`

---

### Problema: Timeline vuota

**Sintomo:** Timeline items non vengono visualizzati

**Soluzioni:**

1. **Verifica insert:**
   ```sql
   SELECT COUNT(*) FROM timeline_items 
   WHERE event_id IN (SELECT id FROM events WHERE event_type = 'genderreveal');
   ```

2. **Controlla query API:**
   - Assicurati che l'API route includa `.select('*, timeline_items(*)')`

---

### Problema: Budget non sommato correttamente

**Sintomo:** Budget totale diverso da €11.440

**Soluzioni:**

1. **Ricalcola totale:**
   ```sql
   SELECT SUM(s.estimated_cost) 
   FROM subcategories s
   JOIN categories c ON c.id = s.category_id
   JOIN events e ON e.id = c.event_id
   WHERE e.event_type = 'genderreveal';
   ```

2. **Verifica sottocategorie mancanti:**
   ```sql
   SELECT c.name, COUNT(s.id) 
   FROM categories c
   LEFT JOIN subcategories s ON s.category_id = c.id
   WHERE c.event_id IN (SELECT id FROM events WHERE event_type = 'genderreveal')
   GROUP BY c.name;
   ```

---

## 📚 FILE DI RIFERIMENTO

### SQL
- `supabase-genderreveal-event-seed.sql` - Seed completo evento

### Documentazione
- `GENDERREVEAL-COMPLETAMENTO.md` - Checklist implementazione
- `GENDERREVEAL-IMPLEMENTATION-SUMMARY.md` - Panoramica tecnica
- `CHECKLIST_SQL_SEEDS.md` - Lista completa seed disponibili

### Script
- `scripts/run-sql.mjs` - Esecutore SQL per locale/cloud
- `scripts/autocommit-watch.mjs` - Auto-commit modifiche

---

## 🎓 BEST PRACTICES

### Per Utenti Finali

1. **Personalizza il budget** in base alle tue esigenze
2. **Segui la timeline** per non dimenticare attività
3. **Aggiungi note** personalizzate a ogni sottocategoria
4. **Traccia acconti** e saldi fornitori

### Per Sviluppatori

1. **Testa sempre su locale** prima di deploy
2. **Usa le variabili ambiente** correttamente
3. **Verifica RLS policies** su Supabase
4. **Monitora log errori** in produzione

---

## 📞 SUPPORTO

Per problemi o domande:

1. **Controlla la documentazione** (README.md, *.md)
2. **Verifica Supabase logs** (Dashboard → Logs)
3. **Consulta Vercel logs** (Deployment → Logs)
4. **GitHub Issues** per bug o feature request

---

## ✅ CHECKLIST FINALE

Prima di considerare il setup completato:

- [ ] Seed SQL eseguito con successo
- [ ] Evento Gender Reveal visibile in Supabase Table Editor
- [ ] 10 categorie presenti
- [ ] 54 sottocategorie presenti
- [ ] 30 timeline items presenti
- [ ] Budget totale = €11.440
- [ ] API route testata (con/senza auth)
- [ ] UI per creazione evento funzionante
- [ ] Deploy in produzione completato
- [ ] Test end-to-end superato

---

**Setup Gender Reveal completato!** 🎉💗💙

Buona organizzazione della rivelazione del sesso del bambino! 👶✨
