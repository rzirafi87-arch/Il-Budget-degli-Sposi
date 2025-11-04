-- =====================================================
-- BABY SHOWER EVENT SEED
-- =====================================================
-- Seed completo per evento Baby Shower con categorie,
-- sottocategorie e timeline in stile Natural Chic / La Trama.
-- Evento festoso per la futura nascita, con giochi, regali e comfort.
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO BABY SHOWER
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
  'Baby Shower',
  'babyshower',
  CURRENT_DATE + INTERVAL '45 days',
  'Da definire',
  1800.00,
  'Festa per la futura nascita con giochi, regali e comfort',
  '#F8E8D8,#A3B59D,#E7B7D3'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created Baby Shower event with ID: %', v_event_id;

-- =====================================================
-- 2. CATEGORIA: ORGANIZZAZIONE GENERALE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Organizzazione Generale', 1, '🗂️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Tipo di evento (solo donne, misto, Sip & See)', 0.00, 1, 'Definizione formato e target ospiti'),
(v_cat_id, 'Data & orario', 0.00, 2, 'Scelta data, orario e periodo ideale'),
(v_cat_id, 'Budget complessivo e margine extra', 0.00, 3, 'Stima budget e margine extra'),
(v_cat_id, 'Tema & palette', 0.00, 4, 'Scelta tema, colori e stile'),
(v_cat_id, 'Ospiti target', 0.00, 5, 'Numero previsto e tipologia ospiti'),
(v_cat_id, 'Timeline & to-do', 0.00, 6, 'Scadenze e assegnazioni principali');

-- =====================================================
-- 3. CATEGORIA: OSPITI & INVITI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Ospiti & Inviti', 2, '💌')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Lista ospiti', 0.00, 1, 'Anagrafiche e relazioni ospiti'),
(v_cat_id, 'Save-the-date', 0.00, 2, 'Invio promemoria evento'),
(v_cat_id, 'Inviti (design, stampa, invio)', 80.00, 3, 'Creazione e invio inviti digitali/cartacei'),
(v_cat_id, 'Gestione RSVP', 0.00, 4, 'Conferme, allergie, accompagnatori'),
(v_cat_id, 'Promemoria evento', 0.00, 5, 'Reminder a 7 giorni e 48 ore');

-- =====================================================
-- 4. CATEGORIA: LOCATION & ALLESTIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Location & Allestimento', 3, '🏡')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Location (casa, sala, ristorante, giardino)', 200.00, 1, 'Scelta e prenotazione location'),
(v_cat_id, 'Affitto spazio/permessi', 120.00, 2, 'Costi sala, tensostruttura, permessi'),
(v_cat_id, 'Noleggi tavoli/sedie/tovagliato', 100.00, 3, 'Noleggio arredi e stoviglie'),
(v_cat_id, 'Decorazioni (backdrop, palloncini, fiori)', 150.00, 4, 'Allestimento scenografico e floreale'),
(v_cat_id, 'Sweet table (alzatine, vassoi, topper)', 80.00, 5, 'Allestimento tavolo dolci'),
(v_cat_id, 'Stationery coordinata', 60.00, 6, 'Welcome sign, segnaposto, tag bomboniere');

-- =====================================================
-- 5. CATEGORIA: CATERING & TORTA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering & Torta', 4, '🍰')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Menù (finger food, brunch, buffet)', 250.00, 1, 'Menù principale per ospiti'),
(v_cat_id, 'Bevande (analcolici, mocktail, succhi)', 60.00, 2, 'Bevande e drink analcolici'),
(v_cat_id, 'Torta baby shower', 90.00, 3, 'Torta personalizzata con topper'),
(v_cat_id, 'Dessert bar (cupcake, biscotti, macaron)', 70.00, 4, 'Dolci decorati e personalizzati'),
(v_cat_id, 'Opzioni bimbi & intolleranze', 0.00, 5, 'Menù gluten-free, lactose-free, vegetarian');

-- =====================================================
-- 6. CATEGORIA: INTRATTENIMENTO & GIOCHI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Intrattenimento & Giochi', 5, '🎲')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Scaletta giochi (45–60 min)', 0.00, 1, 'Programmazione giochi e attività'),
(v_cat_id, 'Idee gioco (Bingo, quiz, memory, diaper raffle)', 0.00, 2, 'Selezione giochi e regole'),
(v_cat_id, 'Premi per giochi', 40.00, 3, 'Mini gadget, dolcetti, piante grasse'),
(v_cat_id, 'Materiali per giochi', 20.00, 4, 'Nastro, manichino, memory, quiz'),
(v_cat_id, 'Diaper raffle (lotteria pannolini)', 0.00, 5, 'Gestione lotteria e premi');

