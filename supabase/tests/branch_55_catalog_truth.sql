-- Branch 55: canonical supplier categories, hidden duplicates, truthful verification.
-- The contract runs in one DO block that raises on the first violation; the
-- TAP plan records it as a single assertion for the manifest runner.
create extension if not exists pgtap with schema extensions;
begin;
set local search_path = extensions, public, pg_catalog;
select plan(1);
do $$
declare
  canonical_id uuid := gen_random_uuid();
  duplicate_id uuid := gen_random_uuid();
  conflicting_id uuid := gen_random_uuid();
  other_flower_id uuid := gen_random_uuid();
  found_count integer;
  found_category text;
begin
  -- Schema and privileges
  if to_regclass('public.supplier_category_aliases') is null then raise exception 'missing supplier_category_aliases'; end if;
  if has_table_privilege('anon','public.supplier_category_aliases','select')
     or has_table_privilege('authenticated','public.supplier_category_aliases','select') then
    raise exception 'category aliases exposed to client roles';
  end if;
  if has_function_privilege('anon','public.supplier_category_slug(text)','execute') then raise exception 'slug resolver exposed to anon'; end if;
  if has_function_privilege('anon','public.search_global_catalog(text,text,text,text,text,text,text,text,double precision,double precision,double precision,text,integer,integer)','execute') then
    raise exception 'catalog search exposed to anon';
  end if;

  -- Resolver
  if public.supplier_category_slug(' Fiori & Decor ') <> 'flowers' or public.supplier_category_slug('fiorai') <> 'flowers'
     or public.supplier_category_slug('florist') <> 'flowers' or public.supplier_category_slug('flowers') <> 'flowers' then
    raise exception 'flower aliases do not resolve to one slug';
  end if;
  if public.supplier_category_slug('Fotografi') <> 'photo-video' or public.supplier_category_slug('photographer') <> 'photo-video' then
    raise exception 'photo aliases do not resolve to one slug';
  end if;
  if public.supplier_category_slug('') is not null or public.supplier_category_slug(null) is not null then raise exception 'empty category must be null'; end if;

  -- Fixtures: same florist twice (certain duplicate), a homonym with a different phone, another florist
  insert into public.suppliers(id,name,normalized_name,category,city,province,region,country_code,phone,verification_status,source,inserted_at)
  values
    (canonical_id,'Test Fiori Uno','test fiori uno','Fiori & Decor','Agrigento','AG','Sicilia','it','0922 111','TO_CHECK','legacy', now() - interval '2 days'),
    (duplicate_id,'Test Fiori Uno','test fiori uno','fiorai','Agrigento','AG','Sicilia','it','0922111','TO_CHECK','legacy', now() - interval '1 day'),
    (conflicting_id,'Test Fiori Uno','test fiori uno','Fiorai','Agrigento','AG','Sicilia','it','0922 999','TO_CHECK','legacy', now()),
    (other_flower_id,'Test Fiori Due','test fiori due','florist','Agrigento','AG','Sicilia','it',null,'TO_CHECK','user_submission', now());
  update public.suppliers set duplicate_of = canonical_id where id = duplicate_id;

  begin
    update public.suppliers set duplicate_of = canonical_id where id = canonical_id;
    raise exception 'self duplicate accepted';
  exception when check_violation then null;
  end;

  -- Search by any alias returns the canonical slug and hides the duplicate
  select count(*), min(category) into found_count, found_category
  from public.search_global_catalog('supplier', null, 'Fiorai', 'Agrigento', null, null, 'it', null, null, null, null, 'NAME_ASC', 0, 24)
  where name like 'Test Fiori%';
  if found_count <> 3 then raise exception 'expected 3 visible florists (canonical, conflicting homonym, other), got %', found_count; end if;
  if found_category <> 'flowers' then raise exception 'supplier category must be returned as slug, got %', found_category; end if;
  if exists (select 1 from public.search_global_catalog('supplier', 'Test Fiori', null, null, null, null, null, null, null, null, null, 'NAME_ASC', 0, 24) where id = duplicate_id) then
    raise exception 'duplicate row is visible in public search';
  end if;
  select count(*) into found_count
  from public.search_global_catalog('supplier', null, 'flowers', 'Agrigento', null, null, 'it', null, null, null, null, 'NAME_ASC', 0, 24)
  where name like 'Test Fiori%';
  if found_count <> 3 then raise exception 'slug filter must match the same rows as aliases, got %', found_count; end if;

  -- Duplicates are kept, never deleted
  if not exists (select 1 from public.suppliers where id = duplicate_id) then raise exception 'duplicate row was deleted'; end if;

  -- Truthful verification: no unverified import is VERIFIED after the migration
  if exists (select 1 from public.suppliers where verification_status = 'VERIFIED' and user_id is null and last_verified_at is null
             and coalesce(source,'legacy') in ('legacy','google','openstreetmap','wikidata')) then
    raise exception 'unverified imported suppliers are still VERIFIED';
  end if;

  -- Country consistency
  if exists (select 1 from public.suppliers where country_code = 'it' and region in ('CDMX','Ciudad de México','Jalisco','Yucatán')) then
    raise exception 'Mexican regions tagged as Italy';
  end if;
end $$;
select pass('Branch 55 catalog truth contract holds');
select * from finish();
rollback;
