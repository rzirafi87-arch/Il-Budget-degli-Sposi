import { LOCATION_DETAIL_PROJECTION } from "@/lib/locationContracts";
import { UUID_PATTERN } from "@/lib/catalogSnapshotContracts";
import { checkPublicRateLimit, PUBLIC_CATALOG_CACHE, rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const limit = checkPublicRateLimit(request, "location-detail");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "INVALID_LOCATION_ID" }, { status: 400 });
  const { data, error } = await getServiceClient().from("locations")
    .select(LOCATION_DETAIL_PROJECTION).eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: "LOCATION_DETAIL_READ_FAILED" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "LOCATION_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ location: data }, { headers: { "Cache-Control": PUBLIC_CATALOG_CACHE } });
}

function writesDisabled() {
  return NextResponse.json(
    { error: "DIRECT_CATALOG_WRITES_DISABLED" },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export const POST = writesDisabled;
export const PUT = writesDisabled;
export const PATCH = writesDisabled;
export const DELETE = writesDisabled;
