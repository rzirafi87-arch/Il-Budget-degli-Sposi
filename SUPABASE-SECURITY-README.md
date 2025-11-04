# 🔒 Supabase Security Fixes

Questo documento spiega come risolvere i problemi di sicurezza evidenziati dal **Supabase Security Advisor**.

## 📋 Problemi Risolti

### 1. **RLS Disabilitato su Tabelle Pubbliche** (9 errori)
**Tabelle interessate:**
- `public.vendors`
- `public.vendor_places`
- `public.places`
- `public.sync_jobs`

**Soluzione:**
- Abilitato Row Level Security (RLS) su tutte le tabelle
- Create policy per lettura pubblica e scrittura autenticata
- Sync jobs modificabili solo da service_role

### 2. **Security Definer Views** (5 warning)
**Viste interessate:**
- `public.top_vendors_by_region`
- `public.location_stats_by_region`
- `public.high_rated_locations`
- `public.vendors_with_places`
- `public.sync_stats`

**Soluzione:**
- Ricreate tutte le viste con `SECURITY INVOKER`
- Ora rispettano le policy RLS delle tabelle sottostanti

### 3. **Function Search Path Mutable** (17 warning)
**Funzioni interessate:**
- `is_subscription_active`
- `get_visible_suppliers`
- `seed_categories`
- `seed_subcategories`
- `normalize_url`
- `increment_analytics_count`
- `get_or_create_category`
- `ensure_subcategory`
- `seed_full_event`

**Soluzione:**
- Impostato `search_path = public, pg_temp` su tutte le funzioni
- Script automatico che itera su tutte le funzioni da correggere

## 🚀 Come Applicare le Correzioni

### Metodo 1: SQL Editor Supabase (Consigliato)

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto "MYBUDGETEVENTO"
3. Vai su **SQL Editor**
4. Copia e incolla il contenuto di `supabase-security-fixes.sql`
5. Clicca su **Run**

### Metodo 2: Script Locale

```bash
# Assicurati che SUPABASE_DB_URL sia impostato in .env.local
node scripts/run-sql.mjs supabase-security-fixes.sql
```

### Metodo 3: Task VS Code

1. Apri il file `supabase-security-fixes.sql`
2. Premi `Ctrl+Shift+P` (o `Cmd+Shift+P` su Mac)
3. Cerca "Run SQL: Current File (Supabase Cloud)"
4. Conferma esecuzione

## ✅ Verifica Post-Applicazione

Dopo aver eseguito lo script, verifica che tutto sia corretto:

### 1. Verifica RLS Abilitato
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('vendors', 'vendor_places', 'places', 'sync_jobs');
```

Risultato atteso: `rowsecurity = true` per tutte le tabelle

### 2. Verifica Policy Create
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Risultato atteso: almeno 4 policy per ogni tabella (SELECT, INSERT, UPDATE, DELETE)

### 3. Verifica Viste SECURITY INVOKER
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('top_vendors_by_region', 'location_stats_by_region', 'high_rated_locations', 'vendors_with_places', 'sync_stats');
```

Risultato atteso: tutte le 5 viste presenti

### 4. Verifica Search Path Funzioni
```sql
SELECT 
  n.nspname || '.' || p.proname as function, 
  proconfig 
FROM pg_proc p 
JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
AND p.proname IN (
  'is_subscription_active',
  'get_visible_suppliers',
  'seed_categories',
  'seed_subcategories',
  'normalize_url',
  'increment_analytics_count',
  'get_or_create_category',
  'ensure_subcategory',
  'seed_full_event'
)
ORDER BY function;
```

Risultato atteso: `proconfig` contiene `{search_path=public,pg_temp}` per ogni funzione

## 🔄 Ricontrolla Security Advisor

Dopo aver applicato le correzioni:

1. Vai su **Advisors → Security Advisor** nel dashboard Supabase
2. Clicca su **Refresh**
3. Verifica che:
   - **Errors** passi da 9 a **0**
   - **Warnings** passi da 17 a **0**

## 📝 Note Importanti

### Policy RLS Create

Le policy create seguono questo pattern:

**Lettura Pubblica:**
- Chiunque può leggere i dati (per API pubbliche)

**Scrittura Autenticata:**
- Solo utenti autenticati possono inserire/modificare/cancellare
- `sync_jobs` richiede `service_role` per modifiche

**Personalizzazione:**
Se hai bisogno di policy più restrittive (es. solo owner), modifica le policy nel file SQL prima di eseguirlo.

### Viste SECURITY INVOKER

Le viste ora rispettano i permessi dell'utente che le interroga:
- Se l'utente ha accesso alle tabelle sottostanti, può leggere la vista
- Se l'utente non ha accesso, riceve errore di permessi

### Search Path Sicuro

`search_path = public, pg_temp` previene attacchi di SQL injection tramite funzioni malevole create in altri schema.

## 🆘 Troubleshooting

### Errore: "relation X does not exist"
**Causa:** La tabella/vista/funzione non esiste nel tuo database  
**Soluzione:** Commenta quella parte dello script o crea prima la struttura necessaria

### Errore: "policy Y already exists"
**Causa:** Le policy sono già state create  
**Soluzione:** Normale - lo script usa `DROP POLICY IF EXISTS` quindi è sicuro rieseguirlo

### Warning VS Code su file SQL
**Causa:** VS Code interpreta SQL come MSSQL invece di PostgreSQL  
**Soluzione:** Ignora i warning - la sintassi è corretta per Supabase/PostgreSQL

## 📚 Documentazione di Riferimento

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/sql-security.html)
- [PostgreSQL SECURITY INVOKER](https://www.postgresql.org/docs/current/sql-createview.html)
- [PostgreSQL search_path](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)

## 🎯 Prossimi Passi

Dopo aver risolto questi problemi, considera di:

1. **Audit regolare:** Controlla Security Advisor mensilmente
2. **Policy personalizzate:** Rivedi le policy RLS per ogni caso d'uso
3. **Testing:** Testa l'accesso con diversi ruoli utente
4. **Monitoraggio:** Abilita logging per policy violations

---

**Creato:** 2025-11-01  
**Autore:** GitHub Copilot  
**Versione:** 1.0.0
