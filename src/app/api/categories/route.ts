import { apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Categories of one event, only for its owner or partner (B57: was readable by anyone with the event id).
export async function GET(req: NextRequest) {
  try {
    const eventId = parseUuid(new URL(req.url).searchParams.get("event"), "INVALID_EVENT_ID");
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner", eventId);

    const { data, error } = await getServiceClient()
      .from("categories")
      .select("id,name")
      .eq("event_id", currentEvent.eventId)
      .order("name");

    if (error) {
      console.error("CATEGORIES_READ_FAILED", { code: error.code });
      return NextResponse.json({ error: "CATEGORIES_READ_FAILED" }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (error: unknown) {
    return apiSecurityErrorResponse(error, "CATEGORIES_READ_FAILED");
  }
}
