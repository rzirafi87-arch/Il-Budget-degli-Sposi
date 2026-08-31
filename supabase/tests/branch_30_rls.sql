\set ON_ERROR_STOP on
begin;
insert into public.catalog_provenance(entity_type,entity_id,external_key,source_type,source_name,external_id,raw_fingerprint)
values('church',null,'fixture','official_site','Branch 30 fixture','fixture','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
set local role anon;
do $$ begin perform count(*) from public.catalog_provenance; raise exception 'Anon read technical provenance'; exception when insufficient_privilege then null; end $$;
reset role;
set local role authenticated;
do $$ begin insert into public.catalog_provenance(entity_type,source_type,source_name,external_id,raw_fingerprint) values('location','admin_import','bad','bad','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'); raise exception 'Authenticated wrote technical provenance'; exception when insufficient_privilege then null; end $$;
reset role;
rollback;
