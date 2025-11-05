-- =========================================
-- BAR MITZVAH / BAT MITZVAH - SEED
-- =========================================
-- Evento: Celebrazione religiosa ebraica (13 anni)
-- Budget stimato: €15.000 - €30.000
-- Timeline: 12+ mesi di preparazione
-- Budget type: Famiglia (comune)

-- Insert event type
INSERT INTO event_types (slug, label)
VALUES ('bar-mitzvah', 'Bar Mitzvah / Bat Mitzvah')
ON CONFLICT (slug) DO NOTHING;

-- Get event type ID
DO $$
DECLARE
  v_type_id UUID;
  v_cat_cerimonia UUID;
  v_cat_location UUID;
  v_cat_allestimento UUID;
  v_cat_catering UUID;
  v_cat_inviti UUID;
  v_cat_intrattenimento UUID;
  v_cat_foto UUID;
  v_cat_abbigliamento UUID;
  v_cat_regali UUID;
  v_cat_trasporti UUID;
  v_cat_budget UUID;
BEGIN
  SELECT id INTO v_type_id FROM event_types WHERE slug = 'bar-mitzvah';

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
    (v_cat_cerimonia, 'Prenotazione sinagoga o tempio', 10),
    (v_cat_cerimonia, 'Coordinamento con rabbino', 20),
    (v_cat_cerimonia, 'Lezioni preparatorie Torah per il/la festeggiato/a', 30),
    (v_cat_cerimonia, 'Tutor ebraico o madrich', 40),
    (v_cat_cerimonia, 'Tallit (scialle di preghiera) e kippah personalizzati', 50),
    (v_cat_cerimonia, 'Tefillin (se Bar Mitzvah)', 60),
    (v_cat_cerimonia, 'Lettura Torah e haftarah - preparazione', 70),
    (v_cat_cerimonia, 'Servizio fotografico cerimonia (se consentito)', 80)
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
    (v_cat_location, 'Selezione venue per festa (hotel, sala banchetti, spazio eventi)', 10),
    (v_cat_location, 'Sopralluogo e caparra location', 20),
    (v_cat_location, 'Verifica kasher kitchen (se richiesta cucina kasher)', 30),
    (v_cat_location, 'Allestimento sale e spazi', 40),
    (v_cat_location, 'Parcheggi e accessibilità ospiti', 50),
    (v_cat_location, 'Permessi e autorizzazioni', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 3. ALLESTIMENTO E DECORAZIONI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Allestimento e Decorazioni', 30)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_allestimento;
  
  IF v_cat_allestimento IS NULL THEN
    SELECT id INTO v_cat_allestimento FROM categories WHERE type_id = v_type_id AND name = 'Allestimento e Decorazioni';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_allestimento, 'Tema e concept visivo (colori, stile)', 10),
    (v_cat_allestimento, 'Decorazioni floreali e centrotavola', 20),
    (v_cat_allestimento, 'Palloncini, luci, drappeggi', 30),
    (v_cat_allestimento, 'Backdrop fotografico con nome e data', 40),
    (v_cat_allestimento, 'Segnaletica e tableau', 50),
    (v_cat_allestimento, 'Candele (havdalah set se richiesto)', 60),
    (v_cat_allestimento, 'Allestimento tavolo Torah o simboli ebraici', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 4. CATERING KASHER
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Catering Kasher', 40)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_catering;
  
  IF v_cat_catering IS NULL THEN
    SELECT id INTO v_cat_catering FROM categories WHERE type_id = v_type_id AND name = 'Catering Kasher';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_catering, 'Selezione catering kasher certificato', 10),
    (v_cat_catering, 'Menu tasting e scelta piatti', 20),
    (v_cat_catering, 'Aperitivo o cocktail di benvenuto', 30),
    (v_cat_catering, 'Pranzo o cena completa', 40),
    (v_cat_catering, 'Dolci e torta Bar/Bat Mitzvah', 50),
    (v_cat_catering, 'Open bar e bevande (vino kasher, liquori)', 60),
    (v_cat_catering, 'Servizio tavola e staff', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 5. INVITI E COMUNICAZIONE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Inviti e Comunicazione', 50)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_inviti;
  
  IF v_cat_inviti IS NULL THEN
    SELECT id INTO v_cat_inviti FROM categories WHERE type_id = v_type_id AND name = 'Inviti e Comunicazione';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_inviti, 'Design inviti personalizzati (carta o digitali)', 10),
    (v_cat_inviti, 'Stampa inviti e buste', 20),
    (v_cat_inviti, 'Save the date', 30),
    (v_cat_inviti, 'Invio e tracking RSVP', 40),
    (v_cat_inviti, 'Menu cards e segnaposti', 50),
    (v_cat_inviti, 'Libretto cerimonia (siddur o programma personalizzato)', 60),
    (v_cat_inviti, 'Thank you cards post-evento', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 6. INTRATTENIMENTO E MUSICA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Intrattenimento e Musica', 60)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_intrattenimento;
  
  IF v_cat_intrattenimento IS NULL THEN
    SELECT id INTO v_cat_intrattenimento FROM categories WHERE type_id = v_type_id AND name = 'Intrattenimento e Musica';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_intrattenimento, 'DJ o band live (musica klezmer, pop, dance)', 10),
    (v_cat_intrattenimento, 'Cantore o chazan per cerimonia (se richiesto)', 20),
    (v_cat_intrattenimento, 'Animazione per bambini/ragazzi', 30),
    (v_cat_intrattenimento, 'Photobooth o corner selfie', 40),
    (v_cat_intrattenimento, 'Giochi interattivi o attività', 50),
    (v_cat_intrattenimento, 'Danze tradizionali (Hava Nagila, Hora)', 60),
    (v_cat_intrattenimento, 'Video montaggio crescita del/della festeggiato/a', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 7. FOTO E VIDEO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Foto e Video', 70)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_foto;
  
  IF v_cat_foto IS NULL THEN
    SELECT id INTO v_cat_foto FROM categories WHERE type_id = v_type_id AND name = 'Foto e Video';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_foto, 'Fotografo professionista cerimonia + festa', 10),
    (v_cat_foto, 'Videomaker per highlights e aftermovie', 20),
    (v_cat_foto, 'Album fotografico o libro ricordo', 30),
    (v_cat_foto, 'Stampa foto in tempo reale', 40),
    (v_cat_foto, 'Drone per riprese aeree (se outdoor)', 50),
    (v_cat_foto, 'Live streaming cerimonia (per parenti lontani)', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 8. ABBIGLIAMENTO FESTEGGIATO/A
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Abbigliamento Festeggiato/a', 80)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_abbigliamento;
  
  IF v_cat_abbigliamento IS NULL THEN
    SELECT id INTO v_cat_abbigliamento FROM categories WHERE type_id = v_type_id AND name = 'Abbigliamento Festeggiato/a';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_abbigliamento, 'Abito o tailleur elegante', 10),
    (v_cat_abbigliamento, 'Tallit (scialle preghiera) personalizzato', 20),
    (v_cat_abbigliamento, 'Kippah coordinata', 30),
    (v_cat_abbigliamento, 'Scarpe e accessori', 40),
    (v_cat_abbigliamento, 'Parrucchiere e makeup (per Bat Mitzvah)', 50),
    (v_cat_abbigliamento, 'Prove abito e fitting', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 9. REGALI E OMAGGI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Regali e Omaggi', 90)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_regali;
  
  IF v_cat_regali IS NULL THEN
    SELECT id INTO v_cat_regali FROM categories WHERE type_id = v_type_id AND name = 'Regali e Omaggi';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_regali, 'Bomboniere o favors per ospiti', 10),
    (v_cat_regali, 'Kippah personalizzate per ospiti maschi', 20),
    (v_cat_regali, 'Sacchetti confetti o dolciumi', 30),
    (v_cat_regali, 'Regali per il/la festeggiato/a', 40),
    (v_cat_regali, 'Tzedakah (donazioni benefiche) a nome del festeggiato', 50),
    (v_cat_regali, 'Guestbook o albero firme', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 10. TRASPORTI E LOGISTICA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Trasporti e Logistica', 100)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_trasporti;
  
  IF v_cat_trasporti IS NULL THEN
    SELECT id INTO v_cat_trasporti FROM categories WHERE type_id = v_type_id AND name = 'Trasporti e Logistica';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_trasporti, 'Trasferimento sinagoga-location festa', 10),
    (v_cat_trasporti, 'Navetta ospiti', 20),
    (v_cat_trasporti, 'Parcheggi riservati', 30),
    (v_cat_trasporti, 'Auto per festeggiato/a e famiglia', 40),
    (v_cat_trasporti, 'Coordinamento orari cerimonia-festa', 50)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 11. GESTIONE BUDGET
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Gestione Budget', 110)
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
  (SELECT id FROM event_types WHERE slug = 'bar-mitzvah'),
  '12+ MESI PRIMA',
  'Scegli data Bar/Bat Mitzvah (coordinato con rabbino e sinagoga)',
  'Fondamenta Spirituali e Organizzative',
  365,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_items 
  WHERE type_id = (SELECT id FROM event_types WHERE slug = 'bar-mitzvah')
  AND title = 'Scegli data Bar/Bat Mitzvah (coordinato con rabbino e sinagoga)'
);

INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order) VALUES
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '12+ MESI PRIMA', 'Inizia studio Torah e preparazione spirituale', 'Fondamenta Spirituali e Organizzative', 365, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '12+ MESI PRIMA', 'Ingaggia tutor ebraico per lezioni', 'Fondamenta Spirituali e Organizzative', 365, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '12+ MESI PRIMA', 'Stabilisci budget totale famiglia', 'Fondamenta Spirituali e Organizzative', 365, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '12+ MESI PRIMA', 'Crea lista ospiti preliminare', 'Fondamenta Spirituali e Organizzative', 365, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '12+ MESI PRIMA', 'Prenota sinagoga per cerimonia', 'Fondamenta Spirituali e Organizzative', 365, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Seleziona e prenota location ricevimento', 'Location e Fornitori Principali', 270, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Ingaggia catering kasher certificato', 'Location e Fornitori Principali', 270, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Prenota fotografo e videomaker', 'Location e Fornitori Principali', 270, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Scegli tema e concept visivo festa', 'Location e Fornitori Principali', 270, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Inizia ricerca DJ o band', 'Location e Fornitori Principali', 270, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '9 MESI PRIMA', 'Ordina tallit personalizzato', 'Location e Fornitori Principali', 270, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Design e ordine inviti personalizzati', 'Inviti e Dettagli', 180, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Conferma menu con catering', 'Inviti e Dettagli', 180, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Prenota DJ/band e intrattenimento', 'Inviti e Dettagli', 180, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Scegli decorazioni e allestimenti', 'Inviti e Dettagli', 180, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Inizia shopping abito festeggiato/a', 'Inviti e Dettagli', 180, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '6 MESI PRIMA', 'Pianifica video montaggio ricordi', 'Inviti e Dettagli', 180, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Invia inviti ufficiali', 'Comunicazione e Coordinamento', 90, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Tracking RSVP e conferme', 'Comunicazione e Coordinamento', 90, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Ordina kippah e favors personalizzati', 'Comunicazione e Coordinamento', 90, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Conferma dettagli con rabbino', 'Comunicazione e Coordinamento', 90, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Prepara libretto cerimonia', 'Comunicazione e Coordinamento', 90, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '3 MESI PRIMA', 'Organizza prove lettura Torah', 'Comunicazione e Coordinamento', 90, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Prova generale lettura Torah in sinagoga', 'Rifinitura e Prove', 30, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Finalizza numero ospiti e tableau', 'Rifinitura e Prove', 30, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Conferma tutti fornitori (catering, DJ, foto/video)', 'Rifinitura e Prove', 30, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Prove abito e accessori', 'Rifinitura e Prove', 30, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Prepara discorso di ringraziamento', 'Rifinitura e Prove', 30, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Verifica dettagli logistici (trasporti, parcheggi)', 'Rifinitura e Prove', 30, 60),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 MESE PRIMA', 'Ordina bomboniere e favors finali', 'Rifinitura e Prove', 30, 70),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Ultima prova lettura Torah', 'Controlli Finali', 7, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Conferma orari con tutti fornitori', 'Controlli Finali', 7, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Ritira tallit e kippah', 'Controlli Finali', 7, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Prepara kit emergenza', 'Controlli Finali', 7, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Riconferma menu e allergie ospiti', 'Controlli Finali', 7, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), '1 SETTIMANA PRIMA', 'Stampa materiali grafici (menu, segnaposti)', 'Controlli Finali', 7, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Cerimonia in sinagoga - Aliyah alla Torah', 'Mazel Tov!', 0, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Lettura haftarah', 'Mazel Tov!', 0, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Benedizioni e discorso rabbino', 'Mazel Tov!', 0, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Kiddush post-cerimonia (se previsto)', 'Mazel Tov!', 0, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Trasferimento location festa', 'Mazel Tov!', 0, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Cocktail di benvenuto', 'Mazel Tov!', 0, 60),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Cena o pranzo celebrativo', 'Mazel Tov!', 0, 70),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Danze e intrattenimento', 'Mazel Tov!', 0, 80),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'GIORNO DELLA CELEBRAZIONE', 'Taglio torta e festeggiamenti', 'Mazel Tov!', 0, 90),
  
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Invia thank you cards a ospiti', 'Ringraziamenti e Ricordi', -1, 10),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Ricevi foto e video finali', 'Ringraziamenti e Ricordi', -7, 20),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Condividi ricordi con parenti lontani', 'Ringraziamenti e Ricordi', -7, 30),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Organizza donazione tzedakah', 'Ringraziamenti e Ricordi', -7, 40),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Completa pagamenti fornitori', 'Ringraziamenti e Ricordi', -7, 50),
  ((SELECT id FROM event_types WHERE slug = 'bar-mitzvah'), 'POST-EVENTO', 'Report finale budget', 'Ringraziamenti e Ricordi', -7, 60)
ON CONFLICT (type_id, title) DO NOTHING;
