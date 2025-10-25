-- Seed aggiuntivo per categoria "Beauty & Benessere"
-- Espande la categoria già presente con nuovi fornitori realistici
-- Per essere eseguito DOPO supabase-suppliers-seed.sql

INSERT INTO suppliers (name, category, region, province, city, phone, email, website, description, verified) VALUES

-- Lombardia - Milano
('Aldo Coppola Milano', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 76002000', 'info@aldocoppola.it', 'https://www.aldocoppola.it', 'Parrucchiera - Salone di alta moda, acconciature sposa esclusive, team esperto per look perfetto il giorno del matrimonio', true),
('Diego Dalla Palma Beauty Corner', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 76003456', 'info@diegodallapalma.com', 'https://www.diegodallapalma.com', 'Make-up - Make-up artist professionista, trucco sposa con prodotti di alta qualità, prova trucco inclusa', true),
('Centro Benessere Oasi Spa', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 89456789', 'info@oasispa.it', 'https://www.oasispa.it', 'Estetista - Pacchetti sposa completi: trattamenti viso, corpo, manicure, pedicure. Preparazione perfetta per il grande giorno', true),
('Kemon Academy', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 48197777', 'info@kemon.it', 'https://www.kemon.it', 'Parrucchiera - Accademia di bellezza con hair stylist esperti, acconciature moderne e classiche per spose', true),
('Estetica Medica Beauty Clinic', 'Beauty & Benessere', 'Lombardia', 'Milano', 'Milano', '+39 02 76543210', 'info@beautymedical.it', 'https://www.beautymedicalclinic.it', 'Estetista - Trattamenti estetici avanzati pre-matrimonio: radiofrequenza, peeling, filler labbra, microblading', true),

-- Lazio - Roma
('Jean Louis David Roma Prati', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 3214567', 'info@jeanlouisdavid.it', 'https://www.jeanlouisdavid.it', 'Parrucchiera - Salone internazionale con hair stylist formati, acconciature sposa eleganti e raffinate', true),
('Makeup Forever Academy Roma', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 6789123', 'info@makeupforever.it', 'https://www.makeupforever.it', 'Make-up - Make-up artist professionisti, trucco sposa naturale o glamour, lunga durata garantita', true),
('Centro Estetico Armonia', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 5551234', 'info@esteticaarmonia.it', 'https://www.centroesteticoarmonia.it', 'Estetista - Pacchetti sposa: trattamenti viso illuminanti, massaggi rilassanti, manicure semipermanente', true),
('Salone Compagnia della Bellezza', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 3217890', 'info@compagniabellezza.it', 'https://www.compagniabellezza.it', 'Parrucchiera - Salone storico romano, acconciature sposa da sogno con fiori e accessori su misura', true),
('Bio Beauty Natura', 'Beauty & Benessere', 'Lazio', 'Roma', 'Roma', '+39 06 4567890', 'info@biobeautynatura.it', 'https://www.biobeautyroma.it', 'Estetista - Centro estetico biologico, trattamenti naturali viso e corpo, cosmetici certificati', true),

-- Toscana - Firenze
('Salone Rossano Ferretti', 'Beauty & Benessere', 'Toscana', 'Firenze', 'Firenze', '+39 055 2345678', 'info@rossanoferretti.com', 'https://www.rossanoferretti.com', 'Parrucchiera - Hair stylist delle celebrità, acconciature sposa luxury e taglio invisibile', true),
('Atelier Make-up Firenze', 'Beauty & Benessere', 'Toscana', 'Firenze', 'Firenze', '+39 055 8765432', 'info@ateliermakeup.it', 'https://www.ateliermakeupfirenze.it', 'Make-up - Make-up artist specializzati in trucco sposa, airbrush e tecniche HD per fotografia', true),
('Beauty & Relax Toscana', 'Beauty & Benessere', 'Toscana', 'Firenze', 'Firenze', '+39 055 3456789', 'info@beautyrelax.it', 'https://www.beautyrelaxtoscana.it', 'Estetista - Centro benessere con sauna, bagno turco e massaggi. Pacchetti relax pre-matrimonio', true),
('Parrucchieri Antica Corte', 'Beauty & Benessere', 'Toscana', 'Siena', 'Siena', '+39 0577 123456', 'info@anticacorte.it', 'https://www.parrucchierianticacorte.it', 'Parrucchiera - Salone nel cuore di Siena, acconciature sposa ispirate al Rinascimento toscano', true),

-- Campania - Napoli
('Glamour Hair Studio', 'Beauty & Benessere', 'Campania', 'Napoli', 'Napoli', '+39 081 7654321', 'info@glamourhair.it', 'https://www.glamourhairnapoli.it', 'Parrucchiera - Hair stylist napoletani creativi, acconciature sposa raccolte e semi-raccolte con extension', true),
('Make-up Artist Napoli Pro', 'Beauty & Benessere', 'Campania', 'Napoli', 'Napoli', '+39 081 2345678', 'info@makeupnapoli.it', 'https://www.makeupartistnapoli.it', 'Make-up - Team di truccatori professionisti, trucco sposa waterproof e lunga tenuta', true),
('Centro Estetico Venere', 'Beauty & Benessere', 'Campania', 'Salerno', 'Salerno', '+39 089 765432', 'info@esteticavenere.it', 'https://www.centroveneresalerno.it', 'Estetista - Trattamenti viso anti-età, epilazione definitiva laser, ricostruzione unghie gel', true),
('Salone Capelli d''Oro', 'Beauty & Benessere', 'Campania', 'Napoli', 'Napoli', '+39 081 9876543', 'info@capellidoro.it', 'https://www.capellidoronapoli.it', 'Parrucchiera - Salone con 20 anni di esperienza, acconciature sposa e trattamenti capelli premium', true),

-- Veneto - Venezia/Verona
('Aldo Coppola Venezia', 'Beauty & Benessere', 'Veneto', 'Venezia', 'Venezia', '+39 041 5287654', 'venezia@aldocoppola.it', 'https://www.aldocoppola.it', 'Parrucchiera - Salone di alta moda, acconciature sposa raffinate per matrimoni veneziani da sogno', true),
('Beauty Lounge Verona', 'Beauty & Benessere', 'Veneto', 'Verona', 'Verona', '+39 045 8765432', 'info@beautylounge.vr.it', 'https://www.beautyloungevr.it', 'Make-up - Make-up artist e hair stylist, servizio completo sposa con prova a domicilio', true),
('Estetica Dolce Vita Venezia', 'Beauty & Benessere', 'Veneto', 'Venezia', 'Venezia', '+39 041 2345678', 'info@dolcevitavenezia.it', 'https://www.dolcevitaestetica.it', 'Estetista - Centro estetico luxury, massaggi orientali, scrub corpo e viso luminoso sposa', true),

-- Puglia
('Salone Bellezza Adriatica', 'Beauty & Benessere', 'Puglia', 'Bari', 'Bari', '+39 080 5234567', 'info@bellezzaadriatica.it', 'https://www.bellezzaadriaticabari.it', 'Parrucchiera - Hair stylist pugliesi esperti, acconciature sposa mediterranee con accessori mare', true),
('Make-up & Beauty Salento', 'Beauty & Benessere', 'Puglia', 'Lecce', 'Lecce', '+39 0832 765432', 'info@makeupbeautysalento.it', 'https://www.beautysalento.it', 'Make-up - Truccatori professionisti, trucco sposa naturale e abbronzatura spray', true),
('Centro Benessere Trulli Wellness', 'Beauty & Benessere', 'Puglia', 'Bari', 'Alberobello', '+39 080 4321098', 'info@trulliwellness.it', 'https://www.trulliwellness.it', 'Estetista - SPA nei trulli, massaggi con olio extravergine, trattamenti corpo detox sposa', true),

-- Sicilia
('Hair Beauty Sicilia', 'Beauty & Benessere', 'Sicilia', 'Palermo', 'Palermo', '+39 091 6543210', 'info@hairbeautysicilia.it', 'https://www.hairbeautypalermo.it', 'Parrucchiera - Salone moderno con acconciature sposa mediterranee, chignon e trecce artistiche', true),
('Make-up Artist Taormina', 'Beauty & Benessere', 'Sicilia', 'Messina', 'Taormina', '+39 0942 123456', 'info@makeupartisttaormina.it', 'https://www.makeuptaormina.it', 'Make-up - Truccatori per matrimoni luxury in Sicilia, trucco sposa a domicilio in hotel', true),
('Estetica Etna Beauty', 'Beauty & Benessere', 'Sicilia', 'Catania', 'Catania', '+39 095 7654321', 'info@etnabeauty.it', 'https://www.etnabeautycatania.it', 'Estetista - Centro estetico con trattamenti viso alle pietre laviche dell''Etna, rituali benessere', true),

-- Emilia-Romagna
('Compagnia della Bellezza Bologna', 'Beauty & Benessere', 'Emilia-Romagna', 'Bologna', 'Bologna', '+39 051 2345678', 'info@compagniabologna.it', 'https://www.compagniabellezza.it', 'Parrucchiera - Salone nel cuore di Bologna, acconciature sposa classiche e moderne', true),
('Atelier Makeup Bologna', 'Beauty & Benessere', 'Emilia-Romagna', 'Bologna', 'Bologna', '+39 051 8765432', 'info@ateliermakeupbo.it', 'https://www.ateliermakeupbologna.it', 'Make-up - Make-up artist con portfolio internazionale, trucco sposa HD e airbrush', true),
('Centro Estetico Riviera Romagna', 'Beauty & Benessere', 'Emilia-Romagna', 'Rimini', 'Rimini', '+39 0541 987654', 'info@rivierabeauty.it', 'https://www.esteticariviera.it', 'Estetista - Centro estetico sulla riviera, abbronzatura spray, epilazione laser, massaggi', true),

-- Piemonte
('Salone Elegance Torino', 'Beauty & Benessere', 'Piemonte', 'Torino', 'Torino', '+39 011 8765432', 'info@elegancetorino.it', 'https://www.saloneleganceto.it', 'Parrucchiera - Hair stylist torinesi, acconciature sposa eleganti e sofisticate, servizio a domicilio', true),
('Make-up Studio Torino', 'Beauty & Benessere', 'Piemonte', 'Torino', 'Torino', '+39 011 2345678', 'info@makeupstudioto.it', 'https://www.makeupstudiotorino.it', 'Make-up - Team di truccatori professionisti, trucco sposa con prodotti luxury internazionali', true),
('Wellness & Beauty Langhe', 'Beauty & Benessere', 'Piemonte', 'Cuneo', 'Alba', '+39 0173 654321', 'info@wellnesslanghe.it', 'https://www.wellnesslanghe.it', 'Estetista - SPA nelle Langhe, vinoterapia, massaggi con oli essenziali, percorsi benessere', true),

-- Sardegna
('Hair Studio Costa Smeralda', 'Beauty & Benessere', 'Sardegna', 'Sassari', 'Porto Cervo', '+39 0789 123456', 'info@haircostasmeralda.it', 'https://www.hairstudiocostasmeralda.it', 'Parrucchiera - Salone luxury in Costa Smeralda, acconciature sposa mare con accessori naturali', true),
('Makeup & Beauty Cagliari', 'Beauty & Benessere', 'Sardegna', 'Cagliari', 'Cagliari', '+39 070 7654321', 'info@makeupbeautyca.it', 'https://www.makeupbeautycagliari.it', 'Make-up - Make-up artist sardi, trucco sposa resistente al sole e al mare mediterraneo', true),
('Centro Estetico Nuraghe Beauty', 'Beauty & Benessere', 'Sardegna', 'Cagliari', 'Cagliari', '+39 070 2345678', 'info@nuraghebeauty.it', 'https://www.nuraghebeauty.it', 'Estetista - Trattamenti estetici con prodotti sardi naturali, miele, mirto, olio di lentisco', true);
