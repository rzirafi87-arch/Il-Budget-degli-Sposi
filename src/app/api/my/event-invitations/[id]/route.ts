import { requireUser } from "@/lib/apiAuth";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { isEventOwnerForUser } from "@/lib/eventOwnership";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { userId } = await requireUser(req);
  const { eventId } = await requireServerCurrentEvent(userId);
  if (!(await isEventOwnerForUser(eventId, userId))) {
    return NextResponse.json({ error: "OWNER_REQUIRED" }, { status: 403 });
  }
  const { id } = await context.params;
  const { data, error } = await getServiceClient().from("event_invitations")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id).eq("event_id", eventId).eq("status", "pending")
    .select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "INVITATION_REVOKE_FAILED" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "INVITATION_NOT_PENDING" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
