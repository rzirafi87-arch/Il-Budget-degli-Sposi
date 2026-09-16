import { BIRTHDAY_META } from "@/features/events/birthday/config";
import { initializeLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return initializeLegacyEventBudget(req, {
    eventKey: "birthday",
    defaultCurrency: BIRTHDAY_META.defaultCurrency,
  });
}
