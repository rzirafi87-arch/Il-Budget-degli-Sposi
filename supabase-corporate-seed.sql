-- =========================================
-- EVENTO AZIENDALE (CORPORATE) - SEED
-- =========================================
-- Evento: Meeting, convention, team building, gala aziendali
-- Budget stimato: €10.000 - €100.000+ (varia molto per dimensione)
-- Timeline: 4-6 mesi di preparazione
-- Budget type: Singolo (azienda paga, non split personale)

-- Insert event type
INSERT INTO event_types (slug, label)
VALUES ('corporate', 'Evento Aziendale')
ON CONFLICT (slug) DO NOTHING;

-- Get event type ID
DO $$
DECLARE
  v_type_id UUID;
  v_cat_planning UUID;
  v_cat_location UUID;
  v_cat_tech UUID;
  v_cat_catering UUID;
  v_cat_allestimento UUID;
  v_cat_speaker UUID;
  v_cat_teambuilding UUID;
  v_cat_comunicazione UUID;
  v_cat_foto UUID;
  v_cat_gadget UUID;
  v_cat_logistica UUID;
  v_cat_ospitalita UUID;
  v_cat_sicurezza UUID;
  v_cat_budget UUID;
BEGIN
  SELECT id INTO v_type_id FROM event_types WHERE slug = 'corporate';

  -- ========================================
  -- 1. PIANIFICAZIONE E PROJECT MANAGEMENT
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Pianificazione e Project Management', 10)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_planning;
  
  IF v_cat_planning IS NULL THEN
    SELECT id INTO v_cat_planning FROM categories WHERE type_id = v_type_id AND name = 'Pianificazione e Project Management';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_planning, 'Definizione obiettivi evento (team building, lancio prodotto, formazione, gala)', 10),
    (v_cat_planning, 'Scelta data e durata evento (mezza giornata, giornata intera, multi-day)', 20),
    (v_cat_planning, 'Brief iniziale con stakeholder aziendali', 30),
    (v_cat_planning, 'Coordinamento con event planner o agenzia specializzata', 40),
    (v_cat_planning, 'Timeline progetto e milestone', 50),
    (v_cat_planning, 'Budget approval e gestione spese', 60),
    (v_cat_planning, 'Assicurazione evento e coperture', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 2. LOCATION E SPAZI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Location e Spazi', 20)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_location;
  
  IF v_cat_location IS NULL THEN
    SELECT id INTO v_cat_location FROM categories WHERE type_id = v_type_id AND name = 'Location e Spazi';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_location, 'Ricerca e selezione venue (hotel congress center, villa, spazio industriale, outdoor)', 10),
    (v_cat_location, 'Affitto sale meeting / plenaria / breakout rooms', 20),
    (v_cat_location, 'Sopralluogo location e verifica capienza', 30),
    (v_cat_location, 'Verifica accessibilità e parcheggi', 40),
    (v_cat_location, 'Servizi WiFi ad alta velocità', 50),
    (v_cat_location, 'Sala regia / back office organizzatori', 60),
    (v_cat_location, 'Aree lounge e networking', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 3. TECNOLOGIA E AV (AUDIO VIDEO)
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Tecnologia e AV (Audio Video)', 30)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_tech;
  
  IF v_cat_tech IS NULL THEN
    SELECT id INTO v_cat_tech FROM categories WHERE type_id = v_type_id AND name = 'Tecnologia e AV (Audio Video)';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_tech, 'Noleggio proiettori, schermi LED, maxischermi', 10),
    (v_cat_tech, 'Impianto audio professionale e microfoni wireless', 20),
    (v_cat_tech, 'Service luci intelligenti e scenografie', 30),
    (v_cat_tech, 'Regia video live e streaming platform', 40),
    (v_cat_tech, 'Videoconferenza ibrida (partecipanti online + fisici)', 50),
    (v_cat_tech, 'App evento o piattaforma digitale per partecipanti', 60),
    (v_cat_tech, 'Supporto tecnico on-site', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 4. CATERING E F&B
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Catering e F&B', 40)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_catering;
  
  IF v_cat_catering IS NULL THEN
    SELECT id INTO v_cat_catering FROM categories WHERE type_id = v_type_id AND name = 'Catering e F&B';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_catering, 'Coffee break mattina e pomeriggio', 10),
    (v_cat_catering, 'Pranzo aziendale (buffet, servizio al tavolo, box lunch)', 20),
    (v_cat_catering, 'Aperitivo networking o cocktail serale', 30),
    (v_cat_catering, 'Cena di gala (se evento multi-day o celebrativo)', 40),
    (v_cat_catering, 'Open bar o beverage station', 50),
    (v_cat_catering, 'Menù personalizzati (vegetariano, vegano, intolleranze)', 60),
    (v_cat_catering, 'Servizio catering e personale sala', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 5. ALLESTIMENTO E BRAND IDENTITY
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Allestimento e Brand Identity', 50)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_allestimento;
  
  IF v_cat_allestimento IS NULL THEN
    SELECT id INTO v_cat_allestimento FROM categories WHERE type_id = v_type_id AND name = 'Allestimento e Brand Identity';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_allestimento, 'Scenografia palco e backdrop brandizzati', 10),
    (v_cat_allestimento, 'Rollup, totem, banner aziendali', 20),
    (v_cat_allestimento, 'Desk registrazione e accredito ospiti', 30),
    (v_cat_allestimento, 'Segnaletica direzionale e wayfinding', 40),
    (v_cat_allestimento, 'Allestimento tavoli con branded kit', 50),
    (v_cat_allestimento, 'Fiori e decorazioni eleganti corporate style', 60),
    (v_cat_allestimento, 'Area photo opportunity con logo aziendale', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 6. SPEAKER E CONTENUTI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Speaker e Contenuti', 60)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_speaker;
  
  IF v_cat_speaker IS NULL THEN
    SELECT id INTO v_cat_speaker FROM categories WHERE type_id = v_type_id AND name = 'Speaker e Contenuti';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_speaker, 'Ricerca e ingaggio speaker / relatori esterni', 10),
    (v_cat_speaker, 'Moderatore o conduttore professionista', 20),
    (v_cat_speaker, 'Preparazione presentazioni e slide deck', 30),
    (v_cat_speaker, 'Video istituzionali o spot aziendali', 40),
    (v_cat_speaker, 'Workshop facilitator o trainer', 50),
    (v_cat_speaker, 'Panel discussion o tavole rotonde', 60),
    (v_cat_speaker, 'Q&A e sessioni interattive', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 7. TEAM BUILDING E INTRATTENIMENTO
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Team Building e Intrattenimento', 70)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_teambuilding;
  
  IF v_cat_teambuilding IS NULL THEN
    SELECT id INTO v_cat_teambuilding FROM categories WHERE type_id = v_type_id AND name = 'Team Building e Intrattenimento';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_teambuilding, 'Attività team building (outdoor, indoor, creative)', 10),
    (v_cat_teambuilding, 'Giochi aziendali e ice breaker', 20),
    (v_cat_teambuilding, 'Spettacolo serale (band live, DJ, artisti)', 30),
    (v_cat_teambuilding, 'Gala dinner con premiazioni', 40),
    (v_cat_teambuilding, 'Awards ceremony / riconoscimenti dipendenti', 50),
    (v_cat_teambuilding, 'Esperienze uniche (chef show, wine tasting, escape room aziendale)', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 8. COMUNICAZIONE E MARKETING
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Comunicazione e Marketing', 80)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_comunicazione;
  
  IF v_cat_comunicazione IS NULL THEN
    SELECT id INTO v_cat_comunicazione FROM categories WHERE type_id = v_type_id AND name = 'Comunicazione e Marketing';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_comunicazione, 'Save the date digitale per partecipanti', 10),
    (v_cat_comunicazione, 'Inviti personalizzati e reminder', 20),
    (v_cat_comunicazione, 'Campagna email e comunicazione interna', 30),
    (v_cat_comunicazione, 'Social media strategy (hashtag, live posting)', 40),
    (v_cat_comunicazione, 'Ufficio stampa e comunicati', 50),
    (v_cat_comunicazione, 'Creazione landing page evento', 60),
    (v_cat_comunicazione, 'Post-evento recap e thank you', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 9. FOTO, VIDEO E DOCUMENTAZIONE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Foto, Video e Documentazione', 90)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_foto;
  
  IF v_cat_foto IS NULL THEN
    SELECT id INTO v_cat_foto FROM categories WHERE type_id = v_type_id AND name = 'Foto, Video e Documentazione';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_foto, 'Fotografo corporate per reportage evento', 10),
    (v_cat_foto, 'Videomaker per aftermovie aziendale', 20),
    (v_cat_foto, 'Riprese live streaming o webcast', 30),
    (v_cat_foto, 'Drone per riprese aeree location', 40),
    (v_cat_foto, 'Fotobooth brandizzato per ospiti', 50),
    (v_cat_foto, 'Editing video e consegna materiali', 60),
    (v_cat_foto, 'Galleria foto digitale condivisa', 70)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 10. GADGET E MATERIALI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Gadget e Materiali', 100)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_gadget;
  
  IF v_cat_gadget IS NULL THEN
    SELECT id INTO v_cat_gadget FROM categories WHERE type_id = v_type_id AND name = 'Gadget e Materiali';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_gadget, 'Welcome kit partecipanti (borsa, block notes, penna, USB)', 10),
    (v_cat_gadget, 'Gadget brandizzati (powerbank, bottiglie, t-shirt)', 20),
    (v_cat_gadget, 'Badge e lanyard personalizzati', 30),
    (v_cat_gadget, 'Cartelline e materiali stampati', 40),
    (v_cat_gadget, 'Omaggi o gift finali (vino, libri, prodotti aziendali)', 50),
    (v_cat_gadget, 'Packaging e confezionamento premium', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 11. LOGISTICA E TRASPORTI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Logistica e Trasporti', 110)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_logistica;
  
  IF v_cat_logistica IS NULL THEN
    SELECT id INTO v_cat_logistica FROM categories WHERE type_id = v_type_id AND name = 'Logistica e Trasporti';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_logistica, 'Trasferimenti aeroporto-hotel per ospiti VIP', 10),
    (v_cat_logistica, 'Navetta shuttle per partecipanti', 20),
    (v_cat_logistica, 'Noleggio bus o van aziendali', 30),
    (v_cat_logistica, 'Parcheggi riservati e valet service', 40),
    (v_cat_logistica, 'Coordinamento check-in hotel per ospiti fuori sede', 50),
    (v_cat_logistica, 'Transfer organizzati per attività team building', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 12. OSPITALITÀ E PERNOTTAMENTI
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Ospitalità e Pernottamenti', 120)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_ospitalita;
  
  IF v_cat_ospitalita IS NULL THEN
    SELECT id INTO v_cat_ospitalita FROM categories WHERE type_id = v_type_id AND name = 'Ospitalità e Pernottamenti';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_ospitalita, 'Prenotazione blocco camere hotel', 10),
    (v_cat_ospitalita, 'Room list e rooming list', 20),
    (v_cat_ospitalita, 'Welcome desk hotel per partecipanti', 30),
    (v_cat_ospitalita, 'Colazioni e servizi in hotel', 40),
    (v_cat_ospitalita, 'Upgrade per speaker e VIP', 50),
    (v_cat_ospitalita, 'Check-out coordinato', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 13. SICUREZZA E COMPLIANCE
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Sicurezza e Compliance', 130)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_sicurezza;
  
  IF v_cat_sicurezza IS NULL THEN
    SELECT id INTO v_cat_sicurezza FROM categories WHERE type_id = v_type_id AND name = 'Sicurezza e Compliance';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_sicurezza, 'Servizio sicurezza e vigilanza evento', 10),
    (v_cat_sicurezza, 'Gestione accrediti e badge elettronici', 20),
    (v_cat_sicurezza, 'Privacy policy e GDPR compliance', 30),
    (v_cat_sicurezza, 'Assicurazione RC organizzatore', 40),
    (v_cat_sicurezza, 'Permessi e autorizzazioni (se evento pubblico)', 50),
    (v_cat_sicurezza, 'Servizio medico o primo soccorso', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

  -- ========================================
  -- 14. GESTIONE BUDGET
  -- ========================================
  INSERT INTO categories (type_id, name, sort_order)
  VALUES (v_type_id, 'Gestione Budget', 140)
  ON CONFLICT (type_id, name) DO NOTHING
  RETURNING id INTO v_cat_budget;
  
  IF v_cat_budget IS NULL THEN
    SELECT id INTO v_cat_budget FROM categories WHERE type_id = v_type_id AND name = 'Gestione Budget';
  END IF;

  INSERT INTO subcategories (category_id, name, sort_order) VALUES
    (v_cat_budget, 'Budget totale approvato', 10),
    (v_cat_budget, 'Acconti fornitori e service provider', 20),
    (v_cat_budget, 'Spese impreviste e contingency', 30),
    (v_cat_budget, 'Saldi finali post-evento', 40),
    (v_cat_budget, 'Report finanziario e ROI evento', 50),
    (v_cat_budget, 'Riepilogo finale costi', 60)
  ON CONFLICT (category_id, name) DO NOTHING;

END $$;

-- ========================================
-- TIMELINE ITEMS
-- ========================================
INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order)
SELECT 
  (SELECT id FROM event_types WHERE slug = 'corporate'),
  '4-6 MESI PRIMA',
  'Definisci obiettivi evento con management',
  'Ideazione e Approvazione',
  150, -- ~5 mesi
  10
