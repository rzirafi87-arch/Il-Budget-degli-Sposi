/**
 * Utility per gestire il locale dell'utente
 * Recupera la lingua salvata in localStorage e restituisce il formato corretto
 */

// Mappa delle lingue ai loro locale completi
const LOCALE_MAP: Record<string, string> = {
  it: "it-IT",
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ar: "ar-AE",
  pt: "pt-BR",
  id: "id-ID",
};

/**
 * Ottiene il locale completo dell'utente (es. "it-IT", "en-GB", etc.)
 * @returns Il locale completo basato sulla lingua salvata in localStorage
 */
export function getUserLocale(): string {
  if (typeof window === "undefined") return "it-IT";
  const lang = localStorage.getItem("language") || "it";
  return LOCALE_MAP[lang] || "it-IT";
}

/**
 * Ottiene il codice lingua breve dell'utente (es. "it", "en", etc.)
 * @returns Il codice lingua a 2 lettere
 */
export function getUserLanguage(): string {
  if (typeof window === "undefined") return "it";
  return localStorage.getItem("language") || "it";
}

/**
 * Formatta un numero secondo il locale dell'utente
 * @param num Il numero da formattare
 * @param options Opzioni per toLocaleString
 * @returns Il numero formattato
 */
export function formatNumber(num: number | null | undefined, options?: Intl.NumberFormatOptions): string {
  const locale = getUserLocale();
  return (num || 0).toLocaleString(locale, options);
}

/**
 * Formatta una data secondo il locale dell'utente
 * @param date La data da formattare
 * @param options Opzioni per toLocaleDateString
 * @returns La data formattata
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const locale = getUserLocale();
  return date.toLocaleDateString(locale, options);
}

/**
 * Formatta una data e ora secondo il locale dell'utente
 * @param date La data da formattare
 * @param options Opzioni per toLocaleString
 * @returns La data e ora formattata
 */
export function formatDateTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const locale = getUserLocale();
  return date.toLocaleString(locale, options);
}

/**
 * Formatta una valuta secondo il locale dell'utente
 * @param amount Importo da formattare
 * @param currency Codice valuta ISO 4217 (default: EUR)
 * @param options Opzioni aggiuntive per Intl.NumberFormat (es. cifre decimali)
 * @returns Stringa con simbolo e importo posizionato correttamente per il locale
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "EUR",
  options?: Intl.NumberFormatOptions
): string {
  const locale = getUserLocale();
  const fmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...(options || {}),
  });
  return fmt.format(amount || 0);
}
