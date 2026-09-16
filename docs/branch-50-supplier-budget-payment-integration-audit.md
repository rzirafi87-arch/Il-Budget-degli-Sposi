# Branch 50 — Supplier, Budget & payment integration audit

Audit-only checkpoint. No application implementation, schema change, migration,
Production mutation, DML, event-type activation, domain purchase or paid
infrastructure is included.

## Authoritative baseline

- Remote `main`: `30cf55b657eed9161c9d71d2fdd3026b09032d8e`.
- Branch 49 release candidate: `fa00746786a849f0b9f174c4f36df42069c48f2d`.
- PR #61: MERGED; merge commit equals the verified main SHA.
- Main CI #533 / run `35025551542`: PASS; build, typecheck, lint and tests all
  completed successfully.
- Production deployment `dpl_GEuG5m8JTRAijTmC9MKhWKybFZAL`: READY,
  target `production`, source `main`, exact verified SHA, alias error absent.
- Authoritative free Production origin:
  `https://il-budget-degli-sposi.vercel.app`.
- Production smoke run `35015972215`, attempt 2: PASS. HTTP preflight and
  public/authenticated/partner browser smoke passed; Production-safe M8 passed.
- Before creation, no branch named for Branch 50 or Branch 51 and no
  corresponding numbered roadmap PR existed.
- Branch 51 was not started.
- Branch 50:
  `branch-50-supplier-budget-payment-integration`, created directly from the
  exact verified main SHA.
- Additional cost: €0.

## Source precedence and authoritative scope

The latest explicit numbered assignment is the mandatory integration matrix in
`docs/branch-48-onboarding-event-lifecycle-audit.md`. The Branch 49 audit and
its final merged implementation are the newer compatibility boundary. ADR 004
defines the canonical supplier model. These sources govern over older generic
feature documents and legacy patch guides.

The authoritative Branch 50 scope is the smallest coherent vertical slice
explicitly assigned to 50:

1. connect an event-private saved/selected supplier to Budget and Expenses using
   the already-present nullable `saved_supplier_id` relationships;
2. expose safe link/unlink behavior in the current-event Budget/expense workflow;
3. connect supplier-related expenses to the existing
   `payment_reminders` system without creating a second reminder model;
4. provide current-event, owner/active-partner safe read/write contracts,
   responsive and accessible UX, and IT/EN/ES/FR/DE message parity;
5. preserve manual Budget rows, Idea Budget rows, legacy free-text supplier
   values and every existing catalog/event-scoped row.

The source assignments are intentionally shared: Supplier ↔ Budget is marked
`50/52`, and supplier payment reminders `50/53`. Branch 50 owns only the
minimum Budget/expense/reminder workflow above. Broader catalog/private
operational polish remains Branch 52; Timeline and broader reminder automation
remain Branch 53. No unassigned feature is inferred.

## Read-only Production verification

A single read-only query against the active Supabase project
`vsguhivizuneylqhygfk` verified:

- suppliers: 326;
- saved suppliers: 0;
- budget items: 7; linked to saved suppliers: 0;
- expenses: 301; linked to saved suppliers: 0;
- payment reminders: 0;
- `budget_items.saved_supplier_id → saved_suppliers.id ON DELETE SET NULL`;
- `expenses.saved_supplier_id → saved_suppliers.id ON DELETE SET NULL`;
- `payment_reminders.expense_id → expenses.id ON DELETE CASCADE`;
- RLS is present on all four relevant event-private tables.

No row contents, identities or secrets were read. No statement modified
Production.

## Scope separation

### Explicit Branch 50

- Supplier ↔ Budget/expense link and unlink.
- Existing payment-reminder flow for a supplier-linked expense.
- Stable typed API contracts and current-event authorization for those actions.
- Budget/expense UI state, responsive 320–430 px behavior, accessibility and
  launch-locale message parity.
