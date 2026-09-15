# Branch 49 — Planning selections & Dashboard integration audit

Audit-only checkpoint. No application implementation, schema change, migration, Production mutation, DML, event-type activation, domain purchase, or paid infrastructure is included.

## Authoritative baseline

- Remote `main`: `2b4157d269c904c0da84eefe5a04cf0bdfe9e187`.
- Branch: `branch-49-planning-selections-dashboard-integration`, created directly from that exact SHA.
- Parent verification: exact.
- Clean checkout verification: detached checkout of the authoritative SHA had no tracked or untracked changes.
- PR #55: MERGED.
- Main CI: run #526 / ID `35015668091`, PASS on the exact SHA.
- Database Rebuild: latest applicable Branch 48 rebuild #249 PASS; the post-merge follow-up commits through the current main SHA changed only CI/E2E smoke infrastructure and no schema or migration. No new rebuild was required or executed for this audit.
- Production deployment `dpl_AAM6StCVtjnHVTKoxFhzVfvWqYiQ`: READY via both Vercel commit statuses on the exact SHA.
- Production smoke run `35015972215`: PASS on `main` and the exact SHA. HTTP preflight and public/authenticated/M8 browser job passed.
- No pre-existing Branch 49 branch or Branch 49 PR was found. Branch 50 is absent.
- Production URL remains `https://il-budget-degli-sposi.vercel.app`.
- Additional cost: €0.

## Source precedence and authoritative scope

The most recent explicit roadmap assignment is the mandatory matrix in
`docs/branch-48-onboarding-event-lifecycle-audit.md`. It is more authoritative
than old setup guides, completion documents and generic feature lists because it
was produced from the current canonical data model immediately before Branch 48
implementation and assigns each integration to a numbered future branch.

Branch 49 is therefore:

1. Event ↔ Church operational selection.
2. Event ↔ Location operational selection, including location role.
3. Event ↔ Supplier operational saved/selection state only where assigned to
   Branch 49; downstream commercial linking remains Branch 52.
4. Dashboard representation of Church, Location and Supplier configuration.
5. Consistent selected / undecided / “ancora da scegliere” states.
6. Event-scoped isolation, owner/partner authorization, mobile, accessibility,
   and IT/EN/ES/FR/DE coverage for those flows.

Older ADRs sometimes label Dashboard ↔ Church/Location as implemented. That is
true for the original catalog foundation, but the newer Branch 48 audit explicitly
classifies the complete configuration semantics as PREDISPOSTO and assigns the
remaining integration to Branch 49. The newer audit governs this branch.

## Scope separation

### Explicitly assigned to Branch 49

- Event ↔ Church selection and Dashboard state.
- Event ↔ Location selection by role and Dashboard state.
- Event ↔ Supplier saved/selected configuration insofar as the Dashboard/setup
  needs a coherent current-event state.
- Dashboard ↔ Church/Location/Supplier configuration matrix.
- Consistent “ancora da scegliere” state.

### Branch 48 non-blocking residuals — excluded

- Node/action deprecation warnings.
- Optional missing JUnit artifact after passing Jest execution.

### Branches 50–53 — excluded or only compatibility-tested

- Supplier ↔ Budget: Branch 50/52.
- Supplier ↔ Location canonical relation: Branch 52.
- Global catalog ↔ private operational polish beyond Branch 49: Branch 52.
- Supplier ↔ Timeline: Branch 52/53.
- Supplier payment reminders: Branch 50/53.
- Broader API/UI domain integrations: later roadmap branches.

### Deferred and outside scope

- General server-route hardening: later hardening branch.
- Legacy hardcode cleanup: general technical debt/later hardening.
- Least-privilege cleanup of legacy grants: later security hardening.
- Classification, reassignment or deletion of the 11 ownerless events.
- New event types; Matrimonio remains the only READY type.
- Marketplace, monetization, subscriptions, AI and future integrations.
- Custom Production domain and all launch prerequisites requiring spend.

## Technical and functional matrix

