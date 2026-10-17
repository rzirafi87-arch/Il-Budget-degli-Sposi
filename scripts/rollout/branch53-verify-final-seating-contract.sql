\set ON_ERROR_STOP on
DO $contract$
DECLARE t text; r text; op text; f text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tables','table_assignments'] LOOP
    FOREACH r IN ARRAY ARRAY['anon','authenticated'] LOOP
      FOREACH op IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
        IF has_table_privilege(r,'public.'||t,op) OR EXISTS (
          SELECT 1 FROM pg_attribute WHERE attrelid=('public.'||t)::regclass
            AND attnum>0 AND NOT attisdropped AND op IN ('INSERT','UPDATE')
            AND has_column_privilege(r,attrelid,attnum,op)
        ) THEN RAISE EXCEPTION 'BRANCH53_FINAL_SEATING_ACL_MISMATCH'; END IF;
      END LOOP;
    END LOOP;
    FOREACH op IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE'] LOOP
      IF NOT has_table_privilege('service_role','public.'||t,op) THEN
        RAISE EXCEPTION 'BRANCH53_SERVICE_SEATING_ACL_MISMATCH';
      END IF;
    END LOOP;
  END LOOP;
  FOREACH f IN ARRAY ARRAY['public.save_event_table_plan(uuid,uuid,jsonb,boolean)',
                          'public.delete_event_table(uuid,uuid,uuid)'] LOOP
    IF to_regprocedure(f) IS NULL OR NOT EXISTS (
      SELECT 1 FROM pg_proc WHERE oid=to_regprocedure(f) AND prosecdef
        AND proconfig=ARRAY['search_path=""']
    ) OR NOT has_function_privilege('service_role',f,'EXECUTE')
      OR has_function_privilege('authenticated',f,'EXECUTE')
      OR has_function_privilege('anon',f,'EXECUTE') THEN
      RAISE EXCEPTION 'BRANCH53_FINAL_SEATING_RPC_MISMATCH';
    END IF;
  END LOOP;
END
$contract$;
