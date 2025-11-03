# 🎖️ PENSIONAMENTO - GUIDA SETUP COMPLETA

> **Evento**: Festa di Pensionamento (Retirement Party)  
> **Codice tipo**: `retirement-party`  
> **Budget medio**: €4.000  
> **Timeline**: 2-3 mesi di preparazione (dal lavoro alla festa)

---

## 🎯 PANORAMICA EVENTO

La **Festa di Pensionamento** è un evento celebrativo elegante per onorare il passaggio dalla vita lavorativa al nuovo inizio. È pensato per colleghi, amici e familiari che vogliono celebrare insieme questo traguardo importante.

### Caratteristiche distintive
- 🎖️ **Tono**: Celebrativo ed emozionale, elegante ma sobrio
- 👥 **Partecipanti**: Colleghi + famiglia + amici del pensionato/a
- 📹 **Focus ricordi**: Video carriera, foto storiche, testimonianze
- 🎁 **Regalo collettivo**: Viaggio, esperienza, oggetto simbolico importante
- 🏛️ **Location**: Spesso aziendale, ristorante formale, o location elegante
- 🎨 **Natural Chic**: Palette oro/verde salvia/avorio, atmosfera raffinata

---

## 📋 INSTALLAZIONE DATABASE

### PREREQUISITI
- ✅ Supabase project attivo o PostgreSQL locale
- ✅ Schema base eventi installato (`supabase-COMPLETE-SETUP.sql`)
- ✅ Tabelle `events`, `categories`, `subcategories`, `timeline_items` esistenti

### ⚠️ IMPORTANTE: Verifica Colonne Timeline

Prima di installare il seed Pensione, assicurati che la tabella `timeline_items` esista:

```sql
-- Verifica esistenza tabella
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'timeline_items'
);
```

Se ritorna `false`, esegui prima:
```bash
# Patch per tabella timeline
supabase db execute -f supabase-multi-event-columns-patch.sql
```

### STEP 1: Esegui seed SQL

**⭐ CONSIGLIATO: Via Supabase Dashboard**

1. Apri [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona `</>` nella sidebar)
4. Clicca **New Query**
5. Copia e incolla il contenuto di `supabase-pensione-seed.sql`
6. Clicca **Run** (o `Ctrl+Enter`)
7. Verifica output: Messaggio "Created Retirement Party event with ID: ..."

#### Opzione B: Supabase CLI (se installato)
```bash
supabase db execute -f supabase-pensione-seed.sql
```

#### Opzione C: PostgreSQL Locale (psql)
```bash
psql -U postgres -d ibds -f supabase-pensione-seed.sql
```

#### Opzione D: Script Node.js (progetto custom)
```bash
node scripts/run-sql.mjs supabase-pensione-seed.sql
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
  COUNT(DISTINCT s.id) AS sottocategorie,
  COUNT(DISTINCT t.id) AS timeline_items
FROM events e
LEFT JOIN categories c ON c.event_id = e.id
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN timeline_items t ON t.event_id = e.id
WHERE e.event_type = 'retirement-party'
GROUP BY e.id, e.name, e.event_type, e.total_budget;
```

**Output atteso**:
```
evento                   | event_type       | total_budget | categorie | sottocategorie | timeline_items
Festa di Pensionamento   | retirement-party | 4000.00      | 11        | ~60           | 34
```

---

## 🗂️ STRUTTURA CATEGORIE

### 1. CERIMONIA O MOMENTO SIMBOLICO 🎖️
**Scopo**: Momento formale di celebrazione e ringraziamento  
**Budget medio**: €300 - €1.050  
**Focus**: Riconoscimento carriera e passaggio verso nuova vita

**Sottocategorie**:
- **Scelta luogo della celebrazione** (€0)  
  Azienda, ristorante, casa privata, sala eventi
  
- **Breve discorso o cerimonia di ringraziamento** (€150)  
  Momento formale di saluto e gratitudine
  
- **Presentatore o collega che conduce il momento** (€200)  
  Persona che conduce la cerimonia ufficiale
  
- **Omaggio simbolico** (€300)  
  Targa, libro, album personalizzato, video commemorativo
  
