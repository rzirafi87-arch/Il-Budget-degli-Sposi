-- Seed Messico: Eventi, categorie, subcategorie, fornitori, location, chiese, tradizioni

-- Eventi tipici
INSERT INTO events (name, country, total_budget, bride_initial_budget, groom_initial_budget) VALUES
  ('Boda en la playa', 'mx', 30000, 15000, 15000),
  ('Boda colonial', 'mx', 40000, 20000, 20000);

-- Categorie principali
INSERT INTO categories (name, country) VALUES
  ('Novia', 'mx'),
  ('Novio', 'mx'),
  ('Recepción y Banquete', 'mx'),
  ('Música y Animación', 'mx'),
  ('Tradiciones', 'mx'),
  ('Decoración', 'mx'),
  ('Fotografía y Video', 'mx'),
  ('Transporte', 'mx');

-- Subcategorie con tradizioni
INSERT INTO subcategories (name, category_id, country) VALUES
  ('Vestido de novia', (SELECT id FROM categories WHERE name='Novia' AND country='mx'), 'mx'),
  ('Traje de novio', (SELECT id FROM categories WHERE name='Novio' AND country='mx'), 'mx'),
  ('Mariachi', (SELECT id FROM categories WHERE name='Música y Animación' AND country='mx'), 'mx'),
  ('La Callejoneada', (SELECT id FROM categories WHERE name='Tradiciones' AND country='mx'), 'mx'),
  ('Lazo', (SELECT id FROM categories WHERE name='Tradiciones' AND country='mx'), 'mx'),
  ('Tarta nupcial', (SELECT id FROM categories WHERE name='Recepción y Banquete' AND country='mx'), 'mx'),
  ('Decoración floral', (SELECT id FROM categories WHERE name='Decoración' AND country='mx'), 'mx'),
  ('Fotógrafo', (SELECT id FROM categories WHERE name='Fotografía y Video' AND country='mx'), 'mx'),
  ('Transporte invitados', (SELECT id FROM categories WHERE name='Transporte' AND country='mx'), 'mx');

-- Fornitori tipici
INSERT INTO suppliers (name, type, country) VALUES
  ('Mariachi Los Reyes', 'musica', 'mx'),
  ('Floristería Azteca', 'decorazione', 'mx'),
  ('Fotografía Rivera', 'foto_video', 'mx'),
  ('Banquetes Playa Azul', 'banqueting', 'mx'),
  ('Transporte Cancun', 'trasporto', 'mx');

