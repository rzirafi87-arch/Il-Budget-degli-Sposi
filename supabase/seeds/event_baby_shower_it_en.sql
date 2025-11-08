-- EVENT TYPE
insert into event_types (code) values ('BABY_SHOWER')
on conflict (code) do nothing;

-- TRANSLATIONS (event name)
insert into event_type_translations (event_code, locale, name) values
('BABY_SHOWER','it','Baby Shower'),
('BABY_SHOWER','en','Baby Shower')
on conflict (event_code, locale) do update set name=excluded.name;

-- CATEGORIES (IT/EN) — minimal, pragmatic set per budgeting
-- Macro-categorie
insert into category_translations (event_code, category_code, locale, name) values
('BABY_SHOWER','VENUE','it','Location & Spazio'),
('BABY_SHOWER','VENUE','en','Venue & Space'),
('BABY_SHOWER','FOOD_DRINKS','it','Cibo & Bevande'),
('BABY_SHOWER','FOOD_DRINKS','en','Food & Drinks'),
('BABY_SHOWER','DECOR','it','Allestimenti & Decorazioni'),
('BABY_SHOWER','DECOR','en','Decor & Styling'),
('BABY_SHOWER','INVITES','it','Inviti & Grafica'),
('BABY_SHOWER','INVITES','en','Invites & Stationery'),
('BABY_SHOWER','ENTERTAINMENT','it','Animazione & Giochi'),
('BABY_SHOWER','ENTERTAINMENT','en','Entertainment & Games'),
('BABY_SHOWER','PHOTO_VIDEO','it','Foto & Video'),
('BABY_SHOWER','PHOTO_VIDEO','en','Photo & Video'),
('BABY_SHOWER','GIFTS_FAVORS','it','Regali & Bomboniere'),
('BABY_SHOWER','GIFTS_FAVORS','en','Gifts & Favors'),
('BABY_SHOWER','MISC','it','Extra & Varie'),
('BABY_SHOWER','MISC','en','Misc & Extras')
on conflict (event_code, category_code, locale) do update set name=excluded.name;

