# Branch 47 initial architecture audit

Base: `2b4f1c24f52bcdecd5d8954984e247ba1575b42c`

Status: audit-first checkpoint. This document records the code and migration evidence that must govern Branch 47 implementation. Production verification remains required before any migration is finalized.

## Core identity and event access

- `profiles` has `id`, `full_name`, `created_at`; later migrations add locale/country preferences. `full_name` is the appropriate existing display-name field, so a duplicate nickname column is not initially justified.
- `/api/my/profile` is owner-only at account level and reads/writes `full_name`. `UserMenu` already prefers it, but falls back to the email as the primary header label. Branch 47 must replace that visible fallback with localized profile copy while keeping email inside the account panel.
- `events` retains `owner_id`, `bride_email`, `groom_email`, `event_date`, `event_location`, `total_budget`, language/country and wedding metadata.
- Registration currently accepts an optional partner email, invites that address immediately through Supabase Auth, stores it in `groom_email`, and creates `total_budget = 0`. This conflicts with the new optional post-signup collaboration flow and the blank-unsaved numeric rule.
- `currentEvent.ts` resolves access with a service-role query: owner first plus normalized authenticated email matching `bride_email`/`groom_email`. The resolver has correct cookie, single-event and multiple-event states, but is legacy-email-first rather than membership-first.
- Branch 38 introduced `can_access_event(uuid)` and made the principal wedding/event-scoped RLS policies couple-aware through owner ID or JWT email. Event deletion and insertion remain owner-only.

## Existing membership/share prototype

- `supabase-core-events-schema.sql` contains an old, non-authoritative `event_members` prototype with `owner/editor/viewer` and `added_at`, plus public share tokens. It is not part of the ordered Production migration chain and its shape does not satisfy Branch 47 (`owner/partner`, status, accepted timestamp).
- Two legacy API routes reference that prototype. They must not be treated as proof that the Production table exists.
- No authoritative `event_invitations` migration or secure one-time hashed partner invitation flow exists.
- Conclusion: introduce one additive canonical membership/invitation migration only after remote schema confirmation; do not duplicate a real Production object if one exists outside the repository snapshot.

## RLS and event-scoped modules

- Branch 38 converted the major shared wedding tables to `can_access_event`: events update/select, categories/subcategories, expenses, incomes, budget ideas/items, guests, families, non-invited recipients, tables/assignments, timeline, appointments, wedding cards, saved churches/locations/suppliers and payment reminders.
- API routes broadly use `requireCurrentEvent`/`requireServerCurrentEvent`, but several legacy event-type routes still query `owner_id` directly. Branch 47 must modify only Matrimonio/shared routes needed by scope and must not activate other event types.
- Service-role APIs remain an IDOR risk unless every mutation binds the requested row to the resolved current event. A route-by-route matrix and SQL RLS tests are required before implementation can be called complete.

## Setup and first-user experience

- `/setup` currently persists language, country and event type only in cookies/local storage; it does not derive completion from persisted event data.
- `/onboarding` is a thin link to a wizard. Existing flows are fragmented and do not provide a single persisted-data setup resolver.
- Registration creates an event immediately and may save date/partner email, so subsequent setup must inspect `events`, wedding-card ceremony data, guests and budget rather than use new duplicate booleans.
- The minimum persisted model to derive is: date or explicit undecided state, location/area, indicative guest count, initial total budget, and ceremony type. Unknown values must remain nullable where schema semantics permit.

## Budget and numeric UX

- `events.total_budget`, spouse initial budgets and many financial columns historically default to zero. Runtime code frequently normalizes missing values with `|| 0` or `?? 0`.
- Computed summaries may legitimately render zero, but editable inputs need string/null draft state so an untouched value is blank and `""` is not persisted as zero.
- Existing Idea Budget snapshot/apply and Branch 41/43/45 tests protect enabled flags, contingency, custom/manual rows, idempotency, Wedding Bag and canonical taxonomy keys. Branch 47 must extend these paths rather than create a second taxonomy or regeneration path.
- The current Budget Advisor needs bidirectional percentage/euro editing against the event total, explicit totals/residual/overrun, and opt-in rebalancing. No hidden redistribution is allowed.

## Dashboard, navigation, responsive UI and Honeymoon

- Dashboard aggregates current-event data but currently coerces the event budget to zero. Its initial cards need persisted-data-aware explanations and CTAs instead of unexplained empty values.
- `lucide-react` is already installed and used in account/navigation UI; it is the canonical icon library for Branch 47. Native emoji remain limited to non-structural microcopy.
- The Honeymoon route is currently static advice. It has no curated destination model, source metadata, period/budget/style matching or consent-aware outbound analytics.
- Existing Playwright configuration supplies the required 5-locale by 6-mobile-width matrix, but it currently exercises a responsive showcase rather than the authenticated Matrimonio journeys. Branch 47 must extend it with authenticated fixtures and exact cleanup tracking.

## Implementation constraints derived from audit

1. Verify live Production tables, columns, functions and policies before writing the canonical migration.
2. Add canonical membership/invitations and backfill owners; preserve legacy email columns and transition `can_access_event`/CurrentEvent to membership-first with a safe email fallback.
3. Keep destructive membership/event actions owner-only and prove replay, wrong-email, expiry, revocation, escalation and cross-event denial in SQL/API tests.
4. Reuse `profiles.full_name`, current mailer/site URL helpers, `WEDDING_BUDGET_TAXONOMY`, Lucide and the existing consent mechanism.
5. Build progressive setup from persisted records and nullable semantics; do not introduce redundant completion flags.
6. Do not touch supplier commercial ranking, pricing, new event types, Branch 48 or later work.

