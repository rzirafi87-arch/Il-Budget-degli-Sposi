# 💍 FESTA DI FIDANZAMENTO - GUIDA SETUP COMPLETA

> **Evento**: Festa di Fidanzamento (Engagement Party)  
> **Codice tipo**: `engagement-party`  
> **Budget medio**: €5.000  
> **Timeline**: 2-3 mesi di preparazione

---

## 🎯 PANORAMICA EVENTO

La **Festa di Fidanzamento** è un evento elegante e romantico che celebra l'impegno d'amore della coppia. Può essere:
- **Evento autonomo**: celebrazione del fidanzamento senza matrimonio immediato
- **Pre-matrimoniale**: primo passo verso il matrimonio, annuncio ufficiale agli invitati
- **Evento ibrido**: include cerimonia simbolica di scambio promesse

### Caratteristiche distintive
- ✨ **Mix romantico-sociale**: momento intimo della coppia + festa con ospiti
- 🎨 **Identità coppia**: monogramma, palette colori, storia relazione
- 📸 **Focus contenuti**: forte componente visual e social media
- 🎭 **Flessibilità stile**: da boho informale a gala elegante

---

## 📋 INSTALLAZIONE DATABASE

### PREREQUISITI
- ✅ Supabase project attivo o PostgreSQL locale
- ✅ Schema base eventi installato (`supabase-COMPLETE-SETUP.sql`)
- ✅ Tabelle `events`, `categories`, `subcategories`, `timeline_items` esistenti

### STEP 1: Esegui seed SQL

#### Opzione A: Supabase Cloud (Dashboard)
1. Apri Supabase Dashboard
2. Vai su **SQL Editor**
3. Apri file `supabase-engagement-party-seed.sql`
4. Clicca **Run**
5. Verifica output: "Created Engagement Party event with ID: [uuid]"

#### Opzione B: Supabase Cloud (CLI)
```bash
supabase db push supabase-engagement-party-seed.sql
```

#### Opzione C: PostgreSQL Locale (psql)
```bash
psql -U postgres -d ibds -f supabase-engagement-party-seed.sql
```

#### Opzione D: VS Code Task (per dev locale)
1. Apri `supabase-engagement-party-seed.sql` in VS Code
2. `Ctrl+Shift+P` → "Tasks: Run Task"
3. Seleziona: **"Run SQL: Current File (local PG)"**

