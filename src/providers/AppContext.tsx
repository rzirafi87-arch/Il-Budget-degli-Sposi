"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type AppContextValue = {
  locale: string;
  countryCode?: string;
  eventType?: string;
  setLocale: (value: string) => void;
  setCountryCode: (value?: string) => void;
  setEventType: (value?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppContextProviderProps = {
  children: ReactNode;
  initialLocale: string;
  initialCountryCode?: string;
  initialEventType?: string;
};

const writeCookie = (name: string, value: string | undefined) => {
  if (typeof document === "undefined") return;
  if (!value) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${name}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const writeStorage = (key: string, value: string | undefined) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
};

export function AppContextProvider({
  children,
  initialLocale,
  initialCountryCode,
  initialEventType,
}: AppContextProviderProps) {
  const [locale, setLocale] = useState(initialLocale);
  const [countryCode, setCountryCode] = useState<string | undefined>(initialCountryCode);
  const [eventType, setEventType] = useState<string | undefined>(initialEventType);

  useEffect(() => {
    writeCookie("locale", locale);
    writeCookie("language", locale);
    writeStorage("language", locale);
  }, [locale]);

  useEffect(() => {
    writeCookie("country_code", countryCode);
    writeCookie("country", countryCode);
    writeStorage("country", countryCode);
  }, [countryCode]);

  useEffect(() => {
    writeCookie("event_type", eventType);
    writeCookie("eventType", eventType);
    writeStorage("eventType", eventType);
  }, [eventType]);

  const value = useMemo(
    () => ({
      locale,
      countryCode,
      eventType,
      setLocale,
      setCountryCode,
      setEventType,
    }),
    [locale, countryCode, eventType]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
