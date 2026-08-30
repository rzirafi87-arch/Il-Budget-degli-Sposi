import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const safe = (v: string | null, max = 100) => { const c = v?.trim().slice(0, max) || null; return c && /^[\p{L}\p{N} .,'’()/-]+$/u.test(c) ? c : null; };
const integer = (v: string | null, fallback: number, max: number) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback; };
const search = (v: string | null) => (v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);

export async function GET(req: NextRequest) {
  try {
    const p = new URL(req.url).searchParams; const page = integer(p.get("page"), 1, 10_000); const limit = integer(p.get("limit"), 12, 24);
    const q = search(p.get("q")); const country = p.get("country")?.trim().toLowerCase() || null;
    const category = safe(p.get("category"), 80)?.toLowerCase() || null; const region = safe(p.get("region")); const province = safe(p.get("province")); const city = safe(p.get("city"));
    const verification = p.get("verification")?.trim().toUpperCase() || null;
    if (country && !/^[a-z]{2}$/.test(country)) return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    if (verification && !["VERIFIED", "PROBABLE", "TO_CHECK"].includes(verification)) return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });
    let query = getServiceClient().from("suppliers").select("id,name,category,subcategory,address_line,postal_code,city,province,region,country_code,phone,email,website,instagram_url,facebook_url,service_area,regions_served,travel_available,starting_price,price_range_min,price_range_max,currency,verification_status,last_verified_at", { count: "exact" }).order("confidence_score", { ascending: false }).order("name");
    if (country) query = query.eq("country_code", country); if (category) query = query.eq("category", category); if (region) query = query.eq("region", region); if (province) query = query.eq("province", province); if (city) query = query.eq("city", city); if (verification) query = query.eq("verification_status", verification);
    if (q) query = query.or(`normalized_name.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%,region.ilike.%${q}%`);
    const offset = (page - 1) * limit; const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) return NextResponse.json({ error: "Unable to load supplier catalog" }, { status: 500 });
    const total = count || 0; return NextResponse.json({ suppliers: data || [], pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch { return NextResponse.json({ error: "Unexpected catalog error" }, { status: 500 }); }
}
export async function POST() { return NextResponse.json({ error: "Direct catalog writes are disabled" }, { status: 405, headers: { Allow: "GET" } }); }
