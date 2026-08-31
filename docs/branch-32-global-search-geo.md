# Branch 32 — Global search, geolocation and maps

## Initial audit and decisions

| Area | Classification | Decision |
|---|---|---|
| `/api/churches`, `/api/locations`, `/api/suppliers` | REUSABLE / TO EXTEND | Preserve paths and response compatibility; route through the common search service. |
| Existing server pagination (12, max 24) | REUSABLE | Retained for all searches. |
| `normalized_name`, city, province, region, country code | REUSABLE | Used by the shared SQL search document and exact filters. |
| Supplier category/subcategory, location venue type, church place type | REUSABLE | No new taxonomy. |
| Verification status and confidence | REUSABLE | Verified-first is a tie breaker; explicit filter remains available. |
| Latitude/longitude constraints | REUSABLE | Retained as canonical coordinate storage. No coordinates are invented. |
| PostGIS, `pg_trgm`, `unaccent`, FTS | DEFERRED | None is installed; with 456 catalog rows and zero coordinate coverage, extensions/indexes have no measurable current benefit. |
| Branch 31 match/dedupe engine | DO NOT TOUCH | Search relevance never writes canonical records and is not an identity score. |
| Leaflet + React Leaflet | REUSABLE | Dependencies already existed; the obsolete stub is not used by the new map. |
| `catalog_provenance`, `catalog_review_queue` | DO NOT TOUCH | Server-only and excluded from search. |
| Map bounds search and clustering | DEFERRED | Page size is capped at 24, so clustering/bounds queries are unnecessary now. |

Production coordinate coverage measured before implementation: churches 0/2, locations 0/128, suppliers 0/326. The search handles future reliable coordinates, while records without coordinates continue to appear in non-radius lists and never break map rendering.

## Architecture

`CatalogSearchRequest` validates entity, text/admin filters, verification, coordinates, radius (maximum 300 km), sort and pagination. `/api/catalog/search` returns the common public projection. The three historical endpoints are adapters over the same service and preserve their legacy names and detailed allowlisted fields.

The database function is `SECURITY INVOKER`, executable only by `service_role`. The public application endpoint validates every parameter. It reads only the three global catalogs, never saved/private relations, provenance or review data. The function has no write statements.

Text ranking is transparent: exact normalized name 100, prefix 80, contained name 60, other catalog text 40; verification and confidence break ties. Haversine distance is calculated only when both record and request coordinates exist. Radius searches exclude unlocatable records because their distance cannot be established; ordinary searches retain them.

## Privacy and map operations

Browser geolocation runs only after the user selects “Near me”. The application does not persist the position, does not include precise coordinates in shareable URL state and does not log them. Refusal falls back to city/province/region filters.

Leaflet uses OpenStreetMap tiles for the current low-volume interface, with attribution. Before meaningful production map traffic, configure a commercial/self-hosted OSM-compatible tile provider and its rate/cache policy; the public standard tile service is not a scaling strategy.

## Deferred work

Geocoding, coordinate enrichment, PostGIS/GiST, marker clustering, map-bounds search and analytics are explicitly outside Branch 32. Re-evaluate PostGIS only after reliable coordinate coverage and actual query volume justify it.
