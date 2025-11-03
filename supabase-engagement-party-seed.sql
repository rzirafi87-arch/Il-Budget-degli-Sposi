-- =====================================================
-- ENGAGEMENT PARTY EVENT SEED
-- =====================================================
-- Seed completo per evento Festa di Fidanzamento con categorie,
-- sottocategorie e timeline in stile Natural Chic / La Trama.
-- Evento elegante e romantico, autonomo o pre-matrimoniale.
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
  v_subcat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO FESTA DI FIDANZAMENTO
-- =====================================================
INSERT INTO events (
  name,
  event_type,
  event_date,
  event_location,
  total_budget,
  description,
  color_theme
)
VALUES (
  'Festa di Fidanzamento',
  'engagement-party',
  CURRENT_DATE + INTERVAL '90 days',
  'Da definire',
  5000.00,
  'Festa di fidanzamento elegante e romantica - Celebrazione dell''impegno d''amore',
  '#D4AF37,#F8E8D8,#A3B59D'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created Engagement Party event with ID: %', v_event_id;

-- =====================================================
-- 2. CATEGORIA: CERIMONIA O MOMENTO SIMBOLICO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Cerimonia o Momento Simbolico', 1, '💍')
RETURNING id INTO v_cat_id;

-- Sottocategorie Cerimonia
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Scelta della data e del luogo (privato o pubblico)', 0.00, 1, 'Definizione data e location per il momento simbolico'),
(v_cat_id, 'Cerimonia simbolica o scambio di promesse / anello', 300.00, 2, 'Momento formale di scambio promesse o conferma fidanzamento'),
(v_cat_id, 'Officiante o amico incaricato del momento', 200.00, 3, 'Persona che conduce la cerimonia simbolica'),
(v_cat_id, 'Musica di sottofondo (violino, chitarra, voce)', 400.00, 4, 'Accompagnamento musicale dal vivo per il momento intimo'),
(v_cat_id, 'Decorazioni per l''area cerimonia (arco, fiori, candele)', 500.00, 5, 'Allestimento scenografico dell''area cerimonia'),
(v_cat_id, 'Servizio fotografico per il momento clou', 600.00, 6, 'Copertura fotografica del momento simbolico');

-- =====================================================
-- 3. CATEGORIA: LOCATION E ALLESTIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Location e Allestimento', 2, '🏛️')
RETURNING id INTO v_cat_id;

-- Sottocategorie Location e Allestimento
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Selezione location (villa, terrazza, ristorante, giardino, spiaggia)', 1200.00, 1, 'Affitto o prenotazione location elegante'),
(v_cat_id, 'Affitto sala o spazio esterno', 800.00, 2, 'Costo location se non incluso nella ristorazione'),
(v_cat_id, 'Decorazioni a tema (palette colori, luci, fiori, materiali naturali)', 700.00, 3, 'Allestimento coordinato con tema scelto'),
(v_cat_id, 'Tavoli, sedute, tovagliato coordinato', 500.00, 4, 'Noleggio arredi e mise en place'),
(v_cat_id, 'Luci decorative, lanterne e candele', 400.00, 5, 'Illuminazione ambientale e romantica'),
(v_cat_id, 'Photobooth o backdrop personalizzato', 350.00, 6, 'Angolo fotografico con sfondo brandizzato coppia'),
(v_cat_id, 'Tableau o angolo "storia della coppia"', 300.00, 7, 'Esposizione fotografica o timeline della relazione');

-- =====================================================
-- 4. CATEGORIA: CATERING / RISTORAZIONE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering / Ristorazione', 3, '🍽️')
RETURNING id INTO v_cat_id;

-- Sottocategorie Catering
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Pranzo, cena o apericena', 1500.00, 1, 'Servizio ristorazione principale per ospiti'),
(v_cat_id, 'Buffet o servizio al tavolo', 1200.00, 2, 'Modalità di servizio pasti'),
(v_cat_id, 'Sweet table e torta di fidanzamento', 600.00, 3, 'Tavolo dolci e torta celebrativa'),
(v_cat_id, 'Bevande e cocktail personalizzati', 500.00, 4, 'Drink signature della coppia e open bar'),
(v_cat_id, 'Servizio catering o ristorante', 1800.00, 5, 'Fornitore catering o location con ristorazione'),
(v_cat_id, 'Brindisi simbolico', 200.00, 6, 'Champagne o prosecco per il brindisi ufficiale');

-- =====================================================
-- 5. CATEGORIA: ABBIGLIAMENTO E BEAUTY
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Abbigliamento e Beauty', 4, '👗')
RETURNING id INTO v_cat_id;

-- Sottocategorie Abbigliamento e Beauty
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit dei fidanzati (abito elegante o boho chic)', 800.00, 1, 'Abbigliamento coordinato della coppia'),
(v_cat_id, 'Trucco e parrucco', 200.00, 2, 'Servizio beauty per lei'),
(v_cat_id, 'Accessori coordinati (gioielli, boutonnière, scarpe)', 300.00, 3, 'Dettagli e accessori abbigliamento'),
(v_cat_id, 'Shooting pre-evento', 400.00, 4, 'Servizio fotografico di coppia prima della festa');

-- =====================================================
-- 6. CATEGORIA: FOTO, VIDEO E CONTENUTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto, Video e Contenuti', 5, '📸')
RETURNING id INTO v_cat_id;

-- Sottocategorie Foto e Video
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo e videomaker', 1200.00, 1, 'Servizio professionale completo foto e video'),
(v_cat_id, 'Shooting coppia / cerimonia / festa', 800.00, 2, 'Copertura fotografica di tutti i momenti principali'),
(v_cat_id, 'Reel o mini-video per social', 400.00, 3, 'Video editing per pubblicazione social media'),
(v_cat_id, 'Angolo Polaroid o cornice personalizzata', 250.00, 4, 'Stazione foto istantanee con cornice coppia'),
(v_cat_id, 'Album o galleria digitale', 300.00, 5, 'Album fotografico o piattaforma condivisione digitale');

-- =====================================================
-- 7. CATEGORIA: INVITI E GRAFICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Inviti e Grafica', 6, '💌')
RETURNING id INTO v_cat_id;

-- Sottocategorie Inviti e Grafica
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Inviti digitali o cartacei', 250.00, 1, 'Partecipazioni per la festa di fidanzamento'),
(v_cat_id, 'Coordinato grafico (palette, font, monogramma coppia)', 300.00, 2, 'Identità visiva completa per l''evento'),
(v_cat_id, 'Segnaposti, menù, tableau', 200.00, 3, 'Elementi grafici per tavoli e location'),
(v_cat_id, 'Biglietti di ringraziamento', 150.00, 4, 'Thank you card per ospiti'),
(v_cat_id, 'QR code per raccolta foto e video', 100.00, 5, 'Sistema digitale condivisione contenuti ospiti');

-- =====================================================
-- 8. CATEGORIA: REGALI E RINGRAZIAMENTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
RETURNING id INTO v_cat_id;

-- Sottocategorie Regali e Ringraziamenti
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Lista regali o "Gift Box" digitale', 0.00, 1, 'Piattaforma lista nozze o contributi digitali'),
(v_cat_id, 'Bomboniere / gift bag ospiti', 400.00, 2, 'Pensierino elegante per ogni invitato'),
(v_cat_id, 'Biglietti ringraziamento personalizzati', 150.00, 3, 'Cartoline o biglietti di ringraziamento'),
(v_cat_id, 'Angolo dediche o guestbook', 200.00, 4, 'Libro firme o installazione per messaggi ospiti');

-- =====================================================
-- 9. CATEGORIA: MUSICA E INTRATTENIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Musica e Intrattenimento', 8, '🎵')
RETURNING id INTO v_cat_id;

-- Sottocategorie Musica e Intrattenimento
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'DJ o band live', 800.00, 1, 'Intrattenimento musicale professionale'),
(v_cat_id, 'Playlist personalizzata con canzoni simboliche', 0.00, 2, 'Selezione brani significativi per la coppia'),
(v_cat_id, 'Presentatore o amico per il brindisi', 200.00, 3, 'Conduttore per i momenti ufficiali'),
(v_cat_id, 'Piccolo spettacolo o sorpresa (video, fuochi freddi, ecc.)', 400.00, 4, 'Elemento scenico di intrattenimento');

