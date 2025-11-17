import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

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

  // Get event type from request body or query params
  const body = await req.json().catch(() => ({}));
  const url = new URL(req.url);
  const eventType = body.eventType || url.searchParams.get("eventType") || "wedding";
  const normalizedEventType =
    eventType === "baby-shower"
      ? "babyshower"
      : eventType === "engagement-party"
      ? "engagement"
      : eventType;
  // Country/Rite (for localization presets)
  const country = (body.country || url.searchParams.get("country") || "").toString();
  const rite = (body.rite || url.searchParams.get("rite") || "").toString();

    // 1) c'è già un evento dell'utente?
    const { data: events, error: e1 } = await db
      .from("events")
      .select("id, type_id")
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
      // Get type_id from event_types table
      const eventTypeSlug =
        normalizedEventType === "baptism" ? "baptism" :
        normalizedEventType === "eighteenth" ? "eighteenth" :
        normalizedEventType === "confirmation" ? "confirmation" :
        normalizedEventType === "graduation" ? "graduation" :
        normalizedEventType === "communion" ? "communion" :
        normalizedEventType === "babyshower" ? "babyshower" :
        normalizedEventType === "engagement" ? "engagement" :
        "wedding";
      
      const { data: eventTypeData, error: typeError } = await db
        .from("event_types")
        .select("id")
        .eq("slug", eventTypeSlug)
        .single();

      if (typeError) {
        console.error("ENSURE-DEFAULT – Get event type error:", typeError);
        return NextResponse.json({ ok: false, error: typeError.message }, { status: 500 });
      }

      const typeId = eventTypeData?.id;
      if (!typeId) {
        return NextResponse.json({ ok: false, error: "Event type not found" }, { status: 404 });
      }

      const publicId = Math.random().toString(36).slice(2, 10);
      const eventName =
        normalizedEventType === "baptism" ? "Battesimo" :
        normalizedEventType === "eighteenth" ? "Il mio Diciottesimo" :
        normalizedEventType === "confirmation" ? "La mia Cresima" :
        normalizedEventType === "graduation" ? "La mia Laurea" :
        normalizedEventType === "communion" ? "La mia Prima Comunione" :
        normalizedEventType === "babyshower" ? "Il nostro Baby Shower" :
        normalizedEventType === "engagement" ? "La nostra Festa di Fidanzamento" :
        "Il nostro matrimonio";
      
      const { data: ev, error: e2 } = await db
        .from("events")
        .insert({ 
          public_id: publicId, 
          name: eventName,
          owner_id: userId,
          type_id: typeId,
          country: country || null,
          rite: rite || null
        })
        .select("id")
        .single();
      
      if (e2) {
        console.error("ENSURE-DEFAULT – Create event error:", e2);
        return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
      }

      eventId = ev!.id;

      // Seed based on event type
      if (normalizedEventType === "baptism") {
        // Call baptism seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/baptism/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Baptism seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else if (normalizedEventType === "eighteenth") {
        // Call eighteenth seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/eighteenth/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Eighteenth seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else if (normalizedEventType === "confirmation") {
        // Call confirmation seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/confirmation/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Confirmation seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else if (normalizedEventType === "graduation") {
        // Call graduation seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/graduation/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Graduation seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else if (normalizedEventType === "communion") {
        // Call communion seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/communion/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Communion seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else if (normalizedEventType === "engagement") {
        // Call engagement seed endpoint internally
        const country = body.country || "it";
        const seedUrl = new URL(`/api/engagement/seed/${eventId}?country=${country}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error("ENSURE-DEFAULT – Engagement seed error:", seedError);
          return NextResponse.json({ ok: false, error: seedError.error }, { status: 500 });
        }
      } else {
        // Wedding: use RPC seed_full_event
        const { error: e3 } = await db.rpc("seed_full_event", { p_event: eventId });
        if (e3) {
          console.error("ENSURE-DEFAULT – Seed error:", e3);
          return NextResponse.json({ ok: false, error: e3.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true, eventId }, { status: 200 });
  } catch (e: unknown) {
    console.error("ENSURE-DEFAULT – Uncaught:", e);
    return NextResponse.json({ ok: false, error: String(e) || "Unexpected" }, { status: 500 });
  }
}
