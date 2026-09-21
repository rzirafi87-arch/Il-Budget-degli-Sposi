import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import { isUuid } from "@/lib/supplierContracts";
import {
  parseAppointmentUpdatePayload,
  supplierReferenceColumns,
} from "@/lib/supplierWorkContracts";
import {
  APPOINTMENT_PROJECTION,
  loadSupplierOptions,
  serializeAppointment,
  supplierReferenceExists,
  type AppointmentRow,
} from "@/lib/supplierWorkData";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function databaseError(error: { code?: string } | null) {
  if (error?.code === "23503") return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
  if (error?.code === "23514") return NextResponse.json({ error: "INVALID_SUPPLIER_LINK" }, { status: 400 });
  if (error?.code === "23505") return NextResponse.json({ error: "APPOINTMENT_CONFLICT" }, { status: 409 });
  return NextResponse.json({ error: "APPOINTMENT_UPDATE_FAILED" }, { status: 500 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    const parsed = parseAppointmentUpdatePayload(await readJson(request));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const db = getServiceClient();
    const { data: existing, error: existingError } = await db.from("appointments")
      .select("id")
      .eq("id", id)
      .eq("event_id", currentEvent.eventId)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: "APPOINTMENTS_LOAD_FAILED" }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (parsed.value.supplier && !(await supplierReferenceExists(db, currentEvent.eventId, parsed.value.supplier))) {
      return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
    }
    const update = {
      ...parsed.value.update,
      ...(parsed.value.supplier === undefined ? {} : supplierReferenceColumns(parsed.value.supplier)),
    };
    const { data, error } = await db.from("appointments")
      .update(update)
      .eq("id", id)
      .eq("event_id", currentEvent.eventId)
      .select(APPOINTMENT_PROJECTION)
      .maybeSingle();
    if (error) return databaseError(error);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const options = await loadSupplierOptions(db, currentEvent.eventId);
    return NextResponse.json({ appointment: serializeAppointment(data as AppointmentRow, options) });
  } catch (error) {
    if (error instanceof Error && ["SUPPLIER_OPTIONS_READ_FAILED", "SUPPLIER_LINK_LOOKUP_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    const db = getServiceClient();
    const { data: existing, error: existingError } = await db.from("appointments")
      .select("id")
      .eq("id", id)
      .eq("event_id", currentEvent.eventId)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: "APPOINTMENT_DELETE_FAILED" }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { error } = await db.from("appointments")
      .delete()
      .eq("id", id)
      .eq("event_id", currentEvent.eventId);
    if (error) return NextResponse.json({ error: "APPOINTMENT_DELETE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}
