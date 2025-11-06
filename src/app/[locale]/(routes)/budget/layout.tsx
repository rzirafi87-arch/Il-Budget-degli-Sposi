"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { locales } from "@/i18n/config";

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const normalizedPath = React.useMemo(() => {
    if (!pathname) return "/budget";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && locales.includes(segments[0] as (typeof locales)[number])) {
      segments.shift();
    }
    return `/${segments.join("/")}` || "/budget";
  }, [pathname]);
  const isIdea = normalizedPath.startsWith("/idea-di-budget");

  return (
    <section className="pt-6">
      <h2 className="font-serif text-3xl mb-2 text-gray-800">Budget</h2>
      {/* Tabs in stile ContabilitÃ  */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-1" style={{ borderColor: "var(--border-soft)" }}>
        <Link
          href="/budget"
          locale={locale}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all rounded-t-xl border focus-ring-sage ${
            !isIdea ? "text-white shadow-soft" : "shadow-soft-sm"
          }`}
          style={
            !isIdea
              ? {
                  background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
                  borderColor: "var(--accent-sage-600)",
                }
              : {
                  background: "var(--surface-elevated)",
                  borderColor: "var(--border-soft)",
                  color: "var(--text-secondary)",
                }
          }
        >
          Spese approvate
        </Link>
        <Link
          href="/idea-di-budget"
          locale={locale}
          className={`px-4 sm:px-6 py-3 font-semibold transition-all rounded-t-xl border focus-ring-sage ${
            isIdea ? "text-white shadow-soft" : "shadow-soft-sm"
          }`}
          style={
            isIdea
              ? {
                  background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
                  borderColor: "var(--accent-sage-600)",
                }
              : {
                  background: "var(--surface-elevated)",
                  borderColor: "var(--border-soft)",
                  color: "var(--text-secondary)",
                }
          }
        >
          Idea di spesa
        </Link>
      </div>
      {children}
    </section>
  );
}
