# Branch 37 — Languages, feature availability and Coming Soon UX

## Audit result

Italian (`it`) is the canonical message schema and the only locale that currently passes the production-readiness audit. The merged message trees contain 1,362 Italian leaf keys, 1,244 English keys and 391 Spanish keys. Against the Italian schema, English has 521 missing keys and 403 extra/obsolete keys; Spanish has 1,012 missing keys and 41 extra/obsolete keys. English also has one known placeholder mismatch.

Exposing EN or ES as READY would therefore create mixed-language screens. Branch 37 deliberately classifies them as Coming Soon instead of hiding this debt behind an Italian fallback. CI validates every READY language for nested missing keys and placeholder equivalence. The test also records that EN/ES must remain non-selectable while audited gaps exist.

## Canonical precedence and persistence

1. An explicit public locale in the URL wins.
2. Without a locale prefix, the non-sensitive `language` preference cookie is accepted only when its locale is public and READY.
3. Otherwise the production default is `it`.

Only `it` currently satisfies this rule. Known incomplete locale URLs redirect to the same path under `/it`; unknown segments are prefixed with `/it` and resolve normally, including controlled 404 behavior. Coming Soon selections never write URL, profile, cookie, localStorage, country or event data.

`profiles.preferred_locale` means preferred UI language. API updates reject non-selectable values. UI language, event/invitation language and country are separate concepts: changing presentation locale does not update event language or country. Currency remains governed by the existing economic domain and is not inferred from locale.

## Final language matrix

| Language | Code | Exposed | Coverage | Status | Selectable | Public routing | Notes |
|---|---|---:|---:|---|---:|---:|---|
| Italiano | it | Yes | 1,362/1,362 canonical keys | READY | Yes | Yes | Default and canonical schema |
| English | en | Yes | 1,244 leaves; 521 canonical gaps | COMING_SOON | No | No | Redirects to equivalent IT path |
| Español | es | Yes | 391 leaves; 1,012 canonical gaps | COMING_SOON | No | No | Redirects to equivalent IT path |
| Français | fr | Yes | Partial | COMING_SOON | No | No | Visible disabled option |
| Deutsch | de | Yes | Partial | COMING_SOON | No | No | Visible disabled option |
| Русский | ru | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| 中文 | zh | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| 日本語 | ja | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| العربية | ar | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| Português | pt | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| Bahasa Indonesia | id | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| हिन्दी | hi | No | Partial/technical | INTERNAL_ONLY | No | No | Not shown |
| Español (México) | mx | No | Technical country variant | INTERNAL_ONLY | No | No | Country is not a UI locale |
| bn, ur, tr, ko, vi, th | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| pl, nl, el, cs, sv, ro, hu | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| da, fi, no, uk, he, fa | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| ms, fil, sw, af, sq, sr, hr | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| bg, sk, lt, lv, et, sl | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| ka, hy, az, kk, uz, mn | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |
| ne, si, km, lo, my, am, zu, xh | respective code | No | Config-only | INTERNAL_ONLY | No | No | Not shown |

The grouped rows enumerate every configured code; the typed matrix contains 59 unique records and tests enforce that count.

## Feature availability matrix

| Feature | Status | Visible | Selectable | Notes |
|---|---|---:|---:|---|
| Matrimonio | READY | Yes | Yes | Branch 29 capability unchanged |
| Other 17 event types | COMING_SOON | Yes | No | Disabled copy remains localized where exposed |
| Language IT | READY | Yes | Yes | Canonical UI |
| Languages EN/ES | COMING_SOON | Yes | No | Audited incomplete |
| Languages FR/DE | COMING_SOON | Yes | No | Visible disabled options |
| Other languages | INTERNAL_ONLY | No | No | No fake routing |
| Map/search | READY | Yes | Yes | Branch 32 semantics unchanged |
| Theme Light/Dark/System | READY | Yes | Yes | Branch 35 logic unchanged |

## SEO and fallback

Sitemap, `hreflang`, WebSite structured data and public locale generation include only READY locales. Italian is canonical and `x-default`. Robots no longer advertise EN or MX. Fallback prevents crashes, but CI does not allow it to conceal missing keys in a READY locale.

## Regression scope

The change does not modify database schema, current-event resolution, authentication flows, catalog data, map providers, event capability status, theme behavior, carousel assets or the `upload/` directory. Event names and user-entered/catalog canonical data are not translated.
