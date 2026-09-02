import { defaultLocale, getLanguageCapability, isPublicLocale } from "@/i18n/languageCapabilities";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // escludi asset e API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) return NextResponse.next();

  // se path è / o non contiene locale → riscrivi con locale da cookie o default
  const segments = pathname.split("/").filter(Boolean);
  const requestedLocale = segments[0];
  if (isPublicLocale(requestedLocale)) return NextResponse.next();

  const knownUnavailableLocale = getLanguageCapability(requestedLocale);
  if (knownUnavailableLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}/${segments.slice(1).join("/")}`.replace(/\/$/, "") || `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }

  if (!requestedLocale || !isPublicLocale(requestedLocale)) {
    const cookieLocale = req.cookies.get("language")?.value;
    const locale = isPublicLocale(cookieLocale) ? cookieLocale! : defaultLocale;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|favicon.ico|api).*)"] };
