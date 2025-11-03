import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { getFallbackChurches } from "@/data/fallbackContent";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const churchType = searchParams.get("type");
    const country = searchParams.get("country");

    const db = getServiceClient();
    
    let query = db
      .from("churches")
      .select("*")
      .order("verified", { ascending: false })
      .order("name", { ascending: true });

    if (region) {
      query = query.eq("region", region);
    }
    if (province) {
      query = query.eq("province", province);
    }
    if (churchType) {
      query = query.eq("church_type", churchType);
    }

    let data, error;
    if (country) {
      ({ data, error } = await query.eq("country", country));
      if (error && /column .*country.* does not exist/i.test(error.message)) {
        ({ data, error } = await db
          .from("churches")
          .select("*")
          .order("verified", { ascending: false })
          .order("name", { ascending: true })
          .match({ region: region || undefined, province: province || undefined, church_type: churchType || undefined }));
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
      console.error("CHURCHES GET error:", error);
      const fallback = getFallbackChurches(normalizedCountry, {
        region,
        province,
        churchType,
      });
      if (fallback.length > 0) {
        return NextResponse.json({ churches: fallback });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      const fallback = getFallbackChurches(normalizedCountry, {
        region,
        province,
        churchType,
      });
      if (fallback.length > 0) {
        return NextResponse.json({ churches: fallback });
      }
    }

    return NextResponse.json({ churches: data || [] });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("CHURCHES GET uncaught:", error);
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

    // Try insert with optional country; if the column doesn't exist, retry without it
    let insertError;
    ({ error: insertError } = await db.from("churches").insert({
      name: body.name,
      region: body.region,
      province: body.province,
      city: body.city,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      description: body.description,
      church_type: body.church_type,
      capacity: body.capacity,
      requires_baptism: body.requires_baptism,
      requires_marriage_course: body.requires_marriage_course,
      verified: false,
      user_id: userId,
      ...(body.country ? { country: body.country } : {}),
    } as any));
    if (insertError && /column .*country.* does not exist/i.test(insertError.message)) {
      ({ error: insertError } = await db.from("churches").insert({
        name: body.name,
        region: body.region,
        province: body.province,
        city: body.city,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        description: body.description,
        church_type: body.church_type,
        capacity: body.capacity,
        requires_baptism: body.requires_baptism,
        requires_marriage_course: body.requires_marriage_course,
        verified: false,
        user_id: userId,
      }));
    }

    if (insertError) {
      console.error("CHURCHES POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("CHURCHES POST uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}
