\set ON_ERROR_STOP on
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='30s';
LOCK TABLE public.tables, public.table_assignments IN ACCESS EXCLUSIVE MODE;
\ir branch53-seating-protocol-check.sql
DO $install$
BEGIN
  IF to_regprocedure('public.branch53_rollout_seating_guard()') IS NULL THEN
    EXECUTE $ddl$CREATE FUNCTION public.branch53_rollout_seating_guard()
      RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $body$BEGIN
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'BRANCH53_SEATING_WRITES_SUSPENDED';
END$body$$ddl$;
    COMMENT ON FUNCTION public.branch53_rollout_seating_guard() IS 'branch53-seating-suspension-v1';
    REVOKE ALL ON FUNCTION public.branch53_rollout_seating_guard() FROM PUBLIC, anon, authenticated, service_role;
    CREATE TRIGGER branch53_rollout_seating_freeze BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE
      ON public.tables FOR EACH STATEMENT EXECUTE FUNCTION public.branch53_rollout_seating_guard();
    CREATE TRIGGER branch53_rollout_seating_freeze BEFORE INSERT OR UPDATE OR DELETE OR TRUNCATE
      ON public.table_assignments FOR EACH STATEMENT EXECUTE FUNCTION public.branch53_rollout_seating_guard();
    ALTER TABLE public.tables ENABLE ALWAYS TRIGGER branch53_rollout_seating_freeze;
    ALTER TABLE public.table_assignments ENABLE ALWAYS TRIGGER branch53_rollout_seating_freeze;
    COMMENT ON TRIGGER branch53_rollout_seating_freeze ON public.tables IS 'branch53-seating-suspension-v1';
    COMMENT ON TRIGGER branch53_rollout_seating_freeze ON public.table_assignments IS 'branch53-seating-suspension-v1';
  END IF;
END
$install$;
\ir branch53-seating-protocol-check.sql
COMMIT;
\echo SEATING WRITE SUSPENSION = ACTIVE
