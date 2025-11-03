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

-- Catering / Ristorazione
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Pranzo/cena/apericena/buffet' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Menù personalizzato' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Sweet table / dessert corner' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Torta di compleanno' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Bevande e cocktail' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Servizio catering/locale interno' FROM categories c WHERE c.name = 'Catering / Ristorazione' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Inviti e Grafica
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Inviti cartacei/digitali' FROM categories c WHERE c.name = 'Inviti e Grafica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Tema grafico' FROM categories c WHERE c.name = 'Inviti e Grafica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Coordinato grafico' FROM categories c WHERE c.name = 'Inviti e Grafica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Biglietti di ringraziamento' FROM categories c WHERE c.name = 'Inviti e Grafica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'QR code foto/video' FROM categories c WHERE c.name = 'Inviti e Grafica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Foto e Video
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Fotografo/videomaker' FROM categories c WHERE c.name = 'Foto e Video' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Shooting compleanno' FROM categories c WHERE c.name = 'Foto e Video' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Reel/video social' FROM categories c WHERE c.name = 'Foto e Video' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Polaroid corner' FROM categories c WHERE c.name = 'Foto e Video' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Album digitale/fisico' FROM categories c WHERE c.name = 'Foto e Video' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Musica e Intrattenimento
INSERT INTO subcategories (category_id, name) SELECT c.id, 'DJ/band live' FROM categories c WHERE c.name = 'Musica e Intrattenimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Playlist personalizzata' FROM categories c WHERE c.name = 'Musica e Intrattenimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Giochi/animazione' FROM categories c WHERE c.name = 'Musica e Intrattenimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Spettacoli' FROM categories c WHERE c.name = 'Musica e Intrattenimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Presentatore/brindisi/sorprese' FROM categories c WHERE c.name = 'Musica e Intrattenimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Abbigliamento e Beauty
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Outfit festeggiato/a' FROM categories c WHERE c.name = 'Abbigliamento e Beauty' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Trucco e parrucco' FROM categories c WHERE c.name = 'Abbigliamento e Beauty' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Accessori e styling' FROM categories c WHERE c.name = 'Abbigliamento e Beauty' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Shooting pre-evento' FROM categories c WHERE c.name = 'Abbigliamento e Beauty' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Regali e Ringraziamenti
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Lista regali/raccolta digitale' FROM categories c WHERE c.name = 'Regali e Ringraziamenti' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Tavolo regali/angolo dedicato' FROM categories c WHERE c.name = 'Regali e Ringraziamenti' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Bomboniere/gift bag' FROM categories c WHERE c.name = 'Regali e Ringraziamenti' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Biglietti di ringraziamento' FROM categories c WHERE c.name = 'Regali e Ringraziamenti' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Intrattenimento Extra
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Angolo giochi/area relax' FROM categories c WHERE c.name = 'Intrattenimento Extra' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Proiezione video ricordo' FROM categories c WHERE c.name = 'Intrattenimento Extra' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Animazione bambini' FROM categories c WHERE c.name = 'Intrattenimento Extra' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Spettacolo finale' FROM categories c WHERE c.name = 'Intrattenimento Extra' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Trasporti e Logistica
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Parcheggi ospiti' FROM categories c WHERE c.name = 'Trasporti e Logistica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Navetta' FROM categories c WHERE c.name = 'Trasporti e Logistica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Trasporto decorazioni/fornitori' FROM categories c WHERE c.name = 'Trasporti e Logistica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Pernottamento ospiti' FROM categories c WHERE c.name = 'Trasporti e Logistica' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Gestione Budget
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Budget stimato' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Acconti versati' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Saldi fornitori' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Spese extra' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Totale finale' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Regali ricevuti' FROM categories c WHERE c.name = 'Gestione Budget' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

-- Fine seed
