import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://il-budget-degli-sposi-kbg1.vercel.app"
    : "http://localhost:3000");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/welcome",
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
