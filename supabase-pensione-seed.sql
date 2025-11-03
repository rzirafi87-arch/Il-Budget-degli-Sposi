-- =====================================================
-- RETIREMENT PARTY EVENT SEED (PENSIONE)
-- =====================================================
-- Seed completo per evento Festa di Pensionamento con categorie,
-- sottocategorie e timeline in stile Natural Chic / La Trama.
-- Evento celebrativo elegante per il passaggio alla nuova vita.
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO PENSIONE
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
  'Festa di Pensionamento',
  'retirement',
  CURRENT_DATE + INTERVAL '60 days',
  'Da definire',
  4000.00,
  'Celebrazione pensionamento - Dal lavoro alla libertà',
  '#D4AF37,#A3B59D,#F8E8D8'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created Retirement Party event with ID: %', v_event_id;

-- =====================================================
-- 2. CATEGORIA: CERIMONIA O MOMENTO SIMBOLICO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Cerimonia o Momento Simbolico', 1, '🎖️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Scelta luogo della celebrazione (azienda, ristorante, casa privata, sala)', 0.00, 1, 'Definizione location per il momento simbolico'),
(v_cat_id, 'Breve discorso o cerimonia di ringraziamento', 150.00, 2, 'Momento formale di saluto e gratitudine'),
(v_cat_id, 'Presentatore o collega che conduce il momento', 200.00, 3, 'Persona che conduce la cerimonia ufficiale'),
(v_cat_id, 'Omaggio simbolico (targa, libro, album, video)', 300.00, 4, 'Regalo commemorativo dalla azienda/colleghi'),
(v_cat_id, 'Proiezione foto o video "carriera e ricordi"', 250.00, 5, 'Slideshow o video emozionale della carriera'),
(v_cat_id, 'Brindisi inaugurale o taglio torta', 150.00, 6, 'Momento conviviale di celebrazione');

-- =====================================================
-- 3. CATEGORIA: LOCATION E ALLESTIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Location e Allestimento', 2, '🏛️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Selezione location (ristorante, giardino, sala eventi, terrazza)', 800.00, 1, 'Scelta e prenotazione location elegante'),
(v_cat_id, 'Affitto sala o spazio esterno', 600.00, 2, 'Costo location se non incluso nella ristorazione'),
(v_cat_id, 'Allestimento elegante e sobrio (fiori, piante, luci calde)', 500.00, 3, 'Decorazioni raffinate e atmosfera calda'),
(v_cat_id, 'Tavoli e mise en place coordinati', 400.00, 4, 'Allestimento tavoli con tovagliato e centrotavola'),
(v_cat_id, 'Tableau e segnaposti', 150.00, 5, 'Cartellonistica e segnaposto personalizzati'),
(v_cat_id, 'Photobooth con tema "nuovi inizi" o "libertà"', 300.00, 6, 'Angolo fotografico a tema pensionamento'),
(v_cat_id, 'Decorazioni personalizzate (foto di carriera, oggetti simbolici)', 350.00, 7, 'Elementi decorativi personalizzati e ricordi professionali');

-- =====================================================
-- 4. CATEGORIA: CATERING / RISTORAZIONE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering / Ristorazione', 3, '🍽️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Cena servita o buffet conviviale', 1200.00, 1, 'Servizio ristorazione principale'),
(v_cat_id, 'Sweet table e dessert personalizzati', 400.00, 2, 'Tavolo dolci con dessert raffinati'),
(v_cat_id, 'Torta "Buona Pensione" o con dedica personalizzata', 200.00, 3, 'Torta celebrativa a tema pensionamento'),
(v_cat_id, 'Bevande, vini e brindisi', 350.00, 4, 'Selezione vini e bevande per brindisi'),
(v_cat_id, 'Servizio catering o ristorante', 800.00, 5, 'Fornitore catering o ristorante con servizio completo');

