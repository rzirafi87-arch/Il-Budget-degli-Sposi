"use client";
import React from "react";

const LANGS = [
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
];

const COUNTRIES = [
  { code: "it", label: "Italia" },
  { code: "mx", label: "Messico" },
  { code: "es", label: "Spagna" },
  { code: "fr", label: "Francia" },
  { code: "in", label: "India" },
  { code: "jp", label: "Giappone" },
  { code: "uk", label: "UK" },
  { code: "ae", label: "UAE" },
  { code: "us", label: "USA" },
];

const EVENT_TYPES = [
  { code: "wedding", label: "Matrimonio" },
  { code: "baptism", label: "Battesimo" },
  { code: "turning-18", label: "Diciottesimo" },
  { code: "anniversary-50", label: "50° Anniversario" },
  { code: "turning-50", label: "50 Anni" },
  { code: "retirement", label: "Pensione" },
  { code: "confirmation", label: "Cresima" },
  { code: "graduation", label: "Laurea" },
];

export default function QuickSettings() {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState<string>("it");
  const [country, setCountry] = React.useState<string>("it");
  const [eventType, setEventType] = React.useState<string>("wedding");

  React.useEffect(() => {
    const cookie = (name: string) => document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
    const l = localStorage.getItem("language") || cookie("language") || "it";
    const c = localStorage.getItem("country") || cookie("country") || "it";
    const e = localStorage.getItem("eventType") || cookie("eventType") || "wedding";
    setLang(l);
    setCountry(c);
    setEventType(e);
  }, []);

  // Consenti apertura dal bottone in header
  React.useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-quick-settings", handler as any);
    return () => window.removeEventListener("open-quick-settings", handler as any);
  }, []);

  function persist(name: string, value: string) {
    localStorage.setItem(name, value);
    document.cookie = `${name}=${value}; Path=/; Max-Age=15552000; SameSite=Lax`;
  }

  function applyChanges(newLang = lang, newCountry = country, newEventType = eventType) {
    persist("language", newLang);
    persist("country", newCountry);
    persist("eventType", newEventType);
    if (newEventType !== "wedding") {
      window.location.href = "/coming-soon";
    } else {
      window.location.reload();
    }
  }

  return (
    <>
      <button
        aria-label="Impostazioni"
        className="fixed bottom-5 right-5 z-[60] rounded-full shadow-lg text-white px-4 h-12 flex items-center gap-2"
        style={{ background: "var(--color-sage)" }}
        onClick={() => setOpen(!open)}
      >
        ⚙️ <span className="font-semibold">Impostazioni</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="fixed bottom-20 right-5 z-[61] w-80 p-4 rounded-2xl bg-white shadow-2xl border border-gray-200">
          <h3 className="font-semibold mb-3">Impostazioni</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Lingua</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Nazione evento</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo evento</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                {EVENT_TYPES.map(ev => <option key={ev.code} value={ev.code}>{ev.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button className="px-4 py-2 rounded border" onClick={() => setOpen(false)}>Chiudi</button>
            <button className="px-4 py-2 rounded text-white" style={{ background: "var(--color-sage)" }} onClick={() => applyChanges()}>Applica</button>
          </div>
        </div>
      )}
    </>
  );
}
