import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
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
    const eventId = (await requireServerCurrentEvent(userId)).eventId;

    const { data: appointment, error: appointmentError } = await db
      .from("appointments")
      .select("id")
      .eq("id", id)
      .eq("event_id", eventId)
      .maybeSingle();

    if (appointmentError) {
      return NextResponse.json({ error: appointmentError.message }, { status: 500 });
    }
    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await db
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("event_id", eventId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
