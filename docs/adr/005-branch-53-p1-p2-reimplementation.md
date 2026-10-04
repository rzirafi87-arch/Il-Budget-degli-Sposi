# ADR 005 — Branch 53 P1/P2 spec-driven reimplementation

- Status: targeted remediation implemented; verification governed by the final commit checks
- Date: 2026-09-28
- Red baseline: `16c84b335b4ef2fba705344000681ca64fdcc8d4`
- Base: `main@7aaf48c0736fa50187864145f1d7d41fc1265014`
- Scope: the original nine findings plus only the two new P1/P2 review findings

## Targeted remediation after Final Release Readiness

### Mandatory legacy seating upgrade preflight

`20261004184418_branch_53_late_upload_guard_followup.sql` makes final Storage INSERT/name changes serialize with reservation expiry through the event lock. Protocol paths (event/reservation UUID/filename) or any tracked reservation path require an unexpired active reservation or active persisted metadata. Late inserts after cleanup/release or immutable-path rotation are rejected; legacy flat/non-reservation paths remain compatible. The trigger uses `clock_timestamp()` after lock acquisition so queued requests cannot rely on an earlier transaction timestamp.

`20261004183049_branch_53_table_mutation_acl_followup.sql` closes browser INSERT/UPDATE/DELETE on both `tables` and `table_assignments`; assignment writes mutate the same full plan and must not bypass event serialization. SELECT remains available under existing RLS, and service-role grants preserve both guarded APIs and the unmodified old bundle's server routes. SQL RED/GREEN verifies every remaining browser mutation grant and authorized server access.

Before applying any Branch 53 table migration on an existing database, run `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/preflight-branch53-seat-integrity.sql`. This read-only gate lists event/table/seat IDs and conflicting guest IDs and fails with `BRANCH53_DUPLICATE_SEATS_REMEDIATION_REQUIRED` before the published unique index can abort an upgrade. Suspend seating writes during preflight and migration. If conflicts exist, stop the rollout, export the output, and have the event owner approve a corrected plan with distinct seats (or intentionally unassigned guests). Apply that reviewed correction through the existing application with separately authorized data writes, rerun the preflight, and proceed only when clean. Do not automatically discard assignments or rewrite published migrations. Both isolated rebuild entrypoints enforce the gate; Production execution and remediation remain separately authorized rollout requirements.

The independent readiness review found two additional violations on
`babf949aa784e552d387c3e01f6637229e6d746c`:

1. `DELETE /api/my/tables` bypasses `save_event_table_plan`'s event-row lock by
   deleting through PostgREST. A table delete and a plan save for the same event
   therefore do not have a single observable serialization order.
2. document deletion removes the Storage object before securing any durable
   database state. If the later metadata delete fails, active metadata points to
   irreversibly missing content and no retry state identifies the partial work.

The remediation adds no distributed transaction and keeps the established lock
order. Its invariants are:

- every table-plan mutation locks `public.events` first, then the target child;
- table delete is a server-only, event-scoped, idempotent RPC using the same
  owner/partner/legacy resolver as plan save;
- document delete first persists an event-scoped tombstone and a private ledger
  row in one short transaction;
- active document reads and signed downloads exclude tombstoned metadata;
- Storage deletion happens only after the tombstone transaction commits and
  while no PostgreSQL lock is held;
- finalization is a separate short transaction which verifies actor, event,
  document, operation, immutable object key, and Storage absence before deleting
  metadata and marking the ledger complete;
- duplicate, concurrent, or post-timeout retries reuse the document ID as the
  deletion intention and converge on the same ledger operation;
- any Storage or finalization failure returns an explicit retryable pending
  result while the metadata remains non-active and recoverable by retry.

The rejected alternatives are application mutexes, deleting metadata before a
durable ledger exists, and pretending that PostgreSQL and Storage share an
atomic transaction. All schema changes must be an additive migration; the four
published Branch 53 changes and earlier migrations remain byte-identical.

## Context and verified baseline

Database Rebuild #315 ran the published regression script in an isolated Supabase stack and reproduced all four release blockers:

| Finding | Red evidence |
|---|---|
| P1-A regenerated table numbers | `exit=1` |
| P1-C legacy collaborator | `exit=1` |
| P1-B atomic document quota | two successes; `106954752` bytes persisted |
| P2 serialized table capacity | two successes; two assignments on a one-seat table |

