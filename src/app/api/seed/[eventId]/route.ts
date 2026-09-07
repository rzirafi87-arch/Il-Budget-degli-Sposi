/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from "@/lib/apiAuth";
import { resolveCurrentEvent } from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await params;
    if (!eventId) {
      return NextResponse.json({ ok: false, error: "Missing eventId in route params" }, { status: 400 });
    }

    const resolution = await resolveCurrentEvent(req, userId, { explicitEventId: eventId });
    if (resolution.status !== "RESOLVED" || resolution.currentEvent.eventId !== eventId) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const db = getServiceClient();
    const { error } = await db.rpc("seed_full_event", { p_event: eventId });

    if (error) {
      console.error("Supabase RPC seed_full_event error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Route /api/seed/[eventId] error:", e);
    return NextResponse.json({ ok: false, error: e.message ?? "Server error" }, { status: 500 });
  }
}
