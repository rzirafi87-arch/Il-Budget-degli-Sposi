import { getEventTypeCapability, validateEventTypeForRegistration } from "@/lib/eventTypeCapabilities";
import { generatePublicId } from "@/lib/publicId";
import { getServiceClient } from "@/lib/supabaseServer";
import { CURRENT_EVENT_COOKIE, resolveCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";
import type { EventCreateBody, EventInsert, EventUpdate } from "../lifecycleTypes";

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

    const body: EventCreateBody = await req.json().catch(() => ({}));
    const createAdditional = body.createAdditional === true;
    const url = new URL(req.url);
    const requestedEventType = body.eventType ?? url.searchParams.get("eventType") ?? "wedding";
    const eventTypeDecision = validateEventTypeForRegistration(requestedEventType);
    if (!eventTypeDecision.ok) {
      const status = eventTypeDecision.reason === "COMING_SOON" ? 409 : 400;
      return NextResponse.json({
        ok: false,
        code: `EVENT_TYPE_${eventTypeDecision.reason}`,
        eventType: eventTypeDecision.eventType,
        error: "EVENT_TYPE_NOT_AVAILABLE",
      }, { status });
    }
    const eventTypeSlug = eventTypeDecision.eventType;
    const country = ((typeof body.country === "string" && body.country) || url.searchParams.get("country") || "").trim();
    const language = ((typeof body.language === "string" && body.language) || url.searchParams.get("language") || "").trim();
    const userId = userData.user.id;

    const resolution = await resolveCurrentEvent(req, userId);
    if (createAdditional && resolution.status === "RESOLVED" && resolution.currentEvent.accessRole !== "owner") {
      return NextResponse.json({ ok: false, code: "EVENT_CREATE_FORBIDDEN", error: "EVENT_CREATE_FORBIDDEN" }, { status: 403 });
    }
    if (createAdditional && resolution.status === "SELECTION_REQUIRED" && !resolution.events.some((event) => event.ownerId === userId)) {
      return NextResponse.json({ ok: false, code: "EVENT_CREATE_FORBIDDEN", error: "EVENT_CREATE_FORBIDDEN" }, { status: 403 });
    }
    if (resolution.status === "RESOLVED" && !createAdditional) {
      const { data: persisted } = await db.from("events").select("language,country,event_type")
        .eq("id", resolution.currentEvent.eventId).maybeSingle();
      const updates: EventUpdate = {};
      if (!persisted?.language && language) updates.language = language;
      if (!persisted?.country && country) updates.country = country;
      if (!persisted?.event_type) {
        updates.event_type = eventTypeSlug;
      }
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await db.from("events").update(updates).eq("id", resolution.currentEvent.eventId);
        if (updateError) return NextResponse.json({ ok: false, error: "EVENT_SETUP_UPDATE_FAILED" }, { status: 500 });
      }
      const existingEventType = persisted?.event_type ? resolution.currentEvent.eventType : eventTypeSlug;
      const existingCapability = getEventTypeCapability(existingEventType);
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
    if (resolution.status === "SELECTION_REQUIRED" && !createAdditional) {
      return NextResponse.json({ ok: false, code: "EVENT_SELECTION_REQUIRED", events: resolution.events }, { status: 409 });
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
      } satisfies EventInsert)
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
