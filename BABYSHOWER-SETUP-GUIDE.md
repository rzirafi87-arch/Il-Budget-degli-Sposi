# 👶 Baby Shower – Guida Setup Completa

## 📋 Panoramica
Il **Baby Shower** è un evento celebrativo dedicato ai futuri genitori e al bebè in arrivo. L'app "Il Budget degli Sposi" offre una struttura completa per pianificare, budgetizzare e gestire ogni aspetto di questo momento speciale con **stile Natural Chic / La Trama** (toni neutri, materiali naturali, cura artigianale).

---

## 🎨 Stile e Filosofia
- **Palette colori**: rosa delicato, azzurro polvere, beige, avorio, verde salvia, bianco
- **Materiali**: legno naturale, lino, cotone, carta kraft, fiori secchi, eucalipto, pampas
- **Atmosfera**: intima, accogliente, raffinata ma informale, focus sulla condivisione

---

## 🗂️ Struttura Categorie

### 1️⃣ **Location e Allestimento**
- Scelta location (giardino, terrazza, casa, sala, agriturismo)
- Noleggio tavoli e sedute
- Decorazioni a tema (rosa, azzurro, neutro o green gender reveal)
- Balloon wall, backdrop e scritte personalizzate
- Allestimento tavoli (sweet table, angolo regali, photobooth)
- Fiori e piante (gypsophila, eucalipto, pampas, rami secchi)
- Luci decorative / candele / lanterne

### 2️⃣ **Catering / Dolci e Bevande**
- Buffet dolce e salato
- Sweet table / Candy bar
- Torta baby shower
- Cupcake, cake pops, biscotti decorati
- Bevande (analcolici, mocktail, spremute, tè freddo, prosecco)
- Servizio catering o organizzazione autonoma

### 3️⃣ **Inviti e Grafica**
- Inviti digitali o cartacei
- Tema grafico e palette colori
- Segnaposti, cartellonistica e menù
- Coordinato grafico per sweet table
- Biglietti di ringraziamento
- QR code per raccolta foto e video

### 4️⃣ **Regali e Lista Nascita**
- Lista nascita online o fisica
- Coordinamento regali con amici e parenti
- Pacchetti regalo e bigliettini
- Gift box per ospiti (mini candele, confetti, saponi, piantine)
- Libro o cornice delle dediche

### 5️⃣ **Intrattenimento**
- Giochi a tema (indovina il nome, peso, data nascita, ecc.)
- Angolo foto con accessori
- Musica di sottofondo o mini DJ set
- Proiezione di foto o video dei futuri genitori
- Animazione per bambini (se presenti)

### 6️⃣ **Abbigliamento e Beauty**
- Outfit futura mamma e papà
- Trucco e parrucco
- Shooting fotografico pre-evento
- Accessori coordinati (coroncina, spilla "mom to be", ecc.)

### 7️⃣ **Foto e Video**
- Fotografo o videomaker
- Shooting dedicato alla coppia e agli invitati
- Reel o mini video per social
- Album o galleria digitale condivisa
- Photobooth o polaroid corner

### 8️⃣ **Ricordi e Ringraziamenti**
- Bomboniere / regali ospiti
- Libro firme o dediche
- Biglietti di ringraziamento
- Video di ringraziamento post-evento

### 9️⃣ **Trasporti e Logistica**
- Parcheggi ospiti
- Trasporto materiali e decorazioni
- Noleggio furgoncino / auto per allestimento
- Alloggio ospiti fuori città

### 🔟 **Gestione Budget (in app)**
- Budget stimato
- Acconti e saldi fornitori
- Spese extra / imprevisti
- Totale finale
- Regali ricevuti

---

## 🗓️ Timeline Baby Shower: "Dall'Idea alla Festa"

### 🔸 **2 MESI PRIMA** – Ideazione e Pianificazione
- [ ] Scegli data e location
- [ ] Definisci tema e palette colori
- [ ] Decidi se sarà solo baby shower o anche gender reveal
- [ ] Stila la lista invitati
- [ ] Richiedi preventivi per catering e dolci
- [ ] Contatta fotografo e/o videomaker
- [ ] Imposta budget nell'app

### 🔸 **1 MESE PRIMA** – Conferme e Dettagli
- [ ] Invia inviti ufficiali
- [ ] Ordina decorazioni e fiori
- [ ] Prenota torta e sweet table
- [ ] Scegli outfit per la futura mamma
- [ ] Organizza lista regali o "baby registry"
- [ ] Conferma fotografo e location

