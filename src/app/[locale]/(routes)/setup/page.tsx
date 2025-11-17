"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EVENT_CONFIGS } from "@/constants/eventConfigs";

const LANGUAGES = [
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const COUNTRIES = [
  { value: "it", label: "Italia" },
  { value: "mx", label: "Messico" },
  { value: "in", label: "India" },
];

export default function SetupPage() {
  const locale = useLocale();
  const router = useRouter();

  // Eventi generati dinamicamente dai config: value = slug canonico, label = nome IT
  const EVENTS = useMemo(
    () =>
      Object.entries(EVENT_CONFIGS).map(([slug, cfg]) => ({
        value: slug, // es: "wedding", "baptism", "birthday", ...
        label: cfg.name, // es: "Matrimonio", "Battesimo", ...
      })),
    []
  );

  const [language, setLanguage] = useState(locale || "it");
  const [country, setCountry] = useState("it");
  const [event, setEvent] = useState<string>("wedding"); // default coerente

  const setCookie = (k: string, v: string) => {
    document.cookie = `${k}=${encodeURIComponent(v)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Persisti in cookie con chiavi che il resto dell’app già legge
    setCookie("preferred_locale", language);
    setCookie("country_code", country);
    setCookie("event_type", event);

    // (opzionale) fallback anche su localStorage per UX client-only:
    localStorage.setItem("preferred_locale", language);
    localStorage.setItem("country_code", country);
    localStorage.setItem("event_type", event);

    router.push(`/${language}/dashboard`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wedding-rose-floral">
      <h1 className="text-3xl font-bold mb-8 text-sage-900">
        Benvenuto! Configura il tuo evento
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md space-y-6"
      >
        <div>
          <label className="block mb-2 font-semibold text-sage-700">
            Lingua
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-sage-700">
            Nazione
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-sage-700">
            Evento
          </label>
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            {EVENTS.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-[#A3B59D] text-white font-bold py-2 rounded hover:bg-[#8fa88a] transition"
        >
          Conferma
        </button>
      </form>
    </div>
  );
}