- **Proiezione foto o video "carriera e ricordi"** (€250)  
  Slideshow o video emozionale della carriera lavorativa
  
- **Brindisi inaugurale o taglio torta** (€150)  
  Momento conviviale di celebrazione

---

### 2. LOCATION E ALLESTIMENTO 🏛️
**Scopo**: Spazio elegante e allestimenti raffinati  
**Budget medio**: €800 - €3.000  
**Opzioni location**:
- 🏢 Sala aziendale o conference center
- 🍽️ Ristorante elegante o trattoria storica
- 🌿 Terrazza panoramica o giardino
- 🏛️ Villa d'epoca o location di prestigio

**Sottocategorie**:
- **Selezione location** (€800)  
  Ristorante, giardino, sala eventi, terrazza
  
- **Affitto sala o spazio esterno** (€600)  
  Costo location se non incluso nella ristorazione
  
- **Allestimento elegante e sobrio** (€500)  
  Fiori, piante, luci calde, atmosfera raffinata
  
- **Tavoli e mise en place coordinati** (€400)  
  Allestimento tavoli con tovagliato e centrotavola eleganti
  
- **Tableau e segnaposti** (€150)  
  Cartellonistica e segnaposto personalizzati
  
- **Photobooth con tema "nuovi inizi" o "libertà"** (€300)  
  Angolo fotografico a tema pensionamento
  
- **Decorazioni personalizzate** (€350)  
  Foto di carriera, oggetti simbolici, timeline lavorativa

---

### 3. CATERING / RISTORAZIONE 🍽️
**Scopo**: Servizio ristorazione elegante e conviviale  
**Budget medio**: €1.000 - €3.000  
**Opzioni format**:
- **Cena servita**: Menu tradizionale con servizio al tavolo
- **Buffet conviviale**: Selezione piatti ricchi e informali
- **Apericena**: Mix aperitivo + cena leggera

**Sottocategorie**:
- **Cena servita o buffet conviviale** (€1.200)  
  Servizio ristorazione principale
  
- **Sweet table e dessert personalizzati** (€400)  
  Tavolo dolci con dessert raffinati
  
- **Torta "Buona Pensione" o con dedica personalizzata** (€200)  
  Torta celebrativa a tema pensionamento
  
- **Bevande, vini e brindisi** (€350)  
  Selezione vini e bevande per brindisi formale
  
- **Servizio catering o ristorante** (€800)  
  Fornitore catering o ristorante con servizio completo

---

### 4. INVITI E GRAFICA 💌
**Scopo**: Comunicazione visiva elegante e coordinata  
**Budget medio**: €300 - €730  
**Palette consigliata**: Oro, verde salvia, avorio, beige

**Sottocategorie**:
- **Inviti digitali o cartacei** (€150)  
  Partecipazioni eleganti con palette raffinata (tema oro/verde/avorio/beige)
  
- **Coordinato grafico** (€200)  
  Menù, segnaposti, ringraziamenti, identità visiva coordinata
  
- **Tableau, cartellonistica e backdrop** (€180)  
  Welcome board, cartelli direzionali, sfondo fotografico
  
- **QR code per raccolta foto e video** (€80)  
  Sistema digitale condivisione contenuti ospiti
  
- **Biglietti ringraziamento personalizzati** (€120)  
  Thank you cards per colleghi e invitati

---

### 5. FOTO, VIDEO E CONTENUTI 📸
**Scopo**: Immortalare momenti e ricordi della carriera  
**Budget medio**: €600 - €1.950  
**Elementi unici**:
- Video retrospettiva carriera lavorativa
- Album fotografico colleghi e famiglia
- Reel celebrativo per social

**Sottocategorie**:
- **Fotografo / videomaker** (€800)  
  Servizio professionale completo foto e video
  
- **Shooting con colleghi e famiglia** (€400)  
  Servizio fotografico con ospiti e familiari
  
- **Reel o mini video commemorativo** (€300)  
  Video editing celebrativo per social e ricordo
  
- **Proiezione "la mia carriera in 5 minuti"** (€250)  
  Video montaggio momenti salienti carriera
  
