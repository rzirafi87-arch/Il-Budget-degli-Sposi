import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getBearer, requireUser } from "@/lib/apiAuth";
import { CURRENT_EVENT_COOKIE, listOwnedEvents } from "@/lib/currentEvent";
import type { Database } from "@/types/database.types";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
type DeleteEventBody = { eventId?: unknown; confirmationName?: unknown };

export async function DELETE(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body: DeleteEventBody = await req.json().catch(() => ({}));
  if (
    !UUID.test(typeof body.eventId === "string" ? body.eventId : "") ||
    typeof body.confirmationName !== "string"
  ) {
    return NextResponse.json(
      { error: "INVALID_EVENT_DELETE" },
      { status: 400 },
    );
  }
  const eventId = body.eventId as string;
  const accessible = await listOwnedEvents(userId);
  const target = accessible.find((event) => event.id === eventId);
  if (!target) {
    return NextResponse.json({ error: "EVENT_NOT_FOUND" }, { status: 404 });
  }
  if (target.ownerId !== userId) {
    return NextResponse.json(
      { error: "EVENT_DELETE_FORBIDDEN" },
      { status: 403 },
    );
  }
  const expectedName = target.name?.trim() || target.eventType;
  if (body.confirmationName.trim() !== expectedName) {
    return NextResponse.json(
      { error: "EVENT_DELETE_CONFIRMATION_MISMATCH" },
      { status: 400 },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const jwt = getBearer(req);
  if (!url || !publicKey || !jwt)
    return NextResponse.json(
      { error: "EVENT_DELETE_UNAVAILABLE" },
      { status: 503 },
    );

  // One SQL DELETE under the caller's JWT: database RLS is the final owner-only guard.
  const db = createClient<Database>(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: deleted, error } = await db
    .from("events")
    .delete()
    .eq("id", eventId)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: "EVENT_DELETE_FAILED" }, { status: 409 });
  if (!deleted)
    return NextResponse.json(
      { error: "EVENT_ALREADY_DELETED" },
      { status: 404 },
    );

  const remaining = await listOwnedEvents(userId);
  const nextEvent = remaining[0] ?? null;
  const response = NextResponse.json({
    ok: true,
    deletedEventId: eventId,
    remainingCount: remaining.length,
    nextEvent: nextEvent
      ? { id: nextEvent.id, eventType: nextEvent.eventType }
      : null,
  });
  response.cookies.delete(CURRENT_EVENT_COOKIE);
  response.cookies.delete("eventType");
  response.cookies.delete("currentEventChangedAt");
  if (nextEvent)
    response.cookies.set(CURRENT_EVENT_COOKIE, nextEvent.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Clear-Site-Data", '"cache"');
  return response;
}
