# Branch 53 temporary seating write suspension

This document supplies tooling, not permission to execute Production rollout.
Use a trusted administrator connection and `psql` with an already configured
`DATABASE_URL`. Never paste credentials into commands, reports or source control.
Run from the repository root at the reviewed release HEAD. Commands below use Bash.
Do not use `psql --single-transaction`: the scripts manage their own transactions.

## Scope and activation

The two ordinary persistent triggers are temporary rollout objects, not PostgreSQL
TEMP objects: they survive disconnect, process failure and session termination.
They reject every INSERT/UPDATE/DELETE statement, including zero-row statements,
service-role DML and SECURITY DEFINER RPCs, with SQLSTATE P0001 and message
`BRANCH53_SEATING_WRITES_SUSPENDED`. SELECT remains available. ENABLE ALWAYS
also covers replica-mode sessions. Administrative DDL can disable triggers and is
outside the application threat model; never disable these triggers during rollout.
TRUNCATE is not part of the application contract and is never permitted in rollout.

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
Do not modify migration files or introduce a thirteenth migration.

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
