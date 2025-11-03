-- =====================================================
-- ANNIVERSARIO DI MATRIMONIO - SEED COMPLETO
-- =====================================================
-- Evento celebrativo per anniversari importanti:
-- 25° (argento), 50° (oro), o celebrazioni più intime
-- Mix di celebrazione sentimentale e festa conviviale
-- =====================================================

-- Assicurati che il tipo evento esista
INSERT INTO event_types (slug, name) VALUES
  ('anniversary', 'Anniversario di Matrimonio')
ON CONFLICT (slug) DO NOTHING;

-- 1️⃣ CERIMONIA E RINNOVO PROMESSE
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Cerimonia e Rinnovo Promesse',
  '💒',
  'Celebrazione religiosa o laica, rinnovo delle promesse matrimoniali',
  'anniversary',
  1
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Prenotazione chiesa o luogo simbolico', 'Affitto spazio per cerimonia religiosa o laica', 1),
    ('Celebrazione religiosa o laica', 'Servizio celebrante per rinnovo promesse', 2),
    ('Offerta per la parrocchia / celebrante', 'Donazione o compenso per il celebrante', 3),
    ('Fioraio per altare o arco cerimonia', 'Decorazioni floreali per la cerimonia', 4),
    ('Musica per cerimonia', 'Arpa, quartetto d''archi, cantante lirica o gospel', 5),
    ('Decorazioni e mise en place cerimonia', 'Allestimento navata, petali, candele, drappeggi', 6),
    ('Rinnovo anelli o scambio simbolico', 'Nuovi anelli o oggetti simbolici da scambiare', 7)
) AS s(name, description, display_order)
WHERE c.name = 'Cerimonia e Rinnovo Promesse' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 2️⃣ LOCATION E RICEVIMENTO
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Location e Ricevimento',
  '🏛️',
  'Scelta e allestimento dello spazio per il ricevimento',
  'anniversary',
  2
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Scelta location', 'Ristorante, villa, giardino, terrazza, spiaggia o location simbolica', 1),
    ('Affitto sala o spazio esterno', 'Costo affitto spazi per il ricevimento', 2),
    ('Allestimento tavoli e decorazioni a tema', 'Tema argento, oro, salvia, avorio o personalizzato', 3),
    ('Luci e candele decorative', 'Illuminazione scenografica e candele decorative', 4),
    ('Tavolo d''onore e segnaposti', 'Allestimento tavolo sposi e segnaposti personalizzati', 5),
    ('Tableau o angolo foto ricordi', 'Tableau de mariage e/o angolo con foto storiche della coppia', 6),
    ('Tovagliato e stoviglie coordinati', 'Tovaglie, runner, piatti, bicchieri coordinati al tema', 7),
    ('Bomboniere o gift box', 'Regali per gli ospiti a ricordo dell''anniversario', 8)
) AS s(name, description, display_order)
WHERE c.name = 'Location e Ricevimento' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 3️⃣ CATERING / RISTORAZIONE
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Catering e Ristorazione',
  '🍽️',
  'Menu e servizio gastronomico per la celebrazione',
  'anniversary',
  3
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Pranzo o cena servita', 'Menu completo servito al tavolo', 1),
    ('Buffet o apericena elegante', 'Buffet standing o apericena con finger food', 2),
    ('Dolce e torta personalizzata', 'Torta a tema anniversario (argento, oro, romantica)', 3),
    ('Brindisi e champagne', 'Bollicine di qualità per il brindisi celebrativo', 4),
    ('Bevande e vini selezionati', 'Selezione vini e bevande durante il ricevimento', 5),
    ('Servizio catering o menu ristorante', 'Costo servizio staff e cucina', 6)
) AS s(name, description, display_order)
WHERE c.name = 'Catering e Ristorazione' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 4️⃣ ABBIGLIAMENTO E BEAUTY
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Abbigliamento e Beauty',
  '👗',
  'Look della coppia e beauty per la celebrazione',
  'anniversary',
  4
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Abiti per la coppia', 'Outfit cerimonia e ricevimento (abito elegante, smoking, ecc.)', 1),
    ('Parrucchiere e make-up', 'Servizi beauty per la coppia', 2),
    ('Accessori coordinati', 'Gioielli, boutonnière, scarpe, borsa, gemelli', 3),
    ('Outfit figli e parenti stretti', 'Coordinamento look famiglia allargata', 4)
) AS s(name, description, display_order)
WHERE c.name = 'Abbigliamento e Beauty' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 5️⃣ FOTO E VIDEO
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Foto e Video',
  '📸',
  'Servizio fotografico e video per immortalare i ricordi',
  'anniversary',
  5
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Fotografo e videomaker', 'Servizio completo foto e video professionale', 1),
    ('Shooting di coppia pre-evento', 'Servizio fotografico romantico prima della celebrazione', 2),
    ('Servizio reportage durante la festa', 'Copertura fotografica dell''intera giornata', 3),
    ('Mini video racconto o reel', 'Video emozionale da condividere sui social', 4),
    ('Angolo foto / photobooth', 'Area selfie con props e sfondo personalizzato', 5),
    ('Album o cornice digitale', 'Album fotografico fisico o digitale', 6)
) AS s(name, description, display_order)
WHERE c.name = 'Foto e Video' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 6️⃣ INVITI E GRAFICA
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Inviti e Grafica',
  '💌',
  'Coordinato grafico e comunicazione evento',
  'anniversary',
  6
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Partecipazioni digitali o cartacee', 'Inviti formali per gli ospiti', 1),
    ('Coordinato grafico', 'Tema visivo, palette colori, logo personalizzato', 2),
    ('Tableau, segnaposti, menu', 'Elementi grafici coordinati per il ricevimento', 3),
    ('Biglietti di ringraziamento', 'Thank you card per gli ospiti', 4),
    ('QR code per raccolta foto/video', 'Sistema digitale per condivisione ricordi ospiti', 5)
) AS s(name, description, display_order)
WHERE c.name = 'Inviti e Grafica' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 7️⃣ REGALI E RINGRAZIAMENTI
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Regali e Ringraziamenti',
  '🎁',
  'Lista regali e doni simbolici tra coppia e ospiti',
  'anniversary',
  7
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Lista regali o Gift Wallet digitale', 'Piattaforma per regali monetari o wishlist', 1),
    ('Regali simbolici reciproci', 'Gioiello, viaggio, fotoalbum, promessa tra i coniugi', 2),
    ('Bomboniere o gift bag ospiti', 'Regali di ringraziamento per gli invitati', 3),
    ('Biglietti di ringraziamento', 'Stampa e spedizione thank you cards', 4)
) AS s(name, description, display_order)
WHERE c.name = 'Regali e Ringraziamenti' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 8️⃣ MUSICA E INTRATTENIMENTO
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Musica e Intrattenimento',
  '🎵',
  'Musicisti, DJ e performance per animare la celebrazione',
  'anniversary',
  8
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('DJ o band live', 'Intrattenimento musicale per la festa', 1),
    ('Cantante per la cerimonia', 'Performance durante il rinnovo promesse', 2),
    ('Playlist personalizzata', 'Colonne sonore significative della coppia', 3),
    ('Proiezione video ricordi o slideshow', 'Video retrospettivo con foto degli anni insieme', 4),
    ('Ballo di coppia simbolico', 'Coreografia o ballo romantico della coppia', 5),
    ('Artisti o performer', 'Violinista, sassofonista, ballerini, performer speciali', 6)
) AS s(name, description, display_order)
WHERE c.name = 'Musica e Intrattenimento' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 9️⃣ TRASPORTI E LOGISTICA
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Trasporti e Logistica',
  '🚗',
  'Spostamenti coppia, ospiti e gestione pernottamenti',
  'anniversary',
  9
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Auto per la coppia', 'Auto d''epoca, cabriolet o auto elegante per gli sposi', 1),
    ('Navetta ospiti', 'Servizio trasporto per gli invitati', 2),
    ('Parcheggi e permessi', 'Gestione parcheggi o permessi ZTL', 3),
    ('Pernottamenti ospiti', 'Hotel o B&B per ospiti fuori città', 4)
) AS s(name, description, display_order)
WHERE c.name = 'Trasporti e Logistica' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- 🔟 GESTIONE BUDGET
INSERT INTO categories (name, icon, description, event_type, display_order) 
VALUES (
  'Gestione Budget',
  '💰',
  'Controllo finanziario dell''evento',
  'anniversary',
  10
) ON CONFLICT (name, event_type) DO NOTHING;

