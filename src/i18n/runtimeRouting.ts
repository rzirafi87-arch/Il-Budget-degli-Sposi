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

type ClientRouter = {
  push(href: string, options?: { scroll?: boolean }): void;
};

/**
 * Navigate through the App Router while restoring the fragment on the final
 * history entry. Passing an already-active fragment to router.push repeatedly
 * can make production Next.js append it (for example #password#password).
 */
export function pushLocalizedRoute(
  router: ClientRouter,
  pathname: string,
  locale: Locale,
  search = "",
  hash = "",
): void {
  const target = new URL(localizedHref(pathname, locale, search, hash), window.location.origin);
  const routeWithoutHash = `${target.pathname}${target.search}`;

  router.push(routeWithoutHash, { scroll: false });
  if (!target.hash) return;

  const restoreHash = (attempt = 0) => {
    if (window.location.pathname === target.pathname && window.location.search === target.search) {
      window.history.replaceState(
        window.history.state,
        "",
        `${target.pathname}${target.search}${target.hash}`,
      );
      return;
    }
    if (attempt < 120) window.requestAnimationFrame(() => restoreHash(attempt + 1));
  };

  window.requestAnimationFrame(() => restoreHash());
}
