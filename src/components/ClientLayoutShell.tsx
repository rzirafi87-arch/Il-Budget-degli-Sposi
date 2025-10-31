"use client";
import React, { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import NavTabs from "@/components/NavTabs";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import DynamicHeader from "@/components/DynamicHeader";
import { ToastProvider } from "@/components/ToastProvider";
import Breadcrumbs from "@/components/Breadcrumbs";
import { IntlProvider } from "next-intl";
import QuickSettings from "@/components/QuickSettings";
import TopBarSelector from "@/components/TopBarSelector";

// Helpers to make next-intl happy: expand dotted keys (e.g. "onboarding.title")
// into nested namespaces (e.g. { onboarding: { title: "..." } }) and deep-merge
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
  // Onboarding pages where we hide the header
  const isOnboarding = Boolean(
    pathname && (
      pathname.startsWith("/select-language") ||
      pathname.startsWith("/select-country") ||
      pathname.startsWith("/select-event-type") ||
      pathname === "/auth" ||
      pathname === "/welcome"
    )
  );

  // Read the selected event type early to avoid header flicker
  const [eventType, setEventType] = useState<string | null>(() => {
    if (typeof document !== "undefined") {
      const cookieEvt = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const lsEvt = localStorage.getItem("eventType");
      return cookieEvt || lsEvt || null;
    }
    return null;
  });
  const showHeader = !isOnboarding && eventType === "wedding";

  const [locale, setLocale] = useState<"it" | "es" | "en" | "ru" | "fr" | "de" | "zh" | "ja" | "ar">("it");
  const [messages, setMessages] = useState<any | null>(null);
  const [chatEnabled, setChatEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const lang = (typeof window !== "undefined" ? localStorage.getItem("language") : null) as
      | "it"
      | "es"
      | "en"
      | "ru"
      | "fr"
      | "de"
      | "zh"
      | "ja"
      | "ar"
      | null;
    const nextLocale = lang ?? "it";
    setLocale(nextLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLocale;
    }
    (async () => {
      try {
        const base = (await import(`../messages/${nextLocale}.json`)).default;
        // Merge optional onboarding keys (flat) into root
        let merged: any = base;
        try {
          const onboarding = (await import(`../messages/onboarding.${nextLocale}.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {}
        // Try to load optional footer namespace and merge under `footer`
        try {
          const footer = (await import(`../messages/footer.${nextLocale}.json`)).default;
          const loveByLocale: Record<string, string> = {
            it: "Fatto con ❤️ per le coppie italiane",
            en: "Made with ❤️ for Italian couples",
            es: "Hecho con ❤️ para parejas italianas",
            fr: "Fait avec ❤️ pour les couples italiens",
            de: "Mit ❤️ für italienische Paare",
            ru: "Сделано с ❤️ для итальянских пар",
            zh: "用 ❤️ 为意大利情侣打造",
            ja: "イタリアのカップルのために❤️を込めて",
            ar: "صُنع بحب ❤️ للأزواج الإيطاليين",
          };
          setMessages({ ...merged, footer: { ...footer, madeWithLove: loveByLocale[nextLocale] ?? footer?.madeWithLove } });
        } catch {
          setMessages(merged);
        }
      } catch {
        const fallback = (await import("../messages/en.json")).default;
        // Merge optional onboarding (EN) into root
        let merged: any = fallback;
        try {
          const onboarding = (await import(`../messages/onboarding.en.json`)).default;
          merged = mergeDeep(merged, expandDotted(onboarding));
        } catch {}
        // Optional footer in EN
        try {
          const footer = (await import(`../messages/footer.en.json`)).default;
          setMessages({ ...merged, footer: { ...footer, madeWithLove: "Made with ❤️ for Italian couples" } });
        } catch {
          setMessages(merged);
        }
      }
    })();

    // Keep event type in sync if user changes it in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === "eventType") setEventType(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Verifica disponibilità Chat IA (per pulsante top bar)
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
                <NavTabs />
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
        {/* Floating quick settings hidden on save-the-date */}
        {!isSaveTheDate && <QuickSettings />}
      </IntlProvider>
    </ToastProvider>
  );
}
