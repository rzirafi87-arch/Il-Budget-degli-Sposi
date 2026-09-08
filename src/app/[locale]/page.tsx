import LandingAuthRedirect from "@/components/public/LandingAuthRedirect";
import PublicLanding from "@/components/public/PublicLanding";
import { BRAND_NAME, getSiteUrl } from "@/config/brand";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale?: string }>;
};

function resolveLocale(value?: string): Locale {
  return locales.includes((value || defaultLocale) as Locale)
    ? ((value || defaultLocale) as Locale)
    : defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "landing.seo" });
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/${locale}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((item) => [item, `${siteUrl}/${item}`])),
        "x-default": `${siteUrl}/${defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: BRAND_NAME,
      title: t("title"),
      description: t("description"),
      locale: "it_IT",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/twitter-image"],
    },
  };
}

export default async function LocaleHome({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  return <><LandingAuthRedirect locale={locale} /><PublicLanding locale={locale} /></>;
}
