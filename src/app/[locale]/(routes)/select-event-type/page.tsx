"use client";

import TopBarSelector from "@/components/TopBarSelector";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";
import { EVENT_CONFIGS } from "@/constants/eventConfigs";
import {
  EVENT_TYPE_CAPABILITIES,
  getEventTypeCapability,
} from "@/lib/eventTypeCapabilities";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const STATUS_COPY = {
  it: {
    ready: "Disponibile",
    comingSoon: "Coming Soon",
    description: "Non ancora disponibile",
    selected: "Selezionato",
    start: "Inizia",
    creating: "Creazione del tuo evento…",
    genericError: "Impossibile completare la configurazione",
    progress: "Passaggio 3 di 3",
  },
  en: {
    ready: "Available",
    comingSoon: "Coming Soon",
    description: "Not available yet",
    selected: "Selected",
    start: "Start",
    creating: "Creating your event…",
    genericError: "Unable to complete the setup",
    progress: "Step 3 of 3",
  },
  es: {
    ready: "Disponible",
    comingSoon: "Coming Soon",
    description: "Aún no disponible",
    selected: "Seleccionado",
    start: "Empezar",
    creating: "Creando tu evento…",
    genericError: "No se puede completar la configuración",
    progress: "Paso 3 de 3",
  },
} as const;

export default function SelectEventTypePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const language = locale === "en" ? "en" : locale === "es" ? "es" : "it";
  const statusCopy = STATUS_COPY[language];
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");

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

  useEffect(() => {
    try {
      const cookieLang = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
      const lsLang = localStorage.getItem("language");
      const lsCountry = localStorage.getItem("country");
      if (!(cookieLang || lsLang)) {
        router.replace(`/${locale}/select-language`);
        return;
      }
      if (!(cookieCountry || lsCountry)) {
        router.replace(`/${locale}/select-country`);
        return;
      }
      if (lsLang && !cookieLang) {
        document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      }
      if (lsCountry && !cookieCountry) {
        document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
      }
    } catch {
      // Client-only onboarding state; nothing to do during SSR.
    }
  }, [router, locale]);

  const events = useMemo(() => {
    const configs = EVENT_CONFIGS as Record<string, { name: string; emoji: string }>;
    return Object.entries(EVENT_TYPE_CAPABILITIES).map(([slug, capability]) => ({
      slug,
      label: t(`events.${slug}`),
      emoji: configs[slug]?.emoji || "✨",
      capability,
    }));
  }, [t]);

  async function handleSelect(code: string) {
    const capability = getEventTypeCapability(code);
    if (saving || capability.availabilityStatus !== "READY") return;

    setSaving(true);
    setError(null);
    try {
      localStorage.setItem("eventType", code);
      document.cookie = `eventType=${code}; Path=/; Max-Age=15552000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("event-type-changed", { detail: code }));
      setSelected(code);

      const { data, error: sessionError } = await getBrowserClient().auth.getSession();
      const accessToken = data.session?.access_token;
      if (sessionError || !accessToken) {
        router.replace(`/${locale}/auth`);
        return;
      }

      const response = await fetch("/api/event/ensure-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ eventType: code, country, language: locale }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || statusCopy.genericError);
      }

      router.replace(`/${locale}/dashboard`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : statusCopy.genericError);
      setSaving(false);
    }
  }

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
      <div className="onboarding-panel max-w-3xl">
        <div className="onboarding-progress" aria-label={statusCopy.progress}>
          <span className="onboarding-progress__step" />
          <span className="onboarding-progress__step" />
          <span className="onboarding-progress__step onboarding-progress__step--active" />
        </div>
        <div className="mb-6 flex justify-end">
          <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-[#A3B59D]/40 bg-[#F8FBF7] px-4 py-3 text-sm text-gray-700 shadow-sm sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold text-center sm:text-left">
              {t("onboarding.selectLanguageTitle")}
              <span aria-hidden className="mx-1 hidden sm:inline">/</span>
              <br className="sm:hidden" />
              {t("onboarding.selectCountryTitle")}
            </span>
            <div className="self-center sm:self-auto"><TopBarSelector /></div>
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🎉</span>
          {t("onboarding.selectEventTypeTitle")}
        </h1>

        {tradition && <div className="mb-6"><WeddingTraditionInfo tradition={tradition} /></div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const isReady = event.capability.availabilityStatus === "READY";
            const isSelected = selected === event.slug;
            return (
              <button
                key={event.slug}
                type="button"
                disabled={!isReady || saving}
                className={`group relative overflow-hidden rounded-2xl border bg-white transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg ${
                  isReady
                    ? isSelected
                      ? "border-primary shadow-lg"
                      : "border-border shadow-sm hover:border-primary"
                    : "cursor-not-allowed border-border/60 opacity-75"
                }`}
                onClick={() => void handleSelect(event.slug)}
                aria-pressed={isSelected}
                aria-disabled={!isReady}
              >
                <div className="relative min-h-44 w-full bg-linear-to-br from-[#f7f1ec] to-[#e1ece5]">
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-left text-fg">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2 text-lg font-semibold">
                          <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-soft-sm">
                            {event.emoji}
                          </span>
                          <span>{event.label}</span>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          isReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                        }`}>
                          {isReady ? statusCopy.ready : statusCopy.comingSoon}
                        </span>
                      </div>
                      {!isReady && <p className="mt-4 text-sm text-muted-fg">{event.capability.description[language]}</p>}
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-fg">
                      <span>{isReady ? (isSelected ? statusCopy.selected : statusCopy.start) : statusCopy.description}</span>
                      {isReady && <span aria-hidden="true" className="text-base">→</span>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {saving && <p className="mt-6 text-center font-semibold text-[#7A8A74]">{statusCopy.creating}</p>}
        {error && <p className="mt-6 text-center font-semibold text-red-600" role="alert">{error}</p>}
      </div>
    </main>
  );
}