-- Location con dati completi e verificati quando possibile
INSERT INTO locations (name, region, province, city, address, phone, email, website, description, capacity_min, capacity_max, verified) VALUES
  (
    'Rosewood San Miguel de Allende',
    'Guanajuato',
    'San Miguel de Allende',
    'San Miguel de Allende',
    'Nemesio Diez 11, Zona Centro, 37700 San Miguel de Allende, Gto., Messico',
    '+52 415 152 9700',
    NULL,
    'https://www.rosewoodhotels.com/en/san-miguel-de-allende',
    'Hotel di lusso nel centro storico con cortili coloniali e terrazze panoramiche perfette per ricevimenti personalizzati.',
    50,
    300,
    true
  ),
  (
    'Nizuc Resort & Spa',
    'Quintana Roo',
    'Benito Juárez',
    'Cancún',
    'Blvd. Kukulcan Km 21.26, Punta Nizuc, 77500 Cancún, Q.R., Messico',
    '+52 998 891 5700',
    NULL,
    'https://www.nizuc.com',
    'Resort cinque stelle affacciato sul Mar dei Caraibi con spazi esclusivi per cerimonie sulla spiaggia e giardini tropicali.',
    30,
    250,
    true
  ),
  (
    'Hotel Xcaret Arte',
    'Quintana Roo',
    'Solidaridad',
    'Playa del Carmen',
    'Carretera Chetumal-Puerto Juárez Km 282, 77710 Playa del Carmen, Q.R., Messico',
    '+52 984 159 1635',
    NULL,
    'https://www.hotelxcaretarte.com',
    'Resort all inclusive dedicato all''arte messicana con location scenografiche tra fiumi sotterranei e spiagge private.',
    40,
    350,
    true
  ),
  (
    'Hacienda Tekik de Regil',
    'Yucatán',
    'Abalá',
    'Tekik de Regil',
    'Carretera Mérida-Muna Km 17, Tekik de Regil, 97825 Abalá, Yuc., Messico',
    NULL,
    NULL,
    'https://www.haciendatekik.com',
    'Storica hacienda del XIX secolo con cappella privata, giardini e cortili ideali per matrimoni all''aperto.',
    80,
    400,
    false
  ),
  (
    'Hacienda Sac Chich',
    'Yucatán',
    'Acanceh',
    'Acanceh',
    'Hacienda Sac Chich, 97380 Acanceh, Yuc., Messico',
    '+52 999 125 7400',
    NULL,
    'https://www.haciendasacchich.com',
    'Hacienda boutique immersa nella giungla con ambientazioni contemporanee e piscine scenografiche per eventi esclusivi.',
    40,
    200,
    true
  ),
  (
    'Hacienda San Antonio',
    'Colima',
    'Comala',
    'Comala',
    'Domicilio Conocido S/N, San Antonio, 28454 Comala, Col., Messico',
    '+52 312 313 8800',
    NULL,
    'https://www.haciendadesanantonio.com',
    'Tenuta ai piedi del vulcano Colima con giardini botanici e sale eleganti per ricevimenti di lusso.',
    20,
    150,
    true
  ),
  (
    'Las Mañanitas Garden Hotel & Spa',
    'Morelos',
    'Cuernavaca',
    'Cuernavaca',
    'Ricardo Linares 107, Centro, 62000 Cuernavaca, Mor., Messico',
    '+52 777 362 0000',
    NULL,
    'https://www.lasmananitas.com.mx',
    'Hotel storico con giardini botanici e cortili coloniali ideali per ricevimenti eleganti all''aperto.',
    40,
    250,
    true
  ),
  (
    'Hacienda de los Morales',
    'Ciudad de México',
    'Miguel Hidalgo',
    'Ciudad de México',
    'Av. Juan Vázquez de Mella 525, Del Bosque, 11510 Ciudad de México, CDMX, Messico',
    '+52 55 5283 3054',
    NULL,
    'https://www.haciendadelosmorales.com',
    'Hacienda coloniale nel cuore di Polanco con sale storiche, giardini e servizio di banqueting interno.',
    80,
    600,
    true
  ),
  (
    'Four Seasons Resort Punta Mita',
    'Nayarit',
    'Bahía de Banderas',
    'Punta de Mita',
    'Carretera a Punta de Mita Km 14, 63734 Punta de Mita, Nay., Messico',
    '+52 329 291 6000',
    NULL,
    'https://www.fourseasons.com/puntamita',
    'Resort di lusso sulla Riviera Nayarit con spiagge private, terrazze panoramiche e servizi personalizzati per matrimoni.',
    30,
    300,
    true
  ),
  (
    'Villa La Joya',
    'Quintana Roo',
    'Solidaridad',
    'Playa del Carmen',
    'Carretera Federal Cancún-Playa del Carmen Km 277, 77710 Playa del Carmen, Q.R., Messico',
    '+52 984 879 5043',
    'info@villalajoya.com',
    'https://www.villalajoya.com',
    'Villa privata fronte mare con giardini caraibici, palapa e accesso diretto alla spiaggia per cerimonie intime.',
    20,
    120,
    true
  );

