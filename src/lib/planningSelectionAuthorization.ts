import { requireUser } from "@/lib/apiAuth";
import {
  currentEventErrorResponse,
  requireCurrentEvent,
  type CurrentEventContext,
  type OwnedEventSummary,
} from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";

export type PlanningSelectionAction = "read" | "mutate";
export type PlanningAccessRole = OwnedEventSummary["accessRole"];

// Planning selections are shared event data. This mirrors the existing
// can_access_event() RLS contract while making the service-role API boundary
// explicit instead of relying on RLS that the service client bypasses.
export const PLANNING_SELECTION_PERMISSIONS: Readonly<
  Record<PlanningAccessRole, Readonly<Record<PlanningSelectionAction, boolean>>>
> = {
  owner: { read: true, mutate: true },
  partner: { read: true, mutate: true },
  legacy: { read: true, mutate: true },
};

class PlanningAuthenticationError extends Error {}
class PlanningAuthorizationError extends Error {}

export async function requirePlanningSelectionAccess(
  req: NextRequest,
  action: PlanningSelectionAction,
): Promise<{ userId: string; currentEvent: CurrentEventContext }> {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    throw new PlanningAuthenticationError("AUTHENTICATION_REQUIRED");
  }

  const currentEvent = await requireCurrentEvent(req, userId);
  if (!PLANNING_SELECTION_PERMISSIONS[currentEvent.accessRole][action]) {
    throw new PlanningAuthorizationError("PLANNING_SELECTION_FORBIDDEN");
  }
  return { userId, currentEvent };
}

export function planningSelectionErrorResponse(error: unknown): NextResponse {
  if (error instanceof PlanningAuthenticationError) {
    return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }
  if (error instanceof PlanningAuthorizationError) {
    return NextResponse.json({ error: "PLANNING_SELECTION_FORBIDDEN" }, { status: 403 });
  }
  const currentEventError = currentEventErrorResponse(error);
  if (currentEventError) {
    return NextResponse.json({ error: currentEventError.error }, { status: currentEventError.status });
  }
  return NextResponse.json({ error: "PLANNING_SELECTION_FAILED" }, { status: 500 });
}
