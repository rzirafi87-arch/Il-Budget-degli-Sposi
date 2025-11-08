"use client";
import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { useTranslations } from "next-intl";
import React from "react";

export default function QuickSettings() {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState<string>("it");
  const [country, setCountry] = React.useState<string>("it");
  const [eventType, setEventType] = React.useState<string>("wedding");

  React.useEffect(() => {
    const cookie = (name: string) => document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
    const l = localStorage.getItem("language") || cookie("language") || "it";
    let c = localStorage.getItem("country") || cookie("country") || "it";
    if (c === "uk") { c = "gb"; document.cookie = `country=gb; Path=/; Max-Age=15552000; SameSite=Lax`; localStorage.setItem("country", "gb"); }
    const e = localStorage.getItem("eventType") || cookie("eventType") || "wedding";
    setLang(l);
    setCountry(c);
    setEventType(e);
  }, []);

  React.useEffect(() => {
    const handler: EventListener = () => setOpen(true);
    window.addEventListener("open-quick-settings", handler);
    return () => window.removeEventListener("open-quick-settings", handler);
  }, []);

  function persist(name: string, value: string) {
    localStorage.setItem(name, value);
    document.cookie = `${name}=${value}; Path=/; Max-Age=15552000; SameSite=Lax`;
  }

  function applyChanges(newLang = lang, newCountry = country, newEventType = eventType) {
    persist("language", newLang);
    persist("country", newCountry);
    persist("eventType", newEventType);
    const currentLocale = document.documentElement?.lang || "it";
    const basePath = `/${currentLocale || "it"}`;
    const targetPath = ["wedding", "baptism", "eighteenth", "confirmation", "graduation", "communion"].includes(newEventType)
      ? "/dashboard"
      : "/coming-soon";
    window.location.href = `${basePath}${targetPath}`;
  }

  return (
    <>
      <button
        aria-label="Impostazioni"
        className="fixed bottom-5 right-5 z-60 rounded-full shadow-lg text-white px-4 h-12 flex items-center gap-2"
        style={{ background: "var(--color-sage)" }}
        onClick={() => setOpen(!open)}
      >
        <span role="img" aria-label="Impostazioni">⚙️</span> <span className="font-semibold">Impostazioni</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-59" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div className="fixed bottom-20 right-5 z-61 w-80 p-4 rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold mb-3 text-gray-900">Impostazioni</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-900">Lingua</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGS.map(l => (
                  <option key={l.slug} value={l.slug} disabled={!l.available}>
                    {l.emoji} {l.label} {!l.available ? "(coming soon)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Nazione evento</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} disabled={!c.available}>
                    {c.emoji} {c.label} {!c.available ? "(coming soon)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">Tipo evento</label>
              <select className="w-full border rounded px-3 py-2 mt-1" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                {EVENTS.map(ev => <option key={ev.slug} value={ev.slug}>{ev.emoji} {t(`events.${ev.slug}`, { fallback: ev.label })}</option>)}
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

