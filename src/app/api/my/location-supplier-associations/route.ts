import {
  parsePrivateAssociationCreate,
  parsePrivateAssociationFilter,
  parsePrivateAssociationUpdate,
  PRIVATE_ASSOCIATION_PROJECTION,
  resolvePrivateAssociation,
  type AssociationEndpointInput,
  type AssociationEndpointType,
} from "@/lib/locationSupplierAssociationContracts";
import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ServiceClient = ReturnType<typeof getServiceClient>;
type AssociationRow = Parameters<typeof resolvePrivateAssociation>[0];

const ENDPOINT_COLUMNS: Readonly<Record<AssociationEndpointType, string>> = {
  saved_location: "saved_location_id",
  private_location: "private_location_id",
  saved_supplier: "saved_supplier_id",
  private_supplier: "private_supplier_id",
};

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

async function endpointExists(
  db: ServiceClient,
  eventId: string,
  entity: "location" | "supplier",
  endpoint: AssociationEndpointInput,
): Promise<{ exists: boolean; failed: boolean }> {
  if (endpoint.scope === "saved") {
    const table = entity === "location" ? "saved_locations" : "saved_suppliers";
    const { data, error } = await db.from(table).select("id")
      .eq("id", endpoint.resource_id).eq("event_id", eventId).maybeSingle();
    return { exists: Boolean(data), failed: Boolean(error) };
  }
  const { data, error } = await db.from("event_private_catalog_records").select("id")
    .eq("id", endpoint.resource_id).eq("event_id", eventId).eq("entity_type", entity).maybeSingle();
  return { exists: Boolean(data), failed: Boolean(error) };
}

function serializeRow(row: unknown) {
  return resolvePrivateAssociation(row as AssociationRow);
}

