-- Seed tradizioni e categorie matrimonio Francia

-- Tradizioni Francia
INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('Francia', 'FR',
 'Cerimonia civile e religiosa, corteo, lancio del riso, taglio della croquembouche.',
 'Eleganza classica, bianco, blu, oro. Decorazioni floreali, castello o villa.',
 'Bianco, blu, oro.',
 'Regali, denaro, oggetti simbolici.',
 '1 giorno, festa serale.',
 'Banchetto, balli, giochi, taglio della croquembouche.',
 'Corteo, discorsi, giochi, “vin d’honneur”.');

-- Evento Francia
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'fr2025-001-002-003-004-005',
  'Matrimonio Francia',
  'Francia',
  95000,
  47500,
  47500
);

-- Categorie Francia
INSERT INTO categories (event_id, name) VALUES
('fr2025-001-002-003-004-005', 'Sposa'),
('fr2025-001-002-003-004-005', 'Sposo'),
('fr2025-001-002-003-004-005', 'Location & Catering'),
('fr2025-001-002-003-004-005', 'Decorazioni'),
('fr2025-001-002-003-004-005', 'Musica & Animazione'),
('fr2025-001-002-003-004-005', 'Tradizioni'),
('fr2025-001-002-003-004-005', 'Foto & Video'),
('fr2025-001-002-003-004-005', 'Trasporti'),
('fr2025-001-002-003-004-005', 'Regali'),
('fr2025-001-002-003-004-005', 'Documenti'),
('fr2025-001-002-003-004-005', 'Croquembouche'),
('fr2025-001-002-003-004-005', 'Banchetto'),
('fr2025-001-002-003-004-005', 'Giochi tradizionali');

-- Sottocategorie Francia
WITH catfr AS (
  SELECT id, name FROM categories WHERE event_id = 'fr2025-001-002-003-004-005'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM catfr WHERE name = 'Sposa'), 'Abito da sposa'),
((SELECT id FROM catfr WHERE name = 'Sposa'), 'Velo'),
((SELECT id FROM catfr WHERE name = 'Sposo'), 'Abito da sposo'),
((SELECT id FROM catfr WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM catfr WHERE name = 'Location & Catering'), 'Castello'),
((SELECT id FROM catfr WHERE name = 'Location & Catering'), 'Villa'),
((SELECT id FROM catfr WHERE name = 'Decorazioni'), 'Fiori'),
((SELECT id FROM catfr WHERE name = 'Decorazioni'), 'Illuminazione'),
((SELECT id FROM catfr WHERE name = 'Musica & Animazione'), 'Orchestra'),
((SELECT id FROM catfr WHERE name = 'Musica & Animazione'), 'DJ'),
((SELECT id FROM catfr WHERE name = 'Tradizioni'), 'Corteo'),
((SELECT id FROM catfr WHERE name = 'Tradizioni'), 'Vin d’honneur'),
((SELECT id FROM catfr WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM catfr WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM catfr WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM catfr WHERE name = 'Regali'), 'Regali agli ospiti'),
((SELECT id FROM catfr WHERE name = 'Regali'), 'Bomboniere'),
((SELECT id FROM catfr WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM catfr WHERE name = 'Croquembouche'), 'Torta croquembouche'),
((SELECT id FROM catfr WHERE name = 'Banchetto'), 'Sala banchetti'),
((SELECT id FROM catfr WHERE name = 'Giochi tradizionali'), 'Giochi e quiz');

-- Fornitori Francia
INSERT INTO suppliers (name, country, notes) VALUES
('Paris Wedding Agency', 'Francia', 'Esperti in matrimoni francesi'),
('French Couture', 'Francia', 'Abiti da sposa e sposo'),
('Chateau Florist', 'Francia', 'Fiori e decorazioni'),
('French Banquet', 'Francia', 'Catering francese'),
('DJ Paris', 'Francia', 'Animazione musicale');

-- Location Francia
INSERT INTO locations (name, country, city, type, notes) VALUES
('Chateau de Versailles', 'Francia', 'Versailles', 'Castello', 'Cerimonie regali'),
('Villa Ephrussi', 'Francia', 'Saint-Jean-Cap-Ferrat', 'Villa', 'Ricevimenti eleganti'),
('Banquet Hall Paris', 'Francia', 'Parigi', 'Sala banchetti', 'Banchetti tradizionali');

-- Chiese Francia
INSERT INTO churches (name, country, city, type, notes) VALUES
('Notre-Dame', 'Francia', 'Parigi', 'Cattedrale', 'Cerimonie religiose'),
('Sacre-Coeur', 'Francia', 'Parigi', 'Basilica', 'Matrimoni religiosi');

-- Incomes Francia
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('fr2025-001-002-003-004-005', 'Famiglia sposa', 35000, 'Regalo tradizionale'),
('fr2025-001-002-003-004-005', 'Famiglia sposo', 30000, 'Regalo nozze'),
('fr2025-001-002-003-004-005', 'Risparmi personali', 20000, 'Risparmi degli sposi'),
('fr2025-001-002-003-004-005', 'Regali amici', 10000, 'Regali in denaro');

-- Expenses Francia
WITH catfr AS (SELECT id, name FROM categories WHERE event_id = 'fr2025-001-002-003-004-005'),
     subfr AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('fr2025-001-002-003-004-005', (SELECT id FROM catfr WHERE name = 'Sposa'), (SELECT id FROM subfr WHERE name = 'Abito da sposa' AND category_id = (SELECT id FROM catfr WHERE name = 'Sposa')), 13000, 'bride', 'Abito tradizionale'),
