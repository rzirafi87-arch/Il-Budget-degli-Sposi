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

type Messages = Record<string, unknown>;

function expandDotted(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input || {})) {
    const parts = key.split(".");
    let cur: Record<string, unknown> = out;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]!;
      if (i === parts.length - 1) {
        cur[p] = value;
      } else {
        if (!cur[p] || typeof cur[p] !== "object") {
          cur[p] = {};
        }
        cur = cur[p] as Record<string, unknown>;
      }
    }
  }
  return out;
}

function mergeDeep(a: unknown, b: unknown): Messages {
  if (!a || typeof a !== "object" || Array.isArray(a)) {
    return (b && typeof b === "object" && !Array.isArray(b)) ? b as Messages : {};
  }
  if (!b || typeof b !== "object" || Array.isArray(b)) {
    return a as Messages;
  }
  
  const out: Messages = { ...(a as Messages) };
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = mergeDeep(out[k], v);
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
  const [messages, setMessages] = useState<Messages | null>(null);

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
        let merged: Messages = base;
        try {
          const onboarding = (await import(`../messages/onboarding.${nextLocale}.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {
          // Onboarding messages not available
        }
        try {
          const footer = (await import(`../messages/footer.${nextLocale}.json`)).default;
          setMessages({ ...merged, footer });
        } catch {
          setMessages(merged);
        }
      } catch {
        const fallback = (await import("../messages/en.json")).default;
        let merged: Messages = fallback;
        try {
          const onboarding = (await import(`../messages/onboarding.en.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {
          // Onboarding messages not available
        }
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
                      : "MYBUDGETEVENTO"}
                  </h1>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <TopBarSelector />
                    {!isSaveTheDate && (
                      <>
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
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Chatta con noi su WhatsApp
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
