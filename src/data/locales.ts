import { flags } from "@/config/flags";
import { languageCapabilities } from "@/i18n/languageCapabilities";

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

export const LOCALES: LocaleInfo[] = languageCapabilities.map((language) => ({
  code: language.locale,
  label: language.nativeLabel,
  rtl: language.direction === "rtl" || undefined,
  active: language.selectable,
}));

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
