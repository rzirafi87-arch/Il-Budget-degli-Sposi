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

-- =====================================================
-- 2. CATEGORIA: CONCEPT E LOCATION
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Concept e Location', 1, '🏛️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Definizione tema', 0.00, 1, 'Elegante, naturale, retrò, vintage, moderno, Golden Party'),
(v_cat_id, 'Scelta location', 0.00, 2, 'Villa, ristorante, terrazza, giardino, sala privata'),
(v_cat_id, 'Affitto sala/spazio esterno', 800.00, 3, 'Costo location se non casa privata'),
(v_cat_id, 'Allestimento tavoli e mise en place', 350.00, 4, 'Tovaglie, centrotavola, stoviglie coordinate'),
(v_cat_id, 'Decorazioni floreali e naturali', 400.00, 5, 'Fiori, composizioni naturali, dettagli oro/sabbia'),
(v_cat_id, 'Luci calde, lanterne, candele', 200.00, 6, 'Illuminazione scenografica, lanterne, candele'),
(v_cat_id, 'Balloon oro/neutri', 150.00, 7, 'Palloncini oro, avorio, salvia, neutri'),
(v_cat_id, 'Photobooth/backdrop personalizzato', 200.00, 8, 'Angolo foto "50 & Fabulous", "Cinquant’anni di te"');

-- =====================================================
-- 3. CATEGORIA: CATERING / RISTORAZIONE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering / Ristorazione', 2, '🍽️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Cena servita/buffet elegante', 1200.00, 1, 'Servizio ristorazione principale'),
(v_cat_id, 'Sweet table / dessert corner', 350.00, 2, 'Angolo dolci e dessert raffinati'),
(v_cat_id, 'Torta personalizzata "50 anni"', 250.00, 3, 'Torta decorata a tema'),
(v_cat_id, 'Bevande e vini selezionati', 400.00, 4, 'Vini, cocktail, open bar'),
(v_cat_id, 'Brindisi apertura/finale', 100.00, 5, 'Spumante, champagne, brindisi dedicati'),
(v_cat_id, 'Servizio catering/ristorante', 350.00, 6, 'Costo servizio o camerieri');

-- =====================================================
-- 4. CATEGORIA: INVITI E GRAFICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Inviti e Grafica', 3, '💌')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Inviti cartacei/digitali', 120.00, 1, 'Tema oro, sabbia, avorio, elegante'),
(v_cat_id, 'Coordinato grafico', 150.00, 2, 'Menu, segnaposti, cartellonistica'),
(v_cat_id, 'Tableau/disposizione tavoli', 80.00, 3, 'Organizzazione tavoli e ospiti'),
(v_cat_id, 'QR code foto/video', 40.00, 4, 'Raccolta foto/video ospiti'),
(v_cat_id, 'Biglietti di ringraziamento', 60.00, 5, 'Thank you cards post-evento');

-- =====================================================
-- 5. CATEGORIA: FOTO E VIDEO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto e Video', 4, '📸')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo/videomaker', 700.00, 1, 'Servizio professionale foto+video'),
(v_cat_id, 'Shooting pre-festa/durante cena', 250.00, 2, 'Servizio fotografico dedicato'),
(v_cat_id, 'Reel/mini video ricordo', 180.00, 3, 'Video per social e ricordi'),
(v_cat_id, 'Polaroid corner', 120.00, 4, 'Angolo polaroid per ospiti'),
(v_cat_id, 'Album digitale post-evento', 150.00, 5, 'Album ricordi digitale o stampato');

-- =====================================================
-- 6. CATEGORIA: MUSICA E INTRATTENIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Musica e Intrattenimento', 5, '🎶')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'DJ/band dal vivo', 800.00, 1, 'Musica lounge, dance, revival'),
(v_cat_id, 'Presentatore/amico momenti speciali', 150.00, 2, 'Gestione momenti chiave'),
(v_cat_id, 'Giochi/sorprese invitati', 200.00, 3, 'Animazione, giochi, sorprese'),
(v_cat_id, 'Proiezione video "50 anni di ricordi"', 120.00, 4, 'Slideshow, video emozionale');

-- =====================================================
-- 7. CATEGORIA: ABBIGLIAMENTO E BEAUTY
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Abbigliamento e Beauty', 6, '👔')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit festeggiato/a', 250.00, 1, 'Abito elegante ma sobrio'),
(v_cat_id, 'Trucco e parrucco', 100.00, 2, 'Make-up e hairstyle per shooting'),
(v_cat_id, 'Accessori coordinati', 120.00, 3, 'Oro, nero, bianco, salvia'),
(v_cat_id, 'Cambio abito per party', 150.00, 4, 'Secondo outfit per la festa');

-- =====================================================
-- 8. CATEGORIA: REGALI E RINGRAZIAMENTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Tavolo regali/angolo dediche', 60.00, 1, 'Area dedicata regali e dediche'),
(v_cat_id, 'Lista regali/donazioni simboliche', 0.00, 2, 'Wishlist o raccolta fondi'),
(v_cat_id, 'Bomboniere/gift box personalizzate', 220.00, 3, 'Regalini per ospiti'),
(v_cat_id, 'Biglietti di ringraziamento/dediche', 60.00, 4, 'Thank you notes o dediche scritte');

-- =====================================================
-- 9. CATEGORIA: INTRATTENIMENTO EXTRA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Intrattenimento Extra', 8, '🎭')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Angolo foto accessori vintage/eleganti', 180.00, 1, 'Accessori per foto a tema'),
(v_cat_id, 'Proiezione foto/video vita festeggiato', 120.00, 2, 'Slideshow, video ricordo'),
(v_cat_id, 'Spettacolo musicale/comico/sorpresa', 350.00, 3, 'Performance amici, musica, comicità'),
(v_cat_id, 'Fuochi freddi/taglio torta con musica', 200.00, 4, 'Effetti speciali per il party');

-- =====================================================
-- 10. CATEGORIA: TRASPORTI E LOGISTICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
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
