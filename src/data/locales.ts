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
  { code: "en-GB", label: "English", active: true },
  { code: "es-ES", label: "Español", active: false },
  { code: "fr-FR", label: "Français", active: false },
  { code: "de-DE", label: "Deutsch", active: false },
  { code: "ru", label: "Русский", active: false },
  { code: "zh-CN", label: "中文", active: false },
  { code: "ja-JP", label: "日本語", active: false },
  { code: "ar", label: "العربية", rtl: true, active: false },
  { code: "hi-IN", label: "हिन्दी", active: false },
];

export type CountryInfo = {
  code: string;
  label: string;
  active: boolean;
};

export const COUNTRIES: CountryInfo[] = [
  { code: "IT", label: "Italia", active: true },
  { code: "MX", label: "Messico", active: true },
  { code: "ES", label: "Spagna", active: false },
  { code: "FR", label: "Francia", active: false },
  { code: "IN", label: "India", active: false },
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
