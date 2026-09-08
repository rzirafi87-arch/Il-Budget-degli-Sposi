export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const country = (url.searchParams.get("country") || "IT").toUpperCase();
    const event = url.searchParams.get("event") || "matrimonio";
    const db = getServiceClient();
    const { data, error } = await db.rpc("get_wedding_budget_focus", {
      p_country: country,
      p_event: event,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ ok: false, error: "Nessun dato disponibile" }, { status: 404 });
    return NextResponse.json({ ok: true, country, event, budget: data });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unexpected" }, { status: 500 });
  }
}
