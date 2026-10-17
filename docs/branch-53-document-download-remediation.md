# Branch 53 document download remediation

Baseline: `849059349b6046b8e7af046fcbcf86cefe888790`.
Production: `vsguhivizuneylqhygfk`; old main: `7aaf48c0736fa50187864145f1d7d41fc1265014`.

## Measured RED, 2026-10-17

The bucket is private. Production's SELECT policy checks event access and active
metadata. The real isolated HTTP regression recorded:

| State | Request cache | HTTP | CDN | Response Cache-Control |
| --- | --- | --- | --- | --- |
| active | default | 200 | MISS | public, max-age=0 |
| active | no-store | 200 | HIT | public, max-age=0 |
| pending_storage | default | 200 | HIT | public, max-age=0 |
| pending_storage | no-store | 200 | HIT | public, max-age=0 |

The object was uploaded with `cacheControl: "0"`. A warmed authenticated direct
URL continued serving bytes after the tombstone. This reproduces the original
finding; client cache options and active-only RLS do not establish immediate HTTP
revocation of bytes already delivered to a CDN. These pre-hardening QA responses
are classified as `LEGACY_PRE_HARDENING_CACHE_OBSERVATION`; they are not user
Production data and are separate from the post-hardening security contract.
The probe removed its object, metadata, event and Auth identity and verified
DB=0 / Storage=0 / Auth=0. No user data was changed.

Old main's documents page simulates uploads with React state and
`URL.createObjectURL(file)`. Searching all `src` at the exact SHA finds no reference
to `event-documents`, `event_documents`, or `/api/my/documents`. The compatibility
workflow now asserts this evidence directly from the old checkout.

## Remediation and release gates

Migration 13 drops only `event_documents_storage_select`; no replacement policy,
data mutation, Storage internal change, or seating freeze. Original migration
blobs and their 12 manifest hashes remain unchanged; 13/13 Git blob hashes verify.
The server route authorizes event access and event identity, checks active state
and path, fetches bytes using service-role Storage, then checks access/state/path
again before responding with attachment bytes and `private, no-store, max-age=0`.
No signed URL is generated. The frontend consumes a blob and revokes its local URL.

RED route regressions failed before implementation; GREEN targeted route tests
passed, including concurrent tombstone/revocation, cross-event lookup, path attacks
and filename sanitization. The complete initial local run passed 116 suites and
792 tests; five additional route cases and one UI blob/revoke case subsequently
passed. Typecheck, production build and validate passed. Lint of release source
passed with 16 existing warnings; untracked ignored `.vercel` operator artifacts
must be excluded from local source lint. These results do not certify SQL, browser,
CI or Production gates, which must be recorded separately on the release SHA.

No Production migration, merge or deploy may occur until complete GREEN and CI
PASS. Apply only migration 13, verify 13/13 history and actual direct HTTP denial
on a fresh post-hardening QA identity/event/document/random path (first and repeated
GET, active and pending), then run old app against actual Production
schema. Merge/deploy requires that PASS; new-app Production smoke and zero residue
are mandatory before closing Branch 53. Never accept CDN expiry as security.
The product does not rely on synchronous revocation of CDN bytes already
delivered. No authenticated direct Storage access is allowed after migration 13;
all new application downloads pass through the authorized server route, returning
bytes with no-store and distributing no signed or direct Storage URL. A fresh
post-hardening direct GET returning 200 is STOP. Legacy cache observations remain
audit evidence, without weakening this contract or requiring migration 14.
