import { requireFinancialAccess, financialErrorResponse } from "@/lib/financialAuthorization";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { currentEvent } = await requireFinancialAccess(req, "read");
    if (currentEvent.eventType !== "eighteenth") {
      return NextResponse.json({ error: "EVENT_TYPE_MISMATCH" }, { status: 409 });
    }
    const db = getServiceClient();
    const { data: event, error } = await db.from("events")
      .select("name,event_date,total_budget,currency").eq("id", currentEvent.eventId).single();
    if (error || !event) return NextResponse.json({ error: "EVENT_READ_FAILED" }, { status: 500 });
    return NextResponse.json({ event });
  } catch (error) {
    return financialErrorResponse(error);
  }
}
