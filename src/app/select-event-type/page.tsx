"use client";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";
import { EVENTS } from "@/lib/loadConfigs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
        const ev = cookieEventType || lsEventType;
        router.replace(
          ev === "wedding"
            ? "/dashboard"
            : ev === "baptism"
            ? "/dashboard"
            : ev === "eighteenth"
            ? "/dashboard"
            : ev === "graduation"
            ? "/dashboard"
            : ev === "confirmation"
            ? "/dashboard"
            : ev === "communion"
            ? "/dashboard"
            : "/coming-soon"
        );
      }
    } catch {
      // Ignore errors in SSR
    }
  }, [router]);

  const [selected, setSelected] = useState<string>("");

  // Update cookies when event type is selected
  useEffect(() => {
    if (!selected) return;
    localStorage.setItem("eventType", selected);
    document.cookie = `eventType=${selected}; Path=/; Max-Age=15552000; SameSite=Lax`;
  }, [selected]);

  function handleSelect(code: string) {
    setSelected(code);
    if (code === "wedding") {
      router.push("/dashboard");
    } else if (code === "baptism") {
      router.push("/dashboard");
    } else if (code === "eighteenth") {
      router.push("/dashboard");
    } else if (code === "graduation") {
      router.push("/dashboard");
    } else if (code === "confirmation") {
      router.push("/dashboard");
    } else if (code === "communion") {
      router.push("/dashboard");
    } else {
      router.push("/coming-soon");
    }
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
          {EVENTS.map((ev) => (
            <button
              key={ev.slug}
              className={`px-6 py-4 rounded-xl font-semibold text-base shadow-sm border-2 border-[#A3B59D] bg-white hover:bg-[#A3B59D] hover:text-white transition-all ${selected === ev.slug ? "bg-[#A3B59D] text-white" : ""}`}
              onClick={() => handleSelect(ev.slug)}
            >
              <span aria-hidden="true" className="mr-2">{ev.emoji || "✨"}</span>
              {t(`events.${ev.slug}`, { fallback: ev.label })}
              {ev.available === false && (
                <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {t("comingSoon", { fallback: "In arrivo" })}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
