import { createHash } from "crypto";
import { INVITATION_RETURN_COOKIE, invitationResumePath, isInvitationToken } from "@/lib/auth";
import { locales } from "@/i18n/config";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { token?: unknown; locale?: unknown };
  if (!isInvitationToken(body.token) || typeof body.locale !== "string" || !locales.includes(body.locale as (typeof locales)[number])) {
    return NextResponse.json({ error: "INVITATION_INVALID" }, { status: 400 });
  }
  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  const { data } = await getServiceClient().from("event_invitations").select("status,expires_at").eq("token_hash", tokenHash).maybeSingle();
  if (!data || data.status !== "pending") return NextResponse.json({ error: data ? "INVITATION_ALREADY_USED" : "INVITATION_INVALID" }, { status: 409 });
  if (new Date(data.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: "INVITATION_EXPIRED" }, { status: 409 });
  const response = NextResponse.json({ next: invitationResumePath(body.locale) });
  response.cookies.set(INVITATION_RETURN_COOKIE, body.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/invitations/resume", maxAge: 10 * 60 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
