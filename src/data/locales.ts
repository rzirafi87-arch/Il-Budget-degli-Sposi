import { flags } from "@/config/flags";

/**
 * Locale Configuration
 * Single source of truth for supported languages and their active status
 */

export type LocaleInfo = {
  code: string;
  label: string;
  rtl?: boolean;
  active: boolean;
};

export const LOCALES: LocaleInfo[] = [
  { code: "it-IT", label: "Italiano", active: true },
  { code: "en-GB", label: "English", active: flags.en_ui },
  { code: "es-ES", label: "Espa\u00F1ol", active: flags.es_ui },
  { code: "fr-FR", label: "Fran\u00E7ais", active: false },
  { code: "de-DE", label: "Deutsch", active: false },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", active: false },
  { code: "zh-CN", label: "\u4E2D\u6587", active: false },
  { code: "ja-JP", label: "\u65E5\u672C\u8A9E", active: false },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", rtl: true, active: false },
  { code: "hi-IN", label: "\u0939\u093F\u0928\u094D\u0926\u0940", active: flags.country_india },
];

export type CountryInfo = {
  code: string;
  label: string;
  active: boolean;
};

export const COUNTRIES: CountryInfo[] = [
  { code: "IT", label: "Italia", active: true },
  { code: "MX", label: "Messico", active: flags.country_mexico },
  { code: "ES", label: "Spagna", active: false },
  { code: "FR", label: "Francia", active: false },
  { code: "IN", label: "India", active: flags.country_india },
  { code: "JP", label: "Giappone", active: false },
  { code: "GB", label: "Regno Unito", active: false },
  { code: "AE", label: "Emirati Arabi Uniti", active: false },
  { code: "US", label: "Stati Uniti", active: false },
  { code: "BR", label: "Brasile", active: false },
  { code: "DE", label: "Germania", active: false },
  { code: "CA", label: "Canada", active: false },
  { code: "CN", label: "Cina", active: false },
  { code: "ID", label: "Indonesia", active: false },
];

/**
 * Helper to get active locales only
 */
export function getActiveLocales(): LocaleInfo[] {
  return LOCALES.filter((l) => l.active);
}

/**
 * Helper to get active countries only
 */
export function getActiveCountries(): CountryInfo[] {
  return COUNTRIES.filter((c) => c.active);
}

/**
 * Get locale info by code
 */
export function getLocaleInfo(code: string): LocaleInfo | undefined {
  return LOCALES.find((l) => l.code === code);
}

/**
 * Get country info by code
 */
export function getCountryInfo(code: string): CountryInfo | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
