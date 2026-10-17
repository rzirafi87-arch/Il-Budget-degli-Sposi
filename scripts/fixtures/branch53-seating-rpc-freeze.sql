-- Isolated fixture only. Every inserted row and attempted RPC is rolled back.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id,email) VALUES('53990000-0000-4000-8000-000000000001','freeze@example.invalid');
INSERT INTO public.events(id,owner_id,event_type) VALUES
 ('53990000-0000-4000-8000-000000000002','53990000-0000-4000-8000-000000000001','wedding');
-- A temporary local savepoint disables only our freeze to seed a target for delete.
ALTER TABLE public.tables DISABLE TRIGGER branch53_rollout_seating_freeze;
INSERT INTO public.tables(id,event_id,table_number,total_seats) VALUES
 ('53990000-0000-4000-8000-000000000003','53990000-0000-4000-8000-000000000002',1,2);
ALTER TABLE public.tables ENABLE ALWAYS TRIGGER branch53_rollout_seating_freeze;
SET LOCAL ROLE service_role;
DO $test$
DECLARE q text;
BEGIN
 FOREACH q IN ARRAY ARRAY[
  $q$SELECT public.save_event_table_plan('53990000-0000-4000-8000-000000000002','53990000-0000-4000-8000-000000000001','[]'::jsonb,true)$q$,
  $q$SELECT public.delete_event_table('53990000-0000-4000-8000-000000000002','53990000-0000-4000-8000-000000000001','53990000-0000-4000-8000-000000000003')$q$
 ] LOOP
  BEGIN
   EXECUTE q;
   RAISE EXCEPTION 'RPC_FREEZE_TEST_FAILED';
  EXCEPTION WHEN SQLSTATE 'P0001' THEN
   IF SQLERRM<>'BRANCH53_SEATING_WRITES_SUSPENDED' THEN RAISE; END IF;
  END;
 END LOOP;
END
$test$;
ROLLBACK;
