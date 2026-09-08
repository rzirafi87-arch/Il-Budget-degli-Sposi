# Branch 39 — Production readiness runbook

## Canonical URL and email
Set `SITE_URL` and `NEXT_PUBLIC_SITE_URL` to the verified custom origin when the domain is connected. Until then, auth email callbacks derive the HTTPS request origin, so Preview and the Vercel production alias remain usable. Configure `RESEND_API_KEY` and a verified `RESEND_FROM`; `onboarding@resend.dev` is development-only.

## Account deletion
Users request deletion from Profile by confirming their email and typing `ELIMINA`. Requests have a seven-day cancellation window. Processing must be performed by an authorized operator: transfer each owned shared event to the authenticated partner when present, otherwise export/confirm retention requirements, then delete user-scoped data and revoke sessions before deleting the Auth user. Never bulk-delete events without checking `bride_email`, `groom_email`, ownership and foreign keys.

## Backup and restore
Migrations and Database Rebuild are the reproducible schema source. Before a release, confirm the hosted Supabase backup/PITR entitlement and record a successful backup timestamp. Restore only into an isolated recovery project first; validate migration history, row counts, RLS and application smoke tests before any production decision. No destructive restore is part of this branch.

## Monitoring
Vercel runtime errors are the primary no-cost runtime signal. Review 5xx groups after Preview and Production smoke. Logs must contain stable error codes/scopes only—never tokens, passwords, email addresses, request bodies or Supabase error objects.

## Security
Global HSTS, nosniff, frame denial, referrer and permissions policies are enabled. CSP is deferred until a report-only inventory covers Next.js, Supabase, maps and optional analytics without breaking runtime behavior.

## Privacy
Google Analytics loads only after explicit consent. Technical cookies remain available without consent. Legal pages are implementation drafts and require final controller/company/contact/retention validation by qualified counsel before public launch.
