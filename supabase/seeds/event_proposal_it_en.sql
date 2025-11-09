insert into event_types (code) values ('PROPOSAL') on conflict (code) do nothing;
insert into event_type_translations (event_code, locale, name) values
('PROPOSAL','it','Proposal / Proposta di Matrimonio'),
('PROPOSAL','en','Proposal')
on conflict (event_code, locale) do update set name=excluded.name;

insert into category_translations (event_code, category_code, locale, name) values
('PROPOSAL','LOCATION','it','Location & Setup'),
('PROPOSAL','LOCATION','en','Location & Setup'),
('PROPOSAL','PHOTO_VIDEO','it','Foto & Video'),
('PROPOSAL','PHOTO_VIDEO','en','Photo & Video'),
('PROPOSAL','EXPERIENCE','it','Esperienza & Musica'),
('PROPOSAL','EXPERIENCE','en','Experience & Music'),
('PROPOSAL','RING','it','Anello & Gioielli'),
('PROPOSAL','RING','en','Ring & Jewelry'),
('PROPOSAL','MISC','it','Extra & Varie'),
('PROPOSAL','MISC','en','Misc & Extras')
on conflict (event_code, category_code, locale) do update set name=excluded.name;

insert into subcategory_translations (event_code, category_code, subcategory_code, locale, name) values
('PROPOSAL','LOCATION','PRIVATE_SETUP','it','Allestimento privato / scenografia'),
('PROPOSAL','LOCATION','PRIVATE_SETUP','en','Private setup / scenography'),
('PROPOSAL','LOCATION','FLOWERS','it','Fiori & Candles'),
('PROPOSAL','LOCATION','FLOWERS','en','Flowers & Candles'),
('PROPOSAL','PHOTO_VIDEO','PHOTOGRAPHER','it','Fotografo / Videomaker'),
('PROPOSAL','PHOTO_VIDEO','PHOTOGRAPHER','en','Photographer / Videographer'),
('PROPOSAL','EXPERIENCE','MUSICIAN','it','Musicista / Violinista'),
('PROPOSAL','EXPERIENCE','MUSICIAN','en','Musician / Violinist'),
('PROPOSAL','EXPERIENCE','DINNER','it','Cena / Champagne'),
('PROPOSAL','EXPERIENCE','DINNER','en','Dinner / Champagne'),
('PROPOSAL','RING','RING','it','Anello (acquisto / assicurazione)'),
('PROPOSAL','RING','RING','en','Ring (purchase / insurance)'),
('PROPOSAL','MISC','CONTINGENCY','it','Fondo imprevisti'),
('PROPOSAL','MISC','CONTINGENCY','en','Contingency fund')
on conflict (event_code, category_code, subcategory_code, locale) do update set name=excluded.name;

insert into event_timeline_translations (event_code, step_code, locale, title, description, sort) values
('PROPOSAL','PLAN','it','Pianifica','Definisci budget, stile e timing.',10),
('PROPOSAL','PLAN','en','Plan','Define budget, style and timing.',10),
('PROPOSAL','BOOK','it','Prenota','Location, fotografo, musica.',20),
('PROPOSAL','BOOK','en','Book','Venue, photographer, music.',20),
('PROPOSAL','PREP','it','Prepara','Allestimento, copione, cover-story.',30),
('PROPOSAL','PREP','en','Prepare','Setup, script, cover story.',30),
('PROPOSAL','DAY','it','Il giorno','Coordinamento e sorpresa.',40),
('PROPOSAL','DAY','en','Day of','Coordination and surprise.',40)
on conflict (event_code, step_code, locale) do update set title=excluded.title, description=excluded.description, sort=excluded.sort;
