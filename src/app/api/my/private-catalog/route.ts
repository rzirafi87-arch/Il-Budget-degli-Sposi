import {
  parseCatalogOverrides,
  parsePrivateCatalogCreate,
  parsePrivateCatalogUpdate,
  PRIVATE_CATALOG_PROJECTION,
  resolveCatalogRecord,
  UUID_PATTERN,
  type CatalogEntityType,
} from "@/lib/catalogSnapshotContracts";
import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function readJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function withResolvedRecord<T extends {
  snapshot_data: unknown;
  override_data: unknown;
}>(row: T) {
  return { ...row, resolved_record: resolveCatalogRecord(null, row.snapshot_data, row.override_data) };
}

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "read");
    const resourceId = req.nextUrl.searchParams.get("resource_id");
    const entityType = req.nextUrl.searchParams.get("entity_type");
    if (resourceId !== null && !UUID_PATTERN.test(resourceId)) {
      return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    }
    if (entityType !== null && !["church", "location", "supplier"].includes(entityType)) {
      return NextResponse.json({ error: "INVALID_CATALOG_ENTITY_TYPE" }, { status: 400 });
    }

    let query = getServiceClient().from("event_private_catalog_records")
      .select(PRIVATE_CATALOG_PROJECTION)
      .eq("event_id", currentEvent.eventId);
    if (resourceId) query = query.eq("id", resourceId);
    if (entityType) query = query.eq("entity_type", entityType);

    if (resourceId) {
      const { data, error } = await query.maybeSingle();
      if (error) return NextResponse.json({ error: "PRIVATE_CATALOG_READ_FAILED" }, { status: 500 });
      if (!data) return NextResponse.json({ error: "PRIVATE_CATALOG_RECORD_NOT_FOUND" }, { status: 404 });
      return NextResponse.json({ record: withResolvedRecord(data), eventId: currentEvent.eventId });
    }

    const { data, error } = await query.order("created_at", { ascending: true }).order("id", { ascending: true });
    if (error) return NextResponse.json({ error: "PRIVATE_CATALOG_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ records: (data ?? []).map(withResolvedRecord), eventId: currentEvent.eventId });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const parsed = parsePrivateCatalogCreate(await readJson(req));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const db = getServiceClient();
    const insert = {
      event_id: currentEvent.eventId,
      entity_type: parsed.value.entityType,
      client_key: parsed.value.clientKey,
      snapshot_data: parsed.value.snapshot,
      snapshot_fingerprint: "0".repeat(64),
      created_by: userId,
    };
    const { data, error } = await db.from("event_private_catalog_records")
      .insert(insert).select(PRIVATE_CATALOG_PROJECTION).single();
    if (!error && data) {
      return NextResponse.json({ record: withResolvedRecord(data), idempotent: false }, { status: 201 });
    }
    if (error?.code !== "23505") {
      return NextResponse.json({ error: "PRIVATE_CATALOG_CREATE_FAILED" }, { status: 500 });
    }

    const { data: existing, error: existingError } = await db.from("event_private_catalog_records")
      .select(PRIVATE_CATALOG_PROJECTION)
      .eq("event_id", currentEvent.eventId)
      .eq("entity_type", parsed.value.entityType)
      .eq("client_key", parsed.value.clientKey)
      .maybeSingle();
    if (existingError || !existing) {
      return NextResponse.json({ error: "PRIVATE_CATALOG_CREATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ record: withResolvedRecord(existing), idempotent: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const parsed = parsePrivateCatalogUpdate(await readJson(req));
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const db = getServiceClient();
    const { data: existing, error: lookupError } = await db.from("event_private_catalog_records")
      .select("id,entity_type")
      .eq("id", parsed.value.resourceId)
      .eq("event_id", currentEvent.eventId)
      .maybeSingle();
    if (lookupError) return NextResponse.json({ error: "PRIVATE_CATALOG_READ_FAILED" }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "PRIVATE_CATALOG_RECORD_NOT_FOUND" }, { status: 404 });
    const override = parseCatalogOverrides(existing.entity_type as CatalogEntityType, parsed.value.override);
    if (!override.ok) return NextResponse.json({ error: override.error }, { status: 400 });

    const { data, error } = await db.from("event_private_catalog_records")
      .update({ override_data: override.value })
      .eq("id", parsed.value.resourceId)
      .eq("event_id", currentEvent.eventId)
      .select(PRIVATE_CATALOG_PROJECTION)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "PRIVATE_CATALOG_UPDATE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "PRIVATE_CATALOG_RECORD_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ record: withResolvedRecord(data) });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(req, "mutate");
    const resourceId = req.nextUrl.searchParams.get("resource_id");
    if (!resourceId || !UUID_PATTERN.test(resourceId)) {
      return NextResponse.json({ error: "INVALID_RESOURCE_ID" }, { status: 400 });
    }
    const { data, error } = await getServiceClient().from("event_private_catalog_records")
      .delete().eq("id", resourceId).eq("event_id", currentEvent.eventId)
      .select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "PRIVATE_CATALOG_DELETE_FAILED" }, { status: 500 });
    if (!data) return NextResponse.json({ error: "PRIVATE_CATALOG_RECORD_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planningSelectionErrorResponse(error);
  }
}
