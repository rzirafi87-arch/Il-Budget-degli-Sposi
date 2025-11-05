-- ============================================================================
-- Seed SQL per Evento Charity/Gala
-- Eventi di beneficenza, gala, mostre, concerti, eventi culturali
-- ============================================================================

-- CATEGORIE E SOTTOCATEGORIE
INSERT INTO categories (event_id, name, display_order) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione e Organizzazione', 1),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Location e Allestimento', 2),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Catering e Bevande', 3),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Intrattenimento e Spettacolo', 4),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Tecnologia Audio/Video', 5),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione e Promozione', 6),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Raccolta Fondi', 7),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Fotografia e Video', 8),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Ospiti e VIP', 9),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Registrazione e Check-in', 10),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Trasporti e Logistica', 11),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Materiali e Gadget', 12),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Budget e Amministrazione', 13)
ON CONFLICT (event_id, name) DO NOTHING;

-- Sottocategorie: Pianificazione e Organizzazione
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Event planner/Organizzatore', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Coordinatore giorno evento', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Consulente fundraising', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Permessi e autorizzazioni', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Assicurazioni evento', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Materiali stampati/Programmi', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Segnaletica e indicazioni', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Sicurezza e staff', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Pianificazione e Organizzazione'), 'Altro (Pianificazione)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Location e Allestimento
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Affitto location/Sala', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Deposito cauzionale', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Arredamento e allestimento', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Decorazioni tema', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Fiori e centrotavola', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Illuminazione scenografica', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Palco/Pedana', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Tappeto rosso', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Location e Allestimento'), 'Altro (Location)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Catering e Bevande
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Servizio catering completo', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Aperitivo di benvenuto', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Cena di gala', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Dessert e dolci', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Bar e bevande', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Servizio sommelier', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Personale di sala', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Noleggio stoviglie/posate', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Catering e Bevande'), 'Altro (Catering)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Intrattenimento e Spettacolo
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Artisti/Performer principali', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Band/Orchestra', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'DJ', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Presentatore/Conduttore', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Spettacoli dal vivo', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Asta benefica', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Intrattenimento bambini', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Attività interattive', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Intrattenimento e Spettacolo'), 'Altro (Intrattenimento)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Tecnologia Audio/Video
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Impianto audio', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Schermi e proiettori', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Luci sceniche', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Regia audio/video', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Microfoni wireless', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Live streaming', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Registrazione evento', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Presentazioni multimediali', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Tecnologia Audio/Video'), 'Altro (A/V)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Comunicazione e Promozione
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Inviti personalizzati', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Sito web evento', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Social media marketing', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Ufficio stampa', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Pubblicità', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Materiale promozionale', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Newsletter', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Campagna email', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Comunicazione e Promozione'), 'Altro (Comunicazione)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Raccolta Fondi
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Sistema donazioni online', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Lotteria/Tombola', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Asta silenziosa', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Vendita merchandising', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Sponsor e partnership', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Benefattori VIP', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Gadget beneficenza', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Certificati donatori', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Raccolta Fondi'), 'Altro (Fundraising)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Fotografia e Video
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Fotografo professionista', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Videomaker', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Photobooth', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Drone riprese aeree', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Album foto evento', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Streaming live', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Time-lapse', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Editing video', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Fotografia e Video'), 'Altro (Foto/Video)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Ospiti e VIP
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Guest of honor', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Ospiti speciali', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Tavoli riservati VIP', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Lounge esclusiva', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Servizio limousine', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Security personale', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Gift bag ospiti', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Hospitality suite', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Ospiti e VIP'), 'Altro (VIP)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Registrazione e Check-in
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Sistema registrazione online', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Check-in desk', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Badge e pass', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Lista ospiti', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Tablet/Totem check-in', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Personale accoglienza', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Welcome pack', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Guardaroba', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Registrazione e Check-in'), 'Altro (Registrazione)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Trasporti e Logistica
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Navetta ospiti', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Parcheggio/Valet', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Trasporto materiali', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Trasporto artisti', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Coordinamento logistico', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Magazzino temporaneo', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Montaggio/Smontaggio', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Servizio taxi', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Trasporti e Logistica'), 'Altro (Trasporti)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Materiali e Gadget
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Merchandising evento', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Gadget promozionali', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Brochure e cataloghi', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Borse personalizzate', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Penne e blocchi notes', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Roll-up e banner', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Espositori', 7),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Materiale informativo', 8),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Materiali e Gadget'), 'Altro (Materiali)', 9)
ON CONFLICT (category_id, name) DO NOTHING;

