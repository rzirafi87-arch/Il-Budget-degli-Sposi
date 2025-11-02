import { createBaptismSeed } from "@/data/templates/baptism";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await ctx.params;
    const db = getServiceClient();

    const authHeader = _req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

    const { data: authData, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !authData?.user) return NextResponse.json({ error: "Token non valido" }, { status: 401 });

    // Ensure event exists and belongs to user (owner)
    const { data: ev, error: evErr } = await db
      .from("events")
      .select("id, owner_id")
      .eq("id", eventId)
      .single();

    if (evErr || !ev) return NextResponse.json({ error: evErr?.message || "Evento non trovato" }, { status: 404 });
    if (ev.owner_id !== authData.user.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

    const url = new URL(_req.url);
    const country = url.searchParams.get('country') || undefined;
    await createBaptismSeed(db, eventId, country);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("/api/baptism/seed error", err);
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  // Convenience for testing with a simple GET
  return POST(req, ctx);
}
