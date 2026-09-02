import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { isSelectableLocale } from "@/i18n/languageCapabilities";

async function userFor(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const db = getServiceClient();
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}

export async function GET(req: NextRequest) {
  const user = await userFor(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const db = getServiceClient();
  const { data, error } = await db.from("profiles").select("full_name, preferred_locale, country_code").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "PROFILE_READ_FAILED" }, { status: 500 });
  return NextResponse.json({ profile: data, email: user.email || null });
}

export async function PATCH(req: NextRequest) {
  const user = await userFor(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ") : "";
  if (!fullName || fullName.length > 100) return NextResponse.json({ error: "INVALID_NAME" }, { status: 400 });
  if (!isSelectableLocale(body?.preferredLocale)) {
    return NextResponse.json({ error: "LOCALE_NOT_SELECTABLE" }, { status: 400 });
  }
  const preferredLocale = body.preferredLocale;
  const db = getServiceClient();
  const { error } = await db.from("profiles").upsert({ id: user.id, full_name: fullName, preferred_locale: preferredLocale }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "PROFILE_UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true, profile: { full_name: fullName, preferred_locale: preferredLocale } });
}