-- =====================================================
-- 10. CATEGORIA: TRASPORTI E LOGISTICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
RETURNING id INTO v_cat_id;

-- Sottocategorie Trasporti e Logistica
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Auto coppia (classica o d''epoca)', 300.00, 1, 'Noleggio auto elegante per i fidanzati'),
(v_cat_id, 'Navetta ospiti (se location lontana)', 400.00, 2, 'Servizio trasporto collettivo per invitati'),
(v_cat_id, 'Parcheggi e permessi', 150.00, 3, 'Gestione parcheggio o permessi ZTL'),
(v_cat_id, 'Pernottamenti ospiti fuori città', 600.00, 4, 'Hotel o B&B per ospiti da fuori regione');

-- =====================================================
-- 11. CATEGORIA: GESTIONE BUDGET
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Gestione Budget', 10, '💰')
RETURNING id INTO v_cat_id;

-- Sottocategorie Gestione Budget
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Budget stimato', 0.00, 1, 'Budget totale preventivato per l''evento'),
(v_cat_id, 'Acconti fornitori', 0.00, 2, 'Tracciamento pagamenti anticipati'),
(v_cat_id, 'Saldi', 0.00, 3, 'Pagamenti finali ai fornitori'),
(v_cat_id, 'Spese extra', 0.00, 4, 'Costi imprevisti o aggiunte dell''ultimo minuto'),
(v_cat_id, 'Totale finale', 0.00, 5, 'Consuntivo finale spese sostenute');

