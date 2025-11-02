# Core Events Quick Test

Minimal steps to test new endpoints without touching the UI.

## Init DB (once)
- `npm run sql:init:core-events`
- optional: `npm run sql:seed:core-demo`

## Public event API
- `GET /api/public/demo-public-001`

Curl:
```
curl -sS http://localhost:3000/api/public/demo-public-001 | jq
```

## Share token API
1) Generate a token:
   - Run SQL `supabase-generate-share-token.sql` (edit token/public_id if needed)
2) Call API:
```
curl -sS http://localhost:3000/api/share/demo-token-001 | jq
```

## Create event (core)
Requires an authenticated session (cookie) in your browser. From browser/Thunder Client, POST:

POST http://localhost:3000/api/event-core/new
Body JSON:
```
{
  "type_slug": "battesimo",
  "title": "Evento di prova",
  "is_public": true
}
```

Response:
```
{ "event": { "id": "...", "public_id": "..." } }
```

