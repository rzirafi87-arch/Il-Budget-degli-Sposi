-- DANGER: This will DROP existing tables. Run only if you want a clean reset.
-- Recommended order to satisfy dependencies.

DROP TABLE IF EXISTS public.wedding_cards CASCADE;
DROP TABLE IF EXISTS public.incomes CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.churches CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