-- =====================================================
-- 5. CATEGORIA: INVITI E GRAFICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Inviti e Grafica', 4, '💌')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Inviti digitali o cartacei (tema oro, verde, avorio, beige)', 150.00, 1, 'Partecipazioni eleganti con palette raffinata'),
(v_cat_id, 'Coordinato grafico (menù, segnaposti, ringraziamenti)', 200.00, 2, 'Identità visiva coordinata per l''evento'),
(v_cat_id, 'Tableau, cartellonistica e backdrop', 180.00, 3, 'Welcome board e cartelli direzionali'),
(v_cat_id, 'QR code per raccolta foto e video', 80.00, 4, 'Sistema digitale condivisione contenuti ospiti'),
(v_cat_id, 'Biglietti ringraziamento personalizzati', 120.00, 5, 'Thank you cards per colleghi e invitati');

-- =====================================================
-- 6. CATEGORIA: FOTO, VIDEO E CONTENUTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto, Video e Contenuti', 5, '📸')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo / videomaker', 800.00, 1, 'Servizio professionale completo foto e video'),
(v_cat_id, 'Shooting con colleghi e famiglia', 400.00, 2, 'Servizio fotografico con ospiti e familiari'),
(v_cat_id, 'Reel o mini video commemorativo', 300.00, 3, 'Video editing celebrativo per social e ricordo'),
(v_cat_id, 'Proiezione "la mia carriera in 5 minuti"', 250.00, 4, 'Video montaggio momenti salienti carriera'),
(v_cat_id, 'Album digitale o cornice ricordo', 200.00, 5, 'Album fotografico o cornice digitale commemorativa');

-- =====================================================
-- 7. CATEGORIA: MUSICA E INTRATTENIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Musica e Intrattenimento', 6, '🎵')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'DJ o musica di sottofondo live (jazz, acustica, lounge)', 600.00, 1, 'Intrattenimento musicale elegante e raffinato'),
(v_cat_id, 'Playlist personalizzata "ricordi e futuro"', 0.00, 2, 'Selezione brani significativi della vita lavorativa'),
(v_cat_id, 'Brevi interventi o dediche da colleghi e amici', 150.00, 3, 'Momenti di testimonianza e affetto'),
(v_cat_id, 'Piccolo spettacolo comico o sorpresa', 400.00, 4, 'Intrattenimento leggero e sorprese speciali'),
(v_cat_id, 'Karaoke finale o ballo simbolico', 200.00, 5, 'Momento di festa e condivisione musicale');

-- =====================================================
-- 8. CATEGORIA: REGALI E RINGRAZIAMENTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Regalo collettivo (viaggio, esperienza, oggetto simbolico)', 800.00, 1, 'Presente importante da colleghi e azienda'),
(v_cat_id, 'Bomboniere o gift box per invitati', 300.00, 2, 'Pensierino elegante per ogni ospite'),
(v_cat_id, 'Targhe o riconoscimenti professionali', 250.00, 3, 'Riconoscimenti formali carriera e contributi'),
(v_cat_id, 'Biglietti e dediche scritte', 100.00, 4, 'Messaggi personalizzati da colleghi'),
(v_cat_id, 'Album delle dediche o guestbook', 180.00, 5, 'Libro firme con messaggi e auguri');

-- =====================================================
-- 9. CATEGORIA: ABBIGLIAMENTO E BEAUTY
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Abbigliamento e Beauty', 8, '👔')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit elegante ma sobrio (in linea con il tono della festa)', 300.00, 1, 'Abbigliamento raffinato per il festeggiato'),
(v_cat_id, 'Trucco / parrucco (per servizi fotografici)', 120.00, 2, 'Servizio beauty per servizio fotografico'),
(v_cat_id, 'Accessori coordinati (foulard, gioielli, dettagli oro o sabbia)', 150.00, 3, 'Accessori eleganti coordinati all''outfit'),
(v_cat_id, 'Shooting pre-evento', 200.00, 4, 'Servizio fotografico professionale prima della festa');

