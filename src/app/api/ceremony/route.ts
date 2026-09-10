import { requireCurrentEvent } from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CEREMONY_TYPES = new Set(["civil", "religious", "other", "undecided"]);
const RELIGIONS = new Set(["catholic", "christian_non_catholic", "islamic", "jewish", "hindu", "buddhist", "other", "unspecified"]);

async function context(req: NextRequest) {
  const jwt = req.headers.get("authorization")?.split(" ")[1];
  if (!jwt) return null;
  const db = getServiceClient();
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data.user) return null;
  const event = await requireCurrentEvent(req, data.user.id);
  return { db, eventId: event.eventId };
}

export async function GET(req: NextRequest) {
  const auth = await context(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error } = await auth.db.from("wedding_cards").select(
    "ceremony_type,religion,denomination,ceremony_place_kind,ceremony_place_name,ceremony_place_address,ceremony_officiant,church_id,church_name,church_address,location_id,location_name,location_address",
  ).eq("event_id", auth.eventId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ceremony: data ?? null });
}

export async function PUT(req: NextRequest) {
  const auth = await context(req);
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const ceremonyType = typeof body.ceremony_type === "string" ? body.ceremony_type : "undecided";
  const religion = typeof body.religion === "string" && body.religion ? body.religion : null;
  if (!CEREMONY_TYPES.has(ceremonyType) || (religion && !RELIGIONS.has(religion))) {
    return NextResponse.json({ error: "Invalid ceremony classification" }, { status: 400 });
  }
  const clean = (value: unknown, max = 240) => typeof value === "string" ? value.trim().slice(0, max) || null : null;
  const payload = {
    event_id: auth.eventId,
    ceremony_type: ceremonyType,
    religion: ceremonyType === "religious" ? religion ?? "unspecified" : null,
    denomination: ceremonyType === "religious" ? clean(body.denomination) : null,
    ceremony_place_kind: clean(body.ceremony_place_kind, 80),
    ceremony_place_name: clean(body.ceremony_place_name),
    ceremony_place_address: clean(body.ceremony_place_address, 500),
    ceremony_officiant: clean(body.ceremony_officiant),
  };
  const { error } = await auth.db.from("wedding_cards").upsert(payload, { onConflict: "event_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, ceremony: payload });
}
