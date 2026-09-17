-- Deterministic, read-only Branch 51 ACL/RLS inventory. Stable output order.
with classification(object_name, object_class) as (values
  ('account_deletion_requests','owner-only'), ('analytics_events','server-only'),
  ('appointments','event-scoped'), ('atelier','catalogo globale read-only'),
  ('budget_ideas','event-scoped'), ('budget_items','event-scoped'),
  ('catalog_provenance','server-only'), ('catalog_review_queue','amministrativo'),
  ('categories','event-scoped'), ('category_translations','catalogo globale read-only'),
  ('checklist_modules','catalogo globale read-only'), ('churches','catalogo globale read-only'),
  ('event_invitations','owner-only'), ('event_members','owner-or-partner'),
  ('event_timeline_translations','catalogo globale read-only'),
  ('event_timelines','catalogo globale read-only'),
  ('event_type_categories','catalogo globale read-only'),
  ('event_type_subcategories','catalogo globale read-only'),
  ('event_type_translations','catalogo globale read-only'),
  ('event_type_variants','catalogo globale read-only'),
  ('event_types','catalogo globale read-only'), ('events','owner-or-partner'),
  ('expenses','event-scoped'), ('family_groups','event-scoped'),
  ('geo_countries','catalogo globale read-only'), ('guests','event-scoped'),
  ('i18n_locales','catalogo globale read-only'), ('incomes','event-scoped'),
  ('locations','catalogo globale read-only'), ('musica_cerimonia','catalogo globale read-only'),
  ('musica_ricevimento','catalogo globale read-only'),
  ('non_invited_recipients','event-scoped'), ('payment_reminders','event-scoped'),
  ('places','catalogo globale read-only'), ('profiles','owner-only'),
  ('rate_limit_buckets','server-only'), ('saved_churches','event-scoped'),
  ('saved_locations','event-scoped'), ('saved_suppliers','event-scoped'),
  ('subcategories','event-scoped'), ('subcategory_translations','catalogo globale read-only'),
  ('subscription_packages','catalogo globale read-only'),
  ('subscription_transactions','owner-only'),
  ('supplier_locations','catalogo globale read-only'), ('suppliers','catalogo globale read-only'),
  ('sync_jobs','server-only'), ('table_assignments','event-scoped'),
  ('tables','event-scoped'), ('timeline_items','event-scoped'),
  ('traditions','catalogo globale read-only'), ('user_event_timeline','event-scoped'),
  ('user_favorites','autenticato user-global'), ('vendor_places','catalogo globale read-only'),
  ('vendors','catalogo globale read-only'), ('wedding_cards','event-scoped'),
  ('wedding_planners','catalogo globale read-only')
)
select c.relname as object_name, coalesce(x.object_class,'da verificare') as object_class,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced,
       pg_get_userbyid(c.relowner) as owner
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  left join classification x on x.object_name=c.relname
 where n.nspname='public' and c.relkind='r'
 order by c.relname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  from pg_policies where schemaname='public'
 order by tablename, cmd, policyname;

select table_name, grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema='public' and grantee in ('PUBLIC','anon','authenticated','service_role')
 order by table_name, grantee, privilege_type;

select n.nspname as schema_name, c.relname as sequence_name, r.rolname as grantee,
       a.privilege_type
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  cross join lateral aclexplode(coalesce(c.relacl,acldefault('S',c.relowner))) a
  join pg_roles r on r.oid=a.grantee
 where n.nspname='public' and c.relkind='S'
 order by c.relname, r.rolname, a.privilege_type;

select n.nspname as schema_name, p.oid::regprocedure as function_name,
       pg_get_userbyid(p.proowner) as owner, p.prosecdef as security_definer,
       p.proconfig as function_config,
       has_function_privilege('anon',p.oid,'execute') as anon_execute,
       has_function_privilege('authenticated',p.oid,'execute') as authenticated_execute,
       has_function_privilege('service_role',p.oid,'execute') as service_execute
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('public','private')
 order by n.nspname, p.oid::regprocedure::text;

select c.relname as view_name, c.reloptions, pg_get_userbyid(c.relowner) as owner
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='v'
 order by c.relname;

select pg_get_userbyid(d.defaclrole) as owner, n.nspname as schema_name,
       d.defaclobjtype as object_type, d.defaclacl
  from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace
 where n.nspname='public'
 order by owner, object_type;
