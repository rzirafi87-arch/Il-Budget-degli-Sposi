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
    return NextResponse.next();
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

  // Supporto Battesimo: consenti sezioni pertinenti ed escludi quelle wedding-only
  if (eventType === "baptism") {
    const excludeForBaptism = [
      "/timeline",
      "/save-the-date",
      "/cose-matrimonio",
      "/lista-nozze",
      "/contabilita",
      "/fornitori",
      "/documenti",
      "/musica-cerimonia",
      "/musica-ricevimento",
      "/atelier",
      "/beauty",
      "/fotografi",
      "/gioiellerie",
    ];
    if (excludeForBaptism.some((p) => pathname.startsWith(p))) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Consenti solo le sezioni matrimonio se l'evento selezionato è 'wedding'
  if (eventType && eventType !== "wedding") {
    const weddingOnlyPaths = [
      "/dashboard",
      "/timeline",
      "/budget",
      "/cose-matrimonio",
      "/save-the-date",
      "/invitati",
      "/contabilita",
      "/fornitori",
      "/location",
      "/chiese",
      "/documenti",
      "/lista-nozze",
      "/preferiti",
      "/suggerimenti",
    ];
    if (weddingOnlyPaths.some((p) => pathname.startsWith(p))) {
      const url = req.nextUrl.clone();
      url.pathname = "/coming-soon";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

