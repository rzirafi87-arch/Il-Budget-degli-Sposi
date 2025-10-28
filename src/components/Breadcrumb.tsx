"use client";

import Link from "next/link";
import clsx from "clsx";

export type Crumb = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: Crumb[];
  className?: string;
};

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  // Structured data for BreadcrumbList JSON-LD
  const siteUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "https://ilbudgetdeglisposi.it";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      ...(item.href
        ? { "item": item.href.startsWith("http") ? item.href : siteUrl + item.href }
        : {})
    }))
  };

  return (
    <>
      <nav className={clsx("mb-4 flex items-center gap-2 text-sm text-gray-600", className)}>
        {items.map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <span>›</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-[#A3B59D] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      {/* BreadcrumbList JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
    </>
  );
}
