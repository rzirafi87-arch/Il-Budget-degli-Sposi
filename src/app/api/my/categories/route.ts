import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    
    if (!jwt) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getServiceClient();
    
    // verifica il token e ottieni l'utente
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.user.id;

    // prendi il primo evento dell'utente (quello di default)
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1) {
      console.error("MY/CATEGORIES – Query event error:", e1);
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
      console.error("MY/CATEGORIES – Query categories error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ eventId: ev.id, categories: data || [] });
  } catch (e: any) {
    console.error("MY/CATEGORIES – Uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
