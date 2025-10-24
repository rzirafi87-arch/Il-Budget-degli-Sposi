-- Seed data per atelier sposa e sposo (brand famosi italiani e internazionali)

-- ATELIER SPOSA
INSERT INTO public.atelier (name, category, region, province, city, address, phone, email, website, description, price_range, styles, services, verified, source) VALUES
-- Lombardia
('Atelier Aimée', 'sposa', 'Lombardia', 'Milano', 'Milano', 'Via Montenapoleone, 8', '+39 02 76001728', 'info@atelieraimee.it', 'https://www.atelieraimee.it', 'Collezioni esclusive di abiti da sposa haute couture con tessuti pregiati italiani', '€€€€', ARRAY['Classico', 'Romantico', 'Principessa'], ARRAY['Sartoria su misura', 'Accessori', 'Modifiche'], true, 'manual'),
('Pronovias Milano', 'sposa', 'Lombardia', 'Milano', 'Milano', 'Via della Spiga, 30', '+39 02 76020345', 'milano@pronovias.it', 'https://www.pronovias.it', 'Brand internazionale con collezioni moderne e sofisticate', '€€€', ARRAY['Moderno', 'Elegante', 'Boho'], ARRAY['Collezioni ready-to-wear', 'Sartoria', 'Accessori'], true, 'manual'),
('Rosa Clará Milano', 'sposa', 'Lombardia', 'Milano', 'Milano', 'Corso Venezia, 15', '+39 02 76318900', 'milano@rosaclara.it', 'https://www.rosaclara.it', 'Eleganza spagnola con linee contemporanee e raffinate', '€€€', ARRAY['Contemporaneo', 'Sofisticato', 'Minimale'], ARRAY['Collezioni complete', 'Modifiche sartoriali'], true, 'manual'),

-- Veneto
('Atelier Emé Venezia', 'sposa', 'Veneto', 'Venezia', 'Venezia', 'Piazza San Marco, 45', '+39 041 5224567', 'venezia@ateliereme.it', 'https://www.ateliereme.it', 'Tradizione artigianale veneziana con dettagli unici', '€€€', ARRAY['Vintage', 'Romantico', 'Raffinato'], ARRAY['Sartoria artigianale', 'Pizzi veneziani', 'Accessori'], true, 'manual'),
('Luisa Sposa Verona', 'sposa', 'Veneto', 'Verona', 'Verona', 'Via Mazzini, 78', '+39 045 8001234', 'info@luisasposa.it', 'https://www.luisasposa.it', 'Collezioni romantic chic per spose moderne', '€€€', ARRAY['Romantico', 'Chic', 'Moderno'], ARRAY['Collezioni complete', 'Personalizzazioni'], true, 'manual'),

-- Lazio
('Atelier Pronovias Roma', 'sposa', 'Lazio', 'Roma', 'Roma', 'Via del Corso, 123', '+39 06 6792345', 'roma@pronovias.it', 'https://www.pronovias.it', 'Showroom Pronovias nel cuore di Roma', '€€€', ARRAY['Moderno', 'Glamour', 'Elegante'], ARRAY['Collezioni complete', 'Consulenza styling'], true, 'manual'),
('Nicole Milano', 'sposa', 'Lazio', 'Roma', 'Roma', 'Via Condotti, 56', '+39 06 6780123', 'roma@nicolespose.it', 'https://www.nicolespose.it', 'Brand italiano di alta qualità con linee sofisticate', '€€€', ARRAY['Sofisticato', 'Elegante', 'Classico'], ARRAY['Made in Italy', 'Sartoria', 'Accessori'], true, 'manual'),

-- Toscana
('Atelier Signore Firenze', 'sposa', 'Toscana', 'Firenze', 'Firenze', 'Via Tornabuoni, 12', '+39 055 2398900', 'firenze@ateliersignore.it', 'https://www.ateliersignore.it', 'Eccellenza fiorentina nella moda sposa dal 1980', '€€€€', ARRAY['Haute Couture', 'Classico', 'Lusso'], ARRAY['Sartoria esclusiva', 'Tessuti pregiati', 'Consulenza privata'], true, 'manual'),
('Elisabetta Polignano Firenze', 'sposa', 'Toscana', 'Firenze', 'Firenze', 'Piazza della Repubblica, 8', '+39 055 2134567', 'firenze@elisabettapolignano.it', 'https://www.elisabettapolignano.com', 'Stile glamour e femminile, amato dalle celebrity', '€€€€', ARRAY['Glamour', 'Sexy', 'Moderno'], ARRAY['Collezioni esclusive', 'Red carpet style'], true, 'manual'),

-- Campania
('Atelier Morena Napoli', 'sposa', 'Campania', 'Napoli', 'Napoli', 'Via Chiaia, 34', '+39 081 4201234', 'napoli@morenasposa.it', 'https://www.morenasposa.it', 'Tradizione sartoriale napoletana per abiti da sogno', '€€€', ARRAY['Principessa', 'Romantico', 'Tradizionale'], ARRAY['Sartoria napoletana', 'Ricami a mano', 'Modifiche'], true, 'manual'),

-- Piemonte
('Atelier Tosetti Torino', 'sposa', 'Piemonte', 'Torino', 'Torino', 'Via Roma, 88', '+39 011 5617890', 'torino@tosettisposa.it', 'https://www.tosettisposa.it', 'Eleganza torinese con attenzione ai dettagli', '€€€', ARRAY['Elegante', 'Raffinato', 'Classico'], ARRAY['Sartoria', 'Consulenza', 'Accessori'], true, 'manual');

