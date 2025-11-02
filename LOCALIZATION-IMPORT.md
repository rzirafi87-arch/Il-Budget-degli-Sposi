# Localization presets import (app.*)

This app ships with a normalized localization schema under `app.*` (countries, event_types, country_events + lookups/bridges) and two helpers:

- `app.upsert_country_event_wedding(...)` — upsert a single country+event with arrays of values
- `app.import_country_events_from_json(payload jsonb)` — batch import from a JSON array (see template)

## JSON template

See `data/country-events.template.json` for a minimal structure. You can include multiple countries and multiple event types per country.

## How to run (local Postgres)

- Ensure local DB is running (see `docker-compose.yml`).
- Run patches to create the `app.*` schema and functions (one-time): use the VS Code task "Run SQL: Init schema + patches (local PG)".
- Open a SQL editor (or create a small script) and execute:

```sql
-- Load your JSON file content into a text/JSONB variable in your client and pass it here
select app.import_country_events_from_json(
  '[{"country_code":"IT","country_name":"Italia","language":"it","event_types":[{"slug":"matrimonio","name":"Matrimonio","traditions":{"description":"..."}}]}]'::jsonb
);
```

For production (Supabase Cloud), use the corresponding VS Code tasks to run SQL against your project or call the function via RPC from a secure admin script.

## Notes
- The importer is idempotent: it clears and re-links bridges for the given country+event.
- Percentages in `budget_focus_pct` must sum to ~100 (99–101 allowed).
- The API endpoints `/api/my/wedding/localized` and `/api/my/wedding/budget-focus` read from `app.v_country_event_wedding` and work in demo mode (no auth) for GET.