-- =====================================================
-- 10. CATEGORIA: TRASPORTI E LOGISTICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Parcheggi ospiti', 100.00, 1, 'Gestione parcheggio riservato o valet'),
(v_cat_id, 'Navetta o trasporto colleghi', 300.00, 2, 'Servizio navetta per ospiti da luoghi comuni'),
(v_cat_id, 'Trasporto materiali / allestimenti', 150.00, 3, 'Noleggio furgone o corriere per decorazioni'),
(v_cat_id, 'Pernottamento ospiti (se evento fuori città)', 400.00, 4, 'Hotel o B&B per ospiti da fuori regione');

-- =====================================================
-- 11. CATEGORIA: GESTIONE BUDGET
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Gestione Budget', 10, '💰')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Budget stimato', 0.00, 1, 'Budget totale preventivato per l''evento'),
(v_cat_id, 'Acconti fornitori', 0.00, 2, 'Tracciamento pagamenti anticipati'),
(v_cat_id, 'Saldi', 0.00, 3, 'Pagamenti finali ai fornitori'),
(v_cat_id, 'Spese extra', 0.00, 4, 'Costi imprevisti o aggiunte dell''ultimo minuto'),
(v_cat_id, 'Totale finale', 0.00, 5, 'Consuntivo finale spese sostenute'),
(v_cat_id, 'Regali ricevuti', 0.00, 6, 'Controvalore regali e contributi ricevuti');

-- =====================================================
-- 12. TIMELINE PENSIONAMENTO
-- =====================================================
-- Timeline: "DAL LAVORO ALLA FESTA"

-- FASE 1: 2-3 MESI PRIMA - Ideazione e Pianificazione
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Scegli data e location', 'Definisci la data della festa e prenota la location (azienda, ristorante, sala eventi)', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 1),
(v_event_id, 'Definisci tipo di festa', 'Decidi il formato: intima con amici, formale aziendale, o festa familiare', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 2),
(v_event_id, 'Contatta fotografo / videomaker', 'Prenota servizio fotografico e video professionale', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 3),
(v_event_id, 'Richiedi preventivi catering / ristorante / torta', 'Confronta preventivi per ristorazione e dolci', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 4),
(v_event_id, 'Prenota musica o intrattenimento', 'Conferma DJ, band live o playlist curata', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 5),
(v_event_id, 'Stila lista invitati', 'Compila lista completa di colleghi, amici e familiari', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 6),
(v_event_id, 'Imposta budget nell''app', 'Definisci budget totale e suddivisione per categorie', CURRENT_DATE + INTERVAL '30 days', 'Ideazione e Pianificazione', false, 7);

-- FASE 2: 1 MESE PRIMA - Conferme e Fornitori
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia inviti ufficiali', 'Invia partecipazioni digitali o cartacee agli ospiti', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 8),
(v_event_id, 'Conferma fiori e decorazioni', 'Ordina composizioni floreali e allestimenti location', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 9),
(v_event_id, 'Ordina torta e dolci personalizzati', 'Definisci design torta "Buona Pensione" e sweet table', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 10),
(v_event_id, 'Scegli outfit e accessori', 'Acquista o seleziona abbigliamento elegante', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 11),
(v_event_id, 'Conferma fotografo / videomaker', 'Brief dettagliato su momenti chiave da immortalare', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 12),
(v_event_id, 'Organizza regalo collettivo', 'Coordina raccolta fondi o acquisto regalo da colleghi', CURRENT_DATE + INTERVAL '30 days', 'Conferme e Fornitori', false, 13);