- Focused data-integrity and IDOR coverage for the vertical slice.

### Residuals from Branch 49

- None blocking. Branch 49 deliberately kept Budget, Timeline and payment
  coupling out of its scope.
- Its canonical supplier state and authorization helpers are foundations to
  reuse, not reimplement.
- Existing 18 ESLint warnings and optional CI-report issues are general
  non-blocking debt unless a touched file makes one actionable.

### Branches 51–53

- Branch 51: no explicit scope found in the current numbered integration matrix;
  it remains unstarted and must not be invented here.
- Branch 52: Supplier ↔ Location; broader global-catalog/private operational
  polish; remaining Supplier ↔ Budget integration beyond this minimum slice.
- Branch 53: Supplier ↔ Timeline and broader payment/reminder automation beyond
  expense-bound reminders.

### New event types, launch and outside scope

- Wedding remains the only READY event type; no activation is allowed.
- Custom domain and paid launch prerequisites remain deferred.
- No marketplace, monetization, subscription, AI or paid integration.
- No ownerless-event classification or cleanup.
- No general legacy hardcode/grant/server-route cleanup outside touched paths.
- No automatic quote-to-cost creation; ADR 004 explicitly forbids it.
- No replacement of `payment_reminders` and no notification delivery system.
- No Supplier ↔ Timeline or Supplier ↔ Location work.

## Audit matrix

| Requirement | Status | Source and evidence | Files/routes/API/DB | UI/UX, mobile, a11y, i18n | Security/data/tests |
|---|---|---|---|---|---|
| Canonical supplier relation | IMPLEMENTED | ADR 004 and Branch 49: `suppliers` global; `saved_suppliers` event-private; SELECTED state operational | `/fornitori`, `/api/my/suppliers`, `saved_suppliers` | Selection is accessible and responsive; commercial details are not surfaced | Reuse Branch 49 authorization/state helpers; preserve all 326 suppliers |
| Supplier ↔ Budget schema | PREPARED | Branch 48 matrix assigns 50/52; Production FK exists | `budget_items.saved_supplier_id` nullable FK | No visible supplier identity or link controls in Budget | Existing Branch 28 schema/RLS fixture only; missing API/UI link/unlink/IDOR tests |
| Supplier ↔ Expense schema | PREPARED | ADR 004 and Production FK exist | `expenses.saved_supplier_id` nullable FK | Expense form accepts only free-text supplier | Missing canonical supplier selection, reload and unlink UX |
| Budget API contract | TO MODIFY | Authenticated GET is current-event scoped; POST forces current event | `/api/budget-items` | No supplier DTO; no update/unlink endpoint; raw errors | POST spreads arbitrary client fields through service client; validate generated types and verify referenced supplier belongs to the same accessible event |
| Expense API contract | TO MODIFY | GET/POST use current event | `/api/my/expenses` | DTO omits `saved_supplier_id`; demo and real shapes differ | Service client, explicit `any`, raw errors; typed owner/partner/third-user and foreign-ID tests missing |
| Budget page integration | MISSING | Page loads budget items and expenses but ignores canonical supplier IDs | `/[locale]/budget`, `ExpenseForm` | No link/unlink, supplier label, status, empty/error feedback | Add focused component/API/E2E coverage; never delete or merge manual/Idea Budget rows |
| Payment reminder schema | PREPARED | Existing system is expense-bound; Production FK and RLS verified | `payment_reminders.expense_id` | No current app route/component found for reminders | Existing Branch 28 SQL proves the relational path only |
| Supplier payment reminder workflow | MISSING | Branch 48 assigns 50/53; ADR 004 requires reuse of existing system | New API/UI surface must be justified from current expense flow | Need due date, amount, status and recovery states; no notification delivery in Branch 50 | Stable validation, current-event authorization and expense/supplier ownership checks required |
| Same-event relational integrity | TO MODIFY | Current FKs reference only IDs, not `(id,event_id)` | `budget_items`, `expenses`, `saved_suppliers` | No visible symptom until a foreign UUID is supplied | RLS protects rows, but does not prove the referenced saved supplier belongs to the same event; enforce in API and determine whether an additive composite DB invariant is necessary |
| Supplier commercial amounts | PARTIAL | API accepts quote/agreed/deposit/balance fields; catalog UI only exposes selected/unselected | `/api/my/suppliers`, planning contracts | No edit/reconciliation UX | Branch 50 may read only what the Budget/reminder slice needs; broader contract workflow remains later |
| 320–430 px | TO MODIFY | Budget uses a `min-w-[980px]` table shell | Budget page and new controls | Horizontal table is not an adequate primary mobile interaction; provide a usable compact/card path and verify 320/390/430 | Playwright no-overflow, touch target and state tests required |
| Accessibility | PARTIAL | Shared controls and Branch 49 live summaries exist | Budget, expense form, new reminder UI | New link/unlink/reminder state needs labels, keyboard operation, focus return, live status and non-color meaning | Component assertions plus Playwright/axe/manual keyboard checklist |
| IT/EN/ES/FR/DE | PREPARED | Five bundles and integrity scanners exist; no Branch 50 vocabulary exists | Message bundles and scanners | Add identical supplier-budget/reminder keys/placeholders; no hardcoded user-facing errors | Missing/extra/empty/placeholder/Italian-residual and MISSING_MESSAGE gates |
| RLS/IDOR | PARTIAL | Relevant tables have RLS; server routes use service client | Four relevant tables and affected APIs | UI must never show another event’s supplier/reminder | Add owner A/B, active partner, revoked partner, third user, stale/foreign IDs and zero-mutation negatives |
| Migration | CONDITIONAL | Schema supports the feature; cross-event reference invariant is not encoded by current single-column FKs | Potential additive constraint only | No UX dependency | Default: no migration. If behavioral/DB tests prove API-only enforcement insufficient, propose an additive zero-DML composite invariant, rebuild and explicit review before any Production application |
| Data preservation | REQUIRED | Production currently has zero canonical links/reminders but 301 expenses and 7 budget items | All event-scoped tables | Legacy free-text supplier display remains readable | No backfill, inference, deletion or automatic link; pre/post count and checksum fixtures |
| External dependencies/cost | NOT REQUIRED | Existing Next.js, Supabase and Vercel stack suffices | None | None | Additional cost €0 |

