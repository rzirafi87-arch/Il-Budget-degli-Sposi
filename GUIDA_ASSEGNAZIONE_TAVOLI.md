# 🪑 Guida: Assegnazione Intelligente ai Tavoli per Famiglie

## 📋 Panoramica

Il sistema di gestione invitati include una funzionalità flessibile per organizzare gli invitati ai tavoli, con particolare attenzione alla gestione delle famiglie.

## ✨ Caratteristiche Principali

### 1. Gruppi Famiglia
- Crea gruppi famiglia nella sezione "Gruppi Famiglia"
- Ogni famiglia può avere un **contatto principale** (es. capofamiglia)
- Assegna gli invitati alle famiglie tramite la colonna "Famiglia"

### 2. Tavolo Separato (🚫)
La colonna **"🚫 Tavolo separato"** permette di escludere specifici membri della famiglia dall'assegnazione automatica al tavolo famiglia.

#### Caso d'Uso: Tavolo Zii e Tavolo Cugini

**Scenario:**
- 4 famiglie con 4 persone ciascuna (2 genitori + 2 figli cugini)
- Gli sposi vogliono:
  - 2 tavoli con gli 8 genitori (zii)
  - 1 tavolo con gli 8 cugini

**Soluzione:**
1. Crea 4 gruppi famiglia:
   - "Famiglia Rossi"
   - "Famiglia Bianchi"
   - "Famiglia Verdi"
   - "Famiglia Neri"

2. Assegna ogni persona alla rispettiva famiglia

3. Per ogni famiglia, **spunta** la casella "🚫 Tavolo separato" per i 2 cugini

4. Risultato finale:
   - Ogni famiglia avrà **2 membri inclusi** nel tavolo famiglia (i genitori)
   - Ogni famiglia avrà **2 membri esclusi** (i cugini)

5. Nella card della famiglia vedrai:
   ```
   Famiglia Rossi
   🧑 Contatto: Mario Rossi
   👥 Totale: 4 | ✅ Tavolo famiglia: 2
   🚫 Tavolo separato: 2 (Luca Rossi, Sofia Rossi)
   ```

## 🔧 Come Funziona

### Assegnazione Automatica ai Tavoli (UI)

Nella pagina `Invitati → Tavoli` trovi il pulsante "Auto-assegna per Famiglia" e il campo "Posti per tavolo".

1. Imposta il numero di posti per tavolo (consigliato 8-10)
2. Clicca su "Auto-assegna per Famiglia"
3. Vedi l'anteprima con l'elenco dei tavoli creati (Famiglie, Cugini, Amici)
4. Clicca su "Salva disposizione" per salvare nel database

Logica:
- Raggruppa per famiglia gli invitati confermati (`attending = true`)
- Esclude automaticamente chi ha `🚫 Tavolo separato`
- Crea tavoli "Tavolo Famiglia [Nome]" (splittati su più tavoli se superano i posti)
- Raggruppa tutti gli esclusi nei tavoli "Tavolo Cugini 1/2/..."
- Gli invitati senza famiglia vanno in tavoli "Amici"

### Database

Il campo `exclude_from_family_table` è stato aggiunto alla tabella `guests`:

```sql
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS exclude_from_family_table BOOLEAN DEFAULT false;
```

## 📊 Esempio Pratico Completo

### Configurazione
```
Famiglia Rossi (4 persone):
  ✅ Mario Rossi (padre) - Tavolo famiglia
  ✅ Anna Rossi (madre) - Tavolo famiglia
  🚫 Luca Rossi (figlio) - Tavolo separato ✓
  🚫 Sofia Rossi (figlia) - Tavolo separato ✓

Famiglia Bianchi (4 persone):
  ✅ Giovanni Bianchi (padre) - Tavolo famiglia
  ✅ Laura Bianchi (madre) - Tavolo famiglia
  🚫 Marco Bianchi (figlio) - Tavolo separato ✓
  🚫 Giulia Bianchi (figlia) - Tavolo separato ✓

Famiglia Verdi (4 persone):
  ✅ Paolo Verdi (padre) - Tavolo famiglia
  ✅ Chiara Verdi (madre) - Tavolo famiglia
  🚫 Matteo Verdi (figlio) - Tavolo separato ✓
  🚫 Elena Verdi (figlia) - Tavolo separato ✓

Famiglia Neri (4 persone):
  ✅ Roberto Neri (padre) - Tavolo famiglia
  ✅ Silvia Neri (madre) - Tavolo famiglia
  🚫 Andrea Neri (figlio) - Tavolo separato ✓
  🚫 Francesca Neri (figlia) - Tavolo separato ✓
```

### Risultato Assegnazione
```
Tavolo 1 - Zii A:
  - Mario Rossi
  - Anna Rossi
  - Giovanni Bianchi
  - Laura Bianchi

Tavolo 2 - Zii B:
  - Paolo Verdi
  - Chiara Verdi
  - Roberto Neri
  - Silvia Neri

Tavolo 3 - Cugini:
  - Luca Rossi
  - Sofia Rossi
  - Marco Bianchi
  - Giulia Bianchi
  - Matteo Verdi
  - Elena Verdi
  - Andrea Neri
  - Francesca Neri
```

## 🎯 Best Practices

1. **Crea prima le famiglie**: Definisci i gruppi famiglia prima di assegnare gli invitati
2. **Identifica il contatto principale**: Seleziona un capofamiglia per ogni gruppo
3. **Marca gli esclusi**: Spunta "🚫 Tavolo separato" per chi vuoi separare dal resto della famiglia
4. **Salva frequentemente**: Clicca su "💾 Salva tutto" dopo ogni modifica importante
5. **Visualizza il riepilogo**: Le card famiglia mostrano quanti membri sono inclusi/esclusi

## 🔮 Prossimi Sviluppi

- [ ] Assegnazione automatica intelligente basata su famiglie
- [ ] Drag & drop per organizzare i tavoli visivamente
- [ ] Suggerimenti automatici per ottimizzare la disposizione
- [ ] Export layout tavoli in PDF

## 📝 Note

- Il campo "🚫 Tavolo separato" è **disabilitato** se l'invitato non è assegnato a una famiglia
- Quando modifichi il nome di una famiglia, il nome si aggiorna automaticamente per tutti i membri
- Gli invitati esclusi **continuano a far parte della famiglia** ai fini statistici, ma vengono ignorati nell'assegnazione automatica ai tavoli