| Requirement | Status | Current evidence | Files/routes/API/DB | UI/mobile/a11y/i18n | Security/data/cost | Tests and milestone |
|---|---|---|---|---|---|---|
| Event ↔ Church | PARZIALMENTE IMPLEMENTATO | `saved_churches` supports save, status, favorite, selected and uniqueness; catalog UI can select | `/chiese`; `/api/my/churches`; `saved_churches`, `churches` | Card action exists; must make selected/undecided state explicit at 320–430 px, keyboard and live status; keys required in IT/EN/ES/FR/DE | Current-event filter exists. Service client bypasses RLS, so explicit owner/allowed-partner mutation policy is required in route code. No Production DML; €0 | Existing event-context source test only. Add API auth/IDOR, selection replacement, UI/E2E. M1–M3 |
| Event ↔ Location | PARZIALMENTE IMPLEMENTATO | `saved_locations` supports roles and one selected row per event/role; UI currently manages reception only | `/location`; `/api/my/locations`; `saved_locations`, `locations` | Reception UX exists; ceremony/accommodation/party/other role semantics are not surfaced coherently; responsive, focus and announcements need tests; five launch locales | Same service-client authorization risk. Existing rows and roles must remain unchanged. No migration expected unless an audit proves a missing invariant | Existing event-context source test only. Add per-role replacement, cross-event/partner negatives and E2E. M1–M3 |
| Event ↔ Supplier planning state | PREDISPOSTO | `saved_suppliers` stores workflow status including SELECTED, but catalog UI only toggles saved/not saved and Dashboard does not load suppliers | `/fornitori`; `/api/my/suppliers`; `saved_suppliers`, `suppliers` | Add selected/undecided workflow without budget, timeline, payment or marketplace coupling; mobile list/map and accessible action state; five launch locales | Explicit authorization needed because service client is used. Preserve all 326 suppliers and existing saved rows. €0 | Current-event source test only. Add state-transition, isolation, UI and E2E tests. M1–M4 |
| Planning selections read model | DA MODIFICARE | GET returns church and locations only; all exceptions collapse to 401; no supplier state | `/api/my/planning-selections` | Dashboard cannot distinguish auth failure, load failure, empty selection and undecided state; loading/error announcements missing | Must return stable typed codes and enforce accessible current event; read-only and no schema change expected | No direct tests found. Add contract/auth/IDOR/current-event tests. M1 |
| Dashboard configuration cards | PARZIALMENTE IMPLEMENTATO | Church and reception cards show selected name or fallback CTA; supplier card absent | `/dashboard`, `ProgressiveSetup`, planning selections API | Cards are wedding-only; add coherent empty/selected/error/loading UI, supplier summary, 320/390/430 coverage, focus order, headings and five-locale keys | No writes from Dashboard. Do not expose another event’s selections. €0 | No focused Dashboard planning-selection test found. Add components/Jest and authenticated Playwright. M3–M5 |
| “Ancora da scegliere” semantics | PREDISPOSTO | Church/location translation fallback exists; no shared state contract and no supplier equivalent | Dashboard and three catalog pages; translation bundles | Define one accessible state vocabulary: not saved, saved/considering, selected, explicitly undecided; no color-only meaning | Pure UI/API contract; preserve nullable/legacy values | Translation integrity, state matrix, screen-reader assertions. M2–M5 |
| Progressive supplier setup | DA MODIFICARE | `has_suppliers` is derived from expenses with non-null supplier text, not `saved_suppliers` or selected state | `/api/event/resolve`; `ProgressiveSetup` | Can mark setup complete for unrelated legacy expense text or incomplete after catalog selection | Read-only derivation; avoid backfill/DML. Define whether saved or selected completes the step | Extend existing Branch 47 first-experience tests and add browser state tests. M2–M4 |
| Current-event isolation | IMPLEMENTATO foundation / DA ESTENDERE | All three private APIs use the authoritative resolver and filter mutations by event_id | `requireCurrentEvent` / `requireServerCurrentEvent`; saved tables | Switching event must refresh every card and catalog state without stale client data | Add owner A/B, partner and third-user IDOR coverage; preserve 11 ownerless events and all memberships | Existing source assertion; missing behavioral Branch 49 matrix. M1–M5 |
| Mobile and accessibility | PREDISPOSTO | Responsive grids, buttons, labels and alerts exist | Dashboard/catalog components | Require 320, 390 and 430 px; keyboard actions; focus visibility; `aria-live` for async save/select/error; touch targets; no horizontal overflow | No data impact; €0 | Component accessibility plus Playwright/axe/manual keyboard checklist. M3–M5 |
| IT/EN/ES/FR/DE | PREDISPOSTO | Existing catalog/dashboard namespaces cover portions; no complete shared Branch 49 state vocabulary | message bundles and i18n scanners | Add exactly matching keys and placeholders across five READY locales; other 45 locales remain INTERNAL_ONLY | No cost/data impact | Missing/extra/empty/placeholder and MISSING_MESSAGE checks. M2–M5 |
| Migration | NOT CURRENTLY NECESSARY | Schema already models selected church, location role uniqueness and supplier status | Existing Branch 26–30 migrations/types | None planned | Any later necessity must be additive, zero-DML and separately justified; preserve all Production data | Database Rebuild only if schema changes become demonstrably necessary |
| General route hardening, legacy hardcodes, legacy grants, ownerless-event classification, advisor, new event types | FUORI SCOPE / RINVIATO | Explicitly deferred by Branch 48 final audit or later roadmap assignments | Repository-wide | No Branch 49 changes | No DML, no event activation, no Production modification | Compatibility regression only where touched |

