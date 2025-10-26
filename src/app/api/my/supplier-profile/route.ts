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

    // Cerca profilo fornitore dell'utente
    const { data: profile, error } = await db
      .from("suppliers")
      .select("id, name, category, subscription_tier, subscription_expires_at, is_featured, verified")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("SUPPLIER_PROFILE GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: profile || null });
  } catch (e: any) {
    console.error("SUPPLIER_PROFILE GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
