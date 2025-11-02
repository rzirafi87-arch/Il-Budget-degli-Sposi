-- Seed for Prima Comunione (communion)
-- Ensure event type exists
INSERT INTO event_types (slug, label)
VALUES ('communion', 'Comunione')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  v_type_id uuid;
  v_cat_id uuid;
BEGIN
  SELECT id INTO v_type_id FROM event_types WHERE slug = 'communion';

  -- Cerimonia religiosa
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Cerimonia religiosa')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Cerimonia religiosa';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Prenotazione chiesa / oratorio';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Prenotazione chiesa / oratorio'),
    (v_cat_id, 'Documentazione e incontro con il parroco'),
    (v_cat_id, 'Corso preparazione comunione'),
    (v_cat_id, 'Offerta parrocchia'),
    (v_cat_id, 'Permesso per fotografo in chiesa'),
    (v_cat_id, 'Fioraio per altare e panche'),
    (v_cat_id, 'Candele e simboli religiosi (croce, rosario, Bibbia, angioletto)'),
    (v_cat_id, 'Servizio fotografico in chiesa');
  END IF;

  -- Location e ricevimento
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Location e ricevimento')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Location e ricevimento';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Scelta location (ristorante, villa, giardino, casa privata)';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Scelta location (ristorante, villa, giardino, casa privata)'),
    (v_cat_id, 'Noleggio sala / spazio esterno'),
    (v_cat_id, 'Allestimento tavoli e mise en place'),
    (v_cat_id, 'Decorazioni a tema comunione (fiori, calice, spighe, colombe, elementi naturali)'),
    (v_cat_id, 'Tableau e segnaposti'),
    (v_cat_id, 'Bomboniere e confettata'),
    (v_cat_id, 'Tovagliato e stoviglie coordinate'),
    (v_cat_id, 'Allestimento angolo foto o backdrop');
  END IF;

  -- Catering / Ristorazione
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Catering / Ristorazione')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Catering / Ristorazione';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Pranzo o buffet (menù adulti e bambini)';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Pranzo o buffet (menù adulti e bambini)'),
    (v_cat_id, 'Aperitivo / antipasto di benvenuto'),
    (v_cat_id, 'Bevande e vini'),
    (v_cat_id, 'Torta di comunione personalizzata'),
    (v_cat_id, 'Pasticceria e dolci vari'),
    (v_cat_id, 'Servizio catering o ristorante');
  END IF;

  -- Abbigliamento e Beauty
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Abbigliamento e Beauty')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Abbigliamento e Beauty';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Abito comunione (bambino/a)';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Abito comunione (bambino/a)'),
    (v_cat_id, 'Scarpe e accessori'),
    (v_cat_id, 'Acconciatura / parrucchiere'),
    (v_cat_id, 'Abbigliamento genitori e fratelli'),
    (v_cat_id, 'Fiori o coroncina per capelli (bambina)');
  END IF;

  -- Foto e Video
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Foto e Video')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Foto e Video';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Fotografo in chiesa';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Fotografo in chiesa'),
    (v_cat_id, 'Servizio fotografico post-cerimonia'),
    (v_cat_id, 'Mini album o cornice digitale'),
    (v_cat_id, 'Videomaker o reel breve ricordo'),
    (v_cat_id, 'Polaroid corner o set selfie');
  END IF;

  -- Inviti e Grafica
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Inviti e Grafica')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Inviti e Grafica';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Partecipazioni / inviti cartacei o digitali';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Partecipazioni / inviti cartacei o digitali'),
    (v_cat_id, 'Biglietti di ringraziamento'),
    (v_cat_id, 'Coordinato grafico (menù, tableau, segnaposti)'),
    (v_cat_id, 'Cartellonistica personalizzata'),
    (v_cat_id, 'Tema grafico con simbolo religioso stilizzato (ostia, colomba, ramoscello d’ulivo)');
  END IF;

  -- Regali e Ringraziamenti
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Regali e Ringraziamenti')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Regali e Ringraziamenti';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Regali per il bambino/a';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Regali per il bambino/a'),
    (v_cat_id, 'Lista regali / busta simbolica'),
    (v_cat_id, 'Bomboniere / sacchetti / confettata'),
    (v_cat_id, 'Biglietti di ringraziamento personalizzati'),
    (v_cat_id, 'Omaggi per padrino / madrina');
  END IF;

  -- Intrattenimento
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Intrattenimento')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Intrattenimento';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Animazione bambini (giochi, bolle di sapone, trucca-bimbi, mago, clown)';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Animazione bambini (giochi, bolle di sapone, trucca-bimbi, mago, clown)'),
    (v_cat_id, 'Musica di sottofondo soft'),
    (v_cat_id, 'Mini spettacolo o giochi organizzati'),
    (v_cat_id, 'Angolo dolci o carretto gelati');
  END IF;

  -- Trasporti e Logistica
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Trasporti e Logistica')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Trasporti e Logistica';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Auto per famiglia';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Auto per famiglia'),
    (v_cat_id, 'Parcheggi ospiti'),
    (v_cat_id, 'Trasporto invitati da chiesa a location'),
    (v_cat_id, 'Permessi comunali o accesso centro storico');
  END IF;

  -- Gestione Budget (in-app)
  INSERT INTO categories (type_id, name)
  VALUES (v_type_id, 'Gestione Budget (in-app)')
  ON CONFLICT (type_id, name) DO NOTHING;
  SELECT id INTO v_cat_id FROM categories WHERE type_id = v_type_id AND name = 'Gestione Budget (in-app)';
  PERFORM 1 FROM subcategories WHERE category_id = v_cat_id AND name = 'Budget stimato';
  IF NOT FOUND THEN
    INSERT INTO subcategories (category_id, name) VALUES
    (v_cat_id, 'Budget stimato'),
    (v_cat_id, 'Acconti versati'),
    (v_cat_id, 'Saldi fornitori'),
    (v_cat_id, 'Spese extra / imprevisti'),
    (v_cat_id, 'Totale finale e differenza');
  END IF;
END $$;
