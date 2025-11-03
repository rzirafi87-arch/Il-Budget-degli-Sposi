-- =====================================================
-- GENDER REVEAL EVENT SEED
-- =====================================================
-- Seed completo per evento Gender Reveal con categorie,
-- sottocategorie e timeline in stile Natural Chic / La Trama.
-- Evento autonomo per la rivelazione del sesso del bambino.
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
  v_subcat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO GENDER REVEAL
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
  'Gender Reveal',
  'genderreveal',
  CURRENT_DATE + INTERVAL '60 days',
  'Da definire',
  3500.00,
  'Festa di rivelazione del sesso del bambino - Momento emozionante e indimenticabile',
  '#FFB6C1,#87CEEB,#F5F5DC'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created Gender Reveal event with ID: %', v_event_id;

-- =====================================================
-- 2. CATEGORIA: LOCATION E ALLESTIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Location e Allestimento', 1, '🏡')
RETURNING id INTO v_cat_id;

-- Sottocategorie Location e Allestimento
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Scelta location (giardino, terrazza, sala, spiaggia, casa)', 500.00, 1, 'Affitto o preparazione dello spazio per la rivelazione'),
(v_cat_id, 'Noleggio tavoli, sedute e coperture', 300.00, 2, 'Arredi per ospiti e buffet'),
(v_cat_id, 'Allestimento a tema "boy or girl" o neutro', 400.00, 3, 'Coordinato decorativo rosa/azzurro o natural chic'),
(v_cat_id, 'Balloon wall e backdrop con scritta personalizzata', 350.00, 4, 'Parete di palloncini e sfondo fotografico'),
(v_cat_id, 'Tavolo principale con torta o box rivelazione', 200.00, 5, 'Allestimento tavolo centrale per il momento clou'),
(v_cat_id, 'Decorazioni floreali o naturali (gypsophila, pampas)', 300.00, 6, 'Fiori secchi, foglie d''ulivo, composizioni naturali'),
(v_cat_id, 'Luci decorative, candele, lanterne', 150.00, 7, 'Illuminazione ambientale e decorativa'),
(v_cat_id, 'Noleggio carretto dolci o photo corner', 200.00, 8, 'Stazione dolci o angolo foto personalizzato');

-- =====================================================
-- 3. CATEGORIA: MOMENTO RIVELAZIONE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Momento Rivelazione', 2, '🎉')
RETURNING id INTO v_cat_id;

-- Sottocategorie Momento Rivelazione
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Confetti / polveri colorate / palloncino da scoppiare', 150.00, 1, 'Elementi per la rivelazione fisica del sesso'),
(v_cat_id, 'Torta con interno colorato', 200.00, 2, 'Gender reveal cake con sorpresa interna'),
(v_cat_id, 'Busta sorpresa dal ginecologo (gender envelope)', 50.00, 3, 'Busta sigillata con risultato ecografia'),
(v_cat_id, 'Fuochi freddi o cannoni spara coriandoli', 180.00, 4, 'Effetti speciali per il momento rivelazione'),
(v_cat_id, 'Box con palloncini colorati', 120.00, 5, 'Scatola che rilascia palloncini rosa o azzurri'),
(v_cat_id, 'Coordinamento audio / video per il momento rivelazione', 250.00, 6, 'Regia tecnica del momento clou'),
(v_cat_id, 'Cronologia rivelazione (musica, countdown, foto, video)', 150.00, 7, 'Timeline precisa del momento con sottofondo musicale');

-- =====================================================
-- 4. CATEGORIA: CATERING / DOLCI E BEVANDE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering / Dolci e Bevande', 3, '🍰')
RETURNING id INTO v_cat_id;

-- Sottocategorie Catering
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Buffet dolce e salato', 600.00, 1, 'Rinfresco completo per ospiti'),
(v_cat_id, 'Sweet table coordinato con tema', 400.00, 2, 'Tavolo dolci con palette colori rivelazione'),
(v_cat_id, 'Torta "boy or girl"', 200.00, 3, 'Torta principale per la rivelazione'),
(v_cat_id, 'Cupcake, cake pops, biscotti colorati', 250.00, 4, 'Mini dolci decorati a tema'),
(v_cat_id, 'Bevande e cocktail analcolici', 200.00, 5, 'Drink colorati e mocktail per brindisi'),
(v_cat_id, 'Servizio catering o rinfresco organizzato', 500.00, 6, 'Servizio professionale o organizzazione fai-da-te');

