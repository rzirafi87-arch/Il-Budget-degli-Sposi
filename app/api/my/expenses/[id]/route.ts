import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body as { status: "approved" | "rejected" };

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id: expenseId } = await params;

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
      console.error("EXPENSE PATCH error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("EXPENSE PATCH uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
