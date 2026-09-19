import { checkPublicRateLimit, PUBLIC_CATALOG_CACHE, rateLimitResponse } from "@/lib/publicApiGuard";
import { requirePaymentsCapability } from "@/lib/monetizationCapability";
import { getServiceClient } from "@/lib/supabaseServer";
import { isUuid, SUPPLIER_DETAIL_PROJECTION } from "@/lib/supplierContracts";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const limit = checkPublicRateLimit(request, "supplier-detail");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "INVALID_SUPPLIER_ID" }, { status: 400 });

  const { data, error } = await getServiceClient()
    .from("suppliers")
    .select(SUPPLIER_DETAIL_PROJECTION)
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "SUPPLIER_DETAIL_READ_FAILED" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "SUPPLIER_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ supplier: data }, { headers: { "Cache-Control": PUBLIC_CATALOG_CACHE } });
}

function writesDisabled(..._args: unknown[]) {
  void _args;
  const unavailable = requirePaymentsCapability();
  if (unavailable) return unavailable;
  return NextResponse.json(
    { error: "DIRECT_CATALOG_WRITES_DISABLED" },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export const POST = writesDisabled;
export const PUT = writesDisabled;
export const PATCH = writesDisabled;
export const DELETE = writesDisabled;
