"use client";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

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
  agenda: "📅",
} as const;

export default function NavTabs() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const [eventType, setEventType] = React.useState<string | null>(null);
  React.useEffect(() => {
    const lsEvt = typeof window !== 'undefined' ? localStorage.getItem('eventType') : null;
    setEventType(lsEvt);
  }, []);

  // Rimuoviamo Timeline, Idea di Budget e Suggerimenti dalla barra in alto;
  // restano accessibili dalla Dashboard.
  const weddingTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/agenda", label: t("agenda", { default: "Agenda" }), icon: TABS_ICONS.agenda, badge: 0 },
    { href: "/save-the-date", label: t("saveTheDate", { default: "Save the Date" }), icon: TABS_ICONS.saveTheDate },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/contabilita", label: t("accounting"), icon: TABS_ICONS.accounting },
    { href: "/fornitori", label: t("suppliers"), icon: TABS_ICONS.suppliers },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/chiese", label: t("churches"), icon: TABS_ICONS.churches },
    { href: "/documenti", label: t("documents"), icon: TABS_ICONS.documents },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const baptismTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/idea-di-budget", label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/chiese", label: t("churches"), icon: TABS_ICONS.churches },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const eighteenthTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/idea-di-budget", label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const confirmationTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/idea-di-budget", label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/chiese", label: t("churches"), icon: TABS_ICONS.churches },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const graduationTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/idea-di-budget", label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const communionTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/idea-di-budget", label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/invitati", label: t("guests"), icon: TABS_ICONS.guests },
    { href: "/chiese", label: t("churches"), icon: TABS_ICONS.churches },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const retirementTabs = [
    { href: "/dashboard", label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { href: "/pensione", label: t("retirement", { default: "Pensione" }), icon: TABS_ICONS.timeline },
    { href: "/budget", label: t("budget"), icon: TABS_ICONS.budget },
    { href: "/fornitori", label: t("suppliers"), icon: TABS_ICONS.suppliers },
    { href: "/location", label: t("location"), icon: TABS_ICONS.location },
    { href: "/preferiti", label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const tabs = (eventType === 'baptism') ? baptismTabs : (eventType === 'eighteenth') ? eighteenthTabs : (eventType === 'confirmation') ? confirmationTabs : (eventType === 'graduation') ? graduationTabs : (eventType === 'communion') ? communionTabs : (eventType === 'retirement') ? retirementTabs : weddingTabs;

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href));

  return (
    <nav className="relative">
      {/* Desktop */}
      <div className="hidden md:flex flex-wrap gap-2 items-center">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const hasBadge = (tab as { badge?: number }).badge !== undefined && (tab as { badge?: number }).badge! > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "px-4 py-2 rounded-full border text-sm transition-all font-semibold flex items-center gap-2 relative focus-ring-sage",
                active ? "text-white shadow-soft" : "shadow-soft-sm"
              )}
              style={
                active
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
              title={tab.label}
            >
              {tab.icon ? <span aria-hidden>{tab.icon}</span> : null}
              <span>{tab.label}</span>
              {hasBadge && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {((tab as { badge?: number }).badge || 0) > 99 ? "99+" : (tab as { badge?: number }).badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-4 text-white rounded-xl shadow-lg active:scale-95 transition-transform border focus-ring-sage"
          style={{
            background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
            borderColor: "var(--accent-sage-600)",
          }}
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
            <div
              id="mobile-nav"
              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {tabs.map((tab) => {
                const active = pathname.startsWith(tab.href);
                const hasBadge = (tab as { badge?: number }).badge !== undefined && (tab as { badge?: number }).badge! > 0;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "block px-5 py-4 text-base font-semibold border-b last:border-b-0 transition-all active:scale-95 focus-ring-sage",
                      active ? "text-white" : ""
                    )}
                    style={
                      active
                        ? {
                            background: "linear-gradient(135deg, var(--accent-sage-500) 0%, var(--accent-sage-700) 100%)",
                            borderColor: "transparent",
                          }
                        : {
                            background: "var(--surface-primary)",
                            borderColor: "var(--border-soft)",
                            color: "var(--text-secondary)",
                          }
                    }
                  >
                    <span className="flex items-center gap-3">
                      {tab.icon ? <span className="text-xl" aria-hidden>{tab.icon}</span> : null}
                      <span>{tab.label}</span>
                      {hasBadge && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ml-2">
                          {((tab as { badge?: number }).badge || 0) > 99 ? "99+" : (tab as { badge?: number }).badge}
                        </span>
                      )}
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
