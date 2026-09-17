import { flags } from "@/config/flags";
import { NextResponse } from "next/server";

export const PAYMENTS_FEATURE_DISABLED = {
  error: "FEATURE_DISABLED",
  feature: "payments",
} as const;

/**
 * Server-side, fail-closed boundary for every monetization entry point.
 *
 * Keep this check as the first operation in a protected handler: callers must
 * not read credentials, initialize providers, authenticate, query the database,
 * mutate state, or emit external events while the capability is disabled.
 */
export function requirePaymentsCapability(): NextResponse | null {
  const paymentsStripe: unknown = flags.payments_stripe;

  if (paymentsStripe !== true) {
    return NextResponse.json(PAYMENTS_FEATURE_DISABLED, {
      status: 409,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return null;
}
