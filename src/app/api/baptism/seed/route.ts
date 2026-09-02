import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { createBaptismSeed } from "@/data/templates/baptism";
import { requireCurrentEvent } from "@/lib/currentEvent";

// POST: Seeds baptism categories/subcategories for the authoritative current event
export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { data: authData, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !authData?.user) return NextResponse.json({ error: "Token non valido" }, { status: 401 });

    const ev = { id: (await requireCurrentEvent(req, authData.user.id)).eventId };

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
