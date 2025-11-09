"use client";

import Background from "@/components/Background";
import Breadcrumbs from "@/components/Breadcrumbs";
import DynamicHeader from "@/components/DynamicHeader";
import Footer from "@/components/Footer";
import NavTabs from "@/components/NavTabs";
import QuickSettings from "@/components/QuickSettings";
import { ToastProvider } from "@/components/ToastProvider";
import TopBarSelector from "@/components/TopBarSelector";
import { locales } from "@/i18n/config";
import { useLocale } from "next-intl";
import Link from "next/link";
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

  // Evita letture non deterministiche in fase SSR: inizializza neutro.
  const [eventType, setEventType] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Calcolato solo dopo mount per evitare mismatch tra SSR e client.
  const showHeader = mounted && !isOnboarding && (
    eventType === "wedding" ||
    eventType === "baptism" ||
    eventType === "eighteenth" ||
    eventType === "confirmation" ||
    eventType === "communion" ||
    normalizedPath.startsWith("/dashboard") ||
    normalizedPath.startsWith("/laurea")
  );

  useEffect(() => {
    // Recupera valori client-only dopo mount.
    try {
      const cookieEvt = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const lsEvt = localStorage.getItem("eventType");
      setEventType(cookieEvt || lsEvt || "wedding");
    } catch {}
    setMounted(true);

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
      {showHeader ? (
        <header className="sticky top-0 z-50 bg-bg/95 dark:bg-secondary/95 backdrop-blur-sm shadow-soft border-b border-border">
          <DynamicHeader />
          <div className="border-b border-border">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h1 className="text-lg sm:text-2xl font-serif font-bold text-fg">
                  {locale === "es"
                    ? "El Presupuesto de los Novios"
                    : locale === "en"
                    ? "Wedding Budget"
                    : "MYBUDGETEVENTO"}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-fg">
                  <TopBarSelector />
                  {!isSaveTheDate && (
                    <>
                      <Link
                        className="px-3 py-2 rounded-full border border-border bg-bg/60 text-fg hover:bg-muted transition-colors whitespace-nowrap dark:bg-secondary/70 dark:hover:bg-secondary/60"
                        href={`/${locale}/auth`}
                      >
                        Accedi
                      </Link>
                      <Link
                        className="px-3 py-2 rounded-full border border-border bg-bg/60 text-fg hover:bg-muted transition-colors whitespace-nowrap dark:bg-secondary/70 dark:hover:bg-secondary/60"
                        href={`/${locale}/idea-di-budget`}
                      >
                        Idea di Budget
                      </Link>
                      <button
                        className="px-3 py-2 rounded-full font-semibold border border-border bg-bg/60 text-fg hover:bg-muted transition-colors whitespace-nowrap dark:bg-secondary/70 dark:hover:bg-secondary/60"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("open-quick-settings"));
                        }}
                      >
                        Impostazioni
                      </button>
                      <a
                        className="hidden md:flex bg-success text-white px-3 py-2 rounded-full font-semibold hover:bg-success/80 transition-colors whitespace-nowrap items-center gap-1 shadow-sm"
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
      ) : (
        // Placeholder per mantenere coerenza altezza (evita jump layout post-idratazione)
        <div aria-hidden className="h-0" />
      )}

      <main className="min-h-screen bg-bg text-fg">
        <Background />
        <Breadcrumbs />
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">{children}</div>
      </main>

      <Footer />
      <QuickSettings />
    </ToastProvider>
  );
}
