const INTL_LOCALES: Record<string, string> = {
  it: "it-IT",
  en: "en-GB",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
};

const OPEN_GRAPH_LOCALES: Record<string, string> = {
  it: "it_IT",
  en: "en_GB",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
};

export function getIntlLocale(locale?: string | null) {
  return INTL_LOCALES[(locale || "it").toLowerCase()] || "it-IT";
}

export function getOpenGraphLocale(locale?: string | null) {
  return OPEN_GRAPH_LOCALES[(locale || "it").toLowerCase()] || "it_IT";
}
