"use client";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";
import { EVENTS } from "@/lib/loadConfigs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const DASHBOARD_EVENTS = new Set([
  "wedding",
  "baptism",
  "eighteenth",
  "graduation",
  "confirmation",
  "communion",
  "anniversary",
  "birthday",
  "fifty",
  "gender-reveal",
  "retirement", // Added for testing - evento Pensione
  "babyshower", // Added for testing - evento Baby Shower
  "engagement", // Added - Festa di Fidanzamento
  "proposal", // Added - Proposta di Matrimonio
  "corporate", // Added - Evento Aziendale
  "bar-mitzvah", // Added - Bar/Bat Mitzvah
  "quinceanera", // Added - Quinceañera
  "charity-gala", // Added - Evento Culturale/Charity/Gala
]);

export default function SelectEventTypePage() {
  const t = useTranslations();
  const router = useRouter();
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);
  const country = typeof window !== "undefined"
    ? localStorage.getItem("country") || document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1] || "it"
    : "it";

  useEffect(() => {
    if (!country) return;
    fetch(`/api/traditions?country=${encodeURIComponent(country)}`)
      .then((r) => r.json())
      .then((d) => setTradition((d.traditions && d.traditions[0]) || null))
      .catch(() => setTradition(null));
  }, [country]);

  React.useEffect(() => {
    try {
      const cookieLang = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
      const cookieEventType = document.cookie.match(/(?:^|; )eventType=([^;]+)/)?.[1];
      const lsLang = localStorage.getItem("language");
      const lsCountry = localStorage.getItem("country");
      const lsEventType = localStorage.getItem("eventType");
      if (!(cookieLang || lsLang)) {
        router.replace("/select-language");
        return;
      }
      if (!(cookieCountry || lsCountry)) {
        router.replace("/select-country");
        return;
      }
      if (lsLang && !cookieLang) document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (lsCountry && !cookieCountry) document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (cookieEventType || lsEventType) {
        if (!cookieEventType && lsEventType) document.cookie = `eventType=${lsEventType}; Path=/; Max-Age=15552000; SameSite=Lax`;
        const ev = cookieEventType || lsEventType || "";
        router.replace(DASHBOARD_EVENTS.has(ev) ? "/dashboard" : "/coming-soon");
      }
    } catch {
      // Ignore errors in SSR
    }
  }, [router]);

  const [selected, setSelected] = useState<string>("");

  // Keep effect for any future UI reacting to selection, but don't rely on it for persistence before navigation
  useEffect(() => {
    if (!selected) return;
    try {
      localStorage.setItem("eventType", selected);
      document.cookie = `eventType=${selected}; Path=/; Max-Age=15552000; SameSite=Lax`;
    } catch {
      // ignore
    }
  }, [selected]);

  function handleSelect(code: string) {
    // Persist immediately BEFORE navigating to ensure the dashboard can read it on first render
    try {
      localStorage.setItem("eventType", code);
      // cookie will be set by the effect above when the component is still mounted; not required for dashboard
    } catch {
      // ignore storage errors
    }
    setSelected(code);

    // Navigate
    const destination = DASHBOARD_EVENTS.has(code) ? "/dashboard" : "/coming-soon";
    router.push(destination);
  }

  // Mostra tutti gli eventi per tutte le nazioni

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(1100px 500px at 0% 0%, rgba(163,181,157,0.25), transparent)," +
          "radial-gradient(900px 600px at 100% 100%, rgba(230,242,224,0.5), transparent)," +
          "linear-gradient(180deg, #f7faf7, #eef5ee)",
        backgroundImage: "url(/backgrounds/select-event-type.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="max-w-3xl w-full mx-4 p-8 rounded-3xl bg-white/80 backdrop-blur border border-gray-200 shadow-xl">
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🎉</span>
          {t("onboarding.selectEventTypeTitle", { fallback: "Scegli il tipo di evento" })}
        </h1>
        {tradition && (
          <div className="mb-6">
            <WeddingTraditionInfo tradition={tradition} />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EVENTS.map((ev) => {
            const isAvailable = ev.available !== false;
            return (
              <button
                key={ev.slug}
                disabled={!isAvailable}
                className={`px-6 py-4 rounded-xl font-semibold text-base shadow-sm border-2 transition-all ${
                  isAvailable
                    ? `border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white ${selected === ev.slug ? "bg-[#A3B59D] text-white" : ""}`
                    : "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                }`}
                onClick={() => isAvailable && handleSelect(ev.slug)}
              >
                <span aria-hidden="true" className="mr-2">{ev.emoji || "✨"}</span>
                {t(`events.${ev.slug}`, { fallback: ev.label })}
                {!isAvailable && (
                  <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 border border-gray-300">
                    {t("comingSoon", { fallback: "In arrivo" })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