### 🔸 **2 SETTIMANE PRIMA** – Rifinitura
- [ ] Ricevi e prepara decorazioni / allestimenti
- [ ] Prepara giochi e intrattenimenti
- [ ] Organizza playlist musicale
- [ ] Ordina pasticceria personalizzata
- [ ] Stampa cartellonistica e menù
- [ ] Prova trucco / parrucco (se previsto shooting)

### 🔸 **1 SETTIMANA PRIMA** – Coordinamento Finale
- [ ] Ultimo check con fornitori
- [ ] Stampa checklist evento
- [ ] Organizza trasporto materiali
- [ ] Prepara gift bag ospiti
- [ ] Verifica pagamenti

### 🔸 **GIORNO DEL BABY SHOWER 🎀** – La Festa
- [ ] Preparazione e allestimento mattina
- [ ] Shooting di coppia
- [ ] Arrivo ospiti e welcome drink
- [ ] Giochi e momenti dedicati al bebè
- [ ] Taglio torta e brindisi
- [ ] Musica e foto ricordo
- [ ] Ringraziamenti e saluti

### 🔸 **DOPO L'EVENTO** – Chiusura e Ricordi
- [ ] Invia ringraziamenti digitali o cartoline
- [ ] Condividi foto e video con amici e parenti
- [ ] Completa pagamenti
- [ ] Aggiorna bilancio finale
- [ ] Crea reel o mini video ricordo

---

## 🛠️ Istruzioni di Setup Database

### 1. Prerequisiti
- Database Supabase attivo
- Accesso al SQL Editor di Supabase
- Tabelle `events`, `categories`, `subcategories`, `timeline_items` già create (vedi `supabase-COMPLETE-SETUP.sql`)

### 2. Esecuzione Seed
Esegui in ordine:

```bash
# Opzione A: Supabase SQL Editor
# Copia e incolla il contenuto di supabase-babyshower-event-seed.sql

# Opzione B: CLI locale (con script run-sql.mjs)
node scripts/run-sql.mjs supabase-babyshower-event-seed.sql
```

### 3. Verifica
Dopo l'esecuzione, controlla:

```sql
-- Verifica evento baby shower
SELECT * FROM events WHERE event_type = 'babyshower';

-- Verifica categorie (dovrebbero essere 10)
SELECT COUNT(*) FROM categories 
WHERE event_id = '00000000-0000-0000-0000-000000000009'::uuid;

-- Verifica sottocategorie (circa 60 totali)
SELECT c.name AS categoria, COUNT(s.*) AS sottocategorie
FROM categories c
LEFT JOIN subcategories s ON c.id = s.category_id
WHERE c.event_id = '00000000-0000-0000-0000-000000000009'::uuid
GROUP BY c.name
ORDER BY c.display_order;

-- Verifica timeline (36 item totali)
SELECT phase, COUNT(*) FROM timeline_items
WHERE event_id = '00000000-0000-0000-0000-000000000009'::uuid
GROUP BY phase
ORDER BY MIN(display_order);
```

---

## 📊 Budget Indicativo

| **Categoria** | **Stima Media** |
|---------------|-----------------|
| Location e Allestimento | €2.700 |
| Catering e Dolci | €2.200 |
| Inviti e Grafica | €510 |
| Regali e Lista Nascita | €350 |
| Intrattenimento | €800 |
| Abbigliamento e Beauty | €850 |
| Foto e Video | €1.550 |
| Ricordi e Ringraziamenti | €630 |
| Trasporti e Logistica | €700 |
| Gestione Budget | €200 |
| **TOTALE STIMATO** | **€8.000** |

> 💡 **Nota**: Il budget può variare significativamente in base a:
> - Numero di ospiti (15-50 persone)
> - Scelta location (privata vs. in affitto)
> - Livello di personalizzazione
> - Zona geografica

---

## 🎯 Funzionalità App per Baby Shower

### ✅ Già Implementate
- ✅ Tipo evento "babyshower" riconosciuto
- ✅ Struttura categorie e sottocategorie completa
- ✅ Timeline dettagliata con 5 fasi + post-evento
- ✅ Localizzazione italiana (`it.json`)
- ✅ Gestione budget comune (no bride/groom split)

