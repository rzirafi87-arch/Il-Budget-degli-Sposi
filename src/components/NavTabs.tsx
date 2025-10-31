﻿"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslations } from "next-intl";

const TABS_ICONS = {
  dashboard: "",
  timeline: "",
  budget: "",
  ideaBudget: "",
  weddingThings: "",
  saveTheDate: "",
  guests: "",
  accounting: "",
  suppliers: "",
  location: "",
  churches: "",
  documents: "",
  giftList: "",
  favorites: "",
  suggestions: "",
} as const;

export default function NavTabs() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();

  // Rimuoviamo Timeline, Idea di Budget e Suggerimenti dalla barra in alto;
  // restano accessibili dalla Dashboard.
  const tabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/save-the-date", label: t("saveTheDate", { default: "Save the Date" }), icon: TABS_ICONS.saveTheDate },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/contabilita", label: t("accounting"), icon: TABS_ICONS.accounting },
    { href: "/fornitori", label: t("suppliers"), icon: TABS_ICONS.suppliers },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/chiese", label: t("churches"), icon: TABS_ICONS.churches },
    { href: "/documenti", label: t("documents"), icon: TABS_ICONS.documents },
    { href: "/lista-nozze", label: t("giftList", { default: "Lista Nozze" }), icon: TABS_ICONS.giftList },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href));

  return (
    <nav className="relative">
      {/* Desktop */}
      <div className="hidden md:flex flex-wrap gap-2 items-center">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "px-4 py-2 rounded-full border text-sm transition-colors font-medium flex items-center gap-2",
                active
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white/70 border-gray-200 hover:bg-gray-50 text-gray-700"
              )}
              style={active ? { background: "var(--color-sage)" } : {}}
              title={tab.label}
            >
              {tab.icon ? <span aria-hidden>{tab.icon}</span> : null}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-4 text-white rounded-xl shadow-lg active:scale-95 transition-transform border border-gray-300"
          style={{ background: "linear-gradient(135deg, var(--color-sage) 0%, #8a9d84 100%)" }}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className="font-bold text-base flex items-center gap-2">
            <span aria-hidden>{currentTab?.icon ? currentTab.icon : ""}</span>
            <span>{currentTab?.label || "Menu Navigazione"}</span>
          </span>
          <svg
            className={clsx("w-6 h-6 transition-transform", mobileMenuOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileMenuOpen(false)} />
            <div id="mobile-nav" className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-700 rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
              {tabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "block px-5 py-4 text-base font-semibold border-b border-gray-200 last:border-b-0 transition-all active:scale-95",
                      active ? "text-white" : "hover:bg-gray-50 active:bg-gray-100 text-gray-700"
                    )}
                    style={active ? { background: "var(--color-sage)" } : {}}
                  >
                    <span className="flex items-center gap-3">
                      {tab.icon ? <span className="text-xl" aria-hidden>{tab.icon}</span> : null}
                      <span>{tab.label}</span>
                      {active && <span className="ml-auto" aria-hidden>✓</span>}
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
