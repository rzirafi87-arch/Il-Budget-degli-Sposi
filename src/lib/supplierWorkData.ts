import { isSnapshotSchemaUnavailable, resolveCatalogRecord } from "@/lib/catalogSnapshotContracts";
import {
  SAVED_SUPPLIER_LEGACY_WITH_NAME_PROJECTION,
  SAVED_SUPPLIER_WITH_NAME_PROJECTION,
} from "@/lib/supplierContracts";
import type { SupplierLink, SupplierOption, SupplierReferenceInput } from "@/lib/supplierWorkContracts";
import type { getServiceClient } from "@/lib/supabaseServer";

type ServiceClient = ReturnType<typeof getServiceClient>;

type SavedOptionRow = {
  id: string;
  supplier_id: string;
  catalog_snapshot?: unknown;
  private_overrides?: unknown;
  supplier?: unknown;
};

type PrivateOptionRow = {
  id: string;
  snapshot_data: unknown;
  override_data: unknown;
};

export const APPOINTMENT_PROJECTION = "id,client_key,title,appointment_date,location,notes,saved_supplier_id,private_supplier_id,inserted_at,updated_at";

export type AppointmentRow = {
  id: string;
  client_key: string | null;
  title: string;
  appointment_date: string;
  location: string | null;
  notes: string | null;
  saved_supplier_id: string | null;
  private_supplier_id: string | null;
  inserted_at: string;
  updated_at: string;
};

function oneRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) return oneRecord(value[0]);
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function nameFromResolved(value: unknown) {
  const record = oneRecord(value);
  return typeof record?.name === "string" ? record.name : "";
}

export async function loadSupplierOptions(db: ServiceClient, eventId: string): Promise<SupplierOption[]> {
  const savedPrimary = await db.from("saved_suppliers")
    .select(SAVED_SUPPLIER_WITH_NAME_PROJECTION)
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  const { data: savedData, error: savedError } = isSnapshotSchemaUnavailable(savedPrimary.error)
    ? await db.from("saved_suppliers")
      .select(SAVED_SUPPLIER_LEGACY_WITH_NAME_PROJECTION)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
    : savedPrimary;
  if (savedError) throw new Error("SUPPLIER_OPTIONS_READ_FAILED");

  const { data: privateData, error: privateError } = await db
    .from("event_private_catalog_records")
    .select("id,snapshot_data,override_data")
    .eq("event_id", eventId)
    .eq("entity_type", "supplier")
    .order("created_at", { ascending: true });
  if (privateError) throw new Error("SUPPLIER_OPTIONS_READ_FAILED");

  const saved = (savedData ?? []).map((row) => {
    const item = row as unknown as SavedOptionRow;
    const resolved = resolveCatalogRecord(
      oneRecord(item.supplier),
      item.catalog_snapshot,
      item.private_overrides,
    );
    return {
      scope: "saved" as const,
      resourceId: item.id,
      catalogId: item.supplier_id,
      name: nameFromResolved(resolved),
    };
  });
  const privateOptions = (privateData ?? []).map((row) => {
    const item = row as unknown as PrivateOptionRow;
    return {
      scope: "private" as const,
      resourceId: item.id,
      catalogId: null,
      name: nameFromResolved(resolveCatalogRecord(null, item.snapshot_data, item.override_data)),
    };
  });
  return [...saved, ...privateOptions].sort((left, right) =>
    left.name.localeCompare(right.name) || left.resourceId.localeCompare(right.resourceId));
}

export function resolveSupplierLink(
  options: readonly SupplierOption[],
  savedSupplierId: string | null,
  privateSupplierId: string | null,
): SupplierLink | null {
  const scope = savedSupplierId ? "saved" : privateSupplierId ? "private" : null;
  const resourceId = savedSupplierId ?? privateSupplierId;
  if (!scope || !resourceId) return null;
  return options.find((option) => option.scope === scope && option.resourceId === resourceId) ?? null;
}

export function serializeAppointment(row: AppointmentRow, options: readonly SupplierOption[]) {
  return {
    id: row.id,
    clientKey: row.client_key,
    title: row.title,
    date: row.appointment_date,
    location: row.location ?? "",
    notes: row.notes ?? "",
    supplier: resolveSupplierLink(options, row.saved_supplier_id, row.private_supplier_id),
    insertedAt: row.inserted_at,
    updatedAt: row.updated_at,
  };
}

export async function supplierReferenceExists(
  db: ServiceClient,
  eventId: string,
  reference: SupplierReferenceInput,
): Promise<boolean> {
  if (reference.scope === "saved") {
    const { data, error } = await db.from("saved_suppliers")
      .select("id")
      .eq("id", reference.resource_id)
      .eq("event_id", eventId)
      .maybeSingle();
    if (error) throw new Error("SUPPLIER_LINK_LOOKUP_FAILED");
    return Boolean(data);
  }
  const { data, error } = await db.from("event_private_catalog_records")
    .select("id")
    .eq("id", reference.resource_id)
    .eq("event_id", eventId)
    .eq("entity_type", "supplier")
    .maybeSingle();
  if (error) throw new Error("SUPPLIER_LINK_LOOKUP_FAILED");
  return Boolean(data);
}
