-- Seed: categories and subcategories for the 5 event types
-- Sort defines the order.

-- Helper: resolve type ids
WITH t AS (
  SELECT
    (SELECT id FROM event_types WHERE slug='battesimo') AS batt,
    (SELECT id FROM event_types WHERE slug='diciottesimo') AS dici,
    (SELECT id FROM event_types WHERE slug='compleanno') AS comp,
    (SELECT id FROM event_types WHERE slug='anniversario') AS anni,
    (SELECT id FROM event_types WHERE slug='pensione') AS pens
)
-- ====== BATTESIMO ======
INSERT INTO categories (type_id,name,sort)
SELECT t.batt,'Cerimonia',1 FROM t
UNION ALL SELECT t.batt,'Ricevimento',2 FROM t
UNION ALL SELECT t.batt,'Bomboniere e Regali',3 FROM t
UNION ALL SELECT t.batt,'Grafica e Inviti',4 FROM t
UNION ALL SELECT t.batt,'Foto e Video',5 FROM t
UNION ALL SELECT t.batt,'Abbigliamento e Beauty',6 FROM t
ON CONFLICT DO NOTHING;

-- Subcategories Battesimo
WITH batt AS (
  SELECT id FROM categories c JOIN event_types et ON c.type_id=et.id WHERE et.slug='battesimo'
)
INSERT INTO subcategories (category_id,name,sort)
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Chiesa o luogo del rito',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Offerta al sacerdote',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Abbigliamento bimbo/a',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Candele/fiocco/copertina',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Libricino cerimonia',5
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Location / Ristorante',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Catering / menù',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Torta battesimale',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Allestimenti tavoli',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Segnaposto e tableau',5 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Animazione bambini',6
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Regali' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Bomboniere principali',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Regali' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Confetti e sacchetti',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Regali' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Tag e bigliettini',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Regali' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Regali padrini/madrine',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Regali' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Gadget invitati',5
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Grafica e Inviti' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Inviti',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Grafica e Inviti' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Biglietti ringraziamento',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Grafica e Inviti' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Cartellonistica/Menu',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Grafica e Inviti' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Guestbook/foto ricordo',4
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Fotografo',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Videomaker',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Photobooth',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Genitori/padrini',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Acconciatura/Make-up',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Abbigliamento e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='battesimo')),'Accessori',3
ON CONFLICT DO NOTHING;

-- ====== DICIOTTESIMO ======
INSERT INTO categories (type_id,name,sort)
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Location e Catering',1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Intrattenimento',2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Outfit e Beauty',3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Inviti e Comunicazione',4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Bomboniere e Gadget',5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='diciottesimo'),'Extra e Organizzazione',6
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id,name,sort)
-- Location e Catering
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Sala/locale',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Catering/buffet',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Open bar',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Torta e dessert',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Decorazioni',5
UNION ALL
-- Intrattenimento
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'DJ/band',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Animazione/MC',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Foto/Video',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Photobooth/social',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Noleggio auto/limousine',5
UNION ALL
-- Outfit e Beauty
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Abito',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Cambio outfit',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Trucco e parrucco',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Accessori',4
UNION ALL
-- Inviti e Comunicazione
SELECT (SELECT id FROM categories WHERE name='Inviti e Comunicazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Inviti',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Comunicazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Tema e grafica',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Comunicazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Hashtag/shooting',3
UNION ALL
-- Bomboniere e Gadget
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Bomboniere',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Gadget personalizzati',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Bomboniere e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Ricordi invitati',3
UNION ALL
-- Extra
SELECT (SELECT id FROM categories WHERE name='Extra e Organizzazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Addobbi floreali',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra e Organizzazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Sicurezza/permessi',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra e Organizzazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Noleggio attrezzature',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Extra e Organizzazione' AND type_id=(SELECT id FROM event_types WHERE slug='diciottesimo')),'Coordinamento',4
ON CONFLICT DO NOTHING;

-- ====== COMPLEANNO ======
INSERT INTO categories (type_id,name,sort)
SELECT (SELECT id FROM event_types WHERE slug='compleanno'),'Location e Catering',1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='compleanno'),'Animazione e Musica',2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='compleanno'),'Inviti e Grafica',3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='compleanno'),'Foto e Video',4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='compleanno'),'Regali e Bomboniere',5
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id,name,sort)
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Sala/casa',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Ristorante/catering',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Torta e dolci',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Bevande',4 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Location e Catering' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Decorazioni',5
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Animazione e Musica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'DJ/band',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Animazione e Musica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Animatori/attività',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Animazione e Musica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Giochi',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Inviti',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Tema/allestimento',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Grafica' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Gadget/segnaposto',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Fotografo',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Videomaker',2
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Bomboniere',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Regali speciali',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='compleanno')),'Ricordi personalizzati',3
ON CONFLICT DO NOTHING;

-- ====== ANNIVERSARIO ======
INSERT INTO categories (type_id,name,sort)
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Cerimonia/Benedizione',1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Ricevimento',2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Foto e Video',3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Regali e Bomboniere',4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Outfit e Beauty',5 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='anniversario'),'Intrattenimento',6
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id,name,sort)
SELECT (SELECT id FROM categories WHERE name='Cerimonia/Benedizione' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Chiesa/rito simbolico',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia/Benedizione' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Offerta/celebrante',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Cerimonia/Benedizione' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Addobbi floreali',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Location/ristorante',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Menù/catering',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Torta',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Ricevimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Mise en place',4
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Fotografo',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Videomaker',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Shooting di coppia',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Bomboniere',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Regali reciproci',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Regali e Bomboniere' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Gadget invitati',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Abito lei/lui',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Parrucchiere/Make-up',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Beauty' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Accessori',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Musica/band',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Animazione',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='anniversario')),'Proiezioni/ricordi',3
ON CONFLICT DO NOTHING;

-- ====== PENSIONE ======
INSERT INTO categories (type_id,name,sort)
SELECT (SELECT id FROM event_types WHERE slug='pensione'),'Festa e Location',1 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='pensione'),'Intrattenimento',2 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='pensione'),'Inviti e Gadget',3 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='pensione'),'Foto e Video',4 UNION ALL
SELECT (SELECT id FROM event_types WHERE slug='pensione'),'Outfit e Accessori',5
ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id,name,sort)
SELECT (SELECT id FROM categories WHERE name='Festa e Location' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Location/ristorante',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Festa e Location' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Buffet/catering',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Festa e Location' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Decorazioni',3 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Festa e Location' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Torta e dolci',4
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'DJ/musica',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Presentatore/speech',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Intrattenimento' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Proiezioni foto ricordo',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Inviti',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Gadget per colleghi/amici',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Inviti e Gadget' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Regalo principale',3
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Fotografo',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Foto e Video' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Video ricordo/slideshow',2
UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Accessori' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Abbigliamento',1 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Accessori' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Parrucchiere/Trucco',2 UNION ALL
SELECT (SELECT id FROM categories WHERE name='Outfit e Accessori' AND type_id=(SELECT id FROM event_types WHERE slug='pensione')),'Accessori',3
ON CONFLICT DO NOTHING;

