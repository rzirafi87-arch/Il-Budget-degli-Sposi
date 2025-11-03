# 🎂 COMPLEANNO - GUIDA SETUP COMPLETA

> **Evento**: Compleanno (Birthday)  
> **Codice tipo**: `birthday`  
> **Budget medio**: €3.000  
> **Timeline**: 2 mesi di preparazione (adattabile)

---

## 🎯 PANORAMICA EVENTO

Il **Compleanno** è un evento versatile pensato per celebrare compleanni di ogni età (bambini, adolescenti, adulti, milestone importanti). La struttura è modulare e adattabile allo stile scelto.

### Caratteristiche distintive
- 🎨 **Adattabilità**: funziona per 1 anno, 18 anni, 30, 40, 50+
- 🎭 **Stili diversi**: intimo, informale, elegante, tematico
- 🏠 **Location flessibile**: casa, giardino, ristorante, locale, villa
- 🎈 **Natural Chic**: armonia visiva anche nelle feste più semplici

---

## 📋 INSTALLAZIONE DATABASE

### PREREQUISITI
- ✅ Supabase project attivo o PostgreSQL locale
- ✅ Schema base eventi installato (`supabase-COMPLETE-SETUP.sql`)
- ✅ Tabelle `events`, `categories`, `subcategories` esistenti

### ⚠️ IMPORTANTE: Esegui PRIMA la patch colonne

Prima di installare il seed Compleanno, devi aggiungere le colonne necessarie alla tabella `events`:

#### STEP 0: Patch Colonne Multi-Evento (OBBLIGATORIO)

**Via Supabase Dashboard** (CONSIGLIATO):
1. Apri [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona `</>` nella sidebar)
4. Clicca **New Query**
5. Copia e incolla il contenuto di `supabase-multi-event-columns-patch.sql`
6. Clicca **Run** (o `Ctrl+Enter`)
7. Verifica output: "SELECT 5" (significa 5 colonne aggiunte)

Questo aggiunge:
- `event_type` TEXT
- `event_date` DATE
- `event_location` TEXT
- `description` TEXT
- `color_theme` TEXT
- Tabella `timeline_items`
- Colonne display a `categories` e `subcategories`

### STEP 1: Esegui seed SQL

**⭐ CONSIGLIATO: Via Supabase Dashboard**

