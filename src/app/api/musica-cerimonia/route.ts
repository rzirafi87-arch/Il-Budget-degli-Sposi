import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const country = searchParams.get("country");

    const db = getServiceClient();

    let query = db
      .from("musica_cerimonia")
      .select("*")
      .eq("status", "approved")
      .order("name");

    if (region) {
      query = query.eq("region", region);
    }

    if (province) {
      query = query.ilike("province", `%${province}%`);
    }

    let { data, error } = await query;
    if (!error && country) {
      try {
        ({ data, error } = await db
          .from("musica_cerimonia")
          .select("*")
          .eq("status", "approved")
          .match({ region: region || undefined })
          .ilike("province", province ? `%${province}%` : "%%")
          .eq("country", country)
          .order("name"));
      } catch (e: unknown) {
        // If country column missing and requested non-IT, return empty
        if (country !== "it") {
          data = [] as any;
          error = null as any;
        }
      }
    }

    if (error) {
      console.error("Musica cerimonia GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ musicians: data || [] });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Musica cerimonia GET uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
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
      music_type,
    } = body;

    if (!name || !region || !province || !city) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti: name, region, province, city" },
        { status: 400 }
      );
    }

    const db = getServiceClient();

    const { error } = await db.from("musica_cerimonia").insert({
      name,
      region,
      province,
      city,
      phone: phone || null,
      email: email || null,
      website: website || null,
      description: description || null,
      price_range: price_range || null,
      music_type: music_type || null,
      verified: false,
      status: "pending",
    });

    if (error) {
      console.error("Musica cerimonia POST error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Musica cerimonia POST uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}
