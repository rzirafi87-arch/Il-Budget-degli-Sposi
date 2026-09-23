import { defaultLocale, getLanguageCapability, isPublicLocale } from "@/i18n/languageCapabilities";
import { NextRequest, NextResponse } from "next/server";

function continueWithLocale(req: NextRequest, locale: string, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-app-locale", locale);
  requestHeaders.set("x-app-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const legacyEventApi = /^\/api\/(?:anniversary|babyshower|baptism|bar-mitzvah|birthday|charity-gala|communion|confirmation|corporate|eighteenth|engagement|fifty|gender-reveal|graduation|proposal|quinceanera|retirement)\/seed(?:\/|$)/.test(pathname)
    || /^\/api\/my\/(?:anniversary|babyshower|baptism|bar-mitzvah|birthday|charity-gala|communion|confirmation|corporate|eighteenth|engagement|fifty|gender-reveal|graduation|proposal|quinceanera|retirement)-dashboard$/.test(pathname);
  if (legacyEventApi) {
    if (req.method === "GET" && pathname.includes("/seed")) {
      return NextResponse.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "POST" } });
    }
    return NextResponse.json({ error: "EVENT_TYPE_COMING_SOON" }, { status: 409 });
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);
  const requestedLocale = segments[0];
  if (isPublicLocale(requestedLocale)) return continueWithLocale(req, requestedLocale, pathname);

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

export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
