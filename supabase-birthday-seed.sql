-- Seed evento Compleanno (birthday)
-- Struttura coerente con altri eventi, stile Natural Chic

-- 1. Crea evento principale
INSERT INTO events (name, event_type, total_budget, icon)
VALUES ('Compleanno', 'birthday', 3000, '🎂');

-- 2. Categorie principali
INSERT INTO categories (event_id, name, icon) SELECT id, 'Location e Allestimento', '🏠' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Catering / Ristorazione', '🍽️' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Inviti e Grafica', '💌' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Foto e Video', '📸' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Musica e Intrattenimento', '🎶' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Abbigliamento e Beauty', '👗' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Regali e Ringraziamenti', '🎁' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Intrattenimento Extra', '🧸' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Trasporti e Logistica', '🚗' FROM events WHERE event_type = 'birthday';
INSERT INTO categories (event_id, name, icon) SELECT id, 'Gestione Budget', '💶' FROM events WHERE event_type = 'birthday';

-- 3. Sottocategorie (esempi, da estendere)
-- Location e Allestimento
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Scelta location' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Affitto sala/spazio esterno' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Allestimento tavoli e mise en place' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Decorazioni a tema' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Balloon wall / backdrop' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Fiori e centrotavola' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Luci decorative e candele' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');
INSERT INTO subcategories (category_id, name) SELECT c.id, 'Photobooth / cornice selfie' FROM categories c WHERE c.name = 'Location e Allestimento' AND c.event_id = (SELECT id FROM events WHERE event_type = 'birthday');

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