-- =====================================================
-- 12. TIMELINE FESTA DI FIDANZAMENTO
-- =====================================================
-- Timeline: "DAL SÌ ALLA FESTA"

-- FASE 1: 2-3 MESI PRIMA - Idea e Pianificazione
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Fissa data e location', 'Scegli la data della festa e prenota la location (villa, terrazza, ristorante, giardino, spiaggia)', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 1),
(v_event_id, 'Decidi il formato dell''evento', 'Cerimonia simbolica + festa oppure solo festa conviviale', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 2),
(v_event_id, 'Scegli tema, colori e stile', 'Definisci stile: boho, elegante, rustic chic, minimal, romantico', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 3),
(v_event_id, 'Contatta fotografo e videomaker', 'Prenota servizio fotografico e video professionale', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 4),
(v_event_id, 'Richiedi preventivi catering / ristorante / torta', 'Confronta preventivi per ristorazione e sweet table', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 5),
(v_event_id, 'Prepara lista invitati', 'Definisci il numero di ospiti e compila la lista completa', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 6),
(v_event_id, 'Imposta budget nell''app', 'Definisci budget totale e suddivisione per categorie', CURRENT_DATE + INTERVAL '30 days', 'Idea e Pianificazione', false, 7);

-- FASE 2: 1 MESE PRIMA - Conferme e Fornitori
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia inviti ufficiali', 'Invia partecipazioni digitali o cartacee agli ospiti', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 8),
(v_event_id, 'Ordina fiori e decorazioni', 'Conferma ordine composizioni floreali e allestimenti location', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 9),
(v_event_id, 'Ordina torta e sweet table', 'Definisci design torta di fidanzamento e tavolo dolci', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 10),
(v_event_id, 'Scegli outfit coppia', 'Acquista o noleggia abiti eleganti coordinati', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 11),
(v_event_id, 'Prenota musica / DJ', 'Conferma prenotazione DJ o band live per intrattenimento', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 12),
(v_event_id, 'Conferma fotografo / videomaker', 'Brief dettagliato su momenti chiave e stile fotografico', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 13),
(v_event_id, 'Decidi bomboniere e regali ospiti', 'Scegli pensierino per invitati e ordina bomboniere', CURRENT_DATE + INTERVAL '60 days', 'Conferme e Fornitori', false, 14);

