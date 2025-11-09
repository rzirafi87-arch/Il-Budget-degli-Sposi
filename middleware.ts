import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_LOCALES = ["it", "en"];
const DEFAULT_LOCALE = "it";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // escludi asset e API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/)
  ) return NextResponse.next();

  // se path è / o non contiene locale → riscrivi con locale da cookie o default
  const hasLocale = SUPPORTED_LOCALES.some((l) => pathname.startsWith(`/${l}`));
  if (!hasLocale) {
    const cookieLocale = req.cookies.get("locale")?.value;
    const locale = SUPPORTED_LOCALES.includes(cookieLocale || "") ? cookieLocale! : DEFAULT_LOCALE;
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next|favicon.ico|api).*)"] };


