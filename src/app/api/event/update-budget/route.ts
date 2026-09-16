import { getServiceClient } from "@/lib/supabaseServer";
import { apiSecurityErrorResponse, requireEventAccess } from "@/lib/apiSecurity";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
    const body = await req.json().catch(() => ({}));
    const total = Number(body?.total_budget);
    const bride = body?.bride_initial_budget !== undefined ? Number(body?.bride_initial_budget) : null;
    const groom = body?.groom_initial_budget !== undefined ? Number(body?.groom_initial_budget) : null;
    const eventDate = typeof body?.event_date === "string" && body.event_date.length > 0 ? body.event_date : null;
    if (!isFinite(total) || total < 0) {
      return NextResponse.json({ error: "total_budget non valido" }, { status: 400 });
    }
    if ((bride !== null && (!isFinite(bride) || bride < 0)) || (groom !== null && (!isFinite(groom) || groom < 0))) {
      return NextResponse.json({ error: "INVALID_PARTNER_BUDGET" }, { status: 400 });
    }

    const db = getServiceClient();

    const updateObj: Record<string, unknown> = { total_budget: total };
    if (bride !== null) updateObj.bride_initial_budget = bride;
    if (groom !== null) updateObj.groom_initial_budget = groom;
    if (eventDate !== null) updateObj.event_date = eventDate;

    const { error: e2 } = await db
      .from("events")
      .update(updateObj)
      .eq("id", currentEvent.eventId);
    if (e2) {
      return NextResponse.json({ error: "EVENT_BUDGET_UPDATE_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...updateObj });
  } catch (error: unknown) {
    return apiSecurityErrorResponse(error, "EVENT_BUDGET_UPDATE_FAILED");
  }
}
