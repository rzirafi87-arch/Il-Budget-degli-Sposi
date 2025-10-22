-- Script per popolare il database con fornitori di esempio
-- Basato su tipologie comuni trovate su matrimonio.com e altri portali

-- Location & Catering - Lombardia
INSERT INTO suppliers (name, category, region, province, city, phone, email, website, description, verified) VALUES
('Villa Borromeo', 'Location & Catering', 'Lombardia', 'Milano', 'Senago', '+39 02 99010757', 'info@villaborromeo.it', 'https://www.villaborromeo.it', 'Affitto sala - Villa storica del 1600 con parco secolare, sale affrescate e servizio catering di alta qualità', true),
('Villa Borromeo', 'Location & Catering', 'Lombardia', 'Milano', 'Senago', '+39 02 99010757', 'info@villaborromeo.it', 'https://www.villaborromeo.it', 'Affitto sala - Villa storica del 1600 con parco secolare, sale affrescate e servizio catering di alta qualità', true),
('Castello di Rossino', 'Location & Catering', 'Lombardia', 'Lecco', 'Calolziocorte', '+39 0341 644444', 'info@castellodirossino.it', 'https://www.castellodirossino.it', 'Affitto sala - Castello medievale sul Lago di Como con vista mozzafiato e cucina gourmet', true),
('Tenuta La Morra', 'Location & Catering', 'Lombardia', 'Pavia', 'Vigevano', '+39 0381 72345', 'eventi@tenutalamorra.it', 'https://www.tenutalamorra.com', 'Affitto sala - Tenuta di campagna con limonaia e giardini, cucina tradizionale lombarda', true),
('Palazzo Monti', 'Location & Catering', 'Lombardia', 'Brescia', 'Brescia', '+39 030 234567', 'info@palazzomonti.it', 'https://www.palazzomonti.it', 'Affitto sala - Palazzo nobiliare nel centro storico con sale affrescate e terrazza panoramica', true),

-- Location & Catering - Lazio
('Villa Miani', 'Location & Catering', 'Lazio', 'Roma', 'Roma', '+39 06 3610811', 'info@villamiani.it', 'https://www.villamiani.it', 'Affitto sala - Villa liberty con vista su Roma, giardini pensili e cucina raffinata', true),
('Castello Orsini Odescalchi', 'Location & Catering', 'Lazio', 'Roma', 'Bracciano', '+39 06 99804348', 'info@odescalchi.it', 'https://www.odescalchi.it', 'Affitto sala - Castello sul lago di Bracciano, location esclusiva con storia secolare', true),
('Tenuta di Fiorano', 'Location & Catering', 'Lazio', 'Roma', 'Roma', '+39 06 7969343', 'eventi@tenutadifiorano.com', 'https://www.tenutadifiorano.com', 'Affitto sala - Tenuta di campagna alle porte di Roma con vigneti e cucina tipica laziale', true),

-- Location & Catering - Toscana
('Villa La Vedetta', 'Location & Catering', 'Toscana', 'Firenze', 'Firenze', '+39 055 681631', 'info@villavedettahotel.com', 'https://www.villavedettahotel.com', 'Affitto sala - Villa rinascimentale con vista panoramica su Firenze e Giardino di Boboli', true),
('Borgo Santo Pietro', 'Location & Catering', 'Toscana', 'Siena', 'Chiusdino', '+39 0577 751222', 'info@borgosantopietro.com', 'https://www.borgosantopietro.com', 'Affitto sala - Borgo medievale restaurato immerso nella campagna senese, luxury resort 5 stelle', true),
('Villa Medicea di Lilliano', 'Location & Catering', 'Toscana', 'Firenze', 'Bagno a Ripoli', '+39 055 621551', 'info@lilliano.com', 'https://www.lilliano.com', 'Affitto sala - Villa medicea del 1400 con affreschi originali e cucina toscana tradizionale', true),

-- Foto & Video - Varie regioni
('Studio Fotografico Bianchi', 'Foto & Video', 'Lombardia', 'Milano', 'Milano', '+39 02 76001234', 'info@studiobianchi.it', 'https://www.studiobianchi.it', 'Servizio fotografico - Fotografi professionisti con esperienza ventennale, stile reportage e artistico', true),
('Emotion Wedding Films', 'Foto & Video', 'Lazio', 'Roma', 'Roma', '+39 06 12345678', 'info@emotionfilms.it', 'https://www.emotionfilms.it', 'Video - Videografi specializzati in video emozionali cinematografici con drone', true),
('FotoArte Wedding', 'Foto & Video', 'Toscana', 'Firenze', 'Firenze', '+39 055 987654', 'info@fotoartewedding.com', 'https://www.fotoartewedding.com', 'Servizio fotografico - Servizio fotografico completo con album artigianale e stampe fine art', true),
('Vision Wedding Studio', 'Foto & Video', 'Campania', 'Napoli', 'Napoli', '+39 081 234567', 'info@visionwedding.it', 'https://www.visionwedding.it', 'Servizio fotografico - Fotografi e videografi, pacchetti completi con album e video', true),
('Sky Vision Drone', 'Foto & Video', 'Lombardia', 'Milano', 'Milano', '+39 02 87654321', 'info@skyvisiondrone.it', 'https://www.skyvisiondrone.it', 'Drone - Servizio riprese aeree con drone 4K, piloti certificati ENAC', true),