('fr2025-001-002-003-004-005', (SELECT id FROM catfr WHERE name = 'Sposo'), (SELECT id FROM subfr WHERE name = 'Abito da sposo' AND category_id = (SELECT id FROM catfr WHERE name = 'Sposo')), 9000, 'groom', 'Abito sposo'),
('fr2025-001-002-003-004-005', (SELECT id FROM catfr WHERE name = 'Location & Catering'), (SELECT id FROM subfr WHERE name = 'Castello' AND category_id = (SELECT id FROM catfr WHERE name = 'Location & Catering')), 30000, 'common', 'Location castello'),
('fr2025-001-002-003-004-005', (SELECT id FROM catfr WHERE name = 'Decorazioni'), (SELECT id FROM subfr WHERE name = 'Fiori' AND category_id = (SELECT id FROM catfr WHERE name = 'Decorazioni')), 8000, 'common', 'Decorazione floreale'),
('fr2025-001-002-003-004-005', (SELECT id FROM catfr WHERE name = 'Musica & Animazione'), (SELECT id FROM subfr WHERE name = 'Orchestra' AND category_id = (SELECT id FROM catfr WHERE name = 'Musica & Animazione')), 5000, 'common', 'Orchestra tradizionale');

-- Wedding cards Francia
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('fr2025-001-002-003-004-005', 'Marie Dubois', 'marie.dubois@email.fr', 'Parigi, Francia', 'Invitata famiglia sposa'),
('fr2025-001-002-003-004-005', 'Jean Martin', 'jean.martin@email.fr', 'Versailles, Francia', 'Invitato famiglia sposo'),
('fr2025-001-002-003-004-005', 'Sophie Laurent', 'sophie.laurent@email.fr', 'Nizza, Francia', 'Amica degli sposi'),
('fr2025-001-002-003-004-005', 'Pierre Lefevre', 'pierre.lefevre@email.fr', 'Lione, Francia', 'Collega sposo');

-- Seed tradizioni e categorie matrimonio Arabia

-- Tradizioni Arabia
INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('Arabia', 'AR',
 'Cerimonia religiosa, danze tradizionali, henné, banchetto ricco, separazione uomini/donne.',
 'Abiti tradizionali, oro, bianco, verde. Decorazioni sontuose.',
 'Oro, bianco, verde.',
 'Oro, denaro, regali simbolici.',
 '2–3 giorni di celebrazioni.',
 'Festa con danze, musica araba, banchetto.',
 'Cerimonia henné, danze Dabke, regali agli ospiti.');

-- Evento Arabia
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'ar2025-001-002-003-004-005',
  'Matrimonio Arabia',
  'Arabia',
  85000,
  42500,
  42500
);

-- Categorie Arabia
INSERT INTO categories (event_id, name) VALUES
('ar2025-001-002-003-004-005', 'Sposa'),
('ar2025-001-002-003-004-005', 'Sposo'),
('ar2025-001-002-003-004-005', 'Location & Catering'),
('ar2025-001-002-003-004-005', 'Decorazioni'),
('ar2025-001-002-003-004-005', 'Musica & Animazione'),
('ar2025-001-002-003-004-005', 'Tradizioni'),
('ar2025-001-002-003-004-005', 'Foto & Video'),
('ar2025-001-002-003-004-005', 'Trasporti'),
('ar2025-001-002-003-004-005', 'Regali'),
('ar2025-001-002-003-004-005', 'Documenti'),
('ar2025-001-002-003-004-005', 'Cerimonia henné'),
('ar2025-001-002-003-004-005', 'Banchetto'),
('ar2025-001-002-003-004-005', 'Danze Dabke');

-- Sottocategorie Arabia
WITH catar AS (
  SELECT id, name FROM categories WHERE event_id = 'ar2025-001-002-003-004-005'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM catar WHERE name = 'Sposa'), 'Abito da sposa'),
((SELECT id FROM catar WHERE name = 'Sposa'), 'Gioielli'),
((SELECT id FROM catar WHERE name = 'Sposo'), 'Abito da sposo'),
((SELECT id FROM catar WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM catar WHERE name = 'Location & Catering'), 'Palazzo'),
((SELECT id FROM catar WHERE name = 'Location & Catering'), 'Sala ricevimenti'),
((SELECT id FROM catar WHERE name = 'Decorazioni'), 'Fiori'),
((SELECT id FROM catar WHERE name = 'Decorazioni'), 'Illuminazione'),
((SELECT id FROM catar WHERE name = 'Musica & Animazione'), 'Musica araba'),
((SELECT id FROM catar WHERE name = 'Musica & Animazione'), 'Danze Dabke'),
((SELECT id FROM catar WHERE name = 'Tradizioni'), 'Cerimonia henné'),
((SELECT id FROM catar WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM catar WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM catar WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM catar WHERE name = 'Regali'), 'Regali agli ospiti'),
((SELECT id FROM catar WHERE name = 'Regali'), 'Bomboniere'),
((SELECT id FROM catar WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM catar WHERE name = 'Cerimonia henné'), 'Artista henné'),
((SELECT id FROM catar WHERE name = 'Banchetto'), 'Sala banchetti'),
((SELECT id FROM catar WHERE name = 'Danze Dabke'), 'Animazione Dabke');

-- Fornitori Arabia
INSERT INTO suppliers (name, country, notes) VALUES
('Arabian Wedding Planners', 'Arabia', 'Esperti in matrimoni arabi'),
('Gold Couture', 'Arabia', 'Abiti da sposa e sposo'),
('Palace Florist', 'Arabia', 'Fiori e decorazioni'),
('Henna Artist', 'Arabia', 'Artista henné'),
('Arabian Banquet', 'Arabia', 'Catering arabo'),
('DJ Arabia', 'Arabia', 'Animazione musicale');

-- Location Arabia
INSERT INTO locations (name, country, city, type, notes) VALUES
('Royal Palace', 'Arabia', 'Riyadh', 'Palazzo', 'Cerimonie regali'),
('Banquet Hall Dubai', 'Arabia', 'Dubai', 'Sala banchetti', 'Banchetti tradizionali');

