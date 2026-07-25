import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const { id } = await params;

    const { data: appointment, error: appointmentError } = await db
      .from("appointments")
      .select("event_id")
      .eq("id", id)
      .maybeSingle();

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 });
    }
    if (!appointment?.event_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: ownedEvent, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("id", appointment.event_id)
      .eq("owner_id", userId)
      .maybeSingle();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }
    if (!ownedEvent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await db
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("event_id", ownedEvent.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
