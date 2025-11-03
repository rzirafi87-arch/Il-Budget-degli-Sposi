-- =====================================================
-- BABY SHOWER EVENT SEED
-- Categorie, sottocategorie e timeline
-- Stile: Natural Chic / La Trama
-- =====================================================

-- Inserisci evento baby shower
INSERT INTO events (
  id,
  user_id,
  event_type,
  event_date,
  total_budget,
  bride_initial_budget,
  groom_initial_budget,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000009'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'babyshower',
  CURRENT_DATE + INTERVAL '3 months',
  8000.00,
  0.00,
  0.00,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CATEGORIE E SOTTOCATEGORIE
-- =====================================================

-- 1️⃣ LOCATION E ALLESTIMENTO
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Location e Allestimento',
  1,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS location_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'location_cat_id', 'Scelta location', 800.00, 1),
  (:'location_cat_id', 'Noleggio tavoli e sedute', 300.00, 2),
  (:'location_cat_id', 'Decorazioni a tema', 400.00, 3),
  (:'location_cat_id', 'Balloon wall e backdrop', 350.00, 4),
  (:'location_cat_id', 'Allestimento tavoli', 250.00, 5),
  (:'location_cat_id', 'Fiori e piante', 400.00, 6),
  (:'location_cat_id', 'Luci e candele decorative', 200.00, 7)
ON CONFLICT DO NOTHING;

-- 2️⃣ CATERING / DOLCI E BEVANDE
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Catering e Dolci',
  2,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS catering_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'catering_cat_id', 'Buffet dolce e salato', 600.00, 1),
  (:'catering_cat_id', 'Sweet table / Candy bar', 400.00, 2),
  (:'catering_cat_id', 'Torta baby shower', 200.00, 3),
  (:'catering_cat_id', 'Cupcake e cake pops', 150.00, 4),
  (:'catering_cat_id', 'Biscotti decorati', 100.00, 5),
  (:'catering_cat_id', 'Bevande e mocktail', 250.00, 6),
  (:'catering_cat_id', 'Servizio catering', 500.00, 7)
ON CONFLICT DO NOTHING;

-- 3️⃣ INVITI E GRAFICA
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Inviti e Grafica',
  3,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS grafica_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'grafica_cat_id', 'Inviti digitali o cartacei', 150.00, 1),
  (:'grafica_cat_id', 'Tema grafico e palette', 100.00, 2),
  (:'grafica_cat_id', 'Segnaposti e cartellonistica', 80.00, 3),
  (:'grafica_cat_id', 'Coordinato sweet table', 70.00, 4),
  (:'grafica_cat_id', 'Biglietti ringraziamento', 60.00, 5),
  (:'grafica_cat_id', 'QR code per raccolta foto', 50.00, 6)
ON CONFLICT DO NOTHING;

-- 4️⃣ REGALI E LISTA NASCITA
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Regali e Lista Nascita',
  4,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS regali_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'regali_cat_id', 'Lista nascita online', 0.00, 1),
  (:'regali_cat_id', 'Coordinamento regali', 0.00, 2),
  (:'regali_cat_id', 'Pacchetti regalo e bigliettini', 100.00, 3),
  (:'regali_cat_id', 'Gift box per ospiti', 200.00, 4),
  (:'regali_cat_id', 'Libro delle dediche', 50.00, 5)
ON CONFLICT DO NOTHING;

-- 5️⃣ INTRATTENIMENTO
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Intrattenimento',
  5,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS intrattenimento_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'intrattenimento_cat_id', 'Giochi a tema', 100.00, 1),
  (:'intrattenimento_cat_id', 'Angolo foto con accessori', 150.00, 2),
  (:'intrattenimento_cat_id', 'Musica sottofondo', 200.00, 3),
  (:'intrattenimento_cat_id', 'Proiezione foto e video', 100.00, 4),
  (:'intrattenimento_cat_id', 'Animazione bambini', 250.00, 5)
ON CONFLICT DO NOTHING;

-- 6️⃣ ABBIGLIAMENTO E BEAUTY
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Abbigliamento e Beauty',
  6,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS beauty_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'beauty_cat_id', 'Outfit futura mamma', 200.00, 1),
  (:'beauty_cat_id', 'Outfit futuro papà', 150.00, 2),
  (:'beauty_cat_id', 'Trucco e parrucco', 120.00, 3),
  (:'beauty_cat_id', 'Shooting fotografico pre-evento', 300.00, 4),
  (:'beauty_cat_id', 'Accessori coordinati', 80.00, 5)
