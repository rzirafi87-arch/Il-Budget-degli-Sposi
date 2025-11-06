export const locales = ["it", "en", "es", "fr", "de", "ar", "hi", "ja", "zh", "mx"] as const;
export type Locale = (typeof locales)[number];

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
};
