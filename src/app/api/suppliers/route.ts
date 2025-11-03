import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { getFallbackSuppliers } from "@/data/fallbackContent";

export const runtime = "nodejs";

// GET /api/suppliers?country=it&category=Location
export async function GET(req: NextRequest) {
  const db = getServiceClient();
  const country = (req.nextUrl.searchParams.get("country") || "it").toLowerCase();
  const category = req.nextUrl.searchParams.get("category");

  let query = db.from("suppliers").select("*").eq("country", country);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    console.error("Suppliers GET error:", error);
    const fallback = getFallbackSuppliers(country, category ?? undefined);
    if (fallback.length > 0) {
      return NextResponse.json({ suppliers: fallback });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    const fallback = getFallbackSuppliers(country, category ?? undefined);
    if (fallback.length > 0) {
      return NextResponse.json({ suppliers: fallback });
    }
  }

  return NextResponse.json({ suppliers: data ?? [] });
}
