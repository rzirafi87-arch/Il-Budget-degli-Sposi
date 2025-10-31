"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabaseServer";
import { useTranslations } from "next-intl";
import WeddingTraditionInfo, { WeddingTradition } from "@/components/WeddingTraditionInfo";

const countries = [
  { code: "it", nameKey: "countries.it", flag: "🇮🇹" },
  { code: "mx", nameKey: "countries.mx", flag: "🇲🇽" },
  { code: "es", nameKey: "countries.es", flag: "🇪🇸" },
  { code: "fr", nameKey: "countries.fr", flag: "🇫🇷" },
  { code: "in", nameKey: "countries.in", flag: "🇮🇳" },
  { code: "jp", nameKey: "countries.jp", flag: "🇯🇵" },
  { code: "uk", nameKey: "countries.uk", flag: "🇬🇧" },
  { code: "ae", nameKey: "countries.ae", flag: "🇦🇪" },
  { code: "us", nameKey: "countries.us", flag: "🇺🇸" },
];

export default function SelectCountryPage() {
  const t = useTranslations();
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tradition, setTradition] = useState<WeddingTradition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefetch tradition preview when country changes
  useEffect(() => {
    if (!selectedCountry) return setTradition(null);
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
        router.replace("/select-language");
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
        router.replace("/select-event-type");
      }
    } catch {}
  }, []);

  async function handleSelect(code: string) {
    setError(null);
    localStorage.setItem("country", code);
    document.cookie = `country=${code}; Path=/; Max-Age=15552000; SameSite=Lax`;
    setSelectedCountry(code);
    (async () => {
      try {
        const supabase = getBrowserClient();
        const { data } = await supabase.auth.getSession();
        const jwt = data.session?.access_token;
        const headers: HeadersInit = {};
        if (jwt) headers.Authorization = `Bearer ${jwt}`;
        await fetch("/api/event/ensure-default", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({ country: code }),
        });
      } catch (e) {
        // non bloccare la UI
      }
    })();
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
          {t("onboarding.selectCountryTitle", { fallback: "Scegli il paese" })}
        </h1>
        <p className="text-center text-gray-600 mb-6 text-base">
          {t("onboarding.selectCountryDesc", { fallback: "Seleziona il paese per personalizzare i contenuti" })}
        </p>
        <div className="grid grid-cols-2 gap-4">
          {countries.map((c) => (
            <button
              key={c.code}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 hover:bg-[#A3B59D]/10 text-lg font-semibold transition-all w-full justify-center ${selectedCountry === c.code ? 'ring-2 ring-[#A3B59D]' : ''}`}
              onClick={() => handleSelect(c.code)}
              disabled={loading}
            >
              <span className="text-2xl" aria-hidden="true">{c.flag}</span>
              <span>{t(c.nameKey, { fallback: c.code.toUpperCase() })}</span>
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
            onClick={() => router.push("/select-event-type")}
          >
            {t("onboarding.nextBtn", { fallback: "Avanti" })}
          </button>
        )}
        {loading && (
          <div className="mt-6 text-center text-[#A3B59D] font-semibold">{t("onboarding.creatingEvent", { fallback: "Creazione evento in corso..." })}</div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-500 font-semibold">{error}</div>
        )}
      </div>
    </main>
  );
}
