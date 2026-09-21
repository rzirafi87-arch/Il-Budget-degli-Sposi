-- Read-only fingerprint of every pre-M2 application row. The six additive
-- saved_* columns are excluded so this query is byte-identical before and
-- after the schema-only migration.
with table_names(table_name) as (values
  ('events'),('event_members'),('event_invitations'),('suppliers'),('churches'),('locations'),
  ('saved_suppliers'),('saved_locations'),('saved_churches'),('user_favorites'),
  ('catalog_provenance'),('budget_items'),('budget_ideas'),('expenses'),
  ('payment_reminders'),('timeline_items'),('appointments'),('user_event_timeline'),
  ('event_timelines'),('supplier_locations'),('subscription_packages'),('subscription_transactions')
), data_rows(table_name,row_hash) as (
  select 'events',md5(to_jsonb(r)::text) from public.events r
  union all select 'event_members',md5(to_jsonb(r)::text) from public.event_members r
  union all select 'event_invitations',md5(to_jsonb(r)::text) from public.event_invitations r
  union all select 'suppliers',md5(to_jsonb(r)::text) from public.suppliers r
  union all select 'churches',md5(to_jsonb(r)::text) from public.churches r
  union all select 'locations',md5(to_jsonb(r)::text) from public.locations r
  union all select 'saved_suppliers',md5((to_jsonb(r) - array[
    'catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at',
    'catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides'
  ])::text) from public.saved_suppliers r
  union all select 'saved_locations',md5((to_jsonb(r) - array[
    'catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at',
    'catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides'
  ])::text) from public.saved_locations r
  union all select 'saved_churches',md5((to_jsonb(r) - array[
    'catalog_snapshot','catalog_snapshot_version','catalog_snapshot_captured_at',
    'catalog_snapshot_fingerprint','catalog_provenance_snapshot','private_overrides'
  ])::text) from public.saved_churches r
  union all select 'user_favorites',md5(to_jsonb(r)::text) from public.user_favorites r
  union all select 'catalog_provenance',md5(to_jsonb(r)::text) from public.catalog_provenance r
  union all select 'budget_items',md5(to_jsonb(r)::text) from public.budget_items r
  union all select 'budget_ideas',md5(to_jsonb(r)::text) from public.budget_ideas r
  union all select 'expenses',md5(to_jsonb(r)::text) from public.expenses r
  union all select 'payment_reminders',md5(to_jsonb(r)::text) from public.payment_reminders r
  union all select 'timeline_items',md5(to_jsonb(r)::text) from public.timeline_items r
  union all select 'appointments',md5(to_jsonb(r)::text) from public.appointments r
  union all select 'user_event_timeline',md5(to_jsonb(r)::text) from public.user_event_timeline r
  union all select 'event_timelines',md5(to_jsonb(r)::text) from public.event_timelines r
  union all select 'supplier_locations',md5(to_jsonb(r)::text) from public.supplier_locations r
  union all select 'subscription_packages',md5(to_jsonb(r)::text) from public.subscription_packages r
  union all select 'subscription_transactions',md5(to_jsonb(r)::text) from public.subscription_transactions r
), fingerprints as (
  select n.table_name,count(d.row_hash)::bigint row_count,
    encode(digest(coalesce(string_agg(d.row_hash,'' order by d.row_hash),''),'sha256'),'hex') checksum
  from table_names n left join data_rows d using(table_name)
  group by n.table_name
)
select jsonb_object_agg(
  table_name,
  jsonb_build_object('count',row_count,'checksum',checksum)
  order by table_name
) as branch_52_m2_preservation_snapshot
from fingerprints;
