import { defaultLocale, publicLocales, type Locale } from "@/i18n/languageCapabilities";

export type { Locale };
export type CountryCode = string;  // "IT", "US", "MX", ...
export type EventType = "WEDDING" | "BABY_SHOWER" | "PROPOSAL";

export const SUPPORTED_LOCALES = publicLocales;
export const DEFAULT_LOCALE: Locale = defaultLocale;
