import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type Supplier = {
  id?: string;
  name: string;
  category: string;
  subcategory?: string;
  region: string;
  province: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  priceRange?: string;
  rating?: number;
  source: string;
  verified: boolean;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati
      return NextResponse.json({
        suppliers: [
          {
            id: "demo-1",
            name: "Villa Romantica",
            category: "Location & Catering",
            subcategory: "Affitto sala",
            region: "Lombardia",
            province: "Milano",
            city: "Milano",
            phone: "+39 02 1234567",
            email: "info@villaromantica.it",
            website: "https://villaromantica.it",
            description: "Location elegante per matrimoni con giardino e sala interna fino a 200 persone",
            priceRange: "€€€",
            rating: 4.5,
            source: "matrimonio.com",
            verified: true,
          },
          {
            id: "demo-2",
            name: "Studio Foto Arte",
            category: "Foto & Video",
            subcategory: "Servizio fotografico",
            region: "Lombardia",
            province: "Milano",
            city: "Milano",
            phone: "+39 02 7654321",
            email: "info@studiofotoarte.it",
            website: "https://studiofotoarte.it",
            description: "Fotografi professionisti specializzati in matrimoni, servizio completo con video e album",
            priceRange: "€€",
            rating: 5,
            source: "zankyou.it",
            verified: true,
          },
          {
            id: "demo-3",
            name: "Atelier Bianchi",
            category: "Sposa",
            subcategory: "Abito sposa",
            region: "Lombardia",
            province: "Milano",
            city: "Milano",
            phone: "+39 02 9876543",
            email: "info@atelierbianchi.it",
            website: "https://atelierbianchi.it",
            description: "Atelier di alta moda con collezioni esclusive e possibilità di personalizzazione",
            priceRange: "€€€€",
            rating: 4.8,
            source: "matrimonio.com",
            verified: true,
          },
        ],
      });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Query con filtri
    let query = db.from("suppliers").select("*").eq("verified", true);

    if (region) query = query.eq("region", region);
    if (province) query = query.ilike("province", `%${province}%`);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data: suppliers, error } = await query.order("name");

    if (error) {
      console.error("SUPPLIERS GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suppliers: suppliers || [] });
  } catch (e: any) {
    console.error("SUPPLIERS GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const body = await req.json();
    const supplier = body as Supplier;

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Inserisci fornitore proposto (non verificato)
    const { error: insertError } = await db.from("suppliers").insert({
      name: supplier.name,
      category: supplier.category,
      subcategory: supplier.subcategory,
      region: supplier.region,
      province: supplier.province,
      city: supplier.city,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      website: supplier.website,
      description: supplier.description,
      price_range: supplier.priceRange,
      source: "user_submitted",
      verified: false,
      proposed_by: userId,
    });

    if (insertError) {
      console.error("SUPPLIERS POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("SUPPLIERS POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
