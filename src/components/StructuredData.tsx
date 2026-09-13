import Script from 'next/script';
import { BRAND_NAME, getSiteUrl } from '@/config/brand';
import { getLocale, getTranslations } from 'next-intl/server';

export async function JsonLd() {
  const SITE_URL = getSiteUrl();
  const locale = await getLocale();
  const t = await getTranslations('milestone9.runtime.structuredData');

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": BRAND_NAME,
    "description": t('description'),
    "url": SITE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "creator": {
      "@type": "Organization",
      "name": BRAND_NAME,
      "url": SITE_URL
    },
    "featureList": [
      t('features.budget'),
      t('features.guests'),
      t('features.timeline'),
      t('features.documents')
    ],
    "inLanguage": locale,
  };

  return (
    <Script
      id="json-ld-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function WebsiteSchema() {
  const SITE_URL = getSiteUrl();
  const locale = await getLocale();

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND_NAME,
    "url": SITE_URL,
    "inLanguage": [locale]
  };

  return (
    <Script
      id="json-ld-website"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const SITE_URL = getSiteUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/icon.svg`,
    "sameAs": [
      // Aggiungi profili social quando disponibili per migliorare l'entity matching
    ]
  };

  return (
    <Script
      id="json-ld-organization"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
