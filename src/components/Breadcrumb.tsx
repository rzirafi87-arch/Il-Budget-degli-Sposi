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
  return (
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
  );
}
