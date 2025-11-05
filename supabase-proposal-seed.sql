-- =========================================
-- PROPOSTA DI MATRIMONIO (PROPOSAL) - SEED
-- =========================================
-- Evento: Pianificazione richiesta di matrimonio romantica
-- Budget stimato: €8.000 - €15.000 (dipende da anello)
-- Timeline: 3-6 mesi di preparazione
-- Budget type: Singolo (chi propone paga)

-- Insert event type
INSERT INTO event_types (slug, label)
VALUES ('proposal', 'Proposta di Matrimonio')
ON CONFLICT (slug) DO NOTHING;

-- Get event type ID
DO $$
DECLARE
  v_type_id UUID;
  v_cat_pianificazione UUID;
  v_cat_anello UUID;
  v_cat_location UUID;
  v_cat_cena UUID;
  v_cat_foto UUID;
  v_cat_musica UUID;
  v_cat_trasporti UUID;
  v_cat_sorprese UUID;
  v_cat_outfit UUID;
  v_cat_comunicazione UUID;
  v_cat_budget UUID;
BEGIN
  SELECT id INTO v_type_id FROM event_types WHERE slug = 'proposal';

  -- ========================================
  -- 1. PIANIFICAZIONE E CONCEPT
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Pianificazione e Concept', 10)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_pianificazione;
  
  IF v_cat_pianificazione IS NULL THEN
    SELECT id INTO v_cat_pianificazione FROM categories WHERE type_id = v_type_id AND name = 'Pianificazione e Concept';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_pianificazione, 'Scelta della data ideale', 10),
    (v_cat_pianificazione, 'Location scouting (ristorante, spiaggia, montagna, casa, viaggio)', 20),
    (v_cat_pianificazione, 'Tema o stile della proposta (romantico, avventuroso, intimo, pubblico)', 30),
    (v_cat_pianificazione, 'Piano B in caso di maltempo', 40),
    (v_cat_pianificazione, 'Ricerca fotografo professionista', 50),
    (v_cat_pianificazione, 'Coordinamento con eventuali complici (amici, famiglia)', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 2. ANELLO DI FIDANZAMENTO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Anello di Fidanzamento', 20)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_anello;
  
  IF v_cat_anello IS NULL THEN
    SELECT id INTO v_cat_anello FROM categories WHERE type_id = v_type_id AND name = 'Anello di Fidanzamento';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_anello, 'Ricerca gioielliere o brand', 10),
    (v_cat_anello, 'Scelta modello anello (solitario, trilogy, vintage, personalizzato)', 20),
    (v_cat_anello, 'Acquisto o ordine anello', 30),
    (v_cat_anello, 'Incisione personalizzata (se prevista)', 40),
    (v_cat_anello, 'Assicurazione anello', 50),
    (v_cat_anello, 'Custodia o scatola elegante', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 3. LOCATION E ALLESTIMENTO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Location e Allestimento', 30)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_location;
  
  IF v_cat_location IS NULL THEN
    SELECT id INTO v_cat_location FROM categories WHERE type_id = v_type_id AND name = 'Location e Allestimento';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_location, 'Prenotazione location privata o pubblica', 10),
    (v_cat_location, 'Decorazioni floreali (petali, bouquet, arco di fiori)', 20),
    (v_cat_location, 'Candele, luci LED, lanterne o luminarie', 30),
    (v_cat_location, 'Tappeto o cuscini per inginocchiarsi', 40),
    (v_cat_location, 'Scritta luminosa Marry Me o simili', 50),
    (v_cat_location, 'Palloncini o altri elementi decorativi', 60),
    (v_cat_location, 'Servizio di allestimento professionale', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 4. CENA O CELEBRAZIONE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Cena o Celebrazione', 40)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_cena;
  
  IF v_cat_cena IS NULL THEN
    SELECT id INTO v_cat_cena FROM categories WHERE type_id = v_type_id AND name = 'Cena o Celebrazione';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_cena, 'Prenotazione ristorante o chef privato', 10),
    (v_cat_cena, 'Menù degustazione o cena romantica', 20),
    (v_cat_cena, 'Champagne o vino pregiato per brindisi', 30),
    (v_cat_cena, 'Torta o dolce celebrativo', 40),
    (v_cat_cena, 'Servizio catering se location privata', 50),
    (v_cat_cena, 'Sorpresa post-proposta (cena con famiglia/amici)', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 5. FOTO E VIDEO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Foto e Video', 50)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_foto;
  
  IF v_cat_foto IS NULL THEN
    SELECT id INTO v_cat_foto FROM categories WHERE type_id = v_type_id AND name = 'Foto e Video';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_foto, 'Fotografo per catturare il momento', 10),
    (v_cat_foto, 'Videomaker per video cinematografico', 20),
    (v_cat_foto, 'Drone per riprese aeree (se location outdoor)', 30),
    (v_cat_foto, 'Album fotografico o libro ricordo', 40),
    (v_cat_foto, 'Editing foto e video professionale', 50),
    (v_cat_foto, 'Stampa foto incorniciate', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 6. MUSICA E INTRATTENIMENTO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Musica e Intrattenimento', 60)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_musica;
  
  IF v_cat_musica IS NULL THEN
    SELECT id INTO v_cat_musica FROM categories WHERE type_id = v_type_id AND name = 'Musica e Intrattenimento';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_musica, 'Musicista dal vivo (violino, chitarra, cantante)', 10),
    (v_cat_musica, 'Playlist romantica personalizzata', 20),
    (v_cat_musica, 'Impianto audio per diffondere musica', 30),
    (v_cat_musica, 'Sorpresa musicale (flash mob, coro, serenata)', 40),
    (v_cat_musica, 'DJ per festa post-proposta', 50)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 7. TRASPORTI E LOGISTICA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Trasporti e Logistica', 70)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_trasporti;
  
  IF v_cat_trasporti IS NULL THEN
    SELECT id INTO v_cat_trasporti FROM categories WHERE type_id = v_type_id AND name = 'Trasporti e Logistica';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_trasporti, 'Auto di lusso o vintage per spostamenti', 10),
    (v_cat_trasporti, 'Autista privato', 20),
    (v_cat_trasporti, 'Elicottero o mongolfiera (se proposta speciale)', 30),
    (v_cat_trasporti, 'Trasferimenti aeroporto (se proposta in viaggio)', 40),
    (v_cat_trasporti, 'Parcheggio riservato', 50),
    (v_cat_trasporti, 'Coordinamento orari con tutti i fornitori', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 8. SORPRESE E EXTRA
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Sorprese e Extra', 80)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_sorprese;
  
  IF v_cat_sorprese IS NULL THEN
    SELECT id INTO v_cat_sorprese FROM categories WHERE type_id = v_type_id AND name = 'Sorprese e Extra';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_sorprese, 'Lettera d''amore personalizzata', 10),
    (v_cat_sorprese, 'Video montaggio La nostra storia', 20),
    (v_cat_sorprese, 'Regalo simbolico (oltre all''anello)', 30),
    (v_cat_sorprese, 'Messaggi da amici e parenti registrati', 40),
    (v_cat_sorprese, 'Scatola con ricordi della relazione', 50),
    (v_cat_sorprese, 'Fuochi d''artificio o stelle filanti', 60),
    (v_cat_sorprese, 'Proiezione su schermo o parete', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 9. OUTFIT E BEAUTY
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Outfit e Beauty', 90)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_outfit;
  
  IF v_cat_outfit IS NULL THEN
    SELECT id INTO v_cat_outfit FROM categories WHERE type_id = v_type_id AND name = 'Outfit e Beauty';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_outfit, 'Outfit per chi propone (abito elegante o casual chic)', 10),
    (v_cat_outfit, 'Outfit per il/la partner (coordinato o sorpresa)', 20),
    (v_cat_outfit, 'Parrucchiere e makeup artist (se previsto)', 30),
    (v_cat_outfit, 'Accessori (cravatta, scarpe, gioielli)', 40),
    (v_cat_outfit, 'Manicure/pedicure pre-evento', 50)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 10. COMUNICAZIONE E CONDIVISIONE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Comunicazione e Condivisione', 100)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_comunicazione;
  
  IF v_cat_comunicazione IS NULL THEN
    SELECT id INTO v_cat_comunicazione FROM categories WHERE type_id = v_type_id AND name = 'Comunicazione e Condivisione';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_comunicazione, 'Annuncio sui social media (foto/video)', 10),
    (v_cat_comunicazione, 'Biglietti d''invito per festa post-proposta', 20),
    (v_cat_comunicazione, 'Grafica personalizzata per annuncio', 30),
    (v_cat_comunicazione, 'Chiamate a famiglia e amici per comunicare la notizia', 40),
    (v_cat_comunicazione, 'Save the date per futuro matrimonio (opzionale)', 50),
    (v_cat_comunicazione, 'Album digitale condiviso con ospiti', 60)
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
    (v_cat_budget, 'Riepilogo finale spese', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

END $$;

-- ========================================
-- TIMELINE ITEMS
-- ========================================
INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order)
SELECT 
  (SELECT id FROM event_types WHERE slug = 'proposal'),
  '3-6 MESI PRIMA',
  'Decidi stile e concept della proposta',
  'Idea e Pianificazione Iniziale',
  135, -- ~4.5 mesi
  10
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_items 
  WHERE type_id = (SELECT id FROM event_types WHERE slug = 'proposal')
  AND title = 'Decidi stile e concept della proposta'
);

INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order) VALUES
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '3-6 MESI PRIMA', 'Stabilisci budget totale disponibile', 'Idea e Pianificazione Iniziale', 135, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '3-6 MESI PRIMA', 'Inizia ricerca anello (visite gioiellerie, online)', 'Idea e Pianificazione Iniziale', 135, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '3-6 MESI PRIMA', 'Raccogli idee su Pinterest/Instagram per ispirazione', 'Idea e Pianificazione Iniziale', 135, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '3-6 MESI PRIMA', 'Individua location potenziali', 'Idea e Pianificazione Iniziale', 135, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '3-6 MESI PRIMA', 'Sonda preferenze partner (discretamente) su anelli e stile', 'Idea e Pianificazione Iniziale', 135, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Acquista anello di fidanzamento', 'Acquisti e Prenotazioni Principali', 75, 10),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Prenota location definitiva', 'Acquisti e Prenotazioni Principali', 75, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Ingaggia fotografo/videomaker', 'Acquisti e Prenotazioni Principali', 75, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Prenota ristorante o catering', 'Acquisti e Prenotazioni Principali', 75, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Conferma data con eventuali complici', 'Acquisti e Prenotazioni Principali', 75, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '2-3 MESI PRIMA', 'Ordina decorazioni personalizzate (se necessario)', 'Acquisti e Prenotazioni Principali', 75, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Conferma tutti i fornitori (foto, location, catering)', 'Dettagli e Coordinamento', 30, 10),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Organizza allestimento location (fiori, candele, luci)', 'Dettagli e Coordinamento', 30, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Scegli e prenota outfit per te (e partner se sorpresa)', 'Dettagli e Coordinamento', 30, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Prepara playlist musicale o conferma musicisti', 'Dettagli e Coordinamento', 30, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Scrivi lettera d''amore o discorso', 'Dettagli e Coordinamento', 30, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Verifica anello (misura, custodia, incisione)', 'Dettagli e Coordinamento', 30, 60),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 MESE PRIMA', 'Pianifica trasporti e logistica dettagliata', 'Dettagli e Coordinamento', 30, 70),
  
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Sopralluogo location per verificare tutto', 'Prove e Ultimi Controlli', 7, 10),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Prova generale con complici (se coinvolti)', 'Prove e Ultimi Controlli', 7, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Conferma orari con fotografo e fornitori', 'Prove e Ultimi Controlli', 7, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Ritira anello definitivo dal gioielliere', 'Prove e Ultimi Controlli', 7, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Prepara eventuali sorprese extra (video, regali)', 'Prove e Ultimi Controlli', 7, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), '1 SETTIMANA PRIMA', 'Controlla meteo e attiva piano B se necessario', 'Prove e Ultimi Controlli', 7, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Arrivo location con anticipo per setup finale', 'Il Grande Momento', 0, 10),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Verifica allestimento e decorazioni', 'Il Grande Momento', 0, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Controlla di avere anello con te', 'Il Grande Momento', 0, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Relax e goditi il momento', 'Il Grande Momento', 0, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'LA PROPOSTA! 🎉', 'Il Grande Momento', 0, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Brindisi e celebrazione', 'Il Grande Momento', 0, 60),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Foto e video ricordo', 'Il Grande Momento', 0, 70),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'GIORNO DELLA PROPOSTA', 'Cena romantica o festa con cari', 'Il Grande Momento', 0, 80),
  
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Annuncia fidanzamento a famiglia e amici', 'Celebrazione e Condivisione', -1, 10),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Condividi foto/video sui social (se desiderato)', 'Celebrazione e Condivisione', -1, 20),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Ricevi foto/video definitivi da professionisti', 'Celebrazione e Condivisione', -7, 30),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Ringrazia fornitori e complici', 'Celebrazione e Condivisione', -7, 40),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Inizia pianificazione matrimonio (se previsto)', 'Celebrazione e Condivisione', -7, 50),
  ((SELECT id FROM event_types WHERE slug = 'proposal'), 'POST-PROPOSTA', 'Goditi il momento da neo-fidanzati! 💕', 'Celebrazione e Condivisione', -7, 60)
ON CONFLICT (type_id, title) DO NOTHING;