ON CONFLICT DO NOTHING;

-- 7️⃣ FOTO E VIDEO
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Foto e Video',
  7,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS foto_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'foto_cat_id', 'Fotografo o videomaker', 600.00, 1),
  (:'foto_cat_id', 'Shooting coppia e ospiti', 400.00, 2),
  (:'foto_cat_id', 'Reel per social', 200.00, 3),
  (:'foto_cat_id', 'Album digitale condiviso', 100.00, 4),
  (:'foto_cat_id', 'Photobooth o polaroid', 250.00, 5)
ON CONFLICT DO NOTHING;

-- 8️⃣ RICORDI E RINGRAZIAMENTI
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Ricordi e Ringraziamenti',
  8,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS ricordi_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'ricordi_cat_id', 'Bomboniere / regali ospiti', 300.00, 1),
  (:'ricordi_cat_id', 'Libro firme o dediche', 80.00, 2),
  (:'ricordi_cat_id', 'Biglietti ringraziamento', 100.00, 3),
  (:'ricordi_cat_id', 'Video ringraziamento', 150.00, 4)
ON CONFLICT DO NOTHING;

-- 9️⃣ TRASPORTI E LOGISTICA
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Trasporti e Logistica',
  9,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS trasporti_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'trasporti_cat_id', 'Parcheggi ospiti', 50.00, 1),
  (:'trasporti_cat_id', 'Trasporto materiali', 100.00, 2),
  (:'trasporti_cat_id', 'Noleggio furgoncino', 150.00, 3),
  (:'trasporti_cat_id', 'Alloggio ospiti fuori città', 400.00, 4)
ON CONFLICT DO NOTHING;

-- 🔟 GESTIONE BUDGET
INSERT INTO categories (id, event_id, name, display_order, created_at) 
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000009'::uuid,
  'Gestione Budget',
  10,
  NOW()
) ON CONFLICT DO NOTHING
RETURNING id AS budget_cat_id \gset

INSERT INTO subcategories (category_id, name, estimated_cost, display_order) VALUES
  (:'budget_cat_id', 'Budget stimato', 0.00, 1),
  (:'budget_cat_id', 'Acconti fornitori', 0.00, 2),
  (:'budget_cat_id', 'Spese extra / imprevisti', 200.00, 3),
  (:'budget_cat_id', 'Totale finale', 0.00, 4),
  (:'budget_cat_id', 'Regali ricevuti', 0.00, 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TIMELINE BABY SHOWER
-- =====================================================

INSERT INTO timeline_items (event_id, phase, title, description, days_before, display_order, created_at) VALUES
-- 🔸 2 MESI PRIMA
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Scegli data e location', 'Fase: ideazione e pianificazione. Decidi quando e dove organizzare il baby shower.', 60, 1, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Definisci tema e palette colori', 'Scegli se rosa, azzurro, neutro o "green gender reveal". Stile Natural Chic con toni naturali.', 60, 2, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Decidi il tipo di evento', 'Solo baby shower o anche gender reveal? Pianifica il format della festa.', 60, 3, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Stila la lista invitati', 'Quanti ospiti inviterai? Amici, parenti, colleghe? Definisci il numero per il catering.', 60, 4, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Richiedi preventivi catering', 'Contatta pasticcerie e catering per buffet dolce e salato, torta, sweet table.', 60, 5, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Contatta fotografo/videomaker', 'Cerca professionisti per immortalare la giornata e creare ricordi speciali.', 60, 6, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 mesi prima', 'Imposta budget nell''app', 'Definisci il budget totale e suddividilo per categorie nell''app.', 60, 7, NOW()),

-- 🔸 1 MESE PRIMA
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Invia inviti ufficiali', 'Fase: conferme e dettagli. Spedisci inviti digitali o cartacei con tema coordinato.', 30, 8, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Ordina decorazioni e fiori', 'Balloon wall, backdrop, gypsophila, eucalipto, pampas, rami secchi, luci decorative.', 30, 9, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Prenota torta e sweet table', 'Conferma ordine per torta baby shower, cupcake, cake pops, biscotti decorati.', 30, 10, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Scegli outfit futura mamma', 'Look comodo ma elegante, in palette con il tema dell''evento.', 30, 11, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Organizza lista regali', 'Attiva baby registry online o coordina con amici per regali utili al bebè.', 30, 12, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 mese prima', 'Conferma fotografo e location', 'Verifica disponibilità, orari, check finale su tutti i servizi prenotati.', 30, 13, NOW()),

