import { requireUser } from "@/lib/apiAuth";
import { CURRENT_EVENT_COOKIE, resolveCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const resolution = await resolveCurrentEvent(req, userId);
    const response = NextResponse.json(resolution);
    if (resolution.status === "RESOLVED" && resolution.currentEvent.source === "single-event-fallback") {
      response.cookies.set(CURRENT_EVENT_COOKIE, resolution.currentEvent.eventId, cookieOptions());
    } else if (resolution.staleSelection) {
      response.cookies.delete(CURRENT_EVENT_COOKIE);
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as { eventId?: string };
    if (!body.eventId || !UUID.test(body.eventId)) {
      return NextResponse.json({ error: "INVALID_EVENT" }, { status: 400 });
    }
    const resolution = await resolveCurrentEvent(req, userId, { explicitEventId: body.eventId });
    if (resolution.status !== "RESOLVED" || resolution.currentEvent.eventId !== body.eventId) {
      return NextResponse.json({ error: "EVENT_NOT_OWNED" }, { status: 403 });
    }
    const response = NextResponse.json(resolution);
    response.cookies.set(CURRENT_EVENT_COOKIE, body.eventId, cookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireUser(req);
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(CURRENT_EVENT_COOKIE);
    return response;
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
