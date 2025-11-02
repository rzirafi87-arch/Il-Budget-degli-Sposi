import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient();
    const { userId } = await requireUser(req);

    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1) {
      logger.error("MY/CATEGORIES Query event error", { error: e1 });
      return NextResponse.json({ error: e1.message }, { status: 500 });
    }

    if (!ev?.id) {
      return NextResponse.json({ error: "No event" }, { status: 404 });
    }

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

