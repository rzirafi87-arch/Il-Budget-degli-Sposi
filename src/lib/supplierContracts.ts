import type { Database } from "@/types/database.types";

type SupplierTable = Database["public"]["Tables"]["suppliers"];
type SavedSupplierTable = Database["public"]["Tables"]["saved_suppliers"];

export type SupplierDetail = Pick<
  SupplierTable["Row"],
  | "id" | "name" | "category" | "subcategory" | "description"
  | "address" | "address_line" | "city" | "province" | "region"
  | "country" | "country_code" | "postal_code" | "phone" | "email"
  | "website" | "facebook_url" | "instagram_url" | "tiktok_url"
  | "service_area" | "regions_served" | "travel_available"
  | "starting_price" | "price_range_min" | "price_range_max" | "currency"
  | "google_rating" | "google_rating_count" | "verified"
  | "verification_status" | "is_featured"
>;

export type SavedSupplierDetail = Pick<
  SavedSupplierTable["Row"],
  | "id" | "event_id" | "supplier_id" | "status" | "favorite"
  | "personal_notes" | "contact_notes" | "quote_amount" | "agreed_amount"
  | "deposit_amount" | "balance_amount" | "currency" | "deposit_paid"
  | "contract_signed" | "created_at" | "updated_at"
>;

export const SUPPLIER_DETAIL_COLUMNS = [
  "id", "name", "category", "subcategory", "description", "address",
  "address_line", "city", "province", "region", "country", "country_code",
  "postal_code", "phone", "email", "website", "facebook_url", "instagram_url",
  "tiktok_url", "service_area", "regions_served", "travel_available",
  "starting_price", "price_range_min", "price_range_max", "currency",
  "google_rating", "google_rating_count", "verified", "verification_status",
  "is_featured",
] as const satisfies readonly (keyof SupplierDetail)[];

export const SUPPLIER_DETAIL_PROJECTION = "id,name,category,subcategory,description,address,address_line,city,province,region,country,country_code,postal_code,phone,email,website,facebook_url,instagram_url,tiktok_url,service_area,regions_served,travel_available,starting_price,price_range_min,price_range_max,currency,google_rating,google_rating_count,verified,verification_status,is_featured";

export const SAVED_SUPPLIER_COLUMNS = [
  "id", "event_id", "supplier_id", "status", "favorite", "personal_notes",
  "contact_notes", "quote_amount", "agreed_amount", "deposit_amount",
  "balance_amount", "currency", "deposit_paid", "contract_signed",
  "created_at", "updated_at",
] as const satisfies readonly (keyof SavedSupplierDetail)[];

export const SAVED_SUPPLIER_PROJECTION = "id,event_id,supplier_id,status,favorite,personal_notes,contact_notes,quote_amount,agreed_amount,deposit_amount,balance_amount,currency,deposit_paid,contract_signed,created_at,updated_at";
export const SAVED_SUPPLIER_WITH_NAME_PROJECTION = "id,event_id,supplier_id,status,favorite,personal_notes,contact_notes,quote_amount,agreed_amount,deposit_amount,balance_amount,currency,deposit_paid,contract_signed,created_at,updated_at,supplier:suppliers(id,name)";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SUPPLIER_STATUSES = [
  "DISCOVERED", "SAVED", "CONTACTED", "QUOTE_REQUESTED", "QUOTE_RECEIVED",
  "SHORTLISTED", "SELECTED", "REJECTED",
] as const;

const STATUS_SET = new Set<string>(SUPPLIER_STATUSES);
const MUTABLE_KEYS = new Set([
  "resource_id", "status", "favorite", "personal_notes", "contact_notes",
  "quote_amount", "agreed_amount", "deposit_amount", "balance_amount",
  "currency", "deposit_paid", "contract_signed",
]);
const MONEY_KEYS = ["quote_amount", "agreed_amount", "deposit_amount", "balance_amount"] as const;
const BOOLEAN_KEYS = ["favorite", "deposit_paid", "contract_signed"] as const;
const NOTE_KEYS = ["personal_notes", "contact_notes"] as const;
const MAX_MONEY = 999_999_999.99;
const MAX_NOTE_LENGTH = 4_000;

export type SavedSupplierMutation = Pick<
  SavedSupplierTable["Update"],
  | "status" | "favorite" | "personal_notes" | "contact_notes"
  | "quote_amount" | "agreed_amount" | "deposit_amount" | "balance_amount"
  | "currency" | "deposit_paid" | "contract_signed"
>;

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCreateSupplierPayload(value: unknown): ValidationResult<{ supplier_id: string }> {
  if (!isObject(value) || Object.keys(value).some((key) => key !== "supplier_id") || !isUuid(value.supplier_id)) {
    return { ok: false, error: "INVALID_SUPPLIER_PAYLOAD" };
  }
  return { ok: true, value: { supplier_id: value.supplier_id } };
}

export function parseSavedSupplierMutation(
  value: unknown,
): ValidationResult<{ resourceId: string; update: SavedSupplierMutation }> {
  if (!isObject(value) || Object.keys(value).some((key) => !MUTABLE_KEYS.has(key)) || !isUuid(value.resource_id)) {
    return { ok: false, error: "INVALID_SAVED_SUPPLIER_PAYLOAD" };
  }

  const update: SavedSupplierMutation = {};
  if (value.status !== undefined) {
    if (typeof value.status !== "string" || !STATUS_SET.has(value.status)) {
      return { ok: false, error: "INVALID_SUPPLIER_STATUS" };
    }
    update.status = value.status;
  }

  for (const key of BOOLEAN_KEYS) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "boolean") return { ok: false, error: "INVALID_SAVED_SUPPLIER_PAYLOAD" };
    update[key] = value[key];
  }

  for (const key of NOTE_KEYS) {
    if (value[key] === undefined) continue;
    if (value[key] !== null && (typeof value[key] !== "string" || value[key].length > MAX_NOTE_LENGTH)) {
      return { ok: false, error: "INVALID_SAVED_SUPPLIER_PAYLOAD" };
    }
    update[key] = typeof value[key] === "string" ? value[key].trim() || null : null;
  }

  for (const key of MONEY_KEYS) {
    if (value[key] === undefined) continue;
    if (value[key] !== null && (
      typeof value[key] !== "number" || !Number.isFinite(value[key]) || value[key] < 0 || value[key] > MAX_MONEY
    )) {
      return { ok: false, error: "INVALID_SAVED_SUPPLIER_PAYLOAD" };
    }
    update[key] = value[key] as number | null;
  }

  if (value.currency !== undefined) {
    if (value.currency !== null && (typeof value.currency !== "string" || !/^[A-Za-z]{3}$/.test(value.currency))) {
      return { ok: false, error: "INVALID_SUPPLIER_CURRENCY" };
    }
    update.currency = typeof value.currency === "string" ? value.currency.toUpperCase() : null;
  }

  if (Object.keys(update).length === 0) return { ok: false, error: "EMPTY_SAVED_SUPPLIER_UPDATE" };
  return { ok: true, value: { resourceId: value.resource_id, update } };
}
