# 🎈 Setup Rapido Diciottesimo

## 1. Database Setup

```bash
# Esegui SQL seed
node scripts/run-sql.mjs supabase-eighteenth-event-seed.sql
```

## 2. Verifica

```sql
-- Test categorie
SELECT et.name, COUNT(c.id) as num_categories
FROM event_types et
LEFT JOIN categories c ON c.type_id = et.id
WHERE et.slug = 'eighteenth'
GROUP BY et.name;
-- Atteso: 11 categorie

-- Test sottocategorie
SELECT c.name as category, COUNT(sc.id) as subs
FROM categories c
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE c.type_id = (SELECT id FROM event_types WHERE slug='eighteenth')
GROUP BY c.name, c.sort
ORDER BY c.sort;
-- Atteso: 50 sottocategorie totali
```

## 3. Test Frontend

1. **Non autenticato**: `/select-event-type` → Diciottesimo → Demo mode
2. **Autenticato**: Registrati → Seleziona Diciottesimo → Dashboard auto-seed

## 4. Struttura File

```
✅ SQL
   └── supabase-eighteenth-event-seed.sql

✅ Templates
   └── src/data/templates/eighteenth.ts

✅ API Routes
   ├── src/app/api/eighteenth/seed/[eventId]/route.ts
   └── src/app/api/my/eighteenth-dashboard/route.ts

✅ Frontend
   ├── src/data/config/events.json (available: true)
   ├── src/app/select-event-type/page.tsx
   ├── src/components/dashboard/BudgetSummary.tsx
   └── src/components/NavTabs.tsx

✅ Docs
   └── DICIOTTESIMO-COMPLETAMENTO.md
```

## 5. Categorie Quick Reference

1. **Location e Allestimento** (6 subs) - 20%
2. **Catering / Cibo e Bevande** (6 subs) - 25%
3. **Abbigliamento e Beauty** (5 subs) - 10%
4. **Foto e Video** (4 subs) - 12%
5. **Musica e Intrattenimento** (6 subs) - 15%
6. **Inviti e Grafica** (4 subs) - 4%
7. **Regali e Ringraziamenti** (3 subs) - 3%
8. **Trasporti e Logistica** (4 subs) - 3%
9. **Servizi Extra** (5 subs) - 3%
10. **Comunicazione e Social** (4 subs) - 2%
11. **Imprevisti e Contingenze** (3 subs) - 3%

**Totale**: 11 categorie, 50 sottocategorie

## 6. Budget Type

- ✅ Budget unico (come Battesimo)
- ✅ Spend type: sempre `"common"`
- ✅ Label data: "Data Festa"
- ✅ No divisione bride/groom

---

**Status**: ✅ Production Ready  
**Docs complete**: DICIOTTESIMO-COMPLETAMENTO.md
