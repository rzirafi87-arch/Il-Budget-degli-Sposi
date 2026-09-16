# Branch 51 — Milestone 4: least-privilege grants, RLS and Data API

## Scope and safety

Migration `20260916193000_branch_51_least_privilege.sql` changes ACL/schema
metadata only. It contains no application-table DML, cleanup or backfill and is
applied only by the ephemeral Database Rebuild workflow in this milestone.
Production, `main`, ownership and migration history remain unchanged.

## Deterministic inventory

`supabase/tests/branch_51_acl_inventory.sql` emits in stable order all public
tables with classification/RLS/owner, every policy expression, grants for
`PUBLIC`/`anon`/`authenticated`/`service_role`, sequence ACLs, function owner,
SECURITY DEFINER/search path/EXECUTE matrix, view options and default ACLs.
The executable regression suite rejects every new unclassified public table.

## Final capability matrix

| Class | Objects | anon | authenticated | service_role |
|---|---|---|---|---|
| Global read-only catalogs | churches, locations, suppliers, supplier_locations, vendors/places, atelier, specialist/event/i18n/taxonomy catalogs, traditions | SELECT | SELECT | ALL |
| Public catalog views | high_rated_locations, location_stats_by_region, top_vendors_by_region, vendors_with_places | SELECT | SELECT | ALL |
| Event-scoped | events, categories/subcategories, Budget/ideas, expenses/incomes, guests/tables, Timeline, appointments, wedding cards, saved catalogs | none | CRUD behind RLS | ALL |
| Owner/partner lifecycle | event_members, event_invitations | none | membership CRUD; invitation SELECT/INSERT behind RLS | ALL |
| User-global | profiles, user_favorites | none | own rows; no profile DELETE | ALL |
| Administrative/self-service | catalog_review_queue, account_deletion_requests, subscription_transactions | none | narrow verbs behind RLS | ALL |
| Server-only | analytics_events, catalog_provenance, rate_limit_buckets, sync_jobs, sync_stats | none | none | ALL |

Client `TRUNCATE`, `REFERENCES`, `TRIGGER`, `MAINTAIN` and implicit sequence
rights are removed. Only `budget_items_id_seq` retains authenticated
`USAGE/SELECT` for its insert default.

## Functions, views and defaults

- `can_access_event`, `is_event_owner`, `is_catalog_admin`: authenticated and service role.
- `get_visible_suppliers`: read-only catalog RPC for anon/authenticated/service role.
- Invitation, Budget/guest snapshot, moderation, rate-limit, seed, ingestion and maintenance RPCs: service role only.
- Every public SECURITY DEFINER has fixed `pg_catalog, public, auth, extensions, pg_temp` search path.
- Every public view is security-invoker; `sync_stats` is server-only.
- Data API roles retain schema USAGE but not CREATE; `private` remains inaccessible.
- Future tables, sequences and functions are private until explicitly reviewed; service role retains server capability.

## Data API/RLS matrix

| Principal | Public catalog | Event-scoped read | Event-scoped write |
|---|---|---|---|
| anon | allowlist only | denied at ACL | denied at ACL |
| owner | per catalog contract | own event | allowed by contract |
| active partner | per catalog contract | shared event only | shared modules; event deletion owner-only |
| revoked partner | public/auth catalogs | no rows | denied |
| unrelated user | public/auth catalogs | own event only | own contract only |
| authenticated without events | public/auth catalogs | no rows | denied |
| service role | as required | cross-event server access | server/cron allowed |

The SQL suite also exercises stale/manipulated CurrentEvent claims, owner-id
manipulation, different event/resource, user-global favorites and server
cross-event writes. Existing Branch 47/48 suites cover pending, expired,
replayed and rejected invitations, membership revocation and deletion cascade.

## Verified callers

The only direct browser Data API write is the owner-only profile locale/country
update. Catalog contributions, favorites, planning selections, Budget, expenses,
reminders and partner lifecycle use authenticated API handlers and the reviewed
service-role boundary after ownership checks. Public catalog/search routes use
read-only relations/RPCs. Moderation, ingestion, analytics, health refresh and
cron use server credentials. No route needs the removed client maintenance
privileges or direct technical-table access.

## Production application plan — not executed

1. Confirm exact Production schema fingerprint and preserved counts.
2. Capture the deterministic pre-migration inventory.
3. Apply the migration transactionally in a controlled release window.
4. Diff post-migration inventory and run SQL/Data API/RPC probes.
5. Deploy the matching application SHA and run authenticated/public smoke tests.
6. Recheck counts and monitor permission errors.
7. If a verified caller was omitted, roll forward with one narrow grant; never restore broad defaults.

## Residual risk for Milestone 5

- Reconfirm every legacy event-type route in the final authenticated browser matrix.
- Specialist legacy catalogs stay public read-only for compatibility pending a separate deprecation decision.
- Service-role routes rely on application ownership checks; retain IDOR regression coverage across all 140 routes.
