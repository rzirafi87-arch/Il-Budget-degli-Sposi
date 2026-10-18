create extension if not exists pgtap with schema extensions;
begin;
set local role postgres;
set local search_path=extensions,public,pg_catalog;
select plan(14);

select ok((select relrowsecurity from pg_class where oid='private.subcategory_identity_reservations'::regclass),'subcategory identity reservations: RLS on');
select ok((select relrowsecurity from pg_class where oid='private.event_document_deletions'::regclass),'document deletions: RLS on');
select ok((select relrowsecurity from pg_class where oid='private.event_document_upload_reservations'::regclass),'upload reservations: RLS on');

select ok(not has_schema_privilege('anon','private','USAGE'),'anon has no USAGE on private');
select ok(not has_schema_privilege('authenticated','private','USAGE'),'authenticated has no USAGE on private');
select ok(not has_table_privilege('anon','private.subcategory_identity_reservations','SELECT,INSERT,UPDATE,DELETE'),'anon: no grant on reservations');
select ok(not has_table_privilege('authenticated','private.subcategory_identity_reservations','SELECT,INSERT,UPDATE,DELETE'),'authenticated: no grant on reservations');
select ok(not has_table_privilege('authenticated','private.event_document_deletions','SELECT,INSERT,UPDATE,DELETE'),'authenticated: no grant on document deletions');
select ok(not has_table_privilege('authenticated','private.event_document_upload_reservations','SELECT,INSERT,UPDATE,DELETE'),'authenticated: no grant on upload reservations');

select is((select proconfig from pg_proc where oid='public.ensure_subcategory(uuid,text)'::regprocedure), array['search_path=""'],'ensure_subcategory pins search_path');

-- The identity trigger (SECURITY DEFINER, owner postgres) still reserves and releases through RLS.
select lives_ok($q$
  insert into auth.users(id,email) values('57000000-0000-4000-8000-000000000001','branch57-private-rls@example.invalid')
$q$,'fixture user');
select lives_ok($q$
  insert into public.events(id,owner_id,event_type) values('57000000-0000-4000-8000-000000000003','57000000-0000-4000-8000-000000000001','wedding');
  insert into public.categories(id,event_id,name) values('57000000-0000-4000-8000-000000000002','57000000-0000-4000-8000-000000000003','B57 category')
$q$,'fixture event and category');
select lives_ok($q$select public.ensure_subcategory('57000000-0000-4000-8000-000000000002','B57 sub')$q$,'ensure_subcategory runs with the pinned search_path');
select is((select count(*)::int from public.subcategories where category_id='57000000-0000-4000-8000-000000000002' and name='B57 sub'),1,'subcategory created once');

select * from finish();
rollback;
