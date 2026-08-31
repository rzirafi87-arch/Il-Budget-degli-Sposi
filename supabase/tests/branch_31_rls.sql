\set ON_ERROR_STOP on
begin;
insert into public.catalog_review_queue(entity_type,source,incoming_fingerprint,match_score,conflict_level)
values('church','fixture','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',50,'SOFT_CONFLICT');
set local role anon;
do $$ begin perform count(*) from public.catalog_review_queue; raise exception 'Anon read review queue'; exception when insufficient_privilege then null; end $$;
reset role;
set local role authenticated;
do $$ begin insert into public.catalog_review_queue(entity_type,source,incoming_fingerprint,match_score,conflict_level) values('supplier','bad','bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',50,'SOFT_CONFLICT'); raise exception 'Authenticated wrote review queue'; exception when insufficient_privilege then null; end $$;
reset role;
rollback;