### STEP 2: Verifica installazione
Esegui questa query per confermare:

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
evento                  | event_type       | total_budget | categorie | sottocategorie | timeline_items
Festa di Fidanzamento  | engagement-party | 5000.00      | 11        | 58             | 34
```

---

## 🗂️ STRUTTURA CATEGORIE

### 1. CERIMONIA O MOMENTO SIMBOLICO 💍
**Scopo**: Momento formale di scambio promesse o conferma fidanzamento  
**Budget medio**: €2.000  
**Elementi chiave**:
- Scelta location cerimonia
- Officiante/amico conduttore
- Musica dal vivo (violino, chitarra)
- Decorazioni arco/area cerimonia
- Servizio foto/video dedicato

---

### 2. LOCATION E ALLESTIMENTO 🏛️
**Scopo**: Spazio elegante per festa e allestimento scenografico  
**Budget medio**: €4.250  
**Opzioni location**:
- 🏰 Villa storica
- 🌿 Terrazza panoramica
- 🍽️ Ristorante gourmet
- 🌸 Giardino botanico
- 🏖️ Spiaggia privata

**Elementi decorativi**:
- Palette colori coordinata
- Fiori freschi o composizioni naturali
- Luci, candele, lanterne
- Photobooth/backdrop personalizzato
- Angolo "storia della coppia"

---

### 3. CATERING / RISTORAZIONE 🍽️
**Scopo**: Servizio ristorazione completo  
**Budget medio**: €5.800  
**Opzioni format**:
- **Pranzo**: menù 3-4 portate seduti
- **Cena**: servizio gourmet al tavolo
- **Apericena**: buffet ricco + cocktail bar

**Elementi inclusi**:
- Sweet table coordinato
- Torta di fidanzamento
- Bevande e cocktail signature
- Brindisi con champagne/prosecco

---

### 4. ABBIGLIAMENTO E BEAUTY 👗
**Scopo**: Look elegante coordinato coppia  
**Budget medio**: €1.700  
**Per lei**:
- Abito elegante (lungo/midi)
- Trucco e parrucco professionale
- Accessori (gioielli, scarpe)

**Per lui**:
- Completo elegante o smoking
- Boutonnière coordinata
- Accessori (gemelli, scarpe)

---

### 5. FOTO, VIDEO E CONTENUTI 📸
**Scopo**: Immortalare ogni momento  
**Budget medio**: €2.950  
**Servizi consigliati**:
- Fotografo + videomaker (pacchetto completo)
- Shooting pre-evento coppia
- Riprese momento cerimonia/brindisi
- Reel social (Instagram/TikTok)
- Album digitale + stampa

**Extra**:
- Angolo Polaroid per ospiti
- Cornice personalizzata con monogramma
- Drone per riprese aeree

---

### 6. INVITI E GRAFICA 💌
**Scopo**: Coordinato grafico identità coppia  
**Budget medio**: €1.000  
**Elementi**:
- Inviti digitali (email/WhatsApp) o cartacei
- Monogramma coppia personalizzato
- Palette colori + font coordinati
- Segnaposti, menù, tableau
- QR code per galleria foto condivisa
- Biglietti ringraziamento

---

### 7. REGALI E RINGRAZIAMENTI 🎁
**Scopo**: Pensierini ospiti e gestione regali  
**Budget medio**: €750  
**Elementi**:
- Lista regali online (Zankyou, Amazon, bonifico)
- Bomboniere eleganti (candele, piantine, dolciumi)
- Gift bag personalizzate
- Guestbook/libro dediche

---

### 8. MUSICA E INTRATTENIMENTO 🎵
**Scopo**: Atmosfera musicale e animazione  
**Budget medio**: €1.400  
**Opzioni**:
- DJ set professionale
- Band live (jazz, swing, pop)
- Playlist Spotify personalizzata
- Presentatore/animatore per brindisi
- Sorpresa (video emozionale, fuochi freddi)

---

### 9. TRASPORTI E LOGISTICA 🚗
**Scopo**: Mobilità coppia e ospiti  
**Budget medio**: €1.450  
**Servizi**:
- Auto d'epoca/elegante per coppia
- Navetta ospiti (se location lontana)
- Gestione parcheggi/permessi ZTL
- Hotel/B&B per ospiti fuori città

---

### 10. GESTIONE BUDGET 💰
**Scopo**: Tracciamento spese e pagamenti  
**Categoria amministrativa** (€0)  
**Funzionalità app**:
- Budget totale stimato
- Acconti versati per fornitore
- Saldi da pagare
- Spese extra impreviste
- Report finale consuntivo

---

## 🗓️ TIMELINE: "DAL SÌ ALLA FESTA"

### 🔸 2-3 MESI PRIMA: Idea e Pianificazione
**Obiettivo**: Definire concept e prenotare fornitori chiave

**Task**:
1. ✅ Fissa data e location
2. ✅ Decidi formato evento (cerimonia + festa o solo festa)
3. ✅ Scegli stile: boho, elegante, rustic chic, minimal
4. ✅ Prenota fotografo/videomaker
5. ✅ Richiedi preventivi catering/torta
6. ✅ Compila lista invitati (50-150 persone tipico)
7. ✅ Imposta budget in app

**Checklist essenziale**:
- [ ] Location prenotata con caparra versata
- [ ] Fotografo confermato
- [ ] Budget totale definito
- [ ] Tema e colori scelti

---

### 🔸 1 MESE PRIMA: Conferme e Fornitori
**Obiettivo**: Confermare tutti i fornitori e avviare ordini

**Task**:
8. ✅ Invia inviti ufficiali (digitali o cartacei)
9. ✅ Ordina fiori e decorazioni
10. ✅ Ordina torta e sweet table
11. ✅ Scegli outfit coppia
12. ✅ Prenota DJ/musica
13. ✅ Brief dettagliato fotografo
14. ✅ Ordina bomboniere

**Checklist essenziale**:
- [ ] Tutti i fornitori confermati con contratto
- [ ] Acconti versati (50% tipico)
- [ ] Inviti inviati, RSVP raccolti
- [ ] Outfit acquistati/noleggiati

---

### 🔸 2 SETTIMANE PRIMA: Rifinitura
**Obiettivo**: Coordinare dettagli operativi e finalizzare elementi grafici

**Task**:
15. ✅ Brief fornitori con orari e scaletta
16. ✅ Prepara playlist personalizzata
17. ✅ Organizza decorazioni DIY
18. ✅ Stampa cartellonistica (welcome board, tableau, menù)
19. ✅ Verifica acconti e programma saldi

**Checklist essenziale**:
- [ ] Timeline evento condivisa con tutti
- [ ] Playlist musicale caricata
- [ ] Tutto il materiale grafico stampato
- [ ] Situazione pagamenti chiara

---

### 🔸 1 SETTIMANA PRIMA: Coordinamento Finale
**Obiettivo**: Verifiche finali e prove tecniche

**Task**:
20. ✅ Sopralluogo finale location + test audio/luci
21. ✅ Prova trucco e parrucco
22. ✅ Organizza trasporti materiali + noleggio auto
23. ✅ Stampa checklist giorno evento

**Checklist essenziale**:
- [ ] Ultimo briefing con location manager
- [ ] Hair & makeup trial completato
- [ ] Auto noleggiata/confermata
- [ ] Checklist stampata e distribuita

---

### 🔸 GIORNO DELLA FESTA 💞
**Obiettivo**: Godersi la celebrazione!

**Timeline tipo**:
- **Mattina**: Allestimento location (2-3 ore)
- **Pre-evento**: Shooting coppia (1 ora)
- **Arrivo ospiti**: Welcome drink (30 min)
- **Cerimonia simbolica**: Scambio promesse (15-20 min) *opzionale*
- **Brindisi ufficiale**: Toast e taglio torta (15 min)
- **Ristorazione**: Cena/apericena (2-3 ore)
- **Intrattenimento**: Musica, balli, photo booth (2-3 ore)
- **Saluti**: Consegna bomboniere, thank you (30 min)

**Durata totale**: 6-8 ore

---

### 🔸 DOPO L'EVENTO: Chiusura e Ricordi
**Obiettivo**: Completare pagamenti e conservare ricordi

**Task**:
30. ✅ Invia ringraziamenti digitali/cartoline (entro 1 settimana)
31. ✅ Scarica foto da fotografo e ospiti (QR code gallery)
32. ✅ Completa tutti i saldi fornitori
33. ✅ Aggiorna consuntivo finale in app
34. ✅ Crea album digitale o video montato

**Checklist essenziale**:
- [ ] Tutti i fornitori pagati
- [ ] Thank you inviati a tutti
- [ ] Album foto completato
- [ ] Budget finale chiuso in app

---

## 🎨 STILI CONSIGLIATI

### 🌸 BOHO CHIC
**Caratteristiche**:
- Fiori di campo, pampas grass, gypsophila
- Palette: terracotta, beige, verde salvia
- Location: casale rustico, giardino, vigna
- Abbigliamento: abito fluido, look naturale

**Budget tipico**: €3.500 - €5.000

---

### 👑 ELEGANTE CLASSICO
**Caratteristiche**:
- Fiori nobili (rose, orchidee, peonie)
- Palette: oro, avorio, champagne
- Location: villa storica, hotel 5 stelle
- Abbigliamento: abito lungo, smoking

**Budget tipico**: €6.000 - €10.000

---

### 🌿 RUSTIC CHIC
**Caratteristiche**:
- Materiali naturali (legno, iuta, ulivo)
- Palette: verde, bianco, marrone
- Location: agriturismo, cascina, masseria
- Abbigliamento: casual elegante, lino

**Budget tipico**: €3.000 - €4.500

---

### 🎭 MINIMAL ROMANTICO
**Caratteristiche**:
- Pochi elementi, design pulito
- Palette: bianco, nude, un colore accento
- Location: loft, terrazza moderna
- Abbigliamento: linee essenziali, contemporaneo

**Budget tipico**: €4.000 - €6.000

---

## 📊 GESTIONE BUDGET IN APP

### Impostazione Budget Iniziale
1. Accedi a dashboard evento
2. Vai su **"Gestione Budget"**
3. Imposta budget totale: €5.000 (suggerito)
4. Sistema auto-distribuisce per categorie

### Distribuzione Consigliata
```
Location e Allestimento:     25%  →  €1.250
Catering/Ristorazione:       30%  →  €1.500
Foto e Video:               20%  →  €1.000
Cerimonia simbolica:        10%  →  €500
Abbigliamento e Beauty:     8%   →  €400
Musica e Intrattenimento:   8%   →  €400
Inviti e Grafica:          5%   →  €250
Regali/Bomboniere:         4%   →  €200
Trasporti:                 5%   →  €250
Buffer imprevisti:         10%  →  €500
```

### Tracciamento Spese
Per ogni spesa:
1. Seleziona categoria
2. Inserisci fornitore, importo, note
3. Carica ricevuta/fattura
4. Segna acconti vs saldo
5. App calcola automaticamente:
   - Budget residuo per categoria
   - Percentuale spesa vs preventivo
   - Alert se sforamento

---

## 🔧 INTEGRAZIONE APP

### STEP 1: Aggiungi tipo evento
**File**: `src/types/events.ts` (o equivalente)

```typescript
export type EventType = 
  | 'wedding'
  | 'baptism'
  | 'communion'
  | 'confirmation'
  | 'birthday-18'
  | 'graduation'
  | 'anniversary'
  | 'babyshower'
  | 'genderreveal'
  | 'engagement-party'; // ← NUOVO

