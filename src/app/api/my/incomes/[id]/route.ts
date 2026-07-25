import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();

    const { id } = await params;

    const { data: income, error: incomeError } = await db
      .from("incomes")
      .select("event_id")
      .eq("id", id)
      .maybeSingle();

    if (incomeError) {
      logger.error("INCOMES DELETE lookup error", { error: incomeError });
      return NextResponse.json({ error: incomeError.message }, { status: 500 });
    }
    if (!income?.event_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: ownedEvent, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("id", income.event_id)
      .eq("owner_id", userId)
      .maybeSingle();

    if (eventError) {
      logger.error("INCOMES DELETE ownership error", { error: eventError });
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }
    if (!ownedEvent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error: deleteError } = await db
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("event_id", ownedEvent.id);

    if (deleteError) {
      logger.error("INCOMES DELETE error", { error: deleteError });
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("INCOMES DELETE uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}
