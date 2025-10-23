"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budget",    label: "Budget" },
  { href: "/invitati",  label: "Invitati" },
  { href: "/spese",     label: "Spese" },
  { href: "/entrate",   label: "Entrate" },
  { href: "/fornitori", label: "Fornitori" },
  { href: "/location",  label: "Location" },
  { href: "/chiese",    label: "Chiese" },
  { href: "/wedding-planner", label: "Wedding Planner" },
  { href: "/musica-cerimonia", label: "Musica Cerimonia" },
  { href: "/musica-ricevimento", label: "Musica Ricevimento" },
  { href: "/cose-matrimonio", label: "Cose da Matrimonio" },
  { href: "/save-the-date", label: "Save the Date" },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 items-center">
      {tabs.map(t => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "px-4 py-2 rounded-full border text-sm",
              active
                ? "bg-[#A3B59D]/70 text-white border-[#A3B59D]" // verde salvia soft
                : "bg-white/70 border-gray-200 hover:bg-gray-50"
            )}
          >
            {t.label}
          </Link>
        );
      })}
      {/* freccetta placeholder come nello screen */}
      <span className="ml-auto select-none">▴</span>
    </nav>
  );
}