INSERT INTO subcategories (category_id, name, description, display_order)
SELECT c.id, s.name, s.description, s.display_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Budget stimato', 'Preventivo iniziale totale', 1),
    ('Acconti versati', 'Somme anticipate ai fornitori', 2),
    ('Saldi fornitori', 'Pagamenti finali a chiusura contratti', 3),
    ('Spese extra', 'Costi imprevisti o aggiunte last minute', 4),
    ('Regali ricevuti', 'Contributi monetari o regali dagli ospiti', 5),
    ('Totale finale', 'Consuntivo effettivo dell''evento', 6)
) AS s(name, description, display_order)
WHERE c.name = 'Gestione Budget' AND c.event_type = 'anniversary'
ON CONFLICT (category_id, name) DO NOTHING;

-- =====================================================
-- TIMELINE ANNIVERSARIO DI MATRIMONIO
-- =====================================================

INSERT INTO timeline_phases (event_type, phase_name, months_before, description, display_order)
VALUES
  ('anniversary', '3-4 mesi prima: Idea e impostazione evento', 4, 'Definizione tipo anniversario, fissare data e location, scegliere tema e colori', 1),
  ('anniversary', '2 mesi prima: Conferme e fornitori', 2, 'Conferma location e fornitori principali, prenotazioni fiorista e outfit', 2),
  ('anniversary', '1 mese prima: Definizione dettagli', 1, 'Programma giornata, tableau, shooting pre-evento, organizzazione trasporti', 3),
  ('anniversary', '2 settimane prima: Rifinitura', 0.5, 'Prova trucco/parrucco, brief fornitori, checklist finale', 4),
  ('anniversary', 'Giorno dell''anniversario: Celebrazione', 0, 'Preparazione, cerimonia, ricevimento, festa con musica e balli', 5),
  ('anniversary', 'Dopo l''evento: Chiusura e ricordi', -1, 'Ringraziamenti, raccolta foto/video, pagamenti finali, bilancio finale', 6)
