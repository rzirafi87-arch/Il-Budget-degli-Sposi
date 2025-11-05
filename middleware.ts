import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  // Pagine onboarding e pubbliche
  const publicPaths = [
    "/select-language",
    "/select-country",
    "/select-event-type",
    "/auth",
    "/welcome",
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    // Ensure NEXT_LOCALE is aligned for SSR even on public pages
    const res = NextResponse.next() as unknown as { cookies?: { set?: (name: string, value: string) => void } };
    const lang = req.cookies.get("language")?.value;
    if (lang && res.cookies?.set) {
      res.cookies.set("NEXT_LOCALE", lang);
    }
    return res;
  }

  // Next.js 16: req.cookies è un oggetto Record<string, string> lato middleware
  const lang = req.cookies.get("language")?.value;
  const country = req.cookies.get("country")?.value;
  const eventType = req.cookies.get("eventType")?.value;

  if (!lang) {
    const url = req.nextUrl.clone();
    url.pathname = "/select-language";
    return NextResponse.redirect(url);
  }
  if (!country) {
    const url = req.nextUrl.clone();
    url.pathname = "/select-country";
    return NextResponse.redirect(url);
  }
  if (!eventType) {
    const url = req.nextUrl.clone();
    url.pathname = "/select-event-type";
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