-- =====================================================
-- 7. CATEGORIA: REGALI & LISTA NASCITA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali & Lista Nascita', 6, '🎁')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Lista nascita (link store, negozio locale)', 0.00, 1, 'Creazione e gestione lista nascita'),
(v_cat_id, 'Raccolta fondi regalo cumulativo', 0.00, 2, 'Gestione regalo collettivo'),
(v_cat_id, 'Coordinamento doppioni', 0.00, 3, 'Aggiornamento post-acquisto'),
(v_cat_id, 'Scatola auguri & biglietti', 15.00, 4, 'Dediche cartacee o QR album');

-- =====================================================
-- 8. CATEGORIA: FOTO, VIDEO & SOCIAL
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto, Video & Social', 7, '📸')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo/videomaker', 120.00, 1, 'Servizio foto/video professionale'),
(v_cat_id, 'Selfie-corner/photobooth', 50.00, 2, 'Fondale, props, stampa istantanea'),
(v_cat_id, 'QR album condiviso', 0.00, 3, 'Google Photos/Drive, istruzioni ospiti'),
(v_cat_id, 'Reel/clip highlight', 0.00, 4, 'Montaggio breve post-evento');

-- =====================================================
-- 9. CATEGORIA: MAMMA & OUTFIT
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Mamma & Outfit', 8, '🤰')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit mamma (premaman)', 60.00, 1, 'Abito comodo/elegante per la mamma'),
(v_cat_id, 'Beauty (parrucchiere, make-up, manicure)', 40.00, 2, 'Servizi beauty pre-evento'),
(v_cat_id, 'Comfort corner', 20.00, 3, 'Sedia comoda, ventaglio, snack, acqua'),
(v_cat_id, 'Note salute', 0.00, 4, 'Tempi di riposo, farmaci, no alcol');

-- =====================================================
-- 10. CATEGORIA: BOMBONIERE & GADGET
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Bomboniere & Gadget', 9, '🎀')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Bomboniera (candela, piantina, miele)', 50.00, 1, 'Bomboniera artigianale o green'),
(v_cat_id, 'Packaging (scatoline, nastri, tag)', 20.00, 2, 'Packaging personalizzato'),
(v_cat_id, 'Confetti (classici, aromatizzati)', 15.00, 3, 'Selezione confetti e colori'),
(v_cat_id, 'Bigliettini ringraziamento', 10.00, 4, 'Testo e stampa biglietti');

-- =====================================================
-- 11. CATEGORIA: LOGISTICA & SERVIZI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Logistica & Servizi', 10, '🚗')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Trasporti & parcheggi', 30.00, 1, 'Indicazioni, navetta se necessaria'),
(v_cat_id, 'Noleggi tecnici (audio, microfono)', 25.00, 2, 'Impianto audio, microfono'),
(v_cat_id, 'Pulizie pre/post evento', 40.00, 3, 'Servizio pulizie'),
(v_cat_id, 'Sicurezza bimbi (area kids, tappeti)', 20.00, 4, 'Area kids, coperture prese'),
(v_cat_id, 'Piano B meteo', 0.00, 5, 'Tenda, sala interna per emergenza');

-- =====================================================
-- 12. CATEGORIA: POST-EVENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Post-Evento', 11, '📅')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Selezione foto/video', 0.00, 1, 'Condivisione album agli ospiti'),
(v_cat_id, 'Ringraziamenti (messaggi, ecard, cartoline)', 0.00, 2, 'Ringraziamenti personalizzati'),
(v_cat_id, 'Resi & cambi regalo', 0.00, 3, 'Gestione resi, scadenze, scontrini'),
(v_cat_id, 'Bilancio finale', 0.00, 4, 'Spese vs budget, note per futuro');

-- =====================================================
-- 13. TIMELINE BABY SHOWER
-- =====================================================
-- Timeline: "DALL'IDEA ALLA FESTA"
-- Nota: days_before indica giorni PRIMA dell'evento (es: 42 = 6 settimane prima)

-- FASE 1: T-6/T-5 settimane - Ideazione e Pre-check
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-6/T-5 settimane', 'Definisci formato e tema', 'Scegli tipo di evento, tema, palette e budget', 42, 'Ideazione e Pre-check', false, 1),
(v_event_id, 'T-6/T-5 settimane', 'Pre-check location', 'Verifica disponibilità location e opzioni', 42, 'Ideazione e Pre-check', false, 2),
(v_event_id, 'T-6/T-5 settimane', 'Stila lista ospiti preliminare', 'Compila lista ospiti e target', 42, 'Ideazione e Pre-check', false, 3);

-- FASE 2: T-4 settimane - Prenotazioni e Inviti
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-4 settimane', 'Prenota location e fornitori', 'Prenota catering, fotografo, allestimenti', 28, 'Prenotazioni e Inviti', false, 4),
(v_event_id, 'T-4 settimane', 'Crea invito (bozza)', 'Prepara bozza invito e struttura giochi', 28, 'Prenotazioni e Inviti', false, 5),
(v_event_id, 'T-4 settimane', 'Imposta lista nascita', 'Crea lista nascita e raccolta fondi', 28, 'Prenotazioni e Inviti', false, 6);

