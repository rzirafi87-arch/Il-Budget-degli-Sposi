# 💞 Setup Rapido Anniversario di Matrimonio

## 1. Database Setup

```bash
# Esegui SQL seed
node scripts/run-sql.mjs supabase-anniversary-event-seed.sql
```

## 2. Verifica

```sql
-- Test categorie
SELECT et.name, COUNT(c.id) as num_categories
FROM event_types et
LEFT JOIN categories c ON c.event_type = et.slug
WHERE et.slug = 'anniversary'
GROUP BY et.name;
-- Atteso: 10 categorie

-- Test sottocategorie
SELECT c.name as category, COUNT(sc.id) as subs
FROM categories c
LEFT JOIN subcategories sc ON sc.category_id = c.id
WHERE c.event_type = 'anniversary'
GROUP BY c.name, c.display_order
ORDER BY c.display_order;
-- Atteso: 54 sottocategorie totali

-- Test timeline
SELECT COUNT(*) FROM timeline_phases WHERE event_type = 'anniversary';
-- Atteso: 6 fasi

-- Test tradizioni
SELECT country, COUNT(*) FROM traditions 
WHERE event_type = 'anniversary'
GROUP BY country;
-- Atteso: IT (5), ID (5), MX (6), IN (7) = 23 tradizioni

-- Test budget tips
SELECT COUNT(*) FROM budget_tips WHERE event_type = 'anniversary';
-- Atteso: ~22 tips
```

## 3. Test Frontend

1. **Non autenticato**: `/select-event-type` → Anniversario → Demo mode
2. **Autenticato**: Registrati → Seleziona Anniversario → Dashboard auto-seed

## 4. Struttura File

```
✅ SQL
   └── supabase-anniversary-event-seed.sql

✅ Localizzazione
   ├── src/messages/it.json (eventTypeSpecific.anniversary)
   └── src/messages/id.json (events.anniversary)

✅ Frontend
   ├── src/data/config/events.json (available: true se configurato)
   ├── src/app/select-event-type/page.tsx
   └── src/components/NavTabs.tsx

✅ Docs
   ├── ANNIVERSARIO-SETUP-GUIDE.md (questo file)
   └── ANNIVERSARIO-COMPLETAMENTO.md (da creare se implementazione completa)
```

## 5. Categorie Quick Reference

1. **Cerimonia e Rinnovo Promesse** (7 subs)
   - Prenotazione chiesa/luogo simbolico
   - Celebrante, offerta parrocchia
   - Fiorista altare/arco cerimonia
   - Musica cerimonia (arpa, quartetto)
   - Decorazioni mise en place
   - Rinnovo anelli o scambio simbolico

2. **Location e Ricevimento** (8 subs)
   - Scelta location (ristorante, villa, giardino, terrazza, spiaggia)
   - Affitto sala/spazio esterno
   - Allestimento tavoli tema (argento, oro, salvia, avorio)
   - Luci e candele decorative
   - Tavolo d'onore e segnaposti
   - Tableau/angolo foto ricordi
   - Tovagliato e stoviglie coordinati
   - Bomboniere/gift box

3. **Catering e Ristorazione** (6 subs)
   - Pranzo/cena servita
   - Buffet/apericena elegante
   - Torta personalizzata
   - Brindisi e champagne
   - Bevande e vini selezionati
   - Servizio catering/menu ristorante

4. **Abbigliamento e Beauty** (4 subs)
   - Abiti coppia (cerimonia + ricevimento)
   - Parrucchiere e make-up
   - Accessori coordinati (gioielli, boutonnière, scarpe)
   - Outfit figli e parenti stretti

5. **Foto e Video** (6 subs)
   - Fotografo e videomaker
   - Shooting coppia pre-evento
   - Reportage durante festa
   - Mini video racconto/reel
   - Angolo foto/photobooth
   - Album o cornice digitale

6. **Inviti e Grafica** (5 subs)
   - Partecipazioni digitali/cartacee
   - Coordinato grafico (tema, colori, logo)
   - Tableau, segnaposti, menù
   - Biglietti ringraziamento
   - QR code raccolta foto/video

7. **Regali e Ringraziamenti** (4 subs)
   - Lista regali/Gift Wallet digitale
   - Regali simbolici reciproci (gioiello, viaggio, fotoalbum)
   - Bomboniere/gift bag ospiti
   - Biglietti ringraziamento