- **Album digitale o cornice ricordo** (€200)  
  Album fotografico o cornice digitale commemorativa

---

### 6. MUSICA E INTRATTENIMENTO 🎵
**Scopo**: Animazione elegante e raffinata  
**Budget medio**: €600 - €1.450  
**Stili consigliati**: Jazz, musica acustica, lounge, playlist anni carriera

**Sottocategorie**:
- **DJ o musica di sottofondo live** (€600)  
  Jazz, acustica, lounge - intrattenimento elegante
  
- **Playlist personalizzata "ricordi e futuro"** (€0)  
  Selezione brani significativi della vita lavorativa
  
- **Brevi interventi o dediche da colleghi e amici** (€150)  
  Momenti di testimonianza e affetto
  
- **Piccolo spettacolo comico o sorpresa** (€400)  
  Intrattenimento leggero e sorprese speciali
  
- **Karaoke finale o ballo simbolico** (€200)  
  Momento di festa e condivisione musicale

---

### 7. REGALI E RINGRAZIAMENTI 🎁
**Scopo**: Omaggi per il pensionato e bomboniere per ospiti  
**Budget medio**: €800 - €1.630  
**Focus**: Regalo collettivo importante (viaggio, esperienza, oggetto simbolico)

**Sottocategorie**:
- **Regalo collettivo** (€800)  
  Viaggio, esperienza, oggetto simbolico da colleghi e azienda
  
- **Bomboniere o gift box per invitati** (€300)  
  Pensierino elegante per ogni ospite
  
- **Targhe o riconoscimenti professionali** (€250)  
  Riconoscimenti formali carriera e contributi aziendali
  
- **Biglietti e dediche scritte** (€100)  
  Messaggi personalizzati da colleghi e amici
  
- **Album delle dediche o guestbook** (€180)  
  Libro firme con messaggi e auguri per il futuro

---

### 8. ABBIGLIAMENTO E BEAUTY 👔
**Scopo**: Look elegante ma sobrio per il pensionato/a  
**Budget medio**: €300 - €770  
**Stile**: In linea con il tono della festa (formale, elegante casual, serale)

**Sottocategorie**:
- **Outfit elegante ma sobrio** (€300)  
  Abbigliamento raffinato per il festeggiato/a
  
- **Trucco / parrucco** (€120)  
  Servizio beauty per servizio fotografico
  
- **Accessori coordinati** (€150)  
  Foulard, gioielli, dettagli oro o sabbia
  
- **Shooting pre-evento** (€200)  
  Servizio fotografico professionale prima della festa

---

### 9. TRASPORTI E LOGISTICA 🚗
**Scopo**: Facilitare arrivo/partenza ospiti e materiali  
**Budget medio**: €100 - €950  
**Considerazioni**: Spesso molti ospiti da zone diverse (colleghi da uffici vari)

**Sottocategorie**:
- **Parcheggi ospiti** (€100)  
  Gestione parcheggio riservato o valet parking
  
- **Navetta o trasporto colleghi** (€300)  
  Servizio navetta per ospiti da luoghi comuni (es. sede aziendale)
  
- **Trasporto materiali / allestimenti** (€150)  
  Noleggio furgone o corriere per decorazioni e attrezzature
  
- **Pernottamento ospiti** (€400)  
  Hotel o B&B per ospiti da fuori regione

---

### 10. GESTIONE BUDGET 💰
**Scopo**: Monitoraggio finanziario completo  
**Gestito in app**  

**Sottocategorie** (tracking automatico):
- Budget stimato
- Acconti fornitori
- Saldi
- Spese extra
- Totale finale
- Regali ricevuti (controvalore contributi ospiti)

---

## 🗓️ TIMELINE PENSIONAMENTO - "DAL LAVORO ALLA FESTA"

### 🔸 2-3 MESI PRIMA
**Fase: Ideazione e pianificazione**

✅ **Task principali** (7 task):
1. **Scegli data e location**  
   Definisci data festa e prenota location (azienda, ristorante, sala eventi)
   