-- FASE 3: T-3 settimane - Conferme e Ordini
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-3 settimane', 'Invia inviti + save-the-date', 'Invia inviti e promemoria', 21, 'Conferme e Ordini', false, 7),
(v_event_id, 'T-3 settimane', 'Ordina torta e dessert bar', 'Ordina dolci e torta personalizzata', 21, 'Conferme e Ordini', false, 8),
(v_event_id, 'T-3 settimane', 'Ordina decorazioni e noleggi', 'Prenota decorazioni e arredi', 21, 'Conferme e Ordini', false, 9),
(v_event_id, 'T-3 settimane', 'Seleziona outfit mamma', 'Scegli abito e servizi beauty', 21, 'Conferme e Ordini', false, 10),
(v_event_id, 'T-3 settimane', 'Conferma menù', 'Definisci menù e opzioni bimbi', 21, 'Conferme e Ordini', false, 11);

-- FASE 4: T-2 settimane - Scaletta e Acquisti
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-2 settimane', 'Sollecita RSVP', 'Richiedi conferme e chiudi numeri', 14, 'Scaletta e Acquisti', false, 12),
(v_event_id, 'T-2 settimane', 'Stila scaletta evento/giochi', 'Definisci programma e giochi', 14, 'Scaletta e Acquisti', false, 13),
(v_event_id, 'T-2 settimane', 'Stampa stationery', 'Stampa welcome sign, segnaposto, tag', 14, 'Scaletta e Acquisti', false, 14),
(v_event_id, 'T-2 settimane', 'Acquista premi giochi', 'Acquista gadget e premi', 14, 'Scaletta e Acquisti', false, 15),
(v_event_id, 'T-2 settimane', 'Definisci playlist', 'Prepara playlist musicale', 14, 'Scaletta e Acquisti', false, 16);

-- FASE 5: T-1 settimana - Conferme Finali
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-1 settimana', 'Conferme finali a location/catering/fotografo', 'Ultime conferme fornitori', 7, 'Conferme Finali', false, 17),
(v_event_id, 'T-1 settimana', 'Prepara kit giochi', 'Prepara materiali e kit giochi', 7, 'Conferme Finali', false, 18),
(v_event_id, 'T-1 settimana', 'Allinea team accoglienza', 'Organizza accoglienza ospiti', 7, 'Conferme Finali', false, 19),
(v_event_id, 'T-1 settimana', 'Predisponi QR album', 'Prepara istruzioni album condiviso', 7, 'Conferme Finali', false, 20),
(v_event_id, 'T-1 settimana', 'Prova set-up tavoli', 'Testa disposizione tavoli e sweet table', 7, 'Conferme Finali', false, 21);

-- FASE 6: T-2/1 giorni - Pre-allestimento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'T-2/1 giorni', 'Ritiro torta/dessert', 'Ritira dolci e torta se necessario', 2, 'Pre-allestimento', false, 22),
(v_event_id, 'T-2/1 giorni', 'Pre-allestimento backdrop/sweet table', 'Prepara backdrop e tavolo dolci', 2, 'Pre-allestimento', false, 23),
(v_event_id, 'T-2/1 giorni', 'Check attrezzature audio', 'Verifica impianto audio e microfono', 2, 'Pre-allestimento', false, 24);

-- FASE 7: Giorno evento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, 'Giorno evento', 'Allestimento finale', 'Allestimento location, segnaletica, corner foto', 0, 'Giorno evento', false, 25),
(v_event_id, 'Giorno evento', 'Accoglienza ospiti', 'Benvenuto e accoglienza', 0, 'Giorno evento', false, 26),
(v_event_id, 'Giorno evento', 'Giochi (slot 45–60’)', 'Gestione giochi e attività', 0, 'Giorno evento', false, 27),
(v_event_id, 'Giorno evento', 'Taglio torta', 'Taglio torta baby shower', 0, 'Giorno evento', false, 28),
(v_event_id, 'Giorno evento', 'Ringraziamento finale', 'Ringraziamenti a ospiti e fornitori', 0, 'Giorno evento', false, 29);

-- FASE 8: +1/+7 giorni - Post evento
INSERT INTO timeline_items (event_id, phase, title, description, days_before, category, completed, display_order)
VALUES
(v_event_id, '+1/+7 giorni', 'Condivisione foto/album', 'Condividi album e foto agli ospiti', -1, 'Post evento', false, 30),
(v_event_id, '+1/+7 giorni', 'Ringraziamenti personalizzati', 'Invia messaggi, ecard, cartoline', -1, 'Post evento', false, 31),
(v_event_id, '+1/+7 giorni', 'Resi/cambi regalo', 'Gestione resi e cambi', -1, 'Post evento', false, 32),
(v_event_id, '+1/+7 giorni', 'Bilancio spese', 'Aggiorna bilancio finale', -1, 'Post evento', false, 33);

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
WHERE e.event_type = 'babyshower'
GROUP BY e.id, e.name, e.event_type;