-- =====================================================
-- 5. CATEGORIA: INVITI E GRAFICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Inviti e Grafica', 4, '💌')
RETURNING id INTO v_cat_id;

-- Sottocategorie Inviti e Grafica
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Inviti digitali o cartacei', 150.00, 1, 'Save the date per l''evento rivelazione'),
(v_cat_id, 'Tema grafico personalizzato (rosa vs azzurro, neutro)', 200.00, 2, 'Coordinato grafico completo'),
(v_cat_id, 'Segnaposti, cartellonistica e backdrop grafico', 180.00, 3, 'Segnaletica e elementi grafici per location'),
(v_cat_id, 'QR code per raccolta foto e video', 80.00, 4, 'Sistema di condivisione digitale ospiti'),
(v_cat_id, 'Biglietti di ringraziamento', 100.00, 5, 'Thank you card post-evento');

-- =====================================================
-- 6. CATEGORIA: FOTO, VIDEO E SOCIAL
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto, Video e Social', 5, '📸')
RETURNING id INTO v_cat_id;

-- Sottocategorie Foto, Video e Social
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo e/o videomaker', 600.00, 1, 'Servizio professionale completo'),
(v_cat_id, 'Shooting pre-evento (futura mamma/papà)', 300.00, 2, 'Servizio fotografico di coppia prima della rivelazione'),
(v_cat_id, 'Ripresa del momento rivelazione', 400.00, 3, 'Video HD del momento clou'),
(v_cat_id, 'Reel o video social dedicato', 250.00, 4, 'Montaggio video per Instagram/TikTok'),
(v_cat_id, 'Angolo foto con accessori "Team Boy / Team Girl"', 200.00, 5, 'Photo booth con props tematici'),
(v_cat_id, 'Polaroid corner o cornice personalizzata', 150.00, 6, 'Stazione foto istantanee con cornice brandizzata');

-- =====================================================
-- 7. CATEGORIA: INTRATTENIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Intrattenimento', 6, '🎮')
RETURNING id INTO v_cat_id;

-- Sottocategorie Intrattenimento
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Giochi a tema (indovina il sesso, quiz, scommesse)', 100.00, 1, 'Attività ludiche per coinvolgere ospiti'),
(v_cat_id, 'Musica dal vivo o playlist', 300.00, 2, 'Sottofondo musicale o DJ set'),
(v_cat_id, 'Presentatore / amico che gestisce la rivelazione', 200.00, 3, 'Conduttore del momento rivelazione'),
(v_cat_id, 'Animazione bambini (se presenti)', 250.00, 4, 'Baby sitter o animatore per piccoli ospiti'),
(v_cat_id, 'Proiezione breve video o ecografia emozionale', 150.00, 5, 'Video montaggio con momenti della gravidanza');

-- =====================================================
-- 8. CATEGORIA: REGALI E RINGRAZIAMENTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
RETURNING id INTO v_cat_id;

-- Sottocategorie Regali e Ringraziamenti
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Mini gift per ospiti (candela, biscotto, confetti, piantina)', 200.00, 1, 'Pensierino per ogni partecipante'),
(v_cat_id, 'Biglietti ringraziamento', 80.00, 2, 'Cartoline di ringraziamento personalizzate'),
(v_cat_id, 'Libro dediche o cornice ricordi', 100.00, 3, 'Guestbook o memory frame per messaggi'),
(v_cat_id, 'Bomboniere a tema neutro', 300.00, 4, 'Bomboniere eleganti e sostenibili');

-- =====================================================
-- 9. CATEGORIA: ABBIGLIAMENTO E BEAUTY
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Abbigliamento e Beauty', 8, '👗')
RETURNING id INTO v_cat_id;

