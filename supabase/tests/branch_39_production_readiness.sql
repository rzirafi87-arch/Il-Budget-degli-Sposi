begin;
do $$
begin
  if to_regclass('public.rate_limit_buckets') is null then raise exception 'rate_limit_buckets missing'; end if;
  if to_regprocedure('public.consume_rate_limit(text,integer,integer)') is null then raise exception 'consume_rate_limit missing'; end if;
  if to_regclass('public.account_deletion_requests') is null then raise exception 'account_deletion_requests missing'; end if;
  if not (select relrowsecurity from pg_class where oid='public.account_deletion_requests'::regclass) then raise exception 'account deletion RLS disabled'; end if;
  if not (select relrowsecurity from pg_class where oid='public.rate_limit_buckets'::regclass) then raise exception 'rate limit RLS disabled'; end if;
  if has_table_privilege('authenticated','public.rate_limit_buckets','SELECT') then raise exception 'authenticated can read rate limit buckets'; end if;
  if has_function_privilege('authenticated','public.consume_rate_limit(text,integer,integer)','EXECUTE') then raise exception 'authenticated can execute limiter'; end if;
  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema='public' and table_name='account_deletion_requests' and constraint_type='PRIMARY KEY'
  ) then raise exception 'account deletion primary key missing'; end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='account_deletion_requests' and column_name='scheduled_for' and is_nullable='YES'
  ) then raise exception 'scheduled_for must be required'; end if;
end $$;
rollback;
