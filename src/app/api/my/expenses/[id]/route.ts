import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser(req);
    const body = await req.json();
    const { status } = body as { status: "approved" | "rejected" };
    const db = getServiceClient();
    const { id: expenseId } = await context.params;
    const eventId = (await requireServerCurrentEvent(userId)).eventId;

    const { data: ownedExpense, error: lookupError } = await db
      .from("expenses")
      .select("id,committed_amount")
      .eq("id", expenseId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (lookupError) {
      logger.error("EXPENSE PATCH lookup error", { error: lookupError });
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }
    if (!ownedExpense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: { status: string; paid_amount?: number } = { status };
    if (status === "approved") {
      updateData.paid_amount = ownedExpense.committed_amount || 0;
    }

    const { error } = await db
      .from("expenses")
      .update(updateData)
      .eq("id", expenseId)
      .eq("event_id", eventId);

    if (error) {
      logger.error("EXPENSE PATCH error", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("EXPENSE PATCH uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}
