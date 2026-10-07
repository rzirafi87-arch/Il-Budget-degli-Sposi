-- Shared exact-identity check. Call only inside the caller's locked transaction.
DO $check$
DECLARE
  f oid := to_regprocedure('public.branch53_rollout_seating_guard()');
  n integer;
BEGIN
  IF f IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang
    WHERE p.oid=f AND l.lanname='plpgsql' AND p.prorettype='trigger'::regtype
      AND NOT p.prosecdef AND p.proconfig=ARRAY['search_path=""']
      AND p.prosrc=$body$BEGIN
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'BRANCH53_SEATING_WRITES_SUSPENDED';
END$body$
      AND obj_description(p.oid,'pg_proc')='branch53-seating-suspension-v1'
  ) THEN
    RAISE EXCEPTION 'BRANCH53_SEATING_PROTOCOL_IDENTITY_MISMATCH';
  END IF;
  SELECT count(*) INTO n FROM pg_trigger
    WHERE tgname='branch53_rollout_seating_freeze' AND NOT tgisinternal;
  IF n NOT IN (0,2) OR EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname='branch53_rollout_seating_freeze' AND NOT tgisinternal
      AND (tgrelid NOT IN ('public.tables'::regclass,'public.table_assignments'::regclass)
        OR tgfoid IS DISTINCT FROM f OR tgtype<>62 OR tgenabled<>'A'
        OR tgnargs<>0 OR tgqual IS NOT NULL
        OR obj_description(oid,'pg_trigger') IS DISTINCT FROM 'branch53-seating-suspension-v1')
  ) OR (f IS NULL AND n<>0) OR (f IS NOT NULL AND n<>2) THEN
    RAISE EXCEPTION 'BRANCH53_SEATING_PROTOCOL_PARTIAL_OR_INVALID_STATE';
  END IF;
END
$check$;
