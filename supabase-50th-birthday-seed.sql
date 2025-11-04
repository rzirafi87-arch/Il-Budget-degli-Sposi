-- =====================================================
-- 50° COMPLEANNO EVENT SEED (compatibile Supabase/Node.js)
-- =====================================================

DO $$
DECLARE
  v_event_id UUID;
  v_event_id_text TEXT := 'UUID_50TH_EVENT';
  v_cat_id UUID;
BEGIN
  -- 1. Gestione ID evento: se il placeholder non è stato sostituito,
  --    creiamo l'evento e chiediamo di rilanciare lo script con l'ID reale.
  BEGIN
    v_event_id := v_event_id_text::uuid;
    RAISE NOTICE 'Utilizzo ID evento fornito: %', v_event_id;
  EXCEPTION WHEN invalid_text_representation THEN
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

    RAISE NOTICE 'Creato evento 50° compleanno con ID: %', v_event_id;
    RAISE NOTICE 'Sostituisci tutte le occorrenze di UUID_50TH_EVENT con questo ID e rilancia lo script per popolare categorie e sottocategorie.';
    RETURN;
  END;

  -- 2. Categorie e sottocategorie

  -- Concept e Location
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Concept e Location', 1, '🏛️')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Definizione tema', 0.00, 1, 'Moodboard oro, nude, sabbia, salvia'),
    (v_cat_id, 'Location esclusiva', 1500.00, 2, 'Villa, terrazza, resort o ristorante panoramico'),
    (v_cat_id, 'Allestimento elegante', 600.00, 3, 'Tavoli, tessuti, mise en place coordinata'),
    (v_cat_id, 'Decorazioni floreali', 450.00, 4, 'Bouquet tavoli, colonne fiorite, centrotavola'),
    (v_cat_id, 'Illuminazione scenografica', 300.00, 5, 'Luci calde, lanterne, candele'),
    (v_cat_id, 'Angolo ricordi/guestbook', 150.00, 6, 'Corner con foto, guestbook e props');

  -- Catering / Ristorazione
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Catering / Ristorazione', 2, '🍽️')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Cena placée gourmet', 1600.00, 1, 'Servizio completo con menù degustazione'),
    (v_cat_id, 'Aperitivo di benvenuto', 400.00, 2, 'Finger food, welcome drink, servizio in terrazza'),
    (v_cat_id, 'Torta personalizzata 50 anni', 280.00, 3, 'Torta a piani con elementi oro'),
    (v_cat_id, 'Degustazione vini selezionati', 350.00, 4, 'Abbinamento vini premium, champagne per brindisi'),
    (v_cat_id, 'Servizio catering/brigata sala', 450.00, 5, 'Personale, mise en place, coordinamento'),
    (v_cat_id, 'Corner digestivi & sigari', 150.00, 6, 'Amari, whisky, area sigari per ospiti');

  -- Inviti e Grafica
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Inviti e Grafica', 3, '💌')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Inviti premium', 150.00, 1, 'Stampa letterpress o inviti digitali animati'),
    (v_cat_id, 'Coordinato grafico', 120.00, 2, 'Menu, segnaposti, segnaletica coordinata'),
    (v_cat_id, 'Tableau e disposizione tavoli', 90.00, 3, 'Grafiche per posti e tavoli tematici'),
    (v_cat_id, 'Guestbook digitale / QR code', 60.00, 4, 'Raccolta foto/video dagli ospiti'),
    (v_cat_id, 'Welcome sign e cartellonistica', 80.00, 5, 'Pannelli ingresso, indicazioni, poster'),
    (v_cat_id, 'Biglietti di ringraziamento', 70.00, 6, 'Thank you cards post-evento');

  -- Foto e Video
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Foto e Video', 4, '📸')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Fotografo professionista', 700.00, 1, 'Reportage evento e momenti salienti'),
    (v_cat_id, 'Videomaker e storytelling', 550.00, 2, 'Video emozionale con montaggio finale'),
    (v_cat_id, 'Shooting pre-evento', 220.00, 3, 'Servizio fotografico dedicato festeggiato'),
    (v_cat_id, 'Polaroid / instant corner', 130.00, 4, 'Postazione libera per ospiti'),
    (v_cat_id, 'Album o cofanetto ricordi', 180.00, 5, 'Album stampato o digitale deluxe');

  -- Musica e Intrattenimento
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Musica e Intrattenimento', 5, '🎶')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'DJ / band live', 800.00, 1, 'Selezione lounge, dance, revival anni 70-90'),
    (v_cat_id, 'Presentatore / master of ceremony', 200.00, 2, 'Gestione brindisi, sorprese, momenti speciali'),
    (v_cat_id, 'Playlist su misura', 0.00, 3, 'Scaletta personalizzata per la serata'),
    (v_cat_id, 'Spettacolo luci / laser show', 250.00, 4, 'Highlight serata con effetti scenici'),
    (v_cat_id, 'Proiezione video “50 anni di ricordi”', 140.00, 5, 'Montaggio clip famiglia/amici e speech');

  -- Abbigliamento e Beauty
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Abbigliamento e Beauty', 6, '👔')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Outfit festeggiato/a', 350.00, 1, 'Abito su misura o sartoria di qualità'),
    (v_cat_id, 'Servizio sartoria/stylist', 120.00, 2, 'Consulenza look, prove e adattamenti'),
    (v_cat_id, 'Hair & make-up professionale', 180.00, 3, 'Trucco e acconciatura serata'),
    (v_cat_id, 'Accessori dedicati', 100.00, 4, 'Gioielli, pochette, scarpe, cravatta o papillon'),
    (v_cat_id, 'Trattamenti spa o barber', 130.00, 5, 'Relax pre-evento, rasatura o spa day');

  -- Regali e Ringraziamenti
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Regali e Ringraziamenti', 7, '🎁')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Lista desideri / raccolta fondi', 0.00, 1, 'Registry digitale o donazioni progetto'),
    (v_cat_id, 'Gift table / angolo regali', 70.00, 2, 'Allestimento area dedicata con display'),
    (v_cat_id, 'Bomboniere o gift bag', 200.00, 3, 'Box personalizzate, prodotti gourmet'),
    (v_cat_id, 'Thank-you gift per ospiti speciali', 120.00, 4, 'Regali dedicati famiglia e amici stretti'),
    (v_cat_id, 'Cartoline e note di ringraziamento', 60.00, 5, 'Messaggi personali scritti a mano');

  -- Intrattenimento Extra
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Intrattenimento Extra', 8, '🎭')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Corner degustazione / mixology', 180.00, 1, 'Sommelier o bartender dedicato'),
    (v_cat_id, 'Area lounge e cigar corner', 160.00, 2, 'Divanetti, tappeti, atmosfera soft'),
    (v_cat_id, 'Animazione per ospiti', 220.00, 3, 'Mentalista, caricaturista o performer'),
    (v_cat_id, 'Fuochi d’artificio freddi', 300.00, 4, 'Finale spettacolare senza fumo'),
    (v_cat_id, 'Esperienza signature', 190.00, 5, 'Degustazione whisky, sigari, cioccolato o distillati');

  -- Trasporti e Logistica
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Trasporti e Logistica', 9, '🚗')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Transfer festeggiato/a', 180.00, 1, 'Auto con autista o auto d’epoca'),
    (v_cat_id, 'Navetta ospiti', 240.00, 2, 'Servizio autobus/navette dedicato'),
    (v_cat_id, 'Pernottamento ospiti', 350.00, 3, 'Hotel o B&B per chi arriva da fuori'),
    (v_cat_id, 'Trasporto fornitori/allestimenti', 120.00, 4, 'Furgone, consegne e pick-up materiale'),
    (v_cat_id, 'Assistente logistica evento', 150.00, 5, 'Coordinamento tempistiche e flussi');

  -- Gestione Budget
  INSERT INTO categories (event_id, name, display_order, icon)
  VALUES (v_event_id, 'Gestione Budget', 10, '💶')
  RETURNING id INTO v_cat_id;

  INSERT INTO subcategories (category_id, name, estimated_cost, display_order, description) VALUES
    (v_cat_id, 'Budget stimato', 0.00, 1, 'Pianificazione iniziale budget totale'),
    (v_cat_id, 'Acconti versati', 0.00, 2, 'Monitoraggio acconti e caparre'),
    (v_cat_id, 'Saldi fornitori', 0.00, 3, 'Pagamenti finali e scadenze'),
    (v_cat_id, 'Spese extra / imprevisti', 0.00, 4, 'Margine per esigenze last minute'),
    (v_cat_id, 'Regali ricevuti', 0.00, 5, 'Controvalore doni ospiti'),
    (v_cat_id, 'Totale finale', 0.00, 6, 'Riepilogo spese consuntive');
END $$;