-- SOTTOCATEGORIE (campione completo ma snello)
insert into subcategory_translations (event_code, category_code, subcategory_code, locale, name) values
-- VENUE
('BABY_SHOWER','VENUE','ROOM_RENTAL','it','Affitto sala / spazio'),
('BABY_SHOWER','VENUE','ROOM_RENTAL','en','Room / Space rental'),
('BABY_SHOWER','VENUE','FURNITURE','it','Sedie, tavoli, tovagliato'),
('BABY_SHOWER','VENUE','FURNITURE','en','Furniture & Linens'),
-- FOOD_DRINKS
('BABY_SHOWER','FOOD_DRINKS','BUFFET','it','Buffet / Catering'),
('BABY_SHOWER','FOOD_DRINKS','BUFFET','en','Buffet / Catering'),
('BABY_SHOWER','FOOD_DRINKS','DESSERT','it','Torta & Dessert table'),
('BABY_SHOWER','FOOD_DRINKS','DESSERT','en','Cake & Dessert table'),
('BABY_SHOWER','FOOD_DRINKS','DRINKS','it','Bevande (analcolici)'),
('BABY_SHOWER','FOOD_DRINKS','DRINKS','en','Drinks (non-alcoholic)'),
-- DECOR
('BABY_SHOWER','DECOR','BALLOONS','it','Palloncini & Backdrop'),
('BABY_SHOWER','DECOR','BALLOONS','en','Balloons & Backdrop'),
('BABY_SHOWER','DECOR','FLORALS','it','Fiori & Centrotavola'),
('BABY_SHOWER','DECOR','FLORALS','en','Florals & Centerpieces'),
('BABY_SHOWER','DECOR','THEME_PROPS','it','Props a tema / Nascita'),
('BABY_SHOWER','DECOR','THEME_PROPS','en','Theme props / Baby items'),
-- INVITES
('BABY_SHOWER','INVITES','DESIGN_PRINT','it','Inviti (design & stampa)'),
('BABY_SHOWER','INVITES','DESIGN_PRINT','en','Invites (design & print)'),
('BABY_SHOWER','INVITES','DIGITAL_RSVP','it','RSVP digitale / Landing'),
('BABY_SHOWER','INVITES','DIGITAL_RSVP','en','Digital RSVP / Landing'),
-- ENTERTAINMENT
('BABY_SHOWER','ENTERTAINMENT','GAMES','it','Giochi & Kit gioco'),
('BABY_SHOWER','ENTERTAINMENT','GAMES','en','Games & Game kits'),
('BABY_SHOWER','ENTERTAINMENT','HOST','it','Presentatore / Animatore'),
('BABY_SHOWER','ENTERTAINMENT','HOST','en','Host / Entertainer'),
-- PHOTO_VIDEO
('BABY_SHOWER','PHOTO_VIDEO','PHOTOGRAPHER','it','Fotografo'),
('BABY_SHOWER','PHOTO_VIDEO','PHOTOGRAPHER','en','Photographer'),
('BABY_SHOWER','PHOTO_VIDEO','PHOTO_CORNER','it','Angolo foto / Polaroid'),
('BABY_SHOWER','PHOTO_VIDEO','PHOTO_CORNER','en','Photo corner / Instant cam'),
-- GIFTS_FAVORS
('BABY_SHOWER','GIFTS_FAVORS','FAVORS','it','Bomboniere / Favor'),
('BABY_SHOWER','GIFTS_FAVORS','FAVORS','en','Favors'),
('BABY_SHOWER','GIFTS_FAVORS','GIFT_LIST','it','Lista regali / Buoni'),
('BABY_SHOWER','GIFTS_FAVORS','GIFT_LIST','en','Gift list / Vouchers'),
-- MISC
('BABY_SHOWER','MISC','TRANSPORT','it','Trasporti & Carico'),
('BABY_SHOWER','MISC','TRANSPORT','en','Transport & Hauling'),
('BABY_SHOWER','MISC','CONTINGENCY','it','Fondo imprevisti'),
('BABY_SHOWER','MISC','CONTINGENCY','en','Contingency fund')
on conflict (event_code, category_code, subcategory_code, locale) do update set name=excluded.name;

-- TIMELINE (milestones sintetiche)
insert into event_timeline_translations (event_code, step_code, locale, title, description, sort) values
('BABY_SHOWER','PLAN_6W','it','6–8 settimane prima','Scegli data, guest list, budget e tema.',10),
('BABY_SHOWER','PLAN_6W','en','6–8 weeks before','Pick date, guest list, budget, theme.',10),
('BABY_SHOWER','BOOK_4W','it','4–6 settimane prima','Prenota location/casa, catering e fotografo.',20),
('BABY_SHOWER','BOOK_4W','en','4–6 weeks before','Book venue/home setup, catering, photographer.',20),
('BABY_SHOWER','INVITES_3W','it','3–4 settimane prima','Invia inviti, apri RSVP.',30),
('BABY_SHOWER','INVITES_3W','en','3–4 weeks before','Send invites, open RSVPs.',30),
('BABY_SHOWER','DECOR_2W','it','2 settimane prima','Ordina decor, palloncini, torta.',40),
('BABY_SHOWER','DECOR_2W','en','2 weeks before','Order decor, balloons, cake.',40),
('BABY_SHOWER','FINAL_WEEK','it','Settimana dell’evento','Conferme finali, allestimenti, giochi.',50),
('BABY_SHOWER','FINAL_WEEK','en','Event week','Final confirms, setup, games.',50),
('BABY_SHOWER','DAY_OF','it','Giorno evento','Allestisci, accoglienza, foto e ringraziamenti.',60),
('BABY_SHOWER','DAY_OF','en','Day of','Setup, welcome, photos, thank-you.',60)
on conflict (event_code, step_code, locale) do update set title=excluded.title, description=excluded.description, sort=excluded.sort;