## Proposed milestones

### M1 — Contract and authorization audit

- Objective: define typed planning-selection read/write contracts and explicit
  owner/partner permissions before UI work.
- Files: four `/api/my/*` routes, auth/current-event helpers, focused Jest tests.
- Schema: none.
- Tests: auth, owner, partner, third user, stale/foreign current event, stable
  error codes, zero mutations on failed authorization.
- Gate: focused Jest + TypeScript.
- Risk: accidental privilege expansion through service-client routes.
- Rollback: revert route/test commit; no DB rollback.
- Dependency: none.
- Complete when the permission matrix is explicit and all negative tests pass.

### M2 — Canonical selection state model

- Objective: normalize saved, considering, selected and undecided semantics for
  church, location roles and supplier.
- Files: API DTO/types, catalog state helpers, five locale bundles.
- Schema: none expected.
- Tests: state transitions, single selected church, single selected location per
  role, supplier status, i18n parity.
- Gate: focused tests, TypeScript, ESLint.
- Risk: changing legacy meaning of existing rows.
- Rollback: revert code; rows remain untouched.
- Dependency: M1.
- Complete when legacy values are read compatibly and no automatic writes occur.

### M3 — Church and Location end-to-end UX

- Objective: complete explicit selection/replacement/undecided UX and Dashboard
  representation for church and location roles.
- Files: church/location pages, Dashboard cards/read model, shared UI/tests.
- Schema: none expected.
- Tests: component, API, 320/390/430 Playwright, keyboard/a11y, event switch.
- Gate: focused tests → TypeScript/ESLint → Jest.
- Risk: stale selections after replacement or CurrentEvent switch.
- Rollback: revert UI/API changes; no data migration.
- Dependency: M1–M2.
- Complete when each role is isolated and Dashboard mirrors the current event.

### M4 — Supplier planning and progressive setup

- Objective: expose supplier workflow selection and derive setup state from the
  canonical event-private relation without budget/timeline/payment coupling.
- Files: supplier page/API, planning selections API, event resolve/setup.
- Schema: none expected.
- Tests: status transitions, isolation, progressive-step semantics, mobile/a11y.
- Gate: focused tests → TypeScript/ESLint → Jest.
- Risk: treating “saved” and “selected” as equivalent without a product decision;
  default proposal is that SELECTED completes the setup step.
- Rollback: revert derivation/UI; no stored data rewrite.
- Dependency: M1–M2.
- Complete when the supplier state is coherent in catalog, setup and Dashboard.

### M5 — Integration matrix and release candidate

- Objective: verify complete Branch 49 behavior and translations without
  activating event types.
- Files: tests/workflows only unless a verified defect is found.
- Schema: none; Database Rebuild only if a justified additive migration exists.
- Tests/gates in order:
  1. focused API/component/state tests;
  2. TypeScript and ESLint;
  3. full Jest;
  4. build and IT/EN/ES/FR/DE i18n;
  5. Database Rebuild only if pertinent;
  6. Playwright owner/partner/A-B event and 320/390/430 matrix;
  7. Preview;
  8. final audit;
  9. merge only after explicit authorization;
  10. Production smoke after merge.
- Risk: cross-event stale UI or fixture residue.
- Rollback: revert the Branch 49 merge if authorized later; all test fixtures
  require deterministic cleanup.
- Dependency: M1–M4.
- Complete when all gates pass on one exact HEAD and fixture residue is zero.

## Data, security and cost invariants