The production project remains PostgreSQL 17.6. The current Supabase CLI pinned by CI is 2.116.0. `supabase --help`, `supabase migration --help`, and `supabase migration new --help` confirm that new migrations must be created with `supabase migration new <name>`.

The current Supabase guidance confirms the following design constraints:

- database functions execute in a transaction and are suitable for data-intensive atomic work;
- `security invoker` is preferred, while any necessary `security definer` function must fix `search_path` and fully qualify relations;
- new functions receive `EXECUTE` broadly through the project's current default privileges unless explicitly revoked;
- Data API grants determine whether an object is reachable and RLS determines which rows are reachable;
- `auth.uid()` is the trusted database identity for RLS; user-controlled metadata is not an authorization source;
- Storage authorization is enforced through policies on `storage.objects`, but service-role credentials must remain server-only.

The production role inventory confirms permissive default function ACLs in `public`; every new privileged function therefore requires explicit `REVOKE` from `PUBLIC`, `anon`, and `authenticated`, followed by a minimal `service_role` grant. `public` is demonstrably exposed through the existing Data API and all new server-controlled state will therefore live in the non-exposed `private` schema.

The 2026-09-25 Supabase changelog announces PostgreSQL 17.11 and extension reindex/re-encryption considerations. It does not alter the function, RLS, Storage, or transaction semantics used here; the project is still on 17.6 at this decision point.

## Current schema

### Event and access model

- `public.events`
  - primary key `id uuid`;
  - canonical owner `owner_id uuid not null`;
  - legacy spouse identifiers `bride_email` and `groom_email`;
  - indexed by owner.
- `public.event_members`
  - unique `(event_id, user_id)`;
  - roles `owner | partner`;
  - statuses `active | revoked | left`;
  - one partial unique active-partner index per event;
  - indexes on `event_id`, `user_id`, and `(event_id, status)`.
- `public.can_access_event(uuid)`
  - accepts an active canonical membership;
  - otherwise permits the owner or an exact normalized JWT email match to the legacy spouse fields;
  - any canonical membership row, including `revoked` or `left`, suppresses the legacy fallback.

The exact legitimate legacy source is `auth.users.email`, normalized with `lower(btrim(...))`, matched to `events.bride_email/groom_email`. A read-only production audit found one legitimate legacy candidate without a canonical membership. No production DML or reconciliation is required.

### Guests and tables

- `public.guests`
  - primary key `id` and mandatory `event_id`;
  - family metadata: `family_group_id`, `exclude_from_family_table`, and the related family name;
  - index on `event_id` and family predicates.
- `public.tables`
  - primary key `id`, mandatory `event_id`;
  - unique `(event_id, table_number)`;
  - capacity in `total_seats`;
  - index on `event_id`.
- `public.table_assignments`
  - primary key `id`;
  - foreign keys `table_id` and `guest_id`;
  - unique `guest_id`, so one guest can appear once globally;
  - indexes on both foreign keys;
  - no declarative unique seat constraint at the red baseline.

A read-only production audit found zero duplicate table numbers, duplicate seats, duplicate guests, over-capacity tables, or cross-event assignments, so the additive unique seat index requires no production cleanup.

### Documents and Storage after the existing Branch 53 migrations

- `public.event_documents`
  - event-scoped metadata with unique `object_path`;
  - per-file maximum 10 MiB;
  - allowed MIME types PDF/JPEG/PNG;
  - object path prefixed by the event UUID;
  - event/created-time index;
  - RLS using `can_access_event`.
- private Storage bucket `event-documents`
  - 10 MiB object limit;
  - authenticated Storage policies currently allow event-scoped select, insert, and delete.
- no reservation ledger exists at the red baseline.

## Current flows and demonstrated causes

### Table-plan save

The API authenticates the bearer, resolves the current event with a service-role client, validates the JSON, and calls the server-only `save_event_table_plan` RPC with the verified user ID. The RPC locks the event row, but inserts regenerated tables before deleting replaced rows.

- P1-A cause: a regenerated table reuses number 1 with a new ID while the old number 1 still exists, causing unique violation `23505`.
- P1-C cause: the API recognizes the exact legacy spouse-email fallback, while the RPC checks only owner or active `event_members` rows.
- P2 capacity cause: the assignment trigger reads the parent table without locking it, so concurrent inserts both observe the same pre-insert count.
- Metadata cause: assigned guests returned by GET contain only ID/name/seat; the UI reconstructs them as `common` and loses family metadata during regeneration.

