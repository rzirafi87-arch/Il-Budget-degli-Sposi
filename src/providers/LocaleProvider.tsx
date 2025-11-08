"use client";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type CountryCode, type EventType, type Locale } from "@/lib/i18n";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Prefs = { locale: Locale; country?: CountryCode; eventType?: EventType };
type Ctx = Prefs & {
  setLocale: (l: Locale) => void;
  setCountry: (c?: CountryCode) => void;
  setEventType: (e?: EventType) => void;
};

const Ctx = createContext<Ctx | null>(null);

export function LocaleProvider({ children, initial }: { children: React.ReactNode; initial?: Partial<Prefs>; }) {
  const sb = useMemo(() => createClientComponentClient(), []);
  const [locale, setLocale] = useState<Locale>((initial?.locale as Locale) || DEFAULT_LOCALE);
  const [country, setCountry] = useState<CountryCode | undefined>(initial?.country);
  const [eventType, setEventType] = useState<EventType | undefined>(initial?.eventType);

  // persist in cookie/localStorage
  useEffect(() => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    try {
      localStorage.setItem("prefs", JSON.stringify({ locale, country, eventType }));
    } catch {}
  }, [locale, country, eventType]);

  // opzionale: persistenza profilo se loggato
  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      await sb.from("profiles").update({
        preferred_locale: locale,
        country_code: country ?? null,
        last_event_type: eventType ?? null,
      }).eq("id", user.id);
    })();
  }, [sb, locale, country, eventType]);

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