-- Sottocategorie: Budget e Amministrazione
INSERT INTO subcategories (category_id, name, display_order) VALUES
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Riserva imprevisti', 1),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Spese amministrative', 2),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Consulenza fiscale', 3),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Software gestione evento', 4),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Contabilità', 5),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Report finanziari', 6),
  ((SELECT id FROM categories WHERE event_id = (SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1) AND name = 'Budget e Amministrazione'), 'Altro (Budget)', 7)
ON CONFLICT (category_id, name) DO NOTHING;

-- ============================================================================
-- TIMELINE ITEMS
-- ============================================================================

-- Fase 1: Pianificazione (12-18 mesi prima)
INSERT INTO timeline_items (event_id, phase, item, timing, completed) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Definire obiettivi e causa benefica', '12-18 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Formare comitato organizzatore', '12-18 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Stabilire budget totale', '12-18 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Scegliere data e orario', '12 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Prenotare location', '10-12 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Pianificazione', 'Assumere event planner (opzionale)', '10-12 mesi prima', false)
ON CONFLICT (event_id, phase, item) DO NOTHING;

-- Fase 2: Organizzazione (6-12 mesi prima)
INSERT INTO timeline_items (event_id, phase, item, timing, completed) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Definire tema e concept', '9-12 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Confermare artisti/intrattenimento', '9-12 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Prenotare catering', '8-10 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Avviare ricerca sponsor', '8-10 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Creare lista ospiti VIP', '8 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Lanciare campagna comunicazione', '6-8 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Prenotare servizi A/V', '6 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Organizzazione', 'Organizzare asta/lotteria', '6 mesi prima', false)
ON CONFLICT (event_id, phase, item) DO NOTHING;

-- Fase 3: Comunicazione (3-6 mesi prima)
INSERT INTO timeline_items (event_id, phase, item, timing, completed) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Inviare inviti cartacei/digitali', '4-6 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Attivare vendita biglietti online', '4-6 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Lanciare sito web evento', '4-5 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Campagna social media', '3-6 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Comunicati stampa', '3-4 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Comunicazione', 'Email marketing settimanale', '3-6 mesi prima', false)
ON CONFLICT (event_id, phase, item) DO NOTHING;

-- Fase 4: Preparazione (1-3 mesi prima)
INSERT INTO timeline_items (event_id, phase, item, timing, completed) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Finalizzare menù con catering', '2-3 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Confermare sponsor e donatori', '2-3 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Ordinare materiali e gadget', '2 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Pianificare allestimento location', '1-2 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Organizzare trasporti e logistica', '1-2 mesi prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Conferme ospiti e seating plan', '1 mese prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Prove tecniche A/V', '2-3 settimane prima', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Preparazione', 'Brief staff e volontari', '1-2 settimane prima', false)
ON CONFLICT (event_id, phase, item) DO NOTHING;

-- Fase 5: Evento e Follow-up
INSERT INTO timeline_items (event_id, phase, item, timing, completed) VALUES
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Allestimento location', 'Giorno prima/mattina evento', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Check-in ospiti e registrazione', 'Giorno evento - apertura', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Aperitivo di benvenuto', 'Giorno evento - inizio', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Cena di gala', 'Giorno evento - sera', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Intrattenimento e spettacoli', 'Giorno evento - durante', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Asta benefica e raccolta fondi', 'Giorno evento - durante', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Evento', 'Ringraziamenti e chiusura', 'Giorno evento - fine', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Follow-up', 'Smontaggio e pulizia', 'Giorno dopo', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Follow-up', 'Ringraziamenti ospiti e sponsor', '1 settimana dopo', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Follow-up', 'Condivisione foto/video evento', '2 settimane dopo', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Follow-up', 'Report finale raccolta fondi', '1 mese dopo', false),
  ((SELECT id FROM events WHERE user_id = auth.uid() AND type = 'charity-gala' LIMIT 1), 'Follow-up', 'Valutazione e feedback', '1-2 mesi dopo', false)
ON CONFLICT (event_id, phase, item) DO NOTHING;
