import languages from "@/data/config/languages.json";

export type LanguageStatus = "READY" | "BETA" | "COMING_SOON" | "INTERNAL_ONLY";

export type LanguageCapability = {
  locale: string;
  label: string;
  nativeLabel: string;
  status: LanguageStatus;
  selectable: boolean;
  publicRouting: boolean;
  metadataReady: boolean;
  authReady: boolean;
  appReady: boolean;
  emailReady: boolean;
  direction: "ltr" | "rtl";
  visible: boolean;
};

const COMING_SOON = new Set(["en", "es", "fr", "de"]);
const CONFIGURED_LANGUAGES = [
  ...languages,
  { slug: "mx", label: "Español (México)", locale: "es-MX", dir: "ltr", emoji: "", available: false },
];

export const languageCapabilities: readonly LanguageCapability[] = CONFIGURED_LANGUAGES.map((language) => {
  const status: LanguageStatus = language.slug === "it"
    ? "READY"
    : COMING_SOON.has(language.slug)
      ? "COMING_SOON"
      : "INTERNAL_ONLY";
  const ready = status === "READY";

  return Object.freeze({
    locale: language.slug,
    label: language.label,
    nativeLabel: language.label,
    status,
    selectable: ready,
    publicRouting: ready,
    metadataReady: ready,
    authReady: ready,
    appReady: ready,
    emailReady: language.slug === "it",
    direction: language.dir as "ltr" | "rtl",
    visible: status !== "INTERNAL_ONLY",
  });
});

export type Locale = (typeof languageCapabilities)[number]["locale"];

export const defaultLocale = "it" as const;
export const publicLocales = languageCapabilities
  .filter((language) => language.publicRouting)
  .map((language) => language.locale);
export const selectableLanguages = languageCapabilities.filter((language) => language.selectable);
export const visibleLanguages = languageCapabilities.filter((language) => language.visible);

export function getLanguageCapability(locale: string | null | undefined): LanguageCapability | undefined {
  return languageCapabilities.find((language) => language.locale === locale?.toLowerCase());
}

export function isPublicLocale(locale: string | null | undefined): boolean {
  return Boolean(getLanguageCapability(locale)?.publicRouting);
}

export function isSelectableLocale(locale: string | null | undefined): boolean {
  return Boolean(getLanguageCapability(locale)?.selectable);
}
