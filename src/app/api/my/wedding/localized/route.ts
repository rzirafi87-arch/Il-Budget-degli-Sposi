export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// GET /api/my/wedding/localized?country=IT&event=matrimonio
// Returns the localized presets for a wedding in a given country from app.v_country_event_wedding
// Demo-friendly: no auth required for GET. Auth is only required for mutations elsewhere.
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const country = (url.searchParams.get("country") || "IT").toUpperCase();
    const event = url.searchParams.get("event") || "matrimonio";

    const db = getServiceClient();
    const { data, error } = await db
      .schema("app")
      .from("v_country_event_wedding")
      .select("*")
      .eq("iso2", country)
      .eq("event_slug", event)
      .limit(1);

    if (error) {
      console.error("localized GET – DB error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const row = data?.[0];
    if (!row) {
      return NextResponse.json({ ok: false, error: "Nessun dato disponibile per il paese/evento richiesto" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, country, event, data: row });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
