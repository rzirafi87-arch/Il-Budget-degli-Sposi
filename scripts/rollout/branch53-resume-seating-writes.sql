\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.tables, public.table_assignments IN ACCESS EXCLUSIVE MODE;
\ir branch53-seating-protocol-check.sql
DO $resume$
BEGIN
  IF to_regprocedure('public.branch53_rollout_seating_guard()') IS NOT NULL THEN
    DROP TRIGGER branch53_rollout_seating_freeze ON public.tables;
    DROP TRIGGER branch53_rollout_seating_freeze ON public.table_assignments;
    DROP FUNCTION public.branch53_rollout_seating_guard();
  END IF;
END
$resume$;
COMMIT;
\echo SEATING WRITE SUSPENSION = INACTIVE
