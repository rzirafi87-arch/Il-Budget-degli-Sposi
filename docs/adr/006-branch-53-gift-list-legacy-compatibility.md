# ADR 006 — Branch 53 gift-list legacy compatibility

## Decision

`public.gift_list_items` remains the only persisted source of truth. Branch 53 adds a service-role-only writable compatibility view named `public.gift_list` for the immutable old application bundle.

The view is backed by `gift_list_items` and an `INSTEAD OF INSERT OR UPDATE OR DELETE` trigger. It does not create a second table, dual-write path, payment model, purchaser model, or contribution model.

## Mapping

| Legacy | Canonical |
| --- | --- |
| `user_id` | `created_by` |
| `price` | `target_amount` |
| `notes` | `note` |
| `alta` / `media` / `bassa` | `high` / `medium` / `low` |
| `desiderato` | `wanted` |
| `acquistato` | `received` |
| `ricevuto` input alias | `received` |

Canonical `received` has one stable legacy representation: `acquistato`. Canonical `archived` rows are not exposed by the legacy view because the old client has no archived state.

`image_url`, `purchased_by`, and `purchased_at` are returned as `null`. Non-null writes fail with stable SQLSTATE `22023` errors so unsupported information is never silently discarded.

## Security

`PUBLIC`, `anon`, and `authenticated` receive no privilege on the view or trigger function. Only `service_role`, already used behind the old guarded API, receives CRUD access. The trigger function is `SECURITY INVOKER`, has an empty `search_path`, uses fully qualified objects, and refuses identity changes on update. Event authorization and event scoping remain in `requireEventAccess` and the old API's `event_id` predicates.

## Rollback contract

The old application can read and mutate the canonical Branch 53 dataset through `public.gift_list`. The new application continues to use `public.gift_list_items` directly. Application rollback therefore requires no SQL rollback.
