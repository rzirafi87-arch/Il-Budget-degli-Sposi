-- Seed data for churches table
-- Variety of Italian churches and religious venues across different regions

INSERT INTO churches (name, region, province, city, address, phone, email, website, description, church_type, capacity, requires_baptism, requires_marriage_course, verified) VALUES

-- Lazio - Roma
('Basilica di San Pietro', 'Lazio', 'Roma', 'Città del Vaticano', 'Piazza San Pietro', '+39 06 6988 1662', 'info@fsp.va', 'https://www.vatican.va', 'La basilica più importante della cristianità, richiede permessi speciali per celebrare matrimoni.', 'cattolica', 15000, true, true, true),
('Chiesa di Santa Maria in Trastevere', 'Lazio', 'Roma', 'Roma', 'Piazza Santa Maria in Trastevere', '+39 06 581 4802', 'info@santamariaintrastevere.it', 'https://www.santamariaintrastevere.org', 'Una delle chiese più antiche di Roma, mosaici bizantini e atmosfera romantica.', 'cattolica', 200, true, true, true),
('Chiesa del Gesù', 'Lazio', 'Roma', 'Roma', 'Piazza del Gesù', '+39 06 697001', 'info@chiesadelgesu.org', 'https://www.chiesadelgesu.org', 'Chiesa madre dei Gesuiti, capolavoro del barocco romano.', 'cattolica', 300, true, true, true),
('Basilica di San Giovanni in Laterano', 'Lazio', 'Roma', 'Roma', 'Piazza di San Giovanni in Laterano, 4', '+39 06 6988 6433', 'info@basilicasangiovanni.va', 'https://www.vatican.va/various/basiliche/san_giovanni', 'Cattedrale di Roma, "madre di tutte le chiese". Richiede permessi speciali.', 'cattolica', 7000, true, true, true),

-- Toscana
('Duomo di Firenze', 'Toscana', 'Firenze', 'Firenze', 'Piazza del Duomo', '+39 055 230 2885', 'info@duomofirenze.it', 'https://www.duomofirenze.it', 'Cattedrale di Santa Maria del Fiore, icona del Rinascimento fiorentino.', 'cattolica', 30000, true, true, true),
('Basilica di San Miniato al Monte', 'Toscana', 'Firenze', 'Firenze', 'Via delle Porte Sante, 34', '+39 055 234 2731', 'info@sanminiatoalmonte.it', 'https://www.sanminiatoalmonte.it', 'Chiesa romanica sulla collina, vista mozzafiato su Firenze.', 'cattolica', 200, true, true, true),
('Abbazia di Sant\'Antimo', 'Toscana', 'Siena', 'Montalcino', 'Castelnuovo dell\'Abate', '+39 0577 835659', 'info@antimo.it', 'https://www.antimo.it', 'Abbazia benedettina del XII secolo, canti gregoriani e architettura romanica.', 'cattolica', 150, true, true, true),
('Pieve di San Leolino', 'Toscana', 'Firenze', 'Panzano in Chianti', 'Località Pieve di San Leolino', '+39 055 852621', 'info@pievesanleolino.it', 'https://www.pievesanleolino.it', 'Pieve romanica del X secolo nel cuore del Chianti.', 'cattolica', 100, true, true, true),

-- Lombardia
('Duomo di Milano', 'Lombardia', 'Milano', 'Milano', 'Piazza del Duomo', '+39 02 7202 2656', 'info@duomomilano.it', 'https://www.duomomilano.it', 'Cattedrale gotica simbolo di Milano, terza chiesa cattolica al mondo per superficie.', 'cattolica', 40000, true, true, true),
('Basilica di Sant\'Ambrogio', 'Lombardia', 'Milano', 'Milano', 'Piazza Sant\'Ambrogio, 15', '+39 02 8645 0895', 'info@basilicasantambrogio.it', 'https://www.basilicasantambrogio.it', 'Una delle più antiche chiese di Milano, stile romanico-lombardo.', 'cattolica', 300, true, true, true),
('Chiesa di Santa Maria del Tiglio', 'Lombardia', 'Como', 'Gravedona', 'Via Regina', '+39 0344 85003', 'info@santamariadeliglio.it', 'https://www.santamariadeltiglio.it', 'Chiesa romanica del XII secolo sul Lago di Como.', 'cattolica', 80, true, true, true),

