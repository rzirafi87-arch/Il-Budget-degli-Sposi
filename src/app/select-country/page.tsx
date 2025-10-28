"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabaseServer";


const countries = [
  { code: "it", name: "Italia", flag: "🇮🇹" },
  { code: "mx", name: "Messico", flag: "🇲🇽" },
  { code: "es", name: "Spagna", flag: "🇪🇸" },
  { code: "fr", name: "Francia", flag: "🇫🇷" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "jp", name: "Giappone", flag: "🇯🇵" },
  { code: "uk", name: "UK", flag: "🇬🇧" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
  { code: "us", name: "USA", flag: "🇺🇸" },
];

export default function SelectCountryPage() {
  // On mount, se la lingua non è selezionata, torna a /select-language
  // Se la nazione è già selezionata, vai avanti
  React.useEffect(() => {
    const lang = localStorage.getItem("language");
    if (!lang) {
      window.location.href = "/select-language";
      return;
    }
    const country = localStorage.getItem("country");
    if (country) {
      window.location.href = "/select-event-type";
    }
  }, []);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  async function handleSelect(code: string) {
    setError(null);
    localStorage.setItem("country", code);
    setSelectedCountry(code);
    // Chiamata API in background, non blocca il pulsante
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
        // Silenzia errori, la dashboard gestirà eventuali fallback
      }
    })();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#A3B59D]/30 to-[#F9F9F9]">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-lg bg-white/90 border border-gray-200">
        <h1 className="text-3xl font-serif font-bold text-center mb-6">Dove si svolgerà il matrimonio?</h1>
        <p className="text-center text-gray-600 mb-6 text-base">Seleziona la nazione in cui si terrà l’evento, indipendentemente da dove vivi o dalla lingua del browser.</p>
        <div className="grid grid-cols-2 gap-4">
          {countries.map((c) => (
            <button
              key={c.code}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 hover:bg-[#A3B59D]/10 text-lg font-semibold transition-all w-full justify-center ${selectedCountry === c.code ? 'ring-2 ring-[#A3B59D]' : ''}`}
              onClick={() => handleSelect(c.code)}
              disabled={loading}
            >
              <span className="text-2xl">{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        {selectedCountry && (
          <button
            className="mt-8 w-full bg-[#A3B59D] text-white py-3 px-6 rounded font-semibold hover:bg-[#8da182] transition-colors text-lg"
            onClick={() => router.push("/dashboard")}
          >
            Vai alla Dashboard
          </button>
        )}
        {loading && (
          <div className="mt-6 text-center text-[#A3B59D] font-semibold">Creazione evento in corso...</div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-500 font-semibold">{error}</div>
        )}
      </div>
    </main>
  );
}