ON CONFLICT (event_type, phase_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- 3-4 MESI PRIMA
    ('Definisci tipo di anniversario', 'Argento (25°), oro (50°), nozze di carta, o celebrazione intima', 'Gestione Budget', 1),
    ('Fissa data e location', 'Prenota chiesa o luogo simbolico e spazio ricevimento', 'Location e Ricevimento', 2),
    ('Scegli tema visivo e colori', 'Palette colori (argento, oro, salvia, avorio) e mood board', 'Inviti e Grafica', 3),
    ('Contatta fotografo e videomaker', 'Richiedi preventivi e disponibilità', 'Foto e Video', 4),
    ('Richiedi preventivi catering', 'Valuta menu e servizio ristorazione', 'Catering e Ristorazione', 5),
    ('Progetta inviti e grafica', 'Inizia coordinato grafico e partecipazioni', 'Inviti e Grafica', 6),
    ('Imposta budget iniziale', 'Definisci budget totale e ripartizione categorie', 'Gestione Budget', 7)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = '3-4 mesi prima: Idea e impostazione evento' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- 2 MESI PRIMA
    ('Conferma location e fornitori', 'Firma contratti con location e fornitori principali', 'Location e Ricevimento', 1),
    ('Prenota fiorista e allestimento', 'Conferma decorazioni floreali e mise en place', 'Cerimonia e Rinnovo Promesse', 2),
    ('Ricerca outfit coppia', 'Inizia selezione abiti cerimonia e ricevimento', 'Abbigliamento e Beauty', 3),
    ('Ordina torta personalizzata', 'Commissiona torta a tema anniversario', 'Catering e Ristorazione', 4),
    ('Invia inviti ufficiali', 'Spedizione partecipazioni digitali o cartacee', 'Inviti e Grafica', 5),
    ('Scegli bomboniere', 'Ordina regali per ospiti', 'Regali e Ringraziamenti', 6)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = '2 mesi prima: Conferme e fornitori' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- 1 MESE PRIMA
    ('Conferma musicisti o DJ', 'Definisci scaletta e performance', 'Musica e Intrattenimento', 1),
    ('Stabilisci programma giornata', 'Timeline: cerimonia → ricevimento → festa', 'Gestione Budget', 2),
    ('Prepara tableau e menù', 'Stampa segnaposti, menù e tableau', 'Inviti e Grafica', 3),
    ('Conferma shooting pre-evento', 'Organizza sessione fotografica romantica', 'Foto e Video', 4),
    ('Organizza trasporti', 'Prenota auto coppia e navetta ospiti', 'Trasporti e Logistica', 5),
    ('Versa acconti finali', 'Completa pagamenti anticipati fornitori', 'Gestione Budget', 6)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = '1 mese prima: Definizione dettagli' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- 2 SETTIMANE PRIMA
    ('Prova trucco e parrucco', 'Test beauty look finale', 'Abbigliamento e Beauty', 1),
    ('Brief finale fornitori', 'Ultimo check con tutti i fornitori', 'Gestione Budget', 2),
    ('Stampa checklist giorno evento', 'Prepara programma dettagliato della giornata', 'Gestione Budget', 3),
    ('Prepara promesse personali', 'Scrivi ringraziamenti o rinnovo promesse', 'Cerimonia e Rinnovo Promesse', 4),
    ('Raccogli regali', 'Prepara regali simbolici tra coppia e per ospiti', 'Regali e Ringraziamenti', 5)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = '2 settimane prima: Rifinitura' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- GIORNO DELL'ANNIVERSARIO
    ('Preparazione coppia', 'Beauty, outfit e momento di intimità prima della cerimonia', 'Abbigliamento e Beauty', 1),
    ('Cerimonia o rinnovo promesse', 'Celebrazione religiosa o laica con scambio simbolico', 'Cerimonia e Rinnovo Promesse', 2),
    ('Servizio foto e video', 'Coverage fotografica e video dell''intera giornata', 'Foto e Video', 3),
    ('Ricevimento o cena elegante', 'Pranzo o cena servita con ospiti', 'Catering e Ristorazione', 4),
    ('Taglio torta e brindisi', 'Momento simbolico con champagne e torta', 'Catering e Ristorazione', 5),
    ('Proiezione video ricordi', 'Slideshow fotografico degli anni insieme', 'Musica e Intrattenimento', 6),
    ('Festa con musica e balli', 'DJ o band live, ballo di coppia simbolico', 'Musica e Intrattenimento', 7),
    ('Consegna bomboniere', 'Distribuzione regali ricordo agli ospiti', 'Regali e Ringraziamenti', 8)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = 'Giorno dell''anniversario: Celebrazione' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

INSERT INTO timeline_tasks (phase_id, task_name, description, category_id, display_order)
SELECT 
  p.id,
  t.task_name,
  t.description,
  c.id,
  t.display_order
FROM timeline_phases p
CROSS JOIN (
  VALUES
    -- DOPO L'EVENTO
    ('Invia ringraziamenti', 'Thank you cards a ospiti e fornitori', 'Regali e Ringraziamenti', 1),
    ('Raccogli foto e video', 'Scarica foto da fotografo e ospiti (QR code)', 'Foto e Video', 2),
    ('Completa pagamenti', 'Saldi finali a tutti i fornitori', 'Gestione Budget', 3),
    ('Aggiorna bilancio finale', 'Consuntivo reale vs preventivo', 'Gestione Budget', 4),
    ('Crea album ricordo', 'Album fotografico fisico o video digitale', 'Foto e Video', 5)
) AS t(task_name, description, category_name, display_order)
LEFT JOIN categories c ON c.name = t.category_name AND c.event_type = 'anniversary'
WHERE p.phase_name = 'Dopo l''evento: Chiusura e ricordi' AND p.event_type = 'anniversary'
ON CONFLICT (phase_id, task_name) DO NOTHING;

-- =====================================================
-- TRADIZIONI SPECIFICHE PER ANNIVERSARIO
-- =====================================================

INSERT INTO traditions (
  event_type,
  country,
  tradition_name,
  tradition_type,
  description,
  display_order
)
VALUES
  -- Italia
  ('anniversary', 'IT', 'Nozze d''argento (25 anni)', 'celebrazioni', 'Celebrazione importante con rinnovo promesse in chiesa, pranzo con parenti e amici stretti. Regali in argento (gioielli, cornici, posate).', 1),
  ('anniversary', 'IT', 'Nozze d''oro (50 anni)', 'celebrazioni', 'Grande festa con tutta la famiglia allargata. Benedizione religiosa, messa solenne. Regali in oro (medaglie, anelli rinnovati).', 2),
  ('anniversary', 'IT', 'Regalo simbolico reciproco', 'regali', 'Scambio di regali significativi tra i coniugi: gioiello commemorativo, viaggio romantico, o promessa rinnovata.', 3),
  ('anniversary', 'IT', 'Video retrospettivo', 'intrattenimento', 'Proiezione di foto e video degli anni di matrimonio durante il ricevimento, con colonna sonora delle canzoni della coppia.', 4),
  ('anniversary', 'IT', 'Ballo di coppia', 'intrattenimento', 'Ballo romantico della coppia su una canzone significativa (spesso quella del matrimonio originale).', 5),
  
  -- Indonesia
  ('anniversary', 'ID', 'Syukuran pernikahan', 'celebrazioni', 'Festa di ringraziamento religiosa (doa bersama) con famiglia e comunità, spesso con makan bersama (pranzo comunitario).', 1),
  ('anniversary', 'ID', 'Pernikahan perak (25 tahun)', 'celebrazioni', 'Anniversario d''argento celebrato con cerimonia religiosa rinnovata (akad nikah ulang) e festa elegante.', 2),
  ('anniversary', 'ID', 'Pernikahan emas (50 tahun)', 'celebrazioni', 'Anniversario d''oro con grande celebrazione multigenerazionale, benedizione degli anziani (orang tua), doa e sedekah (carità).', 3),
  ('anniversary', 'ID', 'Hadiah emas atau perak', 'regali', 'Scambio di gioielli in oro o argento tra i coniugi, spesso anelli rinnovati o kalung (collane).', 4),
  ('anniversary', 'ID', 'Album kenangan keluarga', 'ricordi', 'Creazione di album fotografico familiare o video montage con foto di tutti gli anni insieme.', 5),
  
  -- Messico
  ('anniversary', 'MX', 'Bodas de plata (25 años)', 'celebrazioni', 'Celebrazione con messa di ringraziamento, mariachi, cena elegante. Renovación de votos davanti alla famiglia.', 1),
  ('anniversary', 'MX', 'Bodas de oro (50 años)', 'celebrazioni', 'Grande festa multigenerazionale con messa solenne, mariachi, vals dei nonni (ballo dei festeggiati).', 2),
  ('anniversary', 'MX', 'Vals de aniversario', 'intrattenimento', 'Ballo della coppia (spesso un vals romantico) che apre la festa, seguito da balli tradizionali.', 3),
  ('anniversary', 'MX', 'Serenata con mariachi', 'intrattenimento', 'Mariachi che suona le canzoni significative della coppia durante il ricevimento.', 4),
  ('anniversary', 'MX', 'Recuerdos personalizados', 'regali', 'Bomboniere personalizzate per gli ospiti con foto della coppia e data anniversario.', 5),
  ('anniversary', 'MX', 'Video retrospectivo familiar', 'intrattenimento', 'Proiezione video con foto di matrimonio originale, nascita figli, momenti familiari importanti.', 6),
  
  -- India
  ('anniversary', 'IN', 'Silver Jubilee (25 years)', 'celebrazioni', 'Celebrazione con puja (cerimonia religiosa), pranzo vegetariano per famiglia allargata e amici.', 1),
  ('anniversary', 'IN', 'Golden Jubilee (50 years)', 'celebrazioni', 'Grande celebrazione multigenerazionale con puja elaborata, benedizione degli anziani, dakshina (donazioni).', 2),
  ('anniversary', 'IN', 'Vow renewal ceremony', 'cerimonia', 'Rinnovo dei sette voti (Saptapadi) davanti al fuoco sacro, spesso con priest e famiglia.', 3),
  ('anniversary', 'IN', 'Exchange of garlands', 'tradizioni', 'Scambio di ghirlande di fiori (varmala) tra i coniugi, simbolo di rispetto reciproco rinnovato.', 4),
  ('anniversary', 'IN', 'Gold or silver jewelry', 'regali', 'Scambio di gioielli in oro (50°) o argento (25°), spesso set coordinati (anelli, bracciali, collane).', 5),
  ('anniversary', 'IN', 'Family photo session', 'ricordi', 'Servizio fotografico professionale con tutta la famiglia allargata (figli, nipoti, generi/nuore).', 6),
  ('anniversary', 'IN', 'Charity or donation', 'tradizioni', 'Donazione (dakshina) a templi, orfanatrofi o cause benefiche in segno di gratitudine.', 7)
ON CONFLICT (event_type, country, tradition_name) DO NOTHING;

-- =====================================================
-- BUDGET TIPS SPECIFICI
-- =====================================================

INSERT INTO budget_tips (
  event_type,
  category_name,
  tip_text,
  tip_type,
  display_order
)
SELECT 
  'anniversary',
  c.name,
  t.tip_text,
  t.tip_type,
  t.display_order
FROM categories c
CROSS JOIN (
  VALUES
    -- Cerimonia
    ('Cerimonia e Rinnovo Promesse', 'Per un anniversario intimo, considera una celebrazione laica in giardino o spiaggia invece della chiesa, risparmiando su affitto e permessi.', 'risparmio', 1),
    ('Cerimonia e Rinnovo Promesse', 'Musicisti durante la cerimonia: un duo arpa+violino costa meno di un quartetto completo ma crea la stessa atmosfera elegante.', 'risparmio', 2),
    ('Cerimonia e Rinnovo Promesse', 'Riutilizza gli anelli di matrimonio originali con una semplice lucidatura invece di acquistare nuovi anelli: valore simbolico maggiore, costo zero.', 'risparmio', 3),
    
    -- Location
    ('Location e Ricevimento', 'Per anniversari 25° o 50°, scegli location con spazi esterni: permette di risparmiare su allestimenti scenografici (la natura fa da sfondo).', 'risparmio', 1),
    ('Location e Ricevimento', 'Tema colore argento/oro: usa spray metallici per rinnovare candele e vasi già esistenti invece di comprare tutto nuovo.', 'risparmio', 2),
    ('Location e Ricevimento', 'Bomboniere fai-da-te: confetti in sacchetti di organza con tag personalizzati costano 1/3 rispetto a bomboniere commissionate.', 'risparmio', 3),
    
    -- Catering
    ('Catering e Ristorazione', 'Buffet o apericena elegante costa 30-40% meno di un menu servito completo, mantenendo comunque un alto livello qualitativo.', 'risparmio', 1),
    ('Catering e Ristorazione', 'Torta a due piani con decorazioni minimal è altrettanto elegante di una torta elaborata ma costa la metà.', 'risparmio', 2),
    
    -- Abbigliamento
    ('Abbigliamento e Beauty', 'Per la coppia: considera abiti eleganti già posseduti (smoking, abito da sera) invece di comprare outfit nuovi specifici per l''anniversario.', 'risparmio', 1),
    ('Abbigliamento e Beauty', 'Accessori vintage o di famiglia (gioielli della nonna, gemelli del nonno) aggiungono valore sentimentale senza costi.', 'risparmio', 2),
    
    -- Foto e Video
    ('Foto e Video', 'Chiedi a un fotografo emergente: portfolio in crescita significa prezzi più bassi ma qualità comunque professionale.', 'risparmio', 1),
    ('Foto e Video', 'Album digitale condiviso (Google Photos, Dropbox) invece di album fisico stampa: permette a tutti i parenti di accedere ai ricordi.', 'risparmio', 2),
    ('Foto e Video', 'Photobooth fai-da-te: sfondo DIY + props stampati + cavalletto smartphone = risparmio di 200-300€ rispetto a noleggio professionale.', 'risparmio', 3),
    
    -- Inviti
    ('Inviti e Grafica', 'Partecipazioni digitali (WhatsApp, email con grafica Canva) sono gratuite e più ecologiche rispetto a stampa cartacea.', 'risparmio', 1),
    ('Inviti e Grafica', 'QR code per raccolta foto: usa Google Forms + Google Drive invece di piattaforme a pagamento.', 'risparmio', 2),
    
    -- Regali
    ('Regali e Ringraziamenti', 'Lista regali: orienta gli ospiti verso contributi monetari (viaggio, ristrutturazione casa) invece di oggetti fisici.', 'consiglio', 1),
    ('Regali e Ringraziamenti', 'Regalo reciproco: viaggio romantico posticipato (low season) invece di gioielli costosi = ricordo indimenticabile a budget contenuto.', 'consiglio', 2),
    
    -- Musica
    ('Musica e Intrattenimento', 'Playlist Spotify personalizzata + impianto audio in affitto costa meno di un DJ ma mantiene atmosfera musicale controllata.', 'risparmio', 1),
    ('Musica e Intrattenimento', 'Video retrospettivo: crea slideshow con foto di famiglia usando software gratuiti (iMovie, Canva) invece di commissionare video professionale.', 'risparmio', 2),
    
    -- Trasporti
    ('Trasporti e Logistica', 'Auto d''epoca: noleggia solo per foto simboliche (1-2 ore) invece che per tutta la giornata = risparmio 50-60%.', 'risparmio', 1),
    ('Trasporti e Logistica', 'Navetta ospiti: organizza car sharing tra parenti invece di noleggiare bus/navetta.', 'risparmio', 2),
    
    -- Budget
    ('Gestione Budget', 'Anniversari intimi (es. 10°, 15°): cena elegante per due + weekend romantico può essere più significativo e meno costoso di una grande festa.', 'consiglio', 1),
    ('Gestione Budget', 'Per 25° e 50°: coinvolgi figli/nipoti nell''organizzazione (contributi economici e operativi) per distribuire costi e responsabilità.', 'consiglio', 2)
) AS t(category_name, tip_text, tip_type, display_order)
WHERE c.name = t.category_name AND c.event_type = 'anniversary'
ON CONFLICT (event_type, category_name, tip_text) DO NOTHING;

-- =====================================================
-- VERIFICA FINALE
-- =====================================================

-- Conta categorie create
SELECT 'Categorie create:' as info, COUNT(*) as totale 
FROM categories WHERE event_type = 'anniversary';

-- Conta sottocategorie create
SELECT 'Sottocategorie create:' as info, COUNT(*) as totale 
FROM subcategories 
WHERE category_id IN (SELECT id FROM categories WHERE event_type = 'anniversary');

-- Conta fasi timeline
SELECT 'Fasi timeline:' as info, COUNT(*) as totale 
FROM timeline_phases WHERE event_type = 'anniversary';

-- Conta task timeline
SELECT 'Task timeline:' as info, COUNT(*) as totale 
FROM timeline_tasks 
WHERE phase_id IN (SELECT id FROM timeline_phases WHERE event_type = 'anniversary');

-- Conta tradizioni
SELECT 'Tradizioni:' as info, COUNT(*) as totale 
FROM traditions WHERE event_type = 'anniversary';

-- Conta budget tips
SELECT 'Budget tips:' as info, COUNT(*) as totale 
FROM budget_tips WHERE event_type = 'anniversary';
