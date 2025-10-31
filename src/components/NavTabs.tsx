"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const LABELS = {
  it: {
    dashboard: "Dashboard",
    timeline: "Timeline",
    budget: "Budget",
    weddingThings: "Cose Matrimonio",
    saveTheDate: "Save the Date",
    guests: "Invitati",
    accounting: "Contabilità",
    suppliers: "Fornitori",
    location: "Location",
    churches: "Chiese",
    documents: "Documenti",
    giftList: "Lista Nozze",
    favorites: "Preferiti",
    suggestions: "Suggerimenti & Consigli",
  },
  es: {
    dashboard: "Panel",
    timeline: "Cronología",
    budget: "Presupuesto",
    weddingThings: "Cosas de la boda",
    saveTheDate: "Save the Date",
    guests: "Invitados",
    accounting: "Contabilidad",
    suppliers: "Proveedores",
    location: "Locación",
    churches: "Iglesias",
    documents: "Documentos",
    giftList: "Lista de regalos",
    favorites: "Favoritos",
    suggestions: "Sugerencias & Consejos",
  },
  en: {
    dashboard: "Dashboard",
    timeline: "Timeline",
    budget: "Budget",
    weddingThings: "Wedding Things",
    saveTheDate: "Save the Date",
    guests: "Guests",
    accounting: "Accounting",
    suppliers: "Suppliers",
    location: "Location",
    churches: "Churches",
    documents: "Documents",
    giftList: "Gift List",
    favorites: "Favorites",
    suggestions: "Suggestions & Tips",
  },
};

function getLang() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lang") || "it";
  }
  return "it";
}

const lang = typeof window !== "undefined" ? getLang() : "it";

type LangKey = keyof typeof LABELS;
const safeLang = (lang as LangKey);

const tabs = [
  { href: "/dashboard", label: LABELS[safeLang].dashboard, icon: "📊" },
  { href: "/timeline", label: LABELS[safeLang].timeline, icon: "📅" },
  { href: "/budget", label: LABELS[safeLang].budget, icon: "💰" },
  { href: "/cose-matrimonio", label: LABELS[safeLang].weddingThings, icon: "🎪" },
  { href: "/save-the-date", label: LABELS[safeLang].saveTheDate, icon: "💌" },
  { href: "/invitati", label: LABELS[safeLang].guests, icon: "👥" },
  { href: "/contabilita", label: LABELS[safeLang].accounting, icon: "📒" },
  { href: "/fornitori", label: LABELS[safeLang].suppliers, icon: "🏢" },
  { href: "/location", label: LABELS[safeLang].location, icon: "📍" },
  { href: "/chiese", label: LABELS[safeLang].churches, icon: "⛪" },
  { href: "/documenti", label: LABELS[safeLang].documents, icon: "📄" },
  { href: "/lista-nozze", label: LABELS[safeLang].giftList, icon: "🎁" },
  { href: "/preferiti", label: LABELS[safeLang].favorites, icon: "❤️" },
  { href: "/suggerimenti", label: LABELS[safeLang].suggestions, icon: "💡" },
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
