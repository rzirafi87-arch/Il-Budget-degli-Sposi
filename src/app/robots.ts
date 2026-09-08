import { getSiteUrl } from "@/config/brand";
import type { MetadataRoute } from "next";

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/it",
          "/chi-siamo",
          "/come-funziona",
          "/contatti",
          "/fornitori",
          // Pagine categoria fornitori
          "/atelier",
          "/fotografi",
          "/fiorai",
          "/beauty",
          "/gioiellerie",
          "/wedding-planner",
          "/location",
          "/chiese",
          "/privacy-policy",
          "/cookie-policy",
          "/termini-servizio",
        ],
        disallow: [
          "/*/auth",
          "/*/dashboard",
          "/*/select-event-type",
          "/*/profilo",
          "/*/idea-di-budget",
          "/*/save-the-date",
          "/*/appuntamenti",
          "/dashboard",
          "/budget",
          "/contabilita",
          "/invitati",
          "/preferiti",
          "/timeline",
          "/lista-nozze",
          "/formazione-tavoli",
          "/documenti",
          "/api/my/*",
          "/api/sync/*",
          "/api/seed/*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
