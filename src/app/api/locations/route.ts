import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;

function positiveInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

function normalizedSearch(value: string | null) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

function safeFilter(value: string | null, maxLength = 100) {
  const clean = value?.trim().slice(0, maxLength) || null;
  return clean && /^[\p{L}\p{N} .,'’()/-]+$/u.test(clean) ? clean : null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = positiveInteger(searchParams.get("page"), 1, 10_000);
    const limit = positiveInteger(searchParams.get("limit"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;
    const q = normalizedSearch(searchParams.get("q"));
    const country = searchParams.get("country")?.trim().toLowerCase() || null;
    const region = safeFilter(searchParams.get("region"));
    const province = safeFilter(searchParams.get("province"));
    const city = safeFilter(searchParams.get("city"));
    const venueType = safeFilter(searchParams.get("type"), 50)?.toLowerCase() || null;
    const verification = searchParams.get("verification")?.trim().toUpperCase() || null;
    if (country && !/^[a-z]{2}$/.test(country)) return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    if (verification && !["VERIFIED", "PROBABLE", "TO_CHECK"].includes(verification)) return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });

    let query = getServiceClient().from("locations").select(
      "id,name,venue_type,subtype,address_line,postal_code,city,province,region,country_code,latitude,longitude,phone,email,website,instagram_url,facebook_url,accommodation_available,catering_internal,catering_external_allowed,parking,accessibility,outdoor_space,indoor_space,capacity_min,capacity_max,verification_status,last_verified_at",
      { count: "exact" },
    ).order("confidence_score", { ascending: false }).order("name", { ascending: true });
    if (country) query = query.eq("country_code", country);
    if (region) query = query.eq("region", region);
    if (province) query = query.eq("province", province);
    if (city) query = query.eq("city", city);
    if (venueType) query = query.eq("venue_type", venueType);
    if (verification) query = query.eq("verification_status", verification);
    if (q) query = query.or(`normalized_name.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%,region.ilike.%${q}%,country_code.eq.${q}`);
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) {
      console.error("LOCATIONS GET error:", error);
      return NextResponse.json({ error: "Unable to load location catalog" }, { status: 500 });
    }
    const total = count || 0;
    return NextResponse.json({ locations: data || [], pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) {
    console.error("LOCATIONS GET uncaught:", error);
    return NextResponse.json({ error: "Unexpected catalog error" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Direct catalog submissions are disabled; a moderated suggestion workflow is planned." }, { status: 405, headers: { Allow: "GET" } });
}
