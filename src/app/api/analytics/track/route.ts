import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

type TrackEventRequest = {
  entity_type: "supplier" | "location" | "church";
  entity_id: string;
  event_type: "profile_view" | "contact_click" | "website_click" | "phone_click" | "email_click";
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TrackEventRequest;
    const { entity_type, entity_id, event_type } = body;

    if (!entity_type || !entity_id || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getServiceClient();

    // Ottieni user_id se autenticato
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    let userId: string | null = null;

    if (jwt) {
      const { data: userData } = await db.auth.getUser(jwt);
      userId = userData?.user?.id || null;
    }

    // Traccia evento dettagliato
    const eventData: any = {
      event_type,
      user_id: userId,
      referrer: req.headers.get("referer") || null,
      user_agent: req.headers.get("user-agent") || null,
    };

    if (entity_type === "supplier") eventData.supplier_id = entity_id;
    else if (entity_type === "location") eventData.location_id = entity_id;
    else if (entity_type === "church") eventData.church_id = entity_id;

    await db.from("analytics_events").insert(eventData);

    // Incrementa counter aggregato
    const counterType = event_type === "profile_view" 
      ? "profile_views" 
      : event_type === "website_click" 
      ? "website_clicks" 
      : "contact_clicks";

    await db.rpc("increment_analytics_counter", {
      p_entity_type: entity_type,
      p_entity_id: entity_id,
      p_counter_type: counterType,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("ANALYTICS TRACK error:", e);
    return NextResponse.json({ error: e?.message || "Tracking failed" }, { status: 500 });
  }
}