2. **Definisci tipo di festa**  
   Decidi formato: intima con amici, formale aziendale, o festa familiare
   
3. **Contatta fotografo / videomaker**  
   Prenota servizio fotografico e video professionale
   
4. **Richiedi preventivi catering / ristorante / torta**  
   Confronta preventivi per ristorazione e dolci
   
5. **Prenota musica o intrattenimento**  
   Conferma DJ, band live o playlist curata
   
6. **Stila lista invitati**  
   Compila lista completa di colleghi, amici e familiari
   
7. **Imposta budget nell'app**  
   Definisci budget totale e suddivisione per categorie

**Priorità**: Alta  
**Tempo stimato**: 6-10 ore totali

---

### 🔸 1 MESE PRIMA
**Fase: Conferme e fornitori**

✅ **Task principali** (6 task):
1. **Invia inviti ufficiali**  
   Invia partecipazioni digitali o cartacee agli ospiti
   
2. **Conferma fiori e decorazioni**  
   Ordina composizioni floreali e allestimenti location
   
3. **Ordina torta e dolci personalizzati**  
   Definisci design torta "Buona Pensione" e sweet table
   
4. **Scegli outfit e accessori**  
   Acquista o seleziona abbigliamento elegante
   
5. **Conferma fotografo / videomaker**  
   Brief dettagliato su momenti chiave da immortalare
   
6. **Organizza regalo collettivo**  
   Coordina raccolta fondi o acquisto regalo da colleghi

**Priorità**: Alta  
**Tempo stimato**: 4-6 ore totali

---

### 🔸 2 SETTIMANE PRIMA
**Fase: Rifinitura**

✅ **Task principali** (5 task):
1. **Invia brief fornitori (orari, scaletta, colori)**  
   Condividi timeline e dettagli operativi con tutti i fornitori
   
2. **Prepara playlist e interventi musicali**  
   Seleziona canzoni simboliche e momenti musicali speciali
   
3. **Raccogli foto e video ricordi da proiettare**  
   Organizza slideshow carriera e momenti salienti
   
4. **Stampa menù, segnaposti, cartellonistica**  
   Prepara welcome board, tableau, menù, segnaposti
   
5. **Controlla acconti e saldi**  
   Verifica acconti versati e pianifica saldi finali

**Priorità**: Media  
**Tempo stimato**: 3-5 ore totali

---

### 🔸 1 SETTIMANA PRIMA
**Fase: Coordinamento finale**

✅ **Task principali** (4 task):
1. **Ultimo check con location e catering**  
   Sopralluogo finale e conferma dettagli operativi
   
2. **Organizza trasporto materiali e fornitori**  
   Pianifica logistica trasporti decorazioni e attrezzature
   
3. **Stampa checklist evento**  
   Prepara checklist finale per il giorno della festa
   
4. **Prepara regali e bomboniere**  
   Organizza gift box e pensierini per ospiti

**Priorità**: Alta  
**Tempo stimato**: 2-4 ore totali

---

### 🔸 GIORNO DELL'EVENTO 🎉
**Fase: Celebrazione e festa**

✅ **Scaletta tipo** (7 momenti):
1. **Allestimento e preparazione**  
   Setup completo location e area cerimonia (mattina)
   
2. **Shooting e accoglienza ospiti**  
   Servizio fotografico e benvenuto agli invitati
   
3. **Brindisi e discorso**  
   Momento formale di ringraziamento e brindisi
   
4. **Cena o buffet**  
   Servizio ristorazione principale
   
5. **Proiezione ricordi e momenti simbolici**  
   Slideshow carriera e consegna omaggi/targa
   
6. **Taglio torta e musica**  
   Taglio torta celebrativa e intrattenimento musicale
   
7. **Ringraziamenti finali**  
   Saluti e ringraziamenti a ospiti e fornitori

**Priorità**: Alta  
**Durata**: 4-6 ore evento

---

### 🔸 DOPO L'EVENTO
**Fase: Chiusura e ricordi**

✅ **Task principali** (5 task):
1. **Invia ringraziamenti a colleghi e fornitori**  
   Thank you message a tutti i partecipanti e fornitori
   