WHERE NOT EXISTS (
  SELECT 1 FROM timeline_items 
  WHERE type_id = (SELECT id FROM event_types WHERE slug = 'corporate')
  AND title = 'Definisci obiettivi evento con management'
);

INSERT INTO timeline_items (type_id, phase, title, description, days_before, sort_order) VALUES
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '4-6 MESI PRIMA', 'Stabilisci budget e approval interno', 'Ideazione e Approvazione', 150, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '4-6 MESI PRIMA', 'Seleziona data evitando conflitti aziendali', 'Ideazione e Approvazione', 150, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '4-6 MESI PRIMA', 'Identifica target partecipanti (n° persone, ruoli)', 'Ideazione e Approvazione', 150, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '4-6 MESI PRIMA', 'Decidi format evento (convention, team building, gala)', 'Ideazione e Approvazione', 150, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '4-6 MESI PRIMA', 'Ingaggia event planner o agenzia (se necessario)', 'Ideazione e Approvazione', 150, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Prenota location definitiva', 'Prenotazioni e Fornitori Principali', 90, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Conferma service AV e tecnologia', 'Prenotazioni e Fornitori Principali', 90, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Ingaggia speaker o relatori esterni', 'Prenotazioni e Fornitori Principali', 90, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Prenota catering e F&B', 'Prenotazioni e Fornitori Principali', 90, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Blocca camere hotel per ospiti', 'Prenotazioni e Fornitori Principali', 90, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Definisci concept scenografico e branding', 'Prenotazioni e Fornitori Principali', 90, 60),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '3 MESI PRIMA', 'Avvia comunicazione interna save-the-date', 'Prenotazioni e Fornitori Principali', 90, 70),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Finalizza agenda evento e timing sessioni', 'Contenuti e Dettagli Operativi', 60, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Prepara slide e contenuti presentazioni', 'Contenuti e Dettagli Operativi', 60, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Ordina gadget e materiali brandizzati', 'Contenuti e Dettagli Operativi', 60, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Conferma attività team building o entertainment', 'Contenuti e Dettagli Operativi', 60, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Invia inviti formali e gestisci RSVP', 'Contenuti e Dettagli Operativi', 60, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Coordina trasporti e logistica', 'Contenuti e Dettagli Operativi', 60, 60),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '2 MESI PRIMA', 'Pianifica riprese foto/video', 'Contenuti e Dettagli Operativi', 60, 70),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Sopralluogo finale location con tutti i fornitori', 'Rifinitura e Coordinamento', 30, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Verifica setup tecnico (audio, luci, video)', 'Rifinitura e Coordinamento', 30, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Prepara badge e welcome kit partecipanti', 'Rifinitura e Coordinamento', 30, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Riconferma menù catering e intolleranze', 'Rifinitura e Coordinamento', 30, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Testa piattaforma streaming (se evento ibrido)', 'Rifinitura e Coordinamento', 30, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Stampa materiali e segnaletica', 'Rifinitura e Coordinamento', 30, 60),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 MESE PRIMA', 'Brief finale con tutto lo staff', 'Rifinitura e Coordinamento', 30, 70),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Riconferma tutti i fornitori (orari, numeri, contatti)', 'Countdown Finale', 7, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Invia reminder finale a partecipanti', 'Countdown Finale', 7, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Prepara run of show dettagliato minuto per minuto', 'Countdown Finale', 7, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Versa saldi acconti rimanenti', 'Countdown Finale', 7, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Organizza prove tecniche e soundcheck', 'Countdown Finale', 7, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), '1 SETTIMANA PRIMA', 'Prepara emergency kit e piano B', 'Countdown Finale', 7, 60),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Setup location ore mattina presto', 'Execution Day', 0, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Test finale audio, video, luci', 'Execution Day', 0, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Accredito partecipanti e welcome desk', 'Execution Day', 0, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Esecuzione programma secondo run of show', 'Execution Day', 0, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Gestione imprevisti real-time', 'Execution Day', 0, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Networking e socializzazione guidata', 'Execution Day', 0, 60),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Chiusura evento e ringraziamenti', 'Execution Day', 0, 70),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'GIORNO EVENTO', 'Smontaggio e check-out location', 'Execution Day', 0, 80),
  
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Raccogli feedback partecipanti (survey)', 'Follow-up e Reportistica', -7, 10),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Ricevi foto e video finali da professionisti', 'Follow-up e Reportistica', -7, 20),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Crea aftermovie o recap video', 'Follow-up e Reportistica', -7, 30),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Invia thank you note a speaker e VIP', 'Follow-up e Reportistica', -7, 40),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Chiudi budget e report finanziario', 'Follow-up e Reportistica', -7, 50),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Condividi galleria foto con partecipanti', 'Follow-up e Reportistica', -7, 60),
  ((SELECT id FROM event_types WHERE slug = 'corporate'), 'POST-EVENTO', 'Report ROI e KPI evento per management', 'Follow-up e Reportistica', -7, 70)
ON CONFLICT (type_id, title) DO NOTHING;
