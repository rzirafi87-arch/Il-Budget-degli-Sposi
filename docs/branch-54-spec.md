# Branch 54 — Onboarding, Activation, UX & Mobile

Base: main `5fd13a62fd47d13af5187032b9cab15dbb236284`. Branch: `branch-54-onboarding-activation-ux-mobile`. Branch 53 closeout is recorded locally in `_LOCAL/branch53-final-closeout-20261017.md` (excluded from commits). No merge or Production writes are authorized by this branch.

**Production prerequisite reconciliation:** the later `_LOCAL/branch53-final-production-closeout-20261017.md` supersedes the initial read-only PASS with STOP: real Production `POST /api/budget-items` failed when optional `source` was omitted (NOT NULL violation). This was discovered in a concurrently running certification chat and reconciled here after the user supplied its screenshot. The user authorized continuing development; this branch fixes the same first-value blocker and tests it only in isolation. Production remains unchanged and its certification is still STOP. Preserve the Branch 57 review backlog for `private.subcategory_identity_reservations` RLS; no change here.

## Scope and acceptance contract

1. First value: signup → event creation → resumable onboarding → budget → first persisted budget item/expense OR first saved supplier. Completion must come from server data, never clicks, local storage, demo rows or a generated event name. Activation is counted once per event, survives logout/login, repeated actions and deletion of the originating item. Concurrent first actions must not double count. Checklist completion reflects current persisted data; historical activation is a separate metric.
2. Mobile: signup, onboarding, dashboard, budget, guests and documents at 360, 375, 390, 412 and 430 CSS px. No horizontal document overflow; controls usable by touch; forms and dialogs remain reachable with keyboard/short viewport; sticky/fixed navigation must not cover actions.
3. Accessibility: programmatic labels, focus visibility, keyboard form submission, password toggle semantics, error announcements, validation and progress semantics. Check contrast against existing design tokens; do not redesign the product.
4. Recovery: distinguish empty/loading/error. Read failures offer retry without discarding user input or implying an empty account. Partner invitation failures must remain recoverable. Error references are opaque IDs, never raw backend messages, email addresses, JWTs or request bodies.
5. All new user-facing strings in IT, EN, ES, FR and DE, using the current message loader. No inline user-facing copy.
6. UX: one clear next action; remove misleading/self-referential steps and fake progress, preserve useful existing screens. No total redesign.

Non-scope: payments, subscriptions, B2B, commercial launch, complex gamification, chatbot, new event types, major design-system rewrite.

## Precheck inventory (before code changes)