1. Apri [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca **New Query**
5. Copia e incolla il contenuto di `supabase-birthday-seed.sql`
6. Clicca **Run**
7. Verifica output: Messaggio di successo

#### Opzione B: Supabase CLI (se installato)
```bash
# Prima la patch
supabase db execute -f supabase-multi-event-columns-patch.sql

# Poi il seed
supabase db execute -f supabase-birthday-seed.sql
```

#### Opzione C: PostgreSQL Locale (psql)
```bash
# Prima la patch
psql -U postgres -d ibds -f supabase-multi-event-columns-patch.sql

# Poi il seed
psql -U postgres -d ibds -f supabase-birthday-seed.sql
```

#### Opzione D: Script Node.js (se connessione funzionante)
```bash
# Prima la patch
node scripts/run-sql.mjs supabase-multi-event-columns-patch.sql

# Poi il seed
node scripts/run-sql.mjs supabase-birthday-seed.sql
```

**Nota**: Se ricevi errori di connessione con lo script Node.js, usa il metodo Dashboard (Opzione A).

### STEP 2: Verifica installazione
Esegui questa query per confermare:

```sql
SELECT 
  e.name AS evento,
  e.event_type,
  e.total_budget,
  COUNT(DISTINCT c.id) AS categorie,
  COUNT(DISTINCT s.id) AS sottocategorie
FROM events e
LEFT JOIN categories c ON c.event_id = e.id
LEFT JOIN subcategories s ON s.category_id = c.id
WHERE e.event_type = 'birthday'
GROUP BY e.id, e.name, e.event_type, e.total_budget;
```

**Output atteso**:
```
evento      | event_type | total_budget | categorie | sottocategorie
Compleanno  | birthday   | 3000.00      | 10        | ~50
```

---

## 🗂️ STRUTTURA CATEGORIE

### 1. LOCATION E ALLESTIMENTO 🏠
**Scopo**: Spazio e decorazioni per la festa  
**Budget medio**: €800 - €2.000  
**Opzioni location**:
- 🏡 Casa o giardino privato
- 🍽️ Ristorante o trattoria
- 🌿 Terrazza panoramica
- 🏛️ Villa o locale affittato
- 🌳 Parco o spazio all'aperto

**Sottocategorie**:
- Scelta location
- Affitto sala/spazio esterno
- Allestimento tavoli e mise en place
- Decorazioni a tema (colori, età, stile)
- Balloon wall, backdrop, scritte luminose
- Fiori e centrotavola naturali
- Luci decorative e candele
- Angolo photobooth o cornice selfie

---

### 2. CATERING / RISTORAZIONE 🍽️
**Scopo**: Servizio ristorazione completo  
**Budget medio**: €700 - €1.500  
**Opzioni format**:
- **Pranzo**: menù tradizionale seduti
- **Cena**: servizio al tavolo elegante
- **Apericena**: buffet ricco e informale
- **Buffet**: finger food e piatti da condividere

**Sottocategorie**:
- Pranzo/cena/apericena/buffet
- Menù personalizzato (adulti/bambini)
- Sweet table o dessert corner
- Torta di compleanno personalizzata
- Bevande e cocktail
- Servizio catering o locale interno

---

### 3. INVITI E GRAFICA 💌
**Scopo**: Comunicazione visiva e coordinato evento  
**Budget medio**: €150 - €400  
**Elementi inclusi**:
- Inviti cartacei o digitali
- Tema grafico (colori, font, simboli)
- Coordinato grafico (segnaposti, menù, cartellonistica)
- Biglietti di ringraziamento
- QR code per raccolta foto/video

---

### 4. FOTO E VIDEO 📸
**Scopo**: Immortalare i momenti della festa  
**Budget medio**: €300 - €800  
**Servizi consigliati**:
- Fotografo/videomaker
- Shooting del compleanno
- Reel o mini video per social
- Polaroid corner
- Album digitale o fisico

---

### 5. MUSICA E INTRATTENIMENTO 🎶
**Scopo**: Animazione e divertimento ospiti  
**Budget medio**: €300 - €1.000  
**Opzioni**:
- DJ o band live
- Playlist personalizzata (Spotify/Apple Music)
- Giochi o animazione (bambini o adulti)
- Spettacoli (magia, karaoke, performance)
- Presentatore/amico per momenti chiave

**Sottocategorie**:
- DJ/band live
- Playlist personalizzata
- Giochi/animazione
- Spettacoli
- Presentatore/brindisi/sorprese

---

### 6. ABBIGLIAMENTO E BEAUTY 👗
**Scopo**: Look del festeggiato/a  
**Budget medio**: €200 - €600  
**Elementi inclusi**:
- Outfit del festeggiato/a
- Trucco e parrucco (se evento serale o fotografico)
- Accessori e styling coordinato
- Shooting pre-evento (opzionale)

---

### 7. REGALI E RINGRAZIAMENTI 🎁
**Scopo**: Gestione regali ospiti e bomboniere  
**Budget medio**: €150 - €500  
**Sottocategorie**:
- Lista regali o raccolta digitale
- Tavolo regali o angolo dedicato
- Bomboniere o gift bag
- Biglietti di ringraziamento

---

### 8. INTRATTENIMENTO EXTRA 🧸
**Scopo**: Attività supplementari per coinvolgere gli ospiti  
**Budget medio**: €200 - €700  
**Opzioni**:
- Angolo giochi o area relax
- Proiezione video ricordo o foto degli anni passati
- Animazione bambini (se presenti)
- Spettacolo finale (fuochi freddi, lanterne, video emozionale)

---

### 9. TRASPORTI E LOGISTICA 🚗
**Scopo**: Facilitare arrivo/partenza ospiti e materiali  
**Budget medio**: €100 - €400  
**Sottocategorie**:
- Parcheggi ospiti
- Navetta (se location lontana)
- Trasporto decorazioni e fornitori
- Pernottamento ospiti (se evento fuori città)

---

### 10. GESTIONE BUDGET 💶
**Scopo**: Monitoraggio finanziario completo  
**Gestito in app**  
**Sottocategorie**:
- Budget stimato
- Acconti versati
- Saldi fornitori
- Spese extra
- Totale finale
- Regali ricevuti

---

## 🗓️ TIMELINE COMPLEANNO - "DALL'IDEA ALLA FESTA"

### 🔸 2 MESI PRIMA
**Fase: Ideazione e pianificazione**

✅ **Task principali**:
1. Definisci tipo di festa (intima, elegante, tematica, familiare)
2. Scegli data e location
3. Scegli tema e palette colori
4. Contatta fotografo/videomaker
5. Richiedi preventivi catering/ristorante/torta
6. Stila lista invitati
7. Imposta budget nell'app

**Priorità**: Alta  
**Tempo stimato**: 6-8 ore totali

---

### 🔸 1 MESE PRIMA
**Fase: Conferme e fornitori**

✅ **Task principali**:
1. Invia inviti ufficiali
2. Ordina decorazioni e fiori
3. Prenota torta e sweet table
4. Prenota musica/DJ/intrattenimento
5. Scegli outfit
6. Conferma fotografo/videomaker
7. Decidi bomboniere/regali ospiti

**Priorità**: Alta  
**Tempo stimato**: 4-6 ore totali

---

### 🔸 2 SETTIMANE PRIMA
**Fase: Rifinitura**

✅ **Task principali**:
1. Invia brief fornitori (orari, scaletta, colori)
2. Prepara playlist personalizzata
3. Ricevi dolci/decorazioni/allestimenti
4. Prepara photobooth o backdrop
5. Prova trucco e parrucco (se previsto)

**Priorità**: Media  
**Tempo stimato**: 3-4 ore totali

---

### 🔸 1 SETTIMANA PRIMA
**Fase: Coordinamento finale**

✅ **Task principali**:
1. Ultimo check con location e fornitori
2. Controlla pagamenti/acconti
3. Stampa checklist evento
4. Organizza trasporto materiali e fornitori
5. Prepara gift bag e bomboniere

**Priorità**: Alta  
**Tempo stimato**: 2-3 ore totali

---

### 🔸 GIORNO DEL COMPLEANNO 🎉
**Fase: La festa**

✅ **Scaletta tipo**:
1. Allestimento mattina o giorno prima
2. Shooting iniziale
3. Accoglienza ospiti e aperitivo
4. Cena/buffet/apericena
5. Taglio torta e brindisi
6. Musica, balli e intrattenimento
7. Ringraziamenti finali

**Priorità**: Alta  
**Durata**: 4-6 ore evento

---

### 🔸 DOPO L'EVENTO
**Fase: Chiusura e ricordi**

✅ **Task principali**:
1. Invia ringraziamenti digitali/cartoline
2. Condividi foto e video
3. Completa saldi fornitori
4. Aggiorna bilancio finale
5. Crea mini album digitale o reel

**Priorità**: Media  
**Tempo stimato**: 2-3 ore totali

---

## 🎨 STILI CONSIGLIATI (NATURAL CHIC)

### 🌸 Boho Natural (Bambini/Adolescenti)
- **Palette**: Pastello, avorio, verde salvia
- **Elementi**: Fiori campestri, palloncini naturali, legno
- **Location**: Giardino, terrazza, casa

### ✨ Elegant Minimal (Adulti 30-40)
- **Palette**: Nero, bianco, oro, argento
- **Elementi**: Luci soffuse, candele, fiori bianchi
- **Location**: Ristorante, rooftop, loft

### 🎭 Vintage Chic (40-50+)
- **Palette**: Bordeaux, verde bottiglia, ottone
- **Elementi**: Dettagli retrò, vinili, polaroid
- **Location**: Villa d'epoca, wine bar, libreria

### 🌿 Garden Party (Milestone speciali)
- **Palette**: Verde, bianco, crema, rame
- **Elementi**: Piante, fiori freschi, tavole lunghe
- **Location**: Giardino botanico, agriturismo, terrazza verde

---

## 💻 INTEGRAZIONE NELL'APP

### TypeScript Types
Il tipo `birthday` è già configurato:

```typescript
// src/constants/eventConfigs.ts
export type EventType =
  | "wedding"
  | "baptism"
  | "turning-18"
  | "anniversary"
  | "gender-reveal"
  | "birthday"  // ← GIÀ PRESENTE
  | "turning-50"
  | "retirement"
  | "confirmation"
  | "graduation";
```

### Event Configuration
La configurazione evento è già presente in `EVENT_CONFIGS`:

```typescript
birthday: {
  name: "Compleanno",
  emoji: "🎂",
  budgetSectionTitle: "Imposta Budget Compleanno",
  dateLabel: "Data Festa",
  totalBudgetLabel: "Budget Festa",
  spendTypeLabel: "Pagato da",
  eventDateMessage: "Il compleanno è il",
  timelineTitle: "Timeline Compleanno",
  timelineDescription: "Adatta questa guida ad ogni età per un compleanno memorabile.",
  // ... timeline tasks, budget categories, contributors
}
```

### Budget Categories
Le categorie budget sono già mappate in `BIRTHDAY_BUDGET_CATEGORIES`:

```typescript
export const BIRTHDAY_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Location: ["Affitto", "Pulizie", "Permessi", "Allestimento"],
  Catering: ["Buffet", "Torta", "Bevande", "Servizio"],
  Decor: ["Allestimenti", "Luci", "Palloncini", "Fiori"],
  Intrattenimento: ["Musica", "Giochi", "Animazione", "Spettacoli"],
  Ospiti: ["Inviti", "Segnaposto", "Regali ospiti", "Ringraziamenti"],
  Regali: ["Regalo principale", "Esperienza", "Donation", "Pacchetti sorpresa"],
  Organizzazione: ["Fotografo", "Video", "Trasporti", "Contingenze"],
};
```

---

## 🧪 TEST E VERIFICA

### Test Creazione Evento
1. Login utente
2. Vai su `/selezione-evento`
3. Seleziona "Compleanno 🎂"
4. Imposta budget (es. €3.000)
5. Scegli data (es. 2 mesi avanti)
6. Verifica creazione evento nel database
7. Vai su dashboard evento

### Test Budget Categories
1. Dashboard evento Compleanno
2. Verifica presenza 10 categorie
3. Espandi categoria "Location e Allestimento"
4. Verifica 8 sottocategorie
5. Aggiungi spesa in "Affitto sala/spazio esterno"
6. Verifica aggiornamento budget totale

### Test Timeline
1. Vai su `/timeline` evento Compleanno
2. Verifica task organizzati in 6 bucket temporali
3. Spunta task "Definisci tipo di festa"
4. Verifica persistenza stato

---

## 🚀 PROSSIMI STEP (SVILUPPO)

### 1. UI Card Evento
Crea card in `/selezione-evento`:
```tsx
<EventCard
  type="birthday"
  emoji="🎂"
  title="Compleanno"
  description="Adattabile a ogni età, dal primo anno ai milestone speciali"
  budgetRange="€500 - €5.000"
  timeline="2 mesi"
  onClick={() => createEvent('birthday')}
/>
```

### 2. Dashboard Dedicata
Rotta: `/eventi/birthday/dashboard`
- Overview budget
- Categorie espandibili
- Progress bar spese vs budget
- Quick actions (aggiungi spesa, fornitore)

### 3. Timeline Interattiva
Rotta: `/eventi/birthday/timeline`
- Bucket temporali (2 mesi prima → dopo evento)
- Checkbox task completati
- Notifiche scadenze

### 4. Fornitori Suggeriti
Integra fornitori esistenti:
- Fotografi (tabella `suppliers`)
- Location (tabella `locations`)
- Catering (filtro per tipo evento)

---

## ⚠️ TROUBLESHOOTING

### Errore: "column event_type does not exist"
**Causa**: Patch colonne non eseguita  
**Soluzione**: Esegui `supabase-multi-event-columns-patch.sql` PRIMA del seed

### Errore: "duplicate key value violates unique constraint"
**Causa**: Evento già esistente nel database  
**Soluzione**:
```sql
DELETE FROM events WHERE event_type = 'birthday';
-- Poi riesegui seed
```

### Query verifica restituisce 0 righe
**Possibili cause**:
1. Seed eseguito su progetto Supabase sbagliato
2. Seed non completato (errore silenzioso)
3. Connessione database errata

**Soluzione**: Verifica progetto attivo in Supabase Dashboard e riesegui seed

### Categorie non visibili in dashboard
**Causa**: Mismatch tra seed DB e config TypeScript  
**Soluzione**: Verifica che `BIRTHDAY_BUDGET_CATEGORIES` corrisponda alle categorie del seed

---

## 📚 RISORSE AGGIUNTIVE

### File correlati
- `supabase-birthday-seed.sql` - Seed database evento
- `BIRTHDAY-QUICK-START.md` - Guida installazione rapida (3 min)
- `BIRTHDAY-COMPLETAMENTO.md` - Documentazione tecnica
- `BIRTHDAY-IMPLEMENTATION-SUMMARY.md` - Summary sviluppatori
- `src/constants/eventConfigs.ts` - Configurazione evento TypeScript
- `src/constants/budgetCategories.ts` - Mapping categorie budget

### Checklist completa
Vedi `CHECKLIST_SQL_SEEDS.md` per panoramica tutti eventi disponibili.

---

## ✅ COMPLETION CHECKLIST

- [ ] Patch colonne eseguita
- [ ] Seed birthday installato
- [ ] Query verifica restituisce dati corretti
- [ ] Tipo TypeScript `birthday` verificato
- [ ] Configurazione evento presente in `EVENT_CONFIGS`
- [ ] Budget categories mappate
- [ ] UI card evento creata
- [ ] Dashboard evento implementata
- [ ] Timeline task funzionante
- [ ] Test creazione evento OK
- [ ] Test aggiunta spese OK
- [ ] Test timeline task OK

---

🎂 **Compleanno pronto per l'integrazione completa!** ✨

**Durata setup completo**: 5-10 minuti (database) + sviluppo UI
**Risultato**: Evento Compleanno generico adattabile a tutte le età con gestione budget, fornitori e timeline!
