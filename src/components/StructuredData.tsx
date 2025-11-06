import Script from 'next/script';

export function JsonLd() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? "https://il-budget-degli-sposi-kbg1.vercel.app"
      : "http://localhost:3000");

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
  "name": "MYBUDGETEVENTO",
    "description": "Strumenti gratuiti per organizzare il matrimonio: gestione budget, fornitori, location e chiese in tutta Italia",
    "url": SITE_URL,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    },
    "creator": {
      "@type": "Organization",
  "name": "MYBUDGETEVENTO",
      "url": SITE_URL
    },
    "featureList": [
      "Gestione budget matrimonio",
      "Database fornitori matrimonio",
      "Ricerca location per ricevimenti",
      "Database chiese per cerimonie",
      "Wedding planner integrato",
      "Gestione invitati",
      "Timeline eventi",
      "Generazione PDF partecipazioni"
    ],
    "inLanguage": "it-IT",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/esplora-fornitori?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Script
      id="json-ld-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function LocalBusinessSchema() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? "https://il-budget-degli-sposi-kbg1.vercel.app"
      : "http://localhost:3000");

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
  "name": "MYBUDGETEVENTO",
    "description": "Servizio gratuito di pianificazione matrimoni online",
    "url": SITE_URL,
    "areaServed": {
      "@type": "Country",
      "name": "Italy"
    },
    "serviceType": "Wedding Planning Service",
    "priceRange": "Gratuito",
    "availableLanguage": ["it"],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Servizi Matrimonio",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Gestione Budget Matrimonio",
            "description": "Strumento gratuito per gestire il budget del matrimonio"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Database Fornitori",
            "description": "Accesso a oltre 300 fornitori verificati in tutta Italia"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ricerca Location",
            "description": "Database di location per matrimoni con foto e contatti"
          }
        }
      ]
    }
  };

  return (
    <Script
      id="json-ld-local-business"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? "https://il-budget-degli-sposi-kbg1.vercel.app"
      : "http://localhost:3000");

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
  "name": "MYBUDGETEVENTO",
    "url": SITE_URL,
    "inLanguage": "it-IT",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/esplora-fornitori?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
      ? "https://il-budget-degli-sposi-kbg1.vercel.app"
      : "http://localhost:3000");

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
  "name": "MYBUDGETEVENTO",
    "url": SITE_URL,
    "logo": `${SITE_URL}/backgrounds/icon-512.png`,
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
