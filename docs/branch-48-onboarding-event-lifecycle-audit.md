# Branch 48 — Onboarding, event lifecycle & integration audit

Audit-only checkpoint. No application implementation, schema change, Production mutation, event-type activation, or destructive operation is included in this commit.

## Authoritative baseline

- Remote `main`: `f8ec3e123106da38679e6fff1e2c270f634a5ca3` (verified 2026-09-14).
- Branch: `branch-48-onboarding-event-lifecycle`, created directly from that SHA.
- Branch 49: absent; no later roadmap branch was started.
- Working tree before audit: clean and exactly at the authoritative SHA.
- Open pre-existing PRs: #5, #6, #7 and #15; all unrelated to Branch 48.
- Main CI: run #456, PASS, same SHA.
- Latest applicable Database Rebuild: run #196, PASS, Branch 47 final SHA `cfa5c8e...` (the second parent of the verified merge commit).
- Production: Vercel deployment `dpl_3hheyUuYNmTFw8Lzz1iVmSPVmY4C`, READY, target `production`, same main SHA.
- Final pre-merge browser evidence: Playwright i18n matrix #14 PASS on `cfa5c8e...`; authenticated wedding journey really executed at 390 px. Direct unauthenticated fetch of the deployment currently reaches Vercel SSO protection (302), so it is not treated as additional functional evidence.
- Focused local audit tests: 8 suites / 73 tests PASS (CurrentEvent, onboarding client, partner collaboration, event-context integration, event auth, IDOR routes, middleware and event-type selector).

## Production data snapshot (read-only)

Read-only queries against the active project `vsguhivizuneylqhygfk` returned:

- suppliers: **326** (legacy catalog preserved);
- events: **24**;
- events whose `owner_id` does not resolve to `auth.users`: **11**;
- event members: **19**;
- event invitations: **0**;
- wedding events: **17**; non-wedding legacy events: **7**;
- RLS enabled on `events`, `event_members`, `event_invitations`, `saved_churches`, `saved_locations`, `saved_suppliers`, `budget_items`, `timeline_items`, and `expenses`;
- `event_members` and `event_invitations` expose no `anon` table privileges. Several older event-scoped tables still have broad `anon` grants but their RLS policies are authenticated-only; this needs a regression test and later least-privilege cleanup, not a destructive change.

The roadmap mentions 3 documented orphan events, but the current production query finds 11 orphan rows under the precise definition above. Branch 48 must preserve all 11 currently present rows. No cleanup is authorized; the historical “3” must be reconciled as documentation, not used as a deletion target.

## Mandatory matrix

Status meanings: **IMPLEMENTATO** = complete in code/schema and backed by relevant evidence; **PREDISPOSTO** = foundation exists but the end-to-end user experience or coverage is incomplete; **DA MODIFICARE** = verified Branch 48 defect/gap; **RINVIATO** = intentionally assigned to the stated later branch.

