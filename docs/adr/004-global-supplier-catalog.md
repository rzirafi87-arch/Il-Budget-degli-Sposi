# ADR 004 — Global supplier catalog

## Decision

`suppliers` is the canonical shared catalog. `saved_suppliers` owns event-private workflow, notes, quotes and contract/payment state. `vendors` is a legacy mixed catalog and `vendor_places` is its legacy relation to `places`; both remain untouched. `supplier_locations` is the evidence-backed global relation to canonical `locations`.

Budget, expenses and timeline receive optional `saved_supplier_id` references. Quotes and selection never create costs automatically. Existing `payment_reminders` remains the only reminder system through its expense relation.

## Data safety and provenance

All 326 legacy supplier rows are preserved and labelled `source=legacy` when provenance is unknown. Normal imports use the Branch 26/27 normalization, validation, confidence and verification model. The Agrigento pilot is intentionally empty until professional public data can be verified from authorized sources; no price or commercial relationship is inferred.

## Classification

| Structure | Classification | Use |
|---|---|---|
| `suppliers` | CANONICAL | Global professional catalog |
| `saved_suppliers` | CANONICAL | Owner-only event relationship |
| `supplier_locations` | SUPPORT | Verified supplier/location evidence |
| `vendors` | LEGACY | Compatibility only |
| `vendor_places` | LEGACY | Compatibility only; not supplier/location |
| `places` | SUPPORT | Legacy geography |
| `budget_items.vendor_id` | LEGACY | Existing vendor link |
| `budget_items.saved_supplier_id` | CANONICAL | Optional private supplier link |

Event-type-specific required categories and taxonomy redesign are deferred to Branch 29.
