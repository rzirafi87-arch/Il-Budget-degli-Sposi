# 🎓 Evento "Laurea" - Implementazione Completa

## 📋 Panoramica

L'evento "Laurea" è integrato nel sistema multi-evento con 10 categorie e sottocategorie, timeline completa, e logica di budget singolo (spese comuni) coerente con lo stile Natural Chic / La Trama.

---

## 🎯 Funzionalità Implementate

### 1) Schema Database ✅
- Tipo evento: `graduation` in `event_types`
- 10 categorie, 42+ sottocategorie
- File: `supabase-graduation-event-seed.sql` (idempotente)

### 2) Template TypeScript ✅
- File: `src/data/templates/graduation.ts`
- Esporta: `getGraduationTemplate(country)`, `getGraduationBudgetPercentages()`
- Struttura: categorie, sottocategorie, percentuali budget

### 3) API Routes ✅
- Seed: `POST /api/graduation/seed/[eventId]`
- Dashboard: `GET/POST /api/my/graduation-dashboard`
- Demo mode (senza JWT) restituisce template

### 4) Ensure-Default ✅
- `src/app/api/event/ensure-default/route.ts`
  - Slug `graduation`
  - Nome evento: "La mia Laurea"
  - Seed automatico al primo accesso

### 5) Frontend ✅
- Tabs: `NavTabs.tsx` → `graduationTabs`
- Header/Tabs visibili per `graduation`
- Idea di Budget integra percentuali Laurea
- `BudgetSummary` già supporta `eventType==='graduation'` come singolo

### 6) Documentazione ✅
- Questo file + `LAUREA-SETUP-GUIDE.md`

---

## 🗂️ Categorie (10) e Sottocategorie

1. Cerimonia Accademica
- Data e orario della proclamazione
- Prenotazione aula magna o sala (se privata)
- Relatore e correlatori (omaggi o regali simbolici)
- Tesi: stampa, rilegatura, copertine
- Corone d’alloro e bouquet
- Fotografo durante la proclamazione
- Permessi per accesso ospiti o fotografi

2. Location e Ricevimento
- Scelta location (ristorante, rooftop, casa, giardino, locale, bar)
- Affitto sala privata o terrazza
- Allestimento tavoli e mise en place
- Decorazioni tematiche (colori università, fiori, palloncini, backdrop)
- Tableau, segnaposti, menù personalizzati
- Bomboniere o gift bag “Laurea”
- Allestimento angolo foto / photobooth / parete verde

3. Catering / Ristorazione
- Pranzo o cena
- Apericena / buffet / finger food
- Bevande e cocktail bar
- Torta di laurea e dolci personalizzati
- Brindisi finale
- Servizio catering o locale scelto

4. Abbigliamento e Beauty
- Outfit laureato/a (cerimonia + festa)
- Cambio abito (post-evento)
- Trucco e parrucco
- Accessori, scarpe, gioielli, camicia personalizzata
- Ghirlanda d’alloro (se non già in cerimonia)

5. Foto, Video e Contenuti Social
- Fotografo / videomaker
- Shooting pre- e post-cerimonia
- Reel o mini-video per social
- Polaroid o photobooth
- Album digitale o fisico

6. Inviti e Grafica
- Inviti digitali / cartacei
- Coordinato grafico (tema, colori, font)
- Menù, segnaposti, tableau, ringraziamenti
- Hashtag o QR code per raccolta foto/video

7. Regali e Ringraziamenti
- Lista regali o “Gift Wallet”
- Ringraziamenti personalizzati
- Omaggio a relatore / correlatore / genitori
- Bomboniere e sacchetti confetti

8. Musica e Intrattenimento
- DJ o playlist personalizzata
- Band live o sax performer
- Audio e luci per la festa
- Animazione o karaoke

9. Trasporti e Logistica
- Auto per spostamenti università ↔ location
- Navetta ospiti (se location lontana)
- Parcheggi e permessi
- Pernottamenti ospiti (se da fuori città)

10. Gestione Budget (in-app)
- Budget stimato
- Acconti versati
- Saldi
- Spese extra
- Totale finale
- Differenza (stimato vs speso)

---

## 🗓️ Timeline – "Dalle tesi alla festa"
1) 2–3 mesi prima – Preparazione accademica e logistica
- Conferma data discussione/proclamazione
- Stesura tesi + presentazione
- Stampa/rilegatura tesi
- Contatta foto/video
- Prenota location
- Preventivo catering/menù
- Imposta budget in-app
- Scegli tema/colore

2) 1 mese prima – Definizione fornitori e dettagli
- Invia inviti
- Ordina corona d’alloro
- Commissiona bomboniere/gadget
- Lista regali/contributi
- Scegli outfit
- Conferma fotografo e location
- Ordina torta

3) 2 settimane prima – Rifinitura
- Rivedi presentazione e discorso
- Prova trucco/parrucco
- Invia dettagli fornitori
- Organizza playlist/DJ
- Prepara bomboniere/decorazioni
- Conferma trasporti/parcheggi

4) 1 settimana prima – Coordinamento finale
- Ultima verifica location/catering
- Stampa menù/segnaposti/inviti
- Controllo pagamenti
- Prepara abito e accessori
- Prova discorso
- Stampa checklist del giorno

5) Giorno della Laurea – Celebrazione e festa 🎓
- Preparazione (trucco, vestizione)
- Discussione / proclamazione
- Foto/Video
- Brindisi post-proclamazione
- Ricevimento/aperitivo
- Taglio torta e discorso
- Festa / DJ set
- Regali e bomboniere

6) Dopo l’evento – Chiusura e ricordi
- Ringraziamenti digitali/cartoline
- Raccolta foto/video
- Saldi fornitori
- Bilancio finale (stimato/speso)
- Reel/video ricordo

---

## 💰 Percentuali Budget Suggerite
- Cerimonia Accademica: 10%
- Location e Ricevimento: 25%
- Catering / Ristorazione: 30%
- Abbigliamento e Beauty: 8%
- Foto/Video/Social: 10%
- Inviti e Grafica: 5%
- Regali e Ringraziamenti: 4%
- Musica e Intrattenimento: 4%
- Trasporti e Logistica: 2%
- Gestione Budget (in-app): 2%

---

## 🧪 Test Rapidi
- Seed SQL: `node scripts/run-sql.mjs supabase-graduation-event-seed.sql`
- Ensure-Default: POST `/api/event/ensure-default` con `{"eventType":"graduation"}`
- Dashboard API: GET `/api/my/graduation-dashboard` (senza JWT → demo)

---

## 📌 Note
- Evento con **budget unico** (spese comuni)
- Stile coerente con app Natural Chic / La Trama
- Idempotenza seed ed endpoint

**Status**: ✅ Pronto
