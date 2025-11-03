-- =====================================================
-- BIRTHDAY EVENT SEED
-- =====================================================
-- Seed completo per evento Compleanno con categorie,
-- sottocategorie in stile Natural Chic / La Trama.
-- Evento versatile adattabile a tutte le età (1-80+ anni).
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_cat_id UUID;
BEGIN

-- =====================================================
-- 1. CREAZIONE EVENTO COMPLEANNO
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
  'Compleanno',
  'birthday',
  CURRENT_DATE + INTERVAL '60 days',
  'Da definire',
  3000.00,
  'Compleanno adattabile a ogni età - Dal primo anno ai milestone speciali',
  '#FFA07A,#F0E68C,#98D8C8'
)
RETURNING id INTO v_event_id;

RAISE NOTICE 'Created Birthday event with ID: %', v_event_id;

-- =====================================================
-- 2. CATEGORIA: LOCATION E ALLESTIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Location e Allestimento', 1, '🏠')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Scelta location', 0.00, 1, 'Casa, ristorante, terrazza, villa o parco'),
(v_cat_id, 'Affitto sala/spazio esterno', 500.00, 2, 'Costo location se non casa privata'),
(v_cat_id, 'Allestimento tavoli e mise en place', 200.00, 3, 'Tovaglie, centrotavola, stoviglie coordinate'),
(v_cat_id, 'Decorazioni a tema', 300.00, 4, 'Colori, età, stile personalizzato'),
(v_cat_id, 'Balloon wall / backdrop', 150.00, 5, 'Parete palloncini o fondale fotografico'),
(v_cat_id, 'Fiori e centrotavola', 200.00, 6, 'Composizioni naturali coordinate'),
(v_cat_id, 'Luci decorative e candele', 100.00, 7, 'Illuminazione scenografica'),
(v_cat_id, 'Photobooth / cornice selfie', 150.00, 8, 'Angolo foto con props');


-- =====================================================
-- 3. CATEGORIA: CATERING / RISTORAZIONE
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Catering / Ristorazione', 2, '🍽️')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Pranzo/cena/apericena/buffet', 800.00, 1, 'Servizio ristorazione principale'),
(v_cat_id, 'Menù personalizzato', 150.00, 2, 'Adattamento menu per bambini/adulti/allergie'),
(v_cat_id, 'Sweet table / dessert corner', 250.00, 3, 'Angolo dolci e dessert'),
(v_cat_id, 'Torta di compleanno', 150.00, 4, 'Torta personalizzata'),
(v_cat_id, 'Bevande e cocktail', 200.00, 5, 'Open bar, cocktail signature'),
(v_cat_id, 'Servizio catering/locale interno', 300.00, 6, 'Costo servizio o camerieri');

-- =====================================================
-- 4. CATEGORIA: INVITI E GRAFICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Inviti e Grafica', 3, '💌')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Inviti cartacei/digitali', 100.00, 1, 'Inviti stampati o via WhatsApp/email'),
(v_cat_id, 'Tema grafico', 80.00, 2, 'Progettazione palette colori e font'),
(v_cat_id, 'Coordinato grafico', 120.00, 3, 'Segnaposti, menù, cartellonistica'),
(v_cat_id, 'Biglietti di ringraziamento', 50.00, 4, 'Thank you cards post-evento'),
(v_cat_id, 'QR code foto/video', 30.00, 5, 'Raccolta condivisa foto ospiti');

-- =====================================================
-- 5. CATEGORIA: FOTO E VIDEO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Foto e Video', 4, '📸')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Fotografo/videomaker', 500.00, 1, 'Servizio professionale foto+video'),
(v_cat_id, 'Shooting compleanno', 200.00, 2, 'Servizio fotografico durante festa'),
(v_cat_id, 'Reel/video social', 150.00, 3, 'Mini video per Instagram/TikTok'),
(v_cat_id, 'Polaroid corner', 100.00, 4, 'Angolo polaroid per ospiti'),
(v_cat_id, 'Album digitale/fisico', 120.00, 5, 'Album ricordi stampato o digitale');

