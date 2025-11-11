import languages from "@/data/config/languages.json";
import countries from "@/data/config/countries.json";
import events from "@/data/config/events.json";
import { eventsRegistry, type EventKey } from "@/config/events.registry";
import { LOCALES as LOCALE_STATUS, COUNTRIES as COUNTRY_STATUS } from "@/data/locales";
import { locales as SUPPORTED_LOCALES } from "@/i18n/config";

type LanguageConfig = {
  slug: string;
  label: string;
  locale: string;
  dir: "ltr" | "rtl";
  emoji: string;
  available: boolean;
};

type CountryConfig = {
  code: string;
  label: string;
  emoji: string;
  available: boolean;
};

type EventConfig = {
  slug: string;
  label: string;
  emoji: string;
  group: string;
  available: boolean;
};

const activeLocaleSlugs = new Set(
  LOCALE_STATUS.filter((locale) => locale.active)
    .map((locale) => locale.code.split("-")[0]?.toLowerCase())
    .filter(Boolean),
);

const supportedLocaleSlugs = new Set(SUPPORTED_LOCALES);

const activeCountryCodes = new Set(
  COUNTRY_STATUS.filter((country) => country.active)
    .map((country) => country.code.toLowerCase())
    .filter(Boolean),
);

const normalizeLanguageAvailability = (lang: LanguageConfig) => ({
  ...lang,
  available:
    lang.available &&
    (supportedLocaleSlugs.has(lang.slug as (typeof SUPPORTED_LOCALES)[number]) ||
      activeLocaleSlugs.has(lang.slug.toLowerCase())),
});

const normalizeCountryAvailability = (country: CountryConfig) => ({
  ...country,
  available: country.available && activeCountryCodes.has(country.code.toLowerCase()),
});

export const LANGS = (languages as LanguageConfig[]).map(normalizeLanguageAvailability);
export const COUNTRIES = (countries as CountryConfig[]).map(normalizeCountryAvailability);
export const EVENTS = (events as EventConfig[]).map((event) => {
  const key = event.slug as EventKey;
  const override = eventsRegistry[key];
  return override
    ? { ...event, available: override.available }
    : event;
});

export type Language = (typeof LANGS)[number];
export type Country = (typeof COUNTRIES)[number];
export type EventType = (typeof EVENTS)[number];

