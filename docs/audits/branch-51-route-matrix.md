# Branch 51 — route and server-action inventory

## Milestone 4 ACL/RLS annotation

Every route below was rechecked against the Data API ACL/RLS inventory. Browser
writes are limited to owner-only profile fields; private, administrative,
lifecycle, cron and catalog-ingestion operations retain the reviewed
server/service-role boundary. See `branch-51-milestone-4.md`.

## Milestone 3 consolidation annotation

The authoritative Milestone 3 classification, caller audit, parity contracts and deferred items are documented in [`branch-51-milestone-3.md`](./branch-51-milestone-3.md). The six `/api/events/{baby-shower,birthday,engagement-party}/{get,init}` routes now share `src/lib/legacyEventBudget.ts`; the event-creation family keeps `/api/event/ensure-default` as canonical with three thin compatibility aliases. No endpoint was removed because event-create aliases still have active/published callers and the unused budget endpoints remain published compatibility contracts. Event-specific seed routes were not mislabeled as duplicates where their templates or response contracts differ.

Generated from source at 2026-09-16T15:37:56.064Z. This inventory covers **140 API route files**. No files containing a top-level `"use server"` directive were present at audit time. Classifications marked `route-specific` or `review` require manual contract validation in Milestones 2–3; they are not assertions of safety.