-- Campania
('Duomo di Amalfi', 'Campania', 'Salerno', 'Amalfi', 'Piazza Duomo', '+39 089 871059', 'info@duomoamalfi.it', 'https://www.duomoamalfi.it', 'Cattedrale in stile arabo-normanno, scalinata monumentale con vista mare.', 'cattolica', 400, true, true, true),
('Chiesa di San Francesco', 'Campania', 'Salerno', 'Ravello', 'Piazza Vescovado', '+39 089 857657', 'info@sanfrancescoravello.it', 'https://www.sanfrancescoravello.it', 'Chiesa del XIII secolo con chiostro romanico e vista sulla costiera.', 'cattolica', 120, true, true, true),
('Certosa di San Martino', 'Campania', 'Napoli', 'Napoli', 'Largo San Martino, 5', '+39 081 229 4502', 'info@certosasanmartino.it', 'https://www.polomusealecampania.beniculturali.it/museo-di-san-martino', 'Monastero certosino con vista panoramica su Napoli e il Golfo.', 'cattolica', 200, true, true, true),

-- Puglia
('Basilica di San Nicola', 'Puglia', 'Bari', 'Bari', 'Largo Abate Elia, 13', '+39 080 573 7111', 'info@basilicasannicola.it', 'https://www.basilicasannicola.it', 'Basilica romanica che custodisce le reliquie di San Nicola.', 'cattolica', 500, true, true, true),
('Cattedrale di Trani', 'Puglia', 'Barletta-Andria-Trani', 'Trani', 'Piazza Duomo', '+39 0883 582952', 'info@cattedraletrani.it', 'https://www.cattedraletrani.it', 'Cattedrale romanica affacciata sul mare, una delle più belle della Puglia.', 'cattolica', 300, true, true, true),
('Chiesa Matrice di Polignano', 'Puglia', 'Bari', 'Polignano a Mare', 'Piazza Vittorio Emanuele II', '+39 080 424 2583', 'info@chiesamatrice.it', 'https://www.chiesamatrice.polignano.it', 'Chiesa settecentesca nel centro storico affacciato sul mare.', 'cattolica', 250, true, true, true),

-- Sicilia
('Duomo di Monreale', 'Sicilia', 'Palermo', 'Monreale', 'Piazza Guglielmo II', '+39 091 640 4413', 'info@duomomonreale.it', 'https://www.monrealeduomo.it', 'Capolavoro dell\'arte normanna, mosaici bizantini dorati patrimonio UNESCO.', 'cattolica', 1000, true, true, true),
('Cattedrale di Siracusa', 'Sicilia', 'Siracusa', 'Siracusa', 'Piazza Duomo, 5', '+39 0931 65328', 'info@duomosiracusa.it', 'https://www.duomosiracusa.it', 'Tempio greco trasformato in cattedrale cristiana, unica al mondo.', 'cattolica', 400, true, true, true),
('Chiesa di San Giuseppe dei Teatini', 'Sicilia', 'Palermo', 'Palermo', 'Corso Vittorio Emanuele', '+39 091 331779', 'info@sangiuseppeteatini.it', 'https://www.sangiuseppedeiteatini.it', 'Chiesa barocca con stucchi e marmi policromi, una delle più belle di Palermo.', 'cattolica', 200, true, true, true),