export async function GET(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "read");
    if (currentEvent.accessRole === "legacy") {
      return NextResponse.json({ error: "PLANNING_SELECTION_FORBIDDEN" }, { status: 403 });
    }
    const parsed = parsePrivateAssociationFilter(request.nextUrl.searchParams);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    let query = getServiceClient().from("event_location_supplier_links")
      .select(PRIVATE_ASSOCIATION_PROJECTION)
      .eq("event_id", currentEvent.eventId);
    if (parsed.value.resourceId) query = query.eq("id", parsed.value.resourceId);
    if (parsed.value.endpointType && parsed.value.endpointId) {
      query = query.eq(ENDPOINT_COLUMNS[parsed.value.endpointType], parsed.value.endpointId);
    }

    if (parsed.value.resourceId) {
      const { data, error } = await query.maybeSingle();
      if (error) return NextResponse.json({ error: "PRIVATE_ASSOCIATIONS_READ_FAILED" }, { status: 500 });
      const association = data ? serializeRow(data) : null;
      if (!association) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_NOT_FOUND" }, { status: 404 });
      return NextResponse.json({ association, eventId: currentEvent.eventId });
    }

    const { data, error } = await query.order("created_at", { ascending: true }).order("id", { ascending: true });
    if (error) return NextResponse.json({ error: "PRIVATE_ASSOCIATIONS_READ_FAILED" }, { status: 500 });
    const associations = (data ?? []).map(serializeRow);
    if (associations.some((item) => item === null)) {
      return NextResponse.json({ error: "PRIVATE_ASSOCIATIONS_READ_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ associations, eventId: currentEvent.eventId });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    if (currentEvent.accessRole === "legacy") {
      return NextResponse.json({ error: "PLANNING_SELECTION_FORBIDDEN" }, { status: 403 });
    }
    const parsed = parsePrivateAssociationCreate(await readJson(request));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const db = getServiceClient();
    const [location, supplier] = await Promise.all([
      endpointExists(db, currentEvent.eventId, "location", parsed.value.location),
      endpointExists(db, currentEvent.eventId, "supplier", parsed.value.supplier),
    ]);
    if (location.failed || supplier.failed) {
      return NextResponse.json({ error: "PRIVATE_ASSOCIATION_LOOKUP_FAILED" }, { status: 500 });
    }
    if (!location.exists || !supplier.exists) {
      return NextResponse.json({ error: "ASSOCIATION_ENDPOINT_NOT_FOUND" }, { status: 404 });
    }

    const insert = {
      event_id: currentEvent.eventId,
      saved_location_id: parsed.value.location.scope === "saved" ? parsed.value.location.resource_id : null,
      private_location_id: parsed.value.location.scope === "private" ? parsed.value.location.resource_id : null,
      saved_supplier_id: parsed.value.supplier.scope === "saved" ? parsed.value.supplier.resource_id : null,
      private_supplier_id: parsed.value.supplier.scope === "private" ? parsed.value.supplier.resource_id : null,
      relationship_type: parsed.value.relationshipType,
      private_notes: parsed.value.privateNotes,
      created_by: userId,
    };
    const { data, error } = await db.from("event_location_supplier_links")
      .insert(insert).select(PRIVATE_ASSOCIATION_PROJECTION).single();
    if (!error && data) {
      const association = serializeRow(data);
      if (!association) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_CREATE_FAILED" }, { status: 500 });
      return NextResponse.json({ association, idempotent: false }, { status: 201 });
    }
    if (error?.code !== "23505") {
      const status = error?.code === "23503" ? 404 : error?.code === "23514" ? 400 : 500;
      const code = status === 404 ? "ASSOCIATION_ENDPOINT_NOT_FOUND" : status === 400 ? "INVALID_ASSOCIATION_PAYLOAD" : "PRIVATE_ASSOCIATION_CREATE_FAILED";
      return NextResponse.json({ error: code }, { status });
    }

    let existingQuery = db.from("event_location_supplier_links")
      .select(PRIVATE_ASSOCIATION_PROJECTION)
      .eq("event_id", currentEvent.eventId)
      .eq("relationship_type", parsed.value.relationshipType);
    existingQuery = existingQuery.eq(
      parsed.value.location.scope === "saved" ? "saved_location_id" : "private_location_id",
      parsed.value.location.resource_id,
    );
    existingQuery = existingQuery.eq(
      parsed.value.supplier.scope === "saved" ? "saved_supplier_id" : "private_supplier_id",
      parsed.value.supplier.resource_id,
    );
    const { data: existing, error: existingError } = await existingQuery.maybeSingle();
    const association = existing ? serializeRow(existing) : null;
    if (existingError || !association) {
      return NextResponse.json({ error: "PRIVATE_ASSOCIATION_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ association, idempotent: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    if (currentEvent.accessRole === "legacy") {
      return NextResponse.json({ error: "PLANNING_SELECTION_FORBIDDEN" }, { status: 403 });
    }
    const parsed = parsePrivateAssociationUpdate(await readJson(request));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { data, error } = await getServiceClient().from("event_location_supplier_links")
      .update(parsed.value.update)
      .eq("id", parsed.value.resourceId).eq("event_id", currentEvent.eventId)
      .select(PRIVATE_ASSOCIATION_PROJECTION).maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "PRIVATE_ASSOCIATION_ALREADY_EXISTS" }, { status: 409 });
    if (error) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_UPDATE_FAILED" }, { status: 500 });
    const association = data ? serializeRow(data) : null;
    if (!association) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ association });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "mutate");
    if (currentEvent.accessRole === "legacy") {
      return NextResponse.json({ error: "PLANNING_SELECTION_FORBIDDEN" }, { status: 403 });
    }
    const parsed = parsePrivateAssociationFilter(request.nextUrl.searchParams);
    if (!parsed.ok || !parsed.value.resourceId || parsed.value.endpointType) {
      return NextResponse.json({ error: parsed.ok ? "INVALID_RESOURCE_ID" : parsed.error }, { status: 400 });
    }
    const { data, error } = await getServiceClient().from("event_location_supplier_links")
      .delete().eq("id", parsed.value.resourceId).eq("event_id", currentEvent.eventId)
      .select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "PRIVATE_ASSOCIATION_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}