| Route | Methods | Auth | Ownership | Event source | Role | Mode | Service role | RLS boundary | IDOR | Canonical status | GET mutation signal |
|---|---|---|---|---|---|---|---|---|---|---|---|
| /api/admin/catalog-moderation | GET, PATCH | admin | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/analytics/track | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/anniversary/seed/[eventId] | POST | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/atelier | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/auth/recovery | POST | auth-flow | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/auth/register | POST | auth-flow | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/auth/resend | POST | auth-flow | n/a | none | route-specific/n/a | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/babyshower/seed/[eventId] | POST | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/baptism/seed/[eventId] | POST, GET | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/baptism/seed | POST, GET | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/bar-mitzvah/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/birthday/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/budget-ideas | GET, POST | public/route-specific | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/budget-items | GET, POST, PATCH | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/catalog/contributions | GET, POST, PATCH | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/catalog/search | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/categories | GET | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/ceremony | GET, PUT | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/charity-gala/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/chat | GET, POST | user | n/a | none | route-specific/n/a | read/write | no | user JWT | guarded/n/a | canonical or standalone | no evidence |
| /api/checklist-modules | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/churches | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/communion/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/confirmation/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/contact | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/corporate/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/countries | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/cron/check-appointments | GET | cron | route-specific | path/query/body or derived | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/cron/check-subscriptions | GET | cron | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/eighteenth/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/engagement/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/event-core/new | dynamic/none | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/event/create | dynamic/none | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/event/delete | DELETE | user | route-specific | path/query/body or derived | route-specific/n/a | read/write | no | user JWT | review | canonical or standalone | no evidence |
| /api/event/ensure-default | POST | public/route-specific | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/event/new | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/event/resolve | GET | public/route-specific | owner+partner | server current-event | owner/partner | read | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/event/update-budget | POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/event/update | PATCH | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/baby-shower/get | GET | user | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/baby-shower/init | POST | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/birthday/get | GET | user | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/birthday/init | POST | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/engagement-party/get | GET | user | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events/engagement-party/init | POST | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | legacy/overlap candidate | no evidence |
| /api/events | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/fifty/seed/[eventId] | POST | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/gender-reveal/seed/[eventId] | POST | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/generate-wedding-pdf | POST | user | owner+partner | server current-event | owner/partner | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/graduation/seed/[eventId] | POST | user | owner | path/query/body or derived | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/health/latest | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/health/refresh | POST | admin | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/health | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/i18n/categories | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/i18n/subcategories | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/i18n/timeline | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/idea-di-budget/apply | POST | public/route-specific | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/idea-di-budget | GET, POST | public/route-specific | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/invitations/accept | POST | user | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/invitations/inspect | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/invitations/reject | POST | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/invitations/resume | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/invitations/return | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/locales | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/locations | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/musica-cerimonia | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/musica-ricevimento | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/account-deletion | GET, POST, DELETE | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/anniversary-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/appointments/[id] | DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/appointments | GET, POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/babyshower-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/my/baptism-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/bar-mitzvah-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/birthday-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/budget-table | GET | user | owner+partner | server current-event | owner/partner | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/categories | GET | user | owner+partner | server current-event | owner/partner | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/charity-gala-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/churches | GET, POST, PATCH, DELETE | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/communion-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/confirmation-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/core-categories | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/my/corporate-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/current-event | GET, POST, DELETE | user | owner+partner | server current-event | owner/partner | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/dashboard | GET, POST | public/route-specific | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/eighteenth-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/engagement-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/event-invitations/[id] | DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/event-invitations | GET, POST, PATCH | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/event-members/[id] | DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/event-members/leave | POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/event-members | GET | user | owner+partner | server current-event | owner/partner | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/expenses/[id] | PATCH | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/expenses | GET, POST, PATCH | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/favorites | GET, POST, DELETE | user | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/fifty-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/gender-reveal-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/gift-list | GET, POST, PUT, DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/graduation-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/guests | GET, POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/incomes/[id] | DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/incomes | GET, POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/locations | GET, POST, PATCH, DELETE | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/planning-selections | GET | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/my/profile | GET, PATCH | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/proposal-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/quinceanera-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/retirement-dashboard | GET, POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/subscription-transactions | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/supplier-profile | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/suppliers | GET, POST, PATCH, DELETE | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/my/tables | GET, POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/timeline | GET, POST, PUT, DELETE | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/my/wedding/budget-focus | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/my/wedding/localized | GET | user | n/a | none | route-specific/n/a | read | no | user JWT | guarded/n/a | canonical or standalone | no evidence |
| /api/my/wedding/presets | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/payment-reminders | GET, POST, PATCH, DELETE | public/route-specific | owner+partner | path/query/body or derived | owner/partner | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/proposal/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/public/[publicId] | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/quinceanera/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/retirement | GET, POST, PUT, DELETE | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | review: file contains GET + mutation |
| /api/retirement/seed/[eventId] | POST | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read/write | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/seed/[eventId] | POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/share/[token] | GET | public/route-specific | route-specific | path/query/body or derived | route-specific/n/a | read | yes | bypassed; API guard required | review | canonical or standalone | no evidence |
| /api/share/new | POST | user | owner | server current-event | owner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/stripe/checkout | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/stripe/webhook | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/subscription-featured | PUT | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/subscription-packages | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/subscription-transactions | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/suppliers/[id] | GET, PUT | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/suppliers | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |
| /api/sync/osm | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/sync/places | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/sync/wikidata | POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/traditions | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/vendors | GET | public/route-specific | n/a | none | route-specific/n/a | read | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | no evidence |
| /api/wedding-card | GET, POST | user | owner+partner | server current-event | owner/partner | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /api/wedding-planner | GET, POST | public/route-specific | n/a | none | route-specific/n/a | read/write | yes | bypassed; API guard required | guarded/n/a | canonical or standalone | review: file contains GET + mutation |
| /auth/callback | GET | public/route-specific | n/a | none | route-specific/n/a | read | no | route-specific/n/a | guarded/n/a | canonical or standalone | no evidence |

## Canonical HTTP contract

- `401`: missing or invalid session/token.
- `403`: authenticated principal lacks the required role.
- `404`: resource does not exist or is outside the caller's accessible event.
- `400`: malformed JSON or structurally invalid request.
- `422`: syntactically valid payload that violates field/domain validation.
- `409`: state conflict, duplicate, or replay.
- `500`: sanitized stable error code only; internal database/schema details stay server-side.

## Required principals and tampering cases

Every event-scoped contract must cover owner, active partner, unrelated authenticated user, anonymous caller, different event, missing resource, manipulated current-event cookie, altered cookie, and altered path/query/body `event_id`. Data API coverage must prove RLS independently of service-role API guards.
