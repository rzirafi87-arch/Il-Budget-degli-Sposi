"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/budget",    label: "Budget" },
  { href: "/invitati",  label: "Invitati" },
  { href: "/formazione-tavoli", label: "Formazione Tavoli" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const currentTab = tabs.find(t => pathname.startsWith(t.href));

  return (
    <nav className="relative">
      {/* Desktop Navigation - nascosto su mobile */}
      <div className="hidden md:flex flex-wrap gap-2 items-center">
        {tabs.map(t => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "px-4 py-2 rounded-full border text-sm transition-colors",
                active
                  ? "bg-[#A3B59D]/70 text-white border-[#A3B59D]"
                  : "bg-white/70 border-gray-200 hover:bg-gray-50"
              )}
            >
              {t.label}
            </Link>
          );
        })}
        <span className="ml-auto select-none">▴</span>
      </div>

      {/* Mobile Navigation - menu a tendina GRANDE e touch-friendly */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-[#8a9d84] to-[#7a8d74] text-white rounded-xl shadow-lg active:scale-95 transition-transform border-2 border-gray-700"
        >
          <span className="font-bold text-base">
            📋 {currentTab?.label || "Menu Navigazione"}
          </span>
          <svg
            className={clsx(
              "w-6 h-6 transition-transform",
              mobileMenuOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu mobile - GRANDE e leggibile */}
        {mobileMenuOpen && (
          <>
            {/* Overlay per chiudere il menu cliccando fuori */}
            <div 
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-3 border-gray-700 rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
              {tabs.map(t => {
                const active = pathname.startsWith(t.href);
                return (
                  <Link
                    key={t.href}
                    href={t.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "block px-5 py-4 text-base font-bold border-b-2 border-gray-200 last:border-b-0 transition-all active:scale-95",
                      active
                        ? "bg-[#8a9d84] text-white"
                        : "hover:bg-gray-100 active:bg-gray-200 text-gray-800"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {active && "✓"} {t.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
