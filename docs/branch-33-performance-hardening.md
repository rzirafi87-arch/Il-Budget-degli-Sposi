# Branch 33 — Performance, scalability and application hardening

## Scope and measured baseline

Baseline commit: `e6638e17fece7792657452e83ff76110ca615f53`.

Production counts before changes: events 11, churches 2, locations 128,
suppliers 326, vendors 431, vendor_places 431; saved catalog relations,
provenance and review queue are all 0. Counts must remain unchanged.

The audit covered catalog/search APIs, private saved APIs, dashboard, budget,
timeline, guests, documents, Supabase client creation, RLS, migrations, client
effects, maps, images, fonts, rendering directives and ingestion scripts.

## Findings

| Severity | Finding | Decision |
| --- | --- | --- |
| HIGH | Public catalog/search endpoints have bounded inputs but no abuse throttle | Add a conservative per-instance 60 request/minute guard and 429 contract |
| MEDIUM | Public search response is marked private despite containing only public catalog projection | Use short CDN cache with explicit stale window; private APIs remain no-store/default dynamic |
| MEDIUM | `suppliers` evaluates two unconditional permissive SELECT policies | Drop only the legacy duplicate; access remains identical |
| MEDIUM | `timeline_items` has two byte-equivalent event indexes | Keep canonical index and drop the duplicate |
| MEDIUM | Owner event resolution orders by `inserted_at` across many private APIs | Add `(owner_id, inserted_at, id)` index; multi-event selection semantics stay unchanged |
| MEDIUM | Upcoming timeline reads filter by event and due date but only separate indexes exist | Add `(event_id, due_date)` index |
| LOW | Out-of-range catalog pages issue a second count RPC | Retained: it occurs only for empty pages and preserves exact pagination contract |
| LOW | Search uses substring matching over small catalogs | No text index: current table sizes and semantics do not justify pg_trgm/PostGIS |
| LOW | Dashboard contains legacy multi-step writes | Documented; not refactored into an opaque mega-RPC in this branch |
| NON ACTIONABLE NOW | In-memory rate limit is instance-local | Documented limitation; distributed storage is outside current infrastructure |

## Preserved boundaries

- Catalog map was already dynamically imported with `ssr: false`; no change.
- Public list payloads were already projected and capped at 24 rows.
- Catalog reliability, provenance, review queue and ingestion matching are unchanged.
- No private/user/event response is placed in shared cache.
- No service-role credential is exposed to client code.
- Matrimonio remains READY; the other 17 event types remain COMING_SOON.
- The first-event assumption remains documented and unchanged.

## Performance budget

- No unbounded catalog response; maximum page size 24 and radius 300 km.
- No additional query per catalog result.
- Public catalog reads may use a 30-second CDN response with 120-second
  stale-while-revalidate; private reads are never shared.
- Heavy maps remain outside first-paint JavaScript until results contain coordinates.
- API validation errors are 400, throttling is 429, unexpected failures are 500.