export const EVENT_LABELS: Record<EventType, string> = {
  // ... existing
  'engagement-party': 'Festa di Fidanzamento',
};

export const EVENT_ICONS: Record<EventType, string> = {
  // ... existing
  'engagement-party': '💍',
};
```

### STEP 2: Aggiungi card selezione evento
**File**: `src/app/selezione-evento/page.tsx` (o equivalente)

```tsx
<EventCard
  type="engagement-party"
  title="Festa di Fidanzamento"
  description="Celebra l'impegno d'amore con eleganza e romanticismo"
  icon="💍"
  budget="€5.000"
  planning="2-3 mesi"
  theme="#D4AF37"
/>
```

### STEP 3: Crea dashboard specifica
**File**: `src/app/eventi/engagement-party/dashboard/page.tsx`

Componenti chiave:
- **Budget Overview**: visualizzazione spesa per categoria
- **Timeline Checklist**: task organizzati per fase
- **Countdown**: giorni mancanti all'evento
- **Supplier Tracker**: stato pagamenti fornitori
- **Photo Gallery**: integrazione raccolta foto ospiti

### STEP 4: Timeline Interattiva
Implementa interfaccia per gestire i 34 task:
- Checkbox completamento
- Date picker per ogni task
- Note/allegati per task
- Progress bar visuale per fase

---

## 📱 FUNZIONALITÀ CONSIGLIATE

### 1. Storia della Coppia (Timeline)
**Cosa**: Bacheca digitale con momenti salienti relazione

**Implementazione**:
```typescript
interface CoupleStoryMilestone {
  date: Date;
  title: string;
  description: string;
  photo?: string;
  location?: string;
}