-- Chiese Arabia
INSERT INTO churches (name, country, city, type, notes) VALUES
('Grand Mosque', 'Arabia', 'Riyadh', 'Moschea', 'Cerimonie religiose');

-- Incomes Arabia
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('ar2025-001-002-003-004-005', 'Famiglia sposa', 30000, 'Regalo tradizionale'),
('ar2025-001-002-003-004-005', 'Famiglia sposo', 25000, 'Regalo nozze'),
('ar2025-001-002-003-004-005', 'Risparmi personali', 20000, 'Risparmi degli sposi'),
('ar2025-001-002-003-004-005', 'Regali amici', 10000, 'Regali in denaro');

-- Expenses Arabia
WITH catar AS (SELECT id, name FROM categories WHERE event_id = 'ar2025-001-002-003-004-005'),
     subar AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('ar2025-001-002-003-004-005', (SELECT id FROM catar WHERE name = 'Sposa'), (SELECT id FROM subar WHERE name = 'Abito da sposa' AND category_id = (SELECT id FROM catar WHERE name = 'Sposa')), 12000, 'bride', 'Abito tradizionale'),
('ar2025-001-002-003-004-005', (SELECT id FROM catar WHERE name = 'Sposo'), (SELECT id FROM subar WHERE name = 'Abito da sposo' AND category_id = (SELECT id FROM catar WHERE name = 'Sposo')), 8000, 'groom', 'Abito sposo'),
('ar2025-001-002-003-004-005', (SELECT id FROM catar WHERE name = 'Location & Catering'), (SELECT id FROM subar WHERE name = 'Palazzo' AND category_id = (SELECT id FROM catar WHERE name = 'Location & Catering')), 25000, 'common', 'Location palazzo'),
('ar2025-001-002-003-004-005', (SELECT id FROM catar WHERE name = 'Decorazioni'), (SELECT id FROM subar WHERE name = 'Fiori' AND category_id = (SELECT id FROM catar WHERE name = 'Decorazioni')), 7000, 'common', 'Decorazione floreale'),
('ar2025-001-002-003-004-005', (SELECT id FROM catar WHERE name = 'Musica & Animazione'), (SELECT id FROM subar WHERE name = 'Musica araba' AND category_id = (SELECT id FROM catar WHERE name = 'Musica & Animazione')), 4000, 'common', 'Musica araba');

-- Wedding cards Arabia
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('ar2025-001-002-003-004-005', 'Layla Al-Farsi', 'layla.alfarsi@email.ar', 'Riyadh, Arabia', 'Invitata famiglia sposa'),
('ar2025-001-002-003-004-005', 'Omar Al-Sabah', 'omar.alsabah@email.ar', 'Dubai, Arabia', 'Invitato famiglia sposo'),
('ar2025-001-002-003-004-005', 'Fatima Al-Hassan', 'fatima.alhassan@email.ar', 'Jeddah, Arabia', 'Amica degli sposi'),
('ar2025-001-002-003-004-005', 'Khalid Al-Mansour', 'khalid.almansour@email.ar', 'Abu Dhabi, Arabia', 'Collega sposo');

-- Seed tradizioni e categorie matrimonio USA

-- Tradizioni USA
INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('USA', 'US',
 'Cerimonia civile o religiosa, scambio delle promesse, ricevimento, first dance, lancio bouquet.',
 'Stili vari: classico, country, moderno. Bianco, blu, rosa. Decorazioni personalizzate.',
 'Bianco, blu, rosa.',
 'Regali, denaro, lista nozze.',
 '1 giorno, festa serale.',
 'Ricevimento, balli, giochi, torta nuziale.',
 'First dance, lancio bouquet, discorsi, photo booth.');

-- Evento USA
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'us2025-001-002-003-004-005',
  'Matrimonio USA',
  'USA',
  100000,
  50000,
  50000
);

-- Categorie USA
INSERT INTO categories (event_id, name) VALUES
('us2025-001-002-003-004-005', 'Sposa'),
('us2025-001-002-003-004-005', 'Sposo'),
('us2025-001-002-003-004-005', 'Location & Catering'),
('us2025-001-002-003-004-005', 'Decorazioni'),
('us2025-001-002-003-004-005', 'Musica & Animazione'),
('us2025-001-002-003-004-005', 'Tradizioni'),
('us2025-001-002-003-004-005', 'Foto & Video'),
('us2025-001-002-003-004-005', 'Trasporti'),
('us2025-001-002-003-004-005', 'Regali'),
('us2025-001-002-003-004-005', 'Documenti'),
('us2025-001-002-003-004-005', 'First dance'),
('us2025-001-002-003-004-005', 'Photo booth'),
('us2025-001-002-003-004-005', 'Torta nuziale');

-- Sottocategorie USA
WITH catus AS (
  SELECT id, name FROM categories WHERE event_id = 'us2025-001-002-003-004-005'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM catus WHERE name = 'Sposa'), 'Abito da sposa'),
((SELECT id FROM catus WHERE name = 'Sposa'), 'Velo'),
((SELECT id FROM catus WHERE name = 'Sposo'), 'Abito da sposo'),
((SELECT id FROM catus WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM catus WHERE name = 'Location & Catering'), 'Hotel'),
((SELECT id FROM catus WHERE name = 'Location & Catering'), 'Ristorante'),
((SELECT id FROM catus WHERE name = 'Decorazioni'), 'Fiori'),
((SELECT id FROM catus WHERE name = 'Decorazioni'), 'Illuminazione'),
((SELECT id FROM catus WHERE name = 'Musica & Animazione'), 'Band'),
((SELECT id FROM catus WHERE name = 'Musica & Animazione'), 'DJ'),
((SELECT id FROM catus WHERE name = 'Tradizioni'), 'First dance'),
((SELECT id FROM catus WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM catus WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM catus WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM catus WHERE name = 'Regali'), 'Regali agli ospiti'),
((SELECT id FROM catus WHERE name = 'Regali'), 'Bomboniere'),
((SELECT id FROM catus WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM catus WHERE name = 'First dance'), 'Animazione first dance'),
((SELECT id FROM catus WHERE name = 'Photo booth'), 'Servizio photo booth'),
((SELECT id FROM catus WHERE name = 'Torta nuziale'), 'Torta nuziale');

