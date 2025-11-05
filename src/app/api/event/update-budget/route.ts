import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const total = Number(body?.total_budget);
    const bride = body?.bride_initial_budget !== undefined ? Number(body?.bride_initial_budget) : null;
    const groom = body?.groom_initial_budget !== undefined ? Number(body?.groom_initial_budget) : null;
    const eventDate = typeof body?.event_date === "string" && body.event_date.length > 0 ? body.event_date : null;
    if (!isFinite(total) || total < 0) {
      return NextResponse.json({ error: "total_budget non valido" }, { status: 400 });
    }
    if ((bride !== null && (!isFinite(bride) || bride < 0)) || (groom !== null && (!isFinite(groom) || groom < 0))) {
      return NextResponse.json({ error: "budget sposa/sposo non valido" }, { status: 400 });
    }

    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // Update latest/first event owned by user
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();
    if (e1 || !ev?.id) {
      return NextResponse.json({ error: e1?.message || "Event not found" }, { status: 404 });
    }

    const updateObj: Record<string, unknown> = { total_budget: total };
    if (bride !== null) updateObj.bride_initial_budget = bride;
    if (groom !== null) updateObj.groom_initial_budget = groom;
    if (eventDate !== null) updateObj.event_date = eventDate;

    const { error: e2 } = await db
      .from("events")
      .update(updateObj)
      .eq("id", ev.id);
    if (e2) {
      return NextResponse.json({ error: e2.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, ...updateObj });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("UPDATE-BUDGET Uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}

