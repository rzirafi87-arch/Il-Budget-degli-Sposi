import { createHash } from "node:crypto";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const limit = await checkAuthRateLimit(req, "invitation-inspect", 30, 3600);
  if (!limit.allowed) return NextResponse.json({ error: "INVITATION_RATE_LIMITED" }, { status: 429 });
  const token = new URL(req.url).searchParams.get("token") || "";
  if (token.length < 32) return NextResponse.json({ error: "INVITATION_INVALID" }, { status: 404 });
  const hash = createHash("sha256").update(token).digest("hex"), db = getServiceClient();
  const { data } = await db.from("event_invitations").select("status,expires_at,event:events(name,owner_id)").eq("token_hash", hash).maybeSingle();
  if (!data) return NextResponse.json({ error: "INVITATION_INVALID" }, { status: 404 });
  const event = Array.isArray(data.event) ? data.event[0] : data.event;
  const { data: owner } = event?.owner_id ? await db.auth.admin.getUserById(event.owner_id) : { data: { user: null } };
  const status = data.status === "pending" && Date.parse(data.expires_at) <= Date.now() ? "expired" : data.status;
  return NextResponse.json({ invitation: { status, expiresAt: data.expires_at, eventName: event?.name || null, ownerName: owner.user?.user_metadata?.full_name || owner.user?.email?.split("@")[0] || null } });
}
