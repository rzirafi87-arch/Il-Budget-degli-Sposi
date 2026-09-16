import { BABY_SHOWER_META } from "@/features/events/baby-shower/config";
import { initializeLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return initializeLegacyEventBudget(req, {
    eventKey: "baby-shower",
    defaultCurrency: BABY_SHOWER_META.defaultCurrency,
  });
}
