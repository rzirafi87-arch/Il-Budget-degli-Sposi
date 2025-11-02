export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// GET /api/my/wedding/budget-focus?country=IT&event=matrimonio
// Returns only the budget_focus_pct block from app.v_country_event_wedding
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const country = (url.searchParams.get("country") || "IT").toUpperCase();
    const event = url.searchParams.get("event") || "matrimonio";

    const db = getServiceClient();
    // supabase-js targets public schema by default; switch to app schema explicitly
    const { data, error } = await db
      .schema("app")
      .from("v_country_event_wedding")
      .select("iso2,event_slug,budget_focus_pct")
      .eq("iso2", country)
      .eq("event_slug", event)
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    const row = data?.[0];
    if (!row) {
      return NextResponse.json({ ok: false, error: "Nessun dato disponibile" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, country, event, budget: row.budget_focus_pct });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
