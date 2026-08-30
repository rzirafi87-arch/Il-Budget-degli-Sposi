"use client";

import { locales } from "@/i18n/config";
import { getEventTypeCapability, normalizeEventType, type EventModule } from "@/lib/eventTypeCapabilities";
import clsx from "clsx";
import {
  Church,
  CircleDollarSign,
  FileText,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  Menu,
  PiggyBank,
  ReceiptText,
  Star,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type TabDefinition = {
  module: EventModule;
  path: string;
  label: () => string;
  icon: LucideIcon;
};

export default function NavTabs() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [eventType, setEventType] = React.useState("wedding");

  React.useEffect(() => {
    const readEventType = () => {
      const cookieValue = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const storageValue = localStorage.getItem("eventType");
      setEventType(normalizeEventType(cookieValue || storageValue || "wedding"));
    };
    readEventType();

    const onResolved = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (value) setEventType(normalizeEventType(value));
      else readEventType();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "eventType") readEventType();
    };
    window.addEventListener("event-type-resolved", onResolved);
    window.addEventListener("event-type-changed", onResolved);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("event-type-resolved", onResolved);
      window.removeEventListener("event-type-changed", onResolved);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const normalizedPath = React.useMemo(() => {
    if (!pathname) return "/";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length && locales.includes(segments[0] as (typeof locales)[number])) segments.shift();
    return `/${segments.join("/")}` || "/";
  }, [pathname]);

  const withLocale = (path: string) => `/${locale}${path}`;
  const definitions: TabDefinition[] = [
    { module: "dashboard", path: "/dashboard", label: () => t("dashboard"), icon: Home },
    { module: "budget", path: "/budget", label: () => t("budget"), icon: PiggyBank },
    { module: "budget-ideas", path: "/idea-di-budget", label: () => t("ideaBudget", { default: "Idea di Budget" }), icon: ReceiptText },
    { module: "save-the-date", path: "/save-the-date", label: () => t("saveTheDate", { default: "Save the Date" }), icon: Heart },
    { module: "guests", path: "/invitati", label: () => t("guests"), icon: Users },
    { module: "accounting", path: "/contabilita", label: () => t("accounting"), icon: CircleDollarSign },
    { module: "suppliers", path: "/fornitori", label: () => t("suppliers"), icon: HeartHandshake },
    { module: "location-reception", path: "/location", label: () => t("locationReception", { default: "Location Ricevimento" }), icon: MapPin },
    { module: "location-ceremony", path: "/cerimonia", label: () => t("locationCeremony", { default: "Location Cerimonia" }), icon: MapPin },
    { module: "churches", path: "/chiese", label: () => t("churches", { default: "Chiese" }), icon: Church },
    { module: "documents", path: "/documenti", label: () => t("documents"), icon: FileText },
    { module: "favorites", path: "/preferiti", label: () => t("favorites", { default: "Preferiti" }), icon: Star },
  ];

  const capability = getEventTypeCapability(eventType);
  const tabs = definitions
    .filter((item) => capability.enabledModules.includes(item.module))
    .map((item) => ({ ...item, href: withLocale(item.path), resolvedLabel: item.label() }));
  const currentTab = tabs.find((tab) => normalizedPath.startsWith(tab.path));
  const CurrentIcon = currentTab?.icon ?? Menu;

  if (tabs.length === 0) return null;

  return (
    <nav className="relative" aria-label="Navigazione principale">
      <div className="hidden md:flex flex-wrap gap-1.5 items-center">
        {tabs.map((tab) => {
          const active = normalizedPath.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={`${tab.module}-${tab.path}`}
              href={tab.href}
              aria-label={tab.resolvedLabel}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "min-h-10 px-3.5 py-2 rounded-xl border text-sm transition-colors font-semibold flex items-center gap-2 relative focus-ring-sage",
                active ? "text-white shadow-soft-sm" : "hover:bg-muted"
              )}
              style={active
                ? { background: "var(--accent-sage-700)", borderColor: "var(--accent-sage-700)" }
                : { background: "var(--surface-elevated)", borderColor: "var(--border-soft)", color: "var(--text-secondary)" }}
            >
              <Icon size={17} strokeWidth={2} aria-hidden />
              <span>{tab.resolvedLabel}</span>
            </Link>
          );
        })}
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="w-full flex items-center justify-between px-4 py-3 text-white rounded-xl shadow-soft border focus-ring-sage"
          style={{ background: "var(--accent-sage-700)", borderColor: "var(--accent-sage-700)" }}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className="font-bold text-base flex items-center gap-2">
            <CurrentIcon size={20} aria-hidden />
            <span>{currentTab?.resolvedLabel || "Menu"}</span>
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
            <div id="mobile-nav" className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-soft-xl z-50 max-h-[min(65vh,32rem)] overflow-y-auto p-1.5">
              {tabs.map((tab) => {
                const active = normalizedPath.startsWith(tab.path);
                const Icon = tab.icon;
                return (
                  <Link
                    key={`${tab.module}-${tab.path}`}
                    href={tab.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "block px-4 py-3 text-base font-semibold rounded-xl transition-colors focus-ring-sage",
                      active ? "text-white" : ""
                    )}
                    style={active
                      ? { background: "var(--accent-sage-700)" }
                      : { background: "var(--surface-primary)", color: "var(--text-secondary)" }}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} strokeWidth={2} aria-hidden />
                      {tab.resolvedLabel}
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
