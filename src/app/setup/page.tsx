"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const EVENTS = [
  { value: "matrimonio", label: "Matrimonio" },
  { value: "battesimo", label: "Battesimo" },
  { value: "compleanno", label: "Compleanno" },
  // Aggiungi altri eventi se necessario
];

export default function SetupPage() {
  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");
  const [event, setEvent] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Salva le scelte (localStorage, API, ecc.)
    localStorage.setItem("setup_language", language);
    localStorage.setItem("setup_country", country);
    localStorage.setItem("setup_event", event);
    // Reindirizza alla dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-wedding-rose-floral">
      <h1 className="text-3xl font-bold mb-8 text-sage-900">Benvenuto! Configura il tuo evento</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md space-y-6">
        <div>
          <label className="block mb-2 font-semibold text-sage-700">Lingua</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            <option value="" disabled>Seleziona la lingua</option>
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-sage-700">Nazione</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            <option value="" disabled>Seleziona la nazione</option>
            {COUNTRIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-sage-700">Evento</label>
          <select
            value={event}
            onChange={e => setEvent(e.target.value)}
            className="w-full border border-sage-300 rounded px-3 py-2"
            required
          >
            <option value="" disabled>Seleziona l'evento</option>
            {EVENTS.map(ev => (
              <option key={ev.value} value={ev.value}>{ev.label}</option>
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
