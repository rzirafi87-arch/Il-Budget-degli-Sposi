"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/timeline", label: "Timeline", icon: "📅" },
  { href: "/budget", label: "Budget", icon: "💰" },
  { href: "/invitati", label: "Invitati", icon: "👥" },
  { href: "/formazione-tavoli", label: "Tavoli", icon: "🪑" },
  { href: "/spese", label: "Spese", icon: "💸" },
  { href: "/entrate", label: "Entrate", icon: "💵" },
  { href: "/fornitori", label: "Fornitori", icon: "🏢" },
  { href: "/ricevimento/location", label: "Ricevimento", icon: "🏛️" },
  { href: "/cerimonia/chiesa", label: "Cerimonia", icon: "⛪" },
  { href: "/atelier", label: "Atelier", icon: "👗" },
  { href: "/preferiti", label: "Preferiti", icon: "❤️" },
  { href: "/documenti", label: "Documenti", icon: "📄" },
  { href: "/lista-nozze", label: "Lista Nozze", icon: "🎁" },
  { href: "/wedding-planner", label: "Wedding Planner", icon: "📋" },
  { href: "/musica-cerimonia", label: "Musica Cerimonia", icon: "🎵" },
  { href: "/musica-ricevimento", label: "Musica Ricevimento", icon: "🎶" },
  { href: "/cose-matrimonio", label: "Cose Matrimonio", icon: "🎪" },
  { href: "/save-the-date", label: "Save the Date", icon: "💌" },
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
                "px-4 py-2 rounded-full border text-sm transition-colors font-medium flex items-center gap-2",
                active
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white/70 border-gray-200 hover:bg-gray-50 text-gray-700"
              )}
              style={active ? { background: "var(--color-sage)" } : {}}
              title={t.label}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
        <span className="ml-auto select-none">▴</span>
      </div>

      {/* Mobile Navigation - menu a tendina GRANDE e touch-friendly */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-4 text-white rounded-xl shadow-lg active:scale-95 transition-transform border border-gray-300"
          style={{ background: "linear-gradient(135deg, var(--color-sage) 0%, #8a9d84 100%)" }}
        >
          <span className="font-bold text-base flex items-center gap-2">
            <span>{currentTab?.icon || "📋"}</span>
            <span>{currentTab?.label || "Menu Navigazione"}</span>
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
                      "block px-5 py-4 text-base font-semibold border-b border-gray-200 last:border-b-0 transition-all active:scale-95",
                      active
                        ? "text-white"
                        : "hover:bg-gray-50 active:bg-gray-100 text-gray-700"
                    )}
                    style={active ? { background: "var(--color-sage)" } : {}}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <span>{t.label}</span>
                      {active && <span className="ml-auto">✓</span>}
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
