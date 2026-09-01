\set ON_ERROR_STOP on
do $$
begin
  if to_regprocedure('public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer)') is null then
    raise exception 'Missing search_global_catalog';
  end if;
  if has_function_privilege('anon','public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer)','execute') then
    raise exception 'Anon must not call server-side catalog search RPC directly';
  end if;
  if has_function_privilege('authenticated','public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer)','execute') then
    raise exception 'Authenticated must use the validated application endpoint';
  end if;
  if not has_function_privilege('service_role','public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer)','execute') then
    raise exception 'Service role must execute catalog search';
  end if;
end $$;

select * from public.search_global_catalog('church', null, null, null, null, null, null, null, null, null, null, 'RELEVANCE', 0, 12);
