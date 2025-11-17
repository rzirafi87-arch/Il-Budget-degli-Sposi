"use client";
import TopBarSelector from "@/components/TopBarSelector";
import WeddingTraditionInfo, {
  WeddingTradition,
} from "@/components/WeddingTraditionInfo";
import { EVENT_CONFIGS } from "@/constants/eventConfigs";
import { useLocale, useTranslations } from "next-intl";
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
  "retirement",
  "baby-shower",
  "engagement-party",
  "proposal",
  "corporate",
  "bar-mitzvah",
  "quinceanera",
  "charity-gala",
]);

export default function SelectEventTypePage() {
  const t = useTranslations("events");
  const router = useRouter();
  const locale = useLocale();
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);
  const country =
    typeof window !== "undefined"
      ? localStorage.getItem("country") ||
        document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1] ||
        "it"
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
      const cookieCountry = document.cookie.match(
        /(?:^|; )country=([^;]+)/
      )?.[1];
      const cookieEventType = document.cookie.match(
        /(?:^|; )eventType=([^;]+)/
      )?.[1];
      const lsLang = localStorage.getItem("language");
      const lsCountry = localStorage.getItem("country");
      const lsEventType = localStorage.getItem("eventType");
      if (!(cookieLang || lsLang)) {
        router.replace(`/${locale}/select-language`);
        return;
      }
      if (!(cookieCountry || lsCountry)) {
        router.replace(`/${locale}/select-country`);
        return;
      }
      if (lsLang && !cookieLang)
        document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (lsCountry && !cookieCountry)
        document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (cookieEventType || lsEventType) {
        if (!cookieEventType && lsEventType)
          document.cookie = `eventType=${lsEventType}; Path=/; Max-Age=15552000; SameSite=Lax`;
        let ev = cookieEventType || lsEventType || "";
        if (ev === "babyshower") ev = "baby-shower";
        if (ev === "engagement") ev = "engagement-party";
        router.replace(
          `/${locale}${
            DASHBOARD_EVENTS.has(ev) ? "/dashboard" : "/coming-soon"
          }`
        );
      }
    } catch {
      // Ignore errors in SSR
    }
  }, [router, locale]);

  const [selected, setSelected] = useState<string>("");

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
    try {
      localStorage.setItem("eventType", code);
    } catch {
      // ignore storage errors
    }
    setSelected(code);
    const destination = DASHBOARD_EVENTS.has(code)
      ? "/dashboard"
      : "/coming-soon";
    router.push(`/${locale}${destination}`);
  }

  const EVENTS = Object.entries(EVENT_CONFIGS).map(([slug, cfg]) => ({
    slug,
    label: t(`${slug}.label`, { fallback: cfg.name }),
    emoji: cfg.emoji,
    available: true,
  }));

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
        <div className="mb-6 flex justify-end">
          <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-[#A3B59D]/40 bg-[#F8FBF7] px-4 py-3 text-sm text-gray-700 shadow-sm sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold text-center sm:text-left">
              {t("onboarding.selectLanguageTitle", {
                fallback: "Scegli la lingua",
              })}
              <span aria-hidden className="mx-1 hidden sm:inline">
                /
              </span>
              <br className="sm:hidden" />
              {t("onboarding.selectCountryTitle", {
                fallback: "Scegli il paese",
              })}
            </span>
            <div className="self-center sm:self-auto">
              <TopBarSelector />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">
            🎉
          </span>
          {t("onboarding.selectEventTypeTitle", {
            fallback: "Scegli il tipo di evento",
          })}
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
                className={`group relative overflow-hidden rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg ${
                  isAvailable
                    ? selected === ev.slug
                      ? "border-primary shadow-lg"
                      : "border-border shadow-sm hover:border-primary"
                    : "border-border/60 opacity-70 cursor-not-allowed"
                }`}
                onClick={() => isAvailable && handleSelect(ev.slug)}
              >
                <div className="relative h-56 w-full">
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-left text-white">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span
                          aria-hidden="true"
                          className="text-2xl drop-shadow-sm"
                        >
                          {ev.emoji || "✨"}
                        </span>
                        <span>{ev.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/80">
                      <span>
                        {selected === ev.slug
                          ? t("selected", { fallback: "Selezionato" })
                          : t("cta.start", { fallback: "Scopri di più" })}
                      </span>
                      <span aria-hidden="true" className="text-base">
                        →
                      </span>
                    </div>
                  </div>
                </div>
                {!isAvailable && (
                  <span className="absolute top-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-muted-fg shadow-sm">
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
