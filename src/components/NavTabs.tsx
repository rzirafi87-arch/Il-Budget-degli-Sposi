"use client";
import { useEvent } from "@/contexts/EventContext";
import { locales } from "@/i18n/config";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  Church,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Gift,
  Heart,
  HeartHandshake,
  Home,
  Lightbulb,
  MapPin,
  Menu,
  PiggyBank,
  ReceiptText,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const TABS_ICONS: Record<string, LucideIcon> = {
  dashboard: Home,
  timeline: CalendarDays,
  budget: PiggyBank,
  ideaBudget: ReceiptText,
  weddingThings: ClipboardList,
  saveTheDate: Heart,
  guests: Users,
  accounting: CircleDollarSign,
  suppliers: HeartHandshake,
  location: MapPin,
  churches: Church,
  documents: FileText,
  giftList: Gift,
  favorites: Star,
  suggestions: Lightbulb,
  agenda: CalendarDays,
  retirement: Building2,
};

export default function NavTabs() {
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const { eventType } = useEvent();

  const normalizedPath = React.useMemo(() => {
    if (!pathname) return "/";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "/";
    if (locales.includes(segments[0] as (typeof locales)[number])) {
      segments.shift();
    }
    return `/${segments.join("/")}` || "/";
  }, [pathname]);

  // Fallback to localStorage if context not available
  const [localEventType, setLocalEventType] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!eventType || eventType === "WEDDING") {
      const lsEvt = typeof window !== 'undefined' ? localStorage.getItem('eventType') : null;
      setLocalEventType(lsEvt);
    }
  }, [eventType]);

  const effectiveEventType = eventType?.toLowerCase() || localEventType || 'wedding';

  // Rimuoviamo Timeline, Idea di Budget e Suggerimenti dalla barra in alto;
  // restano accessibili dalla Dashboard.
  const withLocale = (path: string) => `/${locale}${path}`;

  const weddingTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/save-the-date", href: withLocale("/save-the-date"), label: t("saveTheDate", { default: "Save the Date" }), icon: TABS_ICONS.saveTheDate },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
    { path: "/contabilita", href: withLocale("/contabilita"), label: t("accounting"), icon: TABS_ICONS.accounting },
    { path: "/fornitori", href: withLocale("/fornitori"), label: t("suppliers"), icon: TABS_ICONS.suppliers },
  { path: "/location", href: withLocale("/location"), label: t("locationReception", { default: "Location Ricevimento" }), icon: TABS_ICONS.location },
  { path: "/chiese", href: withLocale("/chiese"), label: t("locationCeremony", { default: "Location Cerimonia" }), icon: TABS_ICONS.churches },
    { path: "/documenti", href: withLocale("/documenti"), label: t("documents"), icon: TABS_ICONS.documents },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const baptismTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/idea-di-budget", href: withLocale("/idea-di-budget"), label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
  { path: "/chiese", href: withLocale("/chiese"), label: t("locationCeremony", { default: "Location Cerimonia" }), icon: TABS_ICONS.churches },
  { path: "/location", href: withLocale("/location"), label: t("locationReception", { default: "Location Ricevimento" }), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const eighteenthTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/idea-di-budget", href: withLocale("/idea-di-budget"), label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
    { path: "/location", href: withLocale("/location"), label: t("location"), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const confirmationTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/idea-di-budget", href: withLocale("/idea-di-budget"), label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
    { path: "/chiese", href: withLocale("/chiese"), label: t("churches"), icon: TABS_ICONS.churches },
    { path: "/location", href: withLocale("/location"), label: t("location"), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const graduationTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/idea-di-budget", href: withLocale("/idea-di-budget"), label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
    { path: "/location", href: withLocale("/location"), label: t("location"), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const communionTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/idea-di-budget", href: withLocale("/idea-di-budget"), label: t("ideaBudget", { default: "Idea di Budget" }), icon: TABS_ICONS.ideaBudget },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/invitati", href: withLocale("/invitati"), label: t("guests"), icon: TABS_ICONS.guests },
    { path: "/chiese", href: withLocale("/chiese"), label: t("churches"), icon: TABS_ICONS.churches },
    { path: "/location", href: withLocale("/location"), label: t("location"), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const retirementTabs = [
    { path: "/dashboard", href: withLocale("/dashboard"), label: t("dashboard"), icon: TABS_ICONS.dashboard },
    { path: "/pensione", href: withLocale("/pensione"), label: t("retirement", { default: "Pensione" }), icon: TABS_ICONS.timeline },
    { path: "/budget", href: withLocale("/budget"), label: t("budget"), icon: TABS_ICONS.budget },
    { path: "/fornitori", href: withLocale("/fornitori"), label: t("suppliers"), icon: TABS_ICONS.suppliers },
    { path: "/location", href: withLocale("/location"), label: t("location"), icon: TABS_ICONS.location },
    { path: "/preferiti", href: withLocale("/preferiti"), label: t("favorites", { default: "Preferiti" }), icon: TABS_ICONS.favorites },
  ];
  const tabs = (effectiveEventType === 'baptism') ? baptismTabs :
               (effectiveEventType === 'eighteenth') ? eighteenthTabs :
               (effectiveEventType === 'confirmation') ? confirmationTabs :
               (effectiveEventType === 'graduation') ? graduationTabs :
               (effectiveEventType === 'communion') ? communionTabs :
               (effectiveEventType === 'retirement') ? retirementTabs :
               weddingTabs;

  const currentTab = tabs.find((tab) => normalizedPath.startsWith(tab.path));
  const CurrentIcon = currentTab?.icon ?? Menu;

  return (
    <nav className="relative" aria-label="Navigazione principale">
      {/* Desktop */}
      <div className="hidden md:flex flex-wrap gap-1.5 items-center">
        {tabs.map((tab) => {
          const active = normalizedPath.startsWith(tab.path);
          const Icon = tab.icon;
          const hasBadge = (tab as { badge?: number }).badge !== undefined && (tab as { badge?: number }).badge! > 0;
          return (
            <Link
              key={tab.path}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "min-h-10 px-3.5 py-2 rounded-xl border text-sm transition-colors font-semibold flex items-center gap-2 relative focus-ring-sage",
                active ? "text-white shadow-soft-sm" : "hover:bg-muted"
              )}
              style={
                active
                  ? {
                      background: "var(--accent-sage-700)",
                      borderColor: "var(--accent-sage-700)",
                    }
                  : {
                      background: "var(--surface-elevated)",
                      borderColor: "var(--border-soft)",
                      color: "var(--text-secondary)",
                    }
              }
              title={tab.label}
            >
              <Icon size={17} strokeWidth={2} aria-hidden />
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
          className="w-full flex items-center justify-between px-4 py-3 text-white rounded-xl shadow-soft active:scale-[.99] transition-transform border focus-ring-sage"
          style={{
            background: "var(--accent-sage-700)",
            borderColor: "var(--accent-sage-700)",
          }}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className="font-bold text-base flex items-center gap-2">
            <CurrentIcon size={20} aria-hidden />
            <span>{currentTab?.label || "Menu Navigazione"}</span>
          </span>
          {mobileMenuOpen ? <X size={21} aria-hidden /> : <Menu size={21} aria-hidden />}
        </button>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 h-auto w-auto bg-black/35 backdrop-blur-[1px]"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Chiudi menu"
            />
            <div
              id="mobile-nav"
              className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-soft-xl z-50 max-h-[min(65vh,32rem)] overflow-y-auto p-1.5"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {tabs.map((tab) => {
                const active = normalizedPath.startsWith(tab.path);
                const Icon = tab.icon;
                const hasBadge = (tab as { badge?: number }).badge !== undefined && (tab as { badge?: number }).badge! > 0;
                return (
                  <Link
                    key={tab.path}
                    href={tab.href}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "block px-4 py-3 text-base font-semibold rounded-xl transition-colors active:scale-[.99] focus-ring-sage",
                      active ? "text-white" : ""
                    )}
                    style={
                      active
                        ? {
                            background: "var(--accent-sage-700)",
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
                      <Icon size={20} strokeWidth={2} aria-hidden />
                      <span>{tab.label}</span>
                      {hasBadge && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ml-2">
                          {((tab as { badge?: number }).badge || 0) > 99 ? "99+" : (tab as { badge?: number }).badge}
                        </span>
                      )}
                      {active && <Check className="ml-auto" size={18} aria-hidden />}
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
