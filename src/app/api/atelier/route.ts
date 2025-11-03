/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * GET /api/atelier
 * Recupera atelier per sposa/sposo con filtri opzionali
 * Query params:
 * - category: 'sposa' | 'sposo'
 * - region: regione italiana
 * - province: provincia
 * - city: città
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // 'sposa' | 'sposo'
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const country = searchParams.get("country");

    const db = getServiceClient();

    let query = db
      .from("atelier")
      .select("*")
      .order("name", { ascending: true });

    // Filtri
    if (category) query = query.eq("category", category);
    if (region) query = query.eq("region", region);
    if (province) query = query.eq("province", province);
    if (city) query = query.ilike("city", `%${city}%`);

    let { data, error } = await query;
    if (country) {
      try {
        ({ data, error } = await db
          .from("atelier")
          .select("*")
          .match({
            category: category || undefined,
            region: region || undefined,
            province: province || undefined,
          })
          .ilike("city", city ? `%${city}%` : "%%")
          .eq("country", country)
          .order("name", { ascending: true }));
      } catch (e: unknown) {
        if (country !== "it") {
          data = [] as any;
          error = null as any;
        }
      }
    }

    if (error) {
      console.error("Atelier fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ atelier: data || [] });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Atelier API error:", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}

/**
 * POST /api/atelier
 * Crea un nuovo atelier (richiede autenticazione)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const db = getServiceClient();

    // Verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      category,
      region,
      province,
      city,
      address,
      phone,
      email,
      website,
      description,
      price_range,
      styles,
      services,
      capacity,
    } = body;

    // Validazione campi obbligatori
    if (!name || !category || !region || !city) {
      return NextResponse.json(
        { error: "Campi obbligatori: name, category, region, city" },
        { status: 400 }
      );
    }

    if (!["sposa", "sposo"].includes(category)) {
      return NextResponse.json(
        { error: "category deve essere 'sposa' o 'sposo'" },
        { status: 400 }
      );
    }

    const { data, error } = await db
      .from("atelier")
      .insert({
        name,
        category,
        region,
        province,
        city,
        address,
        phone,
        email,
        website,
        description,
        price_range,
        styles: styles || [],
        services: services || [],
        capacity,
        source: "manual",
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Atelier insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ atelier: data }, { status: 201 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Atelier POST error:", error);
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
