import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";
import { initializeLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return initializeLegacyEventBudget(req, {
    eventKey: "engagement-party",
    defaultCurrency: ENGAGEMENT_PARTY_META.defaultCurrency,
  });
}
