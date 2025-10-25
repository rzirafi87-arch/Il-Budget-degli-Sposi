-- Seed per categoria "Catering" separata da Location
-- Servizi di ristorazione e banqueting per matrimoni
-- Da eseguire DOPO supabase-suppliers-seed.sql

INSERT INTO suppliers (name, category, region, province, city, phone, email, website, description, verified) VALUES

-- Lombardia
('Bon Ton di Pietrini', 'Catering', 'Lombardia', 'Milano', 'Milano', '+39 02 4547 1234', 'info@bontonpietrini.it', 'https://www.bontonpietrini.it', 'Banqueting - Catering di alta gamma per matrimoni luxury, cucina gourmet e servizio impeccabile con mise en place elegante', true),
('Catering Classico Milano', 'Catering', 'Lombardia', 'Milano', 'Milano', '+39 02 7654 3210', 'info@cateringclassico.it', 'https://www.cateringclassicomilano.it', 'Buffet - Buffet ricchi e variegati, cucina tradizionale lombarda e internazionale, servizio completo', true),
('La Dolce Vita Banqueting', 'Catering', 'Lombardia', 'Brescia', 'Brescia', '+39 030 2234567', 'info@dolcevitabanqueting.it', 'https://www.dolcevitacatering.it', 'Banqueting - Servizio catering luxury con chef stellati, menù personalizzati e presentazioni creative', true),
('Sapori di Lago Catering', 'Catering', 'Lombardia', 'Como', 'Como', '+39 031 5678901', 'info@saporidilago.it', 'https://www.saporidicatering.it', 'Servizio al tavolo - Catering specializzato in pesce di lago e cucina contemporanea, per matrimoni sul lago', true),

-- Lazio - Roma
('Antico Pigneto Catering', 'Catering', 'Lazio', 'Roma', 'Roma', '+39 06 7012 3456', 'info@anticopigneto.it', 'https://www.anticopignetocatering.it', 'Banqueting - Cucina romana autentica, carbonara gourmet, cacio e pepe e amatriciana preparate live', true),
('Roma Luxury Catering', 'Catering', 'Lazio', 'Roma', 'Roma', '+39 06 4512 7890', 'info@romaluxury.it', 'https://www.romaluxurycatering.it', 'Banqueting - Catering di altissimo livello con chef internazionali, menù fusion e servizio premium', true),
('Le Delizie Romane', 'Catering', 'Lazio', 'Roma', 'Roma', '+39 06 3456 7890', 'info@delizieromane.it', 'https://www.ledelizieromane.it', 'Buffet - Buffet tradizionali romani, porchetta, supplì, pinsa e dolci tipici fatti in casa', true),
('Bon Appétit Catering Roma', 'Catering', 'Lazio', 'Roma', 'Roma', '+39 06 8765 4321', 'info@bonappetitroma.it', 'https://www.bonappetitcateringroma.it', 'Servizio al tavolo - Cucina francese e italiana, servizio al tavolo elegante, mise en place raffinata', true),

-- Toscana
('Chianti Catering', 'Catering', 'Toscana', 'Firenze', 'Greve in Chianti', '+39 055 8537 890', 'info@chianticatering.it', 'https://www.chianticatering.it', 'Banqueting - Cucina toscana gourmet, bistecche alla fiorentina, pici e vini locali del Chianti', true),
('Sapori di Toscana Catering', 'Catering', 'Toscana', 'Firenze', 'Firenze', '+39 055 2345 678', 'info@saporiditoscana.it', 'https://www.saporiditoscanacatering.it', 'Buffet - Antipasti toscani, ribollita, pappa al pomodoro, cantucci e vin santo', true),
('Il Tartufo Bianco Catering', 'Catering', 'Toscana', 'Siena', 'San Gimignano', '+39 0577 940 123', 'info@tartufobianco.it', 'https://www.tartufobiancobanchetti.it', 'Banqueting - Specialità al tartufo bianco, menù gourmet con prodotti DOP e IGP toscani', true),
('Mare e Monti Catering Toscana', 'Catering', 'Toscana', 'Livorno', 'Livorno', '+39 0586 876 543', 'info@maremonti.catering.it', 'https://www.maremontitoscana.it', 'Servizio al tavolo - Fusion mare-terra: cacciucco livornese, grigliate di pesce e carni pregiate', true),

-- Campania
('Amalfi Coast Catering', 'Catering', 'Campania', 'Salerno', 'Positano', '+39 089 812 345', 'info@amalficoastcatering.it', 'https://www.amalficoastcatering.it', 'Banqueting - Catering luxury per matrimoni in Costiera, pesce fresco, limoncello fatto in casa', true),
('Sapori Napoletani Catering', 'Catering', 'Campania', 'Napoli', 'Napoli', '+39 081 5512 345', 'info@sapornapoletani.it', 'https://www.saporinapoletanicatering.it', 'Buffet - Pizza napoletana gourmet, frittura di pesce, babà e sfogliatelle fresche', true),
('Vesuvio Banqueting', 'Catering', 'Campania', 'Napoli', 'Napoli', '+39 081 7778 901', 'info@vesuviobanqueting.it', 'https://www.vesuviobanqueting.it', 'Banqueting - Cucina campana raffinata, paccheri agli scampi, parmigiana di melanzane gourmet', true),
('Costa del Cilento Catering', 'Catering', 'Campania', 'Salerno', 'Paestum', '+39 0828 123 456', 'info@cilentocatering.it', 'https://www.costadelcilentocatering.it', 'Servizio al tavolo - Cucina cilentana con prodotti locali, mozzarella di bufala DOP, alici di menaica', true),

