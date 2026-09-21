import {
  GLOBAL_ASSOCIATION_PROJECTION,
  parseGlobalAssociationFilter,
  type GlobalLocationSupplierAssociation,
} from "@/lib/locationSupplierAssociationContracts";
import { checkPublicRateLimit, PUBLIC_CATALOG_CACHE, rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = checkPublicRateLimit(request, "location-supplier-associations");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const parsed = parseGlobalAssociationFilter(request.nextUrl.searchParams);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  let query = getServiceClient().from("supplier_locations")
    .select(GLOBAL_ASSOCIATION_PROJECTION)
    .order("created_at", { ascending: true })
    .order("supplier_id", { ascending: true })
    .order("location_id", { ascending: true });
  if (parsed.value.locationId) query = query.eq("location_id", parsed.value.locationId);
  if (parsed.value.supplierId) query = query.eq("supplier_id", parsed.value.supplierId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "GLOBAL_ASSOCIATIONS_READ_FAILED" }, { status: 500 });
  return NextResponse.json(
    { associations: (data ?? []) as unknown as GlobalLocationSupplierAssociation[] },
    { headers: { "Cache-Control": PUBLIC_CATALOG_CACHE } },
  );
}

function writesDisabled() {
  return NextResponse.json(
    { error: "GLOBAL_ASSOCIATIONS_READ_ONLY" },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export const POST = writesDisabled;
export const PATCH = writesDisabled;
export const DELETE = writesDisabled;
