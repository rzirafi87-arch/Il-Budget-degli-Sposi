import { ApiSecurityError, apiSecurityErrorResponse, requireSession } from "@/lib/apiSecurity";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export type LegacyEventBudgetKey = "baby-shower" | "birthday" | "engagement-party";

const BUDGET_COLUMNS = "id,user_id,event_key,currency,lines,created_at,updated_at";

type LegacyBudgetOptions = {
  eventKey: LegacyEventBudgetKey;
  defaultCurrency: string;
};

function parseCurrency(value: unknown, fallback: string): string {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string" || value.length > 8 || !/^[A-Z]{3}$/i.test(value)) {
    throw new ApiSecurityError("INVALID_CURRENCY", 400);
  }
  return value.toUpperCase();
}

export async function getLegacyEventBudget(req: NextRequest, eventKey: LegacyEventBudgetKey) {
  try {
    const { userId } = await requireSession(req);
    const { data, error } = await getSupabaseAdmin()
      .from("budgets")
      .select(BUDGET_COLUMNS)
      .eq("user_id", userId)
      .eq("event_key", eventKey)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    return apiSecurityErrorResponse(error, "LEGACY_BUDGET_READ_FAILED");
  }
}

export async function initializeLegacyEventBudget(req: NextRequest, options: LegacyBudgetOptions) {
  try {
    const { userId } = await requireSession(req);
    const body: unknown = await req.json().catch(() => null);
    const requestedCurrency = body && typeof body === "object" && "currency" in body
      ? (body as { currency?: unknown }).currency
      : undefined;
    const currency = parseCurrency(requestedCurrency, options.defaultCurrency);
    const db = getSupabaseAdmin();

    const { data: existing, error: existingError } = await db
      .from("budgets")
      .select(BUDGET_COLUMNS)
      .eq("user_id", userId)
      .eq("event_key", options.eventKey)
      .maybeSingle();
    if (existingError && existingError.code !== "PGRST116") {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    if (existing) return NextResponse.json({ data: existing });

    const { data, error } = await db
      .from("budgets")
      .upsert(
        { user_id: userId, event_key: options.eventKey, currency, lines: [] },
        { onConflict: "user_id,event_key", ignoreDuplicates: true },
      )
      .select(BUDGET_COLUMNS)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data) return NextResponse.json({ data });

    const { data: concurrent, error: retryError } = await db
      .from("budgets")
      .select(BUDGET_COLUMNS)
      .eq("user_id", userId)
      .eq("event_key", options.eventKey)
      .maybeSingle();
    if (retryError || !concurrent) {
      return NextResponse.json({ error: retryError?.message ?? "BUDGET_INITIALIZATION_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ data: concurrent });
  } catch (error) {
    return apiSecurityErrorResponse(error, "LEGACY_BUDGET_INITIALIZATION_FAILED");
  }
}
