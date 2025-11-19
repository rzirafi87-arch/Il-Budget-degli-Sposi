import AppSettingsProvider from "@/app/(providers)/app-settings";
import ClientLayoutShell from "@/components/ClientLayoutShell";
import { GoogleAnalytics } from "@/components/GoogleTracking";
import {
  JsonLd,
  LocalBusinessSchema,
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/StructuredData";

import {
  BRAND_DEFAULT_DESCRIPTION,
  BRAND_DEFAULT_DESCRIPTION_EN,
  BRAND_DEFAULT_TITLE,
  BRAND_DEFAULT_TITLE_EN,
  BRAND_NAME,
  BRAND_SITE_URL,
} from "@/config/brand";

import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages as getIntlMessages } from "next-intl/server";
import "../globals.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type MetadataParams = {
  params: Promise<{ locale?: string }>;
};

export async function generateMetadata({
  params,
}: MetadataParams): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = locales.includes(
    (resolvedParams.locale || defaultLocale) as Locale
  )
    ? (resolvedParams.locale as Locale)
    : defaultLocale;

  const i18n = {
    it: {
      title: BRAND_DEFAULT_TITLE,
      description: BRAND_DEFAULT_DESCRIPTION,
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
      title: BRAND_DEFAULT_TITLE_EN,
      description: BRAND_DEFAULT_DESCRIPTION_EN,
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

  const L = i18n[locale === "en" ? "en" : "it"];

  const siteUrl = process.env.SITE_URL || BRAND_SITE_URL;

  return {
    applicationName: BRAND_NAME,
    title: {
      default: L.title,
      template: `%s | ${BRAND_NAME}`,
    },
    description: L.description,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        {
          url: "/backgrounds/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/backgrounds/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      apple: [{ url: "/backgrounds/icon-192.png" }],
    },
    keywords: [...L.keywords],
    authors: [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
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
      url: siteUrl,
      siteName: BRAND_NAME,
      title: L.title,
      description: L.ogDescription,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: BRAND_NAME,
        },
      ],
      locale: locale === "en" ? "en_US" : "it_IT",
    },
    twitter: {
      card: "summary_large_image",
      title: L.title,
      description: L.ogDescription,
      images: [`${siteUrl}/twitter-image`],
    },
    verification: {
      google: "google-site-verification-code-here",
    },
    alternates: {
      canonical: `/${locale}`,
    },
    metadataBase: new URL(siteUrl),
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

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const resolvedParams = await params;
  const locale = locales.includes(
    (resolvedParams.locale || defaultLocale) as Locale
  )
    ? (resolvedParams.locale as Locale)
    : defaultLocale;

  try {
    // getIntlMessages expects an object: { locale }
    const messages = await getIntlMessages({ locale });
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
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}

        <AppSettingsProvider initialLocale={locale}>
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="Europe/Rome"
          >
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </NextIntlClientProvider>
        </AppSettingsProvider>
      </>
    );
  } catch (error) {
    console.error(error);
    // notFound();
    return null;
  }
}
