import ClientLayoutShell from "@/components/ClientLayoutShell";
import { GoogleAnalytics } from "@/components/GoogleTracking";
import { JsonLd, LocalBusinessSchema, OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { getMessages } from "@/i18n/getMessages";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://il-budget-degli-sposi-kbg1.vercel.app"
    : "http://localhost:3000");

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type MetadataParams = {
  params: { locale?: string };
};

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const locale = locales.includes((params.locale || defaultLocale) as Locale)
    ? (params.locale as Locale)
    : defaultLocale;

  const i18n = {
    it: {
      title: "MYBUDGETEVENTO - Organizza il Tuo Evento",
      description:
        "Organizza il tuo evento con MYBUDGETEVENTO: gestisci il budget, trova fornitori, location e chiese in tutta Italia. Strumenti gratuiti per pianificare ogni occasione.",
      keywords: [
        "budget matrimonio",
        "organizzare matrimonio",
        "wedding planner",
        "location matrimonio",
        "fornitori matrimonio",
        "chiese matrimonio",
        "gestione budget nozze",
        "pianificazione matrimonio",
        "matrimonio italia",
        "calcolo budget matrimonio",
      ],
      ogDescription:
        "Strumenti gratuiti per organizzare il tuo evento: gestione budget, fornitori, location e molto altro.",
    },
    en: {
      title: "MYBUDGETEVENTO - Plan Your Event",
      description:
        "Plan your event with MYBUDGETEVENTO: manage budget, find suppliers, venues and churches. Free tools to plan every occasion.",
      keywords: [
        "wedding budget",
        "plan wedding",
        "wedding planner",
        "wedding venues",
        "wedding suppliers",
        "church wedding",
        "wedding budget management",
        "wedding planning",
        "italy wedding",
        "wedding budget calculator",
      ],
      ogDescription:
        "Free tools to organize your wedding: budget management, suppliers, venues and more.",
    },
  } as const;

  const L = i18n[(locale === "en" ? "en" : "it")];

  return {
    applicationName: "MYBUDGETEVENTO",
    title: {
      default: L.title,
      template: "%s | MYBUDGETEVENTO",
    },
    description: L.description,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#3f7055" },
      { media: "(prefers-color-scheme: dark)", color: "#1b1a19" },
    ],
    keywords: [...L.keywords],
    authors: [{ name: "MYBUDGETEVENTO" }],
    creator: "MYBUDGETEVENTO",
    publisher: "MYBUDGETEVENTO",
    category: "Lifestyle",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: "MYBUDGETEVENTO",
      title: L.title,
      description: L.ogDescription,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "MYBUDGETEVENTO",
        },
      ],
      locale: locale === "en" ? "en_US" : "it_IT",
    },
    twitter: {
      card: "summary_large_image",
      title: L.title,
      description: L.ogDescription,
      images: [`${SITE_URL}/twitter-image`],
    },
    verification: {
      google: "google-site-verification-code-here",
    },
    alternates: {
      canonical: `/${locale}`,
    },
    metadataBase: new URL(SITE_URL),
  } satisfies Metadata;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3f7055",
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: { locale?: string };
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = locales.includes((params.locale || defaultLocale) as Locale)
    ? (params.locale as Locale)
    : defaultLocale;

  try {
    const messages = await getMessages(locale);
    if (!messages || Object.keys(messages).length === 0) {
      throw new Error(`Missing translations for locale ${locale}`);
    }

    let supabaseOrigin: string | null = null;
    try {
      const u = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
      supabaseOrigin = u ? `${u.protocol}//${u.host}` : null;
    } catch {
      supabaseOrigin = null;
    }

    return (
      <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${playfair.variable} ${inter.variable}`}>
        <head>
          <JsonLd />
          <LocalBusinessSchema />
          <WebsiteSchema />
          <OrganizationSchema />
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="theme-color" content="#3f7055" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          {supabaseOrigin ? <link rel="preconnect" href={supabaseOrigin} crossOrigin="" /> : null}
          <link rel="icon" type="image/png" sizes="192x192" href="/backgrounds/icon-192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/backgrounds/icon-512.png" />
          <link rel="apple-touch-icon" href="/backgrounds/icon-192.png" />
          {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
          <script
            dangerouslySetInnerHTML={{
              __html: `if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js');
              });
            }`,
            }}
          />
        </head>
        <body className="min-h-screen antialiased" style={{ background: "var(--color-cream)", color: "var(--foreground)" }}>
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Rome">
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error(error);
    notFound();
    return null;
  }
}