-- 🔸 2 SETTIMANE PRIMA
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Ricevi e prepara decorazioni', 'Fase: rifinitura. Controlla materiali ricevuti, organizza allestimenti.', 14, 14, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Prepara giochi e intrattenimenti', 'Indovina il nome, peso, data nascita, bingo baby, ecc.', 14, 15, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Organizza playlist musicale', 'Scegli musica di sottofondo adatta a un ambiente rilassato e gioioso.', 14, 16, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Ordina pasticceria personalizzata', 'Conferma dettagli finali per torta, cupcake, candy bar con tema coordinato.', 14, 17, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Stampa cartellonistica e menù', 'Segnaposti, cartelli direzionali, menù buffet, scritte personalizzate.', 14, 18, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '2 settimane prima', 'Prova trucco e parrucco', 'Se previsto shooting fotografico, fai una prova per il look del giorno.', 14, 19, NOW()),

-- 🔸 1 SETTIMANA PRIMA
('00000000-0000-0000-0000-000000000009'::uuid, '1 settimana prima', 'Check finale con fornitori', 'Fase: coordinamento finale. Ricontatta catering, fotografo, fiorista, location.', 7, 20, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 settimana prima', 'Stampa checklist evento', 'Lista di tutto ciò che serve il giorno stesso: dai palloncini alle candeline.', 7, 21, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 settimana prima', 'Organizza trasporto materiali', 'Piano per spostare decorazioni, dolci, attrezzature alla location.', 7, 22, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 settimana prima', 'Prepara gift bag ospiti', 'Mini candele, confetti, saponi artigianali, piantine, bigliettini di ringraziamento.', 7, 23, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, '1 settimana prima', 'Verifica pagamenti', 'Controlla acconti versati e saldi da pagare il giorno o dopo l''evento.', 7, 24, NOW()),

-- 🔸 GIORNO DEL BABY SHOWER
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Allestimento mattina', 'Fase: la festa 🎀. Prepara tavoli, balloon wall, sweet table, fiori, luci, photobooth.', 0, 25, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Shooting di coppia', 'Servizio fotografico dedicato ai futuri genitori prima dell''arrivo degli ospiti.', 0, 26, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Arrivo ospiti e welcome drink', 'Accoglienza con bevande fresche, mocktail, spremute, prosecco per chi desidera.', 0, 27, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Giochi e momenti dedicati', 'Giochi baby shower, indovina il nome, momenti di condivisione e dediche al bebè.', 0, 28, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Taglio torta e brindisi', 'Momento clou: taglio della torta baby shower e brindisi tutti insieme.', 0, 29, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Musica e foto ricordo', 'Musica, photobooth, polaroid, raccolta di scatti spontanei e divertenti.', 0, 30, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Giorno evento', 'Ringraziamenti e saluti', 'Saluta gli ospiti, consegna gift bag, ringrazia tutti per la partecipazione.', 0, 31, NOW()),

-- 🔸 DOPO L'EVENTO
('00000000-0000-0000-0000-000000000009'::uuid, 'Dopo evento', 'Invia ringraziamenti', 'Fase: chiusura e ricordi. Spedisci biglietti o messaggi digitali di ringraziamento.', -7, 32, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Dopo evento', 'Condividi foto e video', 'Crea galleria condivisa o album digitale per amici e parenti.', -7, 33, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Dopo evento', 'Completa pagamenti', 'Salda eventuali fornitori in sospeso e aggiorna l''app con spese finali.', -7, 34, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Dopo evento', 'Aggiorna bilancio finale', 'Registra tutte le spese effettive e confrontale con il budget iniziale.', -7, 35, NOW()),
('00000000-0000-0000-0000-000000000009'::uuid, 'Dopo evento', 'Crea reel o video ricordo', 'Montaggio video highlights per conservare i momenti più belli del baby shower.', -7, 36, NOW())
ON CONFLICT DO NOTHING;

-- Fine seed baby shower
