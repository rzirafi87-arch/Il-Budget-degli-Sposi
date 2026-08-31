# Branch 30 — Common catalog data pipeline

## Scope and flow

`SOURCE → INGESTION → NORMALIZATION → VALIDATION → DEDUPLICATION → VERIFICATION → CANONICAL CATALOG → USER SAVED ENTITY`

`scripts/import-catalog.mjs` is the single typed entry point for `church`, `location` and `supplier`. The shared orchestrator is `scripts/lib/common-catalog-pipeline.mjs`; the three small adapters retain only entity-specific fields and rules. Dry-run is the default and never opens a database connection. `--database-preview` may compare read-only against a target database while preserving zero writes. `--apply` requires `DATABASE_URL` and a server/admin role and wraps the complete import in one transaction.

Example:

```sh
npm run catalog:import -- --entity=location --file=scripts/datasets/locations-agrigento-pilot.json
```

The machine-readable report contains `input`, `normalized`, `valid`, `invalid`, `inserted`, `updated`, `duplicates`, `review`, `rejected`, `errors` and per-record stage/action. A compact log line is emitted first.

## Common and specific behavior

Common normalization is deterministic and idempotent: NFC/whitespace, matching text, slug, phone, lower-case email, canonical HTTP(S) URL, address/CAP/city/province/region/country and coordinates. Original source values are represented by the raw fingerprint and minimal provenance metadata; raw HTML and large payloads are not stored.

Common validation classifies `blocking` and `warning` issues. Church capacity, Location capacity range and Supplier taxonomy/price range remain specific. Blocking records are rejected before database access and never overwrite canonical data.

Strong duplicate signals are source+external ID, exact phone, exact website, or normalized name+address+city. Same normalized name+city without a strong address is ambiguous and becomes `READY_FOR_REVIEW`; weak similarity never auto-merges. Branch 31 may add advanced matching, but this branch deliberately does not.

Confidence reuses the established 0–100 model: official/admin sources carry more evidence than OSM/Wikidata; source URL, external ID, address, coordinates and direct contact add bounded evidence. Status remains `VERIFIED`, `PROBABLE`, `TO_CHECK`. An import cannot downgrade `VERIFIED`, erase populated fields with nulls or replace higher-confidence data with lower-confidence data.

## Provenance and security

`catalog_provenance` stores entity type/ID or external key, source type/name/URL, external ID, first import, last seen, SHA-256 raw fingerprint and minimal JSON metadata. Its unique source identity makes repeated imports idempotent. It is technical server-only data: RLS is enabled, no client policies exist, and `anon`/`authenticated` have no grants.

Global catalogs (`churches`, `locations`, `suppliers`) remain shared and canonical. User state remains exclusively in owner-protected `saved_churches`, `saved_locations`, `saved_suppliers`; ingestion is independent of the current event.

## Legacy model

| Object | Role |
|---|---|
| `suppliers` | canonical global professional catalog |
| `saved_suppliers` | private event relationship and commercial workflow |
| `supplier_locations` | evidence-backed canonical supplier/location relation |
| `vendors` | preserved legacy multi-entity catalog; no new writes |
| `vendor_places` | preserved legacy vendor/place relation; not equivalent to `supplier_locations` |

No legacy conversion, mass import or fourth supplier representation is introduced.

## Feature matrix

| Feature | Church | Location | Supplier |
|---|---|---|---|
| ingestion | implemented | implemented | implemented |
| normalization | implemented | implemented | implemented |
| validation | implemented | implemented | implemented |
| base dedupe | implemented | implemented | implemented |
| provenance | implemented | implemented | implemented |
| confidence | implemented | implemented | implemented |
| safe upsert | implemented | implemented | implemented |
| dry-run | implemented | implemented | implemented |
| report | implemented | implemented | implemented |

## Current limits

No fuzzy matching, geocoding, PostGIS, scheduler, scraping, admin UI or mass data load is included. Ambiguous candidates require a future review surface. The previously documented multi-event risk remains unchanged; this global pipeline does not read an event ID or alter event-type capabilities.
