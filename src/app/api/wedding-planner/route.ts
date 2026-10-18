import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { submitCommunityEntry } from "@/lib/communitySubmission";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const province = searchParams.get("province");

    const db = getServiceClient();

    let query = db
      .from("wedding_planners")
      .select("*")
      .eq("status", "approved")
      .order("name");

    if (region) {
      query = query.eq("region", region);
    }

    if (province) {
      query = query.ilike("province", `%${province}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Wedding planners GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ planners: data || [] });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Wedding planners GET uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return submitCommunityEntry(req, "wedding_planners", ["phone", "email", "website", "description", "price_range", "services"]);
}
