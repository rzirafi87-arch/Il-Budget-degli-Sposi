
import { flags } from "@/config/flags";

const ALL_LOCALES = [
  "it", "en", "es", "fr", "de", "ar", "hi", "ja", "zh", "mx", "pt", "ru", "id"
] as const;

type AllLocale = (typeof ALL_LOCALES)[number];

const localeAvailability: Record<AllLocale, boolean> = {
  it: true,
  en: flags.en_ui,
  es: flags.es_ui,
  fr: false,
  de: false,
  ar: false,
  hi: flags.country_india,
  ja: false,
  zh: false,
  mx: flags.country_mexico,
  pt: false,
  ru: false,
  id: false,
};

export const locales = ALL_LOCALES.filter((locale) => localeAvailability[locale]) as AllLocale[];
export type Locale = AllLocale;

export const defaultLocale: Locale = "it";

export const localeNames: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  hi: "हिन्दी",
  ja: "日本語",
  zh: "中文",
  mx: "Español (México)",
  pt: "Português",
  ru: "Русский",
  id: "Bahasa Indonesia",
};
