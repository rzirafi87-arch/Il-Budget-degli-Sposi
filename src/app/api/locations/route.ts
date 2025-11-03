/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFallbackLocations } from "@/data/fallbackContent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const locationType = searchParams.get("type");
    const country = searchParams.get("country");

    const db = getServiceClient();
    
    let query = db
      .from("locations")
      .select("*")
      .order("verified", { ascending: false })
      .order("name", { ascending: true });

    if (region) {
      query = query.eq("region", region);
    }
    if (province) {
      query = query.eq("province", province);
    }
    if (locationType) {
      query = query.eq("location_type", locationType);
    }
    // Try to filter by country if provided and column exists
    let data, error;
    if (country) {
      ({ data, error } = await query.eq("country", country));
      if (error && /column .*country.* does not exist/i.test(error.message)) {
        // Retry without country column
        ({ data, error } = await db
          .from("locations")
          .select("*")
          .order("verified", { ascending: false })
          .order("name", { ascending: true })
          .match({ region: region || undefined, province: province || undefined, location_type: locationType || undefined }));
        // If schema lacks country, and user requested non-IT, avoid showing IT data by returning empty
        if (country && country !== "it") {
          data = [];
          error = null as any;
        }
      }
    } else {
      ({ data, error } = await query);
    }

    const normalizedCountry = country?.toLowerCase() ?? "";

    if (error) {
      console.error("LOCATIONS GET error:", error);
      const fallback = getFallbackLocations(normalizedCountry, {
        region,
        province,
        locationType,
      });
      if (fallback.length > 0) {
        return NextResponse.json({ locations: fallback });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      const fallback = getFallbackLocations(normalizedCountry, {
        region,
        province,
        locationType,
      });
      if (fallback.length > 0) {
        return NextResponse.json({ locations: fallback });
      }
    }

    return NextResponse.json({ locations: data || [] });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("LOCATIONS GET uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const body = await req.json();
    const db = getServiceClient();
    
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Try insert with optional country; if schema lacks it, retry without
    let insertError;
    ({ error: insertError } = await db.from("locations").insert({
      name: body.name,
      region: body.region,
      province: body.province,
      city: body.city,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      description: body.description,
      price_range: body.price_range,
      capacity_min: body.capacity_min,
      capacity_max: body.capacity_max,
      location_type: body.location_type,
      verified: false,
      user_id: userId,
      ...(body.country ? { country: body.country } : {}),
    } as any));
    if (insertError && /column .*country.* does not exist/i.test(insertError.message)) {
      ({ error: insertError } = await db.from("locations").insert({
        name: body.name,
        region: body.region,
        province: body.province,
        city: body.city,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        description: body.description,
        price_range: body.price_range,
        capacity_min: body.capacity_min,
        capacity_max: body.capacity_max,
        location_type: body.location_type,
        verified: false,
        user_id: userId,
      }));
    }

    if (insertError) {
      console.error("LOCATIONS POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("LOCATIONS POST uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}
