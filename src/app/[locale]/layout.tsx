import ClientLayoutShell from "@/components/ClientLayoutShell";
import { GoogleAnalytics } from "@/components/GoogleTracking";
import { JsonLd, LocalBusinessSchema, OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

// Fonts are now loaded in app/layout.tsx to avoid duplicating <html>/<body> in nested layouts

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://il-budget-degli-sposi-kbg1.vercel.app"
    : "http://localhost:3000");

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type MetadataParams = {
  params: Promise<{ locale?: string }>;
};

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = locales.includes((resolvedParams.locale || defaultLocale) as Locale)
    ? (resolvedParams.locale as Locale)
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
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/backgrounds/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/backgrounds/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/backgrounds/icon-192.png" }],
    },
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
  params: Promise<{ locale?: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const resolvedParams = await params;
  const locale = locales.includes((resolvedParams.locale || defaultLocale) as Locale)
    ? (resolvedParams.locale as Locale)
    : defaultLocale;

  try {
    const messages = await getMessages(locale);
    if (!messages || Object.keys(messages).length === 0) {
      throw new Error(`Missing translations for locale ${locale}`);
    }

    return (
      <>
        {/* JSON-LD structured data can be rendered in the body; search engines accept it there */}
        <JsonLd />
        <LocalBusinessSchema />
        <WebsiteSchema />
        <OrganizationSchema />
        {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}

        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Rome">
          <ClientLayoutShell>{children}</ClientLayoutShell>
        </NextIntlClientProvider>
      </>
    );
  } catch (error) {
    console.error(error);
    notFound();
    return null;
  }
}
