# 🚀 Quick Start: Festa di Fidanzamento

## Installazione Rapida (3 minuti)

### 1. Apri Supabase Dashboard
Vai su: https://supabase.com/dashboard  
→ Seleziona il tuo progetto  
→ Clicca su **SQL Editor** (icona `</>`)

### 2. Esegui Patch Colonne (PRIMA VOLTA)
Se non l'hai mai fatto, esegui questo PRIMA:

1. Clicca **New Query**
2. Copia TUTTO il contenuto di `supabase-multi-event-columns-patch.sql`
3. Incolla nell'editor
4. Clicca **Run** (o premi `Ctrl+Enter`)
5. ✅ Verifica che appaia "SELECT 5" o simile (senza errori rossi)

### 3. Esegui Seed Evento
Ora installa l'evento Festa di Fidanzamento:

1. Clicca **New Query** (nuova tab)
2. Copia TUTTO il contenuto di `supabase-engagement-party-seed.sql`
3. Incolla nell'editor
4. Clicca **Run**
5. ✅ Verifica messaggio "Created Engagement Party event with ID: ..."

### 4. Verifica Installazione
Nella stessa SQL Editor, esegui:

```sql
SELECT 
  e.name AS evento,
  e.event_type,
  e.total_budget,
  COUNT(DISTINCT c.id) AS categorie,
  COUNT(DISTINCT s.id) AS sottocategorie,
  COUNT(DISTINCT t.id) AS timeline_items
FROM events e
LEFT JOIN categories c ON c.event_id = e.id
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN timeline_items t ON t.event_id = e.id
WHERE e.event_type = 'engagement-party'
GROUP BY e.id, e.name, e.event_type, e.total_budget;
```

**Output atteso**:
```
evento                 | event_type       | total_budget | categorie | sottocategorie | timeline_items
Festa di Fidanzamento | engagement-party | 5000.00      | 11        | 58             | 34
```

✅ **Tutto OK!** L'evento è installato correttamente.

---

## Prossimi Passi

1. **Integra nell'app**: Aggiungi `engagement-party` ai tipi evento TypeScript
2. **Crea UI**: Implementa card evento e dashboard
3. **Testa**: Crea un evento di test e verifica tutte le funzionalità

📚 **Documentazione completa**: Vedi `ENGAGEMENT-PARTY-SETUP-GUIDE.md`

---

## ⚠️ Troubleshooting

**Errore: "column event_type does not exist"**
→ Devi eseguire PRIMA la patch `supabase-multi-event-columns-patch.sql`

**Errore: "duplicate key value violates unique constraint"**
→ L'evento esiste già. Per reinstallare, prima elimina:
```sql
DELETE FROM events WHERE event_type = 'engagement-party';
```
Poi riesegui il seed.

**Nessun errore ma query verifica restituisce 0 righe**
→ Controlla che il seed sia stato eseguito sul progetto Supabase corretto
→ Verifica nel SQL Editor la tab/connessione attiva

---

💡 **Tip**: Salva le query di verifica come "Saved Query" in Supabase per riutilizzarle facilmente!
