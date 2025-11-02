# 💍 Guida Setup Evento Matrimonio

## 📋 Panoramica

L'evento "Matrimonio" (wedding) è ora completamente integrato nel sistema multi-evento con tutte le categorie e sottocategorie necessarie.

---

## 🗂️ File Coinvolti

### File SQL Principali

1. **`supabase-core-events-schema.sql`** - Schema base multi-evento (tabelle, RLS)
2. **`supabase-seed-event-types.sql`** - Tipi evento (include ora "Matrimonio")
3. **`supabase-wedding-event-seed.sql`** ⭐ **NUOVO** - Categorie e sottocategorie complete per Matrimonio

### File Frontend

- `src/data/config/events.json` - Configurazione eventi lato client
- `src/app/select-event-type/page.tsx` - Pagina selezione tipo evento
- `src/app/dashboard/page.tsx` - Dashboard principale (usa schema legacy)

---

## 🚀 Setup Database

### Opzione 1: Setup Completo Nuovo Schema (Consigliato per nuovi progetti)

Esegui in Supabase SQL Editor **in ordine**:

```sql
-- 1. Schema base multi-evento
supabase-core-events-schema.sql

-- 2. Seed tipi evento (include Matrimonio)
supabase-seed-event-types.sql

-- 3. Seed categorie e sottocategorie Matrimonio
supabase-wedding-event-seed.sql

-- 4. (Opzionale) Altri tipi evento
supabase-seed-event-categories.sql  -- Battesimo, Diciottesimo, etc.

-- 5. (Opzionale) Evento demo pubblico
supabase-demo-public-event.sql
```

### Opzione 2: Solo Matrimonio su Schema Esistente

Se hai già il vecchio schema:

```sql
-- 1. Aggiungi solo il nuovo tipo evento
supabase-wedding-event-seed.sql
```

### Via VS Code Task

```bash
# Setup completo (locale)
npm run sql:init:core-events

# Oppure manualmente:
node scripts/run-sql.mjs supabase-core-events-schema.sql
node scripts/run-sql.mjs supabase-seed-event-types.sql
node scripts/run-sql.mjs supabase-wedding-event-seed.sql
```

---

## 📊 Struttura Dati Matrimonio

### Categorie (18 totali)

1. **Sposa** - 8 sottocategorie (Abito, Scarpe, Accessori, Parrucchiera, Make-up, etc.)
2. **Sposo** - 6 sottocategorie (Abito, Scarpe, Accessori, Barbiere, etc.)
3. **Abiti & Accessori (altri)** - 5 sottocategorie (Damigelle, Paggetti, Fedi, etc.)
4. **Cerimonia** - 7 sottocategorie (Chiesa, Celebrante, Musicisti, Addobbi, etc.)
5. **Location & Catering** - 7 sottocategorie (Location, Menù, Torta, Open bar, etc.)
6. **Fiori & Decor** - 7 sottocategorie (Bouquet, Centrotavola, Illuminazione, etc.)
7. **Foto & Video** - 7 sottocategorie (Fotografo, Videomaker, Album, Drone, etc.)
8. **Inviti & Stationery** - 7 sottocategorie (Partecipazioni, Save the date, Tableau, etc.)
9. **Musica & Intrattenimento** - 6 sottocategorie (DJ, Band, Animazione, etc.)
10. **Beauty & Benessere** - 5 sottocategorie (Trattamenti, Spa, Nail art, etc.)
11. **Bomboniere & Regali** - 6 sottocategorie (Bomboniere, Confetti, Lista nozze, etc.)
12. **Trasporti** - 4 sottocategorie (Auto sposi, Navetta, Parcheggio, etc.)
13. **Ospitalità & Logistica** - 4 sottocategorie (Hotel, Welcome bag, etc.)
14. **Viaggio di nozze** - 4 sottocategorie (Voli, Hotel, Escursioni, etc.)
15. **Staff & Coordinamento** - 4 sottocategorie (Wedding planner, Coordinatore, etc.)
16. **Burocrazia & Documenti** - 4 sottocategorie (Pubblicazioni, Certificati, etc.)
17. **Comunicazione & Media** - 4 sottocategorie (Sito web, Social, Video inviti, etc.)
18. **Extra & Contingenze** - 5 sottocategorie (Fondo emergenze, Assicurazione, etc.)

