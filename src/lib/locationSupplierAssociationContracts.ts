import {
  LOCATION_SNAPSHOT_SOURCE_PROJECTION,
  resolveCatalogRecord,
  SUPPLIER_SNAPSHOT_SOURCE_PROJECTION,
  UUID_PATTERN,
} from "@/lib/catalogSnapshotContracts";

export const LOCATION_SUPPLIER_RELATIONSHIP_TYPES = [
  "works_at",
  "preferred_supplier",
  "internal_supplier",
  "external_allowed",
  "recommended",
  "historic_relationship",
] as const;

export type LocationSupplierRelationshipType = typeof LOCATION_SUPPLIER_RELATIONSHIP_TYPES[number];
export type PrivateAssociationScope = "saved" | "private";
export type AssociationEndpointType = "saved_location" | "private_location" | "saved_supplier" | "private_supplier";

export type AssociationEndpointInput = {
  scope: PrivateAssociationScope;
  resource_id: string;
};

export type PrivateAssociationEndpoint = {
  scope: PrivateAssociationScope;
  resourceId: string;
  catalogId: string | null;
  name: string;
  resolvedRecord: Record<string, unknown>;
};

export type PrivateLocationSupplierAssociation = {
  id: string;
  relationshipType: LocationSupplierRelationshipType;
  privateNotes: string | null;
  createdAt: string;
  updatedAt: string;
  location: PrivateAssociationEndpoint;
  supplier: PrivateAssociationEndpoint;
};

export type GlobalLocationSupplierAssociation = {
  supplier_id: string;
  location_id: string;
  relationship_type: LocationSupplierRelationshipType;
  source: string;
  source_url: string | null;
  verified_at: string | null;
  created_at: string;
  supplier: Record<string, unknown> | null;
  location: Record<string, unknown> | null;
};

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

type RawAssociationRow = {
  id: string;
  event_id: string;
  saved_location_id: string | null;
  private_location_id: string | null;
  saved_supplier_id: string | null;
  private_supplier_id: string | null;
  relationship_type: string;
  private_notes: string | null;
  created_at: string;
  updated_at: string;
  saved_location?: unknown;
  private_location?: unknown;
  saved_supplier?: unknown;
  private_supplier?: unknown;
};

const CREATE_KEYS = new Set(["location", "supplier", "relationship_type", "private_notes"]);
const UPDATE_KEYS = new Set(["resource_id", "relationship_type", "private_notes"]);
const ENDPOINT_KEYS = new Set(["scope", "resource_id"]);
const RELATIONSHIP_TYPES = new Set<string>(LOCATION_SUPPLIER_RELATIONSHIP_TYPES);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: ReadonlySet<string>) {
  return Object.keys(value).every((key) => keys.has(key));
}

function parseEndpoint(value: unknown): ValidationResult<AssociationEndpointInput> {
  if (!isObject(value) || !hasOnlyKeys(value, ENDPOINT_KEYS)) {
    return { ok: false, error: "INVALID_ASSOCIATION_ENDPOINT" };
  }
  if ((value.scope !== "saved" && value.scope !== "private") || !UUID_PATTERN.test(String(value.resource_id ?? ""))) {
    return { ok: false, error: "INVALID_ASSOCIATION_ENDPOINT" };
  }
  return { ok: true, value: { scope: value.scope, resource_id: String(value.resource_id) } };
}

function parseRelationshipType(value: unknown): ValidationResult<LocationSupplierRelationshipType> {
  if (typeof value !== "string" || !RELATIONSHIP_TYPES.has(value)) {
    return { ok: false, error: "INVALID_RELATIONSHIP_TYPE" };
  }
  return { ok: true, value: value as LocationSupplierRelationshipType };
}

function parsePrivateNotes(value: unknown): ValidationResult<string | null> {
  if (value === null || value === undefined) return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, error: "INVALID_PRIVATE_NOTES" };
  const normalized = value.trim();
  if (normalized.length > 4000) return { ok: false, error: "PRIVATE_NOTES_TOO_LONG" };
  return { ok: true, value: normalized || null };
}

export function parsePrivateAssociationCreate(value: unknown): ValidationResult<{
  location: AssociationEndpointInput;
  supplier: AssociationEndpointInput;
  relationshipType: LocationSupplierRelationshipType;
  privateNotes: string | null;
}> {
  if (!isObject(value) || !hasOnlyKeys(value, CREATE_KEYS)) {
    return { ok: false, error: "INVALID_ASSOCIATION_PAYLOAD" };
  }
  const location = parseEndpoint(value.location);
  if (!location.ok) return location;
  const supplier = parseEndpoint(value.supplier);
  if (!supplier.ok) return supplier;
  const relationshipType = parseRelationshipType(value.relationship_type);
  if (!relationshipType.ok) return relationshipType;
  const privateNotes = parsePrivateNotes(value.private_notes);
  if (!privateNotes.ok) return privateNotes;
  return {
    ok: true,
    value: {
      location: location.value,
      supplier: supplier.value,
      relationshipType: relationshipType.value,
      privateNotes: privateNotes.value,
    },
  };
}

export function parsePrivateAssociationUpdate(value: unknown): ValidationResult<{
  resourceId: string;
  update: { relationship_type?: LocationSupplierRelationshipType; private_notes?: string | null };
}> {
  if (!isObject(value) || !hasOnlyKeys(value, UPDATE_KEYS) || !UUID_PATTERN.test(String(value.resource_id ?? ""))) {
    return { ok: false, error: "INVALID_ASSOCIATION_PAYLOAD" };
  }
  const update: { relationship_type?: LocationSupplierRelationshipType; private_notes?: string | null } = {};
  if (value.relationship_type !== undefined) {
    const relationshipType = parseRelationshipType(value.relationship_type);
    if (!relationshipType.ok) return relationshipType;
    update.relationship_type = relationshipType.value;
  }
  if (value.private_notes !== undefined) {
    const privateNotes = parsePrivateNotes(value.private_notes);
    if (!privateNotes.ok) return privateNotes;
    update.private_notes = privateNotes.value;
  }
  if (Object.keys(update).length === 0) return { ok: false, error: "NO_VALID_ASSOCIATION_UPDATES" };
  return { ok: true, value: { resourceId: String(value.resource_id), update } };
}

