-- Deterministic, read-only application-data snapshot for the Branch 51
-- Production migration gate. Run this exact query immediately before and after
-- the authorized migration and require byte-for-byte equality. Do not replace
-- it with historical fixed counts.
with table_names(table_name) as (values
  ('events'),
  ('event_members'),
  ('event_invitations'),
  ('suppliers'),
  ('churches'),
  ('locations'),
  ('budget_items'),
  ('budget_ideas'),
  ('expenses'),
  ('payment_reminders'),
  ('timeline_items'),
  ('user_event_timeline'),
  ('user_favorites'),
  ('catalog_provenance'),
  ('subscription_packages'),
  ('subscription_transactions')
), data_rows(table_name,row_hash) as (
  select 'events',md5(row_to_json(r)::text) from public.events r
  union all select 'event_members',md5(row_to_json(r)::text) from public.event_members r
  union all select 'event_invitations',md5(row_to_json(r)::text) from public.event_invitations r
  union all select 'suppliers',md5(row_to_json(r)::text) from public.suppliers r
  union all select 'churches',md5(row_to_json(r)::text) from public.churches r
  union all select 'locations',md5(row_to_json(r)::text) from public.locations r
  union all select 'budget_items',md5(row_to_json(r)::text) from public.budget_items r
  union all select 'budget_ideas',md5(row_to_json(r)::text) from public.budget_ideas r
  union all select 'expenses',md5(row_to_json(r)::text) from public.expenses r
  union all select 'payment_reminders',md5(row_to_json(r)::text) from public.payment_reminders r
  union all select 'timeline_items',md5(row_to_json(r)::text) from public.timeline_items r
  union all select 'user_event_timeline',md5(row_to_json(r)::text) from public.user_event_timeline r
  union all select 'user_favorites',md5(row_to_json(r)::text) from public.user_favorites r
  union all select 'catalog_provenance',md5(row_to_json(r)::text) from public.catalog_provenance r
  union all select 'subscription_packages',md5(row_to_json(r)::text) from public.subscription_packages r
  union all select 'subscription_transactions',md5(row_to_json(r)::text) from public.subscription_transactions r
), table_fingerprints as (
  select n.table_name,
         count(d.row_hash)::bigint as row_count,
         encode(digest(coalesce(string_agg(d.row_hash,'' order by d.row_hash),''),'sha256'),'hex') as checksum
    from table_names n left join data_rows d using(table_name)
   group by n.table_name
), owner_integrity as (
  select count(*)::bigint as events,
         count(*) filter(where e.owner_id is null)::bigint as owner_id_null,
         count(*) filter(where e.owner_id is not null and u.id is null)::bigint as owner_missing_auth,
         count(*) filter(where u.id is not null)::bigint as owner_resolves_auth,
         count(distinct e.owner_id)::bigint as distinct_owner_ids
    from public.events e left join auth.users u on u.id=e.owner_id
)
select jsonb_build_object(
  'tables',(
    select jsonb_object_agg(
      table_name,
      jsonb_build_object('count',row_count,'checksum',checksum)
      order by table_name
    ) from table_fingerprints
  ),
  'owner_integrity',(select to_jsonb(owner_integrity) from owner_integrity)
) as branch_51_application_snapshot;
