-- Seed Gioiellerie per Il Budget degli Sposi
-- Eseguire dopo aver creato la tabella suppliers

INSERT INTO suppliers (name, category, region, province, city, phone, email, website, description, verified)
VALUES
-- Lombardia
('Gioielleria Verdi', 'Gioiellerie', 'Lombardia', 'Milano', 'Milano', '+39 02 12345670', 'info@gioielleriaverdi.it', 'https://www.gioielleriaverdi.it', 'Fedi nuziali artigianali in oro e platino, incisione inclusa', true),
('Rossi Oro', 'Gioiellerie', 'Lombardia', 'Bergamo', 'Bergamo', '+39 035 234567', 'info@rossioro.it', 'https://www.rossioro.it', 'Anelli di fidanzamento con diamanti certificati GIA, design classico e moderno', true),
-- Lazio
('Gioielli Roma Antica', 'Gioiellerie', 'Lazio', 'Roma', 'Roma', '+39 06 76543210', 'info@gioielliromantica.it', 'https://www.gioielliromantica.it', 'Fedi e gioielli su misura, laboratorio orafo interno', true),
('Diamanti Capitolini', 'Gioiellerie', 'Lazio', 'Roma', 'Roma', '+39 06 67890123', 'info@diamanticapitolini.it', 'https://www.diamanticapitolini.it', 'Solitaire e trilogy diamanti, certificazioni internazionali', true),
-- Toscana
('Oreficeria Fiorentina', 'Gioiellerie', 'Toscana', 'Firenze', 'Firenze', '+39 055 345678', 'info@oreficeriafiorentina.it', 'https://www.oreficeriafiorentina.it', 'Tradizione fiorentina, lavorazioni a mano sul Ponte Vecchio', true), 
('Argenteria del Giglio', 'Gioiellerie', 'Toscana', 'Firenze', 'Firenze', '+39 055 456789', 'info@argenteriadelgiglio.it', 'https://www.argenteriadelgiglio.it', 'Fedi e gioielli in oro bianco, giallo e rosa; collezioni sposa', true),
-- Campania
('Gioielli Vesuvio', 'Gioiellerie', 'Campania', 'Napoli', 'Napoli', '+39 081 1234567', 'info@gioiellivesuvio.it', 'https://www.gioiellivesuvio.it', 'Gioielleria storica napoletana, lavorazioni corallo e cammei', true),
('Partenope Diamonds', 'Gioiellerie', 'Campania', 'Napoli', 'Napoli', '+39 081 7654321', 'info@partenopediamonds.it', 'https://www.partenopediamonds.it', 'Anelli con diamanti naturali e lab-grown, ampia scelta', true),
-- Piemonte
('Torino Jewels', 'Gioiellerie', 'Piemonte', 'Torino', 'Torino', '+39 011 2345678', 'info@torinojewels.it', 'https://www.torinojewels.it', 'Fedi comfort-fit e incastonatura artigianale', true),
('Valenza Oro Atelier', 'Gioiellerie', 'Piemonte', 'Alessandria', 'Valenza', '+39 0131 234567', 'info@valenzaoroatelier.it', 'https://www.valenzaoroatelier.it', 'Capitale dell’oro: creazioni su misura direttamente dai maestri orafi', true);
