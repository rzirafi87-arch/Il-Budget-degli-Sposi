import { parseCatalogSearch, searchCatalog } from "@/lib/catalogSearch";
import { NextRequest, NextResponse } from "next/server";
import { checkPublicRateLimit, PUBLIC_CATALOG_CACHE, rateLimitResponse } from "@/lib/publicApiGuard";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const limit = checkPublicRateLimit(request, "churches");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  try {
    const parsed = parseCatalogSearch(new URL(request.url).searchParams, "church");
    const response = await searchCatalog(parsed);
    return NextResponse.json({ churches: response.results.map((item) => ({ ...item.details, id: item.id, name: item.name, city: item.city, province: item.province, region: item.region, country_code: item.country, latitude: item.latitude, longitude: item.longitude, place_type: item.category, verification_status: item.verificationStatus, confidence_score: item.confidenceScore, distance_km: item.distanceKm })), pagination: { ...response.pagination, limit: response.pagination.pageSize } }, { headers: { "Cache-Control": PUBLIC_CATALOG_CACHE } });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("INVALID_") || error.message.endsWith("_REQUIRES_POSITION"))) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to load church catalog" }, { status: 500 });
  }
}
export async function POST() { return NextResponse.json({ error: "Direct catalog submissions are disabled; a moderated suggestion workflow is planned." }, { status: 405, headers: { Allow: "GET" } }); }
