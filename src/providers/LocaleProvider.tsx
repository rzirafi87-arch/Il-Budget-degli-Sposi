"use client";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type CountryCode, type EventType, type Locale } from "@/lib/i18n";
import { getBrowserClient } from "@/lib/supabaseBrowser";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSelectableLocale } from "@/i18n/languageCapabilities";

type Prefs = { locale: Locale; country?: CountryCode; eventType?: EventType };
type Ctx = Prefs & {
  setLocale: (l: Locale) => void;
  setCountry: (c?: CountryCode) => void;
  setEventType: (e?: EventType) => void;
};

const Ctx = createContext<Ctx | null>(null);

export function LocaleProvider({ children, initial }: { children: React.ReactNode; initial?: Partial<Prefs>; }) {
  const sb = useMemo(() => getBrowserClient(), []);
  const [locale, setLocale] = useState<Locale>((initial?.locale as Locale) || DEFAULT_LOCALE);
  const [country, setCountry] = useState<CountryCode | undefined>(initial?.country);
  const [eventType, setEventType] = useState<EventType | undefined>(initial?.eventType);

  // persist in cookie/localStorage
  useEffect(() => {
    if (!isSelectableLocale(locale)) return;
    document.cookie = `language=${locale};path=/;max-age=31536000;SameSite=Lax`;
    try {
      localStorage.setItem("language", locale);
      localStorage.setItem("prefs", JSON.stringify({ country, eventType }));
    } catch {}
  }, [locale, country, eventType]);

  // opzionale: persistenza profilo se loggato
  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      if (!isSelectableLocale(locale)) return;
      await sb.from("profiles").update({ preferred_locale: locale }).eq("id", user.id);
    })();
  }, [sb, locale]);

  useEffect(() => {
    if (!country) return;
    void (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (user) await sb.from("profiles").update({ country_code: country }).eq("id", user.id);
    })();
  }, [sb, country]);

  const value = useMemo<Ctx>(() => ({ locale, country, eventType, setLocale, setCountry, setEventType }), [locale, country, eventType]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLocale = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLocale must be used within LocaleProvider");
  return v;
};

export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(seg as Locale) ? (seg as Locale) : DEFAULT_LOCALE;
}
