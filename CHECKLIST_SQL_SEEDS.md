# 📋 Checklist SQL Seeds da Eseguire in Supabase

Questo documento elenca tutti i file SQL seed da eseguire in ordine nel tuo progetto Supabase per popolare le pagine del marketplace.

## 🎯 Setup Rapido Multi-Evento

Per il nuovo sistema multi-evento (Matrimonio, Battesimo, etc.), vedi: **[MATRIMONIO-SETUP-GUIDE.md](MATRIMONIO-SETUP-GUIDE.md)**

## ✅ Ordine di Esecuzione

### 0. **Setup Multi-Evento (Nuovo Schema)** ⭐ OPZIONALE
Files in ordine:
1. `supabase-core-events-schema.sql` - Schema base multi-evento
2. `supabase-seed-event-types.sql` - Tipi evento (include Matrimonio, Battesimo, Anniversario, etc.)
3. `supabase-wedding-event-seed.sql` - Categorie complete Matrimonio (18 cat + 100+ subcat)
4. `supabase-baptism-event-seed.sql` - Categorie Battesimo
5. `supabase-eighteenth-event-seed.sql` - Categorie Diciottesimo
6. `supabase-confirmation-event-seed.sql` - Categorie Cresima
6. `supabase-graduation-event-seed.sql` - Categorie Laurea
8. `supabase-communion-event-seed.sql` - Categorie Prima Comunione
9. `supabase-anniversary-event-seed.sql` - Categorie Anniversario di Matrimonio
10. `supabase-babyshower-event-seed.sql` - Categorie Baby Shower
11. `supabase-genderreveal-event-seed.sql` - Categorie Gender Reveal
12. `supabase-engagement-party-seed.sql` - Categorie Festa di Fidanzamento ⭐ NUOVO

**Note**: Questo è un sistema nuovo e separato dallo schema legacy. Vedi guide specifiche:
- [MATRIMONIO-SETUP-GUIDE.md](MATRIMONIO-SETUP-GUIDE.md)
- [BATTESIMO-SETUP-GUIDE.md](BATTESIMO-SETUP-GUIDE.md) 
- [DICIOTTESIMO-SETUP-GUIDE.md](DICIOTTESIMO-SETUP-GUIDE.md)
- [CRESIMA-SETUP-GUIDE.md](CRESIMA-SETUP-GUIDE.md)
- [LAUREA-SETUP-GUIDE.md](LAUREA-SETUP-GUIDE.md)
- [COMUNIONE-SETUP-GUIDE.md](COMUNIONE-SETUP-GUIDE.md)
- [ANNIVERSARIO-SETUP-GUIDE.md](ANNIVERSARIO-SETUP-GUIDE.md)
- [BABYSHOWER-SETUP-GUIDE.md](BABYSHOWER-SETUP-GUIDE.md)
- [GENDERREVEAL-SETUP-GUIDE.md](GENDERREVEAL-SETUP-GUIDE.md)
- [ENGAGEMENT-PARTY-SETUP-GUIDE.md](ENGAGEMENT-PARTY-SETUP-GUIDE.md) ⭐ NUOVO

### 1. **Setup Completo Database** (Se non già fatto)
File: `supabase-COMPLETE-SETUP.sql`
- Crea tutte le tabelle principali (events, categories, subcategories, expenses, incomes, suppliers, locations, churches, atelier, ecc.)
- **ESEGUIRE PER PRIMO** se il database è vuoto

### 2. **Funzioni di Seed**
File: `supabase-seed-functions.sql`
- Stored procedures per popolamento automatico eventi
- Eseguire dopo COMPLETE-SETUP

### 3. **Seed Suppliers (Base)**
File: `supabase-suppliers-seed.sql`
- Popola la tabella `suppliers` con fornitori di diverse categorie:
  - Foto & Video
  - Fiori & Decor
  - Location & Catering (vecchia categoria mista)
  - Ricevimento Location
  - Bomboniere & Partecipazioni
- **IMPORTANTE**: Questo seed contiene già molti fornitori ma con alcune categorie miste

### 4. **Seed Gioiellerie** ⭐ NUOVO
File: `supabase-gioiellerie-seed.sql`
- Aggiunge 10 gioiellerie verificate in varie regioni italiane
- Categoria: `Gioiellerie`
- Eseguire per popolare la pagina `/gioiellerie`

### 5. **Seed Beauty & Benessere** ⭐ NUOVO
File: `supabase-beauty-benessere-seed.sql`
- Aggiunge 40+ fornitori Beauty & Benessere:
  - Parrucchieri
  - Make-up artist
  - Centri estetici
  - SPA e wellness
- Categoria: `Beauty & Benessere`
- Copre tutte le regioni italiane
- Eseguire per popolare la pagina `/beauty`

### 6. **Seed Catering (Separato)** ⭐ NUOVO
File: `supabase-catering-seed.sql`
- Aggiunge 40+ servizi di catering e banqueting
- Categoria: `Catering` (separata da Location)
- Include:
  - Banqueting luxury
  - Buffet tradizionali
  - Servizio al tavolo
  - Cucine regionali
