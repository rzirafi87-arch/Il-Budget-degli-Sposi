"use client";
import Background from "@/components/Background";
import Breadcrumbs from "@/components/Breadcrumbs";
import DynamicHeader from "@/components/DynamicHeader";
import Footer from "@/components/Footer";
import NavTabs from "@/components/NavTabs";
import QuickSettings from "@/components/QuickSettings";
import { ToastProvider } from "@/components/ToastProvider";
import TopBarSelector from "@/components/TopBarSelector";
import { IntlProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

function expandDotted(input: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input || {})) {
    const parts = key.split(".");
    let cur = out;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!;
      if (i === parts.length - 1) {
        cur[p] = value;
      } else {
        cur[p] = cur[p] || {};
        cur = cur[p];
      }
    }
  }
  return out;
}

function mergeDeep(a: any, b: any): any {
  const out: any = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeDeep(out[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export default function ClientLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSaveTheDate = Boolean(pathname && pathname.startsWith("/save-the-date"));
  const isOnboarding = Boolean(
    pathname && (
      pathname.startsWith("/select-language") ||
      pathname.startsWith("/select-country") ||
      pathname.startsWith("/select-event-type") ||
      pathname === "/auth" ||
      pathname === "/welcome"
    )
  );

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
    (pathname?.startsWith("/dashboard") ?? false) ||
    (pathname?.startsWith("/laurea") ?? false)
  );

  type Locale = "it" | "es" | "en" | "ru" | "fr" | "de" | "zh" | "ja" | "ar" | "pt" | "id";
  const [locale, setLocale] = useState<Locale>("it");
  const [messages, setMessages] = useState<any | null>(null);
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const lang = (typeof window !== "undefined" ? localStorage.getItem("language") : null) as Locale | null;
    const nextLocale: Locale = (lang as Locale) ?? "it";
    setLocale(nextLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLocale;
      document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";
    }
    (async () => {
      try {
        const base = (await import(`../messages/${nextLocale}.json`)).default;
        let merged: any = base;
        try {
          const onboarding = (await import(`../messages/onboarding.${nextLocale}.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {}
        try {
          const footer = (await import(`../messages/footer.${nextLocale}.json`)).default;
          setMessages({ ...merged, footer });
        } catch {
          setMessages(merged);
        }
      } catch {
        const fallback = (await import("../messages/en.json")).default;
        let merged: any = fallback;
        try {
          const onboarding = (await import(`../messages/onboarding.en.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {}
        try {
          const footer = (await import(`../messages/footer.en.json`)).default;
          setMessages({ ...merged, footer });
        } catch {
          setMessages(merged);
        }
      }
    })();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "eventType") setEventType(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Mantiene un cookie "language" allineato alla scelta utente per migliorare SSR (<html lang>)
  useEffect(() => {
    try {
      const langLS = (typeof window !== "undefined" ? localStorage.getItem("language") : null) as string | null;
      const next = (langLS || locale || "it").toLowerCase();
      const cookieMatch = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1] : null;
      if (typeof document !== "undefined") {
        if (cookieMatch !== next) {
          // 365 giorni
          document.cookie = `language=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
        }
      }
    } catch {}
  }, [locale]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const data = await res.json();
        if (!active) return;
        setChatEnabled(Boolean(data?.enabled));
      } catch (_) {
        if (!active) return;
        setChatEnabled(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!messages) {
    return (
      <div className="p-6 text-center text-gray-600" role="status" aria-busy="true" suppressHydrationWarning>
        Caricamento...
      </div>
    );
  }

  return (
    <ToastProvider>
      <IntlProvider messages={messages} locale={locale} timeZone="Europe/Rome">
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
                      : "Il Budget degli Sposi"}
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <TopBarSelector />
                    {!isSaveTheDate && (
                      <>
                        {chatEnabled ? (
                          <a
                            className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                            href="/chat-ia"
                            aria-label="Chat IA disponibile"
                          >
                            Chat IA
                          </a>
                        ) : (
                          <span
                            className="px-3 py-2 rounded-full border border-gray-200 bg-gray-100 text-gray-400 whitespace-nowrap cursor-not-allowed"
                            title="Assistente AI non disponibile"
                            aria-disabled
                          >
                            Chat IA
                          </span>
                        )}
                        <a
                          className="px-3 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                          href="/idea-di-budget"
                        >
                          Idea di Budget
                        </a>
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
                          Chat
                        </a>
                        <a
                          className="hidden md:flex text-white px-3 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-sm"
                          style={{ background: "var(--color-sage)" }}
                          href="/auth"
                        >
                          Accedi
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {(eventType === 'wedding' || eventType === 'baptism' || eventType === 'eighteenth' || eventType === 'confirmation' || eventType === 'graduation' || eventType === 'communion') && <NavTabs />}
              </div>
            </div>
          </header>
        )}
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-8 sm:pb-16 min-h-screen">
          {showHeader && <Breadcrumbs />}
          {children}
        </main>
        <Footer />
        <Background />
        {!isSaveTheDate && <QuickSettings />}
      </IntlProvider>
    </ToastProvider>
  );
}
