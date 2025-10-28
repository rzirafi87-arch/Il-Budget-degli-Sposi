import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// GET: Restituisce tutti i budget_items per una country e/o tradition
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "mx";
  const traditionId = req.nextUrl.searchParams.get("tradition_id");
  const eventId = req.nextUrl.searchParams.get("event_id");
  const db = getServiceClient();
  let query = db.from("budget_items").select("*").eq("country_code", country);
  if (traditionId) query = query.eq("tradition_id", traditionId);
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

// POST: Aggiunge un nuovo budget_item
export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getServiceClient();
  const { data, error } = await db.from("budget_items").insert([body]).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data[0] });
}
