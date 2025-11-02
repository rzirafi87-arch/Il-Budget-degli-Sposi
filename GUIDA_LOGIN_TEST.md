# 🔐 Guida Login Utente Test

## Credenziali di Accesso

```
📧 Email:    test@ilbudgetdeglisposi.it
🔑 Password: Test123!
```

## 📋 Passi per Usare l'Utente Test

### 1. Esegui gli script SQL in Supabase

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto **"Il Budget degli Sposi"**
3. Nel menu laterale, clicca su **SQL Editor**
4. Crea una nuova query (o usa "New query") e esegui in ordine:
   - `supabase-COMPLETE-SETUP.sql` (solo se non l'hai già eseguito una volta)
   - `supabase-ALL-PATCHES.sql`
   - `supabase-seed-full-event.sql`  ← crea la funzione `seed_full_event(...)`
   - `supabase-test-user.sql`        ← crea utente, profilo, evento e popola categorie
5. Clicca **RUN** per ogni script (uno alla volta)

In alternativa, puoi eseguire direttamente:
- `supabase-setup-test-user.sql`  (all-in-one che fa tutto in un colpo solo)

**Output atteso:**
```
✅ UTENTE CREATO CORRETTAMENTE
✅ EVENTO CREATO
```

### 2. Fai Login nell'App

1. Apri il browser su: **http://localhost:3000/auth**
2. Inserisci:
   - Email: `test@ilbudgetdeglisposi.it`
   - Password: `Test123!`
3. Clicca **"Accedi"**
4. Verrai reindirizzato alla home con i tuoi dati!

### 3. Cosa Troverai Già Pronto

✅ **Utente confermato** - Nessuna conferma email necessaria
✅ **Evento matrimonio** - "Matrimonio Test 2025"
✅ **Budget impostato** - €30.000 totale (€15k sposa + €15k sposo)
✅ **Categorie popolate** - Tutte le categorie e sottocategorie già create
✅ **Profilo completo** - Nome: "Utente Test"

### 4. Cosa Puoi Testare

Una volta loggato, puoi esplorare:

- **Dashboard** (`/dashboard`) - Vedi il budget €30.000 già impostato
- **Fotografi** (`/fotografi`) - Clicca "❤️ Preferiti" per salvare
- **Fiorai** (`/fiorai`) - Testa filtri per regione/provincia
- **Catering** (`/catering`) - Nuova categoria separata
- **Beauty** (`/beauty`) - Parrucchieri e makeup
- **Gioiellerie** (`/gioiellerie`) - Fedi e gioielli
- **Chiese** (`/chiese`) - Database chiese (se seed eseguito)
- **Atelier** (`/atelier`) - Atelier sposa/sposo (se seed eseguito)
- **Spese** (`/spese`) - Aggiungi spese effettive
- **Invitati** (`/invitati`) - Gestisci lista invitati

## 🎯 Test dei Preferiti

**IMPORTANTE:** I bottoni "❤️ Preferiti" ora sono collegati al database!

1. Vai su `/fotografi` o altra pagina marketplace
2. Clicca "❤️ Preferiti" su un fornitore
3. Vedrai toast verde: "[Nome] aggiunto ai preferiti!"
4. Vai su Supabase → Table Editor → `user_favorites`
5. Dovresti vedere la nuova riga salvata!

**Verifiche:**
- `user_id`: `00000000-0000-0000-0000-000000000001`
- `item_type`: `supplier`
- `item_id`: ID del fornitore scelto
- `created_at`: timestamp corrente

## 🔄 Reset Utente Test

Se vuoi resettare l'utente test (cancellare tutti i dati):

```sql
-- Cancella favoriti
DELETE FROM public.user_favorites WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Cancella spese
DELETE FROM public.expenses WHERE event_id = '11111111-1111-1111-1111-111111111111';

-- Cancella entrate
DELETE FROM public.incomes WHERE event_id = '11111111-1111-1111-1111-111111111111';

-- Cancella invitati
DELETE FROM public.guests WHERE event_id = '11111111-1111-1111-1111-111111111111';

-- Reset categorie/sottocategorie
DELETE FROM public.subcategories WHERE category_id IN (
  SELECT id FROM public.categories WHERE event_id = '11111111-1111-1111-1111-111111111111'
);
DELETE FROM public.categories WHERE event_id = '11111111-1111-1111-1111-111111111111';

-- Ri-popola con seed
SELECT seed_full_event('11111111-1111-1111-1111-111111111111'::uuid);
```

## ⚠️ Note Importanti

### Se il Login Non Funziona

**Errore: "Invalid login credentials"**
- Verifica di aver eseguito lo script SQL
- Controlla che l'utente sia nella tabella `auth.users`
- Assicurati che `email_confirmed_at` sia NOT NULL

**Query di verifica:**
```sql
SELECT 
  email, 
  email_confirmed_at,
  role 
FROM auth.users 
WHERE email = 'test@ilbudgetdeglisposi.it';
```

**Errore: "User not found"**
- Lo script non è stato eseguito correttamente
- Ri-esegui `supabase-test-user.sql`

### Se i Preferiti Non Salvano

1. Apri Console del browser (F12 → Console)
2. Clicca "Preferiti" e controlla errori
3. Verifica che la tabella `user_favorites` esista:
   ```sql
   SELECT * FROM user_favorites LIMIT 1;
   ```

### Se le Pagine Marketplace Sono Vuote

**Da Autenticato:**
- Devi eseguire i seeds dei fornitori
- Vedi `CHECKLIST_SQL_SEEDS.md` per l'ordine corretto
- Esegui almeno:
  - `supabase-suppliers-seed.sql`
  - `supabase-gioiellerie-seed.sql`
  - `supabase-beauty-benessere-seed.sql`
  - `supabase-catering-seed.sql`

**Da NON Autenticato:**
- Le API mostrano dati DEMO hardcoded
- Dovresti vedere almeno 3 fornitori di esempio

## 🚀 Workflow Completo di Test

```
1. ✅ Esegui supabase-test-user.sql in Supabase
2. ✅ Vai su http://localhost:3000/auth
3. ✅ Login con test@ilbudgetdeglisposi.it / Test123!
4. ✅ Verifica redirect a home con countdown/budget
5. ✅ Vai su /fotografi
6. ✅ Filtra per regione "Lombardia"
7. ✅ Clicca "❤️ Preferiti" su un fotografo
8. ✅ Vedi toast conferma verde
9. ✅ Vai su Supabase → user_favorites → verifica entry
10. ✅ Vai su /dashboard
11. ✅ Inserisci alcune spese previste
12. ✅ Vai su /spese
13. ✅ Aggiungi spese effettive
14. ✅ Torna su home → vedi progressbar aggiornata
```

## 📞 Supporto

Se qualcosa non funziona:
1. Controlla i log del browser (F12 → Console)
2. Verifica che il server dev sia attivo (`npm run dev`)
3. Controlla che l'utente esista in Supabase
4. Verifica che i seeds dei fornitori siano stati eseguiti

---

**Buon test! 🎉**
