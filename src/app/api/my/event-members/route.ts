import { requireUser } from "@/lib/apiAuth";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req); const current = await requireServerCurrentEvent(userId);
    const { data, error } = await getServiceClient().from("event_members").select("id,user_id,role,status,accepted_at,updated_at").eq("event_id", current.eventId).eq("status", "active");
    if (error) throw error; return NextResponse.json({ members: data || [], accessRole: current.accessRole });
  } catch { return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 }); }
}
