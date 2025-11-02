import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { createBaptismSeed } from "@/data/templates/baptism";

// POST: Seeds baptism categories/subcategories for the user's first event
export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { data: authData, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !authData?.user) return NextResponse.json({ error: "Token non valido" }, { status: 401 });

    // Resolve current user's first event (oldest)
    const { data: ev, error: evErr } = await db
      .from("events")
      .select("id")
      .eq("owner_id", authData.user.id)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();
    if (evErr || !ev?.id) return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });

    const url = new URL(req.url);
    const country = url.searchParams.get('country') || undefined;
    await createBaptismSeed(db, ev.id, country);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("/api/baptism/seed error", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
