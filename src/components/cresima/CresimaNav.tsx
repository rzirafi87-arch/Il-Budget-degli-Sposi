"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CresimaNav() {
  const pathname = usePathname();
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
          const active = pathname ? pathname.startsWith(it.href) : false;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
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
