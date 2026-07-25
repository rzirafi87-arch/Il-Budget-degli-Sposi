import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Evita cache indesiderata su route mutate

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

    const { data: expense, error: expenseError } = await db
      .from("expenses")
      .select("event_id")
      .eq("id", expenseId)
      .maybeSingle();

    if (expenseError) {
      logger.error("EXPENSE PATCH lookup error", { error: expenseError });
      return NextResponse.json({ error: expenseError.message }, { status: 500 });
    }
    if (!expense?.event_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: ownedEvent, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("id", expense.event_id)
      .eq("owner_id", userId)
      .maybeSingle();

    if (eventError) {
      logger.error("EXPENSE PATCH ownership error", { error: eventError });
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }
    if (!ownedEvent) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: { status: string; paid_amount?: number } = { status };
    if (status === "approved") {
      const { data: ownedExpense, error: ownedExpenseError } = await db
        .from("expenses")
        .select("committed_amount")
        .eq("id", expenseId)
        .eq("event_id", ownedEvent.id)
        .maybeSingle();

      if (ownedExpenseError) {
        logger.error("EXPENSE PATCH amount lookup error", { error: ownedExpenseError });
        return NextResponse.json({ error: ownedExpenseError.message }, { status: 500 });
      }
      if (!ownedExpense) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      updateData.paid_amount = ownedExpense.committed_amount;
    }

    const { error } = await db
      .from("expenses")
      .update(updateData)
      .eq("id", expenseId)
      .eq("event_id", ownedEvent.id);

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
