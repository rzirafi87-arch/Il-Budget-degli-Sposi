"use client";

import { getBrowserClient } from "@/lib/supabaseBrowser";
import { useAppContext } from "@/providers/AppContext";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EventOption = { code: string; name: string; description?: string };
type CountryOption = { code: string; name: string; emoji?: string };
type LocaleOption = { code: string; name: string; native_name?: string; rtl?: boolean };

export default function WizardPage() {
  const { locale, countryCode, eventType, setLocale, setCountryCode, setEventType } = useAppContext();
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [locales, setLocales] = useState<LocaleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [eventsRes, countriesRes, localesRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/countries"),
          fetch("/api/locales"),
        ]);
        if (!active) return;
        const eventsJson = await eventsRes.json();
        const countriesJson = await countriesRes.json();
        const localesJson = await localesRes.json();
        setEvents(eventsJson.events || []);
        setCountries(countriesJson.countries || []);
        setLocales(localesJson.locales || []);
      } catch (err) {
        console.error("Wizard load error", err);
        if (active) setError("Errore nel caricamento delle opzioni");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const canComplete = Boolean(eventType && countryCode && locale);

  const handleComplete = async () => {
    if (!canComplete) {
      setError("Completa tutti e tre gli step per procedere");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = getBrowserClient();
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        const { error: dbError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              preferred_locale: locale,
              country_code: countryCode,
              last_event_type: eventType,
            },
            { onConflict: "id", returning: "minimal" }
          );
        if (dbError) {
          throw dbError;
        }
      }
      router.replace(`/${locale}/dashboard`);
    } catch (cause) {
      console.error("wizard persist error", cause);
      setError("Non siamo riusciti a salvare le preferenze. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const selectEvent = (code: string) => {
    setEventType(code);
    setError(null);
  };

  const selectCountry = (code: string) => {
    setCountryCode(code);
    setError(null);
  };

  const selectLanguage = (code: string) => {
    setLocale(code);
    setError(null);
  };

  if (loading) {
    return (
      <section className="py-12 text-center text-gray-500">
        {t("wizard.loading", { fallback: "Caricamento delle opzioni..." })}
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4 sm:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                {t("wizard.title", { fallback: "Wizard linguistico" })}
              </p>
              <h1 className="text-2xl font-semibold text-gray-800">
                {t("wizard.headline", { fallback: "Configura lingua, paese ed evento" })}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              {t("wizard.subtitle", { fallback: "3 step per personalizzare la tua dashboard" })}
            </p>
          </div>
        </div>

        <section className="space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("wizard.stepLabel", { fallback: "Step 1 • Evento" })}
                </p>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("wizard.eventStepTitle", { fallback: "Tipo di evento" })}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("wizard.eventStepDesc", { fallback: "Seleziona un tipo di evento per guidare i contenuti" })}
                </p>
              </div>
              <span className="text-sm font-semibold text-sage-700">
                {eventType
                  ? eventType
                  : t("wizard.pendingEvent", { fallback: "Ancora da scegliere" })}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => selectEvent(item.code)}
                  className={`flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring ${
                    eventType === item.code
                      ? "border-[#A3B59D] bg-[#F1F6F1] shadow"
                      : "border-gray-200 hover:border-slate-300"
                  }`}
                  aria-pressed={eventType === item.code}
                >
                  <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                  <p className="text-sm text-gray-600">{item.description || t("wizard.eventDefaultTag", { fallback: "Scegli in base alle tue esigenze" })}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("wizard.stepLabelCountry", { fallback: "Step 2 • Paese" })}
                </p>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("wizard.countryStepTitle", { fallback: "Paese" })}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("wizard.countryStepDesc", { fallback: "Scegli il paese principale per adattare contenuti e fornitori" })}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {countryCode || t("wizard.pendingCountry", { fallback: "Ancora da scegliere" })}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {countries.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => selectCountry(item.code)}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring ${
                    countryCode === item.code
                      ? "border-[#A3B59D] bg-[#F1F6F1]"
                      : "border-gray-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-lg">{item.emoji || "🌍"}</span>
                  <span className="truncate font-semibold text-gray-800">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("wizard.stepLabelLanguage", { fallback: "Step 3 • Lingua" })}
                </p>
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("wizard.languageStepTitle", { fallback: "Lingua" })}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("wizard.languageStepDesc", { fallback: "Seleziona l'interfaccia che preferisci" })}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {locale}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {locales.map((locItem) => (
                <button
                  key={locItem.code}
                  type="button"
                  onClick={() => selectLanguage(locItem.code)}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring ${
                    locale === locItem.code
                      ? "border-[#A3B59D] bg-[#F1F6F1]"
                      : "border-gray-200 hover:border-slate-300"
                  }`}
                >
                  {locItem.native_name || locItem.name || locItem.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 text-sm sm:text-base sm:flex-row sm:items-center sm:justify-between">
          <p className="min-h-[1.25rem] text-red-600">{error}</p>
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canComplete || saving}
            className="inline-flex items-center justify-center rounded-full border border-[#A3B59D] bg-[#A3B59D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8da182] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? t("wizard.saving", { fallback: "Salvataggio..." })
              : t("wizard.cta", { fallback: "Vai alla dashboard" })}
          </button>
        </div>
      </div>
    </section>
  );
}