-- Sposa - Atelier
('Atelier Pronovias Milano', 'Sposa', 'Lombardia', 'Milano', 'Milano', '+39 02 76002345', 'milano@pronovias.com', 'https://www.pronovias.com', 'Abito sposa - Collezioni esclusive Pronovias e Atelier Pronovias, personalizzazione su misura', true),
('Atelier Emé', 'Sposa', 'Lazio', 'Roma', 'Roma', '+39 06 6783456', 'roma@ateliereme.it', 'https://www.ateliereme.it', 'Abito sposa - Abiti da sposa romantici e classici, collezioni italiane di alta qualità', true),
('Nicole Milano', 'Sposa', 'Lombardia', 'Milano', 'Milano', '+39 02 48123456', 'info@nicolespose.com', 'https://www.nicolespose.com', 'Abito sposa - Stilisti italiani, linee fashion e classiche, personalizzazione completa', true),
('Rosa Clarà', 'Sposa', 'Lazio', 'Roma', 'Roma', '+39 06 3214567', 'roma@rosaclara.es', 'https://www.rosaclara.es', 'Abito sposa - Brand spagnolo di lusso, eleganza e raffinatezza, collezioni esclusive', true),
('Sì Sposaitalia', 'Sposa', 'Lombardia', 'Bergamo', 'Bergamo', '+39 035 123456', 'info@sisposaitalia.it', 'https://www.sisposaitalia.it', 'Abito sposa - Multimarca con oltre 200 abiti, diverse fasce di prezzo e stili', true),

-- Sposo - Sartorie
('Lubiam Sartoria', 'Sposo', 'Lombardia', 'Mantova', 'Mantova', '+39 0376 234567', 'info@lubiam.com', 'https://www.lubiam.com', 'Abito sposo - Sartoria italiana dal 1911, abiti su misura di alta qualità', true),
('Boggi Milano', 'Sposo', 'Lombardia', 'Milano', 'Milano', '+39 02 76123456', 'info@boggi.com', 'https://www.boggi.com', 'Abito sposo - Abiti eleganti su misura e prêt-à-porter, stile italiano contemporaneo', true),
('Corneliani', 'Sposo', 'Lombardia', 'Mantova', 'Mantova', '+39 0376 345678', 'info@corneliani.com', 'https://www.corneliani.com', 'Abito sposo - Eccellenza sartoriale italiana, abiti luxury su misura', true),

-- Fiori & Decor
('Fiori di Bagnasco', 'Fiori & Decor', 'Lombardia', 'Milano', 'Milano', '+39 02 89012345', 'info@fioridibagnasco.it', 'https://www.fioridibagnasco.it', 'Bouquet - Fioristi storici di Milano, allestimenti scenografici e bouquet personalizzati', true),
('Armando Feroci Fiori', 'Fiori & Decor', 'Lazio', 'Roma', 'Roma', '+39 06 6834567', 'info@armandoferoci.it', 'https://www.armandoferoci.it', 'Allestimenti - Maestro fiorista con allestimenti da sogno per matrimoni luxury', true),
('Il Profumo dei Fiori', 'Fiori & Decor', 'Toscana', 'Firenze', 'Firenze', '+39 055 234567', 'info@ilprofumodeiori.com', 'https://www.ilprofumodeiori.com', 'Centrotavola - Creazioni floreali eleganti e romantiche, fiori di stagione e rari', true),
('Verde Verticale', 'Fiori & Decor', 'Lombardia', 'Milano', 'Milano', '+39 02 91234567', 'info@verdeverticale.it', 'https://www.verdeverticale.it', 'Allestimenti - Allestimenti greenery e boho-chic, pareti verdi e giardini sospesi', true),

