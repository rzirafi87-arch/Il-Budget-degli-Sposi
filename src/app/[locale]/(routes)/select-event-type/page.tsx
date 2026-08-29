"use client";
import TopBarSelector from "@/components/TopBarSelector";
import WeddingTraditionInfo, {
  WeddingTradition,
} from "@/components/WeddingTraditionInfo";
import { EVENT_CONFIGS } from "@/constants/eventConfigs";
import { getBrowserClient } from "@/lib/supabaseBrowser";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (lsLang && !cookieLang)
        document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      if (lsCountry && !cookieCountry)
        document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
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

  async function handleSelect(code: string) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      localStorage.setItem("eventType", code);
      document.cookie = `eventType=${code}; Path=/; Max-Age=15552000; SameSite=Lax`;
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
        throw new Error(payload.error || "Impossibile completare la configurazione");
      }

      const destination = DASHBOARD_EVENTS.has(code) ? "/dashboard" : "/coming-soon";
      router.replace(`/${locale}${destination}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile completare la configurazione");
      setSaving(false);
    }
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
      <div className="onboarding-panel max-w-3xl">
        <div className="onboarding-progress" aria-label="Passaggio 3 di 3">
          <span className="onboarding-progress__step" />
          <span className="onboarding-progress__step" />
          <span className="onboarding-progress__step onboarding-progress__step--active" />
        </div>
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
                disabled={!isAvailable || saving}
                className={`group relative overflow-hidden rounded-2xl border bg-white transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-bg ${
                  isAvailable
                    ? selected === ev.slug
                      ? "border-primary shadow-lg"
                      : "border-border shadow-sm hover:border-primary"
                    : "border-border/60 opacity-70 cursor-not-allowed"
                }`}
                onClick={() => isAvailable && handleSelect(ev.slug)}
                aria-pressed={selected === ev.slug}
              >
                <div className="relative min-h-40 w-full bg-linear-to-br from-[#f7f1ec] to-[#e1ece5]">
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-left text-fg">
                    <div>
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span
                          aria-hidden="true"
                          className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl shadow-soft-sm"
                        >
                          {ev.emoji || "✨"}
                        </span>
                        <span>{ev.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-fg">
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
        {saving && <p className="mt-6 text-center font-semibold text-[#7A8A74]">Creazione del tuo evento…</p>}
        {error && <p className="mt-6 text-center font-semibold text-red-600" role="alert">{error}</p>}
      </div>
    </main>
  );
}
