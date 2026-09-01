\set ON_ERROR_STOP on
begin;
set local role anon;
do $$ begin
  perform * from public.search_global_catalog('supplier');
  raise exception 'Anon executed private RPC';
exception when insufficient_privilege then null;
end $$;
reset role;
set local role authenticated;
do $$ begin
  perform * from public.search_global_catalog('location');
  raise exception 'Authenticated executed private RPC';
exception when insufficient_privilege then null;
end $$;
reset role;
rollback;
