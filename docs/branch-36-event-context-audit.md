# Branch 36 — authoritative event-context audit

## Decision

`app-current-event` is the single browser persistence hint. It contains only an event UUID, is HTTP-only, SameSite=Lax, Secure in production and is never trusted for authorization. `resolveCurrentEvent` loads the authenticated owner's events and accepts the hint only when the selected row belongs to that owner. RLS remains the authorization boundary.

No profile column or database migration is required. This avoids duplicate preference state. Multi-tab changes are signalled through a timestamp in localStorage; the authoritative value remains the validated cookie.

Fallbacks:

- zero events → `NO_EVENT`;
- exactly one event → deterministic automatic selection and cookie persistence;
- two or more events without a valid hint → `SELECTION_REQUIRED`;
- invalid, deleted or foreign hint → discard it; auto-resolve only if exactly one owned event remains.

## Resolution audit

| Area | Before | Classification | After |
|---|---|---|---|
| `/api/event/resolve` | oldest owner event | UNSAFE MULTI-EVENT | central resolver |
| Dashboard | oldest owner event | DUPLICATED / UNSAFE | current event |
| Budget and categories | oldest owner event | DUPLICATED / UNSAFE | current event |
| Idea Budget | oldest owner event | DUPLICATED / UNSAFE | current event |
| Guests and tables | first owner/partner event; POST could create implicitly | UNSAFE MULTI-EVENT | current event; no implicit creation |
| Expenses and incomes | oldest owner event | DUPLICATED / UNSAFE | current event |
| Churches, locations, suppliers | local first-event helpers | DUPLICATED / UNSAFE | current event |
| Timeline and appointments | oldest owner event | DUPLICATED / UNSAFE | current event |
| Wedding card / PDF | first owner event | DUPLICATED / UNSAFE | current event |
| Event create / ensure-default | returned first existing event | AMBIGUOUS / UNSAFE | current event or selection-required; new event becomes current |
| Coming-Soon legacy dashboards | independent legacy schemas (`user_id`, `owner`) | LEGACY | route gating preserved; wedding-module access remains blocked |
| Favorites | keyed by authenticated `user_id` | USER-SCOPED INTENTIONAL | unchanged |
| Global catalogs | global data plus event-scoped saved relations | AUTHORITATIVE | catalog global; saved relations current-event scoped |
| `/api/my/wedding/localized` | public country/event preset lookup | LEGACY NAME, not first-event root cause | public compatibility retained; authenticated requests derive current event and capability |

## Private data model audit

| Classification | Tables / relations |
|---|---|
| EVENT-SCOPED CORRECT | events, categories, budget_items, budget_ideas, expenses, incomes, guests, family_groups, non_invited_recipients, tables, timeline_items, appointments, wedding_cards, saved_churches, saved_locations, saved_suppliers |
| USER-SCOPED INTENTIONAL | profiles, favorites, subscription transactions |
| GLOBAL INTENTIONAL | churches, locations, suppliers, event_types and localized preset/catalog views |
| LEGACY AMBIGUOUS | standalone Coming-Soon dashboard schemas using historical `user_id`/`owner`; inaccessible as READY modules and preserved without destructive conversion |

Existing event-scoped tables already have usable `event_id` relationships and owner-through-event RLS from Branches 25–33. No additive schema change is necessary for authoritative selection, so there is no backfill, no arbitrary assignment and no production data mutation.

## Runtime behaviour

- The selector is authenticated-only, keyboard-native and compact at mobile and desktop widths.
- Switching writes the validated cookie, updates presentational event type state and performs a full refresh so private caches and module data cannot survive from event A into event B.
- Other tabs reload after the storage signal and resolve the same cookie.
- Logout clears the event cookie and presentational local state before signing out.
- Coming-Soon capability is derived from the Branch 29 matrix returned by the resolver, never from the cookie or localStorage.
