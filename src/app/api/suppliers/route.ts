import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati - SOLO fornitori con tier premium_plus
      const db = getServiceClient();
      
      let query = db
        .from("suppliers")
        .select("*")
        .eq("verified", true)
        .eq("subscription_tier", "premium_plus")
        .gte("subscription_expires_at", new Date().toISOString());

      if (region) query = query.eq("region", region);
      if (province) query = query.ilike("province", `%${province}%`);
      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data: premiumSuppliers } = await query
        .order("is_featured", { ascending: false })
        .order("name");

      // Fallback ai dati demo hardcoded se non ci sono fornitori premium_plus
      const allDemoSuppliers = premiumSuppliers && premiumSuppliers.length > 0 
        ? premiumSuppliers 
        : [
        {
          id: "demo-catering-1",
          name: "Villa Romantica",
          category: "Catering",
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
          id: "demo-foto-1",
          name: "Studio Foto Arte",
          category: "Fotografi",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 7654321",
          email: "info@studiofotoarte.it",
          website: "https://studiofotoarte.it",
          description: "Fotografi professionisti specializzati in matrimoni, servizio completo con video e album",
          priceRange: "€€",
          rating: 5.0,
          source: "zankyou.it",
          verified: true,
        },
        {
          id: "demo-atelier-1",
          name: "Atelier Bianchi",
          category: "Atelier",
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
        {
          id: "demo-fiorai-1",
          name: "Fiori d'Amore",
          category: "Fiorai",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 5555555",
          email: "info@fioridamore.it",
          website: "https://fioridamore.it",
          description: "Bouquet e allestimenti floreali per matrimoni ed eventi speciali",
          priceRange: "€€",
          rating: 4.7,
          source: "matrimonio.com",
          verified: true,
        },
        {
          id: "demo-beauty-1",
          name: "Beauty & Spa Luxury",
          category: "Make-up & Beauty",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 6666666",
          email: "info@beautyluxury.it",
          website: "https://beautyluxury.it",
          description: "Servizi di trucco, acconciatura e trattamenti benessere per spose",
          priceRange: "€€€",
          rating: 4.9,
          source: "zankyou.it",
          verified: true,
        },
        {
          id: "demo-gioielli-1",
          name: "Gioielleria Eleganza",
          category: "Gioiellerie",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 7777777",
          email: "info@gioielleriaeleganza.it",
          website: "https://gioielleriaeleganza.it",
          description: "Fedi nuziali, anelli di fidanzamento e gioielli artigianali personalizzati",
          priceRange: "€€€€",
          rating: 4.6,
          source: "matrimonio.com",
          verified: true,
        },
        {
          id: "demo-wp-1",
          name: "Wedding Dreams Planner",
          category: "Wedding Planner",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 8888888",
          email: "info@weddingdreams.it",
          website: "https://weddingdreams.it",
          description: "Organizzazione completa matrimoni e coordinamento giorno delle nozze",
          priceRange: "€€€",
          rating: 5.0,
          source: "zankyou.it",
          verified: true,
        },
        {
          id: "demo-musica-cerimonia-1",
          name: "Archi & Voci Ensemble",
          category: "Musica Cerimonia",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 9999999",
          email: "info@archievoci.it",
          website: "https://archievoci.it",
          description: "Ensemble di archi e soprano per cerimonie religiose e civili",
          priceRange: "€€",
          rating: 4.8,
          source: "matrimonio.com",
          verified: true,
        },
        {
          id: "demo-musica-ricevimento-1",
          name: "DJ Party Wedding",
          category: "Musica Ricevimento",
          region: "Lombardia",
          province: "Milano",
          city: "Milano",
          phone: "+39 02 1010101",
          email: "info@djparty.it",
          website: "https://djpartywedding.it",
          description: "DJ professionista per ricevimenti e feste di matrimonio",
          priceRange: "€€€",
          rating: 4.7,
          source: "zankyou.it",
          verified: true,
        },
      ];

      // Filtra i dati demo solo se stiamo usando il fallback hardcoded
      let filteredDemo = allDemoSuppliers;
      
      // Se stiamo usando dati reali dal DB, sono già filtrati
      if (!premiumSuppliers || premiumSuppliers.length === 0) {
        if (category) {
          filteredDemo = filteredDemo.filter(s => s.category === category);
        }
        if (region) {
          filteredDemo = filteredDemo.filter(s => s.region === region);
        }
        if (province) {
          filteredDemo = filteredDemo.filter(s => s.province.toLowerCase().includes(province.toLowerCase()));
        }
        if (search) {
          filteredDemo = filteredDemo.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
        }
      }

      return NextResponse.json({
        suppliers: filteredDemo,
      });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Query con filtri - utenti autenticati vedono base, premium e premium_plus
    let query = db
      .from("suppliers")
      .select("*")
      .eq("verified", true)
      .in("subscription_tier", ["base", "premium", "premium_plus"])
      .or(`subscription_tier.eq.free,and(subscription_expires_at.gte.${new Date().toISOString()})`);

    if (region) query = query.eq("region", region);
    if (province) query = query.ilike("province", `%${province}%`);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data: suppliers, error } = await query
      .order("is_featured", { ascending: false })
      .order("subscription_tier", { ascending: false })
      .order("name");

    if (error) {
      console.error("SUPPLIERS GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suppliers: suppliers || [] });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Unexpected";
    console.error("SUPPLIERS GET uncaught:", e);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
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
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : "Unexpected";
    console.error("SUPPLIERS POST uncaught:", e);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
