import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();

    // chi è l'utente? (con service role possiamo leggere il JWT dall'header)
    const authHeader = req.headers.get("authorization"); // es: "Bearer <jwt>"
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // verifica il token e ottieni l'utente
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const userId = userData.user.id;

    // 1) c'è già un evento dell'utente?
    const { data: events, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1);

    if (e1) {
      console.error("ENSURE-DEFAULT – Query events error:", e1);
      return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
    }

    let eventId = events?.[0]?.id as string | undefined;

    // 2) se non c'è, creane uno e seedalo
    if (!eventId) {
      const publicId = Math.random().toString(36).slice(2, 10);
      const { data: ev, error: e2 } = await db
        .from("events")
        .insert({ 
          public_id: publicId, 
          name: "Il nostro matrimonio",
          owner_id: userId
        })
        .select("id")
        .single();
      
      if (e2) {
        console.error("ENSURE-DEFAULT – Create event error:", e2);
        return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
      }

      eventId = ev!.id;

      // seed l'evento
      const { error: e3 } = await db.rpc("seed_full_event", { p_event: eventId });
      if (e3) {
        console.error("ENSURE-DEFAULT – Seed error:", e3);
        return NextResponse.json({ ok: false, error: e3.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, eventId }, { status: 200 });
  } catch (e: any) {
    console.error("ENSURE-DEFAULT – Uncaught:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected" }, { status: 500 });
  }
}