2. **Raccogli foto e video**  
   Scarica tutte le foto da fotografo e ospiti
   
3. **Completa pagamenti**  
   Versa tutti i saldi finali ai fornitori
   
4. **Aggiorna bilancio finale**  
   Chiudi consuntivo spese nell'app
   
5. **Crea album digitale o video ricordo**  
   Monta album fotografico o video emozionale della festa

**Priorità**: Media  
**Tempo stimato**: 3-4 ore totali

---

## 🎨 STILI CONSIGLIATI (NATURAL CHIC)

### 🏛️ Elegant Corporate
**Contesto**: Festa aziendale formale  
**Palette**: Oro (#D4AF37), blu navy, avorio (#F8E8D8)  
**Location**: Sala conferenze aziendale, hotel business, centro congressi  
**Elementi**:
- Targa aziendale incisa
- Video istituzionale con retrospettiva carriera
- Standing ovation colleghi
- Brindisi con champagne
- Discorsi formali dirigenza

---

### 🌿 Garden Soirée
**Contesto**: Festa privata rilassata  
**Palette**: Verde salvia (#A3B59D), crema, legno naturale  
**Location**: Giardino botanico, terrazza verde, agriturismo  
**Elementi**:
- Fiori campestri e centrotavola naturali
- Luci soffuse e candele
- Tavole lunghe stile family
- Atmosfera intima e conviviale
- Musica acustica dal vivo

---

### 🍷 Classic Restaurant
**Contesto**: Cena intima con amici/famiglia  
**Palette**: Bordeaux, oro antico, avorio  
**Location**: Ristorante storico, wine bar elegante, trattoria gourmet  
**Elementi**:
- Menu degustazione vini pregiati
- Brindisi formale con sommelier
- Musica jazz o piano bar
- Polaroid corner vintage
- Album dediche rilegato in pelle

---

### 🎭 Retrospective Night
**Contesto**: Festa con forte componente emozionale  
**Palette**: Seppia, oro, bianco e nero (vintage)  
**Location**: Teatro, loft industriale, spazio culturale  
**Elementi**:
- Proiezione foto bianco/nero epoca lavorativa
- Vinili anni carriera
- Timeline visiva professionale appesa
- Interventi commoventi colleghi
- Video emozionale "La mia carriera in 5 minuti"

---

## 💻 INTEGRAZIONE NELL'APP

### TypeScript Types (da implementare)
Il tipo `retirement-party` va aggiunto:

```typescript
// src/constants/eventConfigs.ts
export type EventType =
  | "wedding"
  | "baptism"
  | "turning-18"
  | "anniversary"
  | "gender-reveal"
  | "birthday"
  | "turning-50"
  | "retirement-party"  // ← DA AGGIUNGERE
  | "confirmation"
  | "graduation";
```

### Event Configuration (da creare)
La configurazione evento va aggiunta in `EVENT_CONFIGS`:

```typescript
'retirement-party': {
  name: "Pensionamento",
  emoji: "🎖️",
  budgetSectionTitle: "Imposta Budget Festa Pensionamento",
  dateLabel: "Data Festa",
  totalBudgetLabel: "Budget Totale Festa",
  spendTypeLabel: "Pagato da",
  eventDateMessage: "La festa di pensionamento è il",
  timelineTitle: "Timeline Pensionamento",
  timelineDescription: "Dal lavoro alla libertà - Organizza una celebrazione memorabile per il pensionamento",
  timelineBuckets: [
    "2-3 mesi prima",
    "1 mese prima",
    "2 settimane prima",
    "1 settimana prima",
    "Giorno dell'evento",
    "Dopo l'evento"
  ],
  timelineTasks: [
    {
      title: "Scegli data e location",
      monthsBefore: 2.5,
      priority: "alta",
      category: "Ideazione"
    },
    {
      title: "Definisci tipo di festa (intima/formale/aziendale)",
      monthsBefore: 2.5,
      priority: "alta",
      category: "Ideazione"
    },
    {
      title: "Contatta fotografo e videomaker",
      monthsBefore: 2,
      priority: "media",
      category: "Fornitori"
    },
    {
      title: "Raccogli foto carriera per video",
      monthsBefore: 1.5,
      priority: "alta",
      category: "Rifinitura"
    },
    {
      title: "Invia inviti ufficiali",
      monthsBefore: 1,
      priority: "alta",
      category: "Conferme"
    },
    {
      title: "Organizza regalo collettivo",
      monthsBefore: 1,
      priority: "alta",
      category: "Regali"
    },
    {
      title: "Prepara video carriera e slideshow",
      monthsBefore: 0.5,
      priority: "alta",
      category: "Rifinitura"
    },
    {
      title: "Giorno della festa: brindisi e discorsi",
      monthsBefore: 0,
      priority: "alta",
      category: "Evento"
    },
    {
      title: "Invia ringraziamenti finali",
      monthsBefore: -0.25,
      priority: "media",
      category: "Chiusura"
    }
  ],
  budgetCategories: RETIREMENT_BUDGET_CATEGORIES,
  spendTypes: [
    { value: "company", label: "Azienda" },
    { value: "colleagues", label: "Colleghi" },
    { value: "family", label: "Famiglia" },
    { value: "retiree", label: "Pensionato/a" }
  ],
  contributors: [
    { 
      value: "company", 
      label: "Budget Azienda", 
      cardClass: "border-2 border-amber-300 bg-amber-50", 
      textClass: "text-amber-700" 
    },
    { 
      value: "colleagues", 
      label: "Budget Colleghi", 
      cardClass: "border-2 border-teal-300 bg-teal-50", 
      textClass: "text-teal-700" 
    },
    { 
      value: "family", 
      label: "Budget Famiglia", 
      cardClass: "border-2 border-sage-300 bg-sage-50", 
      textClass: "text-sage-700" 
    }
  ],
  defaultSpendType: "colleagues"
}
```

### Budget Categories (da creare)
Le categorie budget vanno mappate in `RETIREMENT_BUDGET_CATEGORIES`:

```typescript
// src/constants/budgetCategories.ts
export const RETIREMENT_BUDGET_CATEGORIES: BudgetCategoryMap = {
  Cerimonia: [
    "Luogo celebrazione",
    "Discorso ringraziamento",
    "Presentatore",
    "Omaggio simbolico",
    "Video carriera",
    "Brindisi"
  ],
  Location: [
    "Affitto sala",
    "Allestimento elegante",
    "Tavoli mise en place",
    "Tableau segnaposti",
    "Photobooth",
    "Decorazioni personalizzate"
  ],
  Catering: [
    "Cena/Buffet",
    "Sweet table",
    "Torta Buona Pensione",
    "Bevande vini",
    "Servizio catering"
  ],
  Grafica: [
    "Inviti",
    "Coordinato grafico",
    "Cartellonistica backdrop",
    "QR code foto",
    "Ringraziamenti"
  ],
  Foto_Video: [
    "Fotografo videomaker",
    "Shooting colleghi famiglia",
    "Reel commemorativo",
    "Video carriera 5min",
    "Album cornice ricordo"
  ],
  Intrattenimento: [
    "DJ musica live",
    "Playlist personalizzata",
    "Interventi dediche",
    "Spettacolo sorpresa",
    "Karaoke ballo"
  ],
  Regali: [
    "Regalo collettivo",
    "Bomboniere gift bag",
    "Targhe riconoscimenti",
    "Dediche scritte",
    "Album dediche guestbook"
  ],
  Abbigliamento: [
    "Outfit elegante",
    "Trucco parrucco",
    "Accessori coordinati",
    "Shooting pre-evento"
  ],
  Logistica: [
    "Parcheggi ospiti",
    "Navetta colleghi",
    "Trasporto materiali",
    "Pernottamenti"
  ],
  Budget: [
    "Budget stimato",
    "Acconti",
    "Saldi",
    "Spese extra",
    "Totale finale",
    "Regali ricevuti"
  ]
};
```

---

## 🧪 TEST E VERIFICA

### Test Creazione Evento
1. Login utente nell'app
2. Vai su `/select-event-type` (o pagina selezione eventi)
3. Seleziona "Pensionamento 🎖️"
4. Imposta budget (es. €4.000)
5. Scegli data (es. 2 mesi avanti)
6. Verifica creazione evento nel database
7. Vai su dashboard evento

### Test Budget Categories
1. Dashboard evento Pensionamento
2. Verifica presenza 11 categorie
3. Espandi categoria "Cerimonia o Momento Simbolico"
4. Verifica 6 sottocategorie
5. Aggiungi spesa in "Video carriera e ricordi"
6. Verifica aggiornamento budget totale
7. Testa split budget (azienda vs colleghi vs famiglia)

### Test Timeline
1. Vai su `/timeline` evento Pensionamento
2. Verifica task organizzati in 6 bucket temporali
3. Spunta task "Scegli data e location"
4. Verifica persistenza stato nel database
5. Controlla notifiche scadenze task

### Test Features Speciali
1. **Video Carriera**: Upload o link YouTube video retrospettiva
2. **Album Dediche**: Aggiungi dedica testuale da collega
3. **Regalo Collettivo**: Tracking contributori e somma raccolta

---

## 🚀 PROSSIMI STEP (SVILUPPO)

### 1. TypeScript Configuration
**File**: `src/constants/eventConfigs.ts`  
**Tempo**: ~45 minuti  

- [ ] Aggiungi tipo `'retirement-party'` a `EventType`
- [ ] Crea configurazione completa evento con tutte le proprietà
- [ ] Definisci timeline tasks con priorità
- [ ] Configura contributors (azienda/colleghi/famiglia/pensionato)

### 2. Budget Categories Mapping
**File**: `src/constants/budgetCategories.ts`  
**Tempo**: ~15 minuti  

- [ ] Crea `RETIREMENT_BUDGET_CATEGORIES`
- [ ] Mappa 10 categorie principali
- [ ] Associa sottocategorie coerenti con seed SQL

### 3. UI Card Evento
**File**: Pagina selezione eventi  
**Tempo**: ~1 ora  

```tsx
<EventCard
  type="retirement-party"
  emoji="🎖️"
  title="Pensionamento"
  description="Dal lavoro alla libertà - Celebra il nuovo inizio"
  budgetRange="€2.000 - €6.000"
  timeline="2-3 mesi"
  features={[
    "11 categorie complete",
    "Timeline 'Dal lavoro alla festa'",
    "Video carriera e ricordi",
    "Regalo collettivo coordinato"
  ]}
  onClick={() => router.push('/pensione/crea')}
/>
```

### 4. Dashboard Evento Dedicata (Opzionale)
**Rotta**: `/pensione` o `/eventi/retirement-party/dashboard`  
**Tempo**: ~6 ore  

**Componenti chiave**:
- Overview budget con progress bar
- Lista 11 categorie espandibili (accordion)
- Sezione speciale "Video carriera" (upload/link YouTube)
- Sezione "Album dediche" (raccolta messaggi colleghi)
- Timeline task con checkbox e notifiche
- Quick actions (aggiungi spesa, fornitore, upload foto)

### 5. Features Speciali (Opzionali, Alta Priorità)

#### 📹 Video Carriera Builder (~4 ore)
- Upload video o link YouTube/Vimeo
- Preview integrata nel dashboard
- Editing timeline: selezione foto anni passati + musica
- Export in formato proiezione (16:9, Full HD)
- Integrazione con servizio proiezione evento

#### 📖 Album Dediche Digitale (~3 ore)
- Form raccolta dediche da colleghi (testo + foto opzionale)
- QR code per accesso rapido durante la festa
- Visualizzazione stile guestbook digitale
- Moderazione messaggi (admin approve)
- Export PDF stampabile elegante
- Email automatica a tutti i partecipanti post-evento

#### 🎁 Gestione Regalo Collettivo (~2 ore)
- Raccolta fondi tra colleghi con tracking
- Dashboard contributori (chi ha dato, quanto)
- Suggerimenti regalo categorizzati:
  - Viaggi (crociera, tour culturale)
  - Esperienze (corso cucina, degustazione vini)
  - Oggetti simbolici (orologio, targa personalizzata)
- Invio reminder contributo automatico
- Generazione voucher regalo digitale

---

## ⚠️ TROUBLESHOOTING

### Errore: "table timeline_items does not exist"
**Causa**: Tabella timeline non creata  
**Soluzione**: Esegui patch prima del seed:
```bash
supabase db execute -f supabase-multi-event-columns-patch.sql
```

### Errore: "duplicate key value violates unique constraint"
**Causa**: Evento Pensionamento già esistente nel database  
**Soluzione**:
```sql
-- Elimina evento esistente e ricrea
DELETE FROM events WHERE event_type = 'retirement-party';
-- Poi riesegui seed
```

### Query verifica restituisce 0 righe
**Possibili cause**:
1. Seed eseguito su progetto Supabase sbagliato
2. Seed non completato (errore silenzioso nella query)
3. Connessione database errata

**Soluzione**: Verifica progetto attivo in Supabase Dashboard e riesegui seed con attenzione agli errori.

### Categorie non visibili in dashboard
**Causa**: Mismatch tra seed DB e config TypeScript  
**Soluzione**: Verifica che `RETIREMENT_BUDGET_CATEGORIES` corrisponda esattamente ai nomi delle categorie nel seed SQL.

### Timeline items non ordinati correttamente
**Causa**: Display order errato o date calcolate male  
**Soluzione**: Verifica campo `display_order` e calcoli `CURRENT_DATE + INTERVAL` nel seed.

---

## 📚 RISORSE AGGIUNTIVE

### File correlati
- **SQL Seed**: `supabase-pensione-seed.sql` - Seed database completo evento
- **Documentazione**:
  - `PENSIONE-COMPLETAMENTO.md` - Documentazione tecnica
  - `PENSIONE-IMPLEMENTATION-SUMMARY.md` - Summary sviluppatori
  - `PENSIONE-SETUP-GUIDE.md` - Questa guida
- **Config TypeScript** (da creare):
  - `src/constants/eventConfigs.ts` - Configurazione evento
  - `src/constants/budgetCategories.ts` - Mapping categorie budget

### Checklist generale
Vedi `CHECKLIST_SQL_SEEDS.md` per panoramica tutti eventi disponibili nel progetto.

---

## ✅ COMPLETION CHECKLIST

### Database
- [ ] Tabella `timeline_items` verificata/creata
- [ ] Seed pensione installato su Supabase Cloud
- [ ] Query verifica eseguita con successo
- [ ] 11 categorie presenti
- [ ] ~60 sottocategorie verificate
- [ ] 34 timeline items creati

### TypeScript Configuration
- [ ] Tipo `retirement-party` aggiunto a `EventType`
- [ ] Configurazione evento creata in `EVENT_CONFIGS`
- [ ] Budget categories mappate (`RETIREMENT_BUDGET_CATEGORIES`)
- [ ] Contributors configurati (azienda/colleghi/famiglia)
- [ ] Timeline tasks definiti con priorità

### UI (opzionale, ma consigliato)
- [ ] Card evento in pagina selezione
- [ ] Pagina creazione evento
- [ ] Dashboard evento base
- [ ] Timeline task interattiva
- [ ] Sezione Video carriera (upload/link)
- [ ] Sezione Album dediche digitale
- [ ] Gestione regalo collettivo

### Test
- [ ] Test creazione evento
- [ ] Test aggiunta categorie/spese
- [ ] Test budget tracking multi-contributor
- [ ] Test timeline task
- [ ] Test upload video/foto (se implementato)
- [ ] Test UI responsive

---

🎖️ **Pensionamento pronto per l'integrazione completa!** ✨

**Durata setup database**: 5-10 minuti  
**Durata sviluppo TypeScript config**: ~1 ora  
**Durata sviluppo UI base**: ~12 ore  
**Durata sviluppo features speciali**: ~9 ore aggiuntive

**Risultato**: Evento Pensionamento elegante e completo con gestione budget, timeline, video carriera, album dediche e regalo collettivo!

**Dal lavoro alla libertà - Celebra il nuovo inizio con stile Natural Chic!** 🎉
