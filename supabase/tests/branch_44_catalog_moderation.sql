begin;
do $$ begin
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='catalog_review_queue' and column_name='submitted_by') then raise exception 'submitted_by missing'; end if;
  if not exists(select 1 from pg_proc where proname='moderate_catalog_submission' and prosecdef) then raise exception 'atomic moderation RPC missing'; end if;
  if has_function_privilege('authenticated','public.moderate_catalog_submission(uuid,text,jsonb,uuid,text,text,uuid)','EXECUTE') then raise exception 'authenticated may execute moderation RPC'; end if;
  if not has_function_privilege('service_role','public.moderate_catalog_submission(uuid,text,jsonb,uuid,text,text,uuid)','EXECUTE') then raise exception 'service role cannot moderate'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_review_queue' and policyname='catalog_review_queue_own_select') then raise exception 'own select policy missing'; end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_review_queue' and policyname='catalog_review_queue_admin_select') then raise exception 'admin select policy missing'; end if;
  if not exists(select 1 from pg_constraint where conname='catalog_review_queue_approved_link_check') then raise exception 'approved/canonical invariant missing'; end if;
end $$;
rollback;