-- Veneto
('Basilica di San Marco', 'Veneto', 'Venezia', 'Venezia', 'Piazza San Marco', '+39 041 270 8311', 'info@basilicasanmarco.it', 'https://www.basilicasanmarco.it', 'Basilica bizantina simbolo di Venezia, mosaici dorati e Pala d\'Oro.', 'cattolica', 4000, true, true, true),
('Chiesa di San Giorgio Maggiore', 'Veneto', 'Venezia', 'Venezia', 'Isola di San Giorgio Maggiore', '+39 041 522 7827', 'info@sangiorgio.org', 'https://www.abbaziasangiorgio.it', 'Chiesa palladiana sull\'isola, vista incantevole su Venezia e la laguna.', 'cattolica', 300, true, true, true),
('Basilica del Santo', 'Veneto', 'Padova', 'Padova', 'Piazza del Santo, 11', '+39 049 878 9722', 'info@basilicadelsanto.org', 'https://www.basilicadelsanto.org', 'Basilica dedicata a Sant\'Antonio, meta di pellegrinaggio mondiale.', 'cattolica', 3000, true, true, true),

-- Emilia-Romagna
('Basilica di San Petronio', 'Emilia-Romagna', 'Bologna', 'Bologna', 'Piazza Maggiore', '+39 051 225442', 'info@basilicadisanpetronio.it', 'https://www.basilicadisanpetronio.it', 'Una delle chiese più grandi d\'Europa, meridiana solare e cappelle affrescate.', 'cattolica', 3000, true, true, true),
('Basilica di Sant\'Apollinare in Classe', 'Emilia-Romagna', 'Ravenna', 'Ravenna', 'Via Romea Sud, 224', '+39 0544 473569', 'info@santapollinare.it', 'https://www.ravennamosaici.it', 'Basilica paleocristiana del VI secolo, mosaici bizantini patrimonio UNESCO.', 'cattolica', 200, true, true, true),

-- Piemonte
('Duomo di Torino', 'Piemonte', 'Torino', 'Torino', 'Piazza San Giovanni', '+39 011 436 1540', 'info@duomotorino.it', 'https://www.duomotorino.it', 'Cattedrale rinascimentale che custodisce la Sacra Sindone.', 'cattolica', 500, true, true, true),
('Santuario di Vicoforte', 'Piemonte', 'Cuneo', 'Vicoforte', 'Piazza Santuario, 1', '+39 0174 565732', 'info@santuariodivicoforte.it', 'https://www.santuariodivicoforte.it', 'Santuario barocco con la cupola ellittica più grande al mondo.', 'cattolica', 1500, true, true, true),

-- Sardegna
('Basilica di San Gavino', 'Sardegna', 'Sassari', 'Porto Torres', 'Piazza San Gavino', '+39 079 514471', 'info@sangavino.it', 'https://www.sangavino.org', 'Basilica romanica più grande della Sardegna, del XI secolo.', 'cattolica', 400, true, true, true),

-- Altre confessioni
('Grande Sinagoga di Roma', 'Lazio', 'Roma', 'Roma', 'Lungotevere Cenci', '+39 06 684 0061', 'info@romaebrea.it', 'https://www.romaebrea.it', 'Tempio maggiore della comunità ebraica romana, architettura liberty del 1904.', 'sinagoga', 1000, false, false, true),
('Chiesa Ortodossa Russa', 'Toscana', 'Firenze', 'Firenze', 'Via Leone X, 8', '+39 055 490148', 'info@chiesarussa.it', 'https://www.chiesarussafirenze.it', 'Chiesa ortodossa in stile russo-bizantino con cupole dorate.', 'ortodossa', 150, false, false, true),
('Chiesa Anglicana St. Mark', 'Toscana', 'Firenze', 'Firenze', 'Via Maggio, 16', '+39 055 294764', 'info@stmarks.it', 'https://www.stmarksflorence.it', 'Chiesa anglicana nel cuore di Firenze, comunità internazionale.', 'anglicana', 100, false, false, true);
