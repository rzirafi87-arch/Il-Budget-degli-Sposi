import { getSiteUrl } from "@/config/brand";
import { locales } from "@/i18n/config";
import type { MetadataRoute } from "next";

const SITE_URL = getSiteUrl();
const PUBLIC_PATHS = ["", "/chi-siamo", "/come-funziona", "/contatti", "/fornitori", "/atelier", "/fotografi", "/fiorai", "/beauty", "/gioiellerie", "/wedding-planner", "/location", "/chiese", "/privacy-policy", "/cookie-policy", "/termini-servizio"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/", ...locales.flatMap((locale) => PUBLIC_PATHS.map((path) => `/${locale}${path}`))],
      disallow: ["/*/auth", "/*/dashboard", "/*/select-event-type", "/*/profilo", "/*/idea-di-budget", "/*/save-the-date", "/*/appuntamenti", "/*/budget", "/*/contabilita", "/*/invitati", "/*/preferiti", "/*/timeline", "/*/lista-nozze", "/*/formazione-tavoli", "/*/documenti", "/*/admin", "/api/my/*", "/api/sync/*", "/api/seed/*"],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL,
  };
}
