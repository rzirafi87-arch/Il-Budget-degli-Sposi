import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Trova supplier_id dell'utente
    const { data: supplier } = await db
      .from("suppliers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!supplier) {
      return NextResponse.json({ transactions: [] });
    }

    // Carica transazioni
    const { data: transactions, error } = await db
      .from("subscription_transactions")
      .select("*")
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUBSCRIPTION_TRANSACTIONS GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transactions: transactions || [] });
  } catch (e: any) {
    console.error("SUBSCRIPTION_TRANSACTIONS GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
