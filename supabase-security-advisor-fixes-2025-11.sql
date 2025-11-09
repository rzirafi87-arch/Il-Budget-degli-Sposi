-- SECURITY ADVISOR FIXES - NOV 2025
-- Questo script corregge i principali errori/warning di sicurezza segnalati da Supabase Security Advisor
-- 1. Rimuove SECURITY DEFINER dalle view
-- 2. Abilita RLS e aggiunge policy minime sulle tabelle esposte
-- 3. Imposta search_path sicuro nelle funzioni

-- 1. RIMUOVI SECURITY DEFINER DALLE VIEW (definizioni corrette)
DROP VIEW IF EXISTS public.top_vendors_by_region CASCADE;
CREATE OR REPLACE VIEW public.top_vendors_by_region
SECURITY INVOKER
AS
SELECT
	region,
	name,
	category,
	rating,
	verified
FROM public.vendors
WHERE verified = true
ORDER BY region, rating DESC NULLS LAST;

DROP VIEW IF EXISTS public.location_stats_by_region CASCADE;
CREATE OR REPLACE VIEW public.location_stats_by_region
SECURITY INVOKER
AS
SELECT
	region,
	COUNT(*) as location_count,
	AVG(CASE WHEN verified THEN 1 ELSE 0 END) as verified_percentage
FROM public.locations
GROUP BY region;

DROP VIEW IF EXISTS public.high_rated_locations CASCADE;
CREATE OR REPLACE VIEW public.high_rated_locations
SECURITY INVOKER
AS
SELECT
	name,
	region,
	province,
	city,
	location_type,
	capacity_max
FROM public.locations
WHERE verified = true
ORDER BY name;

DROP VIEW IF EXISTS public.vendors_with_places CASCADE;
CREATE OR REPLACE VIEW public.vendors_with_places
SECURITY INVOKER
AS
SELECT
	v.id,
	v.name,
	v.region,
	v.category,
	COUNT(vp.place_id) as places_count
FROM public.vendors v
LEFT JOIN public.vendor_places vp ON v.id = vp.vendor_id
GROUP BY v.id, v.name, v.region, v.category;

DROP VIEW IF EXISTS public.sync_stats CASCADE;
CREATE OR REPLACE VIEW public.sync_stats
SECURITY INVOKER
AS
SELECT
	status,
	COUNT(*) as count,
	MAX(completed_at) as last_completed
FROM public.sync_jobs
GROUP BY status;

-- 3. FUNZIONI CORRETTE CON search_path SICURO
-- Esempio: is_subscription_active
CREATE OR REPLACE FUNCTION public.is_subscription_active(
	p_subscription_tier TEXT,
	p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
	SET search_path = public, pg_temp;
BEGIN
	IF p_subscription_tier = 'free' THEN
		RETURN true;
	END IF;
	IF p_expires_at IS NULL THEN
		RETURN false;
	END IF;
	RETURN p_expires_at > TIMEZONE('utc', NOW());
END;
$$;

-- Esempio: get_visible_suppliers
CREATE OR REPLACE FUNCTION public.get_visible_suppliers(
	p_category TEXT DEFAULT NULL,
	p_region TEXT DEFAULT NULL,
	p_province TEXT DEFAULT NULL,
	p_is_demo BOOLEAN DEFAULT false
)
RETURNS TABLE (
	id UUID,
	name TEXT,
	region TEXT,
	province TEXT,
	city TEXT,
	address TEXT,
	phone TEXT,
	email TEXT,
	website TEXT,
	description TEXT,
	category TEXT,
	verified BOOLEAN,
	subscription_tier TEXT,
	is_featured BOOLEAN
)
LANGUAGE plpgsql
AS $$
	SET search_path = public, pg_temp;
BEGIN
	RETURN QUERY
	SELECT
		s.id, s.name, s.region, s.province, s.city, s.address,
		s.phone, s.email, s.website, s.description, s.category,
		s.verified, s.subscription_tier, s.is_featured
	FROM public.suppliers s
	WHERE
		(p_category IS NULL OR s.category = p_category)
		AND (p_region IS NULL OR s.region = p_region)
		AND (p_province IS NULL OR s.province = p_province)
		AND (
			(s.subscription_tier = 'premium_plus' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at))
			OR (s.subscription_tier = 'premium' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND NOT p_is_demo)
			OR (s.subscription_tier = 'base' AND public.is_subscription_active(s.subscription_tier, s.subscription_expires_at) AND p_category IS NOT NULL AND NOT p_is_demo)
		)
	ORDER BY
		CASE WHEN s.subscription_tier = 'premium_plus' THEN 1
				 WHEN s.subscription_tier = 'premium' THEN 2
				 WHEN s.subscription_tier = 'base' THEN 3
				 ELSE 4 END,
		s.is_featured DESC,
		s.name ASC;