## Principal risks

1. **Cross-event foreign reference:** a caller knowing another event’s saved
   supplier UUID could attempt to place it into its own Budget/expense row because
   current FKs do not include `event_id`.
2. **Service-client bypass:** affected routes use privileged access, so explicit
   authorization and same-event checks must occur before every read or mutation.
3. **Unintended financial creation:** selecting or quoting a supplier must never
   create Budget rows, expenses or reminders automatically.
4. **Legacy data loss:** free-text suppliers, manual Budget rows and
   `source=budget_idea` rows must remain independent and untouched.
5. **Ambiguous amount semantics:** quote, agreed, deposit, balance, committed,
   paid and reminder amounts cannot be silently mapped without an explicit
   contract.
6. **Duplicate reminders/races:** repeated requests need deterministic,
   idempotent behavior or a clearly tested conflict response.
7. **Mobile usability:** the existing wide Budget table can overflow at
   320–430 px.
8. **Shared roadmap boundary:** over-expanding this branch would consume Branch
   52/53 scope.

## Milestones

### M1 — Contracts, authorization and data-integrity tests

- Objective: define the minimum Supplier ↔ Budget/expense/reminder contract
  before UI work.
- Interventions: typed DTOs; owner/active-partner permission matrix; same-event
  supplier/expense validation; stable error codes; explicit idempotency rule.
- Tests: focused API/source/DB tests for owner A/B, partner, revoked partner,
  third user, foreign IDs, zero mutation and legacy row preservation.
