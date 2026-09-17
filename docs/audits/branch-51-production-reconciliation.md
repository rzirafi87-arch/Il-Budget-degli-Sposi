# Branch 51 — Production baseline reconciliation and monetization shutdown

## Decision

The divergence has two demonstrated causes: **A + B**.

- **A — incompatible query semantics:** the 2026-09-17 failed gate counted only
  `events.owner_id is null` and therefore returned zero. The historical baseline
  defined an absent owner as an `owner_id` that does not resolve to
  `auth.users`, using a `LEFT JOIN` and `where u.id is null`. That original
  definition still returns 11.
- **B — legitimate data evolution:** one wedding event was created at
  2026-09-15 20:18:31 UTC, after the last 24-event snapshot. Its owner resolves
  to a confirmed, non-anonymous Auth user; its active owner membership was
  created in the same transaction timestamp; its canonical category and
  subcategory seed is present; it has no transaction or invitation rows.

There is no evidence for C, D or E. No event was deleted, reassigned or changed
to force the historical count. The 11 legacy exceptions are preserved.

## Production environment identity

All checks resolve to the same environment. Only non-secret fingerprints are
recorded.

| Source | Result | Evidence |
|---|---|---|
| Repository project ref | MATCH | SHA-256 prefix `e93fbf881613` |
| Supabase connector project | MATCH | same ref fingerprint; ACTIVE_HEALTHY |
| Production Vercel bundle host | MATCH | same ref fingerprint recovered from the public client bundle |
| Production smoke #13 Supabase target | MATCH | six QA signups and six matching deletions recorded in this project during the exact 14:08–14:10 UTC job window |
| Migration history | MATCH | fingerprint prefix `940f95424e8d`; Branch 51 version absent |
| Production schema | MATCH | columns `1249e90161d8`; constraints `c9cd7efad33b`; functions `73eaecaae871` |
| Vercel Production | MATCH | `dpl_HWoeA1ffmBjxaRAcTiQztRbUnMTK`, READY, main `5142de19accea545ef08deb185907f22d240148d` |

The connector query ran as the administrative SQL role, so `auth.users` was
visible and RLS did not hide either events or owners. The Production smoke uses
the repository secret `PLAYWRIGHT_SUPABASE_URL`; its value remains masked in
GitHub logs, but the time-correlated QA lifecycle above proves the project
identity without exposing it.

## Exact baseline queries

The historical query was recovered from `pg_stat_statements`:

```sql
select
  (select count(*) from public.events) as events_total,
  (select count(*) from public.events e
     left join auth.users u on u.id=e.owner_id
    where u.id is null) as absent_owner_events,
  (select count(*) from public.events e
     join auth.users u on u.id=e.owner_id) as valid_events;
```

An equivalent historical variant used `not exists` and explicitly included
`owner_id is null`. Both produced 24 total, 11 absent-owner and 13 valid-owner
events in the read-only verification completed on 2026-09-15 at 15:40–15:41
UTC.

The failed gate used:

```sql
select count(*) as events,
       count(*) filter (where owner_id is null) as ownerless_events,
       count(distinct owner_id) filter (where owner_id is not null) as distinct_owners
from public.events;
```

That query answered a different question. It found zero null `owner_id` values,
not zero missing Auth owners.

## Reconciled read-only snapshot

Captured 2026-09-17 08:50–08:59 UTC:

| Measure | Historical | Current | Explanation |
|---|---:|---:|---|
| Events | 24 | 25 | one valid post-snapshot wedding event |
| `owner_id is null` | not the historical definition | 0 | all rows contain an owner UUID |
| Owner absent from `auth.users` | 11 | 11 | unchanged legacy exception set |
| Owner resolves to `auth.users` | 13 | 14 | the new event has a valid owner |
| Distinct owner IDs | not recorded | 17 | 9 legacy absent-owner IDs plus 8 current owner IDs |
| Event memberships | 19 | 21 | current relational state; zero missing users/events |
| Suppliers / churches / locations | 326 / 896 / 155 | 326 / 896 / 155 | invariant |

All 25 rows were reviewed using masked event/owner hashes, creation/update
timestamps, owner existence, membership counts, event type and QA indicators.
The 11 absent-owner rows predate the historical snapshot. None of the 20 QA
users deleted after that snapshot owns a current orphan event. The current
events checksum prefix is `b2ae04346f00`; memberships checksum prefix is
`881554880cf5`.

The invitation table currently contains 136 historical/QA lifecycle records.
That count is documented but is not used as a fixed future gate; no invitation
was deleted or changed during this audit.

## Future Production migration baseline

Historical fixed numbers are no longer a migration precondition. The gate must
use `supabase/tests/branch_51_production_snapshot.sql`:

1. capture its deterministic count/checksum output immediately before the
   authorized migration;
2. apply only `20260916193000_branch_51_least_privilege.sql`;
3. run the same snapshot immediately after;
4. require byte-for-byte equality of application counts and checksums;
5. separately verify the expected ACL/RLS/schema delta and migration-history
   insertion.

The Database Rebuild workflow now performs this same pre/post snapshot equality
test around two idempotency passes of the migration on the current reconstructed
schema. Production application remains unauthorized in this checkpoint.

## Monetization fail-closed contract

`config/flags.ts` is authoritative and keeps `payments_stripe: false`.
`src/lib/monetizationCapability.ts` returns one stable response:

```json
{"error":"FEATURE_DISABLED","feature":"payments"}
```

with HTTP 409 and `Cache-Control: no-store`. Every protected handler calls this
guard before credentials, Stripe initialization, request payload/signature,
authentication, database access, DML, email or another external effect.

| Entry point | Disabled behavior |
|---|---|
| `POST /api/stripe/checkout` | 409 before secrets, Stripe, Auth, pricing query or checkout creation |
| `POST /api/stripe/webhook` | 409 before body/signature, secrets, Stripe, DML, plan change or email |
| `PUT /api/subscription-featured` | 409 before Auth, entity lookup or featured update |
| `GET/POST /api/subscription-transactions` | 409 before Auth/query; client-authored completed transactions remain impossible |

The same guard also protects `/api/my/subscription-transactions`,
`/api/subscription-packages`, `/api/cron/check-subscriptions`, and the paid
supplier-profile mutation. The packages UI does not fetch offers while disabled
on either pricing page, pricing CTAs are disabled, and the supplier dashboard
exposes no buy/change-plan link.

## Stop

PR #64 remains Draft. No Production migration, DML, cleanup, reassignment,
merge, main change, monetization activation, new event type or Branch 52 work is
part of this checkpoint.
