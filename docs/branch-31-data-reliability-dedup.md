# Branch 31 — Data reliability, matching and conflict handling

## Audit and boundaries

The Branch 30 pipeline remains the only ingestion path for Church, Location and Supplier. Reused unchanged: adapters, deterministic normalization/fingerprint, blocking/warning validation, verification statuses, transaction boundary, safe upsert, canonical/private split and server-only provenance. Extended: candidate discovery, scoring, conflicts, confidence, dry-run report, merge preview and review persistence. Untouched: `saved_*`, events/capabilities, `vendors`, `vendor_places`, `supplier_locations`, UI and production catalog rows.

## Explainable matching

`catalog-reliability.mjs` evaluates the same signals for all three entity types and returns every signal, conflict, weight and threshold. Scores are evidence points, not a probability.

| Evidence | Points | Guardrail |
|---|---:|---|
| same source + external ID | 100 | exact identity |
| official domain | 55 | social/directory domains excluded |
| full address | 50 | street + city; compatible CAP |
| professional phone | 45 | shared central numbers still require corroboration |
| professional email | 45 | generic role mailbox reduced to 25 |
| nearby coordinates + compatible name | 35 | distance alone never merges |
| similar name | 20–28 | never sufficient alone |
| city / CAP / category | 10 / 8 / 7 | corroborating only |
| official social handle | 18 | complementary only |

`MATCH`: exact source identity, or at least 70 points with one strong signal, corroboration and no hard conflict. `POSSIBLE_MATCH`: at least 35 points or any hard conflict. Otherwise `NO_MATCH`. Supplier name-only cases have an additional identity guard. Church/parish wording and hotel/resort descriptors are retained as semantic descriptors; only legal suffixes are neutralized. Multi-brand, multi-location and shared domains/phones therefore remain reviewable.

## Conflicts, merge and provenance

Domain/city/address mismatch or coordinates farther than 1 km are hard conflicts. Phone mismatch is soft. Ambiguous or conflicting candidates become `READY_FOR_REVIEW`; `catalog_review_queue` stores only bounded identity evidence, score, reasons and a minimal payload. It is RLS-enabled, has no client grants and is idempotent for a pending candidate/fingerprint.

Auto-linking preserves the canonical ID and all external relations. `mergeWithoutDataLoss` prevents null erasure and preserves `VERIFIED` against weaker input. Every result contains a before/after/changed-fields preview. Field-level provenance is kept sustainably inside `catalog_provenance.metadata.field_sources`, avoiding a high-cardinality table. No destructive production merge is part of this branch.

## Confidence and freshness

Match score answers “same entity?”; confidence answers “how reliable is the canonical record?”. Confidence exposes components for source trust, completeness, identity, freshness, verification and cross-source consistency. A numeric score never promotes a record to `VERIFIED` by itself.

Provenance adds `source_updated_at`, missed-observation count and `ACTIVE`, `STALE`, `UNVERIFIED_STALE`. One miss or age can mark stale; repeated misses plus age can mark unverified stale. Nothing becomes `DELETED` or `CLOSED` automatically. Commercial activity state is intentionally deferred because absence from a source or an unreachable site is insufficient evidence, and church semantics differ.

## Advanced report

Dry-run performs zero writes and reports `NEW`, `EXACT_MATCH`, `HIGH_CONFIDENCE_MATCH`, `POSSIBLE_MATCH`, `CONFLICT` and `REJECTED`, plus totals for valid/invalid, new/exact/high/possible/conflict/stale, inserted/updated/unchanged/rejected/review/errors. `STALE_CANDIDATE` is modeled by the freshness classifier and report counter; source snapshot reconciliation is not enabled until a source can prove that a batch is complete.
