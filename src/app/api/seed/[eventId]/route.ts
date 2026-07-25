/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from "@/lib/apiAuth";
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
    const db = getServiceClient();
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Missing eventId in route params" },
        { status: 400 }
      );
    }

    const { data: event, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("owner_id", userId)
      .maybeSingle();

    if (eventError) {
      console.error("Supabase event ownership check error:", eventError);
      return NextResponse.json({ ok: false, error: eventError.message }, { status: 500 });
    }
    if (!event) {
      return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    }

    const verifiedEventId = event.id;
    const { error } = await db.rpc("seed_full_event", { p_event: verifiedEventId });

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
