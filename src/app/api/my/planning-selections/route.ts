import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const { data: event } = await db.from("events").select("id,event_type").eq("owner_id", userId).order("inserted_at", { ascending: true }).limit(1).maybeSingle();
    if (!event) return NextResponse.json({ church: null, locations: [] });
    const [{ data: savedChurch }, { data: savedLocations }] = await Promise.all([
      db.from("saved_churches").select("church_id,churches(name)").eq("event_id", event.id).eq("selected", true).maybeSingle(),
      db.from("saved_locations").select("location_id,location_role,locations(name)").eq("event_id", event.id).eq("selected", true).order("location_role"),
    ]);
    return NextResponse.json({ church: savedChurch || null, locations: savedLocations || [], eventType: event.event_type });
  } catch { return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); }
}
