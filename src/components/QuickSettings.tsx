"use client";

import CurrentEventSelector from "@/components/CurrentEventSelector";
import { AppButton } from "@/components/ui/AppButton";
import { COUNTRIES, LANGS } from "@/lib/loadConfigs";
import { getEventTypeCapability, normalizeEventType } from "@/lib/eventTypeCapabilities";
import { Settings, X } from "lucide-react";
import React from "react";
import { useTheme, type ThemePreference } from "@/components/ThemeProvider";
import { isSelectableLocale } from "@/i18n/languageCapabilities";
import { useTranslations } from "next-intl";

export default function QuickSettings() {
  const t = useTranslations("runtimeUi.settings");
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState<string>("it");
  const [country, setCountry] = React.useState<string>("it");
  const [eventType, setEventType] = React.useState<string>("wedding");

  const capability = getEventTypeCapability(eventType);

  React.useEffect(() => {
    const cookie = (name: string) =>
      document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"))?.[1];
    const candidateLanguage = localStorage.getItem("language") || cookie("language") || "it";
    const storedLanguage = isSelectableLocale(candidateLanguage) ? candidateLanguage : "it";
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
    if (!isSelectableLocale(lang)) return;
    persist("language", lang);
    persist("country", country);
    const currentLocale = document.documentElement?.lang || "it";
    window.location.href = `/${currentLocale || "it"}/dashboard`;
  }

  return (
    <>
      <button
        aria-label={t("settings")}
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
          aria-label={t("close")}
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
            <h3 id="quick-settings-title" className="font-semibold text-xl text-gray-900">{t("settings")}</h3>
            <button type="button" className="app-button app-button--ghost app-button--icon" onClick={() => setOpen(false)} aria-label={t("close")}>
              <X size={20} aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            <fieldset className="app-field">
              <legend className="app-label">{t("theme")}</legend>
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as ThemePreference[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className="onboarding-choice min-h-11 px-2 py-2 text-center text-sm"
                    aria-pressed={preference === theme}
                    onClick={() => setPreference(theme)}
                  >
                    {t(theme)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="app-field">
              <label className="app-label" htmlFor="quick-settings-language">{t("language")}</label>
              <select id="quick-settings-language" className="app-select" value={lang} onChange={(event) => setLang(event.target.value)}>
                {LANGS.map((item) => (
                  <option key={item.slug} value={item.slug} disabled={!item.available}>
                    {item.emoji} {item.label} {!item.available ? `(${t("comingSoon")})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-field">
              <label className="app-label" htmlFor="quick-settings-country">{t("country")}</label>
              <select id="quick-settings-country" className="app-select" value={country} onChange={(event) => setCountry(event.target.value)}>
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code} disabled={!item.available}>
                    {item.emoji} {item.label} {!item.available ? `(${t("comingSoon")})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="app-field">
              <p className="app-label">{t("currentEvent")}</p>
              <CurrentEventSelector />
            </div>

            <div className="app-field">
              <p className="app-label">{t("eventType")}</p>
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
              <p className="mt-2 text-xs leading-relaxed text-muted-fg">{t("locked")}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton variant="outline" onClick={() => setOpen(false)}>{t("close")}</AppButton>
            <AppButton onClick={applyChanges}>{t("apply")}</AppButton>
          </div>
        </div>
      )}
    </>
  );
}
