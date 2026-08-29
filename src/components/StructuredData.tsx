import Script from 'next/script';
import { BRAND_NAME, BRAND_SITE_URL } from '@/config/brand';

export function JsonLd() {
  const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": BRAND_NAME,
    "description": "Applicazione web per organizzare budget, invitati, attività, fornitori e documenti del matrimonio.",
    "url": SITE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "creator": {
      "@type": "Organization",
      "name": BRAND_NAME,
      "url": SITE_URL
    },
    "featureList": [
      "Gestione budget matrimonio",
      "Gestione invitati",
      "Timeline eventi",
      "Gestione documenti"
    ],
    "inLanguage": "it-IT",
  };

  return (
    <Script
      id="json-ld-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND_NAME,
    "url": SITE_URL,
    "inLanguage": ["it-IT", "en", "es-MX"]
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
  const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

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
