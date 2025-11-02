-- Additional seed data for traditions table for more countries
-- Assumes table public.traditions already exists and has extended columns

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'es' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali spagnole principali',
      'es',
      'Cerimonie religiose o civili; uso del velo e mantiglia in alcune regioni.',
      'Eleganza mediterranea; musica e danza presenti.',
      'Colori caldi e floreali.',
      'Regali o denaro; bomboniere regionali.',
      'Ricevimenti vivaci con cucina locale.',
      'Musica e balli tradizionali, brindisi prolungati.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'fr' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali francesi principali',
      'fr',
      'Cerimonie civili obbligatorie, spesso seguite da rito religioso.',
      'Stile chic e raffinato.',
      'Toni pastello, fiori eleganti.',
      'Lista nozze o contributi; confetti meno diffusi.',
      'Ricevimenti lunghi con più portate e dessert spettacolari.',
      'Champagne, croquembouche, danze eleganti.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'de' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali tedesche principali',
      'de',
      'Cerimonie civili seguite da feste tra famiglia e amici.',
      'Stile sobrio e curato.',
      'Colori naturali; decorazioni semplici.',
      'Regali pratici o denaro.',
      'Feste con giochi e momenti conviviali.',
      'Polterabend (rottura piatti) in alcune regioni.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'ru' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali russe principali',
      'ru',
      'Cerimonie civili e religiose; forte coinvolgimento familiare.',
      'Stile elegante con elementi tradizionali.',
      'Colori intensi; decorazioni abbondanti.',
      'Regali in denaro o casa; usanze simboliche.',
      'Feste lunghe con brindisi e giochi.',
      'Pane e sale, brindisi, musica e balli.',
      NULL
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.traditions WHERE country_code = 'zh' AND name = 'Panoramica'
  ) THEN
    INSERT INTO public.traditions (name, description, country_code, rito, stile, colori, regali, durata, festa, usanze)
    VALUES (
      'Panoramica',
      'Tradizioni matrimoniali cinesi principali',
      'zh',
      'Riti tradizionali con offerte alla famiglia e simboli di prosperità.',
      'Abiti rossi tradizionali o stile moderno.',
      'Rosso e oro come colori portafortuna.',
      'Buste rosse (hongbao) con denaro.',
      'Ricevimenti con numerose portate e cerimonie simboliche.',
      'Gioielli d’oro, cerimonie del tè, fuochi d’artificio dove consentiti.',
      NULL
    );
  END IF;
END
$$;