| Area | Existing implementation | Finding / evidence | Required change |
| --- | --- | --- | --- |
| Signup/auth | `auth/page.tsx`, register/resend/recovery APIs; labeled password toggle | Controls are outside a form; required/email/minLength do not gate button clicks; Enter does not submit. signIn lacks catch/finally so transient rejection leaves loading stuck. Email label hardcoded. | Native form validation and submission; catch/finally; translated email and confirmation feedback. |
| Event creation | `select-event-type`, event ensure/create APIs, capability gates | Existing guarded creation and explicit new-event path. Resume uses server status but selection failures redirect to auth, misclassifying network errors. Local country/language remain client draft before event creation. | Keep capability boundaries; audit failure recovery, no new event types. |
| Onboarding | `WizardEntryGate`, `onboardingClient`, `onboardingRouting` | Server-derived language/country/type resume exists; entry has retry. `/onboarding` adds a redundant welcome step. | Preserve persisted resume; direct next action to wizard. |
| Dashboard | `ProgressiveSetup`, event resolve API | API DOES expose has_guests/has_suppliers (initial suspicion disproved). Checklist date links back to dashboard; generated event name counts as details. Fetch rejection unhandled; no loading/retry; progress has no progressbar role; no first-budget-item step. | Actionable first-value checklist; honest current state; recovery; progress semantics. Preserve selected-supplier semantics from Branch 49. |
| Budget | `budget/page.tsx`, ExpenseForm, budget/expenses APIs | GET failures ignored or parsed as empty; catch swallows failure; no retry. Existing responsive table/cards and expense entry. | Explicit load error and retry; never show empty state after failed read. |
| Guests | `invitati/page.tsx`, GuestMobileCard | Existing loadError/retry, mobile cards and previous 320–430 QA. | Include current branch matrix and form/dialog audit. |
| Documents | `documenti/page.tsx`, server-authorized document APIs | Persistent upload/download/delete, loading, error, pending deletion and retry exist. | Preserve Branch 53 security; include matrix and empty/error tests. |
| Supplier save | `fornitori/page.tsx`, saved supplier/planning APIs | SAVED and SELECTED are distinct. Setup requires SELECTED; first value should accept SAVED too. | Separate first-value signal from supplier selection; never infer selection from free-text expenses. |
| Partner invite | `PartnerLifecycleSection`, invitation/member APIs | Retry missing on initial read; raw error code rendered; leave redirect executes even if request fails. | Safe error reference, retry, no navigation after failed leave. |
| Activation | Existing analytics endpoint tracks catalog contact/view events only | No durable once-per-event activation contract. | Add minimal private ledger with transactional insert triggers, unique event identity, no public RPC or browser writes. No Production migration in this task. |
| First budget item | Optional source/spend_type parsed as undefined in bulk insert | Later Production report and isolated B54 journey reproduce HTTP 500 / SQLSTATE 23502. | Materialize existing database defaults manual/common in the allowlisted parser; no schema change. |
| Mobile settings | Floating trigger plus settings trigger in app header; modal without keyboard focus handling | 360px signup screenshot shows trigger overlapping register CTA. RED keyboard test confirms missing focus transfer. | Single trigger in normal flow on auth/onboarding, reuse app header elsewhere; trap focus, Escape/restore; dynamic viewport height. |

## RED → GREEN and verification plan

Behavioral component tests must first reproduce invalid signup submission, network rejection recovery, checklist read failure/retry, truthful first-value progress, partner failed-leave navigation, and budget failed-read/empty distinction. Unit tests cover first-value derivation, i18n key parity and opaque error IDs. Isolated database tests cover activation repeat/concurrency safety, rollback, cross-event isolation, browser denial and deletion lifecycle. Preserve baseline tests.

Run unit/integration suites, typecheck, lint, validate, build, Playwright required width/locale matrix and available accessibility tooling. Browser interception tests are UI evidence only; they do not substitute for real persistence/API QA. Real signup/event/budget/guests/documents/supplier/invite smoke requires a disposable non-Production backend. If Preview points at Production, do not create QA fixtures there; report that gate STOP until an isolated target is available.

Preview must be READY for exact PR SHA; CI green, automatic review P0/P1/P2 in scope resolved, PR mergeable. Final PASS only with evidence for every gate. Do not merge. Ready branch proceeds to a separate Production gate.

## Execution evidence

Local evidence (2026-10-17): 122 Jest suites / 812 tests PASS after the budget default and modal focus fixes; typecheck PASS; lint 0 errors (15 existing warnings); validate and production build PASS. Signup Playwright matrix before the settings placement fix: 30/30 (IT/EN/ES/FR/DE × 320/360/375/390/412/430), including 44px touch targets, native email/password validation, keyboard submit, password toggle, short viewport and axe serious/critical checks. The final matrix also checks settings focus/Escape and captures screenshots. Browser mutations are intercepted; this is UI evidence, not a real signup persistence claim.

New activation tests run RED before migration, then GREEN after applying it twice in disposable CI: source-specific counting, retention, rollback, access denial and event cleanup; concurrent first actions are tested independently. Local Docker did not become available, so database and real lifecycle evidence comes from ephemeral GitHub CI. The first database run exposed a malformed supplier fixture (missing required location columns); corrected. The first collection gate exposed the strict historical test allowlist; fixed with a separate Branch 54 public test config, preserving the certified Production harness.

PR: https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/pull/72. Full database/real lifecycle, exact-HEAD Preview and automatic review results are recorded in the PR checks and final PR description. No pending or skipped gate is considered PASS. No Production migration or data write; no merge. The actual signup and write journeys run only on loopback disposable Supabase. Preview signup proof is intentionally limited to safe intercepted UI behavior when its backend is Production.
