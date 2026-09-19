import type { Json } from "@/types/database.types";

export type CatalogEntityType = "church" | "location" | "supplier";
export type CatalogRecord = Record<string, Json | undefined>;

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COMMON_OVERRIDE_KEYS = [
  "name", "address_line", "city", "province", "region", "postal_code",
  "country_code", "phone", "email", "website", "description", "latitude",
  "longitude",
] as const;

export const CATALOG_OVERRIDE_KEYS: Readonly<Record<CatalogEntityType, readonly string[]>> = {
  church: [
    ...COMMON_OVERRIDE_KEYS, "place_type", "denomination", "religion", "subtype",
    "capacity", "wedding_ceremony_available", "accessibility", "parking",
  ],
  location: [
    ...COMMON_OVERRIDE_KEYS, "venue_type", "subtype", "instagram_url", "facebook_url",
    "capacity_min", "capacity_max", "accommodation_available", "catering_internal",
    "catering_external_allowed", "parking", "accessibility", "outdoor_space",
    "indoor_space", "price_range_min", "price_range_max", "currency",
  ],
  supplier: [
    ...COMMON_OVERRIDE_KEYS, "category", "subcategory", "state", "instagram_url",
    "facebook_url", "tiktok_url", "service_area", "regions_served", "travel_available",
    "starting_price", "price_range_min", "price_range_max", "currency",
  ],
};

const BOOLEAN_KEYS = new Set([
  "wedding_ceremony_available", "accommodation_available", "catering_internal",
  "catering_external_allowed", "parking", "accessibility", "outdoor_space",
  "indoor_space", "travel_available",
]);
const INTEGER_KEYS = new Set(["capacity", "capacity_min", "capacity_max"]);
const MONEY_KEYS = new Set(["starting_price", "price_range_min", "price_range_max"]);
const COORDINATE_KEYS = new Set(["latitude", "longitude"]);
const URL_KEYS = new Set(["website", "instagram_url", "facebook_url", "tiktok_url"]);
const LONG_TEXT_KEYS = new Set(["description"]);

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(key: string, value: string): string | null {
  const cleaned = value.trim();
  if (!cleaned) return null;
  if (key === "country_code") return cleaned.toLowerCase();
  if (key === "currency") return cleaned.toUpperCase();
  return cleaned;
}

export function parseCatalogOverrides(
  entityType: CatalogEntityType,
  value: unknown,
  options: { requireName?: boolean } = {},
): ValidationResult<CatalogRecord> {
  if (!isObject(value)) return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
  const allowed = new Set(CATALOG_OVERRIDE_KEYS[entityType]);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    return { ok: false, error: "CATALOG_OVERRIDE_FIELD_FORBIDDEN" };
  }

  const parsed: CatalogRecord = {};
  for (const [key, raw] of Object.entries(value)) {
    if (raw === null) {
      parsed[key] = null;
      continue;
    }
    if (BOOLEAN_KEYS.has(key)) {
      if (typeof raw !== "boolean") return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      parsed[key] = raw;
      continue;
    }
    if (INTEGER_KEYS.has(key)) {
      if (!Number.isInteger(raw) || (raw as number) < 0 || (raw as number) > 1_000_000) {
        return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      }
      parsed[key] = raw as number;
      continue;
    }
    if (MONEY_KEYS.has(key)) {
      if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 || raw > 999_999_999.99) {
        return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      }
      parsed[key] = raw;
      continue;
    }
    if (COORDINATE_KEYS.has(key)) {
      if (typeof raw !== "number" || !Number.isFinite(raw)) return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      const valid = key === "latitude" ? raw >= -90 && raw <= 90 : raw >= -180 && raw <= 180;
      if (!valid) return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      parsed[key] = raw;
      continue;
    }
    if (key === "regions_served") {
      if (!Array.isArray(raw) || raw.length > 50 || raw.some((entry) => typeof entry !== "string" || entry.length > 120)) {
        return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
      }
      parsed[key] = raw.map((entry) => entry.trim()).filter(Boolean);
      continue;
    }
    if (typeof raw !== "string") return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
    const maxLength = LONG_TEXT_KEYS.has(key) ? 4_000 : URL_KEYS.has(key) ? 2_048 : 500;
    if (raw.length > maxLength) return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
    const cleaned = cleanString(key, raw);
    if (key === "country_code" && cleaned !== null && !/^[a-z]{2}$/.test(cleaned)) {
      return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
    }
    if (key === "currency" && cleaned !== null && !/^[A-Z]{3}$/.test(cleaned)) {
      return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
    }
    parsed[key] = cleaned;
  }

  if (options.requireName && (typeof parsed.name !== "string" || !parsed.name)) {
    return { ok: false, error: "PRIVATE_CATALOG_NAME_REQUIRED" };
  }
  return { ok: true, value: parsed };
}

