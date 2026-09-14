import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { currentEventErrorResponse, requireCurrentEvent } from "@/lib/currentEvent";
import type { EventUpdate, EventUpdateBody, WeddingCardInsert, WeddingCardUpdate } from "../lifecycleTypes";

export const runtime = "nodejs";

const nullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";

export async function PATCH(req: NextRequest) {
  const db = getServiceClient();

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Missing JWT" }, { status: 401 });

  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user?.id) return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });

  const body: EventUpdateBody = await req.json().catch(() => ({}));
  if (
    (body.name !== undefined && !nullableString(body.name)) ||
    (body.currency !== undefined && !nullableString(body.currency)) ||
    (body.total_budget !== undefined && body.total_budget !== null &&
      (typeof body.total_budget !== "number" || !Number.isFinite(body.total_budget))) ||
    (body.wedding_card !== undefined && body.wedding_card !== null &&
      typeof body.wedding_card !== "object")
  ) {
    return NextResponse.json({ error: "INVALID_EVENT_UPDATE" }, { status: 400 });
  }

  // Find user's event
  let current;
  try {
    current = await requireCurrentEvent(req, userData.user.id);
  } catch (error) {
    const mapped = currentEventErrorResponse(error);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw error;
  }
  const { data: ev } = await db
    .from("events")
    .select("id, name, currency, total_budget")
    .eq("id", current.eventId)
    .maybeSingle();
  if (!ev) return NextResponse.json({ error: "No event" }, { status: 404 });

  const updates: EventUpdate = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.total_budget !== undefined) updates.total_budget = body.total_budget;
  if (Object.keys(updates).length > 0) {
    const { error: upErr } = await db.from("events").update(updates).eq("id", ev.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  if (body.wedding_card) {
    // Upsert wedding card by event_id
    const card = body.wedding_card;
    if (
      (card.bride_name !== undefined && !nullableString(card.bride_name)) ||
      (card.groom_name !== undefined && !nullableString(card.groom_name)) ||
      (card.wedding_date !== undefined && !nullableString(card.wedding_date))
    ) {
      return NextResponse.json({ error: "INVALID_EVENT_UPDATE" }, { status: 400 });
    }
    const wcUpdates: WeddingCardUpdate = {};
    if (card.bride_name !== undefined) wcUpdates.bride_name = card.bride_name;
    if (card.groom_name !== undefined) wcUpdates.groom_name = card.groom_name;
    if (card.wedding_date !== undefined) wcUpdates.wedding_date = card.wedding_date;
    // Check if exists
    const { data: exists } = await db.from("wedding_cards").select("event_id").eq("event_id", ev.id).maybeSingle();
    if (exists) {
      const { error: wcErr } = await db.from("wedding_cards").update(wcUpdates).eq("event_id", ev.id);
      if (wcErr) return NextResponse.json({ error: wcErr.message }, { status: 500 });
    } else {
      const wcInsert: WeddingCardInsert = { event_id: ev.id, ...wcUpdates };
      const { error: wcErr } = await db.from("wedding_cards").insert(wcInsert);
      if (wcErr) return NextResponse.json({ error: wcErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