END;
$$;

-- Esempio: seed_categories
CREATE OR REPLACE FUNCTION seed_categories(p_event UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
	SET search_path = public, pg_temp;
BEGIN
	INSERT INTO public.categories (id, event_id, name)
	SELECT uuid_generate_v4(), p_event, t.name
	FROM (VALUES
		('Sposa'),
		('Sposo'),
		('Abiti & Accessori (altri)'),
		('Cerimonia'),
		('Location & Catering'),
		('Fiori & Decor'),
		('Foto & Video'),
		('Inviti & Stationery'),
		('Musica & Intrattenimento'),
		('Beauty & Benessere'),
		('Bomboniere & Regali'),
		('Trasporti'),
		('Ospitalità & Logistica'),
		('Viaggio di nozze'),
		('Staff & Coordinamento'),
		('Burocrazia & Documenti'),
		('Comunicazione & Media'),
		('Extra & Contingenze')
	) AS t(name);
END $$;

-- Esempio: seed_subcategories
CREATE OR REPLACE FUNCTION seed_subcategories(p_category UUID, VARIADIC p_names TEXT[])
RETURNS VOID LANGUAGE plpgsql AS $$
	SET search_path = public, pg_temp;
DECLARE
	n TEXT;
BEGIN
	FOREACH n IN ARRAY p_names LOOP
		INSERT INTO public.subcategories (id, category_id, name)
		VALUES (uuid_generate_v4(), p_category, n);
	END LOOP;
END $$;

-- Esempio: seed_full_event
CREATE OR REPLACE FUNCTION seed_full_event(p_event UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
	SET search_path = public, pg_temp;
BEGIN
	DELETE FROM public.subcategories
	WHERE category_id IN (
		SELECT id FROM public.categories WHERE event_id = p_event
	);
	DELETE FROM public.categories WHERE event_id = p_event;
	WITH c AS (
		INSERT INTO public.categories (event_id, name)
		SELECT p_event, unnest(ARRAY[
			'Sposa',
			'Sposo',
			'Abiti & Accessori (altri)',
			'Cerimonia',
			'Location & Catering',
			'Fiori & Decor',
			'Foto & Video',
			'Inviti & Stationery',
			'Musica & Intrattenimento',
			'Beauty & Benessere',
			'Bomboniere & Regali',
			'Trasporti',
			'Ospitalità & Logistica',
			'Viaggio di nozze',
			'Staff & Coordinamento',
			'Burocrazia & Documenti',
			'Comunicazione & Media',
			'Extra & Contingenze'
		])
		RETURNING id, name
	)
	INSERT INTO public.subcategories (category_id, name)
	VALUES
		((SELECT id FROM c WHERE name = 'Sposa'), 'Abito sposa'),
		((SELECT id FROM c WHERE name = 'Sposa'), 'Scarpe sposa'),
		((SELECT id FROM c WHERE name = 'Sposa'), 'Accessori sposa'),
		((SELECT id FROM c WHERE name = 'Sposa'), 'Acconciatura'),
		((SELECT id FROM c WHERE name = 'Sposa'), 'Trucco'),
		((SELECT id FROM c WHERE name = 'Sposo'), 'Abito sposo'),
		((SELECT id FROM c WHERE name = 'Sposo'), 'Scarpe sposo'),
		((SELECT id FROM c WHERE name = 'Sposo'), 'Accessori sposo'),
		((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Damigelle'),
		((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Paggetti'),
		((SELECT id FROM c WHERE name = 'Abiti & Accessori (altri)'), 'Accessori vari'),
		((SELECT id FROM c WHERE name = 'Cerimonia'), 'Chiesa / Comune'),
		((SELECT id FROM c WHERE name = 'Cerimonia'), 'Documenti e pratiche'),
		((SELECT id FROM c WHERE name = 'Cerimonia'), 'Offertorio / celebrante'),
		((SELECT id FROM c WHERE name = 'Location & Catering'), 'Location'),
		((SELECT id FROM c WHERE name = 'Location & Catering'), 'Catering / menù'),
		((SELECT id FROM c WHERE name = 'Location & Catering'), 'Torta nuziale'),
		((SELECT id FROM c WHERE name = 'Location & Catering'), 'Mise en place / allestimenti'),
		((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Bouquet sposa'),
		((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Allestimenti floreali'),
		((SELECT id FROM c WHERE name = 'Fiori & Decor'), 'Centrotavola'),
		((SELECT id FROM c WHERE name = 'Foto & Video'), 'Fotografo'),
		((SELECT id FROM c WHERE name = 'Foto & Video'), 'Videomaker'),
		((SELECT id FROM c WHERE name = 'Foto & Video'), 'Album / stampe'),
		((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Partecipazioni'),
		((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Tableau / segnaposto'),
		((SELECT id FROM c WHERE name = 'Inviti & Stationery'), 'Menù'),
		((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Musica cerimonia'),
		((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'DJ / Band ricevimento'),
		((SELECT id FROM c WHERE name = 'Musica & Intrattenimento'), 'Animazione / intrattenimento'),
		((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova trucco'),
		((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Prova acconciatura'),
		((SELECT id FROM c WHERE name = 'Beauty & Benessere'), 'Trattamenti estetici'),
		((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Bomboniere'),
		((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Confetti e sacchetti'),
		((SELECT id FROM c WHERE name = 'Bomboniere & Regali'), 'Regali testimoni'),
		((SELECT id FROM c WHERE name = 'Trasporti'), 'Auto sposi'),
		((SELECT id FROM c WHERE name = 'Trasporti'), 'Transfer invitati'),
		((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Alloggi invitati'),
		((SELECT id FROM c WHERE name = 'Ospitalità & Logistica'), 'Bus navetta / logistica'),
		((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Voli'),
		((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Sistemazione'),
		((SELECT id FROM c WHERE name = 'Viaggio di nozze'), 'Attività'),
		((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Wedding planner'),
		((SELECT id FROM c WHERE name = 'Staff & Coordinamento'), 'Coordinamento giorno evento'),
		((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Marche da bollo / diritti'),
		((SELECT id FROM c WHERE name = 'Burocrazia & Documenti'), 'Certificati / copie'),
		((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Sito matrimonio'),
		((SELECT id FROM c WHERE name = 'Comunicazione & Media'), 'Save the date / comunicazioni'),
		((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Extra vari'),
		((SELECT id FROM c WHERE name = 'Extra & Contingenze'), 'Fondo imprevisti');
END;
$$;
ALTER TABLE public.vendor_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendor_places_select ON public.vendor_places FOR SELECT USING (true);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY places_select ON public.places FOR SELECT USING (true);

ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sync_jobs_select ON public.sync_jobs FOR SELECT USING (true);

-- 3. IMPOSTA search_path SICURO NELLE FUNZIONI
-- Esempio per una funzione, ripetere per tutte quelle segnalate:
-- CREATE OR REPLACE FUNCTION public.is_subscription_active(...) RETURNS ... AS $$
--   SET search_path = public;
--   ...funzione...
-- $$ LANGUAGE plpgsql;

-- TODO: Sostituire le definizioni delle view e funzioni con le versioni corrette senza SECURITY DEFINER e con search_path impostato.
-- Dopo aver applicato queste modifiche, eseguire "Rerun linter" su Supabase Security Advisor.
