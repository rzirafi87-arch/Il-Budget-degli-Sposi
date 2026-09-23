import { defaultLocale, locales, type Locale } from "./config";

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return locales.includes(segment as Locale) ? (segment as Locale) : defaultLocale;
}

export function localizePathname(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && locales.includes(segments[0] as Locale)) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return `/${segments.join("/")}`;
}

export function localizedHref(
  pathname: string,
  locale: Locale,
  search = "",
  hash = "",
): string {
  const normalizedSearch = search && !search.startsWith("?") ? `?${search}` : search;
  const normalizedHash = hash && !hash.startsWith("#") ? `#${hash}` : hash;
  return `${localizePathname(pathname, locale)}${normalizedSearch}${normalizedHash}`;
}

export function persistLocalePreference(locale: Locale): void {
  window.localStorage.setItem("language", locale);
  window.document.cookie = `language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