### 🔜 Possibili Estensioni Future
- Lista nascita integrata con link esterni (Amazon, Prenatal, ecc.)
- Tracker regali ricevuti con dediche
- Generatore inviti digitali con tema baby shower
- Giochi interattivi digitali (sondaggi, quiz nome bebè)
- Galleria foto condivisa con QR code
- Export PDF "Libro delle dediche"

---

## 🎨 Palette Colori Suggerite

### **Rosa Delicato**
- Primary: `#F7CAC9` (rosa quarzo)
- Secondary: `#FFE5E5` (rosa tenue)
- Accent: `#E6B8B7` (malva rosato)

### **Azzurro Polvere**
- Primary: `#B4D4E1` (azzurro cielo)
- Secondary: `#D4E9F2` (celeste chiaro)
- Accent: `#8BB4CC` (azzurro mare)

### **Neutro Natural Chic**
- Primary: `#E8DDD1` (beige caldo)
- Secondary: `#A3B59D` (verde salvia)
- Accent: `#C8B8A8` (tortora)

---

## 📝 Checklist Setup Rapido

- [ ] Eseguire seed SQL `supabase-babyshower-event-seed.sql`
- [ ] Verificare creazione evento con `event_type = 'babyshower'`
- [ ] Controllare 10 categorie principali
- [ ] Controllare ~60 sottocategorie totali
- [ ] Controllare 36 timeline items
- [ ] Testare creazione nuovo baby shower da UI
- [ ] Verificare caricamento categorie in dashboard
- [ ] Testare aggiunta spese per baby shower
- [ ] Controllare calcolo budget totale

---

## 🔗 File Correlati

- **Seed SQL**: `supabase-babyshower-event-seed.sql`
- **Localizzazione**: `src/messages/it.json` (chiave: `"baby-shower"`)
- **Schema base**: `supabase-COMPLETE-SETUP.sql`
- **Patch aggiuntive**: `supabase-ALL-PATCHES.sql`

---

## 💡 Consigli per Organizzatori

### **Location Perfetta**
- **Giardino privato**: massima intimità, possibilità decorazioni personalizzate
- **Terrazza/rooftop**: luce naturale, vista panoramica
- **Agriturismo**: atmosfera rustic chic, spazi interni ed esterni
- **Sala eventi**: comoda per ogni stagione, servizi inclusi

### **Timing Ideale**
- **Orario**: 15:00-18:00 (pomeriggio) oppure 11:00-14:00 (brunch)
- **Stagione**: primavera o inizio estate (aprile-giugno)
- **Settimana gravidanza**: 7°-8° mese (mamma ancora comoda)

### **Must-Have Decorazioni**
- Balloon arch o balloon wall (effetto scenografico)
- Sweet table con dolci a tema
- Photobooth corner con props (baffi, biberon, ciucci giganti)
- Libro delle dediche personalizzato
- Scritte "Oh Baby", "Baby Shower", nome bebè

### **Giochi Classici**
1. **Indovina il nome**: ospiti propongono nomi, genitori scelgono preferito
2. **Indovina peso e data**: scommesse su peso nascita e giorno parto
3. **Baby Bingo**: cartelle con termini baby (pannolino, biberon, ecc.)
4. **Diaper raffle**: estrazione tra chi porta pacchi pannolini
5. **Guess the baby food**: assaggio omogeneizzati bendati

---

## 🎁 Idee Regalo Ospiti (Gift Box)

- Mini candele profumate artigianali
- Saponi naturali fatti a mano
- Piantine grasse o succulente
- Confetti decorati in sacchettini lino
- Biscotti artigianali confezionati
- Bustine tè/tisane pregiate
- Magneti o segnalibri personalizzati
- Mini vasetti miele biologico

---

## 📸 Shot List Fotografo

- [ ] Allestimento location prima dell'arrivo ospiti
- [ ] Dettagli sweet table e decorazioni
- [ ] Ritratti futura mamma (singola + coppia)
- [ ] Arrivo ospiti e benvenuto
- [ ] Giochi e momenti divertenti
- [ ] Taglio torta baby shower
- [ ] Apertura regali (momento emozionale)
- [ ] Foto di gruppo tutti gli invitati
- [ ] Dettagli bomboniere e gift box
- [ ] Momenti spontanei e candid

---

**🎀 Buona organizzazione del tuo Baby Shower perfetto!** 👶✨
