"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { locales } from "@/i18n/config";

export default function CresimaNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const normalizedPath = React.useMemo(() => {
    if (!pathname) return "/";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && locales.includes(segments[0] as (typeof locales)[number])) {
      segments.shift();
    }
    return `/${segments.join("/")}` || "/";
  }, [pathname]);
  const items = [
    { href: "/cresima", label: "Panoramica" },
    { href: "/cresima/timeline", label: "Timeline" },
    { href: "/cresima/idea-di-budget", label: "Idea di budget" },
    { href: "/cresima/invitati", label: "Invitati" },
    { href: "/cresima/budget", label: "Budget" },
  ];

  return (
    <nav className="mb-6">
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const active = normalizedPath.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                locale={locale}
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
