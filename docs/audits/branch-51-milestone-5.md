# Branch 51 — Milestone 5: final route matrix and Release Candidate

## Release-candidate decision

All 140 route files are classified by the authoritative overlay in
`branch-51-route-matrix.md`: 94 PASS/PASS-DISABLED, 46 LEGACY COPERTO, no
deferred or unresolved HIGH-RISK row.

## Residual fixes

- The middleware now includes API traffic and denies every seed and Dashboard
  belonging to a non-READY event type. Direct calls cannot bypass
  `eventTypeCapabilities`; seed GET is 405 and all other calls are 409 before
  authentication-independent service-role code or DML can execute.
- `POST /api/subscription-transactions` is 405. A client can no longer create a
  `completed` transaction or select its own tier. Transaction creation is a
  server/webhook responsibility only.
- The authenticated subscription history uses an explicit projection and
  sanitized failures.
- `/api/atelier` exposes an explicit public-read projection, sanitizes database
  failures, removes route-local `any`, and rejects direct catalog writes with
  405. Catalog contributions remain authenticated and moderated.

## Final IDOR matrix

| Principal/tamper | Expected and verified contract |
|---|---|
| anonymous | 401, except reviewed public reads/tokens |
| owner | own event/resources only |
| active partner | enabled shared modules only |
| revoked partner / stranger | 404 or no row |
| authenticated without event | no private row; 404/selection contract |
| malformed / absent UUID | 400 / 404 |
| altered event/resource/current-event | no privilege increase; 404/no row |
| payload owner_id | ignored or rejected |
| Data API anon | reviewed global read allowlist only |
| Data API authenticated | explicit grants plus RLS |
| service_role | server-only; API authorization precedes DML |

## Production simulation and migration plan

Production remains read-only and unchanged. The Production schema/ACL/RLS,
function signatures, migration history and protected data counts are captured
by the Milestone 4 inventory. On a clean and a Production-shaped ephemeral
database, `20260916193000_branch_51_least_privilege.sql` applies and reapplies
without application DML, count or checksum changes. SQL inventory tests verify
explicit grants, RLS, policy/function/view boundaries and default-deny future
objects.

Production application remains a later, separately authorized step: snapshot
the same fingerprints and counts; apply the single migration; run ACL/RLS/Data
API/RPC tests; compare fingerprints and counts; then run authenticated smoke.
No cleanup or backfill is part of that plan.

The reconciliation checkpoint replaces historical fixed counts with the
deterministic read-only snapshot in
`supabase/tests/branch_51_production_snapshot.sql`. The same output must be
captured immediately before and after Production application.

## Preserved state

The branch contains no Production mutation. The reconciled current snapshot is
326 suppliers, 896 places of worship, 155 locations and 25 events: 11 owner IDs
do not resolve to Auth and 14 do. It preserves all
memberships/invitations, Budget, expenses, reminders, Timeline, favourites,
catalogues/provenance, Matrimonio READY, and every other event type disabled.

## Residual risk

Monetization is now fail-closed in shared server code and tested with absent and
configured Stripe secrets. Checkout, webhook, featured subscription and all
secondary subscription/payment routes return the stable 409 contract before
provider, database or external side effects. Enabling payments still requires a
dedicated ownership/replay/idempotency/transactional release; no Release
Candidate action enables it.
