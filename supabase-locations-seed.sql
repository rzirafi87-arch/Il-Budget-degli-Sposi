-- Seed data for locations table
-- Variety of Italian wedding venues across different regions

INSERT INTO locations (name, region, province, city, address, phone, email, website, description, capacity_min, capacity_max, verified) VALUES

-- Lazio
('Villa Miani', 'Lazio', 'Roma', 'Roma', 'Via Trionfale, 151', '+39 06 3574 8800', 'info@villamiani.it', 'https://www.villamiani.it', 'Villa - Villa storica con vista mozzafiato su Roma, giardini secolari e sale affrescate. Ideale per matrimoni eleganti.', 50, 300, true),
('Castello Odescalchi', 'Lazio', 'Roma', 'Bracciano', 'Piazza Mazzini, 14', '+39 06 9980 4348', 'eventi@odescalchi.it', 'https://www.odescalchi.it', 'Castello - Castello medievale sul Lago di Bracciano, location da sogno per matrimoni principeschi.', 100, 400, true),
('Tenuta di Polline', 'Lazio', 'Roma', 'Soriano nel Cimino', 'Via della Polline, 1', '+39 0761 7456', 'info@tenutadipolline.it', 'https://www.tenutadipolline.it', 'Tenuta - Tenuta immersa nel verde con piscina, perfetta per matrimoni all''aperto.', 30, 150, true),

-- Toscana
('Borgo Santo Pietro', 'Toscana', 'Siena', 'Chiusdino', 'Loc. Palazzetto', '+39 0577 751 222', 'info@borgosantopietro.com', 'https://www.borgosantopietro.com', 'Borgo - Relais di lusso in un borgo medievale del 1200, con giardini botanici e spa.', 20, 100, true),
('Castello di Vincigliata', 'Toscana', 'Firenze', 'Fiesole', 'Via di Vincigliata, 23', '+39 055 5978', 'info@vincigliata.com', 'https://www.vincigliata.com', 'Castello - Castello medievale con vista panoramica su Firenze, location esclusiva.', 50, 200, true),
('Villa La Vedetta', 'Toscana', 'Firenze', 'Firenze', 'Viale Michelangiolo, 78', '+39 055 681631', 'events@villalavedettahotel.com', 'https://www.villalavedettahotel.com', 'Villa - Hotel 5 stelle con terrazza panoramica sulla città, rooftop pool e giardini.', 40, 180, true),
('Agriturismo Poggio Covili', 'Toscana', 'Siena', 'Montalcino', 'Podere Covili, 5', '+39 0577 848 502', 'info@poggiocovili.com', 'https://www.poggiocovili.com', 'Agriturismo - Agriturismo nelle colline senesi, atmosfera rustica e autentica.', 30, 120, true),

-- Lombardia
('Villa Erba', 'Lombardia', 'Como', 'Cernobbio', 'Largo Luchino Visconti, 4', '+39 031 3491', 'info@villaerba.it', 'https://www.villaerba.it', 'Villa - Villa liberty sul Lago di Como, giardini botanici e sale eleganti.', 60, 300, true),
('Castello di Rossino', 'Lombardia', 'Lecco', 'Calolziocorte', 'Via Castello, 1', '+39 0341 644122', 'info@castellorossino.it', 'https://www.castellorossino.it', 'Castello - Castello medievale con vista sul Lago di Como e le montagne.', 50, 250, true),
('Villa Necchi Campiglio', 'Lombardia', 'Milano', 'Milano', 'Via Mozart, 14', '+39 02 7634 0121', 'eventi@villanecchi.it', 'https://www.fondoambiente.it/luoghi/villa-necchi-campiglio', 'Villa - Villa razionalista degli anni ''30 con giardino segreto nel cuore di Milano.', 30, 150, true),

-- Campania
('Belmond Hotel Caruso', 'Campania', 'Salerno', 'Ravello', 'Piazza San Giovanni del Toro, 2', '+39 089 858801', 'reservations.car@belmond.com', 'https://www.belmond.com/hotels/europe/italy/amalfi-coast/belmond-hotel-caruso', 'Hotel - Hotel 5 stelle a Ravello con terrazza panoramica sulla Costiera Amalfitana.', 20, 120, true),
('Villa Cimbrone', 'Campania', 'Salerno', 'Ravello', 'Via Santa Chiara, 26', '+39 089 857459', 'info@villacimbrone.com', 'https://www.villacimbrone.com', 'Villa - Villa storica con il famoso Terrazzo dell''Infinito e giardini romantici.', 30, 150, true),
('Tenuta Astroni', 'Campania', 'Napoli', 'Napoli', 'Via Astroni, 468', '+39 081 5880604', 'info@tenutaastronimondragone.it', 'https://www.tenutaastronimondragone.it', 'Tenuta - Tenuta storica nel Cratere degli Astroni, location green nel cuore di Napoli.', 50, 250, true),

