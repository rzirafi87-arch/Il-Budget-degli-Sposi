
import { languageCapabilities } from "./languageCapabilities";

export { defaultLocale, publicLocales as locales, type Locale } from "./languageCapabilities";

export const localeNames: Record<string, string> = Object.fromEntries(
  languageCapabilities.map((language) => [
    language.locale,
    language.nativeLabel,
  ]),
);
