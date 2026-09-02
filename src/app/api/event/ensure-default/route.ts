import { getEventTypeCapability, normalizeEventType } from "@/lib/eventTypeCapabilities";
import { generatePublicId } from "@/lib/publicId";
import { getServiceClient } from "@/lib/supabaseServer";
import { CURRENT_EVENT_COOKIE, resolveCurrentEvent } from "@/lib/currentEvent";
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

    const resolution = await resolveCurrentEvent(req, userId);
    if (resolution.status === "RESOLVED") {
      const existingEventType = resolution.currentEvent.eventType;
      const existingCapability = resolution.currentEvent.capability;
      return NextResponse.json(
        {
          ok: true,
          eventId: resolution.currentEvent.eventId,
          eventType: existingEventType,
          legacy: existingCapability.availabilityStatus !== "READY",
        },
        { status: 200 }
      );
    }
    if (resolution.status === "SELECTION_REQUIRED") {
      return NextResponse.json({ ok: false, code: "EVENT_SELECTION_REQUIRED", events: resolution.events }, { status: 409 });
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

    const response = NextResponse.json({ ok: true, eventId: createdEvent.id, eventType: eventTypeSlug }, { status: 200 });
    response.cookies.set(CURRENT_EVENT_COOKIE, createdEvent.id, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000,
    });
    return response;
  } catch (error: unknown) {
    console.error("ENSURE-DEFAULT – Uncaught:", error);
    return NextResponse.json({ ok: false, error: String(error) || "Unexpected" }, { status: 500 });
  }
}
