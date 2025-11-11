export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// GET /api/my/expenses/history?expenseId=xxx
export async function GET(req: NextRequest) {
  const expenseId = req.nextUrl.searchParams.get("expenseId");
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!expenseId) {
    return NextResponse.json({ error: "expenseId richiesto" }, { status: 400 });
  }

  if (!jwt) {
    // Demo: dati finti
    return NextResponse.json({
      history: [
        {
          id: "demo-1",
          action: "create",
          old_data: null,
          new_data: { amount: 100, status: "pending" },
          created_at: new Date().toISOString(),
          user_id: null,
        },
      ],
    });
  }

  const db = getServiceClient();
  const { data: userData, error: userError } = await db.auth.getUser(jwt);
  if (userError) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Query storico modifiche per expenseId
  const { data, error } = await db
    .from("expense_history")
    .select("id, action, old_data, new_data, created_at, user_id")
    .eq("expense_id", expenseId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data });
}
