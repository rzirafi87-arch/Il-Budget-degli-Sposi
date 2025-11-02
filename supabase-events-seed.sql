-- Seed eventi speciali (compatibile con schema UUID e senza colonne country/type)
-- Idempotente per evento: rimuove l'event per public_id e re-inserisce con categorie/sottocategorie

BEGIN;

-- Battesimo
DELETE FROM public.events WHERE public_id = 'seed-battesimo-001';
INSERT INTO public.events (public_id, name, total_budget) VALUES ('seed-battesimo-001', 'Battesimo', 2000);
WITH e AS (
  SELECT id FROM public.events WHERE public_id = 'seed-battesimo-001'
), c AS (
  INSERT INTO public.categories (event_id, name)
  SELECT id, unnest(ARRAY[
    'Cerimonia',
    'Ricevimento',
    'Bomboniere e Regali',
    'Grafica e Inviti',
    'Foto e Video',
    'Abbigliamento e Beauty'
  ]) FROM e RETURNING id, name
)
INSERT INTO public.subcategories (category_id, name)
VALUES
((SELECT id FROM c WHERE name = 'Cerimonia'), 'Chiesa o luogo del rito'),
((SELECT id FROM c WHERE name = 'Cerimonia'), 'Offerta al sacerdote'),
((SELECT id FROM c WHERE name = 'Cerimonia'), 'Abbigliamento bimbo/a'),
((SELECT id FROM c WHERE name = 'Cerimonia'), 'Candele, fiocco e copertina'),
((SELECT id FROM c WHERE name = 'Cerimonia'), 'Libricino cerimonia'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Location / Ristorante'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Catering o menù'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Torta battesimale'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Allestimenti tavoli'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Segnaposto e tableau'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Animazione bambini'),
((SELECT id FROM c WHERE name = 'Bomboniere e Regali'), 'Bomboniere principali'),
((SELECT id FROM c WHERE name = 'Bomboniere e Regali'), 'Confetti e sacchetti'),
((SELECT id FROM c WHERE name = 'Bomboniere e Regali'), 'Tag e bigliettini'),
((SELECT id FROM c WHERE name = 'Bomboniere e Regali'), 'Regali padrini/madrine'),
((SELECT id FROM c WHERE name = 'Bomboniere e Regali'), 'Gadget per invitati'),
((SELECT id FROM c WHERE name = 'Grafica e Inviti'), 'Partecipazioni / inviti'),
((SELECT id FROM c WHERE name = 'Grafica e Inviti'), 'Biglietti ringraziamento'),
((SELECT id FROM c WHERE name = 'Grafica e Inviti'), 'Cartellonistica e menu'),
((SELECT id FROM c WHERE name = 'Grafica e Inviti'), 'Guestbook o foto ricordo'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Fotografo'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Videomaker'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Servizio photobooth'),
((SELECT id FROM c WHERE name = 'Abbigliamento e Beauty'), 'Genitori / padrini'),
((SELECT id FROM c WHERE name = 'Abbigliamento e Beauty'), 'Acconciatura e trucco mamma'),
((SELECT id FROM c WHERE name = 'Abbigliamento e Beauty'), 'Accessori vari');

-- Diciottesimo
DELETE FROM public.events WHERE public_id = 'seed-diciottesimo-001';
INSERT INTO public.events (public_id, name, total_budget) VALUES ('seed-diciottesimo-001', 'Diciottesimo', 3000);
WITH e AS (
  SELECT id FROM public.events WHERE public_id = 'seed-diciottesimo-001'
), c AS (
  INSERT INTO public.categories (event_id, name)
  SELECT id, unnest(ARRAY[
    'Location e Catering',
    'Intrattenimento',
    'Outfit e Beauty',
    'Inviti e Comunicazione',
    'Bomboniere e Gadget',
    'Extra e Organizzazione'
  ]) FROM e RETURNING id, name
)
INSERT INTO public.subcategories (category_id, name)
VALUES
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Sala eventi / locale'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Catering / buffet'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Open bar'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Torta e dessert'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Allestimento e decorazioni'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'DJ / musica live'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Animazione / presentatore'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Fotografo / videomaker'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Servizio social o photobooth'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Noleggio auto / limousine'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Abito principale'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Cambio outfit'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Trucco e parrucco'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Accessori'),
((SELECT id FROM c WHERE name = 'Inviti e Comunicazione'), 'Inviti digitali / cartacei'),
((SELECT id FROM c WHERE name = 'Inviti e Comunicazione'), 'Grafica e tema evento'),
((SELECT id FROM c WHERE name = 'Inviti e Comunicazione'), 'Hashtag / shooting pre-party'),
((SELECT id FROM c WHERE name = 'Bomboniere e Gadget'), 'Bomboniere'),
((SELECT id FROM c WHERE name = 'Bomboniere e Gadget'), 'Gadget personalizzati'),
((SELECT id FROM c WHERE name = 'Bomboniere e Gadget'), 'Ricordo per invitati'),
((SELECT id FROM c WHERE name = 'Extra e Organizzazione'), 'Addobbi floreali'),
((SELECT id FROM c WHERE name = 'Extra e Organizzazione'), 'Sicurezza / permessi'),
((SELECT id FROM c WHERE name = 'Extra e Organizzazione'), 'Noleggio attrezzature'),
((SELECT id FROM c WHERE name = 'Extra e Organizzazione'), 'Coordinamento evento');

-- Compleanno
DELETE FROM public.events WHERE public_id = 'seed-compleanno-001';
INSERT INTO public.events (public_id, name, total_budget) VALUES ('seed-compleanno-001', 'Compleanno', 1500);
WITH e AS (
  SELECT id FROM public.events WHERE public_id = 'seed-compleanno-001'
), c AS (
  INSERT INTO public.categories (event_id, name)
  SELECT id, unnest(ARRAY[
    'Location e Catering',
    'Animazione e Musica',
    'Inviti e Grafica',
    'Foto e Video',
    'Regali e Bomboniere'
  ]) FROM e RETURNING id, name
)
INSERT INTO public.subcategories (category_id, name)
VALUES
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Sala o casa privata'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Ristorante / catering'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Torta e dolci'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Bevande'),
((SELECT id FROM c WHERE name = 'Location e Catering'), 'Decorazioni'),
((SELECT id FROM c WHERE name = 'Animazione e Musica'), 'DJ / band'),
((SELECT id FROM c WHERE name = 'Animazione e Musica'), 'Animatori / intrattenimento'),
((SELECT id FROM c WHERE name = 'Animazione e Musica'), 'Giochi e attività'),
((SELECT id FROM c WHERE name = 'Inviti e Grafica'), 'Inviti cartacei o digitali'),
((SELECT id FROM c WHERE name = 'Inviti e Grafica'), 'Allestimento tema'),
((SELECT id FROM c WHERE name = 'Inviti e Grafica'), 'Gadget e segnaposto'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Servizio fotografico'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Videomaker o drone'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Bomboniere o piccoli doni'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Regali speciali'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Ricordi personalizzati');

-- Anniversario di Matrimonio
DELETE FROM public.events WHERE public_id = 'seed-anniversario-001';
INSERT INTO public.events (public_id, name, total_budget) VALUES ('seed-anniversario-001', 'Anniversario di Matrimonio', 2500);
WITH e AS (
  SELECT id FROM public.events WHERE public_id = 'seed-anniversario-001'
), c AS (
  INSERT INTO public.categories (event_id, name)
  SELECT id, unnest(ARRAY[
    'Cerimonia / Benedizione',
    'Ricevimento',
    'Foto e Video',
    'Regali e Bomboniere',
    'Outfit e Beauty',
    'Intrattenimento'
  ]) FROM e RETURNING id, name
)
INSERT INTO public.subcategories (category_id, name)
VALUES
((SELECT id FROM c WHERE name = 'Cerimonia / Benedizione'), 'Chiesa / rito simbolico'),
((SELECT id FROM c WHERE name = 'Cerimonia / Benedizione'), 'Offerta o celebrante'),
((SELECT id FROM c WHERE name = 'Cerimonia / Benedizione'), 'Addobbi floreali'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Location / ristorante'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Menù / catering'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Torta anniversario'),
((SELECT id FROM c WHERE name = 'Ricevimento'), 'Decorazioni e mise en place'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Servizio fotografico'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Videomaker'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Shooting di coppia'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Bomboniere personalizzate'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Regali reciproci'),
((SELECT id FROM c WHERE name = 'Regali e Bomboniere'), 'Gadget per invitati'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Abito lei / lui'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Parrucchiere e make-up'),
((SELECT id FROM c WHERE name = 'Outfit e Beauty'), 'Accessori'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Musica / band'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Animazione'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Proiezioni video o ricordi');

-- Pensione
DELETE FROM public.events WHERE public_id = 'seed-pensione-001';
INSERT INTO public.events (public_id, name, total_budget) VALUES ('seed-pensione-001', 'Pensione', 1800);
WITH e AS (
  SELECT id FROM public.events WHERE public_id = 'seed-pensione-001'
), c AS (
  INSERT INTO public.categories (event_id, name)
  SELECT id, unnest(ARRAY[
    'Festa e Location',
    'Intrattenimento',
    'Inviti e Gadget',
    'Foto e Video',
    'Outfit e Accessori'
  ]) FROM e RETURNING id, name
)
INSERT INTO public.subcategories (category_id, name)
VALUES
((SELECT id FROM c WHERE name = 'Festa e Location'), 'Location / ristorante'),
((SELECT id FROM c WHERE name = 'Festa e Location'), 'Buffet / catering'),
((SELECT id FROM c WHERE name = 'Festa e Location'), 'Allestimenti e decorazioni'),
((SELECT id FROM c WHERE name = 'Festa e Location'), 'Torta e dolci'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'DJ / musica'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Presentatore / speech'),
((SELECT id FROM c WHERE name = 'Intrattenimento'), 'Proiezioni foto ricordo'),
((SELECT id FROM c WHERE name = 'Inviti e Gadget'), 'Inviti digitali / cartacei'),
((SELECT id FROM c WHERE name = 'Inviti e Gadget'), 'Gadget per colleghi / amici'),
((SELECT id FROM c WHERE name = 'Inviti e Gadget'), 'Regalo principale'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Fotografo'),
((SELECT id FROM c WHERE name = 'Foto e Video'), 'Video ricordo / slideshow'),
((SELECT id FROM c WHERE name = 'Outfit e Accessori'), 'Abbigliamento'),
((SELECT id FROM c WHERE name = 'Outfit e Accessori'), 'Parrucchiere / trucco'),
((SELECT id FROM c WHERE name = 'Outfit e Accessori'), 'Accessori');

COMMIT;