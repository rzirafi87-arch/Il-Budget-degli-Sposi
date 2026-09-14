import { INVITATION_RETURN_COOKIE, isInvitationToken } from "@/lib/auth";
import { locales } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const requestedLocale = req.nextUrl.searchParams.get("locale");
  const locale = typeof requestedLocale === "string" && locales.includes(requestedLocale as (typeof locales)[number]) ? requestedLocale : "it";
  const token = req.cookies.get(INVITATION_RETURN_COOKIE)?.value;
  const target = isInvitationToken(token) ? `/${locale}/invitation?token=${encodeURIComponent(token)}` : `/${locale}/auth?authError=invalid_link`;
  const response = NextResponse.redirect(new URL(target, req.url));
  response.cookies.delete(INVITATION_RETURN_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