-- Fornitori USA
INSERT INTO suppliers (name, country, notes) VALUES
('NY Wedding Planners', 'USA', 'Esperti in matrimoni americani'),
('American Couture', 'USA', 'Abiti da sposa e sposo'),
('Hotel Florist', 'USA', 'Fiori e decorazioni'),
('Photo Booth Service', 'USA', 'Servizio photo booth'),
('American Banquet', 'USA', 'Catering americano'),
('DJ USA', 'USA', 'Animazione musicale');

-- Location USA
INSERT INTO locations (name, country, city, type, notes) VALUES
('Central Park', 'USA', 'New York', 'Parco', 'Cerimonie all’aperto'),
('Hotel Plaza', 'USA', 'New York', 'Hotel', 'Ricevimenti eleganti'),
('Banquet Hall LA', 'USA', 'Los Angeles', 'Sala banchetti', 'Banchetti tradizionali');

-- Chiese USA
INSERT INTO churches (name, country, city, type, notes) VALUES
('St. Patrick Cathedral', 'USA', 'New York', 'Cattedrale', 'Cerimonie religiose'),
('Hollywood Church', 'USA', 'Los Angeles', 'Chiesa', 'Matrimoni religiosi');

-- Incomes USA
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('us2025-001-002-003-004-005', 'Famiglia sposa', 40000, 'Regalo tradizionale'),
('us2025-001-002-003-004-005', 'Famiglia sposo', 35000, 'Regalo nozze'),
('us2025-001-002-003-004-005', 'Risparmi personali', 20000, 'Risparmi degli sposi'),
('us2025-001-002-003-004-005', 'Regali amici', 10000, 'Regali in denaro');

-- Expenses USA
WITH catus AS (SELECT id, name FROM categories WHERE event_id = 'us2025-001-002-003-004-005'),
     subus AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('us2025-001-002-003-004-005', (SELECT id FROM catus WHERE name = 'Sposa'), (SELECT id FROM subus WHERE name = 'Abito da sposa' AND category_id = (SELECT id FROM catus WHERE name = 'Sposa')), 15000, 'bride', 'Abito tradizionale'),
('us2025-001-002-003-004-005', (SELECT id FROM catus WHERE name = 'Sposo'), (SELECT id FROM subus WHERE name = 'Abito da sposo' AND category_id = (SELECT id FROM catus WHERE name = 'Sposo')), 10000, 'groom', 'Abito sposo'),
('us2025-001-002-003-004-005', (SELECT id FROM catus WHERE name = 'Location & Catering'), (SELECT id FROM subus WHERE name = 'Hotel' AND category_id = (SELECT id FROM catus WHERE name = 'Location & Catering')), 35000, 'common', 'Location hotel'),
('us2025-001-002-003-004-005', (SELECT id FROM catus WHERE name = 'Decorazioni'), (SELECT id FROM subus WHERE name = 'Fiori' AND category_id = (SELECT id FROM catus WHERE name = 'Decorazioni')), 9000, 'common', 'Decorazione floreale'),
('us2025-001-002-003-004-005', (SELECT id FROM catus WHERE name = 'Musica & Animazione'), (SELECT id FROM subus WHERE name = 'Band' AND category_id = (SELECT id FROM catus WHERE name = 'Musica & Animazione')), 6000, 'common', 'Band musicale');

-- Wedding cards USA
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('us2025-001-002-003-004-005', 'Emily Smith', 'emily.smith@email.us', 'New York, USA', 'Invitata famiglia sposa'),
('us2025-001-002-003-004-005', 'John Miller', 'john.miller@email.us', 'Los Angeles, USA', 'Invitato famiglia sposo'),
('us2025-001-002-003-004-005', 'Jessica Brown', 'jessica.brown@email.us', 'Chicago, USA', 'Amica degli sposi'),
('us2025-001-002-003-004-005', 'Michael Davis', 'michael.davis@email.us', 'Miami, USA', 'Collega sposo');
-- Seed tradizioni e categorie matrimonio Russia

-- Tradizioni Russia
INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('Russia', 'RU',
 'Cerimonia civile e religiosa (ortodossa). Scambio di pane e sale, giri intorno all’altare, balli tradizionali.',
 'Abiti eleganti, bianco, oro, blu. Decorazioni floreali, icone religiose.',
 'Bianco, oro, blu.',
 'Denaro, pane, sale, regali simbolici.',
 '1–2 giorni di celebrazioni.',
 'Festa con balli, giochi, lancio del bouquet, banchetto ricco.',
 'Giochi tradizionali, “riscatto” della sposa, benedizione degli sposi.');

-- Evento Russia
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'ru2025-001-002-003-004-005',
  'Matrimonio Russia',
  'Russia',
  90000,
  45000,
  45000
);

-- Categorie Russia
INSERT INTO categories (event_id, name) VALUES
('ru2025-001-002-003-004-005', 'Sposa'),
('ru2025-001-002-003-004-005', 'Sposo'),
('ru2025-001-002-003-004-005', 'Location & Catering'),
('ru2025-001-002-003-004-005', 'Decorazioni'),
('ru2025-001-002-003-004-005', 'Musica & Animazione'),
('ru2025-001-002-003-004-005', 'Tradizioni'),
('ru2025-001-002-003-004-005', 'Foto & Video'),
('ru2025-001-002-003-004-005', 'Trasporti'),
('ru2025-001-002-003-004-005', 'Regali'),
('ru2025-001-002-003-004-005', 'Documenti'),
('ru2025-001-002-003-004-005', 'Cerimonia ortodossa'),
('ru2025-001-002-003-004-005', 'Banchetto'),
('ru2025-001-002-003-004-005', 'Giochi tradizionali');

