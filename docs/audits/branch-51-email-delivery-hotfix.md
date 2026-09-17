# Branch 51 — transactional email delivery hotfix

## Decision

Production and Preview select the transactional provider explicitly with
`EMAIL_PROVIDER=brevo`. There is no automatic provider fallback. The legacy
Resend adapter remains available only when `EMAIL_PROVIDER=resend`; its SDK is
dynamically imported on that path and is neither initialized nor called while
Brevo is selected.

The temporary sender is one individually verified Gmail address controlled by
the project owner. Brevo Free provides 300 transactional emails per day without
a card. No authenticated sending domain is claimed. The configuration is a
zero-cost bridge until `ilbudgetdeglisposi.it` has working public DNS and can be
authenticated with SPF, DKIM and DMARC.

## Server-only configuration

The following names are configured only in Vercel Preview and Production. Their
values must never be committed, exposed through `NEXT_PUBLIC_`, logged or added
to build artifacts:

- `EMAIL_PROVIDER`
- `BREVO_API_KEY`
- `EMAIL_FROM`
- `EMAIL_FROM_NAME`

Existing `RESEND_API_KEY` may remain for rollback history but is inactive while
Brevo is selected. `onboarding@resend.dev` is not used.

## Delivery contract

`src/lib/email/sendTransactionalEmail.ts` owns provider selection and typed
configuration. Provider adapters own only provider-specific transport. Message
templates remain in `src/lib/mailer.ts` and escape dynamic HTML. Brevo delivery
uses the official HTTPS API, an eight-second timeout and at most one retry for
network errors, HTTP 429 and retryable 5xx responses.

Provider response bodies, recipient addresses, tokens and secrets are never
logged or returned to clients. Signup remains fail-closed: provider rejection
returns HTTP 502 with `REGISTRATION_DELIVERY_FAILED`, and the newly created
event and Auth user are removed only after ownership markers are verified.
Partner invitation delivery records a sanitized failure status and returns 502.
Confirmation resend and password recovery retain enumeration-safe public
responses.

## Supported transactional flows

- owner signup confirmation;
- owner confirmation resend through the selected application provider;
- password recovery through the selected application provider;
- partner invitation and controlled resend;
- IT, EN, ES, FR and DE confirmation/recovery copy;
- HTTPS callbacks, internal redirect validation, PKCE callback handling and
  escaped HTML.

## Residual risk

Deliverability is lower than with an authenticated project domain. This is a
documented, non-blocking temporary risk. The permanent remediation is to
delegate the owned domain to authoritative DNS and authenticate it with SPF,
DKIM and DMARC before switching the verified sender.
