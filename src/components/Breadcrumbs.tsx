"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n/config";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("milestone9.breadcrumbs");

  const pathLabels: Record<string, string> = {
    "": t("home"), dashboard: t("dashboard"), timeline: t("timeline"), budget: t("budget"), invitati: t("guests"),
    "formazione-tavoli": t("tables"), spese: t("expenses"), entrate: t("income"), fornitori: t("vendors"), ricevimento: t("reception"),
    location: t("receptionVenue"), cerimonia: t("ceremony"), chiesa: t("ceremonyVenue"), chiese: t("ceremonyVenue"),
    preferiti: t("favorites"), documenti: t("documents"), "lista-nozze": t("giftList"), "wedding-planner": "Wedding Planner",
    "musica-cerimonia": t("ceremonyMusic"), "musica-ricevimento": t("receptionMusic"), "cose-matrimonio": t("weddingIdeas"),
    "save-the-date": "Save the Date",
    auth: t("signIn"), contatti: t("contacts"),
  };

  // Costruisci i breadcrumbs dal path
  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment, index, arr) => !(index === 0 && locales.includes(segment as (typeof locales)[number])));

  if (pathSegments.length === 0) {
    return null; // Non mostrare breadcrumbs sulla homepage
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: t("home"), href: `/${locale}` }];

  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    breadcrumbs.push({
      label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : `/${locale}${currentPath}`,
    });
  });

  return (
    <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto pb-2" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="flex items-center gap-2 whitespace-nowrap">
          {crumb.href ? (
            <Link href={crumb.href} locale={locale} className="text-gray-600 hover:text-[#A6B5A0] transition-colors font-medium">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-bold">{crumb.label}</span>
          )}

          {index < breadcrumbs.length - 1 && <span className="text-gray-400" aria-hidden>›</span>}
        </span>
      ))}
    </nav>
  );
}
