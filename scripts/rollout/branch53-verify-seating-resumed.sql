\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.tables, public.table_assignments IN ACCESS SHARE MODE;
\ir branch53-seating-protocol-check.sql
DO $verify$
BEGIN
  IF to_regprocedure('public.branch53_rollout_seating_guard()') IS NOT NULL THEN
    RAISE EXCEPTION 'BRANCH53_SEATING_SUSPENSION_STILL_ACTIVE';
  END IF;
END
$verify$;
SELECT 1 FROM public.tables WHERE false;
SELECT 1 FROM public.table_assignments WHERE false;
ROLLBACK;
\echo SEATING WRITE SUSPENSION = INACTIVE
