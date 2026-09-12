import { AppSettingsProvider } from "@/app/(providers)/app-settings";
import ClientLayoutShell from "@/components/ClientLayoutShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import EventModuleGuard from "@/components/EventModuleGuard";
import ConsentAwareAnalytics from "@/components/ConsentAwareAnalytics";
import { OrganizationSchema, WebsiteSchema } from "@/components/StructuredData";
import { BRAND_NAME, getSiteUrl } from "@/config/brand";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getOpenGraphLocale } from "@/i18n/localeFormat";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages as getIntlMessages, getTranslations } from "next-intl/server";
import "../globals.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type MetadataParams = { params: Promise<{ locale?: string }> };

function resolveLocale(value?: string): Locale {
  return locales.includes((value || defaultLocale) as Locale) ? ((value || defaultLocale) as Locale) : defaultLocale;
}

export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "landing.seo" });
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${locale}`;
  const languageAlternates = Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}`]));

  return {
    applicationName: BRAND_NAME,
    title: { default: t("title"), template: `%s | ${BRAND_NAME}` },
    description: t("description"),
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    authors: [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    category: "Lifestyle",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: BRAND_NAME,
      title: t("title"),
      description: t("description"),
      images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: BRAND_NAME }],
      locale: getOpenGraphLocale(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${siteUrl}/twitter-image`],
    },
    alternates: {
      canonical,
      languages: { ...languageAlternates, "x-default": `${siteUrl}/${defaultLocale}` },
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

type LocaleLayoutProps = { children: React.ReactNode; params: Promise<{ locale?: string }> };

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getIntlMessages({ locale });
  if (!messages || Object.keys(messages).length === 0) throw new Error(`Missing translations for locale ${locale}`);

  return (
    <>
      <WebsiteSchema />
      <OrganizationSchema />
      <ConsentAwareAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      <ThemeProvider>
        <AppSettingsProvider initialLocale={locale}>
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Rome">
            <ClientLayoutShell><EventModuleGuard>{children}</EventModuleGuard></ClientLayoutShell>
          </NextIntlClientProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </>
  );
}
