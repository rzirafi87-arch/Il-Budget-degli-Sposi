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

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);

  // Prefetch tradition preview when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    fetch(`/api/traditions?country=${encodeURIComponent(selectedCountry)}`)
      .then((r) => r.json())
      .then((d) => setTradition((d.traditions && d.traditions[0]) || null))
      .catch(() => setTradition(null));
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
      <div className="max-w-md w-full p-8 rounded-2xl shadow-lg bg-white/90 border border-gray-200">
        <h1 className="text-3xl font-serif font-bold text-center mb-6">
          <span aria-hidden="true" className="mr-2">🗺️</span>
          {t("onboarding.selectCountryTitle", { fallback: "Scegli il paese" })}
        </h1>
        <p className="text-center text-gray-600 mb-6 text-base">
          {t("onboarding.selectCountryDesc", { fallback: "Seleziona il paese per personalizzare i contenuti" })}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 hover:bg-[#A3B59D]/10 text-lg font-semibold transition-all w-full justify-center ${selectedCountry === c.code ? 'ring-2 ring-[#A3B59D]' : ''}`}
              onClick={() => c.available !== false && handleSelect(c.code)}
              disabled={c.available === false}
            >
              <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
              <span>{new Intl.DisplayNames([document?.documentElement?.lang || 'it'], { type: 'region' }).of(c.code.toUpperCase()) || c.label}</span>
              {c.available === false && (
                <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  In arrivo
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
            className="mt-8 w-full bg-[#A3B59D] text-white py-3 px-6 rounded font-semibold hover:bg-[#8da182] transition-colors text-lg"
            onClick={() => router.push(`/${locale}/select-event-type`)}
          >
            {t("onboarding.nextBtn", { fallback: "Avanti" })}
          </button>
        )}
      </div>
    </main>
  );
}