- Eseguire per popolare la pagina `/catering` con dati dedicati

### 7. **Seed Chiese** ✅ GIÀ PRESENTE
File: `supabase-churches-seed.sql`
- Popola la tabella `churches` con 30+ chiese italiane
- Include diverse confessioni (cattolica, ortodossa, anglicana, sinagoga)
- Copre tutte le regioni italiane
- Eseguire per popolare la pagina `/chiese`

### 8. **Seed Atelier (Tabella + Dati)** ⭐ DA VERIFICARE
Files:
- `supabase-atelier-table.sql` - Crea tabella `atelier`
- `supabase-atelier-seed.sql` - Popola con atelier sposa/sposo

**IMPORTANTE**: Questi file esistono ma potrebbero non essere ancora stati eseguiti.
- Eseguire prima `atelier-table.sql` (crea struttura)
- Poi `atelier-seed.sql` (inserisce dati)
- Popola la pagina `/atelier`

### 9. **Seed Locations**
File: `supabase-locations-seed.sql`
- Popola la tabella `locations` con ville, castelli, agriturismi
- Eseguire per popolare la pagina `/location`

## 🔧 Patch Files (Opzionali - Solo se necessario)

Questi file sono patch incrementali per aggiornare lo schema esistente:
- `supabase-expenses-patch.sql`
- `supabase-payment-providers-patch.sql`
- `supabase-per-spouse-budget-patch.sql`
- `supabase-spend-type-patch.sql`
- `supabase-total-budget-patch.sql`
- `supabase-wedding-cards-table.sql`
- `supabase-guests-tables.sql`

**Eseguire solo se le colonne/tabelle menzionate non esistono già.**

## ➕ Seeds Evento (Multi-Evento) — Opzionali

Questi seed aggiungono categorie/sottocategorie per specifici tipi di evento nel modello multi-evento.

- `supabase-communion-event-seed.sql` — Categorie e sottocategorie per "Prima Comunione"

Nota: eseguire solo se stai adottando lo schema multi-evento e vuoi popolare il dizionario di categorie per la Comunione.

## 📝 Come Eseguire i Seeds

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Nel menu laterale, clicca su **SQL Editor**
4. Crea una nuova query
5. Copia e incolla il contenuto del file SQL
6. Clicca su **RUN** per eseguire
7. Verifica che l'esecuzione sia completata con successo (controlla output in basso)

## ✅ Checklist di Verifica

Dopo aver eseguito i seeds, verifica che le seguenti pagine mostrino dati:

- [ ] `/fotografi` - Deve mostrare fotografi (categoria: "Foto & Video")
- [ ] `/fiorai` - Deve mostrare fioristi (categoria: "Fiori & Decor")
- [ ] `/catering` - Deve mostrare servizi catering (categoria: "Catering")
- [ ] `/beauty` - Deve mostrare parrucchieri/makeup (categoria: "Beauty & Benessere")
- [ ] `/gioiellerie` - Deve mostrare gioiellerie (categoria: "Gioiellerie")
- [ ] `/chiese` - Deve mostrare chiese dalla tabella `churches`
- [ ] `/atelier` - Deve mostrare atelier dalla tabella `atelier`
- [ ] `/location` - Deve mostrare location dalla tabella `locations`

## ⚠️ Note Importanti

### Per utenti NON autenticati:
- Le pagine mostrano dati DEMO hardcoded nell'API
- I dati reali NON sono visibili senza login

### Per utenti autenticati:
- Le API filtrano SOLO fornitori con `verified = true`
- Assicurati che tutti i seed abbiano `verified: true` nelle INSERT
- Gli utenti possono aggiungere nuovi fornitori tramite form (saranno `verified: false`)

### Categorie Suppliers:
Dopo l'esecuzione dei seeds, dovresti avere:
- `Foto & Video` (fotografi, videomaker)
- `Fiori & Decor` (fioristi, wedding designer)
- `Beauty & Benessere` (parrucchieri, makeup, estetiste)
- `Gioiellerie` (fedi, gioielli sposa)
- `Catering` (banqueting, buffet, servizio al tavolo)
- `Location & Catering` (vecchia categoria - da migrare eventualmente)
- `Bomboniere & Partecipazioni`

## 🚀 Prossimi Passi

1. Eseguire i seeds in ordine
2. Testare le pagine marketplace autenticandosi
3. Verificare che il bottone "❤️ Preferiti" funzioni (ora collegato al backend!)
4. Aggiungere eventuali altri fornitori manualmente o via seed custom

## 📞 Supporto

Se una pagina non mostra dati:
1. Verifica che il seed sia stato eseguito con successo
2. Controlla che i record abbiano `verified = true`
3. Verifica la categoria esatta nel seed (case-sensitive!)
4. Controlla la console browser per errori API
5. Verifica che l'autenticazione funzioni (JWT presente nelle richieste)