-- Puglia
('Masseria Catering Puglia', 'Catering', 'Puglia', 'Bari', 'Polignano a Mare', '+39 080 4251 234', 'info@masseriacatering.it', 'https://www.masseriacateringpuglia.it', 'Banqueting - Cucina pugliese autentica nelle masserie, orecchiette fatte a mano, burrata e vini primitivo', true),
('Salento Food Experience', 'Catering', 'Puglia', 'Lecce', 'Lecce', '+39 0832 307 890', 'info@salentofood.it', 'https://www.salentofoodcatering.it', 'Buffet - Street food pugliese gourmet: panzerotti, rustici, pasticciotti e focaccia barese', true),
('Trulli Banqueting', 'Catering', 'Puglia', 'Bari', 'Alberobello', '+39 080 4323 456', 'info@trullibanqueting.it', 'https://www.trullibanqueting.it', 'Banqueting - Catering nelle zone dei trulli, bombette, capocollo e formaggi locali', true),

-- Veneto
('Venezia Gourmet Catering', 'Catering', 'Veneto', 'Venezia', 'Venezia', '+39 041 5287 654', 'info@veneziagourmet.it', 'https://www.veneziagourmetcatering.it', 'Banqueting - Cucina veneziana raffinata, sarde in saor, baccalà mantecato, risotto al nero di seppia', true),
('Catering Verona Romeo e Giulietta', 'Catering', 'Veneto', 'Verona', 'Verona', '+39 045 8003 456', 'info@cateringverona.it', 'https://www.cateringromeoegiulietta.it', 'Servizio al tavolo - Servizio romantico per matrimoni, cucina veronese, bigoli, pastissada de caval', true),
('Prosecco Hills Catering', 'Catering', 'Veneto', 'Treviso', 'Valdobbiadene', '+39 0423 975 123', 'info@proseccohillscatering.it', 'https://www.proseccohillscatering.it', 'Buffet - Degustazioni di Prosecco DOCG, buffet di cicchetti veneziani e dolci tipici', true),

-- Sicilia
('Sicilia Barocca Catering', 'Catering', 'Sicilia', 'Siracusa', 'Noto', '+39 0931 835 678', 'info@siciliabaroccacatering.it', 'https://www.siciliabaroccacatering.it', 'Banqueting - Catering luxury siciliano, arancini gourmet, pasta alla Norma, cannoli freschi', true),
('Taormina Food Catering', 'Catering', 'Sicilia', 'Messina', 'Taormina', '+39 0942 625 789', 'info@taorminafood.it', 'https://www.taorminafoodcatering.it', 'Servizio al tavolo - Cucina siciliana vista mare, pesce spada, caponata, cassata e granita', true),
('Street Food Palermo Catering', 'Catering', 'Sicilia', 'Palermo', 'Palermo', '+39 091 6170 234', 'info@streetfoodpa.it', 'https://www.streetfoodpalermocatering.it', 'Buffet - Street food palermitano gourmet: pane con panelle, sfincione, crocchè', true),
('Etna Catering Sicily', 'Catering', 'Sicilia', 'Catania', 'Catania', '+39 095 7151 234', 'info@etnacatering.it', 'https://www.etnacateringsicily.it', 'Banqueting - Cucina etnea con prodotti vulcanici, pasta al pistacchio di Bronte, vini dell''Etna', true),

-- Emilia-Romagna
('Bologna Food Valley Catering', 'Catering', 'Emilia-Romagna', 'Bologna', 'Bologna', '+39 051 6490 123', 'info@foodvalleycatering.it', 'https://www.bolognafoodvalley.it', 'Banqueting - Cucina emiliana autentica, tortellini in brodo, lasagne, mortadella e Parmigiano Reggiano', true),
('Riviera Romagnola Catering', 'Catering', 'Emilia-Romagna', 'Rimini', 'Rimini', '+39 0541 5678 901', 'info@rivieracatering.it', 'https://www.rivieraromagnolacatering.it', 'Buffet - Pesce adriatico fresco, piadina romagnola, sangiovese e albana', true),
('Parmigiano & Prosciutto Catering', 'Catering', 'Emilia-Romagna', 'Parma', 'Parma', '+39 0521 234 567', 'info@parmigianoprosciutto.it', 'https://www.parmacatering.it', 'Servizio al tavolo - Degustazioni di Parmigiano Reggiano DOP e Prosciutto di Parma, cucina ducale', true),

-- Piemonte
('Langhe Gourmet Catering', 'Catering', 'Piemonte', 'Cuneo', 'Alba', '+39 0173 442 123', 'info@langhegourmet.it', 'https://www.langhegourmetcatering.it', 'Banqueting - Cucina piemontese delle Langhe, tartufo bianco, brasato al Barolo, vini pregiati', true),
('Torino Elegance Catering', 'Catering', 'Piemonte', 'Torino', 'Torino', '+39 011 5678 901', 'info@torinoelegance.it', 'https://www.torinoelegancecatering.it', 'Servizio al tavolo - Servizio raffinato torinese, agnolotti del plin, vitello tonnato, bicerin', true),

-- Sardegna
('Catering Costa Smeralda', 'Catering', 'Sardegna', 'Sassari', 'Porto Cervo', '+39 0789 907 123', 'info@cateringcostasmeralda.it', 'https://www.cateringcostasmeralda.it', 'Banqueting - Cucina luxury sarda, aragosta alla catalana, bottarga, vini Vermentino e Cannonau', true),
('Sapori di Sardegna Catering', 'Catering', 'Sardegna', 'Cagliari', 'Cagliari', '+39 070 678 234', 'info@saporidisardegna.it', 'https://www.saporidisardegnacatering.it', 'Buffet - Cucina tradizionale sarda, porceddu, culurgiones, seadas e mirto', true);
