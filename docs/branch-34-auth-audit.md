# Branch 34 — Auth, session, email and profile audit

## Decisions

- Normal signup uses a signup-confirmation link; it is not presented as an administrative invitation or an automatic-login flow.
- Partner email remains an invitation because the partner is invited to an owner-created event.
- Profile authorization is always resolved from the verified bearer user ID. `user_metadata` is display-only and is not used for authorization.
- Profile email is read-only. Email change needs a separately designed double-confirmation flow.
- Confirmation resend and password recovery return neutral messages to reduce account enumeration and reuse the Branch 33 rate-limit infrastructure.
- Custom SMTP was not introduced. The existing Resend provider and branded sender configuration are retained; SPF, DKIM, DMARC and delivery/bounce status remain provider/dashboard operational checks.
- `/api/my/wedding/localized` does not read auth, session or profile data. Its historical schema error is separate debt; its public service-role-backed legacy design should be reviewed with the future multi-event work, not refactored here.

## Route auth matrix

| Route | Public | Auth required | Notes |
|---|---:|---:|---|
| `/[locale]` | Yes | No | Landing |
| `/[locale]/auth` | Yes | No | Login, signup, confirmation resend, recovery request |
| `/auth/callback` | Yes | No | Exchanges one-time code; internal redirects only |
| `/[locale]/reset-password` | Link session | Yes | Recovery session required to update password |
| `/[locale]/dashboard` | No | Yes | User event data |
| `/[locale]/budget` | No | Yes | Owner event data |
| `/[locale]/invitati` | No | Yes | Owner event data |
| `/[locale]/fornitori` | Catalog mixed | Varies | Public catalog; saved selections owner-only |
| `/[locale]/location` | Catalog mixed | Varies | Public catalog; saved selections owner-only |
| `/[locale]/chiese` | Catalog mixed | Varies | Public catalog; saved selections owner-only |
| `/[locale]/timeline` | No | Yes | Owner event data |
| `/[locale]/documenti` | No | Yes | Owner event data |
| `/[locale]/profilo` | No | Yes | Current profile only |

## API auth matrix

| API group | Classification | Enforcement |
|---|---|---|
| `/api/auth/register`, `resend`, `recovery` | Public, rate-limited | Neutral responses; validated input |
| `/api/catalog/*`, `/api/churches`, `/api/locations`, `/api/suppliers` | Public | Branch 33 public rate limit |
| `/api/my/profile` | Authenticated, owner-only | Verified bearer UID and exact profile ID |
| `/api/my/*` event data | Authenticated, owner-only | Bearer validation plus event ownership/RLS |
| `/api/event/resolve` | Authenticated | Verified bearer; existing first-event behavior retained |
| `/api/stripe/webhook`, cron/sync operations | Service/webhook | Secret/signature or service-role path |
| `/api/my/wedding/localized` | Public legacy | No auth interaction; separate debt |

## Environment and provider checklist

Required public names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Server-only names: `SUPABASE_SERVICE_ROLE_KEY` (legacy alias accepted), `RESEND_API_KEY`, `RESEND_FROM`. Values must remain secret and must not be logged. Preview, Production and CI must expose the same required names with environment-appropriate values.

Supabase dashboard operational verification: email provider enabled; Site URL equals the canonical production origin; localhost and Vercel Preview origins are explicitly allowlisted where needed; confirmation/invite/recovery redirects point to `/auth/callback`; sender/domain authentication and bounce/throttle logs are checked without exposing recipient data.
