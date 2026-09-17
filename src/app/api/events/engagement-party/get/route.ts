import { getLegacyEventBudget } from "@/lib/legacyEventBudget";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return getLegacyEventBudget(req, "engagement-party");
}
