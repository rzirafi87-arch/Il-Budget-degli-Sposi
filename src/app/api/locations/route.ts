import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const locationType = searchParams.get("type");

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

    const { data, error } = await query;

    if (error) {
      console.error("LOCATIONS GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ locations: data || [] });
  } catch (e: any) {
    console.error("LOCATIONS GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
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

    const { error: insertError } = await db.from("locations").insert({
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
    });

    if (insertError) {
      console.error("LOCATIONS POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("LOCATIONS POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
