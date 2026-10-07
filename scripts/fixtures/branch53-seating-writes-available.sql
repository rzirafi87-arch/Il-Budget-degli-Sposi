-- Zero-row old-server direct DML, rollback only; works before and after migration #11.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id,email) VALUES('53980000-0000-4000-8000-000000000001','old-seating@example.invalid');
INSERT INTO public.events(id,owner_id,event_type) VALUES
 ('53980000-0000-4000-8000-000000000002','53980000-0000-4000-8000-000000000001','wedding');
INSERT INTO public.guests(id,event_id,name,guest_type,attending) VALUES
 ('53980000-0000-4000-8000-000000000004','53980000-0000-4000-8000-000000000002','Old server guest','common',true);
SET LOCAL ROLE service_role;
-- Old application's actual direct CRUD contract, wholly inside a rollback.
INSERT INTO public.tables(id,event_id,table_number,total_seats) VALUES
 ('53980000-0000-4000-8000-000000000003','53980000-0000-4000-8000-000000000002',1,2);
INSERT INTO public.table_assignments(id,table_id,guest_id,seat_number) VALUES
 ('53980000-0000-4000-8000-000000000005','53980000-0000-4000-8000-000000000003','53980000-0000-4000-8000-000000000004',1);
UPDATE public.tables SET table_number=2 WHERE id='53980000-0000-4000-8000-000000000003';
UPDATE public.table_assignments SET seat_number=2 WHERE id='53980000-0000-4000-8000-000000000005';
DO $assert$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.tables WHERE id='53980000-0000-4000-8000-000000000003' AND table_number=2)
 OR NOT EXISTS (SELECT 1 FROM public.table_assignments WHERE id='53980000-0000-4000-8000-000000000005' AND seat_number=2) THEN
  RAISE EXCEPTION 'OLD_APP_SEATING_DIRECT_WRITE_FAILED';
 END IF;
END
$assert$;
DELETE FROM public.table_assignments WHERE id='53980000-0000-4000-8000-000000000005';
DELETE FROM public.tables WHERE id='53980000-0000-4000-8000-000000000003';
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
