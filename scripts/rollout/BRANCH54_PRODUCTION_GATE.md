# Branch 54 / Branch 57 — Final Production release gate

**Preparation only. This runbook DOES NOT authorize merge, migration, deploy, Production QA writes or secret changes.**

## Exact baseline (re-check before each authorized step)
- PR #86 is the isolated integration candidate. Do not independently merge PR #72 if using #86; it already contains B54.
- Baseline main: `cd6b406ac2db510a1a5a06ea398a73c02d97bf7b`. Preview must be READY on the exact final PR SHA.
- Supabase project `vsguhivizuneylqhygfk` was ACTIVE_HEALTHY with 53 recorded migrations, ending at Branch 53, as of 2026-11-16.
- No Branch 54 or Branch 57 migrations were recorded in Production at that checkpoint.

## Read-only preflight
1. Verify exact PR SHA, main and Production deployment SHA and whether any new code or schema drift occurred.
2. Require CI, Database Rebuild, both compatibility workflows and Preview Playwright PASS on exact candidate SHA.
3. Run `node scripts/rollout/branch54-release-preflight.mjs` as a static-only contract check; PASS does not prove Production compatibility.
4. Verify backup/recovery evidence, migration history, and the current state of the three private B57 tables and B54 ledger tables.
5. Re-evaluate catalog and security advisors separately; do not grant broad access or weaken RLS.

## Migration plan (requires separate authorization)
- In disposable/local integration: prove B57 private RLS hardening and B54 ledger RED-to-GREEN including reapply/idempotence, concurrency, and old-app/new-schema compatibility.
- Prefer tested order B57 followed by B54; reconfirm against the exact release candidate and verify migration history uses the proper version identifiers.
- B54 obtains SHARE ROW EXCLUSIVE locks on `public.budget_items`, `public.expenses`, `public.saved_suppliers` with `lock_timeout=5s` and `statement_timeout=60s`. Abort on lock failures or timeouts; do not retry blindly.
- B54 captures preexisting qualifying events as excluded legacy cohort, not historical activations. Prior point-in-time inventory: 27 events, 1 qualifying exclusion; recompute at release time.
- Verify after each approved migration: migration row, RLS status, triggers, ledger/cohort and expected access behavior, no unexpected data modifications.
- B57 modifies RLS on three private tables and the search_path of `public.ensure_subcategory(uuid,text)`; verify ownership/privileges and functional tests.

## Production smoke limitations
- On pull requests, `Production smoke` validates workflow/collection only. HTTP preflight and browser jobs are SKIPPED.
- Real Production browser smoke is a manually dispatched main-only job and may write scoped QA fixtures; it needs explicit authorization, QA identities, cleanup and data-integrity baseline checks.
- The runner is pinned to `ubuntu-24.04` for Playwright compatibility; the prior ubuntu-latest runner used unsupported Ubuntu 26.04.
- Do not call a skipped job PASS; do not infer runtime correctness from deployment READY.

## STOP conditions
- Wrong SHA, missing or incomplete backup, schema drift, failing tests, stale Preview, unexpected privilege expansion, mutation without authorization, inconsistent migration history or missing QA cleanup => STOP.
- Merge on main, applying Production migrations, Production deploy and write-capable Production smoke are individually authorized checkpoints.
