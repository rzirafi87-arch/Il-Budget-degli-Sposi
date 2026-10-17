# Branch 53 production rollout and document download remediation

## Current remediation gate: migration 13 only

Production already has migrations 1–12 applied, seating resumed, and zero freeze
objects. Do not repeat those migrations or activate seating suspension for this
remediation. The historical initial-install procedure below applies only to a
database that has not yet received the seating changes.

The certified manifest now contains 13 entries. The first 12 hashes are unchanged
and certify Git blobs (Windows CRLF working copies are not the certified bytes).
Migration 13 is `20261017101208_branch_53_document_download_hardening.sql` and only
drops `event_documents_storage_select`; it changes no data or seating objects.

Require complete unit/route/lifecycle, pgTAP/rebuild/red-team, old-main compatibility,
Playwright, typecheck, lint/validate and build GREEN plus current-head CI PASS.
Then apply exclusively migration 13 using Supabase `apply_migration`, reconcile
history to 13/13, and verify no SELECT/ALL policy permits browser document reads.
Service-role reads remain server-only. Never restore a browser SELECT policy.

Run `node qa/document-download-storage-regression.mjs` with the trusted target
environment. It must deny active and pending reads for both ordinary and no-store
HTTP requests, and finish with DB/Storage/Auth residue 0. CDN HIT after tombstoning
was reproduced on 2026-10-17 even for a new object uploaded with cacheControl 0.
Do not accept cache expiry as revocation, and do not infer HTTP denial from SQL RLS.
Previously warmed URLs must also be verified; any surviving access is STOP.

Verify old main `7aaf48c0736fa50187864145f1d7d41fc1265014` against the actual
Production schema before merge: its documents page uses React state and local
blob URLs; `git grep` finds no Branch 53 document API/bucket/table dependency.
Only after real compatibility PASS may PR 71 merge and Production deploy.
Verify deployed SHA/READY, server file download, pending/retry/completed deletion,
direct Storage denial, gift list, seating, collaboration, auth, cross-event and
i18n; cleanup all isolated QA and report measured residue. Any failing gate stops
the release. Historical PASS evidence does not certify the remediation HEAD.

## Historical initial installation: seating suspension

This document supplies tooling, not permission to execute Production rollout.
Use a trusted administrator connection and `psql` with an already configured
`DATABASE_URL`. Never paste credentials into commands, reports or source control.
Run from the repository root at the reviewed release HEAD. Commands below use Bash.
Do not use `psql --single-transaction`: the scripts manage their own transactions.

## Scope and activation

The two ordinary persistent triggers are temporary rollout objects, not PostgreSQL
TEMP objects: they survive disconnect, process failure and session termination.
They reject every INSERT/UPDATE/DELETE/TRUNCATE statement, including zero-row statements,
service-role DML and SECURITY DEFINER RPCs, with SQLSTATE P0001 and message
`BRANCH53_SEATING_WRITES_SUSPENDED`. SELECT remains available. ENABLE ALWAYS
also covers replica-mode sessions. Administrative DDL can disable triggers and is
outside the application threat model; never disable these triggers during rollout.
TRUNCATE is blocked as well. Its runtime probe is isolated-only; Production verifiers inspect exact trigger event coverage without executing destructive probes.

Before activation, complete immutable-source, target, backup and recovery gates.
Record the previous deployment, SHA, migration history and data/storage checkpoint.
Record activation start/end timestamps and complete command outputs externally.

```bash
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-suspend-seating-writes.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-seating-suspended.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/preflight-branch53-seat-integrity.sql
```

The ACCESS EXCLUSIVE activation lock waits for existing writers to finish.
It temporarily blocks reads while acquired, then releases on commit; normal reads
remain available throughout the subsequent freeze. A 10-second lock timeout and
30-second statement timeout abort the entire transaction. Retry after diagnosing
contention; never remove timeouts. Suspend/resume retries accept only the exact
complete protocol state or complete absence; partial, altered or colliding objects
abort without repair. Verification is rollback-only and performs zero-row DML.

## Preflight and migration window

If historical preflight fails, STOP without migrations or automatic remediation.
Keep freeze active until an explicit continue/cancel decision. Export violating IDs.
For cancellation, run the controlled resume commands in the recovery section.
If preflight passes, apply only the twelve certified migrations in the approved
rollout procedure, checking success and recorded migration history after each.
Do not modify published migration files. Before applying any migration, verify the certified manifest (now thirteen files):

```bash
sha256sum --strict -c scripts/rollout/branch53-certified-migrations.sha256
```

All twelve filenames and SHA-256 digests are pinned to the incoming certified HEAD `067695f5504c95e4abdb4a7b9359a7d4a881dbbf`. Apply in manifest order; mismatch is STOP.

The isolated `seating-suspension` Database Rebuild job proves the exact chain:
baseline, RED writable state, suspend twice, verify with administrator/service/
authenticated roles, historical preflight, all twelve migrations with verification
after each, server-only RPC denial, resume twice, final ACL/RPC contract and normal
Branch 53 mutations. The fixture scripts are exclusively for disposable local CI
databases and MUST NOT be used on Production.

After the last migration:

```bash
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-seating-suspended.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-resume-seating-writes.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-seating-resumed.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-final-seating-contract.sql
```

Resume follows database verification and precedes runtime seating smoke: seating
mutation smoke cannot pass while intentionally frozen. Old application service-role
seating writes are blocked during freeze and available after resume. The remaining
old-app/new-schema, merge, deployment and runtime gates remain separately required.
Final Branch 53 ACLs stay unchanged: browser mutations denied on both relations;
service-role DML and guarded server RPCs available. Resume removes only the named
two triggers and dedicated function, using DROP without CASCADE.

## Interruption, emergency resume and rollback

On any interruption, reconnect with the same trusted target. Never infer state
from a disconnected process's exit code. First execute:

```bash
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-seating-suspended.sql
```

An ACTIVE result means writes remain fail-closed, even if no migrations completed.
To continue, reconcile actual migration history with certified hashes, rerun
preflight, and execute only remaining migrations after the rollout gates pass.
Do not blindly rerun an interrupted migration or automatically unfreeze on failure.

If the rollout is cancelled, or emergency recovery explicitly selects the previous
application against the current additive schema, use this controlled resume:

```bash
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-resume-seating-writes.sql
psql "$DATABASE_URL" --no-psqlrc -v ON_ERROR_STOP=1 -f scripts/rollout/branch53-verify-seating-resumed.sql
```

If all twelve migrations are present, also run the final seating contract verifier.
If they are incomplete, that verifier must not be interpreted as an inactive-state
gate: it checks the final schema, not a partial baseline. Diagnose partial schema
and old-application compatibility before restoring traffic. SQL rollback remains
non-destructive: retain data, ledgers, RLS, permanent grants, indexes, constraints,
RPCs and migration history. Application rollback follows the approved deployment
procedure. Protocol identity mismatch or lock failure requires STOP and diagnosis;
never manually drop unknown objects or use CASCADE to force recovery.
