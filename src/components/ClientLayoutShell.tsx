"use client";

import Background from "@/components/Background";
import Breadcrumbs from "@/components/Breadcrumbs";
import DynamicHeader from "@/components/DynamicHeader";
import Footer from "@/components/Footer";
import NavTabs from "@/components/NavTabs";
import QuickSettings from "@/components/QuickSettings";
import { ToastProvider } from "@/components/ToastProvider";
import TopBarSelector from "@/components/TopBarSelector";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { locales } from "@/i18n/config";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export default function ClientLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();

  const normalizedPath = (() => {
    if (!pathname) return "/";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "/";
    if (locales.includes(segments[0] as (typeof locales)[number])) {
      segments.shift();
    }
    return `/${segments.join("/")}` || "/";
  })();

  const isSaveTheDate = normalizedPath.startsWith("/save-the-date");
  const isOnboarding =
    normalizedPath.startsWith("/select-language") ||
    normalizedPath.startsWith("/select-country") ||
    normalizedPath.startsWith("/select-event-type") ||
    normalizedPath === "/auth" ||
    normalizedPath === "/welcome";

  const [eventType, setEventType] = useState<string | null>(() => {
    if (typeof document !== "undefined") {
      const cookieEvt = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const lsEvt = localStorage.getItem("eventType");
      return cookieEvt || lsEvt || null;
    }
    return null;
  });

  const showHeader = !isOnboarding && (
    eventType === "wedding" ||
    eventType === "baptism" ||
    eventType === "eighteenth" ||
    eventType === "confirmation" ||
    eventType === "communion" ||
    normalizedPath.startsWith("/dashboard") ||
    normalizedPath.startsWith("/laurea")
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "eventType") setEventType(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("language", locale);
    } catch {}
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      if (cookieMatch !== locale) {
        document.cookie = `language=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`;
      }
    } catch {}
  }, [locale]);

  return (
    <ToastProvider>
      {showHeader && (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-soft">
          <DynamicHeader />
          <div className="border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h1 className="text-lg sm:text-2xl font-serif font-bold" style={{ color: "var(--color-warm-gray)" }}>
                  {locale === "es"
                    ? "El Presupuesto de los Novios"
                    : locale === "en"
                    ? "Wedding Budget"
                    : "MYBUDGETEVENTO"}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <TopBarSelector />
                  <LanguageSwitcher />
                  {!isSaveTheDate && (
                    <>
                      <Link
                        className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                        href="/idea-di-budget"
                      >
                        Idea di Budget
                      </Link>
                      <button
                        className="px-3 py-2 rounded-full font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("open-quick-settings"));
                        }}
                      >
                        Impostazioni
                      </button>
                      <a
                        className="hidden md:flex bg-green-600 text-white px-3 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors whitespace-nowrap items-center gap-1 shadow-sm"
                        href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                </div>
              </div>
              <NavTabs />
            </div>
          </div>
        </header>
      )}

      <main className="min-h-screen" style={{ background: "var(--color-cream)", color: "var(--foreground)" }}>
        <Background />
        <Breadcrumbs />
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">{children}</div>
      </main>

      <Footer />
      <QuickSettings />
    </ToastProvider>
  );
}
