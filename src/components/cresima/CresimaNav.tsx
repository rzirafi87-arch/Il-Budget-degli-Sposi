"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { locales } from "@/i18n/config";

export default function CresimaNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("milestone9.runtime.confirmationNav");
  const normalizedPath = React.useMemo(() => {
    if (!pathname) return "/";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && locales.includes(segments[0] as (typeof locales)[number])) {
      segments.shift();
    }
    return `/${segments.join("/")}` || "/";
  }, [pathname]);
  const items = [
    { href: "/cresima", label: t("overview") },
    { href: "/cresima/timeline", label: t("timeline") },
    { href: "/cresima/idea-di-budget", label: t("budgetIdea") },
    { href: "/cresima/invitati", label: t("guests") },
    { href: "/cresima/budget", label: t("budget") },
  ];

  return (
    <nav className="mb-6">
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const active = normalizedPath.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={`/${locale}${it.href}`}
                className={`px-4 py-2 rounded-full border text-sm transition-colors font-medium ${
                  active
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white/70 border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
                style={active ? { background: "var(--color-sage)" } : {}}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
