-- Zero-row old-server direct DML, rollback only; works before and after migration #11.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL ROLE service_role;
INSERT INTO public.tables SELECT * FROM public.tables WHERE false;
UPDATE public.tables SET table_number=table_number WHERE false;
DELETE FROM public.tables WHERE false;
INSERT INTO public.table_assignments SELECT * FROM public.table_assignments WHERE false;
UPDATE public.table_assignments SET id=id WHERE false;
DELETE FROM public.table_assignments WHERE false;
SELECT 1 FROM public.tables WHERE false;
SELECT 1 FROM public.table_assignments WHERE false;
ROLLBACK;
\echo OLD APP SEATING WRITES AVAILABLE
