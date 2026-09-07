export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getBearer, requireUser } from "@/lib/apiAuth";
import { currentEventErrorResponse, requireCurrentEvent } from "@/lib/currentEvent";

// Compatibility endpoint for optional localized wedding presets.
// The historical app.v_country_event_wedding view is not part of the canonical
// rebuilt schema. Return an explicit unavailable contract instead of querying a
// nonexistent/unexposed schema and leaking a database error to the client.
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    let country = (url.searchParams.get("country") || "IT").toUpperCase();
    let event = url.searchParams.get("event") || "matrimonio";

    if (getBearer(req)) {
      const { userId } = await requireUser(req);
      const current = await requireCurrentEvent(req, userId);
      country = (current.country || country).toUpperCase();
      event = current.eventType === "wedding" ? "matrimonio" : current.eventType;
      if (current.capability.availabilityStatus !== "READY") {
        return NextResponse.json({ ok: false, error: "EVENT_COMING_SOON", event }, { status: 409 });
      }
    }

    return NextResponse.json(
      { ok: false, error: "LOCALIZED_PRESET_UNAVAILABLE", country, event },
      { status: 404 },
    );
  } catch (error: unknown) {
    const contextError = currentEventErrorResponse(error);
    if (contextError) {
      return NextResponse.json({ ok: false, error: contextError.error }, { status: contextError.status });
    }
    return NextResponse.json({ ok: false, error: "LOCALIZED_PRESET_FAILED" }, { status: 500 });
  }
}
