"use client";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";
import { COUNTRIES } from "@/lib/loadConfigs";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SelectCountryPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const [query, setQuery] = useState("");
  const language = (["it", "en", "fr", "es", "de"] as const).find(code => code === locale) || "it";
  const copy = {
    it: { search: "Cerca una nazione", empty: "Nessuna nazione trovata", soon: "In arrivo", progress: "Passaggio 2 di 3" },
    en: { search: "Search for a country", empty: "No countries found", soon: "Coming soon", progress: "Step 2 of 3" },
    fr: { search: "Rechercher un pays", empty: "Aucun pays trouvé", soon: "Bientôt disponible", progress: "Étape 2 sur 3" },
    es: { search: "Buscar un país", empty: "No se encontraron países", soon: "Próximamente", progress: "Paso 2 de 3" },
    de: { search: "Land suchen", empty: "Keine Länder gefunden", soon: "Demnächst", progress: "Schritt 2 von 3" },
  }[language];
  const countryNames = new Intl.DisplayNames([locale], { type: "region" });
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(locale).trim();
  const visibleCountries = COUNTRIES.map(country => ({ ...country, name: countryNames.of(country.code.toUpperCase()) || country.label }))
    .filter(country => normalize(`${country.name} ${country.label} ${country.code}`).includes(normalize(query)));

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);

  // Prefetch tradition preview when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    let active = true;
    setTradition(null);
    fetch(`/api/traditions?country=${encodeURIComponent(selectedCountry)}`)
      .then((r) => r.json())
      .then((d) => { if (active) setTradition((d.traditions && d.traditions[0]) || null); })
      .catch(() => { if (active) setTradition(null); });
    return () => { active = false; };
  }, [selectedCountry]);

  // Ensure language/country cookies, redirect if already set
  useEffect(() => {
    try {
      const cookieLang = document.cookie.match(/(?:^|; )language=([^;]+)/)?.[1];
      const lsLang = localStorage.getItem("language");
      const lang = cookieLang || lsLang;
      if (!lang) {
        router.replace(`/${locale}/select-language`);
        return;
      }
      if (!cookieLang && lsLang) {
        document.cookie = `language=${lsLang}; Path=/; Max-Age=15552000; SameSite=Lax`;
      }
      const cookieCountry = document.cookie.match(/(?:^|; )country=([^;]+)/)?.[1];
      const lsCountry = localStorage.getItem("country");
      if (cookieCountry || lsCountry) {
        if (!cookieCountry && lsCountry) {
          document.cookie = `country=${lsCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
        }
        router.replace(`/${locale}/select-event-type`);
      }
    } catch {
      // Ignore errors in SSR
    }
  }, [locale, router]);

  useEffect(() => {
    if (!selectedCountry) return;
    try {
      localStorage.setItem("country", selectedCountry);
      document.cookie = `country=${selectedCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
    } catch {
      // Lo storage può essere disabilitato dal browser.
    }
  }, [selectedCountry]);

  function handleSelect(code: string) {
    setSelectedCountry(code);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(1000px 500px at 0% 100%, rgba(163,181,157,0.2), transparent)," +
          "radial-gradient(800px 500px at 100% 0%, rgba(232,240,233,0.6), transparent)," +
          "linear-gradient(180deg, #f8fbf8, #eef5ef)",
        backgroundImage: "url(/backgrounds/select-country.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="onboarding-panel max-w-lg">
        <div className="onboarding-progress" aria-label={copy.progress}>
          <span className="onboarding-progress__step" />
          <span className="onboarding-progress__step onboarding-progress__step--active" />
          <span className="onboarding-progress__step" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🗺️</span>
          {t("onboarding.selectCountryTitle", { fallback: "Scegli il paese" })}
        </h1>
        <p className="text-center text-gray-600 mb-6 text-base">
          {t("onboarding.selectCountryDesc", { fallback: "Seleziona il paese per personalizzare i contenuti" })}
        </p>
        <label className="mb-4 grid gap-2">
          <span>{copy.search}</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white p-3" />
        </label>
        {visibleCountries.length === 0 && <p role="status" className="mb-4">{copy.empty}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleCountries.map((c) => (
            <button
              key={c.code}
              className="onboarding-choice w-full text-lg"
              onClick={() => c.available !== false && handleSelect(c.code)}
              disabled={c.available === false}
              aria-pressed={selectedCountry === c.code}
            >
              <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
              <span>{c.name}</span>
              {c.available === false && (
                <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {copy.soon}
                </span>
              )}
            </button>
          ))}
        </div>
        {tradition && (
          <div className="mt-6">
            <WeddingTraditionInfo tradition={tradition} />
          </div>
        )}
        {selectedCountry && (
          <button
            className="app-button app-button--primary app-button--lg mt-8 w-full"
            onClick={() => router.push(`/${locale}/select-event-type`)}
          >
            {t("onboarding.nextBtn", { fallback: "Avanti" })}
          </button>
        )}
      </div>
    </main>
  );
}
