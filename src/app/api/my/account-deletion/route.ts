import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { getBearer, requireUser } from "@/lib/apiAuth";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const { data, error } = await db.from("account_deletion_requests").select("status, requested_at, scheduled_for").eq("user_id", userId).maybeSingle();
    if (error) return NextResponse.json({ error: "REQUEST_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ request: data });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const limit = await checkAuthRateLimit(req, "account-deletion", 3);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);
    const { userId } = await requireUser(req);
    const token = getBearer(req)!;
    const db = getServiceClient();
    const { data: auth } = await db.auth.getUser(token);
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (body?.confirmation !== "ELIMINA" || !auth.user?.email || email !== auth.user.email.toLowerCase()) {
      return NextResponse.json({ error: "CONFIRMATION_MISMATCH" }, { status: 400 });
    }
    const scheduledFor = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await db.from("account_deletion_requests").upsert({
      user_id: userId, status: "pending", requested_at: new Date().toISOString(), scheduled_for: scheduledFor, cancelled_at: null,
    }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ error: "REQUEST_CREATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true, scheduledFor });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const { error } = await db.from("account_deletion_requests").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("user_id", userId).eq("status", "pending");
    if (error) return NextResponse.json({ error: "REQUEST_CANCEL_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
}