-- =====================================================
-- 6. CATEGORIA: MUSICA E INTRATTENIMENTO
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Musica e Intrattenimento', 5, '🎶')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'DJ/band live', 600.00, 1, 'Musica dal vivo o DJ professionista'),
(v_cat_id, 'Playlist personalizzata', 0.00, 2, 'Spotify/Apple Music curata'),
(v_cat_id, 'Giochi/animazione', 250.00, 3, 'Animatore per bambini o giochi adulti'),
(v_cat_id, 'Spettacoli', 300.00, 4, 'Magia, karaoke, performance'),
(v_cat_id, 'Presentatore/brindisi/sorprese', 100.00, 5, 'Amico/a presentatore momenti chiave');

-- =====================================================
-- 7. CATEGORIA: ABBIGLIAMENTO E BEAUTY
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Abbigliamento e Beauty', 6, '👗')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Outfit festeggiato/a', 200.00, 1, 'Abito o completo elegante'),
(v_cat_id, 'Trucco e parrucco', 80.00, 2, 'Make-up e hairstyle professionale'),
(v_cat_id, 'Accessori e styling', 100.00, 3, 'Gioielli, scarpe, accessori'),
(v_cat_id, 'Shooting pre-evento', 150.00, 4, 'Servizio fotografico prima della festa');

-- =====================================================
-- 8. CATEGORIA: REGALI E RINGRAZIAMENTI
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Lista regali/raccolta digitale', 0.00, 1, 'Wishlist online o raccolta fondi'),
(v_cat_id, 'Tavolo regali/angolo dedicato', 50.00, 2, 'Allestimento area regali'),
(v_cat_id, 'Bomboniere/gift bag', 200.00, 3, 'Regalini per ospiti'),
(v_cat_id, 'Biglietti di ringraziamento', 50.00, 4, 'Thank you notes post-evento');

-- =====================================================
-- 9. CATEGORIA: INTRATTENIMENTO EXTRA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Intrattenimento Extra', 8, '🧸')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Angolo giochi/area relax', 150.00, 1, 'Spazio dedicato bambini o lounge adulti'),
(v_cat_id, 'Proiezione video ricordo', 100.00, 2, 'Slideshow foto anni passati'),
(v_cat_id, 'Animazione bambini', 250.00, 3, 'Intrattenimento dedicato se festa mista'),
(v_cat_id, 'Spettacolo finale', 300.00, 4, 'Fuochi freddi, lanterne, video emozionale');

-- =====================================================
-- 10. CATEGORIA: TRASPORTI E LOGISTICA
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Parcheggi ospiti', 50.00, 1, 'Parcheggio riservato o valet'),
(v_cat_id, 'Navetta', 150.00, 2, 'Servizio navetta se location lontana'),
(v_cat_id, 'Trasporto decorazioni/fornitori', 100.00, 3, 'Noleggio furgone o corriere'),
(v_cat_id, 'Pernottamento ospiti', 200.00, 4, 'Hotel/B&B per ospiti fuori città');

-- =====================================================
-- 11. CATEGORIA: GESTIONE BUDGET
-- =====================================================
INSERT INTO categories (event_id, name, display_order, icon)
VALUES (v_event_id, 'Gestione Budget', 10, '💶')
RETURNING id INTO v_cat_id;

INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
(v_cat_id, 'Budget stimato', 0.00, 1, 'Pianificazione budget totale'),
(v_cat_id, 'Acconti versati', 0.00, 2, 'Tracking acconti fornitori'),
(v_cat_id, 'Saldi fornitori', 0.00, 3, 'Pagamenti finali'),
(v_cat_id, 'Spese extra', 0.00, 4, 'Costi imprevisti'),
(v_cat_id, 'Totale finale', 0.00, 5, 'Somma spese effettive'),
(v_cat_id, 'Regali ricevuti', 0.00, 6, 'Controvalore regali ospiti');

END $$;

-- Fine seed completo Compleanno