-- ATELIER SPOSO
INSERT INTO public.atelier (name, category, region, province, city, address, phone, email, website, description, price_range, styles, services, verified, source) VALUES
-- Lombardia
('Carlo Pignatelli Milano', 'sposo', 'Lombardia', 'Milano', 'Milano', 'Corso Venezia, 15', '+39 02 76002345', 'milano@carlopignatelli.it', 'https://www.carlopignatelli.it', 'Eccellenza italiana nel menswear formale, smoking e tight', '€€€€', ARRAY['Classico', 'Elegante', 'Sartoriale'], ARRAY['Sartoria su misura', 'Noleggio', 'Accessori'], true, 'manual'),
('Lubiam Mantova', 'sposo', 'Lombardia', 'Mantova', 'Mantova', 'Via Mantova, 88', '+39 0376 322456', 'info@lubiam.it', 'https://www.lubiam.it', 'Sartoria moderna con taglio impeccabile e tessuti pregiati', '€€€', ARRAY['Moderno', 'Slim Fit', 'Business'], ARRAY['Sartoria', 'Made in Italy', 'Consulenza stile'], true, 'manual'),
('Corneliani Milano', 'sposo', 'Lombardia', 'Milano', 'Milano', 'Via Sant''Andrea, 12', '+39 02 76317890', 'milano@corneliani.it', 'https://www.corneliani.com', 'Brand luxury con tradizione sartoriale dal 1930', '€€€€', ARRAY['Lusso', 'Sartoriale', 'Raffinato'], ARRAY['Alta sartoria', 'Personalizzazioni', 'Tessuti esclusivi'], true, 'manual'),

-- Lazio
('Cerimonia Uomo Roma', 'sposo', 'Lazio', 'Roma', 'Roma', 'Via del Corso, 234', '+39 06 6781234', 'roma@cerimoniauomo.it', 'https://www.cerimoniauomo.it', 'Specialisti in abiti da cerimonia e smoking per ogni occasione', '€€€', ARRAY['Cerimonia', 'Classico', 'Elegante'], ARRAY['Vendita e noleggio', 'Modifiche rapide', 'Consulenza'], true, 'manual'),
('Roberto Vicentti Roma', 'sposo', 'Lazio', 'Roma', 'Roma', 'Via Condotti, 89', '+39 06 6790123', 'roma@robertovicentti.it', 'https://www.robertovicentti.it', 'Stile italiano contemporaneo con attenzione al dettaglio', '€€€', ARRAY['Contemporaneo', 'Italiano', 'Elegante'], ARRAY['Collezioni complete', 'Personalizzazioni'], true, 'manual'),

-- Toscana
('Gentlemen''s Corner Firenze', 'sposo', 'Toscana', 'Firenze', 'Firenze', 'Via Tornabuoni, 22', '+39 055 2123456', 'firenze@gentlemenscorner.it', 'https://www.gentlemenscorner.it', 'Noleggio e vendita di abiti da cerimonia con ampia scelta di accessori', '€€', ARRAY['Classico', 'Vintage', 'Contemporary'], ARRAY['Noleggio', 'Vendita', 'Accessori completi'], true, 'manual'),
('Eredi Chiarini Firenze', 'sposo', 'Toscana', 'Firenze', 'Firenze', 'Piazza della Signoria, 5', '+39 055 2145678', 'info@eredichiarini.it', 'https://www.eredichiarini.it', 'Tradizione fiorentina dal 1860, sartoria d''eccellenza', '€€€€', ARRAY['Tradizionale', 'Sartoriale', 'Artigianale'], ARRAY['Alta sartoria', 'Su misura', 'Tessuti pregiati'], true, 'manual'),

-- Veneto
('Boggi Milano Venezia', 'sposo', 'Veneto', 'Venezia', 'Venezia', 'Mercerie San Salvador, 4818', '+39 041 5230567', 'venezia@boggi.com', 'https://www.boggi.com', 'Menswear italiano elegante e contemporaneo', '€€', ARRAY['Contemporaneo', 'Business', 'Smart'], ARRAY['Ready-to-wear', 'Modifiche', 'Styling'], true, 'manual'),

-- Campania
('Kiton Napoli', 'sposo', 'Campania', 'Napoli', 'Napoli', 'Via Calabritto, 7', '+39 081 7643210', 'napoli@kiton.it', 'https://www.kiton.it', 'Vertice della sartoria napoletana, luxury assoluto', '€€€€', ARRAY['Haute Couture', 'Napoletano', 'Lusso'], ARRAY['Sartoria napoletana', 'Su misura', 'Consulenza esclusiva'], true, 'manual'),
('Cesare Attolini Napoli', 'sposo', 'Campania', 'Napoli', 'Napoli', 'Via dei Mille, 16', '+39 081 7645678', 'info@cesareattolini.com', 'https://www.cesareattolini.com', 'Sartoria napoletana di altissimo livello artigianale', '€€€€', ARRAY['Sartoriale', 'Artigianale', 'Elegante'], ARRAY['Fatto a mano', 'Su misura', 'Tessuti esclusivi'], true, 'manual'),

-- Piemonte
('Corneliani Torino', 'sposo', 'Piemonte', 'Torino', 'Torino', 'Via Roma, 123', '+39 011 5421234', 'torino@corneliani.it', 'https://www.corneliani.com', 'Showroom Corneliani con collezioni complete', '€€€€', ARRAY['Lusso', 'Business', 'Elegante'], ARRAY['Collezioni complete', 'Consulenza', 'Modifiche'], true, 'manual');

-- Aggiorna timestamp
UPDATE public.atelier SET updated_at = NOW();
