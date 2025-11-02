import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser(req);

    const body = await req.json();
    const { status } = body as { status: "approved" | "rejected" };

    const db = getServiceClient();

    const { id } = await params;
    const expenseId = id;

    // Aggiorna lo stato della spesa
    // Se approvata, copia committed_amount in paid_amount
    const updateData: any = { status };
    
    if (status === "approved") {
      // Prendi il committed_amount
      const { data: expense } = await db
        .from("expenses")
        .select("committed_amount")
        .eq("id", expenseId)
        .single();
      
      if (expense) {
        updateData.paid_amount = expense.committed_amount;
      }
    }

    const { error } = await db
      .from("expenses")
      .update(updateData)
      .eq("id", expenseId);

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
