import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");
    const churchType = searchParams.get("type");

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

    const { data, error } = await query;

    if (error) {
      if ((error as any).code === 'PGRST205') {
        // schema/table missing locally: return empty for graceful UX
        return NextResponse.json({ churches: [] });
      }
      console.error("CHURCHES GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ churches: data || [] });
  } catch (e: any) {
    console.error("CHURCHES GET uncaught:", e);
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

    const { error: insertError } = await db.from("churches").insert({
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
    });

    if (insertError) {
      console.error("CHURCHES POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("CHURCHES POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
