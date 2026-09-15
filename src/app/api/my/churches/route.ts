import { getServiceClient } from "@/lib/supabaseServer";
import { planningSelectionErrorResponse, requirePlanningSelectionAccess } from "@/lib/planningSelectionAuthorization";
import type { SavedChurchInsert, SavedChurchUpdate } from "@/lib/planningSelectionContracts";
import { normalizeBooleanSelectionMutation, withCanonicalPlanningState } from "@/lib/planningSelectionState";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["considering", "contacted", "shortlisted", "selected", "discarded"]);

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "read");
    const eventId = currentEvent.eventId;
    const { data, error } = await getServiceClient().from("saved_churches")
      .select("id,event_id,church_id,status,favorite,contacted,selected,personal_notes,personal_contact_notes,quoted_price,created_at,updated_at")
      .eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ savedChurches: (data || []).map((row) => withCanonicalPlanningState("church", row)), eventId });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const body = (await req.json()) as { church_id?: string };
    if (!body.church_id || !UUID.test(body.church_id)) return NextResponse.json({ error: "Invalid church id" }, { status: 400 });
    const eventId = currentEvent.eventId;
    const db = getServiceClient();
    const { data: church, error: churchError } = await db.from("churches").select("id").eq("id", body.church_id).maybeSingle();
    if (churchError) return NextResponse.json({ error: "PLANNING_SELECTION_LOOKUP_FAILED" }, { status: 500 });
    if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });
    const insert: SavedChurchInsert = { event_id: eventId, church_id: body.church_id };
    const { data, error } = await db.from("saved_churches").insert(insert)
      .select("id,event_id,church_id,status,favorite,contacted,selected").single();
    if (error?.code === "23505") return NextResponse.json({ error: "Church already saved" }, { status: 409 });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_CREATE_FAILED" }, { status: 500 });
    return NextResponse.json({ savedChurch: withCanonicalPlanningState("church", data) }, { status: 201 });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved church id" }, { status: 400 });
    const eventId = currentEvent.eventId;

    const updates: SavedChurchUpdate = {};
    if (typeof body.favorite === "boolean") updates.favorite = body.favorite;
    if (typeof body.contacted === "boolean") updates.contacted = body.contacted;
    const selection = normalizeBooleanSelectionMutation(body, "considering");
    if (typeof selection.selected === "boolean") updates.selected = selection.selected;
    if (selection.status && STATUSES.has(selection.status)) updates.status = selection.status;
    if (typeof body.personal_notes === "string") updates.personal_notes = body.personal_notes.trim().slice(0, 4000) || null;
    if (typeof body.personal_contact_notes === "string") updates.personal_contact_notes = body.personal_contact_notes.trim().slice(0, 4000) || null;
    if (body.quoted_price === null) updates.quoted_price = null;
    else if (typeof body.quoted_price === "number" && Number.isFinite(body.quoted_price) && body.quoted_price >= 0) updates.quoted_price = body.quoted_price;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid updates" }, { status: 400 });

    const { data, error } = await getServiceClient().from("saved_churches").update(updates)
      .eq("id", id).eq("event_id", eventId)
      .select("id,event_id,church_id,status,favorite,contacted,selected").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "Only one church can be selected" }, { status: 409 });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_UPDATE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved church not found" }, { status: 404 });
    return NextResponse.json({ savedChurch: withCanonicalPlanningState("church", data) });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved church id" }, { status: 400 });
    const eventId = currentEvent.eventId;
    const { data, error } = await getServiceClient().from("saved_churches").delete()
      .eq("id", id).eq("event_id", eventId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved church not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return planningSelectionErrorResponse(error); }
}
