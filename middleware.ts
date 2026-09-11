import { defaultLocale, getLanguageCapability, isPublicLocale } from "@/i18n/languageCapabilities";
import { NextRequest, NextResponse } from "next/server";

function continueWithLocale(req: NextRequest, locale: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-app-locale", locale);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);
  const requestedLocale = segments[0];
  if (isPublicLocale(requestedLocale)) return continueWithLocale(req, requestedLocale);

  const knownUnavailableLocale = getLanguageCapability(requestedLocale);
  if (knownUnavailableLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}/${segments.slice(1).join("/")}`.replace(/\/$/, "") || `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  const cookieLocale = req.cookies.get("language")?.value;
  const locale = isPublicLocale(cookieLocale) ? cookieLocale! : defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|favicon.ico|api).*)"] };
