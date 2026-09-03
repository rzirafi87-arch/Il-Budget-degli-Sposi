import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
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
    const eventId = (await requireServerCurrentEvent(userId)).eventId;

    const { data: income, error: incomeError } = await db
      .from("incomes")
      .select("id")
      .eq("id", id)
      .eq("event_id", eventId)
      .maybeSingle();

    if (incomeError) {
      logger.error("INCOMES DELETE lookup error", { error: incomeError });
      return NextResponse.json({ error: incomeError.message }, { status: 500 });
    }
    if (!income) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { error: deleteError } = await db
      .from("incomes")
      .delete()
      .eq("id", id)
      .eq("event_id", eventId);

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
