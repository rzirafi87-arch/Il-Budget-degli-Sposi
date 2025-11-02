import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET: Restituisce tutte le tradizioni per una country
// Preferisce i dati normalizzati da app.v_country_event_wedding (rituals),
// con fallback alla vecchia tabella public.traditions se vuota.
export async function GET(req: NextRequest) {
  const country = (req.nextUrl.searchParams.get("country") || "IT").toUpperCase();
  const event = req.nextUrl.searchParams.get("event") || "matrimonio";
  const db = getServiceClient();

  // Try new normalized view first
  const { data: vrows, error: vErr } = await db
    .schema("app")
    .from("v_country_event_wedding")
    .select("iso2, event_slug, rituals, description")
    .eq("iso2", country)
    .eq("event_slug", event)
    .limit(1);

  if (vErr) {
    console.warn("/api/traditions – view error, will fallback:", vErr.message);
  }

  const rituals = (vrows?.[0]?.rituals as string[] | undefined) || [];
  if (rituals.length > 0) {
    // Map rituals to expected shape { name, description }
    const traditions = rituals.map((name) => ({ name, description: "" }));
    return NextResponse.json({ traditions });
  }

  // Fallback to legacy table
  const countryLower = country.toLowerCase();
  const { data, error } = await db.from("traditions").select("*").eq("country_code", countryLower);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ traditions: data });
}

// POST: Aggiunge una nuova tradizione
export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getServiceClient();
  const { data, error } = await db.from("traditions").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tradition: data[0] });
}
