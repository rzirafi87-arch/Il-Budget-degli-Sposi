# Environment Setup

Technical checklist for maintaining this repository without exposing secrets.

## Local Prerequisites

- Git for Windows.
- Node.js compatible with `package.json` engines (`>=18.17.0`).
- npm, using the committed `package-lock.json`.
- GitHub CLI (`gh`) for authentication, pull request and CI checks.
- Supabase CLI for local database linking, migration status and database checks.
- Vercel CLI for project linking, preview checks and production deployment checks.

## Node And Package Manager

Use npm with the committed lockfile:

```powershell
npm ci
npm run typecheck
npm run build
npm test
```

Do not replace the lockfile unless dependency versions are intentionally changed.

## Git And GitHub

Verify local Git and remotes:

```powershell
git --version
git status --short --branch
git remote -v
git branch --show-current
```

Verify GitHub CLI authentication:

```powershell
gh --version
gh auth status
```

Check pull request and CI access without printing secrets:

```powershell
gh pr status
gh run list --limit 10
gh run view --log-failed
```

For this repository, Branch 27 work must stay on `branch-27-global-locations` until it is explicitly merged.

## Supabase

Required local checks:

```powershell
supabase --version
supabase status
supabase migration list
```

Required environment variable names:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE`
- `DATABASE_URL`

Configure local values in `.env.local` and deployment values in the hosting provider dashboard. Never commit real values.

Database rebuild checks should include:

```powershell
npm run sql:init:all
npm run codex:check
```

Run the SQL regression files under `supabase/tests/` against a disposable or local database before production changes.

## Vercel

Required checks:

```powershell
vercel --version
vercel link --yes
vercel env ls
vercel ls
```

Use Vercel dashboard or CLI to confirm:

- project is linked to the expected repository;
- Preview deployments build from pull requests;
- Production still points to the intended branch or deployment;
- required environment variables exist for Preview and Production.

Do not print environment variable values.

## CI And Deployment Verification

Before merging a branch:

```powershell
npm run typecheck
npm run build
npm test
npm run check:secrets
gh run list --limit 10
```

For Preview and Production, verify the deployment URL, build status and runtime smoke tests from Vercel without exposing tokens or secrets.
