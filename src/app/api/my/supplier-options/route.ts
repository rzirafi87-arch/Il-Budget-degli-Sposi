import {
  planningSelectionErrorResponse,
  requirePlanningSelectionAccess,
} from "@/lib/planningSelectionAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { loadSupplierOptions } from "@/lib/supplierWorkData";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { currentEvent } = await requirePlanningSelectionAccess(request, "read");
    const suppliers = await loadSupplierOptions(getServiceClient(), currentEvent.eventId);
    return NextResponse.json({ suppliers, eventId: currentEvent.eventId });
  } catch (error) {
    if (error instanceof Error && error.message === "SUPPLIER_OPTIONS_READ_FAILED") {
      return NextResponse.json({ error: "SUPPLIER_OPTIONS_READ_FAILED" }, { status: 500 });
    }
    return planningSelectionErrorResponse(error);
  }
}