// Esempi:
// - Primo incontro
// - Prima uscita
// - Primo viaggio insieme
// - Proposta di fidanzamento
```

**UI**: Card timeline verticale con foto e testi

---

### 2. Votazioni Ospiti
**Cosa**: Mini-giochi interattivi per coinvolgere invitati

**Esempi**:
- "Indovina la data del matrimonio"
- "Quiz sulla coppia"
- "Scommessa: maschio o femmina primo figlio"

**Integrazione**: Widget nella pagina evento pubblica

---

### 3. Raccolta Foto Collaborativa
**Cosa**: QR code per upload foto da smartphone ospiti

**Tecnologia**:
- QR code → Link galleria condivisa
- Upload diretto da mobile
- Moderazione automatica (AI blur visi sensibili)
- Generazione album automatico post-evento

---

### 4. Monogramma Generator
**Cosa**: Tool AI per creare monogramma coppia

**Input**: Iniziali nomi + stile preferito
**Output**: SVG vettoriale per tutti i materiali grafici
**Utilizzo**: Inviti, tableau, backdrop, bomboniere

---

### 5. Countdown Matrimonio
**Cosa**: Se festa è pre-matrimoniale, mostra countdown al matrimonio

**Visualizzazione**:
```
Mancano 365 giorni al matrimonio! 💍
[Progress bar visuale]
```

---

## 🎯 CHECKLIST PRE-LANCIO

Prima di rendere disponibile l'evento in produzione:

### Database
- [ ] Seed SQL testato su ambiente staging
- [ ] Verifica query performance (con EXPLAIN)
- [ ] Backup database pre-inserimento
- [ ] RLS policies corrette per visibilità evento

### Backend
- [ ] API endpoint per CRUD evento type `engagement-party`
- [ ] Validazione schema evento (Zod/Joi)
- [ ] Test unitari per logica budget
- [ ] Endpoint pubblico per galleria foto condivisa

### Frontend
- [ ] Pagina selezione evento include card Festa Fidanzamento
- [ ] Dashboard evento implementata e testata
- [ ] Timeline interattiva funzionante
- [ ] Responsive design per mobile
- [ ] Dark mode supportato (se applicabile)

### Contenuti
- [ ] Testi italiani revisionati
- [ ] Icone categorie coerenti con design system
- [ ] Immagini placeholder di qualità
- [ ] SEO: meta description, title, OG tags

### Testing
- [ ] Test E2E creazione evento completo
- [ ] Test aggiunta spese multiple
- [ ] Test calcolo budget automatico
- [ ] Test timeline con date personalizzate
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

## 🐛 TROUBLESHOOTING

### Problema: "Event type 'engagement-party' not found"
**Causa**: Enum database non aggiornato  
**Soluzione**:
```sql
-- Verifica enum esistente
SELECT enum_range(NULL::event_type);

