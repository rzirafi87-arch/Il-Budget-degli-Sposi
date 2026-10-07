\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.tables, public.table_assignments IN ACCESS SHARE MODE;
\ir branch53-seating-protocol-check.sql
DO $verify$
DECLARE t text; op text;
BEGIN
  IF to_regprocedure('public.branch53_rollout_seating_guard()') IS NULL THEN
    RAISE EXCEPTION 'BRANCH53_SEATING_SUSPENSION_NOT_ACTIVE';
  END IF;
  FOREACH t IN ARRAY ARRAY['tables','table_assignments'] LOOP
    EXECUTE format('SELECT 1 FROM public.%I WHERE false',t);
    FOREACH op IN ARRAY ARRAY[
      format('INSERT INTO public.%I SELECT * FROM public.%I WHERE false',t,t),
      format('UPDATE public.%I SET id=id WHERE false',t),
      format('DELETE FROM public.%I WHERE false',t)] LOOP
      BEGIN
        EXECUTE op;
        RAISE EXCEPTION 'BRANCH53_SEATING_WRITE_NOT_BLOCKED';
      EXCEPTION WHEN SQLSTATE 'P0001' THEN
        IF SQLERRM<>'BRANCH53_SEATING_WRITES_SUSPENDED' THEN RAISE; END IF;
      END;
    END LOOP;
  END LOOP;
END
$verify$;
ROLLBACK;
\echo SEATING WRITE SUSPENSION = ACTIVE
