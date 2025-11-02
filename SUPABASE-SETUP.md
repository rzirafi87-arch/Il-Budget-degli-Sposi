# Supabase Setup Addendum

This addendum lists SQL scripts and commands added to support countries/languages, storage policies, and indexes for traditions/checklist/budget.

## SQL Scripts

- Countries and languages with public read (RLS enabled):
  - `npm run sql:exec supabase-supported-lists.sql`
- Storage buckets and owner-based RLS (uploads, wedding-cards):
  - `npm run sql:exec supabase-storage-policies.sql`
- Traditions/Checklist/Budget indexes for fast queries:
  - `npm run sql:exec supabase-traditions-indexes.sql`
- Full init (local/dev):
  - `npm run sql:init:all`

## Env Check

Verify required env vars locally or on CI before deploy:

```
npm run env:verify
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`

