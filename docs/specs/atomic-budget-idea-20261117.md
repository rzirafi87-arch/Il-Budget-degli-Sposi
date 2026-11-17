# Atomic Idea Budget replacement

Scope: fix DELETE-success / INSERT-failure data loss in `/api/idea-di-budget/apply`.
Base: main cd6b406ac2db510a1a5a06ea398a73c02d97bf7b. No Production migration, writes, merge or credentials change authorized.

## Contract

- The server resolves the current event and actor. The browser cannot supply either to the RPC.
- `apply_budget_idea_atomic` is callable only by service_role, with explicit actor authorization through the existing B53 private helper. SECURITY DEFINER is intentional to reuse that private helper without granting browser or service_role direct access to it; search_path is empty and relations are schema-qualified.
- Lock the event row before replacing its generated entries; lock an existing actor membership while checking access. Concurrent replacement calls serialize, including when there are no pre-existing generated items.
- Delete only the selected event/country/source=budget_idea rows. Manual and other-country entries remain untouched.
- Insert and delete occur in the same database transaction. An exception restores the original set.
- Repeating a completed request replaces the set without appending duplicates. Row IDs are not promised stable. Two different successful edits are serialized, last applied set wins; stale-edit detection/versioning is outside this fix.
- A missing RPC or RPC failure returns an error. Never fall back to separate DELETE/INSERT.
- Existing input normalization, canonical deduplication and loading planned expenses remain unchanged. Existing UI PR #79 is not duplicated.

## Verification

Prior audit preserved an executable RED route reproduction on audit/product-review-20261117. New unit tests cover one-RPC dispatch, server actor/event, unavailable RPC, constraint/authorization errors, invalid auth, and empty/all-disabled replacement.

Isolated pgTAP tests inject an INSERT trigger failure after the DELETE and assert original rows survive. They cover service-only ACL, stranger/revoked-partner denial, active partner writes, manual/other-country preservation, retry and empty replacement. Concurrency script uses separate owner/partner connections on a loopback database only.

The canonical rebuild workflow applies the additive migration twice, runs the concurrency script and the full pgTAP manifest, lints functions and compares generated database types. The isolated browser rebuild installs the new migration. Playwright runners are pinned to Ubuntu 24.04 because PR #87's Ubuntu 26.04 jobs failed before browser installation; this pin already exists in integration #86.

Deployment must remain STOP until isolated tests and exact-commit Preview are reviewed and a separate Production gate is authorized. Preview may share Production's backend: do not exercise authenticated writes there.

## Product follow-up requested by the user

- IT/EN/ES/FR/DE are present; expand languages only with translated UI, errors, email, formatting, fallback and mobile QA. No extra language has been enabled by this fix.
- Only wedding is READY in EventTypeCapabilities; other event shells remain COMING_SOON. Complete one vertical event flow at a time before marking READY; reuse shared modules rather than duplicate them.
- Core planning must be usable without AI. Templates, guided questions, totals and validation should remain deterministic. Optional AI suggestions are a later, separately costed feature, never required to complete an event.
