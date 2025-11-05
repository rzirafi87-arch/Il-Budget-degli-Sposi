"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Language = {
  code: string;
  name: string;
  flag: string;
};

type Country = {
  code: string;
  name: string;
  flag: string;
};

type EventType = {
  id: string;
  name: string;
  icon: string;
};

const languages: Language[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

const countries: Country[] = [
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "IN", name: "India", flag: "🇮🇳" },
];

const eventTypes: EventType[] = [
  { id: "matrimonio", name: "Matrimonio", icon: "💍" },
  { id: "compleanno", name: "Compleanno", icon: "🎂" },
  { id: "battesimo", name: "Battesimo", icon: "👶" },
  { id: "comunione", name: "Prima Comunione", icon: "🕊️" },
  { id: "cresima", name: "Cresima", icon: "✝️" },
  { id: "laurea", name: "Laurea", icon: "🎓" },
  { id: "pensione", name: "Pensione", icon: "🎉" },
  { id: "anniversario", name: "Anniversario", icon: "💑" },
  { id: "diciottesimo", name: "18° Compleanno", icon: "🎊" },
  { id: "cinquantesimo", name: "50° Compleanno", icon: "🎈" },
  { id: "engagement-party", name: "Festa di Fidanzamento", icon: "💕" },
  { id: "baby-shower", name: "Baby Shower", icon: "🍼" },
  { id: "gender-reveal", name: "Gender Reveal", icon: "👶" },
];

export default function OnboardingSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "it";

  const [selectedLanguage, setSelectedLanguage] = useState(currentLocale);
  const [selectedCountry, setSelectedCountry] = useState("IT");
  const [selectedEvent, setSelectedEvent] = useState("matrimonio");

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    // Aggiorna URL con nuova lingua
    const newPath = pathname.replace(`/${currentLocale}`, `/${langCode}`);
    router.push(newPath);
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    // Salva preferenza in localStorage
    localStorage.setItem("preferredCountry", countryCode);
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    // Salva preferenza in localStorage
    localStorage.setItem("preferredEventType", eventId);
  };

  const handleContinue = () => {
    // Naviga alla dashboard o pagina principale
    router.push(`/${selectedLanguage}/dashboard`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header - Spostato in alto */}
      <div className="bg-linear-to-r from-[#A3B59D]/10 to-[#A3B59D]/5 border-b border-[#A3B59D]/20 py-8">
        <div className="w-full max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Personalizza la tua esperienza
          </h1>
          <p className="text-lg text-gray-600">
            Seleziona la lingua, il paese e il tipo di evento per iniziare
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex-1">
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
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
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
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
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
            {eventTypes.map((event) => (
              <option key={event.id} value={event.id}>
                {event.icon} {event.name}
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