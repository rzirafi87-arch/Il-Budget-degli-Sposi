import { defaultLocale, locales } from "@/i18n/config";

/** Builds an app path without allowing empty or missing values into the URL. */
export function buildLocalizedPath(
  locale: string | null | undefined,
  path: string,
): string {
  const safeLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale;
  const pathSegments = path
    .split("/")
    .filter((segment) => segment && segment !== "undefined" && segment !== "null");

  return `/${[safeLocale, ...pathSegments].join("/")}`;
}
