"use client";
import { COUNTRIES, EVENTS, LANGS } from "@/lib/loadConfigs";
import { useTranslations } from "next-intl";
import React from "react";
import { AppButton } from "@/components/ui/AppButton";
import { Settings, X } from "lucide-react";

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
        className="app-button app-button--primary app-button--icon fixed bottom-5 right-5 z-60 rounded-full shadow-soft-lg md:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="quick-settings-dialog"
      >
        <Settings size={20} aria-hidden />
      </button>
      {open && (
        <button className="fixed inset-0 z-59 h-auto w-auto bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="Chiudi impostazioni" />
      )}
      {open && (
        <div id="quick-settings-dialog" className="app-card app-card--md fixed inset-x-4 bottom-4 z-61 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-soft-xl sm:inset-x-auto sm:bottom-20 sm:right-5 sm:w-96" role="dialog" aria-modal="true" aria-labelledby="quick-settings-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 id="quick-settings-title" className="font-semibold text-xl text-gray-900">Impostazioni</h3>
            <button type="button" className="app-button app-button--ghost app-button--icon" onClick={() => setOpen(false)} aria-label="Chiudi impostazioni"><X size={20} aria-hidden /></button>
          </div>
          <div className="space-y-3">
            <div className="app-field">
              <label className="app-label">Lingua</label>
              <select className="app-select" value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGS.map(l => (
                  <option key={l.slug} value={l.slug} disabled={!l.available}>
                    {l.emoji} {l.label} {!l.available ? "(coming soon)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="app-field">
              <label className="app-label">Nazione evento</label>
              <select className="app-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} disabled={!c.available}>
                    {c.emoji} {c.label} {!c.available ? "(coming soon)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="app-field">
              <label className="app-label">Tipo evento</label>
              <select className="app-select" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                {EVENTS.map(ev => <option key={ev.slug} value={ev.slug}>{ev.emoji} {t(`events.${ev.slug}`, { fallback: ev.label })}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton variant="outline" onClick={() => setOpen(false)}>Chiudi</AppButton>
            <AppButton onClick={() => applyChanges()}>Applica modifiche</AppButton>
          </div>
        </div>
      )}
    </>
  );
}
