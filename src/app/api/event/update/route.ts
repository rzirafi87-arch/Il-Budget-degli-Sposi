import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { apiSecurityErrorResponse, requireEventAccess } from "@/lib/apiSecurity";
import type { EventUpdate, EventUpdateBody, WeddingCardUpdate } from "../lifecycleTypes";

export const runtime = "nodejs";

const nullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export async function PATCH(req: NextRequest) {
  try {
  const { userId, currentEvent } = await requireEventAccess(req, "owner-or-partner");
  const db = getServiceClient();
  const body: EventUpdateBody = await req.json().catch(() => ({}));
  if (
    (body.name !== undefined && !nullableString(body.name)) ||
    (body.currency !== undefined && !nullableString(body.currency)) ||
    (body.total_budget !== undefined && body.total_budget !== null &&
      (typeof body.total_budget !== "number" || !Number.isFinite(body.total_budget))) ||
    (body.wedding_card !== undefined && body.wedding_card !== null &&
      (typeof body.wedding_card !== "object" || Array.isArray(body.wedding_card)))
  ) {
    return NextResponse.json({ error: "INVALID_EVENT_UPDATE" }, { status: 400 });
  }

  const wcUpdates: WeddingCardUpdate = {};
  if (body.wedding_card) {
    const card = body.wedding_card;
    if (
      (card.bride_name !== undefined && !nullableString(card.bride_name)) ||
      (card.groom_name !== undefined && !nullableString(card.groom_name)) ||
      (card.wedding_date !== undefined && !nullableString(card.wedding_date))
    ) {
      return NextResponse.json({ error: "INVALID_EVENT_UPDATE" }, { status: 400 });
    }
    if (card.bride_name !== undefined) wcUpdates.bride_name = card.bride_name;
    if (card.groom_name !== undefined) wcUpdates.groom_name = card.groom_name;
    if (card.wedding_date !== undefined) wcUpdates.wedding_date = card.wedding_date;
  }

  const updates: EventUpdate = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.total_budget !== undefined) updates.total_budget = body.total_budget;
  const { data, error } = await db.rpc("patch_event_details", {
    p_actor_id: userId,
    p_event_id: currentEvent.eventId,
    p_event: updates,
    p_card: body.wedding_card ? wcUpdates : null,
  });
  if (error) return NextResponse.json({ error: "EVENT_UPDATE_FAILED" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "No event" }, { status: 404 });
  return NextResponse.json({ ok: true });
  } catch (error) {
    return apiSecurityErrorResponse(error, "EVENT_UPDATE_FAILED");
  }
}
