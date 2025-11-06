# i18n architecture blueprint

Questa guida documenta l'architettura multi-lingua/multi-paese proposta per il progetto.
Si compone di tre blocchi principali:

1. **Schema canonico** con contenuti neutrali + traduzioni (file [`supabase-i18n-canonical-schema.sql`](../supabase-i18n-canonical-schema.sql)).
2. **Seed iniziale** per lingue, paesi, categorie e timeline (script [`scripts/seed-i18n.mjs`](../scripts/seed-i18n.mjs)).
3. **Helper applicativi** per leggere i dati localizzati con fallback (modulo [`src/lib/i18n/queries.ts`](../src/lib/i18n/queries.ts)).

## 1. Schema canonico (Supabase/Postgres)

Esegui `supabase-i18n-canonical-schema.sql` dopo aver abilitato l'estensione `pgcrypto`. Il file crea lo schema `app_i18n` con le seguenti tabelle chiave:

| Tabella | Scopo |
| --- | --- |
| `app_i18n.locales` | Registry lingue disponibili (`code`, `direction`, flag `enabled`). |
| `app_i18n.countries` | Varianti paese (`default_locale`, flag `enabled`). |
| `app_i18n.event_types` | Tipi evento neutri (colonna `code` unica). |
| `app_i18n.event_type_translations` | Traduzioni nome/descrizione per lingua. |
| `app_i18n.event_type_variants` | Overrides specifici per paese (payload JSON). |
| `app_i18n.categories` + `category_translations` | Macro-categorie neutrali e loro traduzioni. |
| `app_i18n.subcategories` + `subcategory_translations` | Sotto-categorie e traduzioni. |
| `app_i18n.event_timelines` + `event_timeline_translations` | Timeline neutra + copy localizzato. |

La struttura è progettata per:

- Aggiungere una lingua inserendo solo righe in `*_translations`.
- Gestire differenze per paese tramite una singola riga in `event_type_variants` con JSON strutturato (`adjust`, `add`, `rename`, ecc.).
- Mantenere dati neutrali (categorie, timeline) riutilizzabili da tutte le lingue.

## 2. Seed iniziale multi-lingua

Lo script `scripts/seed-i18n.mjs` popola automaticamente lo schema con:

- 9 lingue (it-IT, en-GB, es-ES, fr-FR, de-DE, ar, ja-JP, zh-CN, hi-IN) e relative direzioni LTR/RTL.
- 10 paesi principali con locale di default (IT, MX, JP, US, FR, DE, ES, GB, CN, IN).
- Tipi evento `WEDDING`, `BAPTISM`, `GRADUATION` con traduzioni complete in italiano e inglese.
- Categorie, sottocategorie e timeline per i tre eventi.
- Overrides JSON per matrimonio in Messico e Giappone (esempi concreti di tradizioni e timeline locali).

### Come eseguirlo

1. Configura `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE`.
2. Lancia lo script: `node scripts/seed-i18n.mjs` (ripetibile, usa `upsert`).
3. Verifica i dati con `select * from app_i18n.locales` e `app_i18n.event_type_translations`.

## 3. Helper Next.js / Supabase

Il modulo `src/lib/i18n/queries.ts` contiene due funzioni asincrone pensate per l'uso lato server (RSC/route handlers):

```ts
const categories = await fetchLocalizedCategories(supabase, {
  eventTypeCode: "WEDDING",
  locale: currentLocale,
  fallbackLocale: "en-GB", // opzionale (default en-GB)
});

const timeline = await fetchLocalizedTimeline(supabase, {
  eventTypeCode: "WEDDING",
  locale: currentLocale,
});
```

Le funzioni gestiscono automaticamente:

- Risoluzione dell'`event_type_id` partendo dal codice.
- Join con traduzioni e fallback (ritorna `fallbackUsed: true` quando serve il locale di riserva).
- Ordinamento per `sort` e conversione `offset_days → offsetDays`.

## 4. Routing Next.js (App Router + next-intl)

Per attivare il supporto multi-lingua lato frontend si suggerisce di:

1. Creare routing segmentato `/app/[locale]/...` con middleware dedicato.
2. Usare `next-intl` con provider server-side.

Esempio di `middleware.ts` minimale:

```ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["it-IT", "en-GB", "es-ES", "fr-FR", "de-DE", "ar", "ja-JP", "zh-CN", "hi-IN"],
  defaultLocale: "it-IT",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

Esempio di `src/app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function RootLayout({ children, params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Esempio di switcher client (`components/LocaleSwitcher.tsx`):

```tsx
"use client";
import { usePathname, useRouter } from "next/navigation";

const locales = ["it-IT", "en-GB", "es-ES", "fr-FR", "de-DE", "ar", "ja-JP", "zh-CN", "hi-IN"];

export function LocaleSwitcher({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={current}
      onChange={(event) => {
        const next = event.target.value;
        const segments = pathname.split("/").filter(Boolean);
        segments[0] = next;
        router.push(`/${segments.join("/")}` || "/");
      }}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </select>
  );
}
```

### Consigli pratici

- Mantieni `messages/*.json` come fallback UI (copy statiche) e sposta contenuti dinamici nel DB.
- Quando aggiungi una lingua, popola solo `app_i18n.locales` e relative traduzioni (nessun duplicato dati).
- Gli overrides JSON possono includere chiavi `timeline.add`, `timeline.adjust`, `categories.rename`, `categories.add` con la stessa struttura usata nel seed.
- Puoi serializzare gli overrides sul frontend e applicarli prima del render (es. arricchire timeline con nuove entries specifiche del paese).

Con questi tre blocchi ottieni una base pronta per lanciare onboarding multi-lingua/multi-paese e scalare facilmente verso nuovi mercati senza duplicare pagine.
