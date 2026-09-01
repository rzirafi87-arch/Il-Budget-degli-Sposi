import { parseCatalogSearch, searchCatalog } from "@/lib/catalogSearch";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const parsed = parseCatalogSearch(new URL(request.url).searchParams);
    const response = await searchCatalog(parsed);
    return NextResponse.json({ ...response, results: response.results.map((item) => ({ id: item.id, entityType: item.entityType, name: item.name, category: item.category, city: item.city, province: item.province, region: item.region, country: item.country, latitude: item.latitude, longitude: item.longitude, distanceKm: item.distanceKm, verificationStatus: item.verificationStatus, confidenceScore: item.confidenceScore, relevanceScore: item.relevanceScore })) }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("INVALID_") || error.message.endsWith("_REQUIRES_POSITION"))) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "INVALID_REQUEST" }, { status: 400 });
    }
    console.error("CATALOG SEARCH error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to search catalog" }, { status: 500 });
  }
}
