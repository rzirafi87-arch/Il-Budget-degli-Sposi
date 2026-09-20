import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import { isUuid } from "@/lib/supplierContracts";
import {
  parseSupplierFilter,
  parseTimelineCreatePayload,
  parseTimelineUpdatePayload,
  supplierFilterColumns,
  supplierReferenceColumns,
  type SupplierReferenceInput,
} from "@/lib/supplierWorkContracts";
import {
  loadSupplierOptions,
  resolveSupplierLink,
  supplierReferenceExists,
} from "@/lib/supplierWorkData";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const TIMELINE_PROJECTION = "id,client_key,title,description,category,completed,display_order,phase,days_before,due_date,saved_supplier_id,private_supplier_id";

type TimelineRow = {
  id: string;
  client_key: string | null;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean | null;
  display_order: number | null;
  phase: string | null;
  days_before: number | null;
  due_date: string | null;
  saved_supplier_id: string | null;
  private_supplier_id: string | null;
};

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function serializeTimeline(row: TimelineRow, options: Awaited<ReturnType<typeof loadSupplierOptions>>) {
  return {
    ...row,
    supplier: resolveSupplierLink(options, row.saved_supplier_id, row.private_supplier_id),
  };
}

async function referencesExist(eventId: string, references: readonly (SupplierReferenceInput | null)[]) {
  const db = getServiceClient();
  const unique = new Map<string, SupplierReferenceInput>();
  for (const reference of references) {
    if (reference) unique.set(`${reference.scope}:${reference.resource_id}`, reference);
  }
  const results = await Promise.all(
    [...unique.values()].map((reference) => supplierReferenceExists(db, eventId, reference)),
  );
  return results.every(Boolean);
}

function databaseError(error: { code?: string } | null, operation: string) {
  if (error?.code === "23503") return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
  if (error?.code === "23514") return NextResponse.json({ error: "INVALID_SUPPLIER_LINK" }, { status: 400 });
  if (error?.code === "23505") return NextResponse.json({ error: "TIMELINE_CONFLICT" }, { status: 409 });
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

    let query = getServiceClient().from("timeline_items")
      .select(TIMELINE_PROJECTION)
      .eq("event_id", currentEvent.eventId);
    if (filter.value) {
      const supplierFilter = supplierFilterColumns(filter.value);
      query = query.eq(supplierFilter.column, supplierFilter.value);
    }
    const [{ data, error }, options] = await Promise.all([
      query.order("display_order", { ascending: true })
        .order("days_before", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true }),
      loadSupplierOptions(getServiceClient(), currentEvent.eventId),
    ]);
    if (error) return NextResponse.json({ error: "TIMELINE_READ_FAILED" }, { status: 500 });
    return NextResponse.json({
      items: ((data ?? []) as TimelineRow[]).map((row) => serializeTimeline(row, options)),
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
    const parsed = parseTimelineCreatePayload(await readJson(request));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (!(await referencesExist(currentEvent.eventId, parsed.value.map((item) => item.supplier)))) {
      return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
    }
    const rows = parsed.value.map(({ supplier, ...item }) => ({
      event_id: currentEvent.eventId,
      ...item,
      client_key: item.client_key ?? randomUUID(),
      ...supplierReferenceColumns(supplier),
    }));
    const db = getServiceClient();
    const { error } = await db.from("timeline_items").upsert(rows, {
      onConflict: "event_id,client_key",
      ignoreDuplicates: true,
    });
    if (error) return databaseError(error, "TIMELINE_CREATE_FAILED");
    const clientKeys = rows.map((row) => row.client_key);
    const { data, error: readError } = await db.from("timeline_items")
      .select(TIMELINE_PROJECTION)
      .eq("event_id", currentEvent.eventId)
      .in("client_key", clientKeys);
    if (readError || (data ?? []).length !== clientKeys.length) {
      return NextResponse.json({ error: "TIMELINE_CREATE_FAILED" }, { status: 500 });
    }
    const rowsByClientKey = new Map(((data ?? []) as TimelineRow[]).map((row) => [row.client_key, row]));
    const options = await loadSupplierOptions(db, currentEvent.eventId);
    return NextResponse.json({
      items: clientKeys.map((clientKey) => rowsByClientKey.get(clientKey)).filter((row): row is TimelineRow => Boolean(row)).map((row) => serializeTimeline(row, options)),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && ["SUPPLIER_OPTIONS_READ_FAILED", "SUPPLIER_LINK_LOOKUP_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    const parsed = parseTimelineUpdatePayload(await readJson(request));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const db = getServiceClient();
    const { data: existing, error: existingError } = await db.from("timeline_items")
      .select("id")
      .eq("id", parsed.value.resourceId)
      .eq("event_id", currentEvent.eventId)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: "TIMELINE_READ_FAILED" }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "TIMELINE_ITEM_NOT_FOUND" }, { status: 404 });
    if (parsed.value.supplier && !(await supplierReferenceExists(db, currentEvent.eventId, parsed.value.supplier))) {
      return NextResponse.json({ error: "SUPPLIER_LINK_NOT_FOUND" }, { status: 404 });
    }
    const update = {
      ...parsed.value.update,
      ...(parsed.value.supplier === undefined ? {} : supplierReferenceColumns(parsed.value.supplier)),
    };
    const { data, error } = await db.from("timeline_items")
      .update(update)
      .eq("id", parsed.value.resourceId)
      .eq("event_id", currentEvent.eventId)
      .select(TIMELINE_PROJECTION)
      .maybeSingle();
    if (error) return databaseError(error, "TIMELINE_UPDATE_FAILED");
    if (!data) return NextResponse.json({ error: "TIMELINE_ITEM_NOT_FOUND" }, { status: 404 });
    const options = await loadSupplierOptions(db, currentEvent.eventId);
    return NextResponse.json({ item: serializeTimeline(data as TimelineRow, options) });
  } catch (error) {
    if (error instanceof Error && ["SUPPLIER_OPTIONS_READ_FAILED", "SUPPLIER_LINK_LOOKUP_FAILED"].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    const resourceId = request.nextUrl.searchParams.get("id");
    if (!isUuid(resourceId)) return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    const { data, error } = await getServiceClient().from("timeline_items")
      .delete()
      .eq("id", resourceId)
      .eq("event_id", currentEvent.eventId)
      .select("id")
      .maybeSingle();
    if (error) return NextResponse.json({ error: "TIMELINE_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "TIMELINE_ITEM_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}