-- FASE 3: 2 SETTIMANE PRIMA - Rifinitura
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia brief fornitori (orari, scaletta, colori)', 'Condividi timeline evento e dettagli operativi con tutti i fornitori', CURRENT_DATE + INTERVAL '76 days', 'Rifinitura', false, 15),
(v_event_id, 'Prepara playlist personalizzata', 'Seleziona canzoni simboliche e momenti musicali speciali', CURRENT_DATE + INTERVAL '76 days', 'Rifinitura', false, 16),
(v_event_id, 'Prepara decorazioni e allestimenti', 'Organizza materiali decorativi e verifica completezza', CURRENT_DATE + INTERVAL '76 days', 'Rifinitura', false, 17),
(v_event_id, 'Stampa cartellonistica e segnaposti', 'Prepara welcome board, tableau, menù, segnaposti', CURRENT_DATE + INTERVAL '76 days', 'Rifinitura', false, 18),
(v_event_id, 'Controlla pagamenti e acconti', 'Verifica acconti versati e pianifica saldi finali', CURRENT_DATE + INTERVAL '76 days', 'Rifinitura', false, 19);

-- FASE 4: 1 SETTIMANA PRIMA - Coordinamento Finale
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Ultima riunione con location e fotografi', 'Sopralluogo finale e conferma dettagli operativi', CURRENT_DATE + INTERVAL '83 days', 'Coordinamento Finale', false, 20),
(v_event_id, 'Prova trucco / parrucco', 'Hair & makeup trial per lei', CURRENT_DATE + INTERVAL '83 days', 'Coordinamento Finale', false, 21),
(v_event_id, 'Organizza trasporto materiali / auto coppia', 'Pianifica logistica trasporti e noleggio auto elegante', CURRENT_DATE + INTERVAL '83 days', 'Coordinamento Finale', false, 22),
(v_event_id, 'Stampa checklist evento', 'Prepara checklist finale per il giorno della festa', CURRENT_DATE + INTERVAL '83 days', 'Coordinamento Finale', false, 23);

-- FASE 5: GIORNO DELLA FESTA 💞
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Preparazione e allestimento mattina', 'Setup completo location e area cerimonia', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 24),
(v_event_id, 'Shooting pre-evento coppia', 'Servizio fotografico di coppia prima dell''arrivo ospiti', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 25),
(v_event_id, 'Cerimonia simbolica o brindisi', 'Momento formale di scambio promesse o brindisi ufficiale', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 26),
(v_event_id, 'Cena / apericena / taglio torta', 'Servizio ristorazione e taglio torta di fidanzamento', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 27),
(v_event_id, 'Musica e balli', 'Intrattenimento musicale e balli con ospiti', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 28),
(v_event_id, 'Consegna bomboniere e ringraziamenti', 'Distribuzione gift bag e saluti finali agli ospiti', CURRENT_DATE + INTERVAL '90 days', 'Giorno della Festa', false, 29);

-- FASE 6: DOPO L'EVENTO - Chiusura e Ricordi
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia ringraziamenti a ospiti e fornitori', 'Thank you message a tutti i partecipanti e fornitori', CURRENT_DATE + INTERVAL '97 days', 'Chiusura e Ricordi', false, 30),
(v_event_id, 'Raccogli foto e video', 'Scarica tutte le foto da fotografo e ospiti', CURRENT_DATE + INTERVAL '97 days', 'Chiusura e Ricordi', false, 31),
(v_event_id, 'Completa pagamenti', 'Versa tutti i saldi finali ai fornitori', CURRENT_DATE + INTERVAL '97 days', 'Chiusura e Ricordi', false, 32),
(v_event_id, 'Aggiorna bilancio finale', 'Chiudi consuntivo spese nell''app', CURRENT_DATE + INTERVAL '97 days', 'Chiusura e Ricordi', false, 33),
(v_event_id, 'Crea album digitale o video ricordo', 'Monta album fotografico o video emozionale della festa', CURRENT_DATE + INTERVAL '97 days', 'Chiusura e Ricordi', false, 34);

END $$;

-- =====================================================
-- VERIFICA FINALE
-- =====================================================
SELECT 
  e.name AS evento,
  e.event_type,
  COUNT(DISTINCT c.id) AS num_categorie,
  COUNT(DISTINCT s.id) AS num_sottocategorie,
  COUNT(DISTINCT t.id) AS num_timeline_items,
  SUM(s.estimated_cost) AS budget_totale_stimato
FROM events e
LEFT JOIN categories c ON c.event_id = e.id
LEFT JOIN subcategories s ON s.category_id = c.id
LEFT JOIN timeline_items t ON t.event_id = e.id
WHERE e.event_type = 'engagement-party'
GROUP BY e.id, e.name, e.event_type;
