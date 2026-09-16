import { getLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const EVENT_KEY = "baby-shower";

export async function GET(req: NextRequest) {
  return getLegacyEventBudget(req, EVENT_KEY);
}
