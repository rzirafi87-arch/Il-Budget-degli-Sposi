"use client";

import { locales, defaultLocale } from "@/i18n/config";
import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OnboardingSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useMemo(() => {
    if (!pathname) return defaultLocale;
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    return locales.includes(first as (typeof locales)[number]) ? (first as string) : defaultLocale;
  }, [pathname]);

  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [selectedCountry, setSelectedCountry] = useState("it");
  const [selectedEvent, setSelectedEvent] = useState("wedding");
  const [showSelector, setShowSelector] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("onboardingComplete") !== "true";
  });

  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("language");
      const storedCountry = localStorage.getItem("country");
      const storedEvent = localStorage.getItem("eventType");
      if (storedLang) setSelectedLanguage(storedLang);
      if (storedCountry) setSelectedCountry(storedCountry);
      if (storedEvent) setSelectedEvent(storedEvent);
    } catch {
      // ignore
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    localStorage.setItem("language", langCode);
    document.cookie = `language=${langCode}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem("country", countryCode);
    document.cookie = `country=${countryCode}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    localStorage.setItem("eventType", eventId);
    document.cookie = `eventType=${eventId}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleContinue = () => {
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("language", selectedLanguage);
    localStorage.setItem("country", selectedCountry);
    localStorage.setItem("eventType", selectedEvent);

    document.cookie = `language=${selectedLanguage}; Path=/; Max-Age=15552000; SameSite=Lax`;
    document.cookie = `country=${selectedCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
    document.cookie = `eventType=${selectedEvent}; Path=/; Max-Age=15552000; SameSite=Lax`;

    const targetLocale = locales.includes(selectedLanguage as (typeof locales)[number]) ? selectedLanguage : currentLocale;
    setShowSelector(false);
    router.push(`/${targetLocale}/dashboard`);
  };

  if (!showSelector) return null;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/80 backdrop-blur border border-[#A3B59D]/30 rounded-3xl shadow-xl px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-[#7A8A74] font-semibold">Setup rapido</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">Personalizza la tua esperienza</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            Scegli lingua, Paese e tipo di evento per ricevere dashboard e consigli su misura.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#4F5D4B] bg-[#A3B59D]/15 border border-[#A3B59D]/30 rounded-full px-5 py-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#6F7E69] font-semibold shadow">
            1
          </span>
          Completa le preferenze iniziali e passa alla dashboard.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">🌐 Lingua</label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {LANGS.map((lang) => (
              <option key={lang.slug} value={lang.slug} disabled={!lang.available}>
                {lang.emoji} {lang.label}
                {!lang.available ? " (presto disponibile)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">📍 Paese</label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code} disabled={!country.available}>
                {country.emoji} {country.label}
                {!country.available ? " (presto disponibile)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">🎉 Tipo di evento</label>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {EVENTS.map((event) => (
              <option key={event.slug} value={event.slug} disabled={!event.available}>
                {event.emoji} {event.label}
                {!event.available ? " (presto disponibile)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-linear-to-r from-[#A3B59D]/10 to-[#A3B59D]/5 rounded-2xl p-6 border border-[#A3B59D]/20 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Le tue preferenze vengono salvate automaticamente</h3>
            <p className="text-sm text-gray-600">
              Puoi cambiarle in seguito da Impostazioni. L&apos;app userà queste informazioni per mostrarti contenuti, fornitori
              e funzionalità coerenti con il tuo evento.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleContinue}
          className="bg-[#A3B59D] hover:bg-[#8fa188] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-lg"
        >
          Continua
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
