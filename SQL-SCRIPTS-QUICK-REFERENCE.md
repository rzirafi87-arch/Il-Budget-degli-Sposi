# Quick Reference: Script SQL per Supabase

## 🚀 Utilizzo Rapido

### 1️⃣ Health Check Giornaliero (< 3 secondi)
```
1. Apri Supabase → SQL Editor
2. New Query
3. Copia/incolla: supabase-quick-check.sql
4. Run
5. Leggi il riepilogo finale
```

**Risultato atteso:**
```
╔═══════════════════════════════════════════════════════════════╗
║                    HEALTH CHECK SUMMARY                       ║
╠═══════════════════════════════════════════════════════════════╣
║ Health Score:  95/100                                         ║
║ Critical Issues:  0                                           ║
║ Warnings:  2                                                  ║
╠═══════════════════════════════════════════════════════════════╣
║ Status: ✅ GOOD - Minor issues detected                       ║
╚═══════════════════════════════════════════════════════════════╝

🟢 ALL CLEAR: No issues detected. Database healthy!
```

---

### 2️⃣ Diagnostica Completa (setup/troubleshooting)
```
File: supabase-diagnostics-complete.sql
Uso: Setup iniziale, verifiche post-deploy, troubleshooting
```

**Output:**
- ✅ Info database (versione, user, DB name)
- 📊 Tabelle con conteggi righe e dimensioni
- 🌱 Seed data per tipologia
- 🔗 Integrità referenziale
- ✅ Validazione valori
- 🔐 RLS & Security
- ⚡ Performance & indici
- 📝 Stored procedures
- 📈 Riepilogo statistiche

---

### 3️⃣ Monitoraggio Attività (analisi trend)
```
File: supabase-monitor-activity.sql
Uso: Analytics, pattern utilizzo, audit
```

**Mostra:**
- Eventi creati ultimi 24h
- Spese/entrate ultimi 7 giorni
- Nuovi utenti ultimo mese
- Subscriptions in scadenza
- Top fornitori utilizzati
- Partecipazioni create
- Pattern utilizzo per ora del giorno

---

### 4️⃣ Verifica Configurazione (post-setup)
```
File: supabase-verify-config.sql
Uso: Dopo migrations, patch, setup iniziale
```

**Controlla:**
- Tabelle esistenti vs attese
- RLS abilitato
- Policies configurate
- Stored procedures presenti
- Seed data completo
- Colonne chiave presenti

---

### 5️⃣ Integrità Dati (manutenzione)
```
File: supabase-verify-data-integrity.sql
Uso: Periodico, dopo import massivi
```

**Rileva:**
- Orphan records (FK rotti)
- Valori invalidi
- Budget/importi negativi
- Duplicati
- Subscriptions anomale

---

### 6️⃣ Performance Check (ottimizzazione)
```
File: supabase-verify-performance.sql
Uso: Troubleshooting lentezza, before optimization
```

**Analizza:**
- Indici presenti
- Tabelle senza indici
- Dimensioni tabelle
- Statistiche utilizzo

---

## 🎯 Casi d'Uso

### Scenario 1: Deploy Appena Fatto
```sql
-- Esegui in ordine:
1. supabase-verify-config.sql       -- Verifica schema ok
2. supabase-verify-data-integrity.sql  -- Controlla dati ok
3. supabase-quick-check.sql         -- Health check finale
```

### Scenario 2: Database Lento
```sql
-- Esegui:
1. supabase-verify-performance.sql  -- Analizza indici
2. supabase-monitor-activity.sql    -- Pattern utilizzo
```

### Scenario 3: Anomalie nei Dati
```sql
-- Esegui:
1. supabase-verify-data-integrity.sql  -- Trova problemi
2. supabase-diagnostics-complete.sql   -- Diagnostica full
```

### Scenario 4: Check Quotidiano
```sql
-- Solo questo:
supabase-quick-check.sql  -- 3 secondi, tutto ok!
```

---

## 📊 Interpretazione Health Score

| Score | Status | Azione |
|-------|--------|--------|
| 90-100 | ✅ EXCELLENT | Nessuna |
| 70-89 | ✅ GOOD | Monitora warnings |
| 50-69 | ⚠️ WARNING | Pianifica fix |
| 0-49 | ❌ CRITICAL | Fix immediato! |

**Calcolo:**
- Ogni critical issue: -10 punti
- Ogni warning: -2 punti
- Base: 100 punti

---

## 🛠️ Fix Comuni

### Fix 1: Elimina Orphan Expenses
```sql
DELETE FROM expenses 
WHERE event_id NOT IN (SELECT id FROM events);
```

### Fix 2: Aggiorna Subscriptions Scadute
```sql
UPDATE user_subscriptions 
SET status = 'expired' 
WHERE status = 'active' AND end_date < CURRENT_DATE;
```

### Fix 3: Reset Budget Negativi a Zero
```sql
UPDATE events 
SET total_budget = 0 
WHERE total_budget < 0;

UPDATE events 
SET bride_initial_budget = 0 
WHERE bride_initial_budget < 0;

UPDATE events 
SET groom_initial_budget = 0 
WHERE groom_initial_budget < 0;
```

### Fix 4: Rimuovi Duplicati Fornitori
```sql
-- Prima identifica:
SELECT name, city, COUNT(*) 
FROM suppliers 
GROUP BY name, city 
HAVING COUNT(*) > 1;

-- Poi elimina (mantieni solo primo ID):
DELETE FROM suppliers a USING suppliers b
WHERE a.id > b.id 
  AND a.name = b.name 
  AND a.city = b.city;
```

---

## 🔄 Automazione

### Cron Job Giornaliero (Supabase Functions)
```sql
-- Crea una scheduled function:
CREATE OR REPLACE FUNCTION daily_health_check()
RETURNS void AS $$
BEGIN
  -- Qui inserisci logica di supabase-quick-check.sql
  -- Invia notifica se health score < 70
END;
$$ LANGUAGE plpgsql;

-- Schedule (richiede pg_cron extension)
SELECT cron.schedule(
  'daily-health-check',
  '0 6 * * *',  -- Ogni giorno alle 6:00
  'SELECT daily_health_check()'
);
```

---

## 📞 Supporto

**Se hai problemi:**
1. Copia output completo dello script
2. Annota quale script hai eseguito
3. Controlla versione PostgreSQL: `SELECT version();`
4. Apri issue su GitHub con dettagli

**Link Utili:**
- [Supabase SQL Editor](https://app.supabase.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Guida Completa](./SUPABASE-SQL-VERIFICATION-GUIDE.md)

---

**Ultimo aggiornamento:** 4 Novembre 2025  
**Versione script:** 1.0.0
