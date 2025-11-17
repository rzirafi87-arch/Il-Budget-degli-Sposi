# Event Implementation Checklist

Use this checklist when adding a new event experience to the platform. Each section lists the required steps before opening a pull request.

## 1. Configuration
- [ ] Create `src/features/events/<slug>/config.ts` exporting `<SLUG>_META` with sections, categories, and timeline data.
- [ ] Ensure `defaultCurrency` is set and uses the `Currency` union from `@/lib/types`.

## 2. Routing & UI
- [ ] Add `app/[locale]/(routes)/<slug>/page.tsx` rendering `<EventBudgetLayout meta={...} />`.
- [ ] Verify the event appears in the event selector and main navigation when enabled.

## 3. API
- [ ] Implement `/api/events/<slug>/get` to fetch the user budget with Supabase Admin client.
- [ ] Implement `/api/events/<slug>/init` to create the initial budget payload.

## 4. Internationalization
- [ ] Add labels to `src/messages/<locale>.json` under `events.<slug>` (Italian and English required).
- [ ] Update onboarding translations in `src/messages/onboarding.<locale>.json` for the new event.

## 5. Registry & Flags
- [ ] Append the slug to `EventKey` and `eventsRegistry` in `src/config/events.registry.ts`.
- [ ] Add a `flags.enable_<slug>` entry in `src/config/flags.ts` and keep it `false` until the event is complete.

## 6. Seeding & Data
- [ ] Register the event within the seeding workflow (e.g. `scripts/seed_more_events.ts` or dedicated SQL seed).
- [ ] Run `npm run seed:events` locally (or the appropriate seed command) and confirm success.

## 7. Testing
- [ ] Add or update unit tests validating the event config shape.
- [ ] Add an E2E smoke test that covers navigation: Home → Event → Budget → Save.

## 8. Documentation & Release
- [ ] Update changelog or release notes with the new event highlights.
- [ ] Complete this checklist and include it in the PR description before requesting review.