- Gate: focused tests, then TypeScript and ESLint.
- Risks: privilege expansion and cross-event reference.
- Rollback: revert code/tests; no database rollback.
- Complete when all negative paths fail before privileged writes.

### M2 — Supplier ↔ Budget and expense link/unlink

- Objective: persist an optional canonical supplier reference without changing
  financial amounts or row origins.
- Interventions: minimal API read/write support; generated Supabase types;
  canonical supplier identity in Budget/expense responses.
- Tests: link, reload, unlink, repeated request, foreign supplier, manual row,
  Idea Budget row and current-event switch.
- Gate: focused tests → TypeScript/ESLint → relevant Jest.
- Risks: overwriting free text or Idea Budget provenance.
- Rollback: revert API/UI commit; nullable links remain harmless.
- Complete when link/unlink affects only the chosen row and preserves all amounts
  and origins.

### M3 — Existing payment-reminder vertical slice

- Objective: create/read/update/delete an expense-bound reminder for an expense
  linked to the current event’s saved supplier.
- Interventions: reuse `payment_reminders`; validate amount/date/status;
  accessible UI entry from the expense/Budget context.
- Tests: CRUD, duplicate/idempotency, invalid date/amount, foreign expense,
  unlinked expense policy, owner/partner/revoked/third-user and cascade fixture.
- Gate: focused tests → TypeScript/ESLint → relevant Jest.
- Risks: duplicate reminders, unclear partial-payment semantics and accidental
  notification promises.
- Rollback: revert API/UI; no alternative reminder table exists.
- Complete when reminder state round-trips safely with no notification delivery
  or Timeline coupling.

### M4 — Responsive UX, accessibility and five-locale parity

- Objective: make the new workflow usable and understandable at 320–430 px and
  by keyboard/screen reader.
- Interventions: compact mobile representation; explicit loading/empty/error/
  linked/unlinked/due/paid states; focus and live-region behavior; IT/EN/ES/FR/DE
  keys.
- Tests: component accessibility, keyboard, no-overflow at 320/390/430, locale
  parity and MISSING_MESSAGE.
- Gate: focused tests → TypeScript/ESLint → Jest → build/i18n.
- Risks: wide-table regression and color-only status.
- Rollback: revert presentation layer; API remains compatible.
- Complete when every state is operable without pointer or color dependence.

### M5 — Integration matrix and release candidate

- Objective: verify Branch 50 without crossing into Branch 51–53.
- Required gates, in order:
  1. focused API/component/state/DB tests;
  2. TypeScript and ESLint;
  3. full Jest;
  4. production build and IT/EN/ES/FR/DE integrity;
  5. Database Rebuild only if a justified additive migration exists;
  6. Playwright owner/partner/A-B event plus 320/390/430 matrix;
  7. Preview on one exact HEAD;
  8. final scope/security/data audit and zero fixture residue;
  9. Mark Ready only after explicit authorization;
  10. merge and Production smoke only after separate explicit authorization.
- Risks: stale event state, fixture residue and accidental Branch 52/53 scope.
- Rollback: each milestone remains independently revertible; any later merge
  would use a standard revert, never destructive data repair.
- Complete when all gates pass on one exact release-candidate SHA.

## Closure criteria and invariants

- Preserve every event, membership, ownerless legacy event, supplier, catalog
  row, Budget/Idea Budget row, expense and other event-scoped record.
- No automatic inference or backfill from supplier free text.
- No automatic Budget/expense/reminder creation from supplier selection.
- No new event type.
- No custom-domain or paid-infrastructure work.
- No Production mutation during audit or implementation without a later,
  explicit migration/merge command.
- Additional cost remains €0.

## Stop condition

This commit records scope and implementation planning only. Stop after the Draft
PR. Do not implement, apply a migration, execute DML, modify main or Production,
activate event types, or start Branch 51.
