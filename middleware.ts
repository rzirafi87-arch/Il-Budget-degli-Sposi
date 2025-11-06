import { locales, defaultLocale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
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
  const normalizedPath = hasLocale ? `/${segments.slice(1).join("/")}` : pathname;

  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    return NextResponse.redirect(url);
  }

  // Pagine onboarding e pubbliche
  const publicPaths = [
    "/select-language",
    "/select-country",
    "/select-event-type",
    "/auth",
    "/welcome",
  ];
  if (publicPaths.some((p) => normalizedPath.startsWith(p))) {
    // Ensure NEXT_LOCALE is aligned for SSR even on public pages
    const res = NextResponse.next() as unknown as { cookies?: { set?: (name: string, value: string) => void } };
    const lang = (hasLocale ? potentialLocale : req.cookies.get("language")?.value) || defaultLocale;
    if (lang && res.cookies?.set) {
      res.cookies.set("NEXT_LOCALE", lang);
    }
    return res;
  }

  // Next.js 16: req.cookies è un oggetto Record<string, string> lato middleware
  const lang = hasLocale ? potentialLocale : req.cookies.get("language")?.value;
  const country = req.cookies.get("country")?.value;
  const eventType = req.cookies.get("eventType")?.value;

  if (!lang) {
    const url = req.nextUrl.clone();
    url.pathname = `/${potentialLocale || defaultLocale}/select-language`;
    return NextResponse.redirect(url);
  }
  if (!country) {
    const url = req.nextUrl.clone();
    url.pathname = `/${potentialLocale || lang}/select-country`;
    return NextResponse.redirect(url);
  }
  if (!eventType) {
    const url = req.nextUrl.clone();
    url.pathname = `/${potentialLocale || lang}/select-event-type`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next() as unknown as { cookies?: { set?: (name: string, value: string) => void } };
  // Align next-intl locale cookie to reduce initial flash of wrong language
  if (lang && res.cookies?.set) {
    res.cookies.set("NEXT_LOCALE", lang);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