-- Musica & Intrattenimento
('Guty & Simone Live Music', 'Musica & Intrattenimento', 'Lombardia', 'Milano', 'Milano', '+39 02 76543210', 'info@gutyesimone.it', 'https://www.gutyesimone.it', 'DJ / Band - Duo pianoforte e voce, repertorio internazionale per cerimonia e ricevimento', true),
('Made in Italy Band', 'Musica & Intrattenimento', 'Lazio', 'Roma', 'Roma', '+39 06 12378945', 'info@madeinitalyband.it', 'https://www.madeinitalyband.it', 'DJ / Band - Band di 6 elementi con repertorio italiano e internazionale, energia e coinvolgimento', true),
('DJ Marco Esposito', 'Musica & Intrattenimento', 'Campania', 'Napoli', 'Napoli', '+39 081 765432', 'info@djmarcoesposito.com', 'https://www.djmarcoesposito.com', 'DJ / Band - DJ professionista con esperienza ventennale, selezione musicale personalizzata', true),

-- Inviti & Stationery
('Partecipazioni Matrimonio.it', 'Inviti & Stationery', 'Lombardia', 'Milano', 'Milano', '+39 02 34567890', 'info@partecipazionimatrimonio.it', 'https://www.partecipazionimatrimonio.it', 'Partecipazioni - Partecipazioni personalizzate, stampa tipografica e digitale, grafica su misura', true),
('Rossi1931', 'Inviti & Stationery', 'Toscana', 'Firenze', 'Firenze', '+39 055 876543', 'info@rossi1931.com', 'https://www.rossi1931.com', 'Partecipazioni - Stamperia storica fiorentina, carta pregiata e tecniche artigianali', true),
('Cartoleria Fiorentina', 'Inviti & Stationery', 'Toscana', 'Firenze', 'Firenze', '+39 055 234890', 'info@cartoleriafiorentina.it', 'https://www.cartoleriafiorentina.it', 'Calligrafia - Calligrafia a mano su partecipazioni, tableau e segnaposto, stile elegante', true),

-- Beauty & Benessere
('Mario Marietti Hair Stylist', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 45678901', 'info@mariomarietti.com', 'https://www.mariomarietti.com', 'Parrucchiera - Hair stylist delle star, acconciature da sposa eleganti e moderne', true),
('Atelier Beauty Sposa', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 45678910', 'info@atelierbeauty.it', 'https://www.atelierbeauty.it', 'Make-up - Make-up artist professionista, trucco sposa naturale o glamour con prova', true),
('Estetica Dolce Vita', 'Beauty & Benessere', 'Toscana', 'Firenze', 'Firenze', '+39 055 765432', 'info@dolcevitaestetica.it', 'https://www.dolcevitaestetica.it', 'Estetista - Trattamenti viso e corpo pre-matrimonio, pacchetti sposa completi', true),

-- Bomboniere & Regali
('Dolci Momenti Bomboniere', 'Bomboniere & Regali', 'Campania', 'Napoli', 'Napoli', '+39 081 987654', 'info@dolcimomenti.it', 'https://www.dolcimomenti.it', 'Bomboniere - Bomboniere artigianali napoletane, confetti Sulmona e packaging elegante', true),
('La Bottega delle Bomboniere', 'Bomboniere & Regali', 'Lombardia', 'Milano', 'Milano', '+39 02 67890123', 'info@bottegabomboniere.it', 'https://www.bottegabomboniere.it', 'Bomboniere - Vasta scelta di bomboniere classiche e moderne, personalizzazione inclusa', true),

-- Trasporti
('Milan Luxury Cars', 'Trasporti', 'Lombardia', 'Milano', 'Milano', '+39 02 78901234', 'info@milanluxurycars.it', 'https://www.milanluxurycars.it', 'Auto sposi - Noleggio auto d''epoca e luxury: Rolls Royce, Bentley, Ferrari, con autista', true),
('Auto Sposi Roma', 'Trasporti', 'Lazio', 'Roma', 'Roma', '+39 06 89012345', 'info@autosposiroma.it', 'https://www.autosposiroma.it', 'Auto sposi - Flotta di auto d''epoca restaurate, Fiat 500, Mercedes, con decorazioni floreali', true),
('Shuttle Wedding Service', 'Trasporti', 'Lombardia', 'Milano', 'Milano', '+39 02 90123456', 'info@shuttlewedding.it', 'https://www.shuttlewedding.it', 'Navette ospiti - Servizio navetta per ospiti con minibus e pullman, autisti professionali', true),

-- Viaggio di nozze
('Viaggi di Nozze Paradise', 'Viaggio di nozze', 'Lombardia', 'Milano', 'Milano', '+39 02 12345098', 'info@viaggidinozzeparadise.it', 'https://www.viaggidinozzeparadise.it', 'Quota viaggio - Agenzia specializzata in viaggi di nozze, destinazioni esotiche e luxury', true),
('Honeymoon Travel', 'Viaggio di nozze', 'Lazio', 'Roma', 'Roma', '+39 06 23456789', 'info@honeymoontravel.it', 'https://www.honeymoontravel.it', 'Quota viaggio - Pacchetti all-inclusive per Maldive, Seychelles, Polinesia e Caraibi', true);
