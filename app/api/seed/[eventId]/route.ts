import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
  const db = getServiceClient();
  const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "Missing eventId in route params" },
        { status: 400 }
      );
    }

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
