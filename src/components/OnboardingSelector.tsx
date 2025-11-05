"use client";

import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "it";

  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [selectedCountry, setSelectedCountry] = useState("it");
  const [selectedEvent, setSelectedEvent] = useState("wedding");

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Salva in localStorage e cookie
    localStorage.setItem("language", langCode);
    document.cookie = `language=${langCode}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    // Salva preferenza in localStorage e cookie
    localStorage.setItem("country", countryCode);
    document.cookie = `country=${countryCode}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    // Salva preferenza in localStorage e cookie
    localStorage.setItem("eventType", eventId);
    document.cookie = `eventType=${eventId}; Path=/; Max-Age=15552000; SameSite=Lax`;
  };

  const handleContinue = () => {
    // Salva tutte le preferenze selezionate
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("language", selectedLanguage);
    localStorage.setItem("country", selectedCountry);
    localStorage.setItem("eventType", selectedEvent);
    
    // Salva anche nei cookie per persistenza
    document.cookie = `language=${selectedLanguage}; Path=/; Max-Age=15552000; SameSite=Lax`;
    document.cookie = `country=${selectedCountry}; Path=/; Max-Age=15552000; SameSite=Lax`;
    document.cookie = `eventType=${selectedEvent}; Path=/; Max-Age=15552000; SameSite=Lax`;
    
    // Naviga DIRETTAMENTE alla dashboard senza passare da altre pagine
    router.push("/dashboard");
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Content Container */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex-1">
        {/* Header - In alto dentro il container */}
        <div className="bg-linear-to-r from-[#A3B59D]/10 to-[#A3B59D]/5 border border-[#A3B59D]/20 rounded-lg p-8 mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Personalizza la tua esperienza
            </h1>
            <p className="text-lg text-gray-600">
              Seleziona la lingua, il paese e il tipo di evento per iniziare
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Language Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🌍 Lingua
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {LANGS.map((lang) => (
              <option 
                key={lang.slug} 
                value={lang.slug}
                disabled={!lang.available}
              >
                {lang.emoji} {lang.label}{!lang.available ? " (Coming Soon)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Country Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            📍 Paese
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {COUNTRIES.map((country) => (
              <option 
                key={country.code} 
                value={country.code}
                disabled={!country.available}
              >
                {country.emoji} {country.label}{!country.available ? " (Coming Soon)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-[#A3B59D] transition-colors">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎉 Tipo di Evento
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3B59D] focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {EVENTS.map((event) => (
              <option 
                key={event.slug} 
                value={event.slug}
                disabled={!event.available}
              >
                {event.emoji} {event.label}{!event.available ? " (Coming Soon)" : ""}
              </option>
            ))}
          </select>
        </div>
        </div>

        {/* Info Card */}
        <div className="bg-linear-to-r from-[#A3B59D]/10 to-[#A3B59D]/5 rounded-lg p-6 border border-[#A3B59D]/20 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Le tue preferenze vengono salvate automaticamente
              </h3>
              <p className="text-sm text-gray-600">
                Puoi modificare queste impostazioni in qualsiasi momento. I contenuti,
                i fornitori e le funzionalità verranno personalizzati in base alle tue scelte.
              </p>
            </div>
          </div>
        </div>

        {/* Pulsante Continua */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleContinue}
            className="bg-[#A3B59D] hover:bg-[#8fa188] text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-lg"
          >
            Continua
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}