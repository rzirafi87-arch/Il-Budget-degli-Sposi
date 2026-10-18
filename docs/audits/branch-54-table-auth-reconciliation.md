# Branch 54 — table authentication reconciliation

PR #72; original authoritative HEAD `923cd161604291dfda546d66c58a717022a13065`.
Main reference: `5fd13a62fd47d13af5187032b9cab15dbb236284`.
No merge, Production writes, Production DML, or schema changes are authorized in this work.

## Scope and evidence

The independent 401 finding is valid: `invitati` and `formazione-tavoli` fetched
`/api/my/tables` without the Bearer header. `invitati/tavoli` already supplied it.
The regression in `e2e/branch54-journey.spec.ts` uses UI login against disposable
loopback Supabase, observes actual page requests for all three routes, and checks
200 and the presence of the page-generated Bearer header. It does not supply tokens
to these page requests. After UI logout it checks anonymous and invalid-token 401s.
The invalid-token negative case deliberately sends an invalid credential.

RED-only commits: `469fa88a` and corrected test `0296151a`.
Real browser RED confirmed on `0296151a` in
[isolated lifecycle run 39117843294](https://github.com/rzirafi87-arch/Il-Budget-degli-Sposi/actions/runs/39117843294):
both `invitati` and `formazione-tavoli` returned 401 with
`{"error":"AUTHENTICATION_REQUIRED"}` and no Authorization header;
`invitati/tavoli` passed. The run had 12 passing tests and this one failing journey.
CI evidence and final release verdict will be recorded in the PR reconciliation
comment after all checks and a fresh automatic review complete.

The shared `fetchMyTables` reads the current browser session for each request,
uses no-store, and leaves authentication/authorization enforcement to the API.
No API cookie fallback or server key is introduced in the client.

## Explicitly deferred findings

### Branch 55 — supplier data quality and deduplication

External Production observations supplied for this reconciliation (not independently
requeried here): VERIFIED duplicates Aldo Coppola Milano ×3; Aldo Coppola Venezia ×3;
Amalfi Coast Catering ×2; Antico Pigneto Catering ×2.
Plan deduplication in Branch 55. Do not perform Production DML in Branch 54.

### Immediate post-B54 truthfulness hotfix

Remove objectively untrue public claims and public placeholders: reported Privacy
placeholder, footer “Pagamenti Sicuri”, “GDPR Compliant”, and “100% Gratuito”.
Assess claims against actual product behavior. Do not rewrite legal policies in PR #72.

### Branch 57 — legal and privacy implementation

Definitive Privacy Policy, Cookie Policy matching the actual inventory, CMP if
required, Terms, GDPR/data rights, processors, and retention. The reported mismatch
between the current Cookie Policy and actual inventory belongs to this work.

## Release gate

### Additional independent review of `824651a7`

No P0/P1 reported. P2 reconciliation reopens the gate for subsequent changes:

- Client-generated UUIDs were not correlated with server logs. ProgressiveSetup
  now displays the server UUID when returned; failures without a server reference
  show no code. Other client recovery consumers no longer generate local UUIDs.
- Successful NO_EVENT/SELECTION_REQUIRED responses no longer become retry errors
  in ProgressiveSetup; route guards own onboarding/selection. Unit RED reproduced
  all three reference/NO_EVENT failures before the fix. A real-login E2E covers a
  fresh identity without an event reaching the enabled event-creation choice.
- Whether `source='budget_idea'` counts as activation/firstValue requires an explicit
  user choice: exclude templates from the metric or retain them and change labels.
  No trigger/metric change is made before that decision.
- P3 duplicate event-resolve calls and full-history gitleaks/repository-visibility
  decision are recorded in the separate local pre-Beta backlog, outside this PR.

The previous table-auth PASS applies to `824651a7`. Subsequent changes require
fresh CI/review evidence and resolution of the activation product decision.

PASS requires RED reproduced, GREEN real browser requests for all three routes,
negative auth checks, full Branch 54/unit/integration/database/mobile/i18n checks,
typecheck, validate, build, complete CI, exact-HEAD Preview smoke, and a fresh
automatic review with zero unresolved in-scope P0/P1/P2 findings.
Until these are evidenced, release readiness is STOP.
Even after PASS, Production requires a separate gate; do not merge this PR here.
