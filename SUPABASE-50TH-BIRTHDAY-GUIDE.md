# Seed 50° Compleanno – Guida Operativa

## 1. Prerequisiti
- Imposta `SUPABASE_DB_URL` (o `DATABASE_URL`) nel file `.env.local` con la stringa di connessione del database.
- Assicurati di avere le dipendenze installate (`npm install`).
- Verifica la connessione con `node scripts/run-sql.mjs --help` o `node scripts/seed-50th-birthday.mjs --help` (non stampa help, ma conferma che lo script parte).

## 2. Esecuzione automatica consigliata
Lo script `scripts/seed-50th-birthday.mjs` esegue l'intero flusso in due passaggi:

```bash
node scripts/seed-50th-birthday.mjs
```

Cosa fa:
1. Lancia `supabase-50th-birthday-seed.sql` con il placeholder `UUID_50TH_EVENT`. Alla prima esecuzione lo script SQL crea l'evento, stampa l'ID e termina senza inserire le categorie.
2. Recupera l'ID appena creato, sostituisce il placeholder in memoria e rilancia il file SQL per popolare categorie e sottocategorie collegate.

Al termine vedrai `✔ Seed 50° compleanno eseguito con successo.`

## 3. Procedura manuale (alternativa)
Se preferisci operare manualmente:

1. **Crea l'evento**
   ```bash
   node scripts/run-sql.mjs supabase-50th-birthday-seed.sql
   ```
   Alla prima esecuzione lo script SQL crea l'evento, mostra un `NOTICE` con l'ID generato e termina.

2. **Sostituisci il placeholder**
   Prendi l'UUID mostrato nel `NOTICE` e sostituisci tutte le occorrenze di `UUID_50TH_EVENT` nel file `supabase-50th-birthday-seed.sql`.

3. **Popola categorie e sottocategorie**
   ```bash
   node scripts/run-sql.mjs supabase-50th-birthday-seed.sql
   ```
   Stavolta il file userà l'ID reale e inserirà l'intera struttura.

## 4. Verifiche
Query rapide per controllare i dati:
```sql
SELECT id, name FROM events WHERE event_type = 'birthday-50';
SELECT name FROM categories WHERE event_id = '<ID_EVENTO>' ORDER BY display_order;
SELECT name FROM subcategories WHERE category_id IN (
  SELECT id FROM categories WHERE event_id = '<ID_EVENTO>'
) ORDER BY name;
```
Sostituisci `<ID_EVENTO>` con l'UUID reale.

## 5. Ripetizione del seed
- Lo script SQL è pensato per essere rilanciato dopo aver impostato l'ID reale (manuale o via script). Se devi ripartire da zero, ripristina il placeholder `UUID_50TH_EVENT` nel file.
- Puoi usare di nuovo `node scripts/seed-50th-birthday.mjs` per ripetere l'intero flusso senza modificare il file a mano.