export function parsePrivateAssociationFilter(searchParams: URLSearchParams): ValidationResult<{
  resourceId: string | null;
  endpointType: AssociationEndpointType | null;
  endpointId: string | null;
}> {
  const resourceId = searchParams.get("resource_id");
  const endpointType = searchParams.get("endpoint_type");
  const endpointId = searchParams.get("endpoint_id");
  if (resourceId !== null && !UUID_PATTERN.test(resourceId)) return { ok: false, error: "INVALID_RESOURCE_ID" };
  if ((endpointType === null) !== (endpointId === null)) return { ok: false, error: "INVALID_ASSOCIATION_FILTER" };
  if (endpointType !== null && !["saved_location", "private_location", "saved_supplier", "private_supplier"].includes(endpointType)) {
    return { ok: false, error: "INVALID_ASSOCIATION_FILTER" };
  }
  if (endpointId !== null && !UUID_PATTERN.test(endpointId)) return { ok: false, error: "INVALID_ASSOCIATION_FILTER" };
  return {
    ok: true,
    value: {
      resourceId,
      endpointType: endpointType as AssociationEndpointType | null,
      endpointId,
    },
  };
}

export function parseGlobalAssociationFilter(searchParams: URLSearchParams): ValidationResult<{
  locationId: string | null;
  supplierId: string | null;
}> {
  const locationId = searchParams.get("location_id");
  const supplierId = searchParams.get("supplier_id");
  if (!locationId && !supplierId) return { ok: false, error: "ASSOCIATION_FILTER_REQUIRED" };
  if (locationId !== null && !UUID_PATTERN.test(locationId)) return { ok: false, error: "INVALID_LOCATION_ID" };
  if (supplierId !== null && !UUID_PATTERN.test(supplierId)) return { ok: false, error: "INVALID_SUPPLIER_ID" };
  return { ok: true, value: { locationId, supplierId } };
}

export const GLOBAL_ASSOCIATION_PROJECTION = `supplier_id,location_id,relationship_type,source,source_url,verified_at,created_at,supplier:suppliers(${SUPPLIER_SNAPSHOT_SOURCE_PROJECTION}),location:locations(${LOCATION_SNAPSHOT_SOURCE_PROJECTION})`;

export const PRIVATE_ASSOCIATION_PROJECTION = `id,event_id,saved_location_id,private_location_id,saved_supplier_id,private_supplier_id,relationship_type,private_notes,created_at,updated_at,saved_location:saved_locations!event_location_supplier_links_saved_location_event_fkey(id,location_id,catalog_snapshot,private_overrides,location:locations(${LOCATION_SNAPSHOT_SOURCE_PROJECTION})),private_location:event_private_catalog_records!event_location_supplier_links_private_location_event_type_fkey(id,entity_type,snapshot_data,override_data),saved_supplier:saved_suppliers!event_location_supplier_links_saved_supplier_event_fkey(id,supplier_id,catalog_snapshot,private_overrides,supplier:suppliers(${SUPPLIER_SNAPSHOT_SOURCE_PROJECTION})),private_supplier:event_private_catalog_records!event_location_supplier_links_private_supplier_event_type_fkey(id,entity_type,snapshot_data,override_data)`;

function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function endpointFromSaved(value: unknown, entity: "location" | "supplier"): PrivateAssociationEndpoint | null {
  const row = one(value as Record<string, unknown> | Array<Record<string, unknown>> | null);
  if (!row || typeof row.id !== "string") return null;
  const global = one(row[entity] as Record<string, unknown> | Array<Record<string, unknown>> | null);
  const resolved = resolveCatalogRecord(global, row.catalog_snapshot, row.private_overrides) as Record<string, unknown>;
  return {
    scope: "saved",
    resourceId: row.id,
    catalogId: typeof row[`${entity}_id`] === "string" ? String(row[`${entity}_id`]) : null,
    name: typeof resolved.name === "string" ? resolved.name : "",
    resolvedRecord: resolved,
  };
}

function endpointFromPrivate(value: unknown): PrivateAssociationEndpoint | null {
  const row = one(value as Record<string, unknown> | Array<Record<string, unknown>> | null);
  if (!row || typeof row.id !== "string") return null;
  const resolved = resolveCatalogRecord(null, row.snapshot_data, row.override_data) as Record<string, unknown>;
  return {
    scope: "private",
    resourceId: row.id,
    catalogId: null,
    name: typeof resolved.name === "string" ? resolved.name : "",
    resolvedRecord: resolved,
  };
}

export function resolvePrivateAssociation(row: RawAssociationRow): PrivateLocationSupplierAssociation | null {
  const location = row.saved_location_id
    ? endpointFromSaved(row.saved_location, "location")
    : endpointFromPrivate(row.private_location);
  const supplier = row.saved_supplier_id
    ? endpointFromSaved(row.saved_supplier, "supplier")
    : endpointFromPrivate(row.private_supplier);
  if (!location || !supplier || !RELATIONSHIP_TYPES.has(row.relationship_type)) return null;
  return {
    id: row.id,
    relationshipType: row.relationship_type as LocationSupplierRelationshipType,
    privateNotes: row.private_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    location,
    supplier,
  };
}
