import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

// GET: Restituisce tutte le tradizioni per una country
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "mx";
  const db = getServiceClient();
  const { data, error } = await db.from("traditions").select("*").eq("country_code", country);
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