### Document upload

The API reads the sum of persistent metadata, uploads the object, and then inserts metadata. Storage and the metadata insert happen after an unlocked read and in separate systems.

- P1-B cause: two requests can both read the same usage and both commit beyond 100 MiB.
- Direct authenticated Storage and metadata inserts can bypass the API quota check.
- Cleanup only covers a metadata insert failure in the same request; there is no idempotent reservation, retry, or expiry state.
- Multi-file UI cause: a later file failure aborts the loop before `loadDocuments`, hiding earlier successes and encouraging duplicate retries.

### Gift list and tooling

- malformed JSON throws `SyntaxError`, bypasses validation handling, and becomes a 500;
- DB/API accept `archived`, but the UI selector and five dictionaries do not present it;
- `scripts/rebuild-local-supabase.sh` is mode `100644`, so direct execution fails.

## Authorization matrix

The shared database resolver will return a role or no access. API event resolution, server-only RPCs, and RLS must match this matrix.

| Actor | Result |
|---|---|
| owner with active canonical membership | owner, allowed |
| owner from authoritative `events.owner_id` fallback | owner, allowed |
| active canonical partner | partner, allowed |
| exact legacy spouse email with no membership row | legacy, allowed |
| canonical `left` member | denied; legacy fallback suppressed |
| canonical `revoked` member | denied; legacy fallback suppressed |
| non-member | denied |
| anonymous | denied |
| member of another event | denied |
| legacy event without canonical owner membership but valid `events.owner_id` | owner allowed |

No decision uses client-supplied role, JWT `user_metadata`, or an unverified email. Server-only RPCs receive the user ID derived from the verified bearer and independently resolve it against `auth.users` and database ownership/membership state.

## Alternatives considered

### Table serialization

1. **Event row lock — chosen.** Lock `events(id)` with `FOR UPDATE`, then validate and replace the complete plan in one transaction. It provides a durable per-event lock key, a single documented lock order, automatic release, and no extra state.
2. **Transaction advisory lock.** `pg_advisory_xact_lock` with a stable UUID hash would avoid touching the event row, but collision/key derivation must be proven and every writer must use the same convention.
3. **Optimistic versioning.** An event plan version would reject stale writers, but requires new client-visible version semantics and changes approved product behavior.

### Document quota reservation

1. **Private reservation ledger plus event row lock — chosen.** A short RPC transaction locks the event, includes persistent bytes plus active reservations, and creates/reuses an idempotent reservation. Storage work occurs after commit; finalize/release are separate short transactions using the same event-first lock order.
2. **Serializable transaction around metadata only.** This cannot span Storage safely and would still need retry/idempotency handling.
3. **Storage-object trigger only.** Storage writes and object bytes are managed by the Storage service; coupling quota semantics to internal object mutations would be brittle and would not model upload failure/retry clearly.

### Legacy compatibility

1. **Shared private resolver — chosen.** Resolve canonical membership first, suppress fallback for `left/revoked`, then match the authoritative `auth.users.email` to spouse fields. Public `can_access_event` and server-only mutation RPCs delegate to it.
2. **Production backfill.** Converting every legacy match to `event_members` would simplify reads, but requires production DML and a separate reviewed reconciliation. It is unnecessary for the one verified candidate.

## Decision

### Lock order and table-plan algorithm

Every event-scoped mutation locks in this order:

1. `public.events` row for the event;
2. child resource row when needed (reservation or table);
3. dependent rows.

The table-plan RPC will:

1. resolve authorization before mutation;
2. lock the event row;
3. parse and validate the entire payload, including duplicate IDs/numbers/guests, capacity, seat uniqueness, existing table ownership, and guest event ownership;
4. resolve IDs for new tables;
5. move the participating existing table numbers to a conflict-free temporary range, remove their assignments, then upsert final table values;
6. for full replacement, delete omitted obsolete tables only after every requested table exists with its final number;
7. insert assignments only after all tables exist.

Any exception rolls back the entire transaction. Concurrent full saves serialize on the event row; the later lock holder deterministically replaces the earlier committed plan. Direct assignment writes lock the parent table row, and a partial unique `(table_id, seat_number)` index provides declarative non-null seat protection.

### Document reservation protocol

`private.event_document_upload_reservations` is server-controlled and not exposed through the Data API. It stores event, actor, idempotency key, payload fingerprint fields, a non-predictable object key, expected byte count, expiry, state, and final document ID.

