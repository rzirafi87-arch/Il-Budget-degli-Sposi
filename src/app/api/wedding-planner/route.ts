import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");

    const db = getServiceClient();

    let query = db
      .from("wedding_planners")
      .select("*")
      .eq("status", "approved")
      .order("name");

    if (region) {
      query = query.eq("region", region);
    }

    if (province) {
      query = query.ilike("province", `%${province}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Wedding planners GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ planners: data || [] });
  } catch (e: any) {
    console.error("Wedding planners GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      name,
      region,
      province,
      city,
      phone,
      email,
      website,
      description,
      price_range,
      services,
    } = body;

    if (!name || !region || !province || !city) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: name, region, province, city" },
        { status: 400 }
      );
    }

    const db = getServiceClient();

    const { error } = await db.from("wedding_planners").insert({
      name,
      region,
      province,
      city,
      phone: phone || null,
      email: email || null,
      website: website || null,
      description: description || null,
      price_range: price_range || null,
      services: services || null,
      verified: false,
      status: "pending",
    });

    if (error) {
      console.error("Wedding planners POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Wedding planners POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
