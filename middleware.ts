import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["it", "en"];
const DEFAULT_LOCALE = "it";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const getSupportedLocale = (value?: string | null) => {
  if (!value) return null;
  const sanitized = value.toLowerCase();
  return SUPPORTED_LOCALES.includes(sanitized) ? sanitized : null;
};

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: COOKIE_MAX_AGE,
  sameSite: "lax" as const,
};

function syncPreferenceCookies(response: NextResponse, locale: string, countryCode?: string, eventType?: string) {
  response.cookies.set("locale", locale, COOKIE_OPTIONS);
  response.cookies.set("language", locale, COOKIE_OPTIONS);

  if (countryCode) {
    response.cookies.set("country_code", countryCode, COOKIE_OPTIONS);
    response.cookies.set("country", countryCode, COOKIE_OPTIONS);
  } else {
    response.cookies.delete("country_code");
    response.cookies.delete("country");
  }

  if (eventType) {
    response.cookies.set("event_type", eventType, COOKIE_OPTIONS);
    response.cookies.set("eventType", eventType, COOKIE_OPTIONS);
  } else {
    response.cookies.delete("event_type");
    response.cookies.delete("eventType");
  }
}

function extractPreference(req: NextRequest) {
  const queryLocale = req.nextUrl.searchParams.get("locale") ?? req.nextUrl.searchParams.get("language");
  const cookieLocale = req.cookies.get("locale")?.value ?? req.cookies.get("language")?.value;
  const locale = getSupportedLocale(queryLocale) ?? getSupportedLocale(cookieLocale) ?? DEFAULT_LOCALE;

  const countryCode =
    req.nextUrl.searchParams.get("country_code") ??
    req.nextUrl.searchParams.get("country") ??
    req.cookies.get("country_code")?.value ??
    req.cookies.get("country")?.value ??
    undefined;

  const eventType =
    req.nextUrl.searchParams.get("event_type") ??
    req.nextUrl.searchParams.get("eventType") ??
    req.cookies.get("event_type")?.value ??
    req.cookies.get("eventType")?.value ??
    undefined;

  return { locale, countryCode, eventType };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const preferences = extractPreference(req);
  const hasLocalePrefix = SUPPORTED_LOCALES.some(
    (supported) => pathname === `/${supported}` || pathname.startsWith(`/${supported}/`)
  );

  if (!hasLocalePrefix) {
    const destination = req.nextUrl.clone();
    destination.pathname = pathname === "/" ? `/${preferences.locale}` : `/${preferences.locale}${pathname}`;
    const redirectResponse = NextResponse.redirect(destination);
    syncPreferenceCookies(redirectResponse, preferences.locale, preferences.countryCode, preferences.eventType);
    return redirectResponse;
  }

  const response = NextResponse.next();
  syncPreferenceCookies(response, preferences.locale, preferences.countryCode, preferences.eventType);
  return response;
}

export const config = { matcher: ["/((?!_next|favicon.ico|api).*)"] };