-- Sottocategorie Abbigliamento e Beauty
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit dei genitori coordinato', 200.00, 1, 'Abbigliamento coppia per la rivelazione'),
(v_cat_id, 'Trucco e parrucco (futura mamma)', 120.00, 2, 'Servizio beauty per la mamma'),
(v_cat_id, 'Accessori a tema (coroncina, spilla "Team Boy/Girl")', 80.00, 3, 'Dettagli coordinati con il tema'),
(v_cat_id, 'Shooting prima della rivelazione', 250.00, 4, 'Servizio fotografico di coppia pre-evento');

-- =====================================================
-- 10. CATEGORIA: TRASPORTI E LOGISTICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
RETURNING id INTO v_cat_id;

-- Sottocategorie Trasporti e Logistica
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Trasporto materiali / decorazioni', 150.00, 1, 'Noleggio furgone o servizio trasporto'),
(v_cat_id, 'Parcheggi ospiti', 100.00, 2, 'Gestione parcheggio o valet parking'),
(v_cat_id, 'Noleggio auto o van', 200.00, 3, 'Auto di rappresentanza per i genitori'),
(v_cat_id, 'Alloggio ospiti (se fuori città)', 400.00, 4, 'Hotel o B&B per ospiti da fuori');

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
(v_cat_id, 'Spese extra', 0.00, 3, 'Costi imprevisti o aggiunte dell''ultimo minuto'),
(v_cat_id, 'Regali ricevuti', 0.00, 4, 'Lista regali o contributi ricevuti'),
(v_cat_id, 'Totale finale', 0.00, 5, 'Consuntivo finale spese sostenute');

-- =====================================================
-- 12. TIMELINE GENDER REVEAL
-- =====================================================
-- Timeline principale suddivisa per fasi temporali
-- Nota: days_before indica giorni PRIMA dell'evento (es: 30 = 1 mese prima)

-- FASE 1: 1 MESE PRIMA - Ideazione e Pianificazione
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '1 mese prima', 'Scegli data e location', 'Definisci data dell''evento e prenota o prepara la location (giardino, terrazza, sala, casa)', 30, 'Ideazione e Pianificazione', false, 1),
(v_event_id, '1 mese prima', 'Ricevi il referto del sesso del bambino', 'Busta sigillata dal ginecologo da consegnare al fornitore della torta o da aprire durante l''evento', 30, 'Ideazione e Pianificazione', false, 2),
(v_event_id, '1 mese prima', 'Scegli tema grafico e palette colori', 'Rosa vs azzurro, neutro natural chic, o tema personalizzato', 30, 'Ideazione e Pianificazione', false, 3),
(v_event_id, '1 mese prima', 'Prenota fotografo / videomaker', 'Servizio professionale per immortalare il momento rivelazione', 30, 'Ideazione e Pianificazione', false, 4),
(v_event_id, '1 mese prima', 'Richiedi preventivi per torta e catering', 'Contatta pasticceria e catering per sweet table e buffet', 30, 'Ideazione e Pianificazione', false, 5),
(v_event_id, '1 mese prima', 'Prepara lista invitati e inviti digitali', 'Crea la lista ospiti e prepara le grafiche per gli inviti', 30, 'Ideazione e Pianificazione', false, 6),
(v_event_id, '1 mese prima', 'Imposta budget nell''app', 'Definisci budget totale e suddivisione per categorie', 30, 'Ideazione e Pianificazione', false, 7);

-- FASE 2: 2-3 SETTIMANE PRIMA - Preparativi e Fornitori
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '2-3 settimane prima', 'Invia inviti ufficiali', 'Invia gli inviti digitali o cartacei agli ospiti', 20, 'Preparativi e Fornitori', false, 8),
(v_event_id, '2-3 settimane prima', 'Ordina torta rivelazione', 'Conferma ordine torta con interno colorato o elemento sorpresa', 20, 'Preparativi e Fornitori', false, 9),
(v_event_id, '2-3 settimane prima', 'Prenota fornitore balloon / cannoni coriandoli', 'Balloon wall, palloncini, fuochi freddi, cannoni spara coriandoli', 20, 'Preparativi e Fornitori', false, 10),
(v_event_id, '2-3 settimane prima', 'Definisci allestimenti e fiori', 'Ordina composizioni floreali, pampas, gypsophila, foglie d''ulivo', 20, 'Preparativi e Fornitori', false, 11),
(v_event_id, '2-3 settimane prima', 'Scegli outfit coppia', 'Coordinato abbigliamento per i futuri genitori', 20, 'Preparativi e Fornitori', false, 12),
(v_event_id, '2-3 settimane prima', 'Conferma fotografo e regia del momento', 'Brief con fotografo su timing e posizionamento per il momento clou', 20, 'Preparativi e Fornitori', false, 13);

