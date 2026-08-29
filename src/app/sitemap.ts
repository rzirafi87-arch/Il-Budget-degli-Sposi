import { BRAND_SITE_URL } from "@/config/brand";
import { locales } from "@/i18n/config";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || BRAND_SITE_URL;

const pages: string[] = [
  "",
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
  return locales.flatMap((locale) => pages.map((path) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: lastMod,
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  })));
}