-- Puglia
('Masseria Torre Maizza', 'Puglia', 'Brindisi', 'Savelletri di Fasano', 'Contrada Coccaro', '+39 080 482 7838', 'info@masseriatorremmaizza.com', 'https://www.roccofortehotels.com/hotels-and-resorts/masseria-torre-maizza', 'Masseria - Masseria fortificata del XVI secolo, resort di lusso con uliveti secolari.', 40, 200, true),
('Borgo Egnazia', 'Puglia', 'Brindisi', 'Savelletri di Fasano', 'Contrada Masciola', '+39 080 225 5000', 'info@borgoegnazia.com', 'https://www.borgoegnazia.com', 'Borgo - Borgo pugliese di lusso ispirato all''architettura tradizionale, spa e spiaggia privata.', 50, 300, true),
('Masseria San Domenico', 'Puglia', 'Brindisi', 'Savelletri di Fasano', 'Litoranea 379, Km 27', '+39 080 482 7769', 'info@masseriasandomenico.com', 'https://www.masseriasandomenico.com', 'Masseria - Masseria del XV secolo trasformata in resort 5 stelle, con campo da golf.', 30, 180, true),

-- Sicilia
('Villa Sant''Andrea', 'Sicilia', 'Messina', 'Taormina Mare', 'Via Nazionale, 137', '+39 0942 23125', 'info@villasantandrea.com', 'https://www.villasantandrea.com', 'Villa - Hotel boutique sulla baia di Taormina, spiaggia privata e vista sull''Etna.', 30, 120, true),
('Castello degli Schiavi', 'Sicilia', 'Catania', 'Fiumefreddo di Sicilia', 'Contrada Solicchiata', '+39 095 646194', 'info@castellodeglischiavi.it', 'https://www.castellodeglischiavi.it', 'Castello - Castello settecentesco tra le pendici dell''Etna, set del film "Il Padrino".', 50, 250, true),
('Baglio Oneto', 'Sicilia', 'Trapani', 'Marsala', 'Contrada Baronazzo Amafi', '+39 0923 746222', 'info@bagliooneto.it', 'https://www.bagliooneto.it', 'Baglio - Resort & Wines in un baglio del 1700, vigneti e cantina storica.', 40, 200, true),

-- Veneto
('Villa Valmarana Morosini', 'Veneto', 'Venezia', 'Altivole', 'Via Guizzetti, 21', '+39 0423 567014', 'info@villavalmaranamorosini.it', 'https://www.villavalmaranamorosini.it', 'Villa - Villa veneta del 1600 con barchesse affrescate e parco secolare.', 50, 300, true),
('Ca'' Sagredo Hotel', 'Veneto', 'Venezia', 'Venezia', 'Campo Santa Sofia, 4198/99', '+39 041 241 3111', 'info@casagredohotel.com', 'https://www.casagredohotel.com', 'Palazzo - Palazzo del XV secolo sul Canal Grande, affreschi di Tiepolo e Longhi.', 30, 150, true),

-- Emilia-Romagna
('Palazzo di Varignana', 'Emilia-Romagna', 'Bologna', 'Varignana', 'Via Ca'' Masino, 611A', '+39 051 1993 0611', 'info@palazzodivarignana.com', 'https://www.palazzodivarignana.com', 'Resort - Resort & Spa nelle colline bolognesi, vigneti e uliveti biologici.', 40, 200, true),

-- Piemonte
('Castello di Guarene', 'Piemonte', 'Cuneo', 'Guarene', 'Via Aldo Moro, 4', '+39 0173 611521', 'info@castelloguarene.com', 'https://www.castelloguarene.com', 'Castello - Castello settecentesco nelle Langhe, relais di charme tra vigneti UNESCO.', 30, 120, true),
('Villa Grazia Deledda', 'Piemonte', 'Torino', 'Rivoli', 'Strada Rivoli-Giaveno, 21', '+39 011 9587888', 'info@villagraziaddeledda.it', 'https://www.villagraziaddeledda.it', 'Villa - Villa liberty con parco di 20.000 mq, vista sulle Alpi e Torino.', 40, 250, true);