| Requisito | Stato attuale | Evidenza | Problema reale | Intervento proposto | Branch | Test necessario |
|---|---|---|---|---|---|---|
| Signup | DA MODIFICARE | Auth UI + `/api/auth/register`; signup link generated server-side | Registration selector reads `events.json.available`, which still exposes several non-READY types and the API accepts the supplied type without capability validation | Source choices from capability registry and reject non-READY types server-side | 48 | Jest API + Playwright registration |
| Conferma email | IMPLEMENTATO | PKCE callback, branded confirmation link, generic anti-enumeration response | No Branch 48 regression found | Preserve | 48 | Confirmation callback regression |
| Login | IMPLEMENTATO | `signInWithPassword`; authenticated Playwright #14 | No current regression evidenced | Preserve | 48 | Authenticated Playwright |
| Logout | IMPLEMENTATO | Profile/logout flow; Playwright verifies back navigation cannot reopen profile | No current regression evidenced | Preserve | 48 | Authenticated Playwright |
| Reset password | PREDISPOSTO | Recovery endpoint, branded link, callback and reset page exist | Not covered end-to-end in the current authenticated journey | Add recovery/callback/reset regression coverage | 48 | API + Playwright link-state tests |
| Primo accesso | PREDISPOSTO | `getOnboardingStatus`, wizard gate and 3-step flow | Signup creates an event before confirmation, so first login is treated as complete even when setup fields are incomplete | Resolve setup completeness independently from event existence | 48 | First-login matrices |
| Utente senza eventi | IMPLEMENTATO | Resolver returns `NO_EVENT`; unit coverage | UI behavior needs inclusion in new E2E suite | Preserve and E2E verify | 48 | 0-event Playwright |
| Creazione primo evento | PREDISPOSTO | `/api/event/ensure-default` creates READY wedding and sets HTTP-only CurrentEvent cookie | Multiple overlapping create endpoints exist; older `/api/event/new` is wedding-hardcoded and exposes GET mutation | Canonicalize Branch 48 onboarding on `ensure-default`; disable/remove unsafe GET behavior without touching data | 48 | 0→1 event API/E2E |
| Ripresa setup incompleto | DA MODIFICARE | Language/country/type live only in browser cookies/localStorage; resolver sees any event as complete | Incomplete persisted event redirects to dashboard instead of the missing step; wizard clears some client state | Add server-derived setup state and resume the first missing step | 48 | Reload/new-device/incomplete-state Playwright |
| Nuovo login + CurrentEvent | IMPLEMENTATO | Membership-first resolver, HTTP-only cookie, single-event fallback; authenticated smoke relogin | No resolver regression evidenced | Preserve | 48 | Relogin E2E for 1 event |
| Loading/error/empty states | PREDISPOSTO | `LoadingState`, wizard retry UI, dashboard retry UI, `NO_EVENT` | Selector silently renders nothing on fetch error; invitation/event-management empty/error UI absent | Add explicit accessible states for Branch 48 surfaces | 48 | Component + Playwright failure injection |
| Mobile 320–430 px | PREDISPOSTO | Public matrix and authenticated 390 px journey PASS | Full Branch 48 flows, dialogs and auth at 320/430 not covered | Extend viewport matrix to onboarding/lifecycle flows | 48 | Playwright 320, 390, 430 |
| Tastiera/screen reader | PREDISPOSTO | Labels, alerts, focus-to-error and dialog semantics exist | Event-switch dialog lacks focus trap, initial focus, Escape and focus return; selector loading/error is unannounced | Implement dialog keyboard contract and live statuses | 48 | axe/manual keyboard + Playwright |
| Creazione evento | PREDISPOSTO | Canonical resolver and `ensure-default`; owner-membership trigger | UI only supports first/default event; no coherent “create another event” lifecycle | Add one canonical owner-only create flow for READY wedding | 48 | 0/1/N create tests |
| Modifica dati principali | PREDISPOSTO | `/api/event/update` updates current event/card | Uses service client, explicit `any`, weak validation; partner/owner rules are implicit | Type payload, validate fields, define allowed partner edits, remove `any` | 48 | auth/validation/IDOR tests |
| Selezione e cambio evento | DA MODIFICARE | CurrentEvent API + selector confirmation exist | With N events dashboard redirects to wizard; wizard routes to language flow; event-type page routes back to dashboard. The real selector is unreachable, while legacy `/select-event` stores an event type as `activeEventId` | Route `SELECTION_REQUIRED` directly to a real ID-based selector and retire legacy localStorage semantics | 48 | N-event E2E + stale/foreign ID |
| Persistenza CurrentEvent | IMPLEMENTATO | Validated HTTP-only `app-current-event`, 1-year cookie, stale-cookie recovery | No current regression evidenced | Preserve | 48 | Reload/relogin/cross-tab tests |
| Eliminazione sicura evento | DA MODIFICARE | DB DELETE is owner-only | No event-delete API/UI/confirmation; account deletion text mentions safety but is a different lifecycle | Add owner-only explicit event deletion with typed confirmation, last/selected-event recovery and no bulk cleanup | 48 | owner/partner/IDOR/cascade fixture tests |
| 0, 1, N eventi | DA MODIFICARE | Resolver unit tests fully model 0/1/N | N-event UI routing is broken as above | Repair routing; retain resolver behavior | 48 | Full 0/1/N Playwright |
| Route event-scoped | PREDISPOSTO | Critical APIs use authoritative resolver; integration test guards common routes | Page protection is client-side and can flash/load before redirect; not every route has a server guard | Add shared route gate for Branch 48 lifecycle-critical pages; broad hardening remains Branch 55 | 48/55 | anonymous/foreign-event route matrix |
| Isolamento eventi | IMPLEMENTATO | Event IDs resolved from accessible membership; API IDOR tests; production RLS uses `can_access_event` | Continue regression coverage as lifecycle changes | Preserve | 48 | owner A/B + partner + third-user IDOR |
| Owner e partner | PREDISPOSTO | Canonical membership tables, roles/status, owner helper, shared module RLS | Direct `events` UPDATE policy permits any active partner to update all columns, including `owner_id`, through the Data API | Add minimal additive ownership immutability enforcement and server tests | 48 | Partner owner_id mutation rejection |
| Invito partner | PREDISPOSTO | Owner-only invitation API, hashed token, expiry | No UI or delivery; signup's `inviteUserByEmail` is separate from canonical invitation lifecycle | Build owner UI and one canonical email/link creation path without logging token | 48 | owner/non-owner/API/email adapter tests |
| Accettazione invito | PREDISPOSTO | Atomic service-only RPC + authenticated API; email binding and replay protection | No acceptance page/redirect/CurrentEvent selection UX | Add localized acceptance route and set/resolve CurrentEvent after success | 48 | valid/mismatch/replay E2E |
| Invito scaduto/non valido | PREDISPOSTO | Stable API codes and DB expiry/replay checks | No localized user-facing recovery path | Add explicit states and return-to-owner/contact guidance | 48 | expired/revoked/invalid tests |
| Rimozione partner | PREDISPOSTO | Owner-only member DELETE API performs soft revoke; RLS denies revoked member | No management UI; legacy email-only access may lack a member row to revoke | Surface members; canonicalize legacy access before management; verify cookie recovery | 48 | revoke then API/UI denial |
| Auto-elevazione privilegi | DA MODIFICARE | Role checks prevent partner→owner membership update; SQL test covers partner event deletion denial | `events.owner_id` remains mutable under partner UPDATE policy, an ownership-boundary defect | Make ownership immutable except controlled owner transfer (transfer itself out of scope) | 48 | Direct Data API/RLS negative test |
| Event ↔ Chiesa | PREDISPOSTO | `saved_churches`, selected flag, planning selections API | Dashboard/setup semantics incomplete | No implementation now | 49 | Selection/dashboard tests |
| Event ↔ Location | PREDISPOSTO | `saved_locations`, role/status/selected, planning API | Setup-state semantics incomplete | No implementation now | 49 | Per-role selection tests |
| Event ↔ Fornitore | PREDISPOSTO | `saved_suppliers` private event relation | Operational selection flow incomplete | No implementation now | 49/52 | Save/select/isolation tests |
| Location ↔ Fornitore | RINVIATO | No canonical operational link found | Not Branch 48 | Design later | 52 | Schema/API integration |
| Fornitore ↔ Budget | PREDISPOSTO | `budget_items.saved_supplier_id` FK exists | End-to-end UI/API wiring incomplete | No implementation now | 50/52 | Link/unlink/IDOR tests |
| Fornitore ↔ Timeline | PREDISPOSTO | `timeline_items.saved_supplier_id` FK exists | End-to-end UI/API wiring incomplete | No implementation now | 52/53 | Link/unlink/IDOR tests |
| Fornitore ↔ promemoria pagamento | RINVIATO | Amount/deposit fields exist; no coherent reminder integration found | Not Branch 48 | Implement with payments/reminders | 50/53 | Due-date/notification tests |
| Dashboard ↔ Chiesa/Location/Fornitore | PREDISPOSTO | Planning selections + progressive supplier flag | Dashboard does not fully represent configuration state | No implementation now | 49 | Config-state matrix |
| “Ancora da scegliere” | PREDISPOSTO | Null/undecided ceremony values are allowed | Consistent UI state across entities is incomplete | No implementation now | 49 | Empty/undecided state tests |
| Catalogo globale ↔ privati salvati | IMPLEMENTATO | Global catalog tables + event-private saved tables/FKs and RLS | Operational polish remains later | Preserve now | 52 | Catalog/save isolation tests |
| API ↔ UI | DA MODIFICARE | Many APIs exist | Lifecycle APIs for invitations/members are not surfaced; legacy selectors/endpoints conflict with canonical APIs | Wire only Branch 48 lifecycle UI; defer domain integrations | 48, then 49–54 | Contract + E2E tests |
| Architettura non solo matrimonio | PREDISPOSTO | Capability registry normalizes 18 types | Several old endpoints/copy remain wedding-hardcoded | Avoid new hardcodes; clean only paths touched by Branch 48 | 48/55 | Architecture scan |
| `/select-event-type` preservato | IMPLEMENTATO | Capability-driven page renders READY/COMING_SOON | Must remain the first-event-type step, not an event-instance selector | Preserve semantics | 48 | Route/component tests |
| Cambio evento preservato | DA MODIFICARE | API and component exist | Unreachable in N-event routing | Repair, do not replace with event-type chooser | 48 | N-event Playwright |
| Matrimonio READY; altri COMING_SOON | DA MODIFICARE | Capability registry is correct: wedding READY, 17 COMING_SOON | Registration UI's separate `available` flags expose 8 event types, and register API does not reject them | Make registry authoritative at every creation entry point | 48 | All-type negative matrix |
| Dati esistenti / 326 fornitori | IMPLEMENTATO | Production read-only count 326; audit commit has no data mutation | Must remain invariant | Add count/integrity pre/post gates | 48 | DB invariant test |
| Eventi orfani | DA MODIFICARE | Production has 11 under current query, not documented 3 | Baseline documentation is stale; cleanup would be unsafe | Preserve all; document exact definition/count; no repair in this pass | 48 | Pre/post count + migration fixture |
| Migrazioni additive/minimali | IMPLEMENTATO | Branch 47 migration is additive; no Branch 48 migration yet | Any security fix must remain additive | Enforce review rule | 48 | Database rebuild |
| RLS / IDOR / isolamento | IMPLEMENTATO | Production policies + SQL/Jest IDOR coverage | Add lifecycle-specific negatives | Preserve/extend | 48 | DB + API RLS/IDOR |
| Accesso anonimo | PREDISPOSTO | Sensitive collaboration tables revoke anon; other scoped tables have authenticated-only RLS | Legacy broad grants remain defense-in-depth debt | Test denial now; least-privilege inventory/cleanup later | 48/55 | `anon` CRUD denial SQL |
| Nessun secret / service_role client | IMPLEMENTATO | Service client server-only; raw invite token not stored/logged; secret scan in CI | Response token must be consumed only by delivery layer in final design | Preserve and test logs/source boundaries | 48 | secret scan + source assertion |
| Tipi Supabase rigenerati | IMPLEMENTATO | `database.types.ts` includes Branch 47 tables/FKs | New schema change would require regeneration | Preserve requirement | 48 | generated type diff |
| Nessun `as any` | DA MODIFICARE | Audit finds explicit `as any` and lint suppression in `/api/event/create` and `/api/event/update` | Violates stated Branch 48 typing gate | Remove in touched lifecycle endpoints using generated types | 48 | TypeScript + source assertion |
| Nuovi event type | RINVIATO | Capability registry keeps them COMING_SOON | Explicitly outside roadmap | Do not activate | dedicated later | Capability regression |
| Marketplace/monetizzazione/abbonamenti/PWA/AI | RINVIATO | Existing legacy code does not change Branch 48 scope | Explicitly outside roadmap | No implementation | dedicated later | None in Branch 48 |