- Preserve all valid events, 11 events without a resolvable owner, partner
  memberships, 326 suppliers, 896 churches, 155 locations, catalogs,
  event-scoped data and legacy Idea Budget subcategories.
- No Production DML, migration or configuration change during audit.
- No new event type activation.
- No custom-domain work.
- No new paid service or infrastructure.
- Additional cost: €0.

## Stop condition

This commit records audit and planning only. Implementation must not start until
a separate Branch 49 milestone command is authorized. Branch 50 must not start.

## Milestone 1 checkpoint — contracts and authorization

- Added one explicit authorization boundary for every planning-selection read
  and mutation before any service-client table access.
- The permission contract mirrors the existing shared-event RLS behavior:
  active owner, partner and preserved legacy spouse access may read and mutate;
  unauthenticated, no-event, selection-required and inaccessible-event requests
  fail before data access.
- Standardized stable authentication/current-event/internal error codes and
  removed raw database error details from the affected routes.
- Added generated-database-type-derived insert/update contracts for churches,
  locations and suppliers; request-controlled `event_id` remains forbidden.
- All reads and row mutations remain constrained to the authoritative current
  event. Cross-event row IDs resolve to 404 without mutation.
- Added focused tests for the role matrix, 401/404/409/500 contracts, resolver
  delegation, current-event source assertions and generated payload typing.
- Schema/migrations: none. Production/DML/event types/UI: unchanged.

## Milestone 2 checkpoint — canonical selection states

- Added one shared API state vocabulary: `saved`, `considering`, `selected`
  and `rejected`; `undecided` is intentionally an aggregate decision state,
  never a new stored database value.
- Existing Church/Location lowercase and Supplier uppercase workflow statuses
  are mapped without backfill, deletion or mutation of legacy rows.
- Church, Location and Supplier API responses now include additive
  `planning_state` metadata while preserving every existing response field.
- The planning-selection read model adds additive current-event decision state
  for Church and every canonical Location role.
- Church/Location writes normalize boolean/status combinations so new rows
  cannot remain `selected=false` with stored status `selected`.
- Explicit deselection returns to `considering`; discarded/rejected remains a
  separate terminal planning state. Existing stored values remain readable.
- Added a pure state-matrix test suite covering every legacy status family,
  aggregate undecided behavior, non-mutating enrichment and contradictory
  mutation normalization.
- Schema/migrations/DML/UI/Production/event types: unchanged.

## Milestone 3 checkpoint — Church and Location UX with Dashboard

- Added an accessible live decision summary to Church and Location catalogs;
  users can distinguish a confirmed choice from “still to choose” without
  relying on color.
- Location planning now exposes all canonical roles: reception, civil ceremony,
  accommodation, party and other. Saved/private state is reloaded and isolated
  whenever the active role changes.
- New Location saves use the explicitly selected canonical role instead of the
  previous hardcoded `reception` value.
- Dashboard now represents the selected/undecided Church and every Location
  role from the authoritative current-event read model.
- Cards use responsive 1/2/3-column layouts, wrapping names and stable semantic
  headings; async decision summaries are announced through `aria-live`.
- Added complete IT/EN/ES/FR/DE Branch 49 planning vocabulary in isolated
  additive bundles and focused source/schema tests.
- Schema/migrations/DML/Production/event types: unchanged.

## Milestone 4 checkpoint — Supplier state and progressive setup

- Supplier catalog cards now separate a saved favorite from an explicitly
  confirmed planning choice; users can confirm or undo confirmation through
  the existing event-scoped PATCH contract.
- The accessible live summary reports confirmed supplier count without relying
  on color, and the action remains usable in the existing responsive card grid.
- The current-event planning read model now returns selected suppliers and the
  aggregate supplier decision used by Dashboard.
- Dashboard includes a supplier decision card linked only to the supplier
  catalog. No Budget, Timeline, expense or payment relationship is created.
- Progressive setup now completes the supplier step only when the canonical
  event-private `saved_suppliers.status = SELECTED` relationship exists; legacy
  free-text expense supplier names no longer imply a planning decision.
- Existing Supplier workflow values remain unchanged. Explicit undo returns to
  `SAVED`; no existing relationship or catalog row is rewritten or deleted.
- Added complete IT/EN/ES/FR/DE supplier-selection vocabulary and focused tests
  for transitions, read-model exposure, setup semantics and Dashboard wiring.
- Schema/migrations/DML/Production/event types: unchanged.
