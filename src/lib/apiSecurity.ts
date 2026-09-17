import { requireUser } from "@/lib/apiAuth";
import {
  CurrentEventError,
  resolveCurrentEvent,
  type CurrentEventContext,
} from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export type EventAccessMode = "owner-only" | "owner-or-partner";

export class ApiSecurityError extends Error {
  constructor(
    readonly code: string,
    readonly status: 400 | 401 | 403 | 404 | 409 | 422 | 500,
  ) {
    super(code);
  }
}

export function parseUuid(value: unknown, code = "INVALID_UUID"): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new ApiSecurityError(code, 400);
  }
  return value;
}

export async function requireSession(req: NextRequest): Promise<{ userId: string }> {
  try {
    return await requireUser(req);
  } catch {
    throw new ApiSecurityError("AUTHENTICATION_REQUIRED", 401);
  }
}

export async function requireEventAccess(
  req: NextRequest,
  mode: EventAccessMode,
  explicitEventId?: string | null,
): Promise<{ userId: string; currentEvent: CurrentEventContext }> {
  const { userId } = await requireSession(req);
  const resolution = await resolveCurrentEvent(req, userId, {
    explicitEventId: explicitEventId || null,
  });
  if (resolution.status !== "RESOLVED") {
    if (explicitEventId || resolution.status === "NO_EVENT") {
      throw new ApiSecurityError("EVENT_NOT_FOUND", 404);
    }
    throw new ApiSecurityError("EVENT_SELECTION_REQUIRED", 409);
  }

  const currentEvent = resolution.currentEvent;
  if (mode === "owner-only" && currentEvent.ownerId !== userId) {
    throw new ApiSecurityError("OWNER_REQUIRED", 403);
  }
  return { userId, currentEvent };
}

export async function requireEventResource(
  table: string,
  resourceId: string,
  eventId: string,
  columns = "id",
): Promise<Record<string, unknown>> {
  const { data, error } = await getServiceClient()
    .from(table)
    .select(columns)
    .eq("id", resourceId)
    .eq("event_id", eventId)
    .maybeSingle();
  if (error) throw new ApiSecurityError("RESOURCE_LOOKUP_FAILED", 500);
  if (!data) throw new ApiSecurityError("RESOURCE_NOT_FOUND", 404);
  return data as unknown as Record<string, unknown>;
}

export function apiSecurityErrorResponse(error: unknown, fallback = "OPERATION_FAILED"): NextResponse {
  if (error instanceof ApiSecurityError) {
    return NextResponse.json({ error: error.code }, { status: error.status });
  }
  if (error instanceof CurrentEventError) {
    return NextResponse.json(
      { error: error.status === "NO_EVENT" ? "EVENT_NOT_FOUND" : "EVENT_SELECTION_REQUIRED" },
      { status: error.status === "NO_EVENT" ? 404 : 409 },
    );
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
