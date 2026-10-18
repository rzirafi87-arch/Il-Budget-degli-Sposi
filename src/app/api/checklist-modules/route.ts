import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { readOnlyEndpoint } from "@/lib/communitySubmission";

export const runtime = "nodejs";

// GET: Restituisce tutti i checklist_modules per una country e/o tradition
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "mx";
  const traditionId = req.nextUrl.searchParams.get("tradition_id");
  const db = getServiceClient();
  let query = db.from("checklist_modules").select("*").eq("country_code", country);
  if (traditionId) query = query.eq("tradition_id", traditionId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ modules: data });
}

// POST: reference data is read-only through the API (B57).
export async function POST() {
  return readOnlyEndpoint();
}
