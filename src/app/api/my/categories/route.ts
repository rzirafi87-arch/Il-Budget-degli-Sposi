import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient();
    const { userId } = await requireUser(req);

    const ev = { id: (await requireServerCurrentEvent(userId)).eventId };

    const { data, error } = await db
      .from("categories")
      .select("id,name")
      .eq("event_id", ev.id)
      .order("name");

    if (error) {
      logger.error("MY/CATEGORIES Query categories error", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ eventId: ev.id, categories: data || [] });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("MY/CATEGORIES Uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}