- **reserve:** authorize, lock event, expire stale active rows, replay identical keys, reject mutated keys, sum persistent documents plus active non-expired reservations, and reserve only when the total is at most 104857600 bytes;
- **upload:** the server uploads after reserve commits, using the service role only on the server and the reservation object key;
- **finalize:** authorize, lock event then reservation, validate actor/event/object key/size and the actual Storage object record, insert metadata, and mark the reservation finalized atomically;
- **release:** authorize, lock event then reservation, require the object to be absent, and mark an active reservation released; repeated release is idempotent;
- **expiry cleanup:** requests opportunistically claim expired reservations, remove any object outside a database transaction, and close the cleanup state. No paid scheduler is required.

A defensive `event_documents` quota trigger also locks the event row. It makes the published direct-SQL concurrency regression green and prevents privileged out-of-protocol inserts from exceeding the cap. Finalize marks its reservation `finalizing` inside the same transaction before inserting metadata, so reserved bytes are not double-counted.

Authenticated clients lose direct INSERT/DELETE privileges on document metadata and direct Storage INSERT/DELETE policies. Reads remain event-scoped. All mutations remain available through the existing authenticated application API.

### Targeted document deletion protocol

The additive migration `20260928131021_branch_53_delete_remediation.sql`
introduces `event_documents.deletion_state` and the server-only
`private.event_document_deletions` ledger. The document ID is the stable delete
intention, so duplicate and concurrent DELETE requests reuse one operation.

1. `begin_event_document_delete` authorizes, locks the event and document in the
   established order, creates/replays the ledger row, and changes metadata from
   `active` to `pending_storage` atomically.
2. Application and RLS reads exclude `pending_storage`; signed downloads reject
   it. The document is therefore never presented as active after deletion has
   begun.
3. The server removes the immutable ledger object key from Storage after the
   first transaction commits and while no database lock is held.
4. `complete_event_document_delete` reacquires the event-first lock order,
   reauthorizes, verifies operation/document/event/object-key identity and
   confirms the Storage row is absent before deleting metadata and marking the
   ledger `completed`.

If Storage fails, or if completion fails after Storage succeeds, the API returns
an explicit retryable pending response. A retry replays the same operation,
repeats the idempotent object removal, and completes cleanup. Completed retries
return success without touching Storage.

## Constraints and indexes

- unique reservation `(event_id, idempotency_key)`;
- reservation indexes on `(event_id, status, expires_at)` and object key;
- existing unique `(event_id, table_number)` retained;
- partial unique seat index `(table_id, seat_number) where seat_number is not null`;
- existing guest uniqueness retained;
- existing foreign-key indexes retained;
- any new constraint is guarded through `pg_constraint` or created as an explicitly named unique index.

## RLS and grants impact

- no browser grant on the private reservation table;
- privileged protocol functions are `security definer`, have `search_path = ''`, use fully qualified objects, and are executable only by `service_role`;
- `PUBLIC`, `anon`, and `authenticated` execution is explicitly revoked;
- the existing public `can_access_event(uuid)` remains the authenticated RLS entry point and delegates only with `auth.uid()`;
- no policy grants access solely through `TO authenticated`; every public read remains event-scoped.

## Failure modes and recovery

- upload fails before object creation: release the reservation;
- upload succeeds but finalize fails: remove the object, then release; if removal fails, keep the reservation non-released and log a stable cleanup finding;
- client times out after finalize: the same idempotency key returns the existing finalized document;
- expired upload: finalize is denied; opportunistic cleanup removes the object before closing the reservation;
- concurrent table saves: event lock serializes them; a failed later save preserves the earlier committed plan;
- a caller-enforced lock timeout expires: the request fails without partial state and can be safely retried;
- document deletion first secures a tombstone and ledger; Storage or database
  failure leaves `pending_storage`, and a later retry can complete cleanup;
- a completed document delete frees quota only when tombstoned metadata is
  removed; no active metadata can point to an already deleted object;
- concurrent or duplicate deletes converge on one unique document ledger row.

## Rollback

Before merge, application rollback is a normal revert of the logical commits. Database rollback, if this migration is ever deployed, must be a reviewed additive compensating migration:

1. restore prior function and policy definitions;
2. revoke protocol function grants;
3. retain reservation history until confirmed unreferenced;
4. drop new triggers/indexes/functions only after compatibility verification;
5. never delete user documents or table plans automatically.