-- Sottocategorie Russia
WITH catru AS (
  SELECT id, name FROM categories WHERE event_id = 'ru2025-001-002-003-004-005'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM catru WHERE name = 'Sposa'), 'Abito da sposa'),
((SELECT id FROM catru WHERE name = 'Sposa'), 'Velo'),
((SELECT id FROM catru WHERE name = 'Sposo'), 'Abito da sposo'),
((SELECT id FROM catru WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM catru WHERE name = 'Location & Catering'), 'Ristorante russo'),
((SELECT id FROM catru WHERE name = 'Location & Catering'), 'Sala ricevimenti'),
((SELECT id FROM catru WHERE name = 'Decorazioni'), 'Fiori'),
((SELECT id FROM catru WHERE name = 'Decorazioni'), 'Icone religiose'),
((SELECT id FROM catru WHERE name = 'Musica & Animazione'), 'Orchestra'),
((SELECT id FROM catru WHERE name = 'Musica & Animazione'), 'DJ'),
((SELECT id FROM catru WHERE name = 'Tradizioni'), 'Pane e sale'),
((SELECT id FROM catru WHERE name = 'Tradizioni'), 'Riscatto della sposa'),
((SELECT id FROM catru WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM catru WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM catru WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM catru WHERE name = 'Regali'), 'Regali agli ospiti'),
((SELECT id FROM catru WHERE name = 'Regali'), 'Bomboniere'),
((SELECT id FROM catru WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM catru WHERE name = 'Cerimonia ortodossa'), 'Chiesa ortodossa'),
((SELECT id FROM catru WHERE name = 'Banchetto'), 'Sala banchetti'),
((SELECT id FROM catru WHERE name = 'Giochi tradizionali'), 'Giochi e quiz');

-- Fornitori Russia
INSERT INTO suppliers (name, country, notes) VALUES
('Moscow Wedding Agency', 'Russia', 'Esperti in matrimoni ortodossi e civili'),
('Russian Couture', 'Russia', 'Abiti da sposa e sposo'),
('Tsar Florist', 'Russia', 'Fiori e decorazioni'),
('Orthodox Church Service', 'Russia', 'Servizi cerimonia chiesa'),
('Russian Banquet', 'Russia', 'Catering russo'),
('DJ Moscow', 'Russia', 'Animazione musicale');

-- Location Russia
INSERT INTO locations (name, country, city, type, notes) VALUES
('Cathedral of Christ the Saviour', 'Russia', 'Mosca', 'Chiesa ortodossa', 'Cerimonie religiose'),
('Tsar Palace', 'Russia', 'San Pietroburgo', 'Palazzo', 'Ricevimenti regali'),
('Russian Banquet Hall', 'Russia', 'Mosca', 'Sala banchetti', 'Banchetti tradizionali'),
('Volga River Cruise', 'Russia', 'Mosca', 'Crociera', 'Ricevimenti sul fiume');

-- Chiese Russia
INSERT INTO churches (name, country, city, type, notes) VALUES
('Cathedral of Christ the Saviour', 'Russia', 'Mosca', 'Chiesa ortodossa', 'Cerimonie religiose'),
('St. Isaac Cathedral', 'Russia', 'San Pietroburgo', 'Chiesa ortodossa', 'Matrimoni ortodossi'),
('Kazan Cathedral', 'Russia', 'San Pietroburgo', 'Chiesa ortodossa', 'Cerimonie religiose');

-- Incomes Russia
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('ru2025-001-002-003-004-005', 'Famiglia sposa', 30000, 'Regalo tradizionale'),
('ru2025-001-002-003-004-005', 'Famiglia sposo', 25000, 'Regalo nozze'),
('ru2025-001-002-003-004-005', 'Risparmi personali', 20000, 'Risparmi degli sposi'),
('ru2025-001-002-003-004-005', 'Regali amici', 10000, 'Regali in denaro');

-- Expenses Russia
WITH catru AS (SELECT id, name FROM categories WHERE event_id = 'ru2025-001-002-003-004-005'),
     subru AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('ru2025-001-002-003-004-005', (SELECT id FROM catru WHERE name = 'Sposa'), (SELECT id FROM subru WHERE name = 'Abito da sposa' AND category_id = (SELECT id FROM catru WHERE name = 'Sposa')), 12000, 'bride', 'Abito tradizionale'),
('ru2025-001-002-003-004-005', (SELECT id FROM catru WHERE name = 'Sposo'), (SELECT id FROM subru WHERE name = 'Abito da sposo' AND category_id = (SELECT id FROM catru WHERE name = 'Sposo')), 8000, 'groom', 'Abito sposo'),
('ru2025-001-002-003-004-005', (SELECT id FROM catru WHERE name = 'Location & Catering'), (SELECT id FROM subru WHERE name = 'Ristorante russo' AND category_id = (SELECT id FROM catru WHERE name = 'Location & Catering')), 25000, 'common', 'Catering tradizionale'),
('ru2025-001-002-003-004-005', (SELECT id FROM catru WHERE name = 'Decorazioni'), (SELECT id FROM subru WHERE name = 'Fiori' AND category_id = (SELECT id FROM catru WHERE name = 'Decorazioni')), 7000, 'common', 'Decorazione floreale'),
('ru2025-001-002-003-004-005', (SELECT id FROM catru WHERE name = 'Musica & Animazione'), (SELECT id FROM subru WHERE name = 'Orchestra' AND category_id = (SELECT id FROM catru WHERE name = 'Musica & Animazione')), 4000, 'common', 'Orchestra tradizionale');

