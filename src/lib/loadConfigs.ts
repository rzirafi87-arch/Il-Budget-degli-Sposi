import countries from "@/data/config/countries.json";
import events from "@/data/config/events.json";
import { eventsRegistry, type EventKey } from "@/config/events.registry";
import { COUNTRIES as COUNTRY_STATUS } from "@/data/locales";
import { languageCapabilities } from "@/i18n/languageCapabilities";

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

const activeCountryCodes = new Set(
  COUNTRY_STATUS.filter((country) => country.active)
    .map((country) => country.code.toLowerCase())
    .filter(Boolean),
);

const normalizeCountryAvailability = (country: CountryConfig) => ({
  ...country,
  available: country.available && activeCountryCodes.has(country.code.toLowerCase()),
});

export const LANGS = languageCapabilities
  .filter((language) => language.visible)
  .map((language) => ({
    slug: language.locale,
    label: language.label,
    nativeLabel: language.nativeLabel,
    locale: language.locale,
    dir: language.direction,
    emoji: "🌐",
    available: language.selectable,
    status: language.status,
  }));
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