8. **Musica e Intrattenimento** (6 subs)
   - DJ o band live
   - Cantante cerimonia
   - Playlist personalizzata
   - Proiezione video ricordi/slideshow
   - Ballo coppia simbolico
   - Artisti/performer (violino, sax, ballerini)

9. **Trasporti e Logistica** (4 subs)
   - Auto coppia (d'epoca, cabrio)
   - Navetta ospiti
   - Parcheggi e permessi
   - Pernottamenti ospiti

10. **Gestione Budget** (6 subs)
    - Budget stimato
    - Acconti versati
    - Saldi fornitori
    - Spese extra
    - Regali ricevuti
    - Totale finale

**Totale**: 10 categorie, 54 sottocategorie

## 6. Timeline Fasi

1. **3-4 mesi prima**: Idea e impostazione evento
   - Definisci tipo anniversario (argento/oro/intimo)
   - Fissa data e location
   - Scegli tema e colori
   - Contatta fornitori principali
   - Imposta budget

2. **2 mesi prima**: Conferme e fornitori
   - Conferma location e contratti
   - Prenota fiorista
   - Ricerca outfit coppia
   - Ordina torta
   - Invia inviti

3. **1 mese prima**: Definizione dettagli
   - Conferma musicisti/DJ
   - Programma giornata
   - Tableau e menù
   - Shooting pre-evento
   - Organizza trasporti

4. **2 settimane prima**: Rifinitura
   - Prova trucco/parrucco
   - Brief finale fornitori
   - Checklist giorno evento
   - Promesse personali

5. **Giorno anniversario**: Celebrazione 💞
   - Preparazione coppia
   - Cerimonia/rinnovo promesse
   - Servizio foto/video
   - Ricevimento
   - Festa e balli

6. **Dopo evento**: Chiusura e ricordi
   - Ringraziamenti
   - Raccolta foto/video
   - Pagamenti finali
   - Bilancio finale
   - Album ricordo

## 7. Tradizioni Internazionali

### 🇮🇹 Italia
- Nozze d'argento (25 anni) e d'oro (50 anni)
- Rinnovo promesse in chiesa
- Regalo simbolico reciproco
- Video retrospettivo
- Ballo di coppia

### 🇮🇩 Indonesia
- Syukuran pernikahan (festa ringraziamento)
- Pernikahan perak (25) e emas (50)
- Hadiah emas atau perak
- Album kenangan keluarga

### 🇲🇽 Messico
- Bodas de plata (25) e de oro (50)
- Vals de aniversario
- Serenata con mariachi
- Video retrospectivo familiar

### 🇮🇳 India
- Silver/Golden Jubilee
- Vow renewal ceremony (Saptapadi)
- Exchange of garlands
- Charity/donation (dakshina)

## 8. Budget Type

- ✅ Budget comune coppia
- ✅ Spend type: `"common"` (default)
- ✅ Label data: "Data Anniversario"
- ✅ Milestone: 25° (argento), 50° (oro), o altro
- ✅ Contributi: figli, nipoti, parenti

## 9. Tips Risparmio Chiave

- **Cerimonia**: Location naturale (giardino/spiaggia) invece di chiesa
- **Location**: Tema metallico DIY con spray
- **Catering**: Buffet elegante (-30% vs servito)
- **Abbigliamento**: Riutilizza abiti eleganti già posseduti
- **Foto**: Fotografo emergente + album digitale
- **Inviti**: Partecipazioni digitali + QR code DIY
- **Musica**: Playlist Spotify + impianto audio affittato
- **Trasporti**: Auto d'epoca solo per foto simboliche
- **Bomboniere**: DIY con confetti in sacchetti organza

## 10. Varianti Evento

### 🥈 Nozze d'Argento (25 anni)
- Celebrazione famiglia allargata
- Regali in argento
- Messa solenne
- Festa elegante

### 🥇 Nozze d'Oro (50 anni)
- Grande celebrazione multigenerazionale
- Regali in oro
- Benedizione religiosa
- Festa con tutti i nipoti

### 💝 Anniversario Intimo (5°, 10°, 15°...)
- Cena elegante per due
- Weekend romantico
- Rinnovo promesse privato
- Celebration più riservata

---

**Status**: ✅ Database Ready  
**Next Steps**: Implementazione frontend (template, API routes, componenti)  
**Docs**: Questo file + eventuali ANNIVERSARIO-COMPLETAMENTO.md se frontend completato
