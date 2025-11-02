-- Extend existing traditions table with detailed columns and seed examples

-- Add columns if they don't exist
ALTER TABLE IF EXISTS public.traditions
  ADD COLUMN IF NOT EXISTS rito TEXT,
  ADD COLUMN IF NOT EXISTS stile TEXT,
  ADD COLUMN IF NOT EXISTS colori TEXT,
  ADD COLUMN IF NOT EXISTS regali TEXT,
  ADD COLUMN IF NOT EXISTS durata TEXT,
  ADD COLUMN IF NOT EXISTS festa TEXT,
  ADD COLUMN IF NOT EXISTS usanze TEXT;

-- Seed examples (Italy, Mexico, Japan). Adjust or add more as needed.
-- Uses a simple guard to avoid duplications by (country_code, name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'it' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali italiane principali',
      'it',
      'Cerimonia religiosa (cattolica) o civile. Scambio delle fedi; lancio del riso come augurio di prosperità.',
      'Eleganza classica o country chic',
      'Colori neutri, fiori bianchi, dettagli naturali (olivo, gypsophila).',
      'Lista nozze o busta; bomboniera di ringraziamento.',
      'Preparativi lunghi (6–12 mesi). Ricevimento con cena e torta nuziale.',
      'Taglio torta con musica; auto decorata; confetti e tableau mariage.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'mx' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali messicane principali',
      'mx',
      'Cerimonia cattolica. Lazo (corda a forma di otto) e arras (13 monete) come simboli.',
      'Colori vivaci; abiti decorati; musica mariachi.',
      NULL,
      'Denaro o oggetti per la casa; lista nozze simile a quella europea.',
      'Festeggiamenti anche di 2 giorni, con messa e festa serale.',
      'Ballo del dollaro; piñata; fuochi d’artificio; ingresso trionfale con mariachi.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'jp' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali giapponesi principali',
      'jp',
      'Cerimonia shintō in tempio o moderna in hotel; rito del saké (san-san-kudo).',
      'Kimono bianco (shiromuku); decorazioni minimal e floreali.',
      NULL,
      'Buste di denaro (goshugi).',
      'Cerimonia breve e formale; ricevimento ordinato.',
      'Sedute per rango familiare; cucina artistica; cambi abito della sposa.',
      NULL
    );
  END IF;
END
$$;

