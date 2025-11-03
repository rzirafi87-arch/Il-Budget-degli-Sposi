# 🚀 DEPLOY TIMELINE FIXES - Guida Manuale

**Data:** 3 Novembre 2025  
**Status:** Pronto per deployment manuale

---

## ⚠️ NOTA IMPORTANTE

Lo script automatico `run-sql.mjs` richiede la password del database. Per un deployment più veloce e sicuro, **usa l'SQL Editor di Supabase Dashboard**.

---

## 📋 PROCEDURA DEPLOYMENT (Supabase Cloud)

### STEP 1: Aggiorna Schema Database

1. **Apri Supabase Dashboard**
   - Vai su: https://supabase.com/dashboard
   - Seleziona il tuo progetto
   - Clicca su **SQL Editor** nel menu laterale

2. **Crea nuova query**
   - Clicca "New query"
   - Copia TUTTO il contenuto di: `supabase-timeline-schema-update.sql`
   - Incolla nell'editor
   - Clicca **RUN** (o premi Ctrl+Enter)

3. **Verifica successo**
   - Dovresti vedere messaggio: "Success. No rows returned"
   - Query finale mostra colonne `phase` e `days_before` presenti

---

### STEP 2: Deploy Engagement Party

1. **Nuova query in SQL Editor**
2. **Copia contenuto di:** `supabase-engagement-party-seed.sql`
3. **Incolla ed esegui** (RUN)
4. **Verifica output finale:**
   ```
   evento                     | event_type       | num_categorie | num_sottocategorie | num_timeline_items
   ---------------------------+------------------+---------------+--------------------+-------------------
   Festa di Fidanzamento      | engagement-party |            10 |                 50 |                 34
   ```

---

### STEP 3: Deploy Gender Reveal

1. **Nuova query in SQL Editor**
2. **Copia contenuto di:** `supabase-genderreveal-event-seed.sql`
3. **Incolla ed esegui** (RUN)
4. **Verifica output finale:**
   ```
   evento           | event_type    | num_categorie | num_sottocategorie | num_timeline_items
   -----------------+---------------+---------------+--------------------+-------------------
   Gender Reveal    | genderreveal  |            10 |                 54 |                 30
   ```

---

### STEP 4: Deploy Pensionamento

1. **Nuova query in SQL Editor**
2. **Copia contenuto di:** `supabase-pensione-seed.sql`
3. **Incolla ed esegui** (RUN)
4. **Verifica output finale:**
   ```
   evento           | event_type  | num_categorie | num_sottocategorie | num_timeline_items
   -----------------+-------------+---------------+--------------------+-------------------
   Pensionamento    | retirement  |            10 |                 56 |                 34
   ```

---

### STEP 5: Verifica Completa

Esegui questa query per verificare tutte le timeline:

```sql
-- Verifica timeline create correttamente
SELECT 
  e.event_type,
  e.name AS evento,
  COUNT(DISTINCT t.id) AS num_timeline_items,
  COUNT(DISTINCT t.phase) AS num_fasi,
  MIN(t.days_before) AS giorni_prima_min,
  MAX(t.days_before) AS giorni_prima_max
FROM events e
LEFT JOIN timeline_items t ON t.event_id = e.id
WHERE e.event_type IN ('engagement-party', 'genderreveal', 'retirement')
GROUP BY e.event_type, e.name
ORDER BY e.event_type;
```

**Output Atteso:**
```
event_type       | evento                  | num_timeline_items | num_fasi | giorni_prima_min | giorni_prima_max
-----------------+-------------------------+--------------------+----------+------------------+------------------
engagement-party | Festa di Fidanzamento   |                 34 |        6 |               -7 |               90
genderreveal     | Gender Reveal           |                 30 |        5 |               -7 |               30
retirement       | Pensionamento           |                 34 |        6 |               -7 |               90
```

---

## 🔍 TROUBLESHOOTING

### Errore: "column phase does not exist"
**Causa:** Schema non aggiornato  
**Soluzione:** Esegui STEP 1 (schema update) prima degli altri

### Errore: "duplicate key value violates unique constraint"
**Causa:** Eventi già esistenti con stesso event_type  
**Soluzione:**
```sql
-- Elimina eventi esistenti prima di re-seed
DELETE FROM events WHERE event_type IN ('engagement-party', 'genderreveal', 'retirement');
```

### Errore: "permission denied"
**Causa:** RLS policies attive  
**Soluzione:** Esegui query come Admin/Service Role nell'SQL Editor (default)

---

## 📊 FILE DA DEPLOYARE (in ordine)

1. ✅ `supabase-timeline-schema-update.sql` - Schema database
2. ✅ `supabase-engagement-party-seed.sql` - Evento Engagement Party
3. ✅ `supabase-genderreveal-event-seed.sql` - Evento Gender Reveal
4. ✅ `supabase-pensione-seed.sql` - Evento Pensionamento

**Totale correzioni:** 98 task in 17 fasi temporali

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] STEP 1: Schema update eseguito
- [ ] STEP 2: Engagement Party seed eseguito
- [ ] STEP 3: Gender Reveal seed eseguito
- [ ] STEP 4: Pensionamento seed eseguito
- [ ] STEP 5: Verifica completa eseguita
- [ ] Output finale corretto (34, 30, 34 timeline items)
- [ ] Fase `phase` e `days_before` presenti in tutti i task

---

## 🎯 DEPLOYMENT LOCALE (Opzionale)

Se hai PostgreSQL locale (Docker):

```bash
# 1. Schema update
node scripts/run-sql.mjs supabase-timeline-schema-update.sql

# 2. Seeds
node scripts/run-sql.mjs supabase-engagement-party-seed.sql
node scripts/run-sql.mjs supabase-genderreveal-event-seed.sql
node scripts/run-sql.mjs supabase-pensione-seed.sql
```

**Nota:** Richiede `SUPABASE_DB_URL` o `DATABASE_URL` in `.env.local`

---

## 🎉 DOPO IL DEPLOYMENT

Una volta completato il deployment:

1. **Testa in app:**
   - Crea nuovo evento tipo "Engagement Party"
   - Naviga alla timeline
   - Verifica che task siano ordinati correttamente
   - Verifica calcolo date da `days_before`

2. **Prossimi passi:**
   - [ ] Creare timeline per Matrimonio (evento core)
   - [ ] Creare timeline per Battesimo
   - [ ] Creare timeline per Compleanno

---

**Guida creata:** 3 Novembre 2025  
**Tempo stimato deployment:** 10-15 minuti  
**Complessità:** Bassa (copia/incolla in SQL Editor)
