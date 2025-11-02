import languages from "@/data/config/languages.json";
import countries from "@/data/config/countries.json";
import events from "@/data/config/events.json";

export const LANGS = languages;
export const COUNTRIES = countries;
export const EVENTS = events;

export type Language = (typeof LANGS)[number];
export type Country = (typeof COUNTRIES)[number];
export type EventType = (typeof EVENTS)[number];

