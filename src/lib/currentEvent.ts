import { getEventTypeCapability, normalizeEventType, type EventTypeCapability } from "@/lib/eventTypeCapabilities";
import { getServiceClient } from "@/lib/supabaseServer";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export const CURRENT_EVENT_COOKIE = "app-current-event";

export type CurrentEventSource = "cookie" | "single-event-fallback" | "explicit";
export type CurrentEventStatus = "RESOLVED" | "NO_EVENT" | "SELECTION_REQUIRED";

export type OwnedEventSummary = {
  id: string;
  ownerId: string;
  name: string | null;
  eventType: string;
  date: string | null;
  locale: string | null;
  country: string | null;
  capability: EventTypeCapability;
  accessRole: "owner" | "partner" | "legacy";
};

export type CurrentEventContext = OwnedEventSummary & {
  eventId: string;
  source: CurrentEventSource;
  valid: true;
};

export type CurrentEventResolution =
  | { status: "RESOLVED"; currentEvent: CurrentEventContext; events: OwnedEventSummary[]; staleSelection: boolean }
  | { status: "NO_EVENT"; currentEvent: null; events: []; staleSelection: boolean }
  | { status: "SELECTION_REQUIRED"; currentEvent: null; events: OwnedEventSummary[]; staleSelection: boolean };

type EventRow = {
  id: string;
  owner_id: string;
  name: string | null;
  event_type: string | null;
  language: string | null;
  country: string | null;
  inserted_at: string | null;
  event_date: string | null;
};

function summarize(row: EventRow, accessRole: OwnedEventSummary["accessRole"]): OwnedEventSummary {
  const eventType = normalizeEventType(row.event_type);
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    eventType,
    date: row.event_date || null,
    locale: row.language,
    country: row.country,
    capability: getEventTypeCapability(eventType),
    accessRole,
  };
}

async function authenticatedEmail(userId: string): Promise<string | null> {
  try {
    const db = getServiceClient();
    const admin = db.auth?.admin;
    if (!admin?.getUserById) return null;
    const { data, error } = await admin.getUserById(userId);
    if (error) return null;
    return data?.user?.email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function listOwnedEvents(userId: string): Promise<OwnedEventSummary[]> {
  const db = getServiceClient();
  const email = await authenticatedEmail(userId);
  const eventColumns = "id,owner_id,name,event_type,language,country,inserted_at,event_date";

  // Membership is authoritative. Fetch all rows (including revoked/left) so a
  // canonical revocation cannot be bypassed through the temporary email fallback.
  const { data: memberships, error: membershipError } = await db
    .from("event_members")
    .select(`event_id,role,status,event:events(${eventColumns})`)
    .eq("user_id", userId);
  if (membershipError) throw membershipError;

  const memberRows = (memberships || []) as unknown as Array<{
    event_id: string;
    role: "owner" | "partner";
    status: "active" | "revoked" | "left";
    event: EventRow | EventRow[] | null;
  }>;
  const canonicalEventIds = new Set(memberRows.map((membership) => membership.event_id));
  const canonical = memberRows.flatMap((membership) => {
    if (membership.status !== "active") return [];
    const event = Array.isArray(membership.event) ? membership.event[0] : membership.event;
    return event ? [summarize(event, membership.role)] : [];
  });

  let query = db
    .from("events")
    .select(eventColumns);

  // Registration stores the two spouses in bride_email/groom_email. Treat those
  // addresses as access to the same couple project instead of creating a second,
  // disconnected event for the invited partner.
  query = email
    ? query.or(`owner_id.eq.${userId},bride_email.eq.${email},groom_email.eq.${email}`)
    : query.eq("owner_id", userId);

  const { data, error } = await query
    .order("inserted_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  const legacy = ((data || []) as EventRow[])
    .filter((event) => !canonicalEventIds.has(event.id))
    .map((event) => summarize(event, "legacy"));
  return [...canonical, ...legacy].sort((a, b) => {
    const dateOrder = (a.date || "").localeCompare(b.date || "");
    return dateOrder || a.id.localeCompare(b.id);
  });
}

export async function resolveCurrentEvent(
  req: NextRequest,
  userId: string,
  options?: { explicitEventId?: string | null },
): Promise<CurrentEventResolution> {
  const events = await listOwnedEvents(userId);
  const explicit = options?.explicitEventId || null;
  const hinted = explicit || req.cookies.get(CURRENT_EVENT_COOKIE)?.value || null;
  const selected = hinted ? events.find((event) => event.id === hinted) : undefined;

  if (selected) {
    return {
      status: "RESOLVED",
      currentEvent: { ...selected, eventId: selected.id, source: explicit ? "explicit" : "cookie", valid: true },
      events,
      staleSelection: false,
    };
  }
  if (events.length === 0) return { status: "NO_EVENT", currentEvent: null, events: [], staleSelection: Boolean(hinted) };
  if (events.length === 1) {
    const only = events[0];
    return {
      status: "RESOLVED",
      currentEvent: { ...only, eventId: only.id, source: "single-event-fallback", valid: true },
      events,
      staleSelection: Boolean(hinted),
    };
  }
  return { status: "SELECTION_REQUIRED", currentEvent: null, events, staleSelection: Boolean(hinted) };
}

export class CurrentEventError extends Error {
  constructor(public readonly status: Exclude<CurrentEventStatus, "RESOLVED">) {
    super(status);
  }
}

export async function requireCurrentEvent(req: NextRequest, userId: string): Promise<CurrentEventContext> {
  const resolution = await resolveCurrentEvent(req, userId);
  if (resolution.status !== "RESOLVED") throw new CurrentEventError(resolution.status);
  return resolution.currentEvent;
}

export async function requireServerCurrentEvent(userId: string): Promise<CurrentEventContext> {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Direct route-unit tests do not create Next's request async storage.
  }
  const requestLike = {
    cookies: { get: (name: string) => cookieStore?.get(name) },
  } as NextRequest;
  return requireCurrentEvent(requestLike, userId);
}

export function currentEventErrorResponse(error: unknown): { error: string; status: number } | null {
  if (!(error instanceof CurrentEventError)) return null;
  return error.status === "NO_EVENT"
    ? { error: "NO_EVENT", status: 404 }
    : { error: "EVENT_SELECTION_REQUIRED", status: 409 };
}
