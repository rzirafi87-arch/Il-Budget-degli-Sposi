import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? "https://il-budget-degli-sposi-kbg1.vercel.app"
    : "http://localhost:3000");

const pages: string[] = [
  "/",
  "/welcome",
  "/chi-siamo",
  "/come-funziona",
  "/contatti",
  "/fornitori",
  
  "/location",
  "/chiese",
  // Categorie fornitori
  "/atelier",
  "/fotografi",
  "/fiorai",
  "/beauty",
  "/gioiellerie",
  "/wedding-planner",
  "/privacy-policy",
  "/cookie-policy",
  "/termini-servizio",
  "/save-the-date",
  "/musica-cerimonia",
  "/musica-ricevimento",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date();
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: lastMod,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