-- Wedding cards Russia
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('ru2025-001-002-003-004-005', 'Anna Ivanova', 'anna.ivanova@email.ru', 'Mosca, Russia', 'Invitata famiglia sposa'),
('ru2025-001-002-003-004-005', 'Sergey Petrov', 'sergey.petrov@email.ru', 'San Pietroburgo, Russia', 'Invitato famiglia sposo'),
('ru2025-001-002-003-004-005', 'Olga Smirnova', 'olga.smirnova@email.ru', 'Mosca, Russia', 'Amica degli sposi'),
('ru2025-001-002-003-004-005', 'Dmitry Sokolov', 'dmitry.sokolov@email.ru', 'Kazan, Russia', 'Collega sposo');
-- Seed tradizioni e categorie matrimonio Giappone

-- Tradizioni Giappone
CREATE TABLE IF NOT EXISTS wedding_traditions (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  code TEXT NOT NULL,
  rito TEXT,
  stile TEXT,
  colori TEXT,
  regali TEXT,
  durata TEXT,
  festa TEXT,
  usanze TEXT
);
INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('Giappone', 'JP',
 'Cerimonia Shinto con kimono, sake rituale, scambio di rami di sakaki. Spesso anche cerimonia occidentale.',
 'Eleganza minimalista, kimono, bianco, oro, rosso. Decorazioni floreali (sakura, peonie).',
 'Bianco, oro, rosso.',
 'Buste con denaro (goshugi), regali simbolici.',
 '1 giorno, a volte 2 con festa.',
 'Festa con karaoke, danze, giochi tradizionali.',
 'Scambio di sake, taglio del nastro, foto di gruppo.');

-- Evento Giappone
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  'Matrimonio Giappone',
  'Giappone',
  80000,
  40000,
  40000
);

-- Categorie Giappone
INSERT INTO categories (event_id, name) VALUES
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Sposa'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Sposo'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Location & Catering'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Decorazioni'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Musica & Animazione'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Tradizioni'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Foto & Video'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Trasporti'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Regali'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Documenti'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Cerimonia Shinto'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Karaoke'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Festa Sakura');

-- Sottocategorie Giappone
WITH catjp AS (
  SELECT id, name FROM categories WHERE event_id = 'a1b2c3d4-5678-90ab-cdef-1234567890ab'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM catjp WHERE name = 'Sposa'), 'Kimono sposa'),
((SELECT id FROM catjp WHERE name = 'Sposa'), 'Acconciatura tradizionale'),
((SELECT id FROM catjp WHERE name = 'Sposo'), 'Kimono sposo'),
((SELECT id FROM catjp WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM catjp WHERE name = 'Location & Catering'), 'Tempio Shinto'),
((SELECT id FROM catjp WHERE name = 'Location & Catering'), 'Ristorante giapponese'),
((SELECT id FROM catjp WHERE name = 'Decorazioni'), 'Sakura'),
((SELECT id FROM catjp WHERE name = 'Decorazioni'), 'Peonie'),
((SELECT id FROM catjp WHERE name = 'Musica & Animazione'), 'Karaoke'),
((SELECT id FROM catjp WHERE name = 'Musica & Animazione'), 'Gruppo musicale'),
((SELECT id FROM catjp WHERE name = 'Tradizioni'), 'Cerimonia sake'),
((SELECT id FROM catjp WHERE name = 'Tradizioni'), 'Scambio di sakaki'),
((SELECT id FROM catjp WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM catjp WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM catjp WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM catjp WHERE name = 'Regali'), 'Goshugi'),
((SELECT id FROM catjp WHERE name = 'Regali'), 'Regali simbolici'),
((SELECT id FROM catjp WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM catjp WHERE name = 'Cerimonia Shinto'), 'Tempio Shinto'),
((SELECT id FROM catjp WHERE name = 'Karaoke'), 'Animazione karaoke'),
((SELECT id FROM catjp WHERE name = 'Festa Sakura'), 'Decorazioni Sakura');

-- Fornitori Giappone
INSERT INTO suppliers (name, country, notes) VALUES
('Tokyo Wedding Planners', 'Giappone', 'Esperti in matrimoni tradizionali e moderni'),
('Kimono Couture', 'Giappone', 'Kimono su misura per sposa e sposo'),
('Sakura Florist', 'Giappone', 'Fiori e decorazioni sakura'),
('Shinto Temple Service', 'Giappone', 'Servizi cerimonia tempio'),
('Karaoke Masters', 'Giappone', 'Animazione karaoke'),
('Sushi Catering', 'Giappone', 'Catering giapponese');

-- Location Giappone
INSERT INTO locations (name, country, city, type, notes) VALUES
('Meiji Jingu', 'Giappone', 'Tokyo', 'Tempio Shinto', 'Cerimonie tradizionali'),
('Sakura Garden', 'Giappone', 'Kyoto', 'Giardino', 'Ricevimenti primaverili'),
('Tokyo Tower Restaurant', 'Giappone', 'Tokyo', 'Ristorante', 'Catering panoramico'),
('Osaka Castle', 'Giappone', 'Osaka', 'Castello', 'Location storica');

-- Templi/Chiese Giappone
INSERT INTO churches (name, country, city, type, notes) VALUES
('Meiji Jingu', 'Giappone', 'Tokyo', 'Tempio Shinto', 'Cerimonie tradizionali'),
('St. Mary Cathedral', 'Giappone', 'Tokyo', 'Chiesa Cristiana', 'Matrimoni cristiani'),
('Kiyomizu-dera', 'Giappone', 'Kyoto', 'Tempio Buddista', 'Cerimonie buddiste');

-- Incomes Giappone
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Famiglia sposa', 25000, 'Goshugi tradizionale'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Famiglia sposo', 20000, 'Regalo nozze'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Risparmi personali', 15000, 'Risparmi degli sposi'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Regali amici', 10000, 'Buste con denaro');

