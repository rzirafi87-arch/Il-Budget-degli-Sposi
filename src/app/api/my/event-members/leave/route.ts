import { requireUser } from "@/lib/apiAuth";
import { CURRENT_EVENT_COOKIE, requireServerCurrentEvent } from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req); const current = await requireServerCurrentEvent(userId);
    if (current.accessRole !== "partner") return NextResponse.json({ error: "PARTNER_REQUIRED" }, { status: 403 });
    const { data, error } = await getServiceClient().from("event_members").update({ status: "left", updated_at: new Date().toISOString() }).eq("event_id", current.eventId).eq("user_id", userId).eq("role", "partner").eq("status", "active").select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PARTNER_LEAVE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "PARTNER_NOT_FOUND" }, { status: 404 });
    const response = NextResponse.json({ ok: true }); response.cookies.delete(CURRENT_EVENT_COOKIE); return response;
  } catch { return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 }); }
}
