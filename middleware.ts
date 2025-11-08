import { defaultLocale, locales } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}/select-language`;
    return NextResponse.redirect(url);
  }

  // Escludi percorsi pubblici e asset
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/backgrounds") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];
  const hasLocale = potentialLocale && locales.includes(potentialLocale as (typeof locales)[number]);

  // Cookie onboarding
  const langCookie = req.cookies.get("language")?.value;
  const countryCookie = req.cookies.get("country")?.value;
  const eventCookie = req.cookies.get("eventType")?.value;

  // Funzione helper per determinare target pagina onboarding
  const computeOnboardingTarget = (lang?: string, country?: string, eventType?: string) => {
    if (!lang) return "/select-language";
    if (!country) return "/select-country";
    if (!eventType) return "/select-event-type";
    return null;
  };

  const onboardingTarget = computeOnboardingTarget(langCookie, countryCookie, eventCookie);

  if (!hasLocale) {
    // Se manca il locale, redireziona direttamente alla giusta pagina di onboarding.
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${onboardingTarget || pathname}`;
    return NextResponse.redirect(url);
  }

  const normalizedPath = `/${segments.slice(1).join("/")}` || "/";
  const publicPaths = ["/select-language", "/select-country", "/select-event-type", "/auth", "/welcome"];

  // Se siamo già in una pagina pubblica, prosegui (sincronizza cookie NEXT_LOCALE)
  if (publicPaths.some((p) => normalizedPath.startsWith(p))) {
    const res = NextResponse.next() as unknown as { cookies?: { set?: (name: string, value: string) => void } };
    const lang = potentialLocale || langCookie || defaultLocale;
    if (lang && res.cookies?.set) res.cookies.set("NEXT_LOCALE", lang);
    return res;
  }

  // Se mancano cookie, redireziona alla pagina corretta mantenendo locale
  if (onboardingTarget) {
    const url = req.nextUrl.clone();
    url.pathname = `/${potentialLocale || defaultLocale}${onboardingTarget}`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next() as unknown as { cookies?: { set?: (name: string, value: string) => void } };
  const lang = potentialLocale || langCookie || defaultLocale;
  if (lang && res.cookies?.set) res.cookies.set("NEXT_LOCALE", lang);
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

