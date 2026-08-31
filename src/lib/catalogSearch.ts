import { getServiceClient } from "@/lib/supabaseServer";

export type CatalogEntityType = "church" | "location" | "supplier";
export type CatalogVerificationStatus = "VERIFIED" | "PROBABLE" | "TO_CHECK";
export type CatalogSort = "RELEVANCE" | "NAME_ASC" | "VERIFIED_FIRST" | "NEAREST";

export type CatalogSearchRequest = {
  entityType: CatalogEntityType; query?: string; category?: string; city?: string;
  province?: string; region?: string; country?: string;
  verificationStatus?: CatalogVerificationStatus; latitude?: number; longitude?: number;
  radiusKm?: number; sort: CatalogSort; page: number; pageSize: number;
};

export type CatalogSearchResult = {
  id: string; entityType: CatalogEntityType; name: string; category: string | null;
  city: string | null; province: string | null; region: string | null; country: string | null;
  latitude: number | null; longitude: number | null; distanceKm: number | null;
  verificationStatus: CatalogVerificationStatus; confidenceScore: number; relevanceScore: number;
  details?: Record<string, unknown>;
};

const ENTITY_TYPES = new Set<CatalogEntityType>(["church", "location", "supplier"]);
const VERIFICATION = new Set<CatalogVerificationStatus>(["VERIFIED", "PROBABLE", "TO_CHECK"]);
const SORTS = new Set<CatalogSort>(["RELEVANCE", "NAME_ASC", "VERIFIED_FIRST", "NEAREST"]);

function text(value: string | null, max = 100) {
  const clean = value?.trim().slice(0, max) || undefined;
  if (!clean) return undefined;
  if (!/^[\p{L}\p{N} .,'’()/_-]+$/u.test(clean)) throw new Error("INVALID_FILTER");
  return clean;
}
function integer(value: string | null, fallback: number, max: number) {
  const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}
function coordinate(value: string | null, min: number, max: number) {
  if (value === null || value === "") return undefined;
  const parsed = Number(value); if (!Number.isFinite(parsed) || parsed < min || parsed > max) throw new Error("INVALID_COORDINATES");
  return parsed;
}

export function parseCatalogSearch(searchParams: URLSearchParams, forcedEntity?: CatalogEntityType): CatalogSearchRequest {
  const entity = forcedEntity || searchParams.get("entityType") || "";
  if (!ENTITY_TYPES.has(entity as CatalogEntityType)) throw new Error("INVALID_ENTITY_TYPE");
  const rawCountry = searchParams.get("country")?.trim().toLowerCase();
  if (rawCountry && !/^[a-z]{2}$/.test(rawCountry)) throw new Error("INVALID_COUNTRY");
  const country = rawCountry || undefined;
  const verification = searchParams.get("verification")?.trim().toUpperCase();
  if (verification && !VERIFICATION.has(verification as CatalogVerificationStatus)) throw new Error("INVALID_VERIFICATION");
  const latitude = coordinate(searchParams.get("latitude") ?? searchParams.get("lat"), -90, 90);
  const longitude = coordinate(searchParams.get("longitude") ?? searchParams.get("lng"), -180, 180);
  if ((latitude === undefined) !== (longitude === undefined)) throw new Error("INVALID_COORDINATES");
  const rawRadius = searchParams.get("radiusKm") ?? searchParams.get("radius");
  const radiusKm = rawRadius === null ? undefined : Number(rawRadius);
  if (radiusKm !== undefined && (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 300)) throw new Error("INVALID_RADIUS");
  if (radiusKm !== undefined && latitude === undefined) throw new Error("RADIUS_REQUIRES_POSITION");
  const requestedSort = (searchParams.get("sort") || "RELEVANCE").toUpperCase();
  if (!SORTS.has(requestedSort as CatalogSort)) throw new Error("INVALID_SORT");
  if (requestedSort === "NEAREST" && latitude === undefined) throw new Error("NEAREST_REQUIRES_POSITION");
  return {
    entityType: entity as CatalogEntityType, query: text(searchParams.get("q")),
    category: text(searchParams.get("category") ?? searchParams.get("type"), 80)?.toLowerCase(),
    city: text(searchParams.get("city")), province: text(searchParams.get("province")),
    region: text(searchParams.get("region")), country,
    verificationStatus: verification as CatalogVerificationStatus | undefined,
    latitude, longitude, radiusKm, sort: requestedSort as CatalogSort,
    page: integer(searchParams.get("page"), 1, 10_000),
    pageSize: integer(searchParams.get("pageSize") ?? searchParams.get("limit"), 12, 24),
  };
}

export async function searchCatalog(request: CatalogSearchRequest) {
  const { data, error } = await getServiceClient().rpc("search_global_catalog", {
    p_entity_type: request.entityType, p_query: request.query ?? null,
    p_category: request.category ?? null, p_city: request.city ?? null,
    p_province: request.province ?? null, p_region: request.region ?? null,
    p_country: request.country ?? null, p_verification_status: request.verificationStatus ?? null,
    p_latitude: request.latitude ?? null, p_longitude: request.longitude ?? null,
    p_radius_km: request.radiusKm ?? null, p_sort: request.sort,
    p_offset: (request.page - 1) * request.pageSize, p_limit: request.pageSize,
  });
  if (error) throw error;
  const rows = (data || []) as Array<Record<string, unknown>>;
  const total = Number(rows[0]?.total_count || 0);
  const results: CatalogSearchResult[] = rows.map((row) => ({
    id: String(row.id), entityType: row.entity_type as CatalogEntityType, name: String(row.name),
    category: row.category as string | null, city: row.city as string | null,
    province: row.province as string | null, region: row.region as string | null,
    country: row.country as string | null, latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    distanceKm: row.distance_km === null ? null : Number(row.distance_km),
    verificationStatus: row.verification_status as CatalogVerificationStatus,
    confidenceScore: Number(row.confidence_score || 0), relevanceScore: Number(row.relevance_score || 0),
    details: row.details && typeof row.details === "object" ? row.details as Record<string, unknown> : undefined,
  }));
  return { results, pagination: { page: request.page, pageSize: request.pageSize, total, totalPages: Math.max(1, Math.ceil(total / request.pageSize)) } };
}
