import { apiSecurityErrorResponse, requireEventAccess } from "@/lib/apiSecurity";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const CEREMONY_TYPES = new Set(["civil", "religious", "other", "undecided"]);
const RELIGIONS = new Set(["catholic", "christian_non_catholic", "islamic", "jewish", "hindu", "buddhist", "other", "unspecified"]);

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const { data, error } = await getServiceClient().from("wedding_cards").select(
      "ceremony_type,religion,denomination,ceremony_place_kind,ceremony_place_name,ceremony_place_address,ceremony_officiant,church_id,church_name,church_address,location_id,location_name,location_address",
    ).eq("event_id", currentEvent.eventId).maybeSingle();
    if (error) return NextResponse.json({ error: "CEREMONY_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ ceremony: data ?? null });
  } catch (error) { return apiSecurityErrorResponse(error, "CEREMONY_READ_FAILED"); }
}

export async function PUT(req: NextRequest) {
  try {
  const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const ceremonyType = typeof body.ceremony_type === "string" ? body.ceremony_type : "undecided";
  const religion = typeof body.religion === "string" && body.religion ? body.religion : null;
  if (!CEREMONY_TYPES.has(ceremonyType) || (religion && !RELIGIONS.has(religion))) {
    return NextResponse.json({ error: "Invalid ceremony classification" }, { status: 400 });
  }
  const clean = (value: unknown, max = 240) => typeof value === "string" ? value.trim().slice(0, max) || null : null;
  const payload = {
    event_id: currentEvent.eventId,
    ceremony_type: ceremonyType,
    religion: ceremonyType === "religious" ? religion ?? "unspecified" : null,
    denomination: ceremonyType === "religious" ? clean(body.denomination) : null,
    ceremony_place_kind: clean(body.ceremony_place_kind, 80),
    ceremony_place_name: clean(body.ceremony_place_name),
    ceremony_place_address: clean(body.ceremony_place_address, 500),
    ceremony_officiant: clean(body.ceremony_officiant),
  };
  const { error } = await getServiceClient().from("wedding_cards").upsert(payload, { onConflict: "event_id" });
  if (error) return NextResponse.json({ error: "CEREMONY_UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true, ceremony: payload });
  } catch (error) { return apiSecurityErrorResponse(error, "CEREMONY_UPDATE_FAILED"); }
}
