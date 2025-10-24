import Script from 'next/script'

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Il Budget degli Sposi",
    "description": "Strumenti gratuiti per organizzare il matrimonio: gestione budget, fornitori, location e chiese in tutta Italia",
    "url": "https://il-budget-degli-sposi.vercel.app",
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
      "name": "Il Budget degli Sposi",
      "url": "https://il-budget-degli-sposi.vercel.app"
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
      "target": "https://il-budget-degli-sposi.vercel.app/esplora-fornitori?q={search_term_string}",
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Il Budget degli Sposi",
    "description": "Servizio gratuito di pianificazione matrimoni online",
    "url": "https://il-budget-degli-sposi.vercel.app",
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
