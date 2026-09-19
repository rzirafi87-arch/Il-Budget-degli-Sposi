import { getServiceClient } from "@/lib/supabaseServer";
import { planningSelectionErrorResponse, requirePlanningSelectionAccess } from "@/lib/planningSelectionAuthorization";
import type { SavedLocationInsert, SavedLocationUpdate } from "@/lib/planningSelectionContracts";
import { normalizeBooleanSelectionMutation, withCanonicalPlanningState } from "@/lib/planningSelectionState";
import { isSnapshotSchemaUnavailable, LOCATION_SNAPSHOT_SOURCE_PROJECTION, parseCatalogOverrides, resolveCatalogRecord, SAVED_SNAPSHOT_COLUMNS } from "@/lib/catalogSnapshotContracts";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["considering", "contacted", "visited", "shortlisted", "selected", "discarded"]);
const ROLES = new Set(["reception", "ceremony", "accommodation", "party", "other"]);
const LEGACY_PROJECTION = `id,event_id,location_id,location_role,status,favorite,contacted,visited,shortlisted,selected,personal_notes,contact_notes,quote_amount,quote_currency,quote_received_at,agreed_cost,created_at,updated_at,location:locations(${LOCATION_SNAPSHOT_SOURCE_PROJECTION})`;
const PROJECTION = `id,event_id,location_id,location_role,status,favorite,contacted,visited,shortlisted,selected,personal_notes,contact_notes,quote_amount,quote_currency,quote_received_at,agreed_cost,created_at,updated_at,${SAVED_SNAPSHOT_COLUMNS},location:locations(${LOCATION_SNAPSHOT_SOURCE_PROJECTION})`;

function withResolvedLocation<T extends Record<string, unknown> & { status: string; selected?: boolean }>(row: T) {
  const location = Array.isArray(row.location) ? row.location[0] : row.location;
  return {
    ...withCanonicalPlanningState("location", row),
    resolved_record: resolveCatalogRecord(location, row.catalog_snapshot, row.private_overrides),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "read");
    const eventId = currentEvent.eventId;
    const db = getServiceClient();
    const primary = await db.from("saved_locations").select(PROJECTION).eq("event_id", eventId).order("created_at", { ascending: true });
    const { data, error } = isSnapshotSchemaUnavailable(primary.error)
      ? await db.from("saved_locations").select(LEGACY_PROJECTION).eq("event_id", eventId).order("created_at", { ascending: true })
      : primary;
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ savedLocations: (data || []).map((row) => withResolvedLocation(row)), eventId });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const body = (await req.json()) as { location_id?: string; location_role?: string };
    if (!body.location_id || !UUID.test(body.location_id)) return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
    const role = body.location_role && ROLES.has(body.location_role) ? body.location_role : "reception";
    const eventId = currentEvent.eventId;
    const db = getServiceClient();
    const { data: location, error: locationError } = await db.from("locations").select("id").eq("id", body.location_id).maybeSingle();
    if (locationError) return NextResponse.json({ error: "PLANNING_SELECTION_LOOKUP_FAILED" }, { status: 500 });
    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });
    const insert: SavedLocationInsert = { event_id: eventId, location_id: body.location_id, location_role: role };
    const primary = await db.from("saved_locations").insert(insert).select(PROJECTION).single();
    const { data, error } = isSnapshotSchemaUnavailable(primary.error)
      ? await db.from("saved_locations").insert(insert).select(LEGACY_PROJECTION).single()
      : primary;
    if (error?.code === "23505") {
      const existingPrimary = await db.from("saved_locations")
        .select(PROJECTION).eq("event_id", eventId).eq("location_id", body.location_id).eq("location_role", role).maybeSingle();
      const { data: existing, error: existingError } = isSnapshotSchemaUnavailable(existingPrimary.error)
        ? await db.from("saved_locations").select(LEGACY_PROJECTION).eq("event_id", eventId).eq("location_id", body.location_id).eq("location_role", role).maybeSingle()
        : existingPrimary;
      if (existingError || !existing) return NextResponse.json({ error: "PLANNING_SELECTION_CREATE_FAILED" }, { status: 500 });
      return NextResponse.json({ savedLocation: withResolvedLocation(existing), idempotent: true });
    }
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_CREATE_FAILED" }, { status: 500 });
    return NextResponse.json({ savedLocation: withResolvedLocation(data), idempotent: false }, { status: 201 });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved location id" }, { status: 400 });
    const eventId = currentEvent.eventId;
    const updates: SavedLocationUpdate = {};
    for (const key of ["favorite", "contacted", "visited", "shortlisted"] as const) if (typeof body[key] === "boolean") updates[key] = body[key];
    const selection = normalizeBooleanSelectionMutation(body, "considering");
    if (typeof selection.selected === "boolean") updates.selected = selection.selected;
    if (selection.status && STATUSES.has(selection.status)) updates.status = selection.status;
    if (typeof body.location_role === "string" && ROLES.has(body.location_role)) updates.location_role = body.location_role;
    for (const key of ["personal_notes", "contact_notes"] as const) if (typeof body[key] === "string") updates[key] = body[key].trim().slice(0, 4000) || null;
    for (const key of ["quote_amount", "agreed_cost"] as const) {
      if (body[key] === null) updates[key] = null;
      else if (typeof body[key] === "number" && Number.isFinite(body[key]) && body[key] >= 0) updates[key] = body[key];
    }
    if (typeof body.quote_currency === "string" && /^[A-Za-z]{3}$/.test(body.quote_currency)) updates.quote_currency = body.quote_currency.toUpperCase();
    if (body.private_overrides !== undefined) {
      const override = parseCatalogOverrides("location", body.private_overrides);
      if (!override.ok) return NextResponse.json({ error: override.error }, { status: 400 });
      updates.private_overrides = override.value;
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    const db = getServiceClient();
    const primary = await db.from("saved_locations").update(updates).eq("id", id).eq("event_id", eventId).select(PROJECTION).maybeSingle();
    const { data, error } = isSnapshotSchemaUnavailable(primary.error)
      ? await db.from("saved_locations").update(updates).eq("id", id).eq("event_id", eventId).select(LEGACY_PROJECTION).maybeSingle()
      : primary;
    if (error?.code === "23505") return NextResponse.json({ error: "Only one location can be selected for each role" }, { status: 409 });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_UPDATE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved location not found" }, { status: 404 });
    return NextResponse.json({ savedLocation: withResolvedLocation(data) });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved location id" }, { status: 400 });
    const eventId = currentEvent.eventId;
    const { data, error } = await getServiceClient().from("saved_locations").delete().eq("id", id).eq("event_id", eventId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved location not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return planningSelectionErrorResponse(error); }
}
