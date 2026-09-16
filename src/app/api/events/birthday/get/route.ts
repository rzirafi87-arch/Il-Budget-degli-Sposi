import { getLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

const EVENT_KEY = "birthday";

export async function GET(req: NextRequest) {
  return getLegacyEventBudget(req, EVENT_KEY);
}
