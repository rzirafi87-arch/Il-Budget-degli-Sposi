"use client";

import { BRAND_NAME } from "@/config/brand";
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
import { Lightbulb, LogIn, MessageCircle, Settings } from "lucide-react";
import { buttonClasses } from "@/components/ui/AppButton";

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
  const isPublicHome = normalizedPath === "/";
  const isOnboarding =
    normalizedPath.startsWith("/select-language") ||
    normalizedPath.startsWith("/select-country") ||
    normalizedPath.startsWith("/select-event-type") ||
    normalizedPath === "/wizard" ||
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
    const timer = window.setTimeout(() => {
      try {
        const cookieEvt = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
        const lsEvt = localStorage.getItem("eventType");
        setEventType(cookieEvt || lsEvt || "wedding");
      } catch {}
      setMounted(true);
    }, 0);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "eventType") setEventType(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
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

  if (isPublicHome) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      {showHeader ? (
        <header className="sticky top-0 z-50 border-b border-border bg-bg/94 shadow-soft-sm backdrop-blur-xl dark:bg-secondary/95">
          <DynamicHeader />
          <div>
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Link href={`/${locale}/dashboard`} className="group flex min-h-11 min-w-0 items-center gap-3 rounded-xl pr-2 focus-ring-sage">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-white shadow-soft-sm" aria-hidden>
                    B
                  </span>
                  <span className="truncate text-lg font-serif font-bold text-fg sm:text-xl">
                  {locale === "es"
                    ? "El Presupuesto de los Novios"
                    : locale === "en"
                    ? "Wedding Budget"
                    : BRAND_NAME}
                  </span>
                </Link>
                <div className="flex items-center gap-1.5 text-sm text-muted-fg">
                  <TopBarSelector />
                  {!isSaveTheDate && (
                    <>
                      <Link
                        className={buttonClasses({ variant: "ghost", size: "sm", className: "hidden lg:inline-flex" })}
                        href={`/${locale}/auth`}
                      >
                        <LogIn size={17} aria-hidden />
                        Accedi
                      </Link>
                      <Link
                        className={buttonClasses({ variant: "ghost", size: "sm", className: "hidden xl:inline-flex" })}
                        href={`/${locale}/idea-di-budget`}
                      >
                        <Lightbulb size={17} aria-hidden />
                        Idea di Budget
                      </Link>
                      <button
                        className={buttonClasses({ variant: "outline", size: "icon" })}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("open-quick-settings"));
                        }}
                        aria-label="Apri impostazioni"
                        title="Impostazioni"
                      >
                        <Settings size={19} aria-hidden />
                      </button>
                      <a
                        className={buttonClasses({ variant: "primary", size: "sm", className: "hidden xl:inline-flex" })}
                        href="https://wa.me/393001234567?text=Ciao!%20Vorrei%20informazioni%20su%20Il%20Budget%20degli%20Sposi"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={17} aria-hidden />
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
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>

      <Footer />
      <QuickSettings />
    </ToastProvider>
  );
}
