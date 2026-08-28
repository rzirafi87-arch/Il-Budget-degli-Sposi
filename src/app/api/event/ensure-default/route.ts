import { getServiceClient } from "@/lib/supabaseServer";
import { generatePublicId } from "@/lib/publicId";
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
      ? "baby-shower"
      : eventType === "engagement-party"
      ? "engagement-party"
      : eventType;
  // Country (for localization presets)
  const country = (body.country || url.searchParams.get("country") || "").toString();
  const language = (body.language || url.searchParams.get("language") || "").toString();

    // 1) c'è già un evento dell'utente?
    const { data: events, error: e1 } = await db
      .from("events")
      .select("id, event_type")
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
      const supportedEventTypes = new Set([
        "wedding", "baptism", "eighteenth", "graduation", "confirmation", "communion",
        "anniversary", "birthday", "fifty", "gender-reveal", "retirement", "baby-shower",
        "engagement-party", "proposal", "corporate", "bar-mitzvah", "quinceanera", "charity-gala",
      ]);
      const eventTypeSlug = supportedEventTypes.has(normalizedEventType) ? normalizedEventType : "wedding";
      
      const publicId = generatePublicId();
      const eventNames: Record<string, string> = {
        wedding: "Il nostro matrimonio",
        baptism: "Il mio Battesimo",
        eighteenth: "Il mio Diciottesimo",
        confirmation: "La mia Cresima",
        graduation: "La mia Laurea",
        communion: "La mia Prima Comunione",
        anniversary: "Il nostro Anniversario",
        birthday: "Il mio Compleanno",
        fifty: "Il mio Cinquantesimo",
        "gender-reveal": "Il nostro Gender Reveal",
        retirement: "La mia Festa di Pensionamento",
        "baby-shower": "Il nostro Baby Shower",
        "engagement-party": "La nostra Festa di Fidanzamento",
        proposal: "La nostra Proposta",
        corporate: "Il nostro Evento Aziendale",
        "bar-mitzvah": "Il mio Bar Mitzvah",
        quinceanera: "La mia Quinceañera",
        "charity-gala": "Il nostro Gala di Beneficenza",
      };
      const eventName = eventNames[eventTypeSlug] || "Il mio evento";
      
      const { data: ev, error: e2 } = await db
        .from("events")
        .insert({ 
          public_id: publicId, 
          name: eventName,
          owner_id: userId,
          event_type: eventTypeSlug,
          language: language || null,
          country: country || null
        })
        .select("id")
        .single();
      
      if (e2) {
        console.error("ENSURE-DEFAULT – Create event error:", e2);
        return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
      }

      eventId = ev!.id;

      if (eventTypeSlug === "wedding") {
        // Wedding: use RPC seed_full_event
        const { error: e3 } = await db.rpc("seed_full_event", { p_event: eventId });
        if (e3) {
          console.error("ENSURE-DEFAULT – Seed error:", e3);
        }
      } else {
        const seedSlugs: Record<string, string> = {
          "baby-shower": "babyshower",
          "engagement-party": "engagement",
        };
        const seedSlug = seedSlugs[eventTypeSlug] || eventTypeSlug;
        const seedUrl = new URL(`/api/${seedSlug}/seed/${eventId}?country=${country || "it"}`, req.url);
        const seedRes = await fetch(seedUrl.toString(), {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!seedRes.ok) {
          const seedError = await seedRes.json().catch(() => ({ error: "Seed failed" }));
          console.error(`ENSURE-DEFAULT – ${eventTypeSlug} seed error:`, seedError);
        }
      }
    }

    return NextResponse.json({ ok: true, eventId }, { status: 200 });
  } catch (e: unknown) {
    console.error("ENSURE-DEFAULT – Uncaught:", e);
    return NextResponse.json({ ok: false, error: String(e) || "Unexpected" }, { status: 500 });
  }
}