-- Expenses Giappone
WITH catjp AS (SELECT id, name FROM categories WHERE event_id = 'a1b2c3d4-5678-90ab-cdef-1234567890ab'),
     subjp AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('a1b2c3d4-5678-90ab-cdef-1234567890ab', (SELECT id FROM catjp WHERE name = 'Sposa'), (SELECT id FROM subjp WHERE name = 'Kimono sposa' AND category_id = (SELECT id FROM catjp WHERE name = 'Sposa')), 10000, 'bride', 'Kimono tradizionale'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', (SELECT id FROM catjp WHERE name = 'Sposo'), (SELECT id FROM subjp WHERE name = 'Kimono sposo' AND category_id = (SELECT id FROM catjp WHERE name = 'Sposo')), 8000, 'groom', 'Kimono sposo'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', (SELECT id FROM catjp WHERE name = 'Location & Catering'), (SELECT id FROM subjp WHERE name = 'Ristorante giapponese' AND category_id = (SELECT id FROM catjp WHERE name = 'Location & Catering')), 20000, 'common', 'Catering giapponese'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', (SELECT id FROM catjp WHERE name = 'Decorazioni'), (SELECT id FROM subjp WHERE name = 'Sakura' AND category_id = (SELECT id FROM catjp WHERE name = 'Decorazioni')), 5000, 'common', 'Decorazioni sakura'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', (SELECT id FROM catjp WHERE name = 'Musica & Animazione'), (SELECT id FROM subjp WHERE name = 'Karaoke' AND category_id = (SELECT id FROM catjp WHERE name = 'Musica & Animazione')), 3000, 'common', 'Animazione karaoke');

-- Wedding cards Giappone
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Yuki Tanaka', 'yuki.tanaka@email.jp', 'Tokyo, Giappone', 'Invitata famiglia sposa'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Hiroshi Sato', 'hiroshi.sato@email.jp', 'Osaka, Giappone', 'Invitato famiglia sposo'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Mika Suzuki', 'mika.suzuki@email.jp', 'Kyoto, Giappone', 'Amica degli sposi'),
('a1b2c3d4-5678-90ab-cdef-1234567890ab', 'Taro Yamamoto', 'taro.yamamoto@email.jp', 'Nagoya, Giappone', 'Collega sposo');
-- Seed tradizioni e categorie matrimonio India

-- Tabella tradizioni (se non esiste già)
CREATE TABLE IF NOT EXISTS wedding_traditions (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  code TEXT NOT NULL,
  rito TEXT,
  stile TEXT,
  colori TEXT,
  regali TEXT,
  durata TEXT,
  festa TEXT,
  usanze TEXT
);

INSERT INTO wedding_traditions (country, code, rito, stile, colori, regali, durata, festa, usanze) VALUES
('in', 'IN',
 'Riti religiosi complessi (Hindu, Sikh, musulmani, ecc.). Mandap (altare decorato), fuoco sacro, ghirlande. Cerimonia del Mehndi (decorazione con henné).',
 'Colori vivaci: rosso, oro, arancio. Tessuti ricchi, ornamenti, musica.',
 'Rosso, oro, arancio.',
 'Oro, denaro, doni alle famiglie.',
 '3–5 giorni di celebrazioni.',
 'Processione dello sposo a cavallo (Baraat). Danze Bollywood. Feste pre e post nozze con temi diversi.',
 NULL
);

-- Evento India (necessario per il vincolo event_id)
INSERT INTO events (id, name, country, total_budget, bride_initial_budget, groom_initial_budget)
VALUES (
  'e3654b38-5324-4f4d-8d37-e0ef62641730',
  'Matrimonio India',
  'in',
  100000,
  50000,
  50000
)
ON CONFLICT (id) DO NOTHING;


-- La tabella 'categories' richiede event_id NOT NULL.
-- Sostituisci 'e3654b38-5324-4f4d-8d37-e0ef62641730' con l'ID del tuo evento indiano.
INSERT INTO categories (event_id, name) VALUES
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Sposa'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Sposo'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Location & Catering'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Decorazioni'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Musica & Animazione'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Tradizioni'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Foto & Video'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Trasporti'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Regali'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Documenti'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Cerimonia Mehndi'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Baraat'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Feste Bollywood');

CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL
);

-- Popolamento subcategories per categorie indiane
WITH cat AS (
  SELECT id, name FROM categories WHERE event_id = 'e3654b38-5324-4f4d-8d37-e0ef62641730'
)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM cat WHERE name = 'Sposa'), 'Abito da sposa'),
((SELECT id FROM cat WHERE name = 'Sposa'), 'Gioielli'),
((SELECT id FROM cat WHERE name = 'Sposa'), 'Trucco e acconciatura'),
((SELECT id FROM cat WHERE name = 'Sposo'), 'Abito da sposo'),
((SELECT id FROM cat WHERE name = 'Sposo'), 'Accessori'),
((SELECT id FROM cat WHERE name = 'Location & Catering'), 'Affitto location'),
((SELECT id FROM cat WHERE name = 'Location & Catering'), 'Catering indiano'),
((SELECT id FROM cat WHERE name = 'Decorazioni'), 'Mandap'),
((SELECT id FROM cat WHERE name = 'Decorazioni'), 'Fiori'),
((SELECT id FROM cat WHERE name = 'Decorazioni'), 'Illuminazione'),
((SELECT id FROM cat WHERE name = 'Musica & Animazione'), 'DJ Bollywood'),
((SELECT id FROM cat WHERE name = 'Musica & Animazione'), 'Gruppo musicale'),
((SELECT id FROM cat WHERE name = 'Tradizioni'), 'Cerimonia Mehndi'),
((SELECT id FROM cat WHERE name = 'Tradizioni'), 'Baraat'),
((SELECT id FROM cat WHERE name = 'Foto & Video'), 'Fotografo'),
((SELECT id FROM cat WHERE name = 'Foto & Video'), 'Videomaker'),
((SELECT id FROM cat WHERE name = 'Trasporti'), 'Auto sposi'),
((SELECT id FROM cat WHERE name = 'Trasporti'), 'Cavallo Baraat'),
((SELECT id FROM cat WHERE name = 'Regali'), 'Regali agli ospiti'),
((SELECT id FROM cat WHERE name = 'Regali'), 'Bomboniere'),
((SELECT id FROM cat WHERE name = 'Documenti'), 'Certificato di matrimonio'),
((SELECT id FROM cat WHERE name = 'Documenti'), 'Documenti religiosi'),
((SELECT id FROM cat WHERE name = 'Cerimonia Mehndi'), 'Artista Mehndi'),
((SELECT id FROM cat WHERE name = 'Baraat'), 'Servizio cavallo'),
((SELECT id FROM cat WHERE name = 'Feste Bollywood'), 'Animazione Bollywood'),
((SELECT id FROM cat WHERE name = 'Feste Bollywood'), 'Costumi e scenografie');


CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  notes TEXT
);
INSERT INTO suppliers (name, country, notes) VALUES
('Taj Wedding Planners', 'in', 'Esperti in matrimoni tradizionali indiani'),
('Bollywood DJ', 'in', 'DJ per feste Bollywood'),
('Mandap Decorators', 'in', 'Specialisti in decorazioni Mandap'),
('Mehndi Artist', 'in', 'Artista henné per Mehndi'),
('Baraat Horse Service', 'in', 'Servizio cavallo per Baraat'),
('Saree Couture', 'in', 'Abiti da sposa tradizionali'),
('Sweets & Mithai', 'in', 'Dolci tipici indiani');

-- Seed location India
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  type TEXT,
  notes TEXT
);
INSERT INTO locations (name, country, city, type, notes) VALUES
('Palace Udaipur', 'in', 'Udaipur', 'Palazzo', 'Location per matrimoni regali'),
('Beach Goa', 'in', 'Goa', 'Spiaggia', 'Matrimoni sulla spiaggia'),
('Temple Chennai', 'in', 'Chennai', 'Tempio', 'Cerimonie religiose'),
('Garden Delhi', 'in', 'Delhi', 'Giardino', 'Ricevimenti all\'aperto');

CREATE TABLE IF NOT EXISTS churches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  city TEXT,
  type TEXT,
  notes TEXT
);
INSERT INTO churches (name, country, city, type, notes) VALUES
('Sri Meenakshi Temple', 'in', 'Madurai', 'Tempio Hindu', 'Celebrazioni tradizionali'),
('St. Thomas Cathedral', 'in', 'Mumbai', 'Chiesa Cristiana', 'Matrimoni cristiani'),
('Golden Temple', 'in', 'Amritsar', 'Tempio Sikh', 'Matrimoni Sikh'),
('Jama Masjid', 'in', 'Delhi', 'Moschea', 'Matrimoni musulmani');

-- Seed incomes India
CREATE TABLE IF NOT EXISTS incomes (
  id SERIAL PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  source TEXT,
  amount NUMERIC,
  notes TEXT
);
INSERT INTO incomes (event_id, source, amount, notes) VALUES
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Famiglia sposa', 30000, 'Contributo tradizionale'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Famiglia sposo', 25000, 'Regalo nozze'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Risparmi personali', 20000, 'Risparmi degli sposi'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Regali amici', 10000, 'Regali in denaro');

-- Seed expenses India
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id),
  amount NUMERIC,
  spend_type TEXT,
  notes TEXT
);
-- Esempio: spese principali
WITH cat AS (SELECT id, name FROM categories WHERE event_id = 'e3654b38-5324-4f4d-8d37-e0ef62641730'),
     sub AS (SELECT id, name, category_id FROM subcategories)
INSERT INTO expenses (event_id, category_id, subcategory_id, amount, spend_type, notes) VALUES
('e3654b38-5324-4f4d-8d37-e0ef62641730', (SELECT id FROM cat WHERE name = 'Sposa'), (SELECT id FROM sub WHERE name = 'Abito da sposa' AND category_id = (SELECT id FROM cat WHERE name = 'Sposa')), 12000, 'bride', 'Abito tradizionale'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', (SELECT id FROM cat WHERE name = 'Sposo'), (SELECT id FROM sub WHERE name = 'Abito da sposo' AND category_id = (SELECT id FROM cat WHERE name = 'Sposo')), 8000, 'groom', 'Abito sherwani'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', (SELECT id FROM cat WHERE name = 'Location & Catering'), (SELECT id FROM sub WHERE name = 'Catering indiano' AND category_id = (SELECT id FROM cat WHERE name = 'Location & Catering')), 25000, 'common', 'Catering tradizionale'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', (SELECT id FROM cat WHERE name = 'Decorazioni'), (SELECT id FROM sub WHERE name = 'Mandap' AND category_id = (SELECT id FROM cat WHERE name = 'Decorazioni')), 7000, 'common', 'Decorazione Mandap'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', (SELECT id FROM cat WHERE name = 'Musica & Animazione'), (SELECT id FROM sub WHERE name = 'DJ Bollywood' AND category_id = (SELECT id FROM cat WHERE name = 'Musica & Animazione')), 4000, 'common', 'DJ Bollywood');

-- Seed wedding_cards India
CREATE TABLE IF NOT EXISTS wedding_cards (
  id SERIAL PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name TEXT,
  email TEXT,
  address TEXT,
  notes TEXT
);
INSERT INTO wedding_cards (event_id, name, email, address, notes) VALUES
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Priya Sharma', 'priya.sharma@email.com', 'Mumbai, India', 'Invitata famiglia sposa'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Rahul Verma', 'rahul.verma@email.com', 'Delhi, India', 'Invitato famiglia sposo'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Amit Singh', 'amit.singh@email.com', 'Goa, India', 'Amico degli sposi'),
('e3654b38-5324-4f4d-8d37-e0ef62641730', 'Sunita Patel', 'sunita.patel@email.com', 'Chennai, India', 'Collega sposa');

