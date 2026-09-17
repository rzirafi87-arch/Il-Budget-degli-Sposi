# Branch 51 — Milestone 1 checkpoint

## Scope and immutable baseline

- Scope: **Server security, route hardening & legacy cleanup**.
- Base commit: `5142de19accea545ef08deb185907f22d240148d`.
- Production deployment: `dpl_HWoeA1ffmBjxaRAcTiQztRbUnMTK`, READY on the base SHA.
- Production smoke: `#13`, PASS.
- Cost ceiling: `0 €`.
- Production DML, production migrations, production grant changes, cleanup, backfill, and reassignment are forbidden in this milestone.

## Data preservation contract

The historical checkpoint was 326 legacy suppliers, 896 places of worship, 155 locations and 24 events (including 11 owner references absent from Auth). The later read-only reconciliation records the current 25-event Production baseline and explains the one legitimate post-snapshot event; future preservation uses the immediate pre/post-migration snapshot rather than fixed historical counts. Memberships and invitations, Budget, expenses, reminders, Timeline, favourites, catalogues/provenance and the `Matrimonio` READY configuration remain protected.

## Inventory result

- 140 route handlers were found: 139 below `/api` and `/auth/callback`.
- No top-level `"use server"` server-action module was found.
- The complete route-level inventory is in `branch-51-route-matrix.md` and is reproducible through `node scripts/audit-branch51-routes.mjs`.
- Service-role routes are explicitly marked as RLS-bypassing boundaries: ownership must be enforced by the API before every event-scoped query or mutation.

## Confirmed findings

### Corrected in Milestone 1

1. `GET /api/baptism/seed` and `GET /api/baptism/seed/[eventId]` delegated to `POST`, so a safe/read HTTP verb performed writes. Both GET aliases now return `405`, advertise `Allow: POST`, and keep POST as the canonical endpoint.
2. The event-scoped baptism seed exposed database error messages and distinguished a foreign event with `403`. It now returns the same `404 EVENT_NOT_FOUND` for missing and inaccessible events, and a stable sanitized `500 BAPTISM_SEED_FAILED`.
3. `/api/share/[token]` and `/api/public/[publicId]` used `as any`, selected every event column, and returned database/schema details. They now use explicit row types, select only response fields, and return stable sanitized errors while logging internal detail server-side.

### Deferred to later Branch 51 milestones

1. The cron endpoints perform mutations through GET. Vercel Cron invokes GET, so replacing them safely needs a compatible job boundary and rollout plan; no behavioural change was made in Milestone 1.
2. Legacy and overlapping lifecycle families remain (`/api/event/new`, `/api/event-core/new`, `/api/events/*/(get|init)`, seed aliases). Deletion or payload changes are deferred to the endpoint-consolidation milestone.
3. Several older handlers implement authentication inline instead of `requireUser`, and error mapping varies between Italian text, raw messages, and stable codes. Consolidation is deferred to the ownership/IDOR milestone to avoid a broad compatibility change.
4. Remaining server-route `as any` usages in share creation and legacy content routes require schema-specific typing and are deferred after contract coverage.
5. The legacy production baseline contains broad historical grants. Current migrations also grant DML to `authenticated` on user-owned tables and public SELECT on global catalogue tables. A least-privilege migration must be validated only in an ephemeral rebuild before later approval; no production revocation is included here.
6. Public catalogue writes, sync routes, subscription routes, and admin/service-role boundaries require route-by-route authorization confirmation. Entries marked `review` in the matrix are the queue for Milestone 2.

## Canonical contracts

- `401`: missing or invalid authentication.
- `403`: authenticated principal lacks a required role (not used to reveal cross-event resource existence).
- `404`: missing resource or resource outside the caller's accessible event.
- `400`: malformed request; `422`: valid JSON with invalid domain fields.
- `409`: conflict, duplicate, or replay.
- `500`: stable public code only; database, schema, stack, identity, and cross-event details remain internal.

## Required authorization matrix

Milestones 2 and 4 must exercise owner, active partner, unrelated user, anonymous caller, other event, missing resource, manipulated current-event cookie, altered cookie, altered path/query/body `event_id`, and direct Data API access. API tests do not substitute for RLS tests because service-role clients bypass RLS.

## Explicit exclusions

Branch 52/53 work, Location ↔ Supplier, Supplier ↔ Timeline, advanced notifications, new event types, graphical changes, marketplace, monetization, subscriptions, AI, paid domains/services, and cleanup of ownerless events remain excluded.

## Planned sequence after this stop

1. Ownership and IDOR normalization.
2. Legacy endpoint consolidation.
3. Least-privilege grants and RLS on an ephemeral database.
4. E2E authorization matrix and Release Candidate.
