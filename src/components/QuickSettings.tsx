"use client";

import { AppButton } from "@/components/ui/AppButton";
import { COUNTRIES, LANGS } from "@/lib/loadConfigs";
import { getEventTypeCapability, normalizeEventType } from "@/lib/eventTypeCapabilities";
import { Settings, X } from "lucide-react";
import React from "react";
import { useTheme, type ThemePreference } from "@/components/ThemeProvider";

const COPY = {
  it: {
    settings: "Impostazioni",
    language: "Lingua",
    country: "Nazione evento",
    eventType: "Tipo evento",
    theme: "Tema",
    light: "Chiaro",
    dark: "Scuro",
    system: "Sistema",
    locked: "Il tipo evento non può essere cambiato dopo la creazione: il cambio richiede una migrazione sicura dei dati.",
    close: "Chiudi",
    apply: "Applica modifiche",
    comingSoon: "coming soon",
  },
  en: {
    settings: "Settings",
    language: "Language",
    country: "Event country",
    eventType: "Event type",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    locked: "The event type cannot be changed after creation: changing it requires a safe data migration.",
    close: "Close",
    apply: "Apply changes",
    comingSoon: "coming soon",
  },
  es: {
    settings: "Ajustes",
    language: "Idioma",
    country: "País del evento",
    eventType: "Tipo de evento",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    locked: "El tipo de evento no puede cambiarse después de crearlo: el cambio requiere una migración segura de los datos.",
    close: "Cerrar",
    apply: "Aplicar cambios",
    comingSoon: "coming soon",
  },
} as const;

export default function QuickSettings() {
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState<string>("it");
  const [country, setCountry] = React.useState<string>("it");
  const [eventType, setEventType] = React.useState<string>("wedding");

  const language = lang === "en" ? "en" : lang === "es" ? "es" : "it";
  const copy = COPY[language];
  const capability = getEventTypeCapability(eventType);

  React.useEffect(() => {
    const cookie = (name: string) =>
      document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
    const storedLanguage = localStorage.getItem("language") || cookie("language") || "it";
    let storedCountry = localStorage.getItem("country") || cookie("country") || "it";
    if (storedCountry === "uk") {
      storedCountry = "gb";
      document.cookie = "country=gb; Path=/; Max-Age=15552000; SameSite=Lax";
      localStorage.setItem("country", "gb");
    }
    const storedEventType = normalizeEventType(localStorage.getItem("eventType") || cookie("eventType") || "wedding");
    setLang(storedLanguage);
    setCountry(storedCountry);
    setEventType(storedEventType);
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

  function applyChanges() {
    persist("language", lang);
    persist("country", country);
    const currentLocale = document.documentElement?.lang || "it";
    window.location.href = `/${currentLocale || "it"}/dashboard`;
  }

  return (
    <>
      <button
        aria-label={copy.settings}
        className="app-button app-button--primary app-button--icon fixed bottom-5 right-5 z-60 rounded-full shadow-soft-lg md:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="quick-settings-dialog"
      >
        <Settings size={20} aria-hidden />
      </button>

      {open && (
        <button
          className="fixed inset-0 z-59 h-auto w-auto bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-label={copy.close}
        />
      )}

      {open && (
        <div
          id="quick-settings-dialog"
          className="app-card app-card--md fixed inset-x-4 bottom-4 z-61 max-h-[calc(100vh-2rem)] overflow-y-auto shadow-soft-xl sm:inset-x-auto sm:bottom-20 sm:right-5 sm:w-96"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-settings-title"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 id="quick-settings-title" className="font-semibold text-xl text-gray-900">{copy.settings}</h3>
            <button type="button" className="app-button app-button--ghost app-button--icon" onClick={() => setOpen(false)} aria-label={copy.close}>
              <X size={20} aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            <fieldset className="app-field">
              <legend className="app-label">{copy.theme}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as ThemePreference[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className="onboarding-choice min-h-11 px-2 py-2 text-center text-sm"
                    aria-pressed={preference === theme}
                    onClick={() => setPreference(theme)}
                  >
                    {copy[theme]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="app-field">
              <label className="app-label">{copy.language}</label>
              <select className="app-select" value={lang} onChange={(event) => setLang(event.target.value)}>
                {LANGS.map((item) => (
                  <option key={item.slug} value={item.slug} disabled={!item.available}>
                    {item.emoji} {item.label} {!item.available ? `(${copy.comingSoon})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-field">
              <label className="app-label">{copy.country}</label>
              <select className="app-select" value={country} onChange={(event) => setCountry(event.target.value)}>
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code} disabled={!item.available}>
                    {item.emoji} {item.label} {!item.available ? `(${copy.comingSoon})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-field">
              <label className="app-label">{copy.eventType}</label>
              <div className="app-input flex items-center justify-between gap-3 bg-muted/50" aria-readonly="true">
                <span className="truncate font-semibold">{eventType}</span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  capability.availabilityStatus === "READY"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-800"
                }`}>
                  {capability.availabilityStatus === "READY" ? "READY" : "COMING SOON"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-fg">{copy.locked}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton variant="outline" onClick={() => setOpen(false)}>{copy.close}</AppButton>
            <AppButton onClick={applyChanges}>{copy.apply}</AppButton>
          </div>
        </div>
      )}
    </>
  );
}