-- Chiese tipiche
INSERT INTO churches (name, region, province, city, address, phone, email, website, description, church_type, capacity, requires_baptism, requires_marriage_course, verified) VALUES
  (
    'Basílica de Santa María de Guadalupe',
    'Ciudad de México',
    'Gustavo A. Madero',
    'Ciudad de México',
    'Plaza de las Américas 1, Villa de Guadalupe, 07050 Ciudad de México, CDMX, Messico',
    '+52 55 5772 2700',
    NULL,
    'https://www.virgendeguadalupe.org.mx',
    'Santuario mariano più visitato al mondo con ampi spazi per celebrazioni solenni.',
    'cattolica',
    10000,
    true,
    true,
    true
  ),
  (
    'Catedral Metropolitana de la Ciudad de México',
    'Ciudad de México',
    'Cuauhtémoc',
    'Ciudad de México',
    'Plaza de la Constitución S/N, Centro Histórico, 06000 Ciudad de México, CDMX, Messico',
    '+52 55 5512 9462',
    NULL,
    'https://catedralmetropolitana.cdmx.gob.mx',
    'Cattedrale barocca e neoclassica nel cuore dello Zócalo, patrimonio mondiale UNESCO.',
    'cattolica',
    5000,
    true,
    true,
    true
  ),
  (
    'Parroquia de San Miguel Arcángel',
    'Guanajuato',
    'San Miguel de Allende',
    'San Miguel de Allende',
    'Plaza Principal S/N, Zona Centro, 37700 San Miguel de Allende, Gto., Messico',
    '+52 415 152 0289',
    NULL,
    NULL,
    'Parrocchia simbolo della città con facciata neogotica rosa e vedute panoramiche.',
    'cattolica',
    600,
    true,
    true,
    false
  ),
  (
    'Templo Expiatorio del Santísimo Sacramento',
    'Jalisco',
    'Guadalajara',
    'Guadalajara',
    'Av. López Cotilla 935, Col Americana, 44100 Guadalajara, Jal., Messico',
    '+52 33 3825 3413',
    NULL,
    'https://www.temploexpiatorio.com',
    'Chiesa neogotica con vetrate artistiche e carillon dal vivo nel centro di Guadalajara.',
    'cattolica',
    900,
    true,
    true,
    true
  ),
  (
    'Capilla de la Paz',
    'Guerrero',
    'Acapulco de Juárez',
    'Acapulco',
    'Escénica 5255, Fraccionamiento Las Brisas, 39867 Acapulco, Gro., Messico',
    '+52 744 446 5041',
    NULL,
    'https://www.capilladelapaz.com.mx',
    'Capilla ecumenica sospesa sopra la baia di Acapulco con vista panoramica e ambientazione minimalista.',
    'ecumenica',
    200,
    false,
    false,
    true
  ),
  (
    'Parroquia de Nuestra Señora del Carmen',
    'Quintana Roo',
    'Solidaridad',
    'Playa del Carmen',
    'Avenida 15 Norte S/N, Centro, 77710 Playa del Carmen, Q.R., Messico',
    '+52 984 873 0135',
    NULL,
    NULL,
    'Parrocchia principale di Playa del Carmen, a pochi passi dalla Quinta Avenida e dalla spiaggia.',
    'cattolica',
    450,
    true,
    true,
    false
  ),
  (
    'Templo de Santo Domingo de Guzmán',
    'Oaxaca',
    'Oaxaca de Juárez',
    'Oaxaca de Juárez',
    'Calle Macedonio Alcalá S/N, Centro, 68000 Oaxaca de Juárez, Oax., Messico',
    '+52 951 516 3720',
    NULL,
    'https://www.museodelasculturasoaxaca.org.mx',
    'Complesso barocco con navata dorata e chiostri storici, ideale per cerimonie solenni in stile coloniale.',
    'cattolica',
    800,
    true,
    true,
    true
  ),
  (
    'Parroquia San José del Cabo Añuití',
    'Baja California Sur',
    'Los Cabos',
    'San José del Cabo',
    'Av. José Maria Morelos 1, Centro, 23400 San José del Cabo, B.C.S., Messico',
    '+52 624 142 0064',
    NULL,
    NULL,
    'Parrocchia storica nel centro di San José del Cabo con facciata coloniale e piazza adiacente per eventi comunitari.',
    'cattolica',
    500,
    true,
    true,
    false
  );

-- Tradizioni
INSERT INTO traditions (name, description, country) VALUES
  ('La Callejoneada', 'Processione festosa con musica e balli nelle strade, tipica dei matrimoni coloniali.', 'mx'),
  ('Lazo', 'Simbolo di unione degli sposi, una corda decorata posta sulle spalle durante la cerimonia.', 'mx'),
  ('Mariachi', 'Musica tradizionale dal vivo durante la cerimonia e il ricevimento.', 'mx');