## Proposed Branch 48 implementation scope (not started)

1. Establish one server-derived onboarding state machine: anonymous, unconfirmed/invalid link, no event, incomplete event, selection required, complete.
2. Repair the N-event routing loop and make the ID-based CurrentEvent selector reachable; preserve `/select-event-type` exclusively for choosing a type before creating the first/new event.
3. Make the capability registry authoritative for every event-creation entry point; wedding remains the only READY type.
4. Canonicalize create/update/delete lifecycle APIs, remove GET mutation behavior, validate payloads, remove lifecycle `as any`, and add a safe owner-only event deletion flow.
5. Complete partner collaboration UI: create/deliver invitation, accept states, list/revoke partner, and CurrentEvent recovery after acceptance/revocation.
6. Close the ownership boundary by preventing partners from mutating `events.owner_id`; use only an additive minimal migration if SQL enforcement is necessary.
7. Add Branch 48 E2E/API/DB coverage for 0/1/N events, incomplete setup recovery, owner/partner/third-user boundaries, invite validity, deletion recovery, 320–430 px and keyboard/screen-reader behavior.
8. Preserve Production data, all 326 suppliers, all currently observed orphan rows, all legacy events and all non-READY event-type records. Do not implement Branch 49 integrations.

## Required gates before Ready for review

