import { planningSelectionErrorResponse, requirePlanningSelectionAccess } from "@/lib/planningSelectionAuthorization";
import type { SavedSupplierInsert } from "@/lib/planningSelectionContracts";
import { withCanonicalPlanningState } from "@/lib/planningSelectionState";
import { getServiceClient } from "@/lib/supabaseServer";
import {
  isUuid,
  parseCreateSupplierPayload,
  parseSavedSupplierMutation,
  SAVED_SUPPLIER_PROJECTION,
  SAVED_SUPPLIER_WITH_NAME_PROJECTION,
} from "@/lib/supplierContracts";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "read");
    const eventId = currentEvent.eventId;
    const resourceId = req.nextUrl.searchParams.get("resource_id");
    const db = getServiceClient();

    if (resourceId !== null) {
      if (!isUuid(resourceId)) return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
      const { data, error } = await db.from("saved_suppliers")
        .select(SAVED_SUPPLIER_WITH_NAME_PROJECTION)
        .eq("id", resourceId).eq("event_id", eventId).maybeSingle();
      if (error) return NextResponse.json({ error: "PLANNING_SELECTION_READ_FAILED" }, { status: 500 });
      if (!data) return NextResponse.json({ error: "SAVED_SUPPLIER_NOT_FOUND" }, { status: 404 });
      return NextResponse.json({ savedSupplier: withCanonicalPlanningState("supplier", data), eventId });
    }

    const { data, error } = await db.from("saved_suppliers")
      .select(SAVED_SUPPLIER_WITH_NAME_PROJECTION)
      .eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_READ_FAILED" }, { status: 500 });
    return NextResponse.json({
      savedSuppliers: (data ?? []).map((row) => withCanonicalPlanningState("supplier", row)),
      eventId,
    });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const parsed = parseCreateSupplierPayload(await readJson(req));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const eventId = currentEvent.eventId;
    const db = getServiceClient();
    const { data: supplier, error: supplierError } = await db.from("suppliers")
      .select("id").eq("id", parsed.value.supplier_id).maybeSingle();
    if (supplierError) return NextResponse.json({ error: "PLANNING_SELECTION_LOOKUP_FAILED" }, { status: 500 });
    if (!supplier) return NextResponse.json({ error: "SUPPLIER_NOT_FOUND" }, { status: 404 });

    const insert: SavedSupplierInsert = { event_id: eventId, supplier_id: parsed.value.supplier_id };
    const { data, error } = await db.from("saved_suppliers").insert(insert)
      .select(SAVED_SUPPLIER_PROJECTION).single();
    if (error?.code === "23505") return NextResponse.json({ error: "SUPPLIER_ALREADY_SAVED" }, { status: 409 });
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_CREATE_FAILED" }, { status: 500 });
    return NextResponse.json({ savedSupplier: withCanonicalPlanningState("supplier", data) }, { status: 201 });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const parsed = parseSavedSupplierMutation(await readJson(req));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { data, error } = await getServiceClient().from("saved_suppliers")
      .update(parsed.value.update)
      .eq("id", parsed.value.resourceId).eq("event_id", currentEvent.eventId)
      .select(SAVED_SUPPLIER_PROJECTION).maybeSingle();
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_UPDATE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "SAVED_SUPPLIER_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ savedSupplier: withCanonicalPlanningState("supplier", data) });
  } catch (error) { return planningSelectionErrorResponse(error); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const resourceId = req.nextUrl.searchParams.get("resource_id");
    if (!isUuid(resourceId)) return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    const { data, error } = await getServiceClient().from("saved_suppliers").delete()
      .eq("id", resourceId).eq("event_id", currentEvent.eventId)
      .select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PLANNING_SELECTION_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "SAVED_SUPPLIER_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) { return planningSelectionErrorResponse(error); }
}
