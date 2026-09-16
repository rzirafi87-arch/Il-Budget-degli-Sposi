# Branch 51 — Milestone 3: lifecycle and legacy endpoint consolidation

## Scope and repository-wide caller audit

Every route below was searched by literal URL and by route/module name across `src`, `e2e`, tests, scripts and documentation before modification. Cron routes, dashboard endpoints, catalog writes, subscriptions and Branch 52/53 integrations were not changed.

| Family | Canonical endpoint/core | Compatible aliases | Active callers | Method / side effect | Auth / ownership | Compatibility and retirement |
|---|---|---|---|---|---|---|
| Event creation | `POST /api/event/ensure-default` | `/api/event/new`, `/api/event/create`, `/api/event-core/new` | `/[locale]/select-event-type`, onboarding/E2E and published legacy clients | POST creates or resolves an event and may seed wedding defaults; GET on `/event/new` is 405 | authenticated session; CurrentEvent 0/1/N rules; additional-event owner checks | aliases remain because published clients and documentation still reference them; all delegate to the canonical handler without internal HTTP |
| Legacy budget read/init | `getLegacyEventBudget` / `initializeLegacyEventBudget` | `/api/events/{baby-shower,birthday,engagement-party}/{get,init}` | no browser or internal fetch caller found; documentation/API compatibility only | GET is read-only; POST is idempotent initialization | authenticated session; rows are keyed by authenticated `user_id` and fixed server-side `event_key` | routes remain as thin adapters preserving `{ data }`, 200/401/500 and per-type default currency; candidates for removal after a published-client deprecation window |
| Baptism seed | path endpoint and CurrentEvent endpoint are two request adapters over the same template operation, not response-identical aliases | `/api/baptism/seed` and `/api/baptism/seed/[eventId]` | documentation/published setup flows; no current browser fetch found | POST seeds; GET returns 405 with `Allow: POST` | CurrentEvent form supports accessible current event; explicit form remains owner-only | both remain because request and error contracts differ; GET mutation was already removed in Milestone 1 |
| Other event seed endpoints | each event-specific POST route | none proven | event-specific documentation; no active browser fetch found | POST, template-specific writes | mixed legacy owner checks; reviewed in the 140-route matrix | not aliases: templates, tables and responses differ. Security normalization remains Milestone 4; no false consolidation was introduced |

## Shared handler behavior

`src/lib/legacyEventBudget.ts` is the only implementation for the six legacy budget routes. It centralizes authentication through `requireSession`, currency validation, explicit column selection, fixed server-side event keys, error mapping, idempotent read-before-create and conflict-safe retry. The three `get` routes and three `init` routes are now typed adapters only.

The event-creation aliases already delegate directly to `POST /api/event/ensure-default`; no route performs an internal HTTP call. `/api/event/new` preserves its historical explicit 405 response for GET. CurrentEvent cookie creation, 0/1/N resolution, incomplete setup updates, status codes and response shapes remain in the canonical handler.

## Compatibility details

- GET budget response remains `{ data: row | null }`.
- POST init response remains `{ data: row }`, including when the row already exists.
- Default currencies still come from the event feature metadata.
- Authentication failures remain HTTP 401; validation now rejects malformed currency with HTTP 400 before any write.
- No route, table, schema, migration, event type, cron configuration or Production row was added, removed or changed.
- The `budgets` query no longer uses `select("*")`; its response fields are explicit: `id,user_id,event_key,currency,lines,created_at,updated_at`.

## Parity and idempotency coverage

`branch51LifecycleConsolidation.test.ts` asserts canonical/alias delegation, shared adapters for all three event families, explicit selection, absence of `as any`, GET/POST method separation, fixed event keys, conflict handling and absence of internal/browser callers. Existing lifecycle, seed-route, CurrentEvent, ownership and IDOR suites remain the regression authority.

## Deferred to Milestones 4–5

- Normalize authentication/ownership and remove remaining `as any` across the distinct event seed implementations.
- Complete least-privilege/grant and RLS inventory without Production DML.
- Run and document the final full route matrix, authenticated browser journeys, ephemeral Database Rebuild, Preview integration and release-candidate gates.
- Re-evaluate removal of unused legacy budget aliases only after a published-client deprecation window.
