-- =====================================================
-- 50° COMPLEANNO EVENT SEED
-- =====================================================
-- Seed completo per evento 50 anni con categorie e sottocategorie
-- in stile elegante, maturo, dettagli oro/sabbia/salvia/avorio.
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO 50° COMPLEANNO
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
  '50° Compleanno',
  'birthday-50',
  CURRENT_DATE + INTERVAL '90 days',
  'Da definire',
  5000.00,
  'Celebrazione elegante e conviviale per i 50 anni, tra festa e solennità',
  '#D4AF37,#E7D8C9,#A3B59D,#F8F6F0,#FFD700'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created 50th Birthday event with ID: %', v_event_id;
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Inviti e Grafica', 3, '💌');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Inviti cartacei/digitali', 120.00, 1, 'Tema oro, sabbia, avorio, elegante' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Inviti e Grafica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Coordinato grafico', 150.00, 2, 'Menu, segnaposti, cartellonistica' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Inviti e Grafica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Tableau/disposizione tavoli', 80.00, 3, 'Organizzazione tavoli e ospiti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Inviti e Grafica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'QR code foto/video', 40.00, 4, 'Raccolta foto/video ospiti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Inviti e Grafica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Biglietti di ringraziamento', 60.00, 5, 'Thank you cards post-evento' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Inviti e Grafica';
(v_cat_id, 'Luci calde, lanterne, candele', 200.00, 6, 'Illuminazione scenografica, lanterne, candele'),
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Foto e Video', 4, '📸');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Fotografo/videomaker', 700.00, 1, 'Servizio professionale foto+video' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Foto e Video';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Shooting pre-festa/durante cena', 250.00, 2, 'Servizio fotografico dedicato' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Foto e Video';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Reel/mini video ricordo', 180.00, 3, 'Video per social e ricordi' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Foto e Video';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Polaroid corner', 120.00, 4, 'Angolo polaroid per ospiti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Foto e Video';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Album digitale post-evento', 150.00, 5, 'Album ricordi digitale o stampato' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Foto e Video';
(v_cat_id, 'Torta personalizzata "50 anni"', 250.00, 3, 'Torta decorata a tema'),
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Musica e Intrattenimento', 5, '🎶');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'DJ/band dal vivo', 800.00, 1, 'Musica lounge, dance, revival' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Musica e Intrattenimento';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Presentatore/amico momenti speciali', 150.00, 2, 'Gestione momenti chiave' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Musica e Intrattenimento';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Giochi/sorprese invitati', 200.00, 3, 'Animazione, giochi, sorprese' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Musica e Intrattenimento';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Proiezione video "50 anni di ricordi"', 120.00, 4, 'Slideshow, video emozionale' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Musica e Intrattenimento';
(v_cat_id, 'Inviti cartacei/digitali', 120.00, 1, 'Tema oro, sabbia, avorio, elegante'),
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Abbigliamento e Beauty', 6, '👔');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Outfit festeggiato/a', 250.00, 1, 'Abito elegante ma sobrio' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Abbigliamento e Beauty';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Trucco e parrucco', 100.00, 2, 'Make-up e hairstyle per shooting' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Abbigliamento e Beauty';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Accessori coordinati', 120.00, 3, 'Oro, nero, bianco, salvia' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Abbigliamento e Beauty';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Cambio abito per party', 150.00, 4, 'Secondo outfit per la festa' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Abbigliamento e Beauty';
  event_location,
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Regali e Ringraziamenti', 7, '🎁');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Tavolo regali/angolo dediche', 60.00, 1, 'Area dedicata regali e dediche' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Regali e Ringraziamenti';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Lista regali/donazioni simboliche', 0.00, 2, 'Wishlist o raccolta fondi' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Regali e Ringraziamenti';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Bomboniere/gift box personalizzate', 220.00, 3, 'Regalini per ospiti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Regali e Ringraziamenti';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Biglietti di ringraziamento/dediche', 60.00, 4, 'Thank you notes o dediche scritte' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Regali e Ringraziamenti';
);
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Intrattenimento Extra', 8, '🎭');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Angolo foto accessori vintage/eleganti', 180.00, 1, 'Accessori per foto a tema' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Intrattenimento Extra';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Proiezione foto/video vita festeggiato', 120.00, 2, 'Slideshow, video ricordo' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Intrattenimento Extra';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Spettacolo musicale/comico/sorpresa', 350.00, 3, 'Performance amici, musica, comicità' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Intrattenimento Extra';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Fuochi freddi/taglio torta con musica', 200.00, 4, 'Effetti speciali per il party' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Intrattenimento Extra';
INSERT INTO categories (event_id, name, display_order, icon)
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Trasporti e Logistica', 9, '🚗');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Parcheggi ospiti', 60.00, 1, 'Parcheggio riservato o valet' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Trasporti e Logistica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Navetta', 180.00, 2, 'Servizio navetta se location fuori città' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Trasporti e Logistica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Trasporto materiali/allestimenti', 120.00, 3, 'Noleggio furgone o corriere' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Trasporti e Logistica';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Pernottamento ospiti', 250.00, 4, 'Hotel/B&B per ospiti fuori città' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Trasporti e Logistica';
SELECT id, 'Luci calde, lanterne, candele', 200.00, 6, 'Illuminazione scenografica, lanterne, candele' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Concept e Location';
INSERT INTO categories (event_id, name, display_order, icon)
VALUES ('UUID_50TH_EVENT', 'Gestione Budget', 10, '💶');
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Budget stimato', 0.00, 1, 'Pianificazione budget totale' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Acconti fornitori', 0.00, 2, 'Tracking acconti fornitori' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Saldi', 0.00, 3, 'Pagamenti finali' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Spese extra', 0.00, 4, 'Costi imprevisti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Regali ricevuti', 0.00, 5, 'Controvalore regali ospiti' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Totale finale', 0.00, 6, 'Somma spese effettive' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Gestione Budget';
SELECT id, 'Bevande e vini selezionati', 400.00, 4, 'Vini, cocktail, open bar' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Catering / Ristorazione';
SELECT id, 'Brindisi apertura/finale', 100.00, 5, 'Spumante, champagne, brindisi dedicati' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Catering / Ristorazione';
INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description)
SELECT id, 'Servizio catering/ristorante', 350.00, 6, 'Costo servizio o camerieri' FROM categories WHERE event_id = 'UUID_50TH_EVENT' AND name = 'Catering / Ristorazione';
INSERT INTO categories (event_id, name, display_order, icon)
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Parcheggi ospiti', 60.00, 1, 'Parcheggio riservato o valet'),
(v_cat_id, 'Navetta', 180.00, 2, 'Servizio navetta se location fuori città'),
(v_cat_id, 'Trasporto materiali/allestimenti', 120.00, 3, 'Noleggio furgone o corriere'),
(v_cat_id, 'Pernottamento ospiti', 250.00, 4, 'Hotel/B&B per ospiti fuori città');

-- =====================================================
-- 11. CATEGORIA: GESTIONE BUDGET
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Gestione Budget', 10, '💶')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Budget stimato', 0.00, 1, 'Pianificazione budget totale'),
(v_cat_id, 'Acconti fornitori', 0.00, 2, 'Tracking acconti fornitori'),
(v_cat_id, 'Saldi', 0.00, 3, 'Pagamenti finali'),
(v_cat_id, 'Spese extra', 0.00, 4, 'Costi imprevisti'),
(v_cat_id, 'Regali ricevuti', 0.00, 5, 'Controvalore regali ospiti'),
(v_cat_id, 'Totale finale', 0.00, 6, 'Somma spese effettive');

END $$;

-- Fine seed completo 50° Compleanno