-- FASE 3: 1 SETTIMANA PRIMA - Rifinitura e Coordinamento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '1 settimana prima', 'Brief finale con tutti i fornitori', 'Conferma orari, dettagli e coordinamento con tutti i fornitori', 7, 'Rifinitura e Coordinamento', false, 14),
(v_event_id, '1 settimana prima', 'Stampa cartellonistica e coordinato grafico', 'Segnaposti, backdrop, welcome board, cartelli direzionali', 7, 'Rifinitura e Coordinamento', false, 15),
(v_event_id, '1 settimana prima', 'Prepara playlist e countdown audio', 'Seleziona musica per il momento rivelazione e sottofondo', 7, 'Rifinitura e Coordinamento', false, 16),
(v_event_id, '1 settimana prima', 'Ricevi dolci personalizzati', 'Ritira cupcake, cake pops, biscotti colorati', 7, 'Rifinitura e Coordinamento', false, 17),
(v_event_id, '1 settimana prima', 'Prepara mini gift ospiti', 'Confeziona bomboniere o pensierini per i partecipanti', 7, 'Rifinitura e Coordinamento', false, 18);

-- FASE 4: GIORNO DEL GENDER REVEAL
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'Giorno del Gender Reveal', 'Allestimento e test audio/video mattina', 'Setup completo location, test regia e impianto audio', 0, 'Giorno del Gender Reveal', false, 19),
(v_event_id, 'Giorno del Gender Reveal', 'Shooting iniziale di coppia', 'Servizio fotografico pre-evento con i futuri genitori', 0, 'Giorno del Gender Reveal', false, 20),
(v_event_id, 'Giorno del Gender Reveal', 'Accoglienza ospiti e presentazione', 'Welcome drink e introduzione all''evento', 0, 'Giorno del Gender Reveal', false, 21),
(v_event_id, 'Giorno del Gender Reveal', 'Countdown e rivelazione del sesso del bambino', 'IL MOMENTO CLOU: scoperta se maschio o femmina!', 0, 'Giorno del Gender Reveal', false, 22),
(v_event_id, 'Giorno del Gender Reveal', 'Taglio torta / lancio coriandoli', 'Momento celebrativo post-rivelazione', 0, 'Giorno del Gender Reveal', false, 23),
(v_event_id, 'Giorno del Gender Reveal', 'Musica, brindisi, giochi e foto', 'Festa, intrattenimento ospiti, photo booth', 0, 'Giorno del Gender Reveal', false, 24),
(v_event_id, 'Giorno del Gender Reveal', 'Ringraziamenti e saluti', 'Consegna mini gift e saluti finali agli ospiti', 0, 'Giorno del Gender Reveal', false, 25);

-- FASE 5: DOPO L'EVENTO - Chiusura e Ricordi
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'Dopo l''evento', 'Invia ringraziamenti digitali o cartoline', 'Thank you message a tutti i partecipanti', -7, 'Chiusura e Ricordi', false, 26),
(v_event_id, 'Dopo l''evento', 'Condividi video rivelazione sui social', 'Pubblica reel o video emozionale del momento rivelazione', -7, 'Chiusura e Ricordi', false, 27),
(v_event_id, 'Dopo l''evento', 'Completa saldi fornitori', 'Pagamenti finali a tutti i fornitori coinvolti', -7, 'Chiusura e Ricordi', false, 28),
(v_event_id, 'Dopo l''evento', 'Aggiorna bilancio finale in app', 'Chiusura consuntivo e riepilogo spese effettive', -7, 'Chiusura e Ricordi', false, 29),
(v_event_id, 'Dopo l''evento', 'Crea mini album digitale', 'Raccogli le foto migliori e crea album ricordo', -7, 'Chiusura e Ricordi', false, 30);

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
WHERE e.event_type = 'genderreveal'
GROUP BY e.id, e.name, e.event_type;