TypeScript, ESLint (0 errors), Jest, build, i18n integrity, MISSING_MESSAGE scan, authenticated Playwright, 320–430 px, accessibility, Database Rebuild, RLS, IDOR, CI, Preview READY and affected route/API smoke must all pass. The PR remains Draft until then.

## Milestone 1 — Security & event lifecycle API foundation

- Authoritative protected data baseline: 326 legacy suppliers and 11 events whose
  owner_id no longer resolves to auth.users. The migration performs no data
  update, deletion, backfill, or cleanup.
- Canonical event-creation endpoint: POST /api/event/ensure-default.
  /api/event/new, /api/event/create, and /api/event-core/new remain POST
  compatibility aliases, so existing callers are not broken while duplicate
  implementations are removed.
- GET /api/event/new is read-only and returns stable METHOD_NOT_ALLOWED with
  HTTP 405 and Allow: POST.
- events.owner_id is protected by an additive BEFORE UPDATE OF owner_id trigger.
  Authenticated Data API callers, including active partners, receive
  EVENT_OWNER_IMMUTABLE; normal owner and partner updates to permitted
  non-ownership fields remain governed by existing RLS.
- Lifecycle route payloads now use generated Supabase Insert/Update types and
  runtime validation. All as-any casts and their lint suppressions were removed
  from the lifecycle endpoints in scope.