No production migration, DML, merge, or deployment is part of this ADR.

## Verification evidence before push

- clean rebuild from the production baseline through the additive migration on PostgreSQL 17.6: PASS;
- additive migration applied a second time to the rebuilt schema: PASS;
- published Branch 53 regression script: 4/4 PASS;
- pgTAP manifest: 12 suites, 364/364 assertions PASS;
- real concurrent red-team: ten-way quota and table races, duplicate/mutated idempotency, cross-event/left actors, manipulated object key, lock timeout and retry, cleanup after Storage error, and deadlock scan: PASS;
- Jest: 113 suites, 724/724 tests PASS;
- typecheck, targeted lint, UTF-8/mojibake/secret/config checks, five-locale parity, Italian runtime scan, and Next.js production build: PASS;
- full lint: zero errors and 16 pre-existing warnings, with zero warnings in changed files;
- the three original Branch 53 migration files are byte-for-byte unchanged from `16c84b3`.

The local CLI `db lint` invocation cannot load `plpgsql_check` in the zero-cost embedded PostgreSQL harness. The same lint command remains mandatory in the isolated Supabase Database Rebuild workflow before RC promotion. No production or paid preview database was used to bypass this environmental limitation.

## Official references reviewed

- [Database Functions](https://supabase.com/docs/guides/database/functions) — transaction scope, `security definer`, fixed `search_path`, and function privileges;
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — grants, policies, and `auth.uid()` semantics;
- [Securing your API](https://supabase.com/docs/guides/api/securing-your-api) and [Using Custom Schemas](https://supabase.com/docs/guides/api/using-custom-schemas) — Data API reachability and exposed schemas;
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — `storage.objects` policies and server-only service credentials;
- [Database Migrations](https://supabase.com/docs/guides/local-development/database-migrations) — CLI-generated additive migration workflow;
- [Data API grant behavior change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) — current explicit-grant behavior and transition dates.

## Review followup: event cascade and browser table DELETE

The additive `20261004090526_branch_53_review_followup.sql` revokes browser-role DELETE on `public.tables`; both guarded API generations retain server-side deletion. Event deletion now cleans documents with the existing begin/remove/complete protocol before its owner-JWT cascade. Failures preserve the event and cleanup ledgers and return retryable `EVENT_DELETE_CLEANUP_PENDING` (503). Expired upload reservations are handled through the existing cleanup RPCs; active uploads keep the event retryable until they settle or expire, and the database refuses event deletion while metadata, pending operations, in-flight reservations or active Storage objects remain. A Storage insert/move trigger locks the event row and rejects missing events, preventing delayed uploads from recreating orphaned files after a cascade. Objects are removed through the [Storage API](https://supabase.com/docs/guides/storage/management/delete-objects), never by SQL in application code. No published migration is rewritten.

## Review followup: document cleanup lifecycle

Upload race followup (`20261004095304_branch_53_upload_race_followup.sql`) adds a service-only event-locked path check before orphan sweeping: active/finalized/pending reservations or metadata prevent removal. Reservations precede Storage writes and keep immutable paths. Upload finalization is retried idempotently after an error; unresolved responses preserve Storage and reservation state and return retryable 503 rather than removing an object that may already have committed metadata. Existing expiry claim/cleanup handles abandoned reservations.

Upload reservation cleanup similarly survives actor removal in `20261004094408_branch_53_upload_actor_cleanup_followup.sql`: the nullable actor uses `ON DELETE SET NULL`. Reservation, finalization and release reject a null actor with `IS DISTINCT FROM`; authorized event members can still claim and complete abandoned cleanup through the existing cleanup RPCs. Account removal cannot discard cleanup paths or transfer upload identity to another member.

The additive `20261004092439_branch_53_document_lifecycle_followup.sql` requires active document metadata for direct authenticated Storage reads, so tombstones deny owner and partner access while physical removal is retried. GET exposes pending deletion IDs and display names separately; the UI retains them after a transient error and reload, with an explicit retry action and no download action. The private deletion ledger retains its idempotency identity when an actor account is deleted, anonymizing the nullable actor foreign key with `ON DELETE SET NULL`. RED/GREEN fixtures cover both database regressions; UI/API tests cover retry persistence. The legacy harness creates active metadata for its real Storage probe and separately verifies denial after tombstoning.
