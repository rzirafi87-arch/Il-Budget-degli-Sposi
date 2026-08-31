import { getEventTypeCapability, normalizeEventType } from "@/lib/eventTypeCapabilities";
import { generatePublicId } from "@/lib/publicId";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const requestedEventType = body.eventType || url.searchParams.get("eventType") || "wedding";
    const eventTypeSlug = normalizeEventType(String(requestedEventType));
    const capability = getEventTypeCapability(eventTypeSlug);
    const country = (body.country || url.searchParams.get("country") || "").toString();
    const language = (body.language || url.searchParams.get("language") || "").toString();
    const userId = userData.user.id;

    // Legacy-safe behaviour: never rewrite or delete an existing event, even if its
    // type is now classified COMING_SOON. The route simply returns the existing id.
    const { data: events, error: existingError } = await db
      .from("events")
      .select("id, event_type")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1);

    if (existingError) {
      console.error("ENSURE-DEFAULT – Query events error:", existingError);
      return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
    }

    const existingEvent = events?.[0];
    if (existingEvent?.id) {
      const existingEventType = normalizeEventType(existingEvent.event_type);
      const existingCapability = getEventTypeCapability(existingEventType);
      return NextResponse.json(
        {
          ok: true,
          eventId: existingEvent.id,
          eventType: existingEventType,
          legacy: existingCapability.availabilityStatus !== "READY",
        },
        { status: 200 }
      );
    }

    // Product rule: a type that is not genuinely ready cannot create a new event.
    if (capability.availabilityStatus !== "READY") {
      return NextResponse.json(
        {
          ok: false,
          code: "EVENT_TYPE_COMING_SOON",
          eventType: eventTypeSlug,
          error: "Questo tipo di evento non è ancora disponibile.",
        },
        { status: 409 }
      );
    }

    const publicId = generatePublicId();
    const eventName = eventTypeSlug === "wedding" ? "Il nostro matrimonio" : "Il mio evento";
    const { data: createdEvent, error: createError } = await db
      .from("events")
      .insert({
        public_id: publicId,
        name: eventName,
        owner_id: userId,
        event_type: eventTypeSlug,
        language: language || null,
        country: country || null,
      })
      .select("id")
      .single();

    if (createError || !createdEvent) {
      console.error("ENSURE-DEFAULT – Create event error:", createError);
      return NextResponse.json({ ok: false, error: createError?.message || "Create failed" }, { status: 500 });
    }

    if (eventTypeSlug === "wedding") {
      const { error: seedError } = await db.rpc("seed_full_event", { p_event: createdEvent.id });
      if (seedError) {
        console.error("ENSURE-DEFAULT – Seed error:", seedError);
      }
    }

    return NextResponse.json({ ok: true, eventId: createdEvent.id, eventType: eventTypeSlug }, { status: 200 });
  } catch (error: unknown) {
    console.error("ENSURE-DEFAULT – Uncaught:", error);
    return NextResponse.json({ ok: false, error: String(error) || "Unexpected" }, { status: 500 });
  }
}
