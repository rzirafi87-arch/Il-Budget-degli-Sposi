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
  { code: "es-ES", label: "Español", active: flags.es_ui },
  { code: "fr-FR", label: "Français", active: flags.fr_ui },
  { code: "de-DE", label: "Deutsch", active: false },
  { code: "ru", label: "Русский", active: false },
  { code: "zh-CN", label: "中文", active: flags.zh_ui },
  { code: "ja-JP", label: "日本語", active: false },
  { code: "ar", label: "العربية", rtl: true, active: false },
  { code: "hi-IN", label: "हिन्दी", active: flags.country_india },
  { code: "pt-PT", label: "Português", active: flags.pt_ui },
];

export type CountryInfo = {
  code: string;
  label: string;
  active: boolean;
};

export const COUNTRIES: CountryInfo[] = [
  { code: "IT", label: "Italia", active: true },
  { code: "MX", label: "Messico", active: flags.country_mexico },
  { code: "ES", label: "Spagna", active: true },
  { code: "FR", label: "Francia", active: true },
  { code: "IN", label: "India", active: flags.country_india },
  { code: "JP", label: "Giappone", active: true },
  { code: "GB", label: "Regno Unito", active: true },
  { code: "AE", label: "Emirati Arabi Uniti", active: true },
  { code: "US", label: "Stati Uniti", active: true },
  { code: "BR", label: "Brasile", active: true },
  { code: "DE", label: "Germania", active: true },
  { code: "CA", label: "Canada", active: true },
  { code: "CN", label: "Cina", active: true },
  { code: "ID", label: "Indonesia", active: true },
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
