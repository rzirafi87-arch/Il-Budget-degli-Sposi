# Branch 54 — Onboarding, Activation, UX & Mobile

Base: main `5fd13a62fd47d13af5187032b9cab15dbb236284`. Branch: `branch-54-onboarding-activation-ux-mobile`. Branch 53 closeout is recorded locally in `_LOCAL/branch53-final-closeout-20261017.md` (excluded from commits). No merge or Production writes are authorized by this branch.

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

## RED → GREEN and verification plan

Behavioral component tests must first reproduce invalid signup submission, network rejection recovery, checklist read failure/retry, truthful first-value progress, partner failed-leave navigation, and budget failed-read/empty distinction. Unit tests cover first-value derivation, i18n key parity and opaque error IDs. Isolated database tests cover activation repeat/concurrency safety, rollback, cross-event isolation, browser denial and deletion lifecycle. Preserve baseline tests.

Run unit/integration suites, typecheck, lint, validate, build, Playwright required width/locale matrix and available accessibility tooling. Browser interception tests are UI evidence only; they do not substitute for real persistence/API QA. Real signup/event/budget/guests/documents/supplier/invite smoke requires a disposable non-Production backend. If Preview points at Production, do not create QA fixtures there; report that gate STOP until an isolated target is available.

Preview must be READY for exact PR SHA; CI green, automatic review P0/P1/P2 in scope resolved, PR mergeable. Final PASS only with evidence for every gate. Do not merge. Ready branch proceeds to a separate Production gate.

## Execution evidence

Pending: implementation and final verification results will be added here with actual outcomes; no planned check is considered PASS.