-- FASE 3: 2 SETTIMANE PRIMA - Rifinitura
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia brief fornitori (orari, scaletta, colori)', 'Condividi timeline e dettagli operativi con tutti i fornitori', CURRENT_DATE + INTERVAL '46 days', 'Rifinitura', false, 14),
(v_event_id, 'Prepara playlist e interventi musicali', 'Seleziona canzoni simboliche e momenti musicali speciali', CURRENT_DATE + INTERVAL '46 days', 'Rifinitura', false, 15),
(v_event_id, 'Raccogli foto e video ricordi da proiettare', 'Organizza slideshow carriera e momenti salienti', CURRENT_DATE + INTERVAL '46 days', 'Rifinitura', false, 16),
(v_event_id, 'Stampa menù, segnaposti, cartellonistica', 'Prepara welcome board, tableau, menù, segnaposti', CURRENT_DATE + INTERVAL '46 days', 'Rifinitura', false, 17),
(v_event_id, 'Controlla acconti e saldi', 'Verifica acconti versati e pianifica saldi finali', CURRENT_DATE + INTERVAL '46 days', 'Rifinitura', false, 18);

-- FASE 4: 1 SETTIMANA PRIMA - Coordinamento Finale
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Ultimo check con location e catering', 'Sopralluogo finale e conferma dettagli operativi', CURRENT_DATE + INTERVAL '53 days', 'Coordinamento Finale', false, 19),
(v_event_id, 'Organizza trasporto materiali e fornitori', 'Pianifica logistica trasporti decorazioni e attrezzature', CURRENT_DATE + INTERVAL '53 days', 'Coordinamento Finale', false, 20),
(v_event_id, 'Stampa checklist evento', 'Prepara checklist finale per il giorno della festa', CURRENT_DATE + INTERVAL '53 days', 'Coordinamento Finale', false, 21),
(v_event_id, 'Prepara regali e bomboniere', 'Organizza gift box e pensierini per ospiti', CURRENT_DATE + INTERVAL '53 days', 'Coordinamento Finale', false, 22);

-- FASE 5: GIORNO DELL'EVENTO 🎉
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Allestimento e preparazione', 'Setup completo location e area cerimonia', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 23),
(v_event_id, 'Shooting e accoglienza ospiti', 'Servizio fotografico e benvenuto agli invitati', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 24),
(v_event_id, 'Brindisi e discorso', 'Momento formale di ringraziamento e brindisi', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 25),
(v_event_id, 'Cena o buffet', 'Servizio ristorazione principale', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 26),
(v_event_id, 'Proiezione ricordi e momenti simbolici', 'Slideshow carriera e consegna omaggi', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 27),
(v_event_id, 'Taglio torta e musica', 'Taglio torta celebrativa e intrattenimento musicale', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 28),
(v_event_id, 'Ringraziamenti finali', 'Saluti e ringraziamenti a ospiti e fornitori', CURRENT_DATE + INTERVAL '60 days', 'Giorno dell''Evento', false, 29);

-- FASE 6: DOPO L'EVENTO - Chiusura e Ricordi
INSERT INTO timeline_items (event_id, title, description, due_date, category, completed, display_order)
VALUES
(v_event_id, 'Invia ringraziamenti a colleghi e fornitori', 'Thank you message a tutti i partecipanti e fornitori', CURRENT_DATE + INTERVAL '67 days', 'Chiusura e Ricordi', false, 30),
(v_event_id, 'Raccogli foto e video', 'Scarica tutte le foto da fotografo e ospiti', CURRENT_DATE + INTERVAL '67 days', 'Chiusura e Ricordi', false, 31),
(v_event_id, 'Completa pagamenti', 'Versa tutti i saldi finali ai fornitori', CURRENT_DATE + INTERVAL '67 days', 'Chiusura e Ricordi', false, 32),
(v_event_id, 'Aggiorna bilancio finale', 'Chiudi consuntivo spese nell''app', CURRENT_DATE + INTERVAL '67 days', 'Chiusura e Ricordi', false, 33),
(v_event_id, 'Crea album digitale o video ricordo', 'Monta album fotografico o video emozionale della festa', CURRENT_DATE + INTERVAL '67 days', 'Chiusura e Ricordi', false, 34);

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
WHERE e.event_type = 'retirement'
GROUP BY e.id, e.name, e.event_type;