-- Se mancante, aggiungi
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'engagement-party';
```

---

### Problema: Budget non si calcola correttamente
**Causa**: Somma subcategories con NULL estimated_cost  
**Soluzione**:
```sql
-- Verifica NULL
SELECT * FROM subcategories 
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE event_id IN (
    SELECT id FROM events WHERE event_type = 'engagement-party'
  )
)
AND estimated_cost IS NULL;

-- Fix: imposta 0 dove NULL
UPDATE subcategories 
SET estimated_cost = 0 
WHERE estimated_cost IS NULL;
```

---

### Problema: Timeline items non ordinati correttamente
**Causa**: `display_order` non univoco o NULL  
**Soluzione**:
```sql
-- Reset display_order con valori sequenziali
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY due_date, id) AS new_order
  FROM timeline_items
  WHERE event_id = (SELECT id FROM events WHERE event_type = 'engagement-party')
)
UPDATE timeline_items t
SET display_order = o.new_order
FROM ordered o
WHERE t.id = o.id;
```

---

## 📚 RISORSE AGGIUNTIVE

### Documentazione Correlata
- `ENGAGEMENT-PARTY-COMPLETAMENTO.md` - Riepilogo implementazione
- `supabase-COMPLETE-SETUP.sql` - Schema base database
- `supabase-engagement-party-seed.sql` - Seed SQL evento

### Esempi Codice
- Dashboard template: vedi `src/app/eventi/genderreveal/` (struttura simile)
- Timeline component: `src/components/TimelineChecklist.tsx`
- Budget tracker: `src/components/BudgetOverview.tsx`

### Ispirazioni Stile
- **Pinterest board**: "Engagement Party Ideas"
- **Instagram**: #festadefidanzamento #engagementparty
- **Wedding blogs**: The Knot, Junebug Weddings, Style Me Pretty

---

## ✅ CONCLUSIONE

La **Festa di Fidanzamento** è ora pronta per essere integrata nell'app con:

✨ **11 categorie** dettagliate  
📋 **58 sottocategorie** con costi stimati  
🗓️ **34 task timeline** organizzati in 6 fasi  
💰 **Budget €5.000** distribuito strategicamente  
🎨 **4 stili predefiniti** per ogni tipo di coppia  

**Prossimo step**: Integrazione UI e test utente! 💍✨

---

**Domande?** Consulta il file `ENGAGEMENT-PARTY-COMPLETAMENTO.md` per dettagli tecnici implementativi.