- Added Jest contract/source tests and transactional SQL tests for anonymous,
  owner, partner, unrelated-user, cross-event, direct Data API, row-preservation,
  canonical-consumer and GET-no-mutation behavior.

This milestone intentionally does not implement deletion, partner UI/invitation
delivery or acceptance UX, incomplete-setup recovery, multi-event routing,
registration changes, later integrations, or new event-type activation.

## Milestone 5 — Complete partner lifecycle

- Reused the canonical Branch 47 `event_members`, `event_invitations`,
  `can_access_event()` and service-only atomic acceptance RPC. No second
  partner model was introduced; roles remain only `owner` and `partner`.
- Replaced raw-token API responses with delivery through the existing Resend
  adapter. Only SHA-256 hashes are stored; links use a verified HTTPS origin,
  HTML-escaped event/owner data, explicit expiry and localized IT/EN/ES/FR/DE
  copy. Provider rejection is persisted as `delivery_status=failed` and is
  returned as a non-success response.
- Added one-pending-invitation and one-active-partner uniqueness, atomic
  accept/reject and atomic token rotation for controlled resend. The lifecycle
  recognizes pending, accepted, rejected, revoked and expired states.
- Added owner UI in Profile for status, invite, resend, cancel and removal; added
  recipient invite UI for login/signup return, inspection, accept/reject; added
  partner status and voluntary leave. Acceptance selects CurrentEvent using the
  existing HTTP-only cookie. Revoke/leave make canonical membership non-active,
  which disables the legacy email fallback and causes stale CurrentEvent
  recovery on the next request.
- Legacy `bride_email`/`groom_email` access remains unchanged for rows that
  have no canonical membership. A revoked/left canonical membership continues
  to override that fallback. No legacy backfill, cleanup or Production DML is
  included.
- The additive migration adds only constraints, indexes, delivery metadata and
  functions; it performs no DML and preserves existing valid memberships,
  invitations, 11 orphan events, 326 suppliers, global catalogs and unrelated
  event data.
- The legacy optional partner field during ordinary owner registration remains
  compatible. Registration reached from a canonical invitation now creates only
  the recipient account and returns to that invitation after confirmation,
  avoiding creation of an unrelated default event.
- Deferred: real two-identity authenticated partner Playwright is gated on a
  securely configured second QA identity. Local tests use only invalid-domain
  fixtures and mocked/static contracts; no real non-QA email is sent.
