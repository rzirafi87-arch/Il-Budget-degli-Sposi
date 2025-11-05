-- =========================================
-- QUINCEAÑERA - 15TH BIRTHDAY CELEBRATION
-- =========================================
-- Evento: Celebrazione tradizionale latinoamericana (15 anni)
-- Budget stimato: €8.000 - €20.000+
-- Timeline: 12+ mesi di preparazione
-- Budget type: Famiglia (comune)

-- Insert event type
INSERT INTO event_types (slug, label)
VALUES ('quinceanera', 'Quinceañera')
ON CONFLICT (slug) DO NOTHING;

-- Get event type ID
DO $$
DECLARE
  v_type_id UUID;
  v_cat_cerimonia UUID;
  v_cat_location UUID;
  v_cat_abbigliamento UUID;
  v_cat_corte UUID;
  v_cat_decorazioni UUID;
  v_cat_catering UUID;
  v_cat_inviti UUID;
  v_cat_intrattenimento UUID;
  v_cat_foto UUID;
  v_cat_tradizioni UUID;
  v_cat_regali UUID;
  v_cat_trasporti UUID;
  v_cat_budget UUID;
BEGIN
  SELECT id INTO v_type_id FROM event_types WHERE slug = 'quinceanera';

  -- ========================================
  -- 1. CERIMONIA RELIGIOSA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Cerimonia Religiosa', 10)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_cerimonia;
  
  IF v_cat_cerimonia IS NULL THEN
    SELECT id INTO v_cat_cerimonia FROM categories WHERE type_id = v_type_id AND name = 'Cerimonia Religiosa';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_cerimonia, 'Messa o servizio religioso', 10),
    (v_cat_cerimonia, 'Chiesa o tempio - prenotazione', 20),
    (v_cat_cerimonia, 'Coordinamento con sacerdote', 30),
    (v_cat_cerimonia, 'Bouquet quinceañera', 40),
    (v_cat_cerimonia, 'Decorazioni chiesa', 50),
    (v_cat_cerimonia, 'Musica cerimonia (coro, organista)', 60),
    (v_cat_cerimonia, 'Libretti messa', 70),
    (v_cat_cerimonia, 'Offerte e donazioni chiesa', 80)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 2. LOCATION RICEVIMENTO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Location Ricevimento', 20)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_location;
  
  IF v_cat_location IS NULL THEN
    SELECT id INTO v_cat_location FROM categories WHERE type_id = v_type_id AND name = 'Location Ricevimento';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_location, 'Sala ricevimento o venue', 10),
    (v_cat_location, 'Sopralluogo e caparra', 20),
    (v_cat_location, 'Allestimento spazi', 30),
    (v_cat_location, 'Parcheggi e accessibilità', 40),
    (v_cat_location, 'Permessi e autorizzazioni', 50),
    (v_cat_location, 'Catering e servizio tavola', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 3. ABBIGLIAMENTO QUINCEAÑERA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Abbigliamento Quinceañera', 30)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_abbigliamento;
  
  IF v_cat_abbigliamento IS NULL THEN
    SELECT id INTO v_cat_abbigliamento FROM categories WHERE type_id = v_type_id AND name = 'Abbigliamento Quinceañera';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_abbigliamento, 'Abito da ballo principale (vestido)', 10),
    (v_cat_abbigliamento, 'Secondo abito per festa (cambio d''abito)', 20),
    (v_cat_abbigliamento, 'Corona o tiara', 30),
    (v_cat_abbigliamento, 'Scarpe eleganti', 40),
    (v_cat_abbigliamento, 'Gioielli e accessori', 50),
    (v_cat_abbigliamento, 'Prove abiti e modifiche', 60),
    (v_cat_abbigliamento, 'Parrucchiere e makeup', 70),
    (v_cat_abbigliamento, 'Manicure e pedicure', 80)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 4. CORTE D'ONORE (DAMAS Y CHAMBELANES)
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Corte d''Onore (Damas y Chambelanes)', 40)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_corte;
  
  IF v_cat_corte IS NULL THEN
    SELECT id INTO v_cat_corte FROM categories WHERE type_id = v_type_id AND name = 'Corte d''Onore (Damas y Chambelanes)';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_corte, 'Abiti damas (damigelle)', 10),
    (v_cat_corte, 'Abiti chambelanes (cavalieri)', 20),
    (v_cat_corte, 'Accessori corte d''onore', 30),
    (v_cat_corte, 'Prove coreografie e balli', 40),
    (v_cat_corte, 'Coordinamento gruppo', 50),
    (v_cat_corte, 'Regalo corte d''onore', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 5. DECORAZIONI E ALLESTIMENTI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Decorazioni e Allestimenti', 50)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_decorazioni;
  
  IF v_cat_decorazioni IS NULL THEN
    SELECT id INTO v_cat_decorazioni FROM categories WHERE type_id = v_type_id AND name = 'Decorazioni e Allestimenti';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_decorazioni, 'Tema e concept visivo', 10),
    (v_cat_decorazioni, 'Centrotavola e fiori', 20),
    (v_cat_decorazioni, 'Palloncini e drappeggi', 30),
    (v_cat_decorazioni, 'Arco floreale o backdrop', 40),
    (v_cat_decorazioni, 'Illuminazione decorativa', 50),
    (v_cat_decorazioni, 'Segnaletica e tableau', 60),
    (v_cat_decorazioni, 'Candele (15 candele tradizionali)', 70),
    (v_cat_decorazioni, 'Tavolo regali e guestbook', 80)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 6. CATERING E TORTA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Catering e Torta', 60)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_catering;
  
  IF v_cat_catering IS NULL THEN
    SELECT id INTO v_cat_catering FROM categories WHERE type_id = v_type_id AND name = 'Catering e Torta';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_catering, 'Menu completo (pranzo o cena)', 10),
    (v_cat_catering, 'Aperitivo o cocktail benvenuto', 20),
    (v_cat_catering, 'Torta quinceañera (multi-tier)', 30),
    (v_cat_catering, 'Dolci e dessert table', 40),
    (v_cat_catering, 'Open bar e bevande', 50),
    (v_cat_catering, 'Servizio staff e camerieri', 60),
    (v_cat_catering, 'Mise en place e stoviglie', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 7. INVITI E COMUNICAZIONE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Inviti e Comunicazione', 70)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_inviti;
  
  IF v_cat_inviti IS NULL THEN
    SELECT id INTO v_cat_inviti FROM categories WHERE type_id = v_type_id AND name = 'Inviti e Comunicazione';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_inviti, 'Design inviti personalizzati', 10),
    (v_cat_inviti, 'Stampa inviti e buste', 20),
    (v_cat_inviti, 'Save the date', 30),
    (v_cat_inviti, 'Invio e tracking RSVP', 40),
    (v_cat_inviti, 'Menu cards e segnaposti', 50),
    (v_cat_inviti, 'Programma cerimonia', 60),
    (v_cat_inviti, 'Thank you cards post-evento', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 8. INTRATTENIMENTO E MUSICA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Intrattenimento e Musica', 80)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_intrattenimento;
  
  IF v_cat_intrattenimento IS NULL THEN
    SELECT id INTO v_cat_intrattenimento FROM categories WHERE type_id = v_type_id AND name = 'Intrattenimento e Musica';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_intrattenimento, 'DJ o band live', 10),
    (v_cat_intrattenimento, 'Musica vals tradizionale (waltz quinceañera)', 20),
    (v_cat_intrattenimento, 'Coreografia vals con padre', 30),
    (v_cat_intrattenimento, 'Ballo sorpresa con corte d''onore', 40),
    (v_cat_intrattenimento, 'Animazione e giochi', 50),
    (v_cat_intrattenimento, 'Photobooth o corner selfie', 60),
    (v_cat_intrattenimento, 'Video montaggio crescita', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 9. FOTO E VIDEO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Foto e Video', 90)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_foto;
  
  IF v_cat_foto IS NULL THEN
    SELECT id INTO v_cat_foto FROM categories WHERE type_id = v_type_id AND name = 'Foto e Video';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_foto, 'Fotografo professionista', 10),
    (v_cat_foto, 'Videomaker per highlights', 20),
    (v_cat_foto, 'Album fotografico', 30),
    (v_cat_foto, 'Servizio foto pre-quinceañera (studio)', 40),
    (v_cat_foto, 'Stampa foto in tempo reale', 50),
    (v_cat_foto, 'Drone per riprese (se outdoor)', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 10. TRADIZIONI E SIMBOLI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Tradizioni e Simboli', 100)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_tradizioni;
  
  IF v_cat_tradizioni IS NULL THEN
    SELECT id INTO v_cat_tradizioni FROM categories WHERE type_id = v_type_id AND name = 'Tradizioni e Simboli';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_tradizioni, 'Corona (cambio corona da bambina ad adulta)', 10),
    (v_cat_tradizioni, 'Ultima bambola (simbolo infanzia)', 20),
    (v_cat_tradizioni, '15 rose (da familiari e amici)', 30),
    (v_cat_tradizioni, '15 candele (con dediche speciali)', 40),
    (v_cat_tradizioni, 'Brindisi champagne (primo bicchiere)', 50),
    (v_cat_tradizioni, 'Scarpe (cambio scarpe flat→tacchi)', 60),
    (v_cat_tradizioni, 'Libro firme o capsula tempo', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 11. REGALI E OMAGGI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Regali e Omaggi', 110)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_regali;
  
  IF v_cat_regali IS NULL THEN
    SELECT id INTO v_cat_regali FROM categories WHERE type_id = v_type_id AND name = 'Regali e Omaggi';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_regali, 'Bomboniere per ospiti', 10),
    (v_cat_regali, 'Favors personalizzati', 20),
    (v_cat_regali, 'Sacchetti confetti o dolciumi', 30),
    (v_cat_regali, 'Regali corte d''onore', 40),
    (v_cat_regali, 'Regali padrini/madrine', 50),
    (v_cat_regali, 'Guestbook o album firme', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 12. TRASPORTI E LOGISTICA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Trasporti e Logistica', 120)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_trasporti;
  
  IF v_cat_trasporti IS NULL THEN
    SELECT id INTO v_cat_trasporti FROM categories WHERE type_id = v_type_id AND name = 'Trasporti e Logistica';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_trasporti, 'Auto o limousine quinceañera', 10),
    (v_cat_trasporti, 'Trasferimento chiesa-location', 20),
    (v_cat_trasporti, 'Navetta ospiti', 30),
    (v_cat_trasporti, 'Parcheggi riservati', 40),
    (v_cat_trasporti, 'Coordinamento orari', 50)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 13. GESTIONE BUDGET
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Gestione Budget', 130)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_budget;
  
  IF v_cat_budget IS NULL THEN
    SELECT id INTO v_cat_budget FROM categories WHERE type_id = v_type_id AND name = 'Gestione Budget';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_budget, 'Budget totale stimato', 10),
    (v_cat_budget, 'Acconti fornitori', 20),
    (v_cat_budget, 'Spese extra impreviste', 30),
    (v_cat_budget, 'Saldi finali', 40),
    (v_cat_budget, 'Fondo emergenze', 50),
    (v_cat_budget, 'Report finale spese', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

END $$;

-- ========================================
-- TIMELINE ITEMS
-- ========================================
INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order)
SELECT 
  (SELECT id FROM event_types WHERE slug = 'quinceanera'),
  '12+ MESI PRIMA',
  'Scegli data quinceañera',
  'Pianificazione Iniziale',
  365,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_items 
  WHERE type_id = (SELECT id FROM event_types WHERE slug = 'quinceanera')
  AND title = 'Scegli data quinceañera'
);

INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order) VALUES
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '12+ MESI PRIMA', 'Stabilisci budget totale famiglia', 'Pianificazione Iniziale', 365, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '12+ MESI PRIMA', 'Crea lista ospiti preliminare', 'Pianificazione Iniziale', 365, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '12+ MESI PRIMA', 'Prenota chiesa per messa', 'Pianificazione Iniziale', 365, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '12+ MESI PRIMA', 'Seleziona tema e colori festa', 'Pianificazione Iniziale', 365, 50),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '9 MESI PRIMA', 'Seleziona e prenota location ricevimento', 'Location e Fornitori', 270, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '9 MESI PRIMA', 'Ingaggia catering', 'Location e Fornitori', 270, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '9 MESI PRIMA', 'Prenota fotografo e videomaker', 'Location e Fornitori', 270, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '9 MESI PRIMA', 'Inizia ricerca DJ o band', 'Location e Fornitori', 270, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '9 MESI PRIMA', 'Scegli corte d''onore (damas y chambelanes)', 'Location e Fornitori', 270, 50),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '6 MESI PRIMA', 'Ordina abito principale quinceañera', 'Abiti e Dettagli', 180, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '6 MESI PRIMA', 'Design e ordine inviti', 'Abiti e Dettagli', 180, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '6 MESI PRIMA', 'Prenota DJ/band', 'Abiti e Dettagli', 180, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '6 MESI PRIMA', 'Pianifica coreografie vals e ballo sorpresa', 'Abiti e Dettagli', 180, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '6 MESI PRIMA', 'Ordina abiti corte d''onore', 'Abiti e Dettagli', 180, 50),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Invia inviti ufficiali', 'Comunicazione e Prove', 90, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Tracking RSVP', 'Comunicazione e Prove', 90, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Conferma menu con catering', 'Comunicazione e Prove', 90, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Inizia prove vals con padre e chambelanes', 'Comunicazione e Prove', 90, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Ordina decorazioni e fiori', 'Comunicazione e Prove', 90, 50),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '3 MESI PRIMA', 'Prepara video montaggio crescita', 'Comunicazione e Prove', 90, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 MESE PRIMA', 'Prove abiti e modifiche finali', 'Rifinitura', 30, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 MESE PRIMA', 'Finalizza numero ospiti e tableau', 'Rifinitura', 30, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 MESE PRIMA', 'Conferma tutti fornitori', 'Rifinitura', 30, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 MESE PRIMA', 'Prove generali vals e ballo sorpresa', 'Rifinitura', 30, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 MESE PRIMA', 'Ordina torta quinceañera', 'Rifinitura', 30, 50),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 SETTIMANA PRIMA', 'Ultima prova vals', 'Controlli Finali', 7, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 SETTIMANA PRIMA', 'Conferma orari con tutti fornitori', 'Controlli Finali', 7, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 SETTIMANA PRIMA', 'Prepara kit emergenza', 'Controlli Finali', 7, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), '1 SETTIMANA PRIMA', 'Ritira abiti e accessori', 'Controlli Finali', 7, 40),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Messa di ringraziamento', 'Feliz Quinceañera!', 0, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Cerimonia cambio corona', 'Feliz Quinceañera!', 0, 20),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Vals tradizionale con padre', 'Feliz Quinceañera!', 0, 30),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Ballo sorpresa con corte d''onore', 'Feliz Quinceañera!', 0, 40),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Cena celebrativa', 'Feliz Quinceañera!', 0, 50),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'GIORNO DELLA CELEBRAZIONE', 'Taglio torta e festeggiamenti', 'Feliz Quinceañera!', 0, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'POST-EVENTO', 'Invia thank you cards', 'Ringraziamenti', -7, 10),
  ((SELECT id FROM event_types WHERE slug = 'quinceanera'), 'POST-EVENTO', 'Ricevi foto e video finali', 'Ringraziamenti', -7, 20)
ON CONFLICT (type_id, title) DO NOTHING;
