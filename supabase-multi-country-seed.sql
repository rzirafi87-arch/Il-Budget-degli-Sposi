-- Traduzioni Laurea (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('GRADUATION','it','Laurea'),
('GRADUATION','en','Graduation')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('LAUREATO','it','Laureato'),
('LAUREATO','en','Graduate'),
('FESTA','it','Festa'),
('FESTA','en','Party'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('TOGA','it','Toga'),
('TOGA','en','Gown'),
('CORONA','it','Corona d'alloro'),
('CORONA','en','Laurel wreath'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('TORTA','it','Torta'),
('TORTA','en','Cake')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;
-- Traduzioni Comunione (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('COMMUNION','it','Comunione'),
('COMMUNION','en','First Communion')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('BAMBINO','it','Bambino'),
('BAMBINO','en','Child'),
('FESTA','it','Festa'),
('FESTA','en','Party'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('ABITO','it','Abito'),
('ABITO','en','Dress'),
('BOMBONIERE','it','Bomboniere'),
('BOMBONIERE','en','Favors'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('TORTA','it','Torta'),
('TORTA','en','Cake')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;
-- Traduzioni Battesimo (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('BAPTISM','it','Battesimo'),
('BAPTISM','en','Baptism')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('BAMBINO','it','Bambino'),
('BAMBINO','en','Child'),
('FESTA','it','Festa'),
('FESTA','en','Party'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('ABITO','it','Abito'),
('ABITO','en','Dress'),
('BOMBONIERE','it','Bomboniere'),
('BOMBONIERE','en','Favors'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('TORTA','it','Torta'),
('TORTA','en','Cake')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('CERIMONIA','it','Cerimonia'),
('CERIMONIA','en','Ceremony'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;
-- Traduzioni Gender Reveal (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('GENDER_REVEAL','it','Gender Reveal'),
('GENDER_REVEAL','en','Gender Reveal')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('GENITORI','it','Genitori'),
('GENITORI','en','Parents'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('DECORAZIONI','it','Decorazioni'),
('DECORAZIONI','en','Decorations'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('FESTA','it','Giorno della festa'),
('FESTA','en','Party day'),
('RIVELAZIONE','it','Rivelazione del genere'),
('RIVELAZIONE','en','Gender reveal')
on conflict do nothing;
-- Traduzioni Baby Shower (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('BABY_SHOWER','it','Baby Shower'),
('BABY_SHOWER','en','Baby Shower')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('MAMMA','it','Mamma'),
('MAMMA','en','Mom'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('DECORAZIONI','it','Decorazioni'),
('DECORAZIONI','en','Decorations')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('INVITI','it','Invio inviti'),
('INVITI','en','Send invitations'),
('FESTA','it','Giorno della festa'),
('FESTA','en','Party day')
on conflict do nothing;
-- Traduzioni Comunione (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('COMMUNION','it','Comunione'),
('COMMUNION','en','First Communion')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('FESTEGGIATO','it','Festeggiato'),
('FESTEGGIATO','en','Communicant'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('LOCATION','it','Location festa'),
('LOCATION','en','Party location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('CATERING','it','Catering'),
('CATERING','en','Catering'),
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('BOMBONIERE','it','Bomboniere'),
('BOMBONIERE','en','Favors')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('PREPARAZIONE','it','Preparazione comunione'),
('PREPARAZIONE','en','Communion preparation'),
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_COMUNIONE','it','Giorno della comunione'),
('GIORNO_COMUNIONE','en','Communion day')
on conflict do nothing;
-- Traduzioni Cresima (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('CONFIRMATION','it','Cresima'),
('CONFIRMATION','en','Confirmation')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('FESTEGGIATO','it','Festeggiato'),
('FESTEGGIATO','en','Confirmed person'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('LOCATION','it','Location festa'),
('LOCATION','en','Party location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('CATERING','it','Catering'),
('CATERING','en','Catering'),
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('BOMBONIERE','it','Bomboniere'),
('BOMBONIERE','en','Favors')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('PREPARAZIONE','it','Preparazione cresima'),
('PREPARAZIONE','en','Confirmation preparation'),
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_CRESIMA','it','Giorno della cresima'),
('GIORNO_CRESIMA','en','Confirmation day')
on conflict do nothing;
-- Traduzioni Diciottesimo (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('EIGHTEENTH','it','Diciottesimo'),
('EIGHTEENTH','en','18th Birthday')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('FESTEGGIATO','it','Festeggiato'),
('FESTEGGIATO','en','Birthday person'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('LOCATION','it','Location festa'),
('LOCATION','en','Party location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('CATERING','it','Catering'),
('CATERING','en','Catering'),
('TORTA','it','Torta'),
('TORTA','en','Cake'),
('DJ','it','DJ/Musica'),
('DJ','en','DJ/Music')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_COMPLEANNO','it','Giorno del compleanno'),
('GIORNO_COMPLEANNO','en','Birthday day')
on conflict do nothing;
-- Traduzioni Anniversario (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('ANNIVERSARY','it','Anniversario di matrimonio'),
('ANNIVERSARY','en','Wedding Anniversary')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('COPPIA','it','Coppia'),
('COPPIA','en','Couple'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('LOCATION','it','Location festa'),
('LOCATION','en','Party location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('CATERING','it','Catering'),
('CATERING','en','Catering'),
('TORTA','it','Torta'),
('TORTA','en','Cake')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_ANNIVERSARIO','it','Giorno dell\'anniversario'),
('GIORNO_ANNIVERSARIO','en','Anniversary day')
on conflict do nothing;
-- Traduzioni Graduation/Laurea (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('GRADUATION','it','Laurea'),
('GRADUATION','en','Graduation')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('FESTEGGIATO','it','Festeggiato'),
('FESTEGGIATO','en','Graduate'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('TOGA','it','Toga e tocco'),
('TOGA','en','Gown and cap'),
('LOCATION','it','Location festa'),
('LOCATION','en','Party location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer'),
('CATERING','it','Catering'),
('CATERING','en','Catering')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('TESI','it','Discussione tesi'),
('TESI','en','Thesis discussion'),
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_LAUREA','it','Giorno della laurea'),
('GIORNO_LAUREA','en','Graduation day')
on conflict do nothing;
-- Seed location ricevimento, chiesa e fornitori per Messico, Italia, Indonesia, Giappone, USA, Emirati Arabi, Russia, Francia, Spagna, Germania
-- Struttura basata su quella usata per l'Italia

-- LOCATION RICEVIMENTO
INSERT INTO locations (name, type, country, region, city, address) VALUES
  ('Villa del Sol', 'ricevimento', 'Messico', 'Jalisco', 'Guadalajara', 'Av. Vallarta 123'),
  ('Castello di Roma', 'ricevimento', 'Italia', 'Lazio', 'Roma', 'Via Appia 45'),
  ('Bali Dream Resort', 'ricevimento', 'Indonesia', 'Bali', 'Ubud', 'Jl. Monkey Forest 88'),
  ('Tokyo Sky Hall', 'ricevimento', 'Giappone', 'Tokyo', 'Tokyo', 'Shibuya 1-2-3'),
  ('Sunset Ranch', 'ricevimento', 'USA', 'California', 'Los Angeles', 'Sunset Blvd 100'),
  ('Emirates Palace', 'ricevimento', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Corniche Rd'),
  ('Palazzo Nevskij', 'ricevimento', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Nevskij Prospekt 55'),
  ('Château Lumière', 'ricevimento', 'Francia', 'Île-de-France', 'Parigi', 'Rue de Rivoli 10'),
  ('Finca La Alegría', 'ricevimento', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Real 22'),
  ('Schloss Grünwald', 'ricevimento', 'Germania', 'Baviera', 'Monaco', 'Grünwaldstr. 7');

-- LOCATION CHIESA
INSERT INTO churches (name, country, region, city, address) VALUES
  ('Iglesia de Guadalupe', 'Messico', 'Jalisco', 'Guadalajara', 'Calle Independencia 50'),
  ('Chiesa di Santa Maria', 'Italia', 'Lazio', 'Roma', 'Via del Corso 12'),
  ('Gereja Katolik Santo Yosef', 'Indonesia', 'Bali', 'Denpasar', 'Jl. Diponegoro 5'),
  ('St. Mary Cathedral', 'Giappone', 'Tokyo', 'Tokyo', 'Bunkyo-ku 1-1-1'),
  ('St. Patrick Church', 'USA', 'New York', 'New York', '5th Ave 460'),
  ('St. Joseph Cathedral', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Airport Rd'),
  ('Cattedrale di Kazan', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Nevskij Prospekt 25'),
  ('Église Saint-Germain', 'Francia', 'Île-de-France', 'Parigi', 'Bd Saint-Germain 3'),
  ('Iglesia de la Macarena', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Bécquer 1'),
  ('Frauenkirche', 'Germania', 'Baviera', 'Monaco', 'Frauenplatz 12');

INSERT INTO suppliers (name, type, country, region, city, address) VALUES
  ('Flores y Bodas', 'fiori', 'Messico', 'Jalisco', 'Guadalajara', 'Calle Flores 8'),
  ('Catering Roma', 'catering', 'Italia', 'Lazio', 'Roma', 'Via Veneto 20'),
  ('Bali Wedding Planners', 'wedding planner', 'Indonesia', 'Bali', 'Ubud', 'Jl. Raya 10'),
  ('Tokyo Bridal', 'abiti', 'Giappone', 'Tokyo', 'Tokyo', 'Harajuku 2-2-2'),
  ('NYC Music Events', 'musica', 'USA', 'New York', 'New York', 'Broadway 200'),
  ('Abu Dhabi Events', 'catering', 'Emirati Arabi', 'Abu Dhabi', 'Abu Dhabi', 'Al Reem St 5'),
  ('Matrimoni Nevskij', 'foto', 'Russia', 'San Pietroburgo', 'San Pietroburgo', 'Liteyniy 15'),
  ('Paris Wedding Flowers', 'fiori', 'Francia', 'Île-de-France', 'Parigi', 'Rue des Fleurs 4'),
  ('Sevilla Catering', 'catering', 'Spagna', 'Andalusia', 'Siviglia', 'Calle Feria 9'),
  ('München Musik', 'musica', 'Germania', 'Baviera', 'Monaco', 'Beethovenstr. 3');

-- Traduzioni Proposal (IT/EN)
-- event_type_translations
insert into event_type_translations (code, locale, label) values
('PROPOSAL','it','Proposta di matrimonio'),
('PROPOSAL','en','Proposal')
on conflict do nothing;

-- category_translations
insert into category_translations (category_code, locale, label) values
('ORGANIZZAZIONE','it','Organizzazione'),
('ORGANIZZAZIONE','en','Planning'),
('FESTA','it','Festa'),
('FESTA','en','Party')
on conflict do nothing;

-- subcategory_translations
insert into subcategory_translations (subcategory_code, locale, label) values
('ANELLO','it','Anello di fidanzamento'),
('ANELLO','en','Engagement ring'),
('LOCATION','it','Location proposta'),
('LOCATION','en','Proposal location'),
('FOTOGRAFO','it','Fotografo'),
('FOTOGRAFO','en','Photographer')
on conflict do nothing;

-- timeline_translations
insert into timeline_translations (timeline_code, locale, label) values
('SCELTA_ANELLO','it','Scelta anello'),
('SCELTA_ANELLO','en','Choose the ring'),
('ORGANIZZA_FESTA','it','Organizza la festa'),
('ORGANIZZA_FESTA','en','Plan the party'),
('GIORNO_PROPOSTA','it','Giorno della proposta'),
('GIORNO_PROPOSTA','en','Proposal day')
on conflict do nothing;
