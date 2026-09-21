import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import {
  parseAppointmentCreatePayload,
  parseSupplierFilter,
  supplierFilterColumns,
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
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function databaseError(error: { code?: string } | null, operation: string) {
  if (error?.code === "23503") return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
  if (error?.code === "23514") return NextResponse.json({ error: "INVALID_SUPPLIER_LINK" }, { status: 400 });
  if (error?.code === "23505") return NextResponse.json({ error: "APPOINTMENT_CONFLICT" }, { status: 409 });
  return NextResponse.json({ error: operation }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "read");
    const filter = parseSupplierFilter(request.nextUrl.searchParams);
    if (!filter.ok) return NextResponse.json({ error: filter.error }, { status: 400 });
    if (filter.value) {
      const exists = await supplierReferenceExists(getServiceClient(), currentEvent.eventId, {
        scope: filter.value.scope,
        resource_id: filter.value.resourceId,
      });
      if (!exists) return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
    }
    let query = getServiceClient().from("appointments")
      .select(APPOINTMENT_PROJECTION)
      .eq("event_id", currentEvent.eventId);
    if (filter.value) {
      const supplierFilter = supplierFilterColumns(filter.value);
      query = query.eq(supplierFilter.column, supplierFilter.value);
    }
    const [{ data, error }, options] = await Promise.all([
      query.order("appointment_date", { ascending: true }).order("id", { ascending: true }),
      loadSupplierOptions(getServiceClient(), currentEvent.eventId),
    ]);
    if (error) return NextResponse.json({ error: "APPOINTMENTS_LOAD_FAILED" }, { status: 500 });
    return NextResponse.json({
      appointments: ((data ?? []) as AppointmentRow[]).map((row) => serializeAppointment(row, options)),
      eventId: currentEvent.eventId,
    });
  } catch (error) {
    if (error instanceof Error && ["SUPPLIER_OPTIONS_READ_FAILED", "SUPPLIER_LINK_LOOKUP_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    const parsed = parseAppointmentCreatePayload(await readJson(request));
    if (!parsed.ok) {
      if (parsed.error === "APPOINTMENT_REQUIRED_FIELDS") {
        return NextResponse.json({ error: parsed.error, code: "APPOINTMENT_REQUIRED_FIELDS" }, { status: 400 });
      }
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const db = getServiceClient();
    if (parsed.value.supplier && !(await supplierReferenceExists(db, currentEvent.eventId, parsed.value.supplier))) {
      return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
    }
    const { supplier, ...fields } = parsed.value;
    const clientKey = fields.client_key ?? randomUUID();
    const { error } = await db.from("appointments")
      .upsert({
        event_id: currentEvent.eventId,
        ...fields,
        client_key: clientKey,
        ...supplierReferenceColumns(supplier),
      }, { onConflict: "event_id,client_key", ignoreDuplicates: true });
    if (error) return databaseError(error, "APPOINTMENT_SAVE_FAILED");
    const { data, error: readError } = await db.from("appointments")
      .select(APPOINTMENT_PROJECTION)
      .eq("event_id", currentEvent.eventId)
      .eq("client_key", clientKey)
      .single();
    if (readError || !data) return NextResponse.json({ error: "APPOINTMENT_SAVE_FAILED" }, { status: 500 });
    const options = await loadSupplierOptions(db, currentEvent.eventId);
    return NextResponse.json({
      appointment: serializeAppointment(data as AppointmentRow, options),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["SUPPLIER_OPTIONS_READ_FAILED", "SUPPLIER_LINK_LOOKUP_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}