**TOTALE: 18 categorie + ~100 sottocategorie**

---

## 🔍 Verifica Setup

### Query di Controllo

```sql
-- 1. Verifica tipo evento
SELECT * FROM event_types WHERE slug = 'wedding';

-- 2. Conta categorie
SELECT COUNT(*) FROM categories c
JOIN event_types et ON c.type_id = et.id
WHERE et.slug = 'wedding';
-- Dovrebbe restituire: 18

-- 3. Conta sottocategorie
SELECT COUNT(*) FROM subcategories sc
JOIN categories c ON sc.category_id = c.id
JOIN event_types et ON c.type_id = et.id
WHERE et.slug = 'wedding';
-- Dovrebbe restituire: ~100

-- 4. Vista completa
SELECT 
  et.name as event_type, 
  c.name as category, 
  COUNT(sc.id) as num_subcategories
FROM event_types et
JOIN categories c ON c.type_id = et.id
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE et.slug = 'wedding'
GROUP BY et.name, c.name
ORDER BY c.sort;
```

---

## 🔄 Differenze con Schema Legacy

### Schema Legacy (Attuale Dashboard)
- Tabella `events` senza `type_id`
- Categorie/sottocategorie legate direttamente a `event_id`
- Funzione `seed_categories(event_id)` crea categorie per ogni evento
- Hardcoded per "Matrimonio" solo

### Nuovo Schema Multi-Evento
- Tabella `events` con `type_id` → `event_types`
- Categorie/sottocategorie condivise per tipo evento
- Supporta: Matrimonio, Battesimo, Diciottesimo, Compleanno, Anniversario, Pensione
- RLS policies per gestione permessi avanzata

---

## 🛣️ Roadmap Migrazione

### Fase 1: ✅ Completato
- [x] Creato schema multi-evento
- [x] Aggiunto tipo "Matrimonio"
- [x] Seed completo categorie/sottocategorie

### Fase 2: 🚧 Da Fare
- [ ] Aggiornare API Routes per supportare nuovo schema
- [ ] Creare migration script da legacy a nuovo schema
- [ ] Testare compatibilità con dashboard esistente

### Fase 3: 📝 Pianificato
- [ ] Documentare breaking changes
- [ ] Aggiornare frontend per selezione tipo evento
- [ ] Deploy graduale in produzione

---

## 📚 Riferimenti

- **Schema Core**: `supabase-core-events-schema.sql`
- **Guida Setup Avanzato**: `SUPABASE-NEW-EVENTS-SETUP.md`
- **Checklist Seeds**: `CHECKLIST_SQL_SEEDS.md`
- **Database README**: `database/README.md`

---

## ⚠️ Note Importanti

1. **Schema Legacy vs Nuovo**: L'app attuale usa schema legacy. Il nuovo schema è additivo e non rompe l'esistente.

2. **Compatibilità**: Il file `supabase-wedding-event-seed.sql` può essere eseguito su database esistente senza problemi.

3. **Testing**: Testa sempre su database locale prima di applicare in produzione:
   ```bash
   docker-compose up -d
   node scripts/run-sql.mjs supabase-wedding-event-seed.sql
   ```

4. **RLS Policies**: Il nuovo schema include Row Level Security policies per gestione permessi granulare.

---

## 🆘 Troubleshooting

### Errore: "relation event_types does not exist"
**Soluzione**: Esegui prima `supabase-core-events-schema.sql`

### Errore: "duplicate key value violates unique constraint"
**Soluzione**: Normale se ri-esegui il seed. L'`ON CONFLICT DO NOTHING` previene duplicati.

### Query per Reset (⚠️ ATTENZIONE - cancella dati!)
```sql
-- Rimuovi solo dati Matrimonio
DELETE FROM subcategories WHERE category_id IN (
  SELECT c.id FROM categories c
  JOIN event_types et ON c.type_id = et.id
  WHERE et.slug = 'wedding'
);
DELETE FROM categories WHERE type_id = (SELECT id FROM event_types WHERE slug = 'wedding');
DELETE FROM event_types WHERE slug = 'wedding';
```

---

**Creato**: Novembre 2025  
**Versione**: 1.0  
**Autore**: AI Copilot + rzirafi87-arch