export function parsePrivateCatalogCreate(value: unknown): ValidationResult<{
  entityType: CatalogEntityType;
  clientKey: string;
  snapshot: CatalogRecord;
}> {
  if (!isObject(value) || Object.keys(value).some((key) => !["entity_type", "client_key", "record"].includes(key))) {
    return { ok: false, error: "INVALID_PRIVATE_CATALOG_PAYLOAD" };
  }
  if (!(["church", "location", "supplier"] as const).includes(value.entity_type as CatalogEntityType)) {
    return { ok: false, error: "INVALID_CATALOG_ENTITY_TYPE" };
  }
  if (typeof value.client_key !== "string" || !UUID_PATTERN.test(value.client_key)) {
    return { ok: false, error: "INVALID_CLIENT_KEY" };
  }
  const entityType = value.entity_type as CatalogEntityType;
  const snapshot = parseCatalogOverrides(entityType, value.record, { requireName: true });
  if (!snapshot.ok) return snapshot;
  return { ok: true, value: { entityType, clientKey: value.client_key, snapshot: snapshot.value } };
}

export function parsePrivateCatalogUpdate(value: unknown): ValidationResult<{
  resourceId: string;
  override: CatalogRecord;
}> {
  if (!isObject(value) || Object.keys(value).some((key) => !["resource_id", "override"].includes(key))) {
    return { ok: false, error: "INVALID_PRIVATE_CATALOG_PAYLOAD" };
  }
  if (typeof value.resource_id !== "string" || !UUID_PATTERN.test(value.resource_id)) {
    return { ok: false, error: "INVALID_RESOURCE_ID" };
  }
  if (!isObject(value.override)) return { ok: false, error: "INVALID_CATALOG_OVERRIDE" };
  return { ok: true, value: { resourceId: value.resource_id, override: value.override as CatalogRecord } };
}

export function resolveCatalogRecord(
  globalRecord: unknown,
  snapshot: unknown,
  override: unknown,
): CatalogRecord {
  const globalValue = isObject(globalRecord) ? globalRecord : {};
  const snapshotValue = isObject(snapshot) ? snapshot : {};
  const overrideValue = isObject(override) ? override : {};
  return { ...globalValue, ...snapshotValue, ...overrideValue } as CatalogRecord;
}

export const SAVED_SNAPSHOT_COLUMNS = "catalog_snapshot,catalog_snapshot_version,catalog_snapshot_captured_at,catalog_snapshot_fingerprint,catalog_provenance_snapshot,private_overrides";
export const PRIVATE_CATALOG_PROJECTION = "id,event_id,entity_type,client_key,snapshot_data,snapshot_version,snapshot_captured_at,snapshot_fingerprint,override_data,created_by,created_at,updated_at";

export const CHURCH_SNAPSHOT_SOURCE_PROJECTION = "id,name,place_type,denomination,religion,subtype,address_line,city,province,region,postal_code,country_code,phone,email,website,description,capacity,wedding_ceremony_available,accessibility,parking,latitude,longitude,source,source_url,external_id,source_updated_at,last_verified_at,verification_status,google_place_id";
export const LOCATION_SNAPSHOT_SOURCE_PROJECTION = "id,name,venue_type,subtype,address_line,city,province,region,postal_code,country_code,phone,email,website,instagram_url,facebook_url,description,capacity_min,capacity_max,accommodation_available,catering_internal,catering_external_allowed,parking,accessibility,outdoor_space,indoor_space,price_range_min,price_range_max,currency,latitude,longitude,source,source_url,external_id,source_updated_at,last_verified_at,verification_status,google_place_id";
export const SUPPLIER_SNAPSHOT_SOURCE_PROJECTION = "id,name,category,subcategory,address_line,city,province,region,postal_code,state,country_code,phone,email,website,instagram_url,facebook_url,tiktok_url,description,service_area,regions_served,travel_available,starting_price,price_range_min,price_range_max,currency,latitude,longitude,source,source_url,external_id,source_updated_at,last_verified_at,verification_status,google_place_id";

export function isSnapshotSchemaUnavailable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42703"
    || error.code === "PGRST204"
    || Boolean(error.message?.includes("catalog_snapshot") || error.message?.includes("private_overrides"));
}
