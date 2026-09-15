import { requireUser } from "@/lib/apiAuth";
import {
  currentEventErrorResponse,
  requireCurrentEvent,
  type CurrentEventContext,
  type OwnedEventSummary,
} from "@/lib/currentEvent";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export type FinancialAction = "read" | "mutate";
export type FinancialAccessRole = OwnedEventSummary["accessRole"];

export const FINANCIAL_PERMISSIONS: Readonly<
  Record<FinancialAccessRole, Readonly<Record<FinancialAction, boolean>>>
> = {
  owner: { read: true, mutate: true },
  partner: { read: true, mutate: true },
  legacy: { read: true, mutate: true },
};

class FinancialAuthenticationError extends Error {}
class FinancialAuthorizationError extends Error {}
class FinancialReferenceError extends Error {
  constructor(
    readonly code: "SAVED_SUPPLIER_NOT_FOUND" | "SAVED_SUPPLIER_LOOKUP_FAILED",
    readonly status: 404 | 500,
  ) {
    super(code);
  }
}

export async function requireFinancialAccess(
  req: NextRequest,
  action: FinancialAction,
): Promise<{ userId: string; currentEvent: CurrentEventContext }> {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    throw new FinancialAuthenticationError("AUTHENTICATION_REQUIRED");
  }

  const currentEvent = await requireCurrentEvent(req, userId);
  if (!FINANCIAL_PERMISSIONS[currentEvent.accessRole][action]) {
    throw new FinancialAuthorizationError("FINANCIAL_FORBIDDEN");
  }
  return { userId, currentEvent };
}

export async function requireSameEventSavedSupplier(
  db: ReturnType<typeof getServiceClient>,
  eventId: string,
  savedSupplierId: string,
): Promise<void> {
  const { data, error } = await db
    .from("saved_suppliers")
    .select("id")
    .eq("id", savedSupplierId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    throw new FinancialReferenceError("SAVED_SUPPLIER_LOOKUP_FAILED", 500);
  }
  if (!data) {
    throw new FinancialReferenceError("SAVED_SUPPLIER_NOT_FOUND", 404);
  }
}

export function financialErrorResponse(error: unknown): NextResponse {
  if (error instanceof FinancialAuthenticationError) {
    return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }
  if (error instanceof FinancialAuthorizationError) {
    return NextResponse.json({ error: "FINANCIAL_FORBIDDEN" }, { status: 403 });
  }
  if (error instanceof FinancialReferenceError) {
    return NextResponse.json({ error: error.code }, { status: error.status });
  }
  const currentEventError = currentEventErrorResponse(error);
  if (currentEventError) {
    return NextResponse.json(
      { error: currentEventError.error },
      { status: currentEventError.status },
    );
  }
  return NextResponse.json({ error: "FINANCIAL_OPERATION_FAILED" }, { status: 500 });
}
